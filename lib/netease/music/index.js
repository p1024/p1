/**
 * @description This module provides facilities for fetching data from http://music.163.com
 */
const enc = require('../enc/');
const request = require('bluebird').promisifyAll(require('request'), {multiArgs: true});

/**
 * Get parameter "option" of module "request" by sid
 * @param  {string} sidStr A group of sids joined by semicolon
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

/**
 * get one or a group of songs
 * @param  {string|array} sids  id of song
 * @param  {string}       proxy proxy
 * @return {array}         	    song's info
 */
async function getMultiSong(sids, proxy) {
	let songList, sidStr = Array.isArray(sids) ? sids.join() : sids;

	try {
		let option = getOption(sidStr, 'song');
		option.proxy = proxy;
		let [response, body] = await request.postAsync(option);
		if(response.statusCode !== 200) {
			throw Error({code: response.statusCode, status: response.statusMessage});
		} else {
			songList = body;
		}
	} catch(e) {
		throw e;
	}

	return songList;
}

/**
 * get song's uri
 * @param  {string} sid   id of song
 * @param  {string} proxy proxy
 * @return {string}       uri of song
 */
async function getSong(sid, proxy) {
	let songList = await getMultiSong(sid, proxy);
	return songList.data[0].url;
}

/**
 * get song's lyric
 * @param  {string} sid   id of song
 * @param  {string} proxy proxy
 * @return {string}       lyric of song
 */
async function getLyric(sid, proxy) {
	let lyric;
	try {
		let option = getOption(sid, 'lyric');
		option.proxy = proxy;
		let [response, body] = await request.postAsync(option);
		if(response.statusCode !== 200) {
			throw Error({code: response.statusCode, status: response.statusMessage});
		} else {
			lyric = body.lrc.lyric;
		}
	} catch(e) {
		throw e;
	}

	return lyric;
}

module.exports = {
	song: getSong,
	lyric: getLyric,
	songs: getMultiSong,
	list: require('./playlist'),
	option: getOption
};