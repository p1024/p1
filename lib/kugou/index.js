/**
 * @description This module provides facilities for fetching data from http://www.kugou.com/
 */
const request = require('bluebird').promisifyAll(require('request'), {multiArgs: true});

/**
 * fetch data of thesong
 * @param  {string} hash hash of the song
 * @return {object}      data of the song
 */
async function fetchSongData(hash) {
	let songData, uri = `http://www.kugou.com/yy/index.php?r=play/getdata&hash=${hash}&_=${Date.now()}`;

	try {
		let [response, body] = await request.getAsync({uri, json:true});
		if(response.statusCode !== 200) {
			throw Error({code: response.statusCode, status: response.statusMessage});
		} else {
			songData = body.data;
		}
	} catch(e) {
		throw e;
	}

	return songData;
}


/**
 * fetch uri of the song
 * @param  {string} hash hash of the song
 * @return {string}      uri of the song resource
 */
async function fetchSong(hash) {
	let song = await fetchSongData(hash);
	return song.play_url;
}


/**
 * fetch lyric of the song
 * @param  {string} hash hash of the song
 * @return {string}      lyric of the song
 */
async function fetchLyric(hash) {
	let song = await fetchSongData(hash);
	return song.lyrics;
}

module.exports = {
	song: fetchSong,
	lyric: fetchLyric,
	full: fetchSongData
}