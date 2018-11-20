/*
 * Piece in board
 * diamond@self, Akashic content
 */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration
var conf                       = require('./content_config');
// var board_cell_half_size       = {x: conf.board.cell.size.x / 2, y: conf.board.cell.size.y / 2};
var n_disks0                   = conf.piece.n - 1;
var timeout_delta_frame        = 3 * g.game.fps;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
var scene;
// var commenting                 = require('commenting');
var process                    = require('./self/process');
var player                     = require('./self/player');
var pointer                    = require('./self/pointer');
var wm                         = require('./self/window_manager');
var disk_id                    = [];
var index                      = [];
var last                       = [];
// var pile_areas                 = [];
// var pile_areas_length;
var status                     = {}; //for revierging disk detection
// var camera_position_pointDown;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports.index           = index;
module.exports.last            = last;
module.exports.disk_id         = disk_id;
module.exports.status          = status;

function set_scene(sc) { scene = sc;}
module.exports.set_scene = set_scene;

// function set_pile_areas(p) {
// 	// pile_areas = p;
// 	// pile_areas_length = p.length;
// }
// module.exports.set_pile_areas = set_pile_areas;

var boundary = function (object) {
	this.width = object.width;
	this.height = object.height;
	this.x0 = 0;
	this.x1 = g.game.width - 2 * this.width; // <---
	this.y0 = 0;
	this.y1 = g.game.height - this.height;
};
boundary.prototype.set_start = function (xy) {
	this.start = {x: xy.x, y: xy.y};
};
boundary.prototype.force = function (ev, xy) {
	var x = this.start.x + ev.startDelta.x;
	x = (x <= this.x0 ? this.x0 : x);
	x = (x >= this.x1 ? this.x1 : x);
	xy.x = x;
	var y = this.start.y + ev.startDelta.y;
	y = (y <= this.y0 ? this.y0 : y);
	y = (y >= this.y1 ? this.y1 : y);
	xy.y = y;
	return xy;
};

function create(details) {
	var group = new g.E({
		scene: scene,
		x: details.x,
		y: details.y,
		width: details.width,
		height: details.height,
		scaleX: 1,
		scaleY: 1,
		touchable: true,
		tag: {
			type: 'piece',
			bw: details.bw,
			pointer_pressed: 0,
			last: [],
			initial: {
				index: details.initial.index,
				piece: details.initial.piece,
				x: details.x,
				y: details.y,
			},
		},
	});
	var ii = 0;
	while (ii < conf.players.max_players) {
		group.tag.last[ii] = {
			ev: undefined,
			timestamp: g.game.age,
			pointer_pressed: 0,
		};
		ii++;
	}
	group.append(
		new g.FilledRect({
			scene: scene,
			cssColor: conf.piece.unselect.background.cssColor,
			opacity: conf.piece.unselect.background.opacity,
			width: details.width,
			height: details.height,
		}));
	group.append(new g.Sprite(details.piece));
	group.update.add(function() {
		if (group.tag.pointer_pressed > 0) {
			ii = 0;
			while (ii < conf.players.max_players) {
				if ((group.tag.last[ii].timestamp + g.game.age) % g.game.fps == 0) {
					if(group.tag.last[ii].timestamp + timeout_delta_frame < g.game.age) {
						var ev = group.tag.last[ii].ev;
						place(ev, group, ii);
					}
				}
				ii++;
			}
		}
	});
	group.pointDown.add(function (ev) {
		if ((wm.admin.control && player.get_group(ev.player.id) != 'admin')) return;
		if (!wm.semaphoe.status()) return;
		if (!player.validate_join(ev.player, 0)) return;
		if (!status[group.id].events.process.status()) return;
		var player_index = player.find_index(ev.player.id);
		if (!wm.player_operations[player_index].wait()) return;
		// status[group.id].pointdown.in_board[player_index]  = get_address_in_board(group).validate;
		status[group.id].pointdown.boundary[player_index].set_start(group);
		set_last_status(1, player_index, ev, group);// required
		set_initial_pressed(player_index, group);
	});
	group.pointMove.add(function (ev) {
		if ((wm.admin.control && player.get_group(ev.player.id) != 'admin')) return;
		if (!wm.semaphoe.status()) return;
		if (!player.validate_join(ev.player, 0)) return;
		if (!status[group.id].events.process.status()) return;
		var player_index = player.find_index(ev.player.id);
		//resume process
		if (!status[group.id].pointdown.processed[player_index].status()) { 
			if (!wm.player_operations[player_index].wait()) return;
			set_last_status(1, player_index, ev, group);// required
			set_initial_pressed(player_index, group);
			return;
		}
		if (!status[group.id].pointdown.processed[player_index].status()) return;
		if (!status[group.id].events.process.status()) return;
		set_last_status(0, player_index, ev, group);
		// force place disk if rapid movement. Check if this is required carefully.
		// var dxy = ev.prevDelta.x * ev.prevDelta.x + ev.prevDelta.y * ev.prevDelta.y
		// if (dxy > conf.window.max_prevDelta || true) {
		// place(ev, group);
		// return
		// }
		if (!wm.view.floating) {
			// group = status[group.id].pointdown.boundary[player_index].force(ev, group);
			var xy = {x: 0, y: 0};
			ii = 0;
			while (ii < conf.players.max_players) {
				if (status[group.id].pointdown.processed[ii].status()) {
					var pxy = {x: 0, y: 0};
					pxy = status[group.id].pointdown.boundary[ii].force(group.tag.last[ii].ev, pxy);
					xy.x += pxy.x;
					xy.y += pxy.y;
				}
				ii++;
			}
			group.x = xy.x / group.tag.pointer_pressed;
			group.y = xy.y / group.tag.pointer_pressed;
		}
		else {
			group.x -= ev.prevDelta.x;
			group.y -= ev.prevDelta.y;
		}
		group.modified();
	});
	group.pointUp.add(function (ev) {
		if (!player.validate(ev.player, 0)) return;
		var player_index = player.find_index(ev.player.id);
		if ((wm.admin.control && player.get_group(ev.player.id) != 'admin')) return;
		if (!wm.semaphoe.status()) return;
		if (!status[group.id].events.process.status()) return;
		if (group.tag.pointer_pressed <=0) return;
		place(ev, group, player_index);
	});
	scene.append(group);
	disk_id.push(group.id);
	index.push(scene.children.length - 1);
	status[group.id] = {
		pointdown: {
			in_process: new process.semaphore(1),
			processed: [],
			in_board:  [],
			timestamp: [],
			boundary: [],
			last_timestamp: [],
			pointer_pressed: [],
		},
		events: {
			process: new process.semaphore(1),
		}
	};
	ii = 0;
	while (ii < conf.players.max_players) {
		status[group.id].pointdown.processed[ii] = new process.semaphore(0);
		// status[group.id].pointdown.in_board[ii] = get_address_in_board(group).validate;
		status[group.id].pointdown.timestamp[ii] = g.game.age;
		status[group.id].pointdown.boundary[ii] = new boundary(conf.const.unit);
		status[group.id].pointdown.last_timestamp[ii] = g.game.age;
		status[group.id].pointdown.pointer_pressed[ii] = false;
		ii++;
	}
	return group;
}
module.exports.create = create;

function set_last_status(counter_pressed, player_index, ev, group) {
	group.tag.pointer_pressed 					 += counter_pressed;
	group.tag.last[player_index].pointer_pressed += counter_pressed;
	group.tag.last[player_index].timestamp        = g.game.age;
	var startDeltaStable;
	if (ev.startDelta !== undefined) startDeltaStable = {x: ev.startDelta.x, y: ev.startDelta.y};
	else 							 startDeltaStable = {x: 0, y: 0};
	group.tag.last[player_index].ev = {
		x: group.x,
		y: group.y,
		pointerId: ev.pointerId,
		startDelta: startDeltaStable,
	};
}
function set_initial_pressed(player_index, group) {
	++player.current[player_index].player_plate;
	to_top(group.id, scene.children);
	// camera_position_pointDown = wm.view.position;
	// var pi = 0;
	// while(pi < pile_areas_length) {
	// 	pile_areas[pi].get_disk(group, status[group.id]);
	// 	++pi;
	// }
	status[group.id].pointdown.processed[player_index].signal();
	status[group.id].pointdown.timestamp[player_index] = g.game.age;
	if (status[group.id].pointdown.in_board[player_index]) return;
	wm.draw_modified(last[player_index].children[0], conf.piece.unselect.background);
	wm.draw_modified(group.children[0], conf.players.item.operating[player_index]); // <---
	last[player_index] = group;
}

function place(ev, group, player_index) {
	if (!status[group.id].pointdown.processed[player_index].wait()) return;
	if (!wm.player_operations[player_index].signal()) return;
	--player.current[player_index].player_plate;
	if (group.tag.last[player_index].pointer_pressed <= 0) return;
	group.tag.last[player_index].pointer_pressed--;
	group.tag.pointer_pressed--;
	if (group.tag.pointer_pressed > 0) return;
	// var xy = get_address_in_board(group);
	// var pointUp_time = g.game.age;
	// var dx = ev.startDelta.x + camera_position_pointDown.x - wm.view.position.x;
	// var dy = ev.startDelta.y + camera_position_pointDown.y - wm.view.position.y;
	// if (Math.abs(dx) < conf.players.cell.state.size.x
	// 	&& Math.abs(dy) < conf.players.cell.state.size.y
	// 	&& (pointUp_time - status[group.id].pointdown.timestamp[player_index] <= conf.players.cell.state.time)) {
	// 	if (!status[group.id].events.process.wait()) return;
	// 	reverse(group);
	// 	return;
	// }
	// if (xy.validate) {
	if (!status[group.id].pointdown.in_board[player_index]){
		if (ev.pointerId === pointer.initial_pointer_id[player_index]) {
			wm.draw_modified(group.children[0], conf.players.item.waiting[player_index]);
			last[player_index] = group; // required set here again
		}
		else {
			wm.draw_modified(group.children[0], conf.piece.unselect.background);
		}
		// var bw_flag = (group.children[1].srcX == 0 ? '黒' :'白');
		// var message_here = conf.board.an.x[xy.x] + conf.board.an.y[xy.y] + 'に' + bw_flag + 'をおく@P' + wm.index_pp[player_index];
		// commenting.post(message_here);
	}
	// }
	// else {
	// 	if (!status[group.id].events.process.wait()) return;
	// 	wm.draw_modified(group.children[0], conf.disk.unselect.background);
	// 	set_piles(group, status[group.id]);
	// 	status[group.id].events.process.signal();
	// 	return;
	// }
}
// function reverse(group) {
// 	group.tag.bw = (group.tag.bw + 1) % 2;
// 	var ai = 0;
// 	var length_animation = conf.disk.bw[group.tag.bw].transit.length;
// 	var intervalId = scene.setInterval(function () {
// 		wm.draw_modified(group.children[1], conf.disk.bw[group.tag.bw].transit[ai]);
// 		++ai;
// 		if (ai >= length_animation) {
// 			scene.clearInterval(intervalId);
// 			scene.setTimeout(function () {
// 				wm.draw_modified(group.children[1], conf.disk.bw[group.tag.bw].on_board);
// 				wm.draw_modified(group.children[0], conf.disk.unselect.background);
// 				set_piles(group, status[group.id]);
// 				status[group.id].events.process.signal();
// 				return;
// 			},  conf.disk.bw[group.tag.bw].transit_time);
// 		}
// 	}, conf.disk.bw[group.tag.bw].transit_time);
// 	// var message_here = (group.tag.bw == 0 ? '黒' :'白') + 'に@P' + wm.index_pp[player_index];
// 	// if (xy.validate) message_here = conf.board.an.x[xy.x] + conf.board.an.y[xy.y] + 'を' + message_here;
// 	// commenting.post(message_here);
// }

function to_top(id, disks) {
	var this_disk_id_index = disk_id.indexOf(id);
	var this_index = index[this_disk_id_index];

	var b = disks[this_index];
	disks.splice(this_index, 1);
	disks.splice(index[n_disks0], 0, b);

	var c = disk_id[this_disk_id_index];
	disk_id.splice(this_disk_id_index, 1);
	disk_id.splice(n_disks0, 0, c);
}
module.exports.to_top = to_top;

// function get_address_in_board(d) {
// 	var address = {};
// 	var x = d.x - conf.board.location.x0 - wm.view.position.x;
// 	var y = d.y - conf.board.location.y0 - wm.view.position.y;
// 	address.x = parseInt(x / (conf.board.cell.size.x * wm.view.zoom) + 0.5);
// 	address.y = parseInt(y / (conf.board.cell.size.y * wm.view.zoom) + 0.5);
// 	address.validate = (
// 		x >= - board_cell_half_size.x && y >= - board_cell_half_size.y
// 		&& address.x >= 0 && address.x < conf.board.size.x
// 		&& address.y >= 0 && address.y < conf.board.size.y
// 	);
// 	return address;
// }
// module.exports.get_address_in_board = get_address_in_board;

// function set_piles(d) {
// 	var re = -1;
// 	var zf = (wm.view.zooming ? 0.5 : 1);
// 	var ops = [
// 		[1, 0, - (d.width - 1) * zf],
// 		// [0, 1, + (d.width + 1) * zf],
// 		[0, 1, - 2*(d.width + 1) * zf],
// 		[3, 2, - (d.width - 1) * zf],
// 		// [2, 3, + (d.width + 1) * zf],
// 		[2, 3, - 2*(d.width + 1) * zf],
// 	];
// 	while (re == -1){
// 		var pi = 0;
// 		while(pi < pile_areas_length) {
// 			re = pile_areas[pi].set_disk(d);
// 			if (re == 1) {
// 				return;
// 			}
// 			else if (re == -1) {
// 				d.x = pile_areas[ops[pi][0]].area.x;
// 				re = pile_areas[ops[pi][0]].set_disk(d);
// 				if (re == -1) {
// 					d.x = pile_areas[ops[pi][1]].area.x + ops[pi][2];
// 				}
// 				return;
// 			}
// 			++pi;
// 		}
// 	}
// }
// function move(xy, d, transit_time = 20, s = [1.0,   1.5,   2.0,   2.5,   3.0,   2.5,   2.0,   1.5,   1.25,  1.0]) {
// 	var d0 = {'x': d.x, 'y': d.y};
// 	var x_index = d.tag.bw;
// 	var dp = conf.disk.bw[x_index]['transit'];
// 	var angle_here = g.game.random.get(0, 359);
// 	var dpa = [dp[0], dp[1], dp[2], dp[3], dp[4], dp[4], dp[3], dp[2], dp[1], dp[0]];
// 	var sf =  s; //[1.0,   1.5,   2.0,   2.5,   3.0,   2.5,   2.0,   1.5,   1.25,  1.0]
// 	var ii = 0;
// 	var length_animation = dpa.length;
// 	var rot = scene.setInterval(function () {
// 		var dpp = dpa[ii];
// 		var r0  = (ii + 1) / length_animation;
// 		var r1  = 1.0 - r0;
// 		dpp.angle = angle_here * r0 + conf.disk.bw[x_index].on_board.angle * r1;
// 		wm.draw_modified(d.children[1], dpp);
// 		var dp  = {x: xy.x * r0 + d0.x * r1, y: xy.y * r0 + d0.y * r1, scaleX: sf[ii] * wm.view.zoom, scaleY: sf[ii] * wm.view.zoom};
// 		wm.draw_modified(d, dp);
// 		++ii;
// 		if (ii >= length_animation) {
// 			scene.clearInterval(rot);
// 				scene.setTimeout(function () {
// 				wm.draw_modified(d.children[1], conf.disk.bw[x_index].on_board);
// 				wm.draw_modified(d.children[0], conf.disk.unselect.background);
// 			}, transit_time);
// 		}
// 	}, transit_time);
// };
// module.exports.move = move;
