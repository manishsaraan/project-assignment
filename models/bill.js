const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BillsSchema = Schema({
  elec: Number,
  AC: Number,
  ts: String,
});

const Bills = mongoose.model('Bills', BillsSchema);

module.exports = Bills;
