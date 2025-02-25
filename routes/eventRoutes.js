const express = require('express');
const router = express.Router();
const controller = require('../controllers/eventController');
const { isLoggedIn, isHost } = require('../middlewares/auth');
const { validateId } = require('../middlewares/validator'); 
const { validateEvent, validateResult } = require('../middlewares/validator');



//GET /events: send all events to the user
router.get('/', controller.index);

//GET /events/new: send html form for creating a new event
router.get('/new', isLoggedIn, controller.new);

//POST /events: create a new event
router.post('/', isLoggedIn, validateEvent, validateResult, controller.create);

//GET /events/:id: send details of event identified by id
router.get('/:id', validateId, controller.show);

//GET /events/:id: send html form for editing an existing event
router.get('/:id/edit', validateId, isLoggedIn, isHost, controller.edit);

//PUT /events/:id: update the event identified by id
router.put('/:id', validateId, isLoggedIn, isHost, validateEvent, validateResult, controller.update);

//DELETE /events/:id: delete the event identified by id
router.delete('/:id', validateId, isLoggedIn, isHost, controller.deleteEventAndRsvps);

//POST /events/:id/rsvp: user response to rsvp
router.post('/:id/rsvp', validateId, isLoggedIn, controller.rsvp);

//DELETE /events/rsvp/:id: delete the rsvp identified by id
router.delete('/rsvp/:id', validateId, isLoggedIn, controller.deleteRsvp);

module.exports=router;  