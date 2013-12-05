var mongoose = require('mongoose');
var guid = require('guid');
console.log('Init database');
mongoose.connect('mongodb://localhost/parisxx');
var Probleme = mongoose.model('Probleme', { _id: String, date: Date, name: String, type: String, description: String });
console.log('Done');

function insert(date, name, type, description) {
	console.log('Inserting...');

	var probleme = new Probleme({
		_id: guid.raw(), 
		date: date, 
		name: name.substring(0, Math.min(name.length, 64)), 
		type: type, 
		description: description.substring(0, Math.min(description.length, 1024)) });
	probleme.save(function (err) {
	  if (err) {
		console.log(err);
	  }
	});
}

function getStats(today, callback) {
	var oneWeekEarlier = new Date(today);
	oneWeekEarlier.setDate(oneWeekEarlier.getDate() - 7); 

	Probleme.aggregate(      
		{ $match : { date : { $gt : oneWeekEarlier, $lte : today } } },
		{ $group : { 
			_id : { year: { $year : "$date" }, month: { $month : "$date" },day: { $dayOfMonth : "$date" }, type: "$type" }, 
			count : { $sum : 1 }}
        }, 
		{ $group : { 
			_id : { type: "$_id.type", }, 
			dailyusage: { $push: { year: "$_id.year", month: "$_id.month", day: "$_id.day", count: "$count" }}}
        },
		function (err, res) { 
			if (err); // TODO handle error 
			console.log(res);
			console.log('calling callback...');
			callback(err, res);
		});	
}

function getLast(callback) {
	Probleme.find({}).sort({date: -1}).limit(10).exec(callback);
}

exports.insert = insert;
exports.getStats = getStats;
exports.getLast = getLast;
