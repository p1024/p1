/**
 * @description This module provides facilities for fetching data from http://music.baidu.com
 */


const request = require('bluebird').promisifyAll(require('request'), {multiArgs: true});


/**
 * get multi songs's info from the site
 * @param  {string|array} idList id of song
 * @return {array}        info   of song
 */
async function getMultiSong(idList) {
	let idStr = Array.isArray(idList)?idList.join(','):idList;
	let data, uri = `http://ting.baidu.com/data/music/links?songIds=${idStr}`;

	try {
		let [response, body] = await request.getAsync({uri, json:true});
		if(response.statusCode !== 200) {
			throw Error({code: response.statusCode, status: response.statusMessage});
		} else {
			data = body.data.songList;
		}
	} catch(e) {
		throw e;
	}

	return data;
}


/**
 * get uri of song
 * @param  {string} id id of song
 * @return {string}    uri of song
 */
async function getSong(id) {
	let songList = await getMultiSong(id);
	return songList[0].songLink;
}


/**
 * get lyric uri of song
 * @param  {string} id id of song
 * @return {string}    uri of lyric
 */
async function getLyricUri(id) {
	let songList = await getMultiSong(id);
	return songList[0].lrcLink;
}


/**
 * get lyric of song
 * @param  {string} id id of song
 * @return {string}    lyric of song
 */
async function getLyric(id) {
	let uri = await getLyricUri(id);
	let lyric;

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
	song: getSong,
	lyric: getLyric,
	full: getMultiSong
}