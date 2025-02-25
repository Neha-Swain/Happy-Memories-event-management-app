const Event = require('../models/event');
const Rsvp = require('../models/rsvp');
const { DateTime } = require("luxon");

exports.index = (req, res, next) => {
    let categories = [];
    Event.distinct("category", function(error, results){
        categories = results;
    });
    Event.find()
    .then(events => res.render('./event/index', {events, categories}))
    .catch(err=>next(err));
};

exports.new = (req, res) => {
    res.render('./event/new');
};

exports.create = (req, res, next) => {
    let today = new Date(DateTime.now().toFormat("YYYY-MM-DDTHH:mm:ss"));
    let startdate = new Date(req.body.date);

    if(startdate.getTime() < today.getTime()){
        req.flash('error', 'Selected date must be after today\'s');
        res.redirect('back');
    }
    

    let event = new Event(req.body);//create a new event document
    event.host = req.session.user;
    event.save()//insert the document to the database
    .then(event=> {
        req.flash('success', 'You have successfully created a new event');
        res.redirect('/events');
    })
    .catch(err=>{
        if(err.name === 'ValidationError'){
            req.flash('error', err.message);
            res.redirect('back');
        }else{
            next(err);
        }
    });
};

exports.show = (req, res, next) => {
    let id = req.params.id;
    Event.findById(id).populate('host', 'firstName lastName')
    .then(event=>{
        if(event) {
            // event.date = DateTime.fromSQL(event.date).toFormat('LLLL dd, yyyy');
            event.startTime = DateTime.fromJSDate(event.startTime).toFormat('YYYY-MM-DDTHH:mm:ss');
            event.endTime = DateTime.fromJSDate(event.endTime).toFormat('YYYY-MM-DDTHH:mm:ss');
            Rsvp.countDocuments({ status: 'Yes', event: id })
            .then(rsvpCount=>{
                return res.render('./event/show', {event, rsvpCount});
            })
            .catch(err=>next(err));
        } else {
            let err = new Error('Cannot find an event with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err));
};

exports.edit = (req, res, next) => {
    let id = req.params.id;
    Event.findById(id)
    .then(event=>{
        if(event) {
            return res.render('./event/edit', {event});
        } else {
            let err = new Error('Cannot find an event with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err));
};

exports.update = (req, res, next) => {
    let event = req.body;
    let id = req.params.id;
    Event.findByIdAndUpdate(id, event, {useFindAndModify: false, runValidators: true})
    .then(event=>{
        if(event) {
            req.flash('success', 'Event has been successfully updated');
            res.redirect('/events/'+id);
        } else {
            let err = new Error('Cannot find an event with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=> {
        if(err.name === 'ValidationError'){
            req.flash('error', err.message);
            res.redirect('back');
        }else{
            next(err);
        }
    });
};



exports.rsvp = (req, res, next) => {
    let attendees = req.session.user;
    let id = req.params.id;
    let status = req.body.status;

    Event.findById(id)
    .then(event=>{
        if(event) {
            if(event.host==attendees){
                let err = new Error('Unauthorized access to the resource');
                err.status = 401;
                return next(err);
            }else{
                Rsvp.updateOne({ event: id, attendees: attendees }, 
                    { $set: { event: id, attendees
                        : attendees, status: status }}, 
                    { upsert: true })
                .then(rsvp=>{
                    if(rsvp) {
                        if(rsvp.upserted){
                            req.flash('success', 'Successfully created a RSVP for this event!');
                        }else{
                            req.flash('success', 'Successfully updated a RSVP for this event!');
                        }
                        res.redirect('/users/profile');
                    } else {
                        req.flash('error', 'There is some problem in creating an RSVP for this event');
                        res.redirect('back');
                    }
                })
                .catch(err=> {
                    if(err.name === 'ValidationError'){
                        req.flash('error', err.message);
                        res.redirect('back');
                    }else{
                        next(err);
                    }
                });
            }
        } else {
            let err = new Error('Cannot find an event with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err));
    
};


exports.deleteEventAndRsvps = (req, res, next) => {
    let eventId = req.params.id;

    // First, find the event to ensure it exists before trying to delete RSVPs
    Event.findById(eventId)
        .then(event => {
            if (!event) {
                let err = new Error('Cannot find an event with id ' + eventId);
                err.status = 404;
                return next(err);
            }

            // Event found, proceed to delete RSVPs and the event
            return Promise.all([
                Rsvp.deleteMany({ event: eventId }), // Delete all RSVPs associated with the event
                Event.findByIdAndDelete(eventId)     // Delete the event itself
            ]);
        })
        .then(results => {
            const [rsvpDeleteResult, eventDeleteResult] = results;
            // Optionally, you can use the results to check how many RSVPs were deleted, etc.
            if (eventDeleteResult) {
                req.flash('success', 'Event and all associated RSVPs have been successfully deleted!');
                res.redirect('/events');
            } else {
                // If for some reason the event delete confirmation fails
                let err = new Error('Event could not be deleted');
                err.status = 400;
                return next(err);
            }
        })
        .catch(err => next(err)); // Handle any errors that occur during the process
};

exports.deleteRsvp = (req, res, next) => {
    let id = req.params.id;
    Rsvp.findByIdAndDelete(id, {useFindAndModify: false})
    .then(rsvp =>{
        if(rsvp) {
            req.flash('success', 'RSVP has been sucessfully deleted!');
            res.redirect('/users/profile');
        } else {
            let err = new Error('Cannot find an RSVP with id ' + id);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err=>next(err));
};