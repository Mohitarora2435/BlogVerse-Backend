const mongoose = require('mongoose')

const { Schema } = mongoose;

const blogSchema = new Schema({
    title: {
        type: String,
        required: true // 'required' instead of 'isrequired'
    },
    description: {
        type: String,
        required: true // 'required' instead of 'isrequired'
    },
    Date: {
        type: Date,
        default: Date.now // 'type' and 'default' added
    },
    User: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    }
});

module.exports = mongoose.model('Blog', blogSchema);
