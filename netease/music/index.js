/**
 * @description This module provides facilities for fetching data from http://music.163.com
 */
const enc = require('../enc/index');

/**
 * Get parameter "option" of module "request" by sid
 * @param  {String} sidStr A group of sids joined by semicolon
 * @param  {string} type   song or lyric
 * @return {object}        parameter "option" of module "request" 
 */
function getOption (sidStr, type="song") {
	let uri='', bl={};
	if(type === 'song') {
		bl = {
		  br: 320000,
		  csrf_token: '',
		  ids: "["+sidStr+"]"
		};
		uri = 'http://music.163.com/weapi/song/enhance/player/url?csrf_token=';
	} else if(type="lyric") {
		bl = {
		  lv: -1,
		  tv: -1,
		  csrf_token: '',
		  id: sidStr
		};
		uri = 'http://music.163.com/weapi/song/lyric?csrf_token='
	} else {
		throw new Error('invalid type');
	}

	let encResult = enc(bl);

	return {
		method: 'POST',
		uri: uri,
		form: {
			params: encodeURI(encResult.params),
			encSecKey: encResult.encSecKey
		},
		headers: {
			Accept:'*/*',
			'Accept-Encoding':'gzip, deflate',
			'Accept-Language':'zh-CN,zh;q=0.8',
			Connection:'keep-alive',
			Host:'music.163.com',
			Origin:'http://music.163.com',
			Referer:'http://music.163.com/'
		},
		gzip: true,
		json: true
	}
}

module.exports = {
	song: function (sids) {
		let sidStr = Array.isArray(sids) ? sids.join() : sids;
		return getOption(sidStr, 'song');
	},
	lyric: function (sid) {
		return getOption(sid, 'lyric');
	}
}