const {body} = require('express-validator');
const{validationResult} = require('express-validator');

//check if the route parameter is valid ObjectId type value
exports.validateId = (req, res, next)=>{
    let id = req.params.id;
    if(id.match(/^[0-9a-fA-F]{24}$/)) {
        return next();
    } else {
        let err = new Error('Invalid event id');
        err.status = 400;
        return next(err);
    }
};
exports.validateSignUp = [
    body('firstName','First name cannot be empty' ).notEmpty().trim().escape(), 
    body('lastName','Last name cannot be empty').notEmpty().trim().escape(),
    body('email','Email must be a valid email address').isEmail().trim().escape().normalizeEmail(),
    body('password', 'Password must be at least 8 characters and at most 64 characters').isLength({min:8, max:64})
];

exports.validateLogIn = [
    body('email','Email must be a valid email address').isEmail().trim().escape().normalizeEmail(),
    body('password', 'Password must be at least 8 characters and at most 64 characters').isLength({min:8, max:64})
];

exports.validateEvent = [
    body('title', 'Title cannot be empty and minimum 3 letters are required').notEmpty().trim().escape().isLength({min:3}),
    body('details', 'Details cannot be empty and minimum 10 letters are required').notEmpty().trim().escape().isLength({min:10}),
    body('location', 'Location cannot be empty').notEmpty().trim().escape(),
    body('startDate', 'Start Date and Time cannot be empty').notEmpty().trim().escape(),
    body('endDate', 'End Date and Time cannot be empty').notEmpty().trim().escape(),
    body('image', 'Image cannot be empty').notEmpty().trim()
];

exports.validateResult = (req, res, next) =>{
    let errors = validationResult(req);
    if (!errors.isEmpty()){
        errors.array().forEach(error=>{
            req.flash ('error', error.msg);
        });
        return res.redirect('back');
    } else {
        return next();
    }
}