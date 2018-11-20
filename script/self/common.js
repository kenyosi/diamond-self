/*
 * Common part
 * @self, Akashic content
 * 
 * All features are currently disabled. They worked in an early stage of development. Future releases might use some of them again. 
 */
// function draw_modified(rect, properies) {
// 	Object.keys(properies).forEach(function(key) {
// 		rect[key] = this[key];
// 	}, properies);
// 	return rect.modified();
// }
// module.exports.draw_modified = draw_modified;

// function indTo3D(ii, dim) {
// 	var cood = [];
// 	var d = dim[0];
// 	cood[0] = ii % dim[0];
// 	cood[1] = (ii -  cood[0]) / dim[0];
// 	var d2 = dim[0] * dim[1];
// 	cood[2] = (ii -  cood[0] + cood[1] * dim[0]) / dim[1];
// 	return cood;
// }

// function base64ToLong(base64_text) {
// 	var n = 0;
// 	var t = {
// 		A:  0, B:  1, C:  2, D:  3, E:  4, F:  5, G:  6, H:  7, I:  8, J:  9,
// 		K: 10, L: 11, M: 12, N: 13, O: 14, P: 15, Q: 16, R: 17, S: 18, T: 19,
// 		U: 20, V: 21, W: 22, X: 23, Y: 24, Z: 25, a: 26, b: 27, c: 28, d: 29,
// 		e: 30, f: 31, g: 32, h: 33, i: 34, j: 35, k: 36, l: 37, m: 38, n: 39,
// 		o: 40, p: 41, q: 42, r: 43, s: 44, t: 45, u: 46, v: 47, w: 48, x: 49,
// 		y: 50, z: 51, 0: 52, 1: 53, 2: 54, 3: 55, 4: 56, 5: 57, 6: 58, 7: 59,
// 		8: 60, 9: 61, '+': 62, '/': 63};
// 	for (c of base64_text) {
// 		n *= 64;
// 		n += t[c];
// 	}
// 	return n;
// }

// Player name plates
// ii = 0;
// while (ii < conf.players.max_players) {
// 	labels[ii] = create_player_name_plate(
// 		cell_size_array[8] + 0.20 * conf.board.cell.size.x + wm.view.position.x,
// 		(9 + ii / 2) * conf.board.cell.size.y + wm.view.position.y, player.current, ii, ev, scene);
// 	ii++;
// }

// function createDiskStackingButton(ii, x, y, w, h, scene, rn) {
// 	var button = new g.FilledRect({
// 		scene: scene,
// 		cssColor: conf.players.item.waiting[ii].cssColor,
// 		opacity: conf.players.item.waiting[ii].opacity,
// 		x: x,
// 		y: y,
// 		width: w,
// 		height: h,
// 		tag: {type: 'absolute'},
// 		touchable: true,
// 		hidden: true,
// 		local: true,
// 	});
// 	button.pointUp.add(function (ev) {
// 		if ((wm.admin.control && player.get_group(ev.player.id) != 'admin')) return;
// 		if (!wm.semaphoe.status()) return;
// 		var player_index = player.find_index(ev.player.id);
// 		var mes;
// 		disk_stacking_state[player_index] = !disk_stacking_state[player_index];
// 		if (disk_stacking_state[player_index]) {
// 			wm.draw_modified(button, conf.players.item.operating[player_index]);
// 			wm.draw_modified(disk.last[player_index].children[0], conf.disk.unselect.background);// unselect the last disk
// 			// mes = 'スタックモードにする@P' + wm.index_pp[player_index];
// 		}
// 		else {
// 			wm.draw_modified(button, conf.players.item.waiting[player_index]);//<----
// 			// mes = 'スタックモードを解除する@P' + wm.index_pp[player_index];
// 		}
// 		// g.game.raiseEvent(new g.MessageEvent({destination: 'eval', message: 'commenting.post("' + mes +'")', souce: 'stacking'}));
// 	});
// 	return button;
// }

// function create_player_name_plate(x, y, players, index, ev, scene) {
// 	var label = new g.Label({
// 		scene: scene,
// 		font: conf.default_font,
// 		text: check_player_name_plate_text(index, players, ev, scene),
// 		fontSize: conf.default_label.fontSize,
// 		textColor: conf.players.item.waiting[index].cssColor,
// 		opacity: conf.players.item.waiting[index].opacity,
// 		touchable: true,
// 		x: x,
// 		y: y,
// 		tag: {type: 'label'}
// 	});
// 	if (conf.players.admin[index] == true) {
// 		scene.append(label);
// 		return label;
// 	} // add admin right
// 	label.pointDown.add(function (ev) {
// 		if ((wm.admin.control && player.get_group(ev.player.id) != 'admin')) return;
// 		if (!wm.semaphoe.status()) return;
// 		if (ev.player.id == players[index].id || player.get_group(ev.player.id) == 'admin') {
// 			++players[index].player_plate;
// 		}
// 	});
// 	label.pointUp.add(function (ev) {
// 		if ((wm.admin.control && player.get_group(ev.player.id) != 'admin')) return;
// 		if (!wm.semaphoe.status()) return;
// 		if (ev.player.id != players[index].id && player.get_group(ev.player.id) != 'admin') return;
// 		--players[index].player_plate;
// 		if (!players[index].login) return; //<-- check if the player is login
// 		if (Math.abs(ev.startDelta.x) >= conf.players.cell.state.size.x
// 			|| Math.abs(ev.startDelta.y) > conf.players.cell.state.size.y) {
// 			var indp1 = index + 1;
// 			var message = (ev.player.id == players[index].id ? '退席します@P' + indp1 : 'P' + indp1 + 'を退席させます');
// 			// if (ev.player.id == players[index].id) message = '退席します@P' + indp1;
// 			// else message = 'P' + indp1 + 'を退席させます';
// 			if(!confirm.show(message)) return;
// 				var confirm_interval = scene.setInterval(function () {
// 				if (wm.semaphoe.status()) {
// 					// after confirmation
// 					scene.clearInterval(confirm_interval);
// 					if (!wm.confirm.result) {
// 						// commenting.post('操作を取り消します');
// 						return;
// 					}
// 					var opacity0 = conf.players.item.waiting[index].opacity;
// 					label.opacity = opacity0;
// 					label.modified();
// 					var dx = ev.startDelta.x * 2.5 / cell_size_array[1];
// 					var x0 = label.x;
// 					var r  = opacity0;
// 					var ai = 0;
// 					var n = 0.6 * g.game.fps;
// 					var intervalId = scene.setInterval(function () {
// 						r *= 0.75;
// 						label.x += dx;
// 						label.opacity = r;
// 						label.modified();
// 						if(ai > n) {
// 							//after name plate animation
// 							scene.clearInterval(intervalId);
// 							label.opacity = opacity0;
// 							label.x = x0;
// 							label.modified();
// 							// if (g.game.player.id == players[index].id) wm.update_common_style('off', conf.window_icon.login, wm.login_control);
// 							// if (g.game.player.id == players[index].id) wm.update_pointer_login('off', index);
// 							// player.logout(index, players[index].head + 'さんは退席しました');
// 							// player.logout(index, players[index].name + 'は退席しました');
// 							player.logout(index);
// 						}
// 						++ai;
// 					}, 1000 / g.game.fps);
// 					// end of  after confirmation
// 				}
// 			}, 100);

// 		}
// 	});
// 	scene.append(label);
// 	return label;
// }
// function check_player_name_plate_text(index, players, ev, scene) {
// 	if (conf.players.admin[index] == true) return  players[index].head; // add admin right
// 	var process_bar = '......................';
// 	var elapsed = g.game.age - players[index].timestamp;
// 	var f0 = (elapsed <=  conf.players.time.life);
// 	if (f0) {
// 		var f1 = (elapsed <=  conf.players.time.warning);
// 		if (!f1 && (players[index].time_warning == 0)) {
// 			// var last_sec = parseInt((conf.players.time.life - elapsed) / 1000); // not precise value
// 			// commenting.post('後30秒程で' + players[index].head + 'さんは自動退席します');
// 			// commenting.post('後30秒程で' + players[index].name + 'は制限時間で退席します');
// 			players[index].time_warning = 1;
// 		}
// 		return  players[index].head + process_bar.substr(0, 3 + (elapsed / 20000));
// 	}
// 	else {
// 		if (elapsed < conf.const.month_length) {
// 			// wm.hide_objects(index);
// 			// if (g.game.player.id == players[index].id) wm.update_common_style('off', '', conf.window_icon.login, wm.login_control);
// 			// if (g.game.player.id == players[index].id) wm.update_pointer_login('off', index);
// 			// player.logout(index, players[index].head + 'さんは退席しました');
// 			// player.logout(index, players[index].name + 'は退席しました');
// 			player.logout(index);
// 		}
// 		return conf.players.default[index].head;
// 	}
// }

// ii = 0;
// while (ii <  conf.players.max_players) {
// 	var ds = createDiskStackingButton(ii,
// 	cell_size_array[8] + wm.view.position.x, cell_size_array[8],
// 	cell_size_array[1], cell_size_array[1], scene);
// 	scene.append(ds);
// 	// disk_stacking.push([scene.children.length - 1]);
// 	++ii;
// }

// function createDestructButton(x, y, w, h, scene) {
// 	var style = conf.game_icon.destruct;
// 	var asset = 'destruct_mark';
//     var group = new g.E({
// 		scene: scene,
// 		x: x,
// 		y: y,
// 		width: w,
// 		height: h,
// 		scaleX: 1,
// 		scaleY: 1,
// 		touchable: true,
// 	});
// 	var rect = new g.FilledRect({
// 		scene: scene,
// 		cssColor: style.background.off.cssColor,
// 		opacity: style.background.off.opacity,
// 		width: w,
// 		height: h,
// 	});
// 	group.append(rect);
// 	var sprite = new g.Sprite({
// 		scene: scene,
// 		src: scene.assets['destruct_mark'],
// 		opacity: style.icon.off.opacity,
// 		height: w,
// 		width: h,
// 		angle: 0,
// 		srcX: style.icon.off.srcX,
// 		srcY: style.icon.off.srcY,
// 		srcHeight: w,
// 		srcWidth: h,
// 	});
// 	group.append(sprite);

// 	group.pointDown.add(function (ev) {
// 		if ((wm.admin.control && player.get_group(ev.player.id) != 'admin')) return;
// 		if (!wm.semaphoe.status()) return;
// 		if(!player.validate_join(ev.player, 0)) return;
// 		wm.draw_modified(group.children[0], style.background.on);
// 	});
// 	group.pointUp.add(function (ev) {
// 		if ((wm.admin.control && player.get_group(ev.player.id) != 'admin')) return;
// 		if (!wm.semaphoe.status()) return;
// 		if(!player.validate_join(ev.player, 0)) return;
// 		wm.draw_modified(group.children[0], style.background.off);
// 		DestructGame(ev, scene);
// 	});
// 	return group;
// }

// function DestructGame(ev, scene) {
// 	var jj = 0;
// 	var mx = cell_size_array[7] * wm.view.zoom;
// 	var my = cell_size_array[7] * wm.view.zoom;
// 	var ij = [];
// 	var counter = 0;
// 	rn = g.game.random;
// 	while (jj < conf.disk.n) {
// 		var d = scene.children[disk.index[jj]];
// 		if(disk.get_address_in_board(d).validate) {
// 			var xy = {
// 				x: (rn.get(0, mx) + rn.get(0, mx)) / 2 + wm.view.position.x,
// 				y: (rn.get(0, my) + rn.get(0, my)) / 2 + wm.view.position.y
// 			};
// 			d.tag.bw = rn.get(0, 1);
// 			disk.move(xy, d, (rn.get(0, 100) + 100)/8);
// 			counter++;
// 		}
// 		++jj;
// 	}
// 	var player_index = player.find_index(ev.player.id);
// 	// if (counter > 0) commenting.post('盤をひっくり返しました@P' + wm.index_pp[player_index]);
// 	// else commenting.post('盤をひっくりかえしましたが、コマはありませんでした@P' + wm.index_pp[player_index]);
// }

