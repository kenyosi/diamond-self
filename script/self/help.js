/*
 * Help board and controls
 * @self, Akashic content
 */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration
var conf                       = require('../content_config');
var help                       = {
	show: false,
	position: {x: 0, y: conf.help_board.height},
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
var common_control                       = require('./common_control');
var scene;
var view;
var help_board;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function set_scene(sc, vi) {
	scene = sc;
	view  = vi;
}
module.exports.set_scene = set_scene;

function create_control(x, y, w, h, style, obj) {
	var update_form = {
		true: {flag: 'on', message: 'ヘルプを出します'},
		false: {flag: 'off', message: 'ヘルプを消します'}};
	// var dx;
	// var dy;
	var current_camera_status;
	var current_zoom;
	var hiding_objects = obj;
	var group = common_control.create('window_manager_icons', x, y, w, h, style);

	group.pointUp.add(function () { // ev is for future use
		help.show = !help.show;
		if (help.show) {
			current_camera_status = view.floating;
			current_zoom          = view.zoom;
			if (current_zoom != 1) {
				view.zoom = 1 / view.zoom;
				// zoom_view(view.zoom);
			}
			view.floating = false;
			// dx = help.position.x - view.position.x;
			// dy = help.position.y - view.position.y + cell_size_array[1]; // <-------------------
			var length_hiding_objects = hiding_objects.length;
			for(var i = 0; i < length_hiding_objects; i++) {
				var obj = hiding_objects[i];
				obj.hide();
			} 
			// move_view(dx, dy);
			help_board.show();
		}
		else {
			help_board.hide();
			// move_view(-dx, -dy);
			if (current_zoom != 1) {
				view.zoom = 1 / view.zoom;
				// zoom_view(view.zoom);
			}
			length_hiding_objects = hiding_objects.length;
			for(i = 0; i < length_hiding_objects; i++) {
				obj = hiding_objects[i];
				obj.show();
			} 
			view.floating = current_camera_status;
		}
		common_control.update_toggle(update_form[help.show].flag, style, group);

	});
	return group;
}
module.exports.create_control = create_control;

function create_board(p, x, y) {
	var group = new g.E({
		scene: scene,
		x: x,
		y: y,
		width: p.width,
		height: p.height,
		scaleX: 1,
		scaleY: 1,
		touchable: false,
		tag: {type: 'board'},
		local: true,
		hidden: true,
	});
	var background = new g.FilledRect({
		scene: scene,
		cssColor: p.background.cssColor,
		opacity: p.background.opacity,
		width: p.width,
		height: p.height,
	});
	group.append(background);
	var scene_asset = 'help_screen';
	if (conf.players.max_players == 1) scene_asset = 'help_screen_solo';
	var help_screen = new g.Sprite({
		scene: scene,
		src: scene.assets[scene_asset],
		opacity: p.label.opacity,
		width: p.width,
		height: p.height,
		angle: 0,
		srcX: 0,
		srcY: 0,
		srcHeight: p.height,
		srcWidth: p.width,
	});
	group.append(help_screen);

	// group.pointMove.add(function (ev) {
	// 	if ((admin.control && player.get_group(ev.player.id) != 'admin')) return;
	// 	if(!player.validate(ev.player, 1)) return;
	// 	if (!view.floating) {
	// 		// group.x += ev.prevDelta.x;
	// 		// group.y += ev.prevDelta.y;
	// 		var ye = (g.game.height - p.height);
	// 		var y0 = group.y;
	// 		var y1 = y0 + ev.prevDelta.y;
	// 		var y2 = (y1 < ye ? ye : y1);
	// 		y2 = (y2 > 0 ? 0 : y2);
	// 		// var dy = y2 - y0;
	// 		group.y = y2;
	// 		// help.position.y -= dy / view.zoom;
	// 		// help.position.x -=ev.prevDelta.x / view.zoom;
	// 		// help.position.y -=ev.prevDelta.y / view.zoom;
	// 	}
	// 	else {
	// 		// group.x -= ev.prevDelta.x;
	// 		group.y -= ev.prevDelta.y;
	// 		// help.position.x +=ev.prevDelta.x / view.zoom;
	// 		help.position.y +=ev.prevDelta.y / view.zoom;
	// 	}
	// 	group.modified();
	// });
	scene.append(group);
	help_board = group;
	return group;
}
module.exports.create_board = create_board;
