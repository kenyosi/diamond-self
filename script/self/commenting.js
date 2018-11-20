/*
 * Commenting
 * @self, Akashic content
 */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration
var conf                       = require('../content_config');

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
var scene;
var messaging_que              = [];
var latest_que_index           = conf.comment.que.size - 1;
var current_que_index          = latest_que_index;
var messaging_manager          = [];
// {{'y': y0        , 'timestamp' : conf.const.old_unix_time},
// {'y': y0 - dy    , 'timestamp' : conf.const.old_unix_time}, ...}
var i = 0;
while(i < conf.comment.lines) {
	messaging_manager[i] = {'y': conf.comment.y0 - i * conf.board.cell.size.y, 'timestamp': conf.const.old_time};
	i++;
}

// var frame_ms                   = 1000 / g.game.fps;
var comma_two_sec              = 0.2 * g.game.fps;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function set_scene(sc) { scene = sc;}
module.exports.set_scene = set_scene;

function post(mes_text){
	if (create(mes_text, scene)) return;
	latest_que_index = (latest_que_index + 1) % conf.comment.que.size;
	messaging_que[latest_que_index] = mes_text;
}
module.exports.post = post;

function from_que () {
	if (latest_que_index == current_que_index) return;
	var messaging_index = get_latest(g.game.age);
	if (messaging_index >= conf.comment.lines) return;
	var test_index = (current_que_index + 1) % conf.comment.que.size;
	var check = create(messaging_que[test_index], scene);
	if (check) current_que_index = test_index;
}
module.exports.from_que = from_que;

function get_latest(current_time) {
	var messaging_index = 0;
	while (messaging_index < conf.comment.lines) {
		if (current_time - messaging_manager[messaging_index].timestamp > 0) return messaging_index;
		messaging_index++;
	}
	return messaging_index;
}
module.exports.get_latest = get_latest;

function create(mes_text) {
	var current_age = g.game.age;
	var messaging_index = get_latest(current_age);
	if (messaging_index >= conf.comment.lines) return false;
	var messaging = new g.Label({
		scene: scene,
		font: conf.comment_font,
		text: mes_text,
		tag: {type: 'absolute'},
		fontSize: conf.comment.properies.fontSize,
		opacity: conf.comment.properies.opacity,
		x: g.game.width,
		y: messaging_manager[messaging_index].y,
		local: false,
	});
	var messaging_rect = messaging.calculateBoundingRect();
	var x_end = messaging_rect.left - messaging_rect.right;

	messaging_manager[messaging_index].timestamp
	= current_age + ((-x_end) + comma_two_sec) / conf.comment.speed;
	messaging.update.add(function() {

		messaging.x -= conf.comment.speed;
		if (messaging.x > x_end) messaging.modified();
		else messaging.destroy();
	});
	scene.append(messaging);
	return true;
}
module.exports.create = create;
