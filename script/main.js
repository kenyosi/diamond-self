/*
 * diamond@self
 * Akashic content
 */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration
var conf                       = require('./content_config');

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
var piece                      = require('./piece');
var wm                         = require('./self/window_manager');
// var set_inital_locations       = require('./set_initial_locations');

var cell_size_array            = [];
var i = 0;
while (i < 20) {
	cell_size_array[i] = i * conf.board.cell.size.x;
	i++;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function main() {
	wm.init();
	var scene = new g.Scene({game: g.game, assetIds:
		['diamonds_plate', 'window_manager_icons', 'help_screen', 'help_screen_solo']
	});
	wm.set_scene(scene);         		      // set window manager in scene
	piece.set_scene(scene);				      // set disks in scene
	scene.loaded.add(function () {
		// Board area
		var ii = 0;
		var x0 = conf.board.location.x0;
		var y0 = conf.board.location.y0;
		var n_traiangles = conf.board.triangle_locations.length;
		while (ii < n_traiangles) {
			var xyc = conf.board.triangle_locations[ii];
			var triangle_propieties = conf.board.triangle_properties[xyc.c];
			triangle_propieties.angle = ((xyc.x + xyc.y + 1) % 2) * 180;
			scene.append(
				createDiamonds(
					xyc.x * 16 + x0,
					xyc.y * cell_size_array[1] - 16 + y0,
					cell_size_array[1], cell_size_array[1],
					triangle_propieties, scene
				)
			);
			++ii;
		}

		x0            = conf.board.location.x0 - cell_size_array[1] / 2 + 4;
		y0            = conf.board.location.y0 - cell_size_array[1] + 4;
		var dx        = cell_size_array[1] / 2;
		var dy        = cell_size_array[1];
		var jj        = 0;
		ii = 0;
		var initial_piece_locations = [];
		var index   = 0;
		while(ii < conf.piece.n) {
			xyc = conf.piece.locations[ii];
			var propeties = conf.piece.properties[xyc.c];
			propeties.index = ii;
			var details = {
				x: xyc.x * dx + x0,
				y: xyc.y * dy + y0,
				bw: 0,
				width: propeties.w,
				height: propeties.h,
				piece: {
					scene: scene,
					src: scene.assets['diamonds_plate'],
					opacity: 1.0,
					width: propeties.w,
					height: propeties.h,
					angle: 0,
					srcX: propeties.srcX,
					srcY: propeties.srcY,
					srcWidth: propeties.w,
					srcHeight: propeties.h,
				},
				initial: {
					index: index,
					piece: 0,
				},
			};
			var d = piece.create(details);
			initial_piece_locations[ii] = {x: d.x, y: d.y, tag: d.tag};

			index++;
			ii++;
		}
		jj = 0;
		while (jj < conf.players.max_players) {
			piece.last[jj] = d;
			jj++;
		}

		// Create window manager
		scene.setTimeout(function() {wm.create();}, 100);
	});
	g.game.pushScene(scene);
}
module.exports = main;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// function indTo2D(ii, dim) {
// 	var cood = [];
// 	cood[0] = ii % dim;
// 	cood[1] = (ii -  cood[0]) / dim;
// 	return cood;
// }

function createDiamonds(x, y, w, h, propeties, scene) {
	return new g.Sprite({
		scene: scene,
		src: scene.assets['diamonds_plate'],
		opacity: 0.5,
		x: x,
		y: y,
		width: w,
		height: h,
		angle: propeties.angle,
		srcX: propeties.srcX,
		srcY: propeties.srcY,
		srcWidth: w,
		srcHeight: h,
	});
}
