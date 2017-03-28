/**
 * @description This module provides facilities for fetching data from http://http://www.xiami.com
 */
const request = require('request');
const PM = Promise;

/**
 * get song_id from song page
 * @param  {string} pageId id of the song page
 * @return {string}        id of song
 */
function getSongId(pageId) {
	let uri = `http://www.xiami.com/song/` + pageId;
	return new PM((res, rej)=>{
		request(uri, (err, response, body)=>{
			if(!err && response.statusCode === 200) {
				let songId = body.match(/var song_id = '(\d+)'/)[1];
				res(songId);
			} else {
				rej({err:err, status: response.statusMessage})
			}
		})
	})
}

/**
 * random four-digit number without beginning with zero
 * @return {string}
 */
function randFour() {
	return Math.random().toString().replace(/^0+|\./g, '').slice(0,4);
}

/**
 * decrypt the location of the song; split from xiami's js file: http://g.alicdn.com/music/music-player/1.0.13/??common/global-min.js,pages/index/page/init-min.js(line 858)
 * @param  {string} a the encrypted location
 * @return {string}   decrypted location
 */
function getLocation(a) {
	if (-1 !== a.indexOf("http://")) return a;
	for (var b = Number(a.charAt(0)), c = a.substring(1), d = Math.floor(c.length / b), e = c.length % b, f = new Array, g = 0; e > g; g++) void 0 == f[g] && (f[g] = ""), f[g] = c.substr((d + 1) * g, d + 1);
	for (g = e; b > g; g++) f[g] = c.substr(d * (g - e) + (d + 1) * e, d);
	var h = "";
	for (g = 0; g < f[0].length; g++)
		for (var i = 0; i < f.length; i++) h += f[i].charAt(g);
	h = unescape(h);
	var j = "";
	for (g = 0; g < h.length; g++) j += "^" == h.charAt(g) ? "0" : h.charAt(g);
	return j = j.replace("+", " ")
}

/**
 * get the info of song by song_id
 * @param  {string} songId id of song
 * @return {object}        info of song
 */
function getSongInfo(songId) {
	let ksTS = Date.now() + '_' + randFour();

	// jsonp random callback
	let callbackName = 'jsonp' + randFour();
	eval('function '+callbackName+'(data){return data}');

	let uri = `http://www.xiami.com/song/playlist/id/${songId}/object_name/default/object_id/0/cat/json?_ksTS=${ksTS}&callback=${callbackName}`;
	return new PM((res, rej)=>{
		request(uri, (err, response, body)=>{
			if(!err && response.statusCode === 200) {
				let song = eval(body).data.trackList[0];
				song.location = getLocation(song.location);
				res({
					song: song.location,
					small_pic: song.pic,
					album_pic: song.album_pic,
					lyric_url: song.lyric_url,
					lyric: song.lyric,
					full: song
				});
			} else {
				rej({err:err, status: response.statusMessage})
			}
		})
	})
}


function fullByPageId(pid) {
	return getSongId(pid).then(getSongInfo);
}


module.exports = {
	song: (pid)=>{
		return fullByPageId(pid).then(songInfo=>songInfo.song);
	},
	lyric: (pid)=>{
		return fullByPageId(pid).then(songInfo=>songInfo.lyric);
	},
	fullByPid: fullByPageId,
	fullBySid: getSongInfo
}