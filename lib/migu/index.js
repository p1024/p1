/**
 * @description This module provides facilities for fetching data from http://music.migu.cn
 */

const request = require('bluebird').promisifyAll(require('request'), {multiArgs: true});


/**
 * get songs by mids
 * @param  {array|string} midList list of mid
 * @return {array}        group of song info
 */
async function getSongs(midList) {
	let midStr = Array.isArray(midList)?midList.join():midList;
	let uri = `http://music.migu.cn/webfront/player/findsong.do?itemid=${midStr}&type=song`,
		songInfo;
	try {
		let [response, body] = await request.getAsync({uri, json: true});
		if(response.statusCode !== 200) {
			throw Error({code: response.statusCode, status: response.statusMessage});
		} else {
			songInfo = body.msg;
		}
	} catch(e) {
		throw e;
	}
	return songInfo;
}


/**
 * get uri of song
 * @param  {string} sid id of song
 * @return {string}     uri of song
 */
async function getSongUri(sid) {
	let songs = await getSongs(sid);
	return songs[0]['hdmp3'];
}


/**
 * get lyric of song
 * @param  {string} sid id of song
 * @return {string}     lyric of song
 */
async function getLyric(sid) {
	let uri = `http://music.migu.cn/webfront/player/lyrics.do?songid=${sid}`,
		lyric;

	try {
		let [response, body] = await request.getAsync(uri);
		if(response.statusCode !== 200) {
			throw Error({code: response.statusCode, status: response.statusMessage});
		} else {
			lyric = body;
		}
	} catch(e) {
		throw e;
	}

	return lyric;
}


module.exports = {
	song: getSongUri,
	lyric: getLyric,
	all: getSongs
}