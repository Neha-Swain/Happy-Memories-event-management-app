const mongoose = require('mongoose');
const Rsvp = require('./rsvp');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    category: {type: String, required: [true, 'Category is required']},
    title: {type: String, required: [true, 'Title is required']},
    details: {type: String, required: [true, 'Detail is required'], 
              minLength: [10, 'The detail should have at least 10 characters']},
    host: {type: Schema.Types.ObjectId, ref: 'User'},
    location: {type: String, required: [true, 'Location is required']},
    startDate: {type: String, required: [true, 'Start date is required']},
    endDate: {type: String, required: [true, 'End date is required']},
    image: {type: String, required: [true, 'Image is required']},
},
{timestamps: true}
);

eventSchema.pre('deleteOne', function(next) {
    let id = this.getQuery()['_id'];
    Rsvp.deleteMany({ event: id}).exec();
    next();
});

module.exports = mongoose.model('Event', eventSchema);


