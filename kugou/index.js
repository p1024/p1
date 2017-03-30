/**
 * @description This module provides facilities for fetching data from http://www.kugou.com/
 */
const request = require('request');
const PM = Promise;

/**
 * fetch data of thesong
 * @param  {string} hash hash of the song
 * @return {object}      data of the song
 */
function fetchSongData(hash) {
	let uri = `http://www.kugou.com/yy/index.php?r=play/getdata&hash=${hash}&_=${Date.now()}`;
	return new PM((res, rej)=>{
		request({uri, json:true}, (err, response, body)=>{
			if(!err && response.statusCode === 200) {
				if(body.err_code === 0) {
					res(body.data);
				} else {
					rej({err:body.err_code, status: body.status, type: 'MUSIC_SERVER'});
				}
			} else {
				rej({err:err, status: response.statusMessage});
			}
		});
	})
}


/**
 * fetch uri of the song
 * @param  {string} hash hash of the song
 * @return {string}      uri of the song resource
 */
function fetchSong(hash) {
	return fetchSongData(hash).then(song=>song.play_url);
}


/**
 * fetch lyric of the song
 * @param  {string} hash hash of the song
 * @return {string}      lyric of the song
 */
function fetchLyric(hash) {
	return fetchSongData(hash).then(song=>song.lyrics);
}


module.exports = {
	song: fetchSong,
	lyric: fetchLyric,
	full: fetchSongData
}