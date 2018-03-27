var express = require('express');
var mongoose=require('mongoose');
mongoose.connect('mongodb://localhost:27017/iodine');//
mongoose.connection;
var Schema=mongoose.Schema;
var iodineSchema=new Schema({
    drug: String,
    bottom_line:String,
	Upsides:String,
	Downsides:String,
    how_it_works:String,
	used_for:Object,
    facts:Array,
	side_effects:Array
});
var userData=mongoose.model('iodineData',iodineSchema);
exports.saveData = function (item) { // making saveData acessible by  outside world
       var data=new userData(item);
       data.save();
}