/*
 * Status bar
 * @self, Akashic content
 */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration
var conf                       = require('../content_config');
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
var player                     = require('./player');

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var bottom = function(style, scene) {
	var frame =  new g.E({
		scene: scene,
		x: style.x,
		y: style.y,
		height: style.height,
		width: style.width,
		touchable: false,
		local: true,
		hidden: true,
	});
	this.frame = frame;

	var background = new g.FilledRect({
		height: style.height,
		width: style.width,
		scene: scene,
		cssColor: style.background.off.cssColor,
		opacity: style.background.off.opacity,
		touchable: false,
		local: true
	});
	frame.append(background);
	var message = new g.Label({
		scene: scene,
		font: conf.default_font,
		text: '',
		fontSize: 16,
		textColor:  'black',
		opacity: 1.0,
		x: 6,
		y: 6,
		touchable: false,
		local: true
	});
	frame.append(message);
	scene.append(this.frame);
};
bottom.prototype.set_message = function (message, target_player_index) {
	var player_index = player.find_index(g.game.player.id);
	if (target_player_index !== -1 && target_player_index !== player_index) return;
	if (message.length == 0) {
		this.frame.hide();
	}
	else {
		this.frame.show();
	}
	this.frame.children[1].text = message;
	this.frame.children[1].invalidate();
};
module.exports.bottom = bottom;
