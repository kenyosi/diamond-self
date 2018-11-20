/*
 * Common controls
 * @self, Akashic content
 */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
var wm                         = require('./window_manager');
var scene;
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function set_scene(sc) {scene = sc;}
module.exports.set_scene = set_scene;

function update_toggle(flag, style, group) {
	wm.draw_modified(group.children[0], style.background[flag]);
	wm.draw_modified(group.children[1], style.icon[flag]);
}
module.exports.update_toggle = update_toggle;

function create(asset, x, y, w, h, style) {
	var group = new g.E({
		scene: scene,
		x: x,
		y: y,
		width: w,
		height: h,
		scaleX: 1,
		scaleY: 1,
		touchable: true,
		tag: {type: 'absolute'},
		local: style.local,
	});
	var rect = new g.FilledRect({
		scene: scene,
		cssColor: style.background.off.cssColor,
		opacity: style.background.off.opacity,
		width: w,
		height: h,
	});
	group.append(rect);
	var sprite = new g.Sprite({
		scene: scene,
		src: scene.assets[asset],
		opacity: style.icon.off.opacity,
		height: w,
		width: h,
		angle: 0,
		srcX: style.icon.off.srcX,
		srcY: style.icon.off.srcY,
		srcHeight: w,
		srcWidth: h,
	});
	group.append(sprite);
	return group;
}
module.exports.create = create;
