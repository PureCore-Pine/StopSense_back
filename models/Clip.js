const mongoose = require('mongoose');

const ClipSchema = new mongoose.Schema({
  clip_id: {
    type: String,
    required: true,
    unique: true
  },
  user_id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    maxlength: 25
  },
  video_path: {
    type: String,
    required: true
  },
  upload_date: {
    type: Date,
    default: Date.now
  },
  number_conflict: {
    type: Number,
    default: 0
  },
  width: Number,
  distance: Number,
  point: {
    type: [[Number]], // ✅ Array of Array (2D array)
    validate: {
      validator: function (arr) {
        return arr.length === 4 && arr.every(p => Array.isArray(p) && p.length === 2);
      },
      message: 'Point must have 4 coordinate pairs'
    }
  },
  descripton: String
});

module.exports = mongoose.model('Clip', ClipSchema);
