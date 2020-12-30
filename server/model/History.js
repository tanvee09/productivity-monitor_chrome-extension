const mongoose = require('mongoose');

const HistorySchema = mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  timespent: {
    type: Map,
    of: Number,
    required: true
  }
});

const History = mongoose.model("History", HistorySchema);
module.exports = History;

// var mongoose = require('mongoose');
// var schema = mongoose.Schema({
//     path : {type:string , required:true},
//     title: {type:string , required: true}
// })
// module.export = mongoose.model('game', schema);