//--------------------------------------------------------
// coding:     Yurii K. <y.korotia@hotmail.com>
// design:     stonegamts
// clansite    http://darkresistance.net
// version:    3.5
// created:    16.02.2012
// revision:   18.11.2012
// hours:      35
//-------------------------------------------------------
var bg = 'red';
var bg = 'black';


var DarkResistance_bf3stats = {
	// configuration goes here
	backgrounds : {
		red:	{ file: '0oJPEiZGp0lYf5N5R7/statsig4fixed-1.png', x: 0, y: 0 },
		black:	{ file: '0oJPEiZGp0lYf5N5R7/_black.png', x: 0, y: 0 }
	},
	colors: {
		name: 'FFFFFF',
		stats_value: 'FFFFFF',
		stats_name: 'C7C7C7',
		kd_good: '4CFF00',
		kd_bad: 'FF0000',
		shadow: '000000',
		weapons_name: '308DBF',
		weapons_kills: 'FFFFFF',
		weapons_accuracy: 'C7C7C7'
	},
	font_sizes: { weapons_accuracy: 5 },
	font_bold: 'fonts/VeraBd.ttf',
	background: null,
	//
	// main entry point. call only this
	//
	init: function(bg) {
		defaults.text.size = 7;
		this.background = this.backgrounds[bg];

		if (!this.isPlayerExists()) { // user not found. output error
			this.outputError('Error: Player does not exist');
			return;
		}
		this.outputBackground();
		this.outputCountry();
		this.outputName();
		this.outputRank();
		this.outputStatsBlock();
		this.outputBestKit();
		this.outputBestRibbons();
		this.outputBestPistol();
		this.outputBestWeapons();
		this.outputDogTags();
		this.outputBestEquipment();
		this.outputBestMedals();
		//done
	},
	// checks if requested player exists
	// @return TRUE on success, FALSE otherwise
	isPlayerExists: function() {
		if (p.status == 'notfound') {
			return false;
		}
		return true;
	},
	//
	//
	outputBackground:function() {
		image(this.background);
	},
	//
	//
	outputCountry: function() {
		image({file:p.country_img, x:135, y:13});
	},
	//
	//
	outputName: function() {
		this.outputTextWithShadow({text:p.name, size:10, color: 'FFFFFF', font:this.font_bold, x:155, y:23});
	},
	//
	//
	outputRank: function() {
		image({file:p.stats.rank.img_small, x:298, y:-2});
	},
	// get list of the best items
	// returns list of the best {count} items
	getTop: function(type, items, count) {
		var main = true;	// workaround for secondary weapon, like sidearm!
		var comp = 'kills'; // comparition attribute
		var pattern_no_m320 = RegExp('m320|m26','i');
		// different types have different comparition attributes
		switch(type) {
			case 'weapons':
				comp = 'kills';
			break;
			case 'pistols':
				comp = 'kills';
				type = 'weapons';
				main = false; // 2ndary
			break;
			case 'medals':
				comp = 'count';
			break;
			case 'vehicles':
				comp = 'destroys';
			break;
			case 'ribbons':
				comp = 'date';
			break;
			case 'equipment':
				comp = 'kills';
			break;
			case 'kits':
				comp = 'score';
			break;
		}
		best_list = Array();
		for (var k = 0; k < count; k++) {
			var bw = null;
			var ok = 0;
			for (var i = 0; i < items.length; i++) {
				w = eval('p.stats.'+type+'.'+items[i]);
				if(!eval('w.'+comp)) continue;
				switch (main) {
					case true:
					if (bw == null) {
						bw = w;
						ok = i;
					} else if(eval('w.'+comp) > eval('bw.'+comp)) {
						bw = w;
						ok = i;
					}
					break;
					case false:
						if (w.category == 'Handheld weapons') {
							if(pattern_no_m320.test(w.name)) { // workaround for m320 - remove from list
								continue;
							}
							if (bw == null) {
								bw = w;
								ok = i;
							} else if( eval('w.'+comp) > eval('bw.'+comp)) {
								bw = w;
								ok = i;
							}
						}
					break;
				}
			}//for-best
			// fix if player has no items
			if (bw == null) {
				return null;
			}
			//delete the best item from list
			items.splice(ok,1);
			best_list[k] = bw;
		}//count
		return best_list;
	},
	//text with shadow helper
	// bf3stats text extended with shadow
	outputTextWithShadow: function (text_opt) {
		c = text_opt.color; // buffer
		text_opt.color = '000000';
		text_opt.x++;
		text_opt.y++;
		text(text_opt); //shadow
		text_opt.color = c;
		text_opt.x--;
		text_opt.y--;
		text(text_opt); // title
	},
	// latest ribbons
	outputBestRibbons: function() {
		var top_ribbons = this.getTop('ribbons', Object.keys(p.stats.ribbons), 4);
		log(top_ribbons);
		if (top_ribbons != null) {
			var scale = 0.5; //50%
			for (var i = 0; i < top_ribbons.length; i++) {
				image({file: top_ribbons[i].img_small, x:136+i*37, y:33, h:28*scale, w:75*scale});
			}
		} else { //no ribbons
			this.outputTextWithShadow({text: 'no ribbons', color:'FFFFFF', align:'center', font:this.font_bold, x:210, y:43});
		}
	},
	//outputs 2 best kits for player
	outputBestKit: function() {
		top_kits = this.getTop('kits', Object.keys(p.stats.kits), 2);
		//--best kit
		image({file: top_kits[0].img_bk, x:144, y:60});
		image({file: top_kits[0].img, x:141, y:57}); // shadow image
		// show 2nd kit if it is higher than 30% of main kit
		if (top_kits[1].score > top_kits[0].score * 0.3) {
			image({file: top_kits[1].img_bk, x:130, y:54, h:16, w:16});
			image({file: top_kits[1].img, x:128, y:52, h:16, w:16}); // shadow image
		}
	},
	//outputs stats block
	outputStatsBlock: function() {
		var output_stat = function(line, value, subtitle, color) {
			var line_y = 62;
			text({text:subtitle, align:'left', color:this.colors.stats_name, x:235, y:line_y+line*10}); //name
			text({text:value, align:'right', color: (color == null ? this.colors.stats_value : color), x:232, y:line_y + (line * 10)}); //value
		};
		var stats = [
			{ name: 'Hours', value: nf(p.stats.global.time/3600, 0) },
			{ name: 'SPM', value: nf(p.stats.scores.score/(p.stats.global.time/60), 2) },
			{ name: 'Win/Loss', value: nf(p.stats.global.wins/p.stats.global.losses, 3), value_color: (p.stats.global.wins/p.stats.global.losses > 1 ? this.colors.kd_good : this.colors.kd_bad)  },
			{ name: 'Kill/Death', value: nf(p.stats.global.kills/p.stats.global.deaths, 3), value_color: (p.stats.global.kills/p.stats.global.deaths > 1 ? this.colors.kd_good : this.colors.kd_bad) },			
			{ name: 'Headshots', value: p.stats.global.headshots },
			{ name: 'Longest HS', value: p.stats.global.longesths },
			{ name: 'Dogtags', value: p.stats.global.dogtags }
		];
		for (var i = 0; i < stats.length; i++) {
			output_stat.call(this, i, stats[i].value, stats[i].name, stats[i].value_color);
		}
	},
	//
	//
	//
	outputBestPistol: function() {
		top_pistols = this.getTop('pistols', Object.keys(p.stats.weapons), 1);
		if (top_pistols[0] != null) {
			var scale = 0.142; //14%
			image({file: top_pistols[0].img, x:297, y:65,h:308*scale, w:512*scale});
			this.outputTextWithShadow({text: top_pistols[0].name, color:this.colors.weapons_name, align:'center', font:this.font_bold, x:330, y:70});
			text({text: top_pistols[0].kills + ' kills', color: this.colors.weapons_kills, align:'center', x:330, y:113});
			text({text: nf(top_pistols[0].hits/top_pistols[0].shots*100,1) + '% acc.', color:this.colors.weapons_accuracy, size: this.font_sizes.weapons_accuracy, align:'center', x:330, y:120});
		} else { //no pistols
			this.outputTextWithShadow({text: 'no pistols', color:'FFFFFF', align:'center', font:this.font_bold, x:330, y:90});
		}
	},
	//outputs weapons
	outputBestWeapons: function() {
		var output_weapon = function(line, obj_weapon) {
			var scale = 0.142; //14%
			image({file: obj_weapon.img, x:382, y:8+line*40,h:308*scale, w:512*scale});
			this.outputTextWithShadow({text: obj_weapon.name, color:this.colors.weapons_name, font:this.font_bold, align:'center', x:495, y:23+line*40});
			text({text: obj_weapon.kills + ' kills', color: this.colors.weapons_kills, x:473, align:'left', y:34+line*40});
			text({text: nf(obj_weapon.hits/obj_weapon.shots*100,1) + '% acc.', color:this.colors.weapons_accuracy, x:473, size: this.font_sizes.weapons_accuracy, align:'left',y:42+line*40});
		};
		var top_weapons = this.getTop('weapons', Object.keys(p.stats.weapons), 3);
		log(top_weapons);		
		if (top_weapons != null) {
			for(var i = 0; i < top_weapons.length; i++){
				output_weapon.call(this, i, top_weapons[i]);
			}
		} else { //no top weapons
			this.outputTextWithShadow({text: 'no weapons', color:'FFFFFF', align:'center', font:this.font_bold, x:460, y:70});
		}
	},
	outputDogTags: function() {
		log(p.dogtags);
		if (p.dogtags != null) { 
			var tag_w = 128;
			var tag_h = 74;
			var scale = 0.45;//50%			
			if (p.dogtags.advanced != null) { //dogtag 1
				image({file: p.dogtags.advanced.image_s, h:tag_h*scale,w:tag_w*scale, angle:0, align:'right', x:593, y:9}); 
			}
			if (p.dogtags.basic != null) { //dogtag 2
				image({file: p.dogtags.basic.image_s, h:tag_h*scale,w:tag_w*scale, angle:0, align:'right', x:545, y:11});
			}
		} else { //no dogtags
			this.outputTextWithShadow({text: 'no dogtags', color:'FFFFFF', align:'center', font:this.font_bold, x: 600, y:30});
		}
	},
	outputBestEquipment: function() {
		var top_equipment = this.getTop('equipment', Object.keys(p.stats.equipment), 2);
		log(top_equipment);
		if (top_equipment != null) {
			var scale = 0.08; //80%
			for(var i = 0; i < top_equipment.length; i++) {
				image({file: top_equipment[i].img, align:'left', x:542, y:57+i*40,h:308*scale, w:512*scale});
				this.outputTextWithShadow({text: top_equipment[i].name, color:this.colors.weapons_name, align:'center', font:this.font_bold, x:615, y:63+i*32});
				text({text: top_equipment[i].kills+ ' kills', color: this.colors.weapons_kills, align:'center', x:629, y:77+i*32});
			}
		} else { // no equipment used
			this.outputTextWithShadow({text: 'no equipment', color:'FFFFFF', align:'center', font:this.font_bold, x: 600, y:90});
		}
	},
	outputBestMedals: function() {
		var top_medals = this.getTop('medals', Object.keys(p.stats.medals), 6);
		log(top_medals);
		if (top_medals != null) {
			for(var i = 0; i < top_medals.length; i++) {
				if(i < 3) {
					image({file:top_medals[i].img_small, x:655 + i*40, y:16});
				} else { // draw new line
					image({file:top_medals[i].img_small, x:655 + (i-3)*40, y: 70});
				}
			}
		} else { //no medals
			this.outputTextWithShadow({text: 'no medals', color:'FFFFFF', align:'center', font:this.font_bold, x:725, y:70});
		}
	},
	outputError: function(error) {
		rectangle({x:0, y:0, w:300, h:50, color:this.c_gray, fill:'FF0000'});
		text({x:10, y:30, color: '000', size: 15, align:'left', text: error});
		text({x:11, y:31, color: 'FFFFFF', size: 15, align:'left', text: error});
	}
};


DarkResistance_bf3stats.init(bg);

