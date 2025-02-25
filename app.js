// require modules
const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const eventRoutes = require('./routes/eventRoutes');
const mainRoutes = require('./routes/mainRoutes');
const userRoutes = require('./routes/userRoutes');

//create app
const app = express();

//configure app
let port = 3001;
let host = 'localhost';
app.set('view engine', 'ejs');

//connect to database
// mongoose.connect('mongodb+srv://nswain:project4@clusterproj4.tzrquhz.mongodb.net/?retryWrites=true&w=majority&appName=ClusterProj4/happymemories', 
//                 {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
mongoose.connect('mongodb://localhost:27017/happymemories', 
                    {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
.then(()=>{
    //start app
    app.listen(port, host, ()=>{
        console.log('Server is running on port', port);
    });
})
.catch(err=>console.log(err.message));

//mount middlewares

app.use(
    session({
        secret: "ajfeirf90aeu9eroejfoefj",
        resave: false,
        saveUninitialized: false,
        //store: new MongoStore({mongoUrl: 'mongodb+srv://nswain:project4@clusterproj4.tzrquhz.mongodb.net/?retryWrites=true&w=majority&appName=ClusterProj4/happymemories'}),
        store: new MongoStore({mongoUrl: 'mongodb://localhost:27017/happymemories'}),
        cookie: {maxAge: 60*60*1000}
        })
);
app.use(flash());
app.use((req, res, next) => {
    //console.log(req.session);
    res.locals.user = req.session.user||null;
    res.locals.firstName = req.session.firstName||null;
    res.locals.lastName = req.session.lastName||null;
    res.locals.errorMessages = req.flash('error');
    res.locals.successMessages = req.flash('success');
    next();
});

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));

//set up routes
app.use('/',mainRoutes);
app.use('/events',eventRoutes);
app.use('/users',userRoutes);

app.use((req, res, next) => {
    let err = new Error('The server cannot locate '+ req.url);
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    if(!err.status){
        err.status = 500;
        err.message = ("Internal Server Error")
    }
    res.status(err.status);
    res.render('error',{error:err});
});