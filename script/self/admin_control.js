/*
 * Admin controls
 * @self, Akashic content
 */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration
var admin                      = {
	control: false,
	status_bottom: {
		true:  {flag: 'on', message: 'メンテナンス中(放送者のみ操作)'},
		false: {flag: 'off', message: ''}
	},
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
var common_control                       = require('./common_control');
var player                               = require('./player');
var wm                                   = require('./window_manager');

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports.admin = admin;

function create_control(x, y, w, h, style) {
	var group = common_control.create('window_manager_icons', x, y, w, h, style);
	group.pointUp.add(function (ev) {
		if (!player.validate_join(ev.player, 1)) return;
		if ((admin.control && player.get_group(ev.player.id) != 'admin')) return;
		admin.control = !admin.control;
		common_control.update_toggle(admin.status_bottom[admin.control].flag, style, group);
		wm.status_bottom.set_message(admin.status_bottom[admin.control].message, -1);
	});
	return group;
}
module.exports.create_control = create_control;
