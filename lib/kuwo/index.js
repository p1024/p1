/**
 * @description This module provides facilities for fetching data from http://http://www.kuwo.cn
 */
const PM = require('bluebird');
const request = PM.promisifyAll(require('request'), {multiArgs: true});
const iconv = require('iconv-lite');
const zlib = PM.promisifyAll(require('zlib'));

/**
 * fetch song uri from the web
 * @param  {string} rid        id of resource
 * @param  {Array}  formatList accepted format list
 * @return {string}            uri of the song
 */
async function fetchSong(rid, formatList=['mp3', 'aac', 'wma']) {
	if(formatList.every(f=>['mp3', 'wma', 'aac'].indexOf(f)>-1)) {

		let songUri, uri = `http://antiserver.kuwo.cn/anti.s?response=url&rid=MUSIC%5F${rid}&format=${formatList.join('%7C')}&type=convert%5Furl`;

		try {
			let [response, body] = await request.getAsync(uri);
			if(response.statusCode !== 200) {
				throw Error({code: response.statusCode, status: response.statusMessage});
			} else {
				songUri = body.trim();
			}
		} catch(e) {
			throw e;
		}

		return songUri;

	} else {
		throw Error('invalid format');
	}
}

/**
 * fetch info of the resource
 * @param  {string} rid id of resource
 * @return {object}     info of the resource
 */
async function fetchSongData(rid) {
	let songData, uri = `http://player.kuwo.cn/webmusic/st/getNewMuiseByRid?rid=MUSIC_${rid}`;

	try {
		let [response, body] = await request.getAsync(uri);
		if(response.statusCode !== 200) {
			throw Error({code: response.statusCode, status: response.statusMessage});
		} else {
			songData = body
				.split(/\r\n|\r|\n/g)
				.slice(1, -2)
				.reduce((song, item)=>{
					let data = item.match(/<(.*?)>(.*?)<(.*?)>/);
					song[data[1]] = data[2];
					return song;
				}, {});
		}
	} catch(e) {
		throw e;
	}

	return songData;
}


/**
 * fetch lyric of the resource
 * @param  {string} rid id of the resource
 * @return {string}     lyric of the resource
 */
async function fetchLyric(rid) {
	let song = await fetchSongData(rid);
	let lyric;
	try {
		let [response, body] = await request.getAsync({
			uri: `http://newlyric.kuwo.cn/newlyric.lrc?${song.lyric}`,
			encoding: null
		});
		if(response.statusCode !== 200) {
			throw Error({code: response.statusCode, status: response.statusMessage});
		} else {
			let location = body.toString().indexOf("\r\n\r\n");
			let buffer = await zlib.unzipAsync(body.slice(location+4));
			lyric = iconv.decode(buffer, 'GB2312');
		}
	} catch(e) {
		throw e;
	}

	return lyric;
}

module.exports = {
	song: fetchSong,
	lyric: fetchLyric,
	full: fetchSongData
}