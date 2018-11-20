/*
 * Player manager
 * @self, Akashic content
 */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration
var conf                       = require('../content_config');
var status_bar_messages = ['あなたはP1です'];
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
var commenting                 = require('./commenting');
var pointer                    = require('./pointer');
var wm                         = require('./window_manager');
var piece                      = require('../piece');
var current                    = [// intend deep copy, and avoid reference copy
	{
		id: '-9999',
		name: '',
		head: 'P1: 参加中',
		timestamp: conf.const.old_unix_time,
		time_warning: 0,
		player_plate: 0,
		player_plate_status: 0,
		login: false,
		group: 'admin'
	},];
var validate_index = [
	{st: 0, en: conf.players.max_players}, // player 1, player 2, and player 3
	{st: 0, en: 1},                        // player 1 only
	{st: 1, en: 2},                        // player 2 only
	{st: 2, en: 3},                        // player 3 only
];

var ii = 1;
while (ii < conf.players.max_players) {
	var ip = (ii + 1).toString();
	status_bar_messages[ii] = 'あなたはP' + ip + 'です'; // defined and initialized zero before this
	current [ii]            = {id: '-9999', name: '', head: 'Player' + ip + ': 募集します', timestamp: conf.const.old_unix_time, time_warning: 0, player_plate: 0, player_plate_status: 0, login: false, group: 'user'},
	validate_index[ii + 1]  = {st: ii - 1, en: ii};
	ii++;
}

var caster ={join_event: false};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function pass_through() {}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports.caster         = caster;
module.exports.current        = current;

function init() {
	g.game.join.add(function (ev) {
		var player_index = 0;
		try {
			if (!caster.join_event) {
				caster.join_event = true;
				if (ev.player === undefined) return;
				if (ev.player.id === undefined) return;
				current[player_index] = new_propoeties(ev.player, player_index, g.game.age);
			}
		}
		catch(e) {
			pass_through(e);
		}

	});
}module.exports.init = init;

// function set_scene(sc) { scene = sc;}
// module.exports.set_scene = set_scene;

function validate_group(player, ci) {
	if (player.id === undefined) return false;
	ci = (ci === undefined ? 0 : ci);
	var ii = validate_index[ci].st;
	while (ii < validate_index[ci].en) {
		if (current[ii]['id'] == player.id) {
			var current_time = g.game.age;
			if (current_time - current[ii].timestamp <=  conf.players.time.life) {
				current[ii].timestamp = current_time;
				current[ii].time_warning = 0;
				return current[ii].group;
			}
		}
		ii++;
	}
	return false;
}
module.exports.validate_group = validate_group;

// Expensive part, should carefuley code this function, Ken Y.
function validate_group_join(player, ci) {
	if (player.id === undefined) return false;
	ci = (ci === undefined ? 0 : ci);
	var current_time = g.game.age;
	var f = [];
	var ii = validate_index[ci].st;
	while (ii < validate_index[ci].en) {
		f[ii] = (current_time - current[ii].timestamp <=  conf.players.time.life || current[ii].group == 'admin');
		if (current[ii].id == player.id) { // validate an existing player
			if (f[ii]) {
				current[ii].timestamp = current_time;
				current[ii].time_warning = 0;
				return current[ii].group;
			}
		}
		ii++;
	}
	ii = validate_index[ci].st;
	while (ii < validate_index[ci].en) {
		if (!f[ii]) { // joined a new player
			current[ii] = new_propoeties(player, ii, current_time);
			// commenting.post('Player' + wm.index_pp[ii] + 'は' + current[ii].name.substr(0, 2) + 'さんです');
			commenting.post('P' + wm.index_pp[ii] + 'が着席しました');
			pointer.update_by_operation('on', ii, undefined);
			wm.update_common_style('on', conf.window_icon.login, wm.login_controls[ii]);
			wm.status_bottom.set_message(status_bar_messages[ii], ii);
			return true;
		}
		ii++;
	}
	return false;
}
module.exports.validate_group_join = validate_group_join;

// Expensive part, should carefuley code this function, Ken Y.
function validate(player, ci) {
	if (player.id === undefined) return false;
	ci = (ci === undefined ? 0 : ci);
	var ii = validate_index[ci].st;
	while (ii < validate_index[ci].en) {
		if (current[ii]['id'] == player.id) {
			var current_time = g.game.age;
			if (current_time - current[ii].timestamp <=  conf.players.time.life) {
				current[ii].timestamp = current_time;
				current[ii].time_warning = 0;
				return true;
			}
		}
		ii++;
	}
	return false;
}
module.exports.validate = validate;

// Expensive part, should carefuley code this function, Ken Y.
function validate_join(player, ci) {
	if (player.id === undefined) return false;
	ci = (ci === undefined ? 0 : ci);
	var current_time = g.game.age;
	var f = [];
	var ii = validate_index[ci].st;
	while (ii < validate_index[ci].en) {
		f[ii] = (current_time - current[ii].timestamp <=  conf.players.time.life || current[ii].group == 'admin');
		if (current[ii].id == player.id) { // validate an existing player
			if (f[ii]) {
				current[ii].timestamp = current_time;
				current[ii].time_warning = 0;
				return true;
			}
		}
		ii++;
	}
	ii = validate_index[ci].st;
	while (ii < validate_index[ci].en) {
		if (!f[ii]) { // joined a new player by timestamp
			current[ii] = new_propoeties(player, ii, current_time);
			pointer.update_by_operation('on', ii, undefined);
			wm.update_common_style('on', conf.window_icon.login, wm.login_controls[ii]);
			wm.status_bottom.set_message(status_bar_messages[ii], ii);
			commenting.post('P' + wm.index_pp[ii] + 'が着席しました');
			return true;
		}
		ii++;
	}
	return false;
}
module.exports.validate_join = validate_join;

function find_index(id, ci) {
	// return 0;
	if (id === undefined) return false;
	ci = (ci === undefined ? 0 : ci);
	var ii = validate_index[ci].st;
	while (ii < validate_index[ci].en) {
		if (current[ii].id == id) return ii;
		ii++;
	}
	return false;
}
module.exports.find_index = find_index;

function logout(player_index) {
	current[player_index] = conf.players.default[player_index];
	pointer.set_name_background('off', player_index); // direct update is required, not called pointer.update_by_operation('off', undefined, player_index);
	wm.update_common_style('off', conf.window_icon.login, wm.login_controls[player_index]);

	// Initialize all semaphoes
	wm.player_operations[player_index].set_value(conf.window.max_multi_operation);
	pointer.pointers_pressed[player_index].set_value(0); // inital value
	var ii = 0;
	var length_status = piece.status.length;
	while (ii < length_status) {
		var gid = piece.disk_id[ii];
		piece.status[gid].pointdown.processed[player_index].set_value(0);
		ii++;
	}
	commenting.post('P' + wm.index_pp[player_index] + 'は退席しました');
}
module.exports.logout = logout;

function get_group(id) {
	// return 'admin';
	var player_index = find_index(id);
	if(player_index === false) return false;
	return current[player_index].group;
}
module.exports.get_group = get_group;


function new_propoeties(player, player_index, timestamp) {
	return {
		id: player.id,
		// name: player.name,
		// head: 'Player' + wm.index_pp[player_index] + ': ' + player.name.substr(0, 2),
		name: 'Player' + wm.index_pp[player_index],
		head: 'Player' + wm.index_pp[player_index] + ': 参加中',
		timestamp: timestamp,
		time_warning: conf.players.default[player_index].time_warning,
		player_plate: conf.players.default[player_index].player_plate,
		player_plate_status: conf.players.default[player_index].player_plate_status,
		login: true,
		group: conf.players.default[player_index].group
	};
}
module.exports.new_propoeties = new_propoeties;

function is_login(player_index) {
	var current_time = g.game.age;
	if (current_time - current[player_index].timestamp <=  conf.players.time.life) return true;
	return false;
}
module.exports.is_login = is_login;
