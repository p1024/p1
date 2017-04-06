/**
 * @description This module provides facilities for fetching data from http://www.9sky.com
 */
const request = require('bluebird').promisifyAll(require('request'), {multiArgs: true});


/**
 * get songs by id
 * @param  {string|array} idList group of id
 * @return {array}        info of songs
 */
async function getSongs(idList) {
	let idStr = Array.isArray(idList) ? idList.join() : idList;
	let uri = `http://www.9sky.com/main/musicinfo?ids=`+idStr;
	let songList;

	try {
		let [response, body] = await request.getAsync({uri, json: true});
		if(response.statusCode !== 200) {
			throw Error({code: response.statusCode, status: response.statusMessage});
		} else {
			songList = body.data;
		}
	} catch(e) {
		throw e;
	}

	return songList;
}


/**
 * get uri of song
 * @param  {string} id id of song
 * @return {string}    uri of song
 */
async function getSong(id) {
	let songList = await getSongs(id);
	return songList[0]['song_url'];
}


/**
 * get lyric of song
 * @param  {string} id id of song
 * @return {string}    lyric of song
 */
async function getLyric(id) {
	let uri = `http://www.9sky.com/main/musician/song/lyric?id=${id}&_=${Date.now()}`;
	let lyric;
	try {
		let [response, body] = await request.getAsync({uri, json: true});
		if(response.statusCode !== 200) {
			throw Error({code: response.statusCode, status: response.statusMessage});
		} else {
			lyric = body.data.lyric;
		}
	} catch(e) {
		throw e;
	}
	return lyric;
}


module.exports = {
	song: getSong,
	lyric: getLyric,
	songs: getSongs
};