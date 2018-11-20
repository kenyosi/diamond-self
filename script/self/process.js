/*
 * Process control
 * @self, Akashic content
 */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration
var infinity = 1e64;
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var objects = function(value) {
	var current_time = g.game.age;
	this.switch_operation = {0: 1, 1: 0};
	// this.duration = Infinity;
	this.duration = infinity;
	this.semaphore = {
		v: value,
		timestamp: current_time,
		release: current_time + this.duration,
		duration: this.duration,
		initial_value: value
	};
};
objects.prototype.wait = function() {
	if (this.semaphore.v < 1) return false;
	this.semaphore.v--;
	return true;
};
objects.prototype.signal = function() {
	this.semaphore.v++;
	return (this.semaphore.v > 0 ? true : false);
};
objects.prototype.switch = function() {
	this.semaphore.v =this.switch_operation[this.semaphore.v];
	return this.semaphore.v;
};
objects.prototype.wait_period = function() {
	var current_time = g.game.age;
	if (current_time > this.semaphore.relase) {
		// this.semaphore.k = key;
		this.semaphore.v = this.semaphore.initial_value;
	}
	if (this.semaphoe.v < 1) return false;
	this.semaphore.v--;
	this.semaphore.timestamp = current_time;
	this.semaphore.release = current_time + this.duration;
	return true;
};
objects.prototype.signal_period = function() {
	var current_time = g.game.age;
	if (current_time > this.semaphore.release) this.semaphore.v = 0;
	this.semaphore.timestamp = current_time;
	this.semaphore.release = current_time + this.duration;
	this.semaphore.v++;
	return (this.semaphore.v > 0 ? true : false);
};
objects.prototype.get_value = function() {
	var current_time = g.game.age;
	if (current_time > this.semaphore.relase) return this.semaphore.initial_value;
	return this.semaphore.v;
};

objects.prototype.set_value = function(v) {
	// var current_time = g.game.age;
	// if (current_time > this.semaphore.relase) return false;
	this.semaphore.v = v;
	return true;
};

objects.prototype.status = function() {
	return (this.semaphore.v > 0 ? true : false);
};
module.exports.semaphore = objects;

function get_timestamp() {	return g.game.age / g.game.fps * 1000;}
module.exports.get_timestamp = get_timestamp;
