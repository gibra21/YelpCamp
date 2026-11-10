//pass in func, returns new func and executes the function but returns if any errors are caught
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next); 
    }
}