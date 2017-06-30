/**
 * @description This module provides facilities for fetching data from http://www.1ting.com
 */
const request = require('bluebird').promisifyAll(require('request'), {multiArgs: true});


/**
 * get info of song by pageId
 * @param  {string} pageId id of the song page
 * @return {object}        info of the song
 */
async function getSongInfo(pageId) {
	let uri = `http://www.1ting.com/player/6c/player_${pageId}.html`;
	let songInfo;

	try {
		let [response, body] = await request.getAsync(uri);
		if(response.statusCode !== 200) {
			throw Error({code: response.statusCode, status: response.statusMessage});
		} else {
			songInfo = JSON.parse(body.match(/\$YP.create\(\[(.*?)\]\);/m)[1]);
		}
	} catch(e) {
		throw e;
	}

	return songInfo;
}


/**
 * get uri of the song
 * @param  {string} pageId id of the song page
 * @return {string}        uri of the song
 */
async function getSongUri(pageId) {
	let songInfo = await getSongInfo(pageId);
	let uri = 'http://www.1ting.com/api/audio?' + songInfo[7].replace(/wma/, 'mp3');

	let [response] = await request.getAsync({
		uri, 
		followRedirect:false,
		headers: {
			Referer: 'http://www.1ting.com/player/63/player_325954.html'
		}
	});
	return response.headers.location;
}


/**
 * get lyric of the song
 * @param  {string} pageId id of the song page
 * @return {string}        lyric of the song
 */
async function getLyric(pageId) {
	let uri = `http://www.1ting.com/lrc${pageId}.html`;
	let lyric;

	try {
		let [response, body] = await request.getAsync(uri);
		if(response.statusCode !== 200) {
			throw Error({code: response.statusCode, status: response.statusMessage});
		} else {
			lyric = body.match(/<div id=\"lrc\">((.|\n)*?)<\/div>/m)[1];
		}
	} catch(e) {
		throw e;
	}
	return lyric;
}


module.exports = {
	song: getSongUri,
	lyric: getLyric,
	info: getSongInfo
}