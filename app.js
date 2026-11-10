const express = require('express'); 
const path = require('path'); 
const app = express(); 
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const Campground = require('./models/campground')
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError')
const {campgroundSchema} = require('./schemas.js')

mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp")
    .then(() => {
    console.log('mongoose connected')
    })
    .catch(() => {
    console.log('error, mongoose not connected')
})


app.engine('ejs', ejsMate); 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

// so when we press submit, we are show json 
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))

const validateCampground = (req, res, next) => {
    
     const { error } = campgroundSchema.validate(req.body);
     if (error) {
       const msg = error.details.map((el) => el.message).join(",");
       throw new ExpressError(msg, 400);
     } else {
         next();
     }
}  

app.get('/', function (req, res) {
    res.render('home')
})

app.get("/campgrounds", catchAsync(async function (req, res) {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}));

app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

// sending it back 
// creating the a new campground 
app.post('/campgrounds', validateCampground, catchAsync(async (req, res) => {
    //if (!req.body.campground) throw new ExpressError('Invalid Campground data', 400);
        const campground = new Campground(req.body.campground)
        await campground.save();
        res.redirect(`/campgrounds/${campground._id}`)
}))

app.get("/campgrounds/:id", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show', {campground});
}));


app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id); 
    res.render('campgrounds/edit', { campground });
}))

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete("/campgrounds/:id", catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
}));

// only runs if nothing has matched first 
app.all('/{*path}', (req, res, next) => {
    next(new ExpressError('Page not found', 404))
})


// error handler, catch all for any error
app.use((err, req, res, next) => {
    const { status = 500 } = err;
    if (!err.message) err.message = 'oh no, something went wrong'
    res.status(status).render('error', {err});

})



app.listen(3000, () => {
    console.log('app is listening on port 3000');
})
