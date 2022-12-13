const mongoose = require('mongoose')


module.exports = mongoose.model(
    'short',

    new mongoose.Schema({

        urlCode: {
            type: String,
            unique: true,
            trim: true
        },
        longUrl: {
            type: String,
            required: true,
            trim: true
        },
        shortUrl: {
            type: String,
            unique: true,
            required: true
        }
    })
)

