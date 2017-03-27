/**
 * @description This module provides facilities for fetching data from http://music.qq.com
 */
const request = require('request');

/**
 * get information from music.qq.com by songid
 * @param  {string} songMid mid of one song
 * @return {object}         info of one song
 */
function fetch_single_song(songMid) {
	let uri = `https://c.y.qq.com/v8/fcg-bin/fcg_play_single_song.fcg?songmid=${songMid}&tpl=yqq_song_detail&format=jsonp&callback=getOneSongInfoCallback&jsonpCallback=getOneSongInfoCallback&hostUin=0&format=jsonp&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0`;
	return new Promise((res, rej) => {
		function getOneSongInfoCallback(message) {
			res(message);
		}

		request.get(uri, function(err, response, body) {
			if (err) {
				rej(err);
			} else {
				try {
					eval(body);
				} catch (e) {
					rej(e);
				}
			}
		});
	});
}

/**
 * fetch the uri of the song
 * @param  {string} songMid  mid of the song
 * @param  {string} mediaMid mediamid of the song
 * @return {string}          uri of the song
 */
function fetch_song_uri(songMid, mediaMid) {
	function m_r_GetRUin() {
		let e = (new Date).getUTCMilliseconds();
		let m_r_r_s = Math.round(2147483647 * Math.random()) * e % 1e10;
		return m_r_r_s;
	}

	let guid = m_r_GetRUin();
	let uin = 619829630;
	let uri = `https://c.y.qq.com/base/fcgi-bin/fcg_music_express_mobile3.fcg?g_tk=5381&jsonpCallback=MusicJsonCallback&loginUin=${uin}&hostUin=0&format=json&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0&cid=205361747&callback=MusicJsonCallback&uin=${uin}&songmid=${songMid}&filename=C400${mediaMid}.m4a&guid=${guid}`

	return new Promise((res, rej) => {

		function MusicJsonCallback(message) {
			let {
				data: {
					items: [{
						vkey,
						filename
					}]
				}
			} = message;
			let songSrc = `http://dl.stream.qqmusic.qq.com/${filename}?vkey=${vkey}&guid=${guid}&uin=${uin}`
			res(songSrc);
		}

		request(uri, (err, response, body) => {
			if (err) {
				rej(err);
			} else {
				eval(body);
			}
		});
	})
}

/**
 * fetch the lyric
 * @param  {string} songMid mid of the song
 * @return {string}         the lyric
 */
function fetch_lyric(songMid) {
	let uri = `https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg?callback=MusicJsonCallback_lrc&pcachetime=${(new Date).getTime()}&songmid=${songMid}&g_tk=5381&jsonpCallback=MusicJsonCallback_lrc&loginUin=619829631&hostUin=0&format=jsonp&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0`;

	return new Promise((res, rej) => {

		function MusicJsonCallback_lrc(message) {
			let {
				lyric
			} = message;
			res(Buffer.from(lyric, 'base64').toString());
		}

		request({
			url: uri,
			headers: {
				// Host: 'c.y.qq.com',
				Referer: 'https://y.qq.com/portal/player.html'
			}
		}, (err, response, body) => {
			if (err) {
				rej(err);
			} else {
				eval(body);
			}
		});
	})
}

/**
 * fetch the song
 * @param  {string} songMid mid of the song
 * @return {string}         src of the media
 */
function fetch_song(songMid) {
	return fetch_single_song(songMid)
			.then((info) => {
				let {
					data: [{
						file: media_mid
					}]
				} = info;
				return fetch_song_uri(songMid, media_mid);
			});
}


module.exports = {
	song: fetch_song,
	lyric: fetch_lyric
}