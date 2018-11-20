/*
 * Confirmation window controls
 * @self, Akashic content
 */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration
var conf                       = require('../content_config');

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
var wm                         = require('./window_manager');
var player                     = require('./player');
var scene;
var cell_size_array            = [];
var index_pp                   = [];
var i = 0;
while (i < 20) {
	index_pp[i]        = (i + 1).toString();
	cell_size_array[i] = i * conf.board.cell.size.x;
	i++;
}
var point_up                 = {
	result: false,
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// var result = false;
module.exports.point_up = point_up;

function set_scene(sc) {scene = sc;}
module.exports.set_scene = set_scene;

var create_window = function (ci) {
	ci = (ci === undefined ? 0 : ci);
	this.result = false;
	this.E = create(conf.window_manager_confirm,
		g.game.width / 2 - conf.window_manager_confirm.width / 2,
		g.game.height / 2 - conf.window_manager_confirm.height / 2, ci);
	scene.append(this.E);
};
create_window.prototype.show = function (message) {
	if(!wm.semaphoe.wait()) return false;
	this.E.children[3].text = message;
	this.E.children[3].invalidate();
	var tt_rect = this.E.children[3].calculateBoundingRect();
	var rect_width = tt_rect.right - tt_rect.left;
	this.E.children[3].x = this.E.children[0].width / 2.0 - rect_width / 2.0;
	this.E.children[3].modified();
	this.E.show();
	return true;
};
module.exports.create_window = create_window;

function create(p, x, y, ci) {// ci is kept for future use
	ci = (ci === undefined ? 0 : ci);
	var group = new g.E({
		scene: scene,
		x: x,
		y: y,
		width: p.width,
		height: p.height,
		scaleX: 1,
		scaleY: 1,
		touchable: false,
		tag: {type: 'absolute'},
		hidden: true,
	});
	var background = new g.FilledRect({
		scene: scene,
		cssColor: p.background.cssColor,
		opacity: p.background.opacity,
		width: p.width,
		height: p.height,
		touchable: false,
	});
	group.append(background);
	var yes_group =  new g.E({
		scene: scene,
		x: cell_size_array[1] *0.25,
		y: p.height - cell_size_array[1] - 6,
		height: cell_size_array[1],
		width: cell_size_array[2],
		touchable: true,
	});
	var yes_background = new g.FilledRect({
		scene: scene,
		cssColor: conf.window_icon.yes.background.off.cssColor,
		opacity: conf.window_icon.yes.background.off.opacity,
		height: cell_size_array[1],
		width: cell_size_array[2],
		touchable: false,
	});
	yes_group.append(yes_background);
	var ha = new g.Label({
		scene: scene,
		font: conf.default_font,
		text: 'は い',
		fontSize: 16,
		textColor:  'black',
		opacity: 1.0,
		x: 14,
		y: 6,
		touchable: false,
	});
	yes_group.append(ha);
	yes_group.pointDown.add(function (ev) {
		if ((wm.admin.control && player.get_group(ev.player.id) != 'admin')) return;
		if (!player.validate_join(ev.player, ci)) return;
		wm.draw_modified(yes_background, conf.window_icon.yes.background.on);
	});
	yes_group.pointUp.add(function (ev) {
		if ((wm.admin.control && player.get_group(ev.player.id) != 'admin')) return;
		if (!player.validate_join(ev.player, ci)) return;
		point_up.result = true;
		wm.draw_modified(yes_background, conf.window_icon.yes.background.off);
		group.hide();
		wm.semaphoe.signal();
	});
	group.append(yes_group);
	var no_group =  new g.E({
		scene: scene,
		x: 2.75 * cell_size_array[1],
		y: p.height - cell_size_array[1] - 6,
		height: cell_size_array[1],
		width: cell_size_array[2],
		touchable: true,
	});
	var no_background = new g.FilledRect({
		scene: scene,
		cssColor: conf.window_icon.no.background.off.cssColor,
		opacity: conf.window_icon.no.background.off.opacity,
		height: cell_size_array[1],
		width: cell_size_array[2],
		touchable: false,
	});
	no_group.append(no_background);
	var ii1 = new g.Label({
		scene: scene,
		font: conf.default_font,
		text: 'いいえ',
		fontSize: 16,
		textColor:  'black',
		opacity: 1.0,
		x: 7,
		y: 6,
		touchable: false,
	});
	no_group.append(ii1);
	no_group.pointDown.add(function (ev) {
		if ((wm.admin.control && player.get_group(ev.player.id) != 'admin')) return;
		if (!player.validate_join(ev.player, ci)) return;
		wm.draw_modified(no_background, conf.window_icon.no.background.on);
	});
	no_group.pointUp.add(function (ev) {
		if ((wm.admin.control && player.get_group(ev.player.id) != 'admin')) return;
		if (!player.validate_join(ev.player, ci)) return;
		point_up.result = false;
		wm.draw_modified(no_background, conf.window_icon.no.background.off);
		group.hide();
		wm.semaphoe.signal();
	});
	group.append(no_group);
	var length_p_text = p.text.length;
	for (var i = 0; i < length_p_text; i++) {
		var t = p.text[i];
		var tt = new g.Label({
			scene: scene,
			font: conf.default_font,
			text: t.s,
			fontSize: t.font_size,
			textColor:  p.label.cssColor,
			opacity: p.label.opacity,
			x: t.x,
			y: t.y,
			touchable: false,
		});
		var tt_rect = tt.calculateBoundingRect();
		var rect_width = tt_rect.right - tt_rect.left;
		tt.x = p.width / 2.0 - rect_width / 2.0;
		group.append(tt);
	}
	scene.append(group);
	return group;
}
module.exports.create = create;
