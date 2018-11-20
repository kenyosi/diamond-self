/*
 * User pointer
 * @self, Akashic content
 */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration
var conf                       = require('../content_config');
var que_length                 = 5   * g.game.fps;
var start_in_hurry             = 0.1 * g.game.fps;
var timeout_delta_frame        = 3   * g.game.fps;
var drpf                       = 7; // delta radius per frame for creating animation in que
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
var player                     = require('./player');
var wm                         = require('./window_manager');
var process                    = require('./process');
var scene;
// var player_multi_touch = [];
var player_pointer = [];
var initial_pointer_id = [];
var pointers_pressed = [];

var ii = 0;
while (ii < conf.players.max_players) {
	// player_multi_touch[ii] = [];
	player_pointer[ii] = [];
	initial_pointer_id[ii] = 0;
	pointers_pressed[ii] = new process.semaphore(0);
	ii++;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports.initial_pointer_id = initial_pointer_id;
module.exports.pointers_pressed = pointers_pressed;

// var user = function(player_index, multi_touch_index, style) {
var user = function(player_index, pointer_index, style) {
	this.player_index = player_index;
	// this.multi_touch_index = (multi_touch_index === undefined ? 1 : multi_touch_index);
	this.pointer_index = (pointer_index === undefined ? 1 : pointer_index);
	var buffer = {current: que_length - 1, latest: que_length - 1, que: []};
	this.buffer = buffer;
	this.buffer.que[this.buffer.latest]	= {xy: {x: style.x, y: style.y}, time: g.game.age};
	var pointer = new g.E({
		scene: scene,
		x: style.x,
		y: style.y,
		width: style.width,
		height: style.height,
		scaleX: 1,
		scaleY: 1,
		touchable: false,
		hidden: false,
		tag: {
			type: 'absolute',
			last_ev: undefined,
			player_index: player_index,
			// multi_touch_index: (multi_touch_index === undefined ? 1 : multi_touch_index),
			pointer_index: pointer_index,
			last_timestamp: g.game.age,
			pointer_pressed: false,
		},
	});
	this.pointer = pointer;
	this.arrow = new g.Sprite({
		scene: scene,
		src: scene.assets.window_manager_icons,
		x: 0,
		y: -style.arrow.height,
		width: style.arrow.width,
		height: style.arrow.height,
		angle: 0,
		srcX: style.arrow.srcX,
		srcY: style.arrow.srcY,
		srcHeight: style.arrow.width,
		srcWidth: style.arrow.height,
		touchable: false,
	});
	this.pointer.append(this.arrow);
	this.name = new g.Label({
		scene: scene,
		font: conf.default_font,
		text: style.text,
		fontSize: style.fontSize,
		textColor:  style.textColor,
		x: style.arrow.width,
		y: -style.arrow.height,
		touchable: false,
	});
	var b = this.name.calculateBoundingRect();
	var name_height = b.bottom - b.top;
	var name_width  = b.right - b.left;
	this.name.y -= name_height;
	this.name_background = new g.FilledRect({
		scene: scene,
		cssColor: conf.window_icon.pointer.background.off.cssColor,
		opacity: conf.window_icon.pointer.background.off.opacity,
		width: name_width,
		height: name_height - 3,
		x: this.name.x,
		y: this.name.y + 4,
		touchable: false,
		local: true,
	});
	this.pointer.append(this.name_background);
	this.pointer.append(this.name);
	// player_multi_touch[player_index][this.multi_touch_index] = this;
	player_pointer[player_index][this.pointer_index] = this;

	var pointer_move = new g.E({
		scene: scene,
		x: style.x,
		y: style.y,
		width: style.width,
		height: style.height,
		scaleX: 1,
		scaleY: 1,
		touchable: false,
		hidden: true,
	});
	var arrow_move = new g.Sprite({
		scene: scene,
		src: scene.assets.window_manager_icons,
		x: 0,
		y: -style.arrow.height,
		width: style.arrow.width,
		height: style.arrow.height,
		angle: 0,
		srcX: style.arrow.srcX,
		srcY: style.arrow.srcY,
		srcHeight: style.arrow.width,
		srcWidth: style.arrow.height,
		touchable: false,
	});
	pointer_move.append(arrow_move);
	var name_move = new g.Label({
		scene: scene,
		font: conf.default_font,
		text: style.text,
		fontSize: style.fontSize,
		textColor:  style.textColor,
		x: style.arrow.width,
		y: -style.arrow.height,
		touchable: false,
	});
	b = name_move.calculateBoundingRect();
	name_height = b.bottom - b.top;
	name_width  = b.right - b.left;
	name_move.y -= name_height;
	var name_background_move = new g.FilledRect({
		scene: scene,
		cssColor: conf.window_icon.pointer.background.off.cssColor,
		opacity: conf.window_icon.pointer.background.off.opacity,
		width: name_width,
		height: name_height - 3,
		x: this.name.x,
		y: this.name.y + 4,
		touchable: false,
		local: true,
	});
	pointer_move.append(name_background_move);
	pointer_move.append(name_move);

	scene.append(pointer_move);
	scene.append(this.pointer);

	this.pointer.update.add(function() {
		// if (pointer.tag.pointer_pressed) {
		// 	if ((pointer.tag.last_timestamp + g.game.age) % g.game.fps == 0) {
		// 		if(pointer.tag.last_timestamp + timeout_delta_frame < g.game.age) {
		// 			var player_index = pointer.tag.player_index;
		// 			update_by_operation('off', player_index, undefined);
		// 			// var touch_index = pointer.tag.multi_touch_index;
		// 			var pointer_index = pointer.tag.pointer_index;
		// 			// var user = player_multi_touch[player_index][pointer_index];
		// 			var user = player_pointer[player_index][pointer_index];
		// 			// unpressed process
		// 			user.pointer.tag.pointer_pressed = false;
		// 			pointers_pressed[player_index].wait();
		// 			if (pointer_index != initial_pointer_id[player_index]) user.pointer.hide();
		// 		}
		// 	}
		// }
		if (!pointer.tag.pointer_pressed) return;
		if ((pointer.tag.last_timestamp + g.game.age) % g.game.fps != 0) return;
		if (pointer.tag.last_timestamp + timeout_delta_frame >= g.game.age) return;
		var player_index = pointer.tag.player_index;
		update_by_operation('off', player_index, undefined);
		var pointer_index = pointer.tag.pointer_index;
		var user = player_pointer[player_index][pointer_index];
		user.pointer.tag.pointer_pressed = false;
		pointers_pressed[player_index].wait();
		if (pointer_index != initial_pointer_id[player_index]) user.pointer.hide();
	});
	this.pointer.update.add(function() {
		if (buffer.current == buffer.latest) {
			pointer_move.hide();
			return;
		}
		pointer_move.show();
		var a = buffer.latest - buffer.current;
		a = (a < 0 ? a + que_length : a);
		a = (a > start_in_hurry ? 3 : 1);
		buffer.current = (buffer.current + a) % que_length;
		var p = buffer.que[buffer.current].xy;
		pointer_move.moveTo(p.x, p.y);
		pointer_move.modified();
	});
};
module.exports.user = user;

function update_by_operation (status, player_index, player_id) {
	status = (status === undefined ? 'on' : status);
	player_index = (player_index === undefined ? 0 : player_index);
	player_index = (player_id === undefined ? player_index : player.find_index(player_id));
	if (player_index === false) return false;
	status = (g.game.player.id == player.current[player_index].id ? 'operation_' + status : status);
	wm.draw_modified(
		// player_multi_touch[player_index][initial_pointer_id[player_index]].name_background,
		player_pointer[player_index][initial_pointer_id[player_index]].name_background,
		conf.window_icon.pointer.background[status]);
	return player_index;
}
module.exports.update_by_operation = update_by_operation;

function get_absolute_position(ev) {
	if (ev.target === undefined)    return {x: ev.point.x, y: ev.point.y};
	if (ev.target.parent === scene) return {x: ev.point.x + ev.target.x, y: ev.point.y + ev.target.y};
	return {
		x: ev.point.x + ev.target.x + ev.target.parent.x,
		y: ev.point.y + ev.target.y + ev.target.parent.y
	};
}

function set_name_background(ops, player_index) {
	wm.draw_modified( // direct update is required, not called update_by_operation('off', player_index, undefined);
		// player_multi_touch[player_index][initial_pointer_id[player_index]].name_background,
		player_pointer[player_index][initial_pointer_id[player_index]].name_background,
		conf.window_icon.pointer.background['off']);
}
module.exports.set_name_background = set_name_background;

function initial_pressed(player_index, ev) {
	pointers_pressed[player_index].signal();
	var xy = get_absolute_position(ev);
	// var pointer_index = (ev.pointerId > conf.window.max_multi_touch ? -1 : ev.pointerId);
	var pointer_index = (ev.pointerId > conf.window.max_pointers ? -1 : ev.pointerId);
	// var user = player_multi_touch[player_index][touch_index];
	var user = player_pointer[player_index][pointer_index];
	if (pointers_pressed[player_index].get_value() == 1){
		set_name_background('off', player_index); // direct update is required, not called update_by_operation('off', player_index, undefined);
		// player_multi_touch[player_index][initial_pointer_id[player_index]].pointer.hide();
		player_pointer[player_index][initial_pointer_id[player_index]].pointer.hide();
		initial_pointer_id[player_index] = pointer_index;
		update_by_operation('on', player_index, undefined);
		quing_moveTo(xy, user);
	}
	user.pointer.moveTo(xy.x, xy.y);
	user.pointer.show();
	user.pointer.modified();
}

function set_last_status(pointer_pressed, player_index, ev, group) {
	group.tag.last_ev = {
		point: {
			x: group.x + (ev.prevDelta === undefined ? 0 : ev.prevDelta.x),
			y: group.y + (ev.prevDelta === undefined ? 0 : ev.prevDelta.y),
		},
		// x: group.x,
		// y: group.y,
		pointerId: ev.pointerId,
		startDelta: {//require optimization
			x: (ev.startDelta === undefined ? 0 : ev.startDelta.x),
			y: (ev.startDelta === undefined ? 0 : ev.startDelta.y)
		},
	};
	group.tag.last_timestamp = g.game.age;
	group.tag.pointer_pressed = pointer_pressed;
}

function set_scene(sc) {
	scene = sc;
	scene.pointDownCapture.add(function (ev) {
		if (!player.validate(ev.player)) return;
		var player_index = player.find_index(ev.player.id);
		// var touch_index = (ev.pointerId > conf.window.max_multi_touch ? -1 : ev.pointerId);
		var pointer_index = (ev.pointerId > conf.window.max_pointers ? -1 : ev.pointerId);
		// if (touch_index == -1) return;
		if (pointer_index == -1) return;
		// var user = player_multi_touch[player_index][touch_index];
		var user = player_pointer[player_index][pointer_index];
		set_last_status(true, player_index, ev, user.pointer);// required here
		initial_pressed(player_index, ev);
	});
	scene.pointMoveCapture.add(function (ev) {
		if (!player.validate(ev.player)) return;
		// var touch_index = (ev.pointerId > conf.window.max_multi_touch ? -1 : ev.pointerId);
		var pointer_index = (ev.pointerId > conf.window.max_pointers ? -1 : ev.pointerId);
		// if (touch_index == -1) return;
		if (pointer_index == -1) return;
		var player_index = player.find_index(ev.player.id);
		// var user = player_multi_touch[player_index][touch_index];
		var user = player_pointer[player_index][pointer_index];
		if(!user.pointer.tag.pointer_pressed) {// resuming process
			set_last_status(true, player_index, ev, user.pointer);// required here
			initial_pressed(player_index, user.pointer.tag.last_ev);
			return;
		}
		set_last_status(true, player_index, ev, user.pointer);
		user.pointer.moveBy(ev.prevDelta.x, ev.prevDelta.y);
		user.pointer.modified();
		quing_fast_moveBy(ev.prevDelta, user);
		// if (!wm.view.floating) return;
		// wm.move_view(ev.prevDelta.x, ev.prevDelta.y);
	});
	scene.pointUpCapture.add(function (ev) {
		// pointUP is an optional event under the unstable remote env.
		// We should define an auto-pointUp event in this.pointer.update.add (not here). Ken Y.
		if (!player.validate(ev.player)) return;
		var player_index = update_by_operation('off', undefined, ev.player.id);
		// var touch_index = (ev.pointerId > conf.window.max_multi_touch ? -1 : ev.pointerId);
		var pointer_index = (ev.pointerId > conf.window.max_pointers ? -1 : ev.pointerId);
		// if (touch_index == -1) return;
		if (pointer_index == -1) return;
		// var user = player_multi_touch[player_index][touch_index];
		var user = player_pointer[player_index][pointer_index];
		if(!user.pointer.tag.pointer_pressed) return; // check if pointer is already unpressed.
		// unpressed process
		user.pointer.tag.pointer_pressed = false;
		pointers_pressed[player_index].wait();
		// if (touch_index != initial_pointer_id[player_index]) user.pointer.hide();
		if (pointer_index != initial_pointer_id[player_index]) user.pointer.hide();
	});
}
module.exports.set_scene = set_scene;

function quing_moveTo(xy, user) {
	var xy0 = user.buffer.que[user.buffer.latest].xy;
	quing_moveBy({x: xy.x - xy0.x, y: xy.y - xy0.y}, user);
}

function quing_moveBy(xy, user) {
	var current_time = g.game.age;
	var dx = xy.x;
	var dy = xy.y;
	var dr      = Math.sqrt(dx * dx + dy * dy);
	var n_steps = Math.ceil(dr / drpf);
	var dxpf    = dx / n_steps;
	var dypf    = dy / n_steps;
	var step = 0;
	var xy0 = user.buffer.que[user.buffer.latest].xy;
	var x = xy0.x;
	var y = xy0.y;
	while (step < n_steps) {
		user.buffer.latest = (user.buffer.latest + 1) % que_length;
		x += dxpf;
		y += dypf;
		user.buffer.que[user.buffer.latest] = {xy: {x: x, y: y}, time: current_time};
		++step;
	}
}
function quing_fast_moveBy(xy, user) {
	var current_time = g.game.age;
	var xy0 = user.buffer.que[user.buffer.latest].xy;
	if (user.buffer.current == user.buffer.latest) {
		user.buffer.latest = (user.buffer.latest + 1) % que_length;
		user.buffer.current = user.buffer.latest;
	}
	else {
		user.buffer.latest = (user.buffer.latest + 1) % que_length;
	}
	user.buffer.que[user.buffer.latest] = {xy: {x: xy0.x + xy.x, y: xy0.y + xy.y}, time: current_time};
}
