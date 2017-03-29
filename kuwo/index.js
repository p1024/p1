/**
 * @description This module provides facilities for fetching data from http://http://www.kuwo.cn
 */
const request = require('request');
const iconv = require('iconv-lite');
const zlib = require('zlib');
const PM = Promise;

/**
 * fetch song uri from the web
 * @param  {string} rid        id of resource
 * @param  {Array}  formatList accepted format list
 * @return {string}            uri of the song
 */
function fetchSong(rid, formatList=['mp3', 'aac', 'wma']) {
	if(formatList.every(f=>['mp3', 'wma', 'aac'].indexOf(f)>-1)) {

		let uri = `http://antiserver.kuwo.cn/anti.s?response=url&rid=MUSIC%5F${rid}&format=${formatList.join('%7C')}&type=convert%5Furl`;
		return new PM((res, rej)=>{
			request(uri, (err, response, body)=>{
				if(!err && response.statusCode === 200) {
					res(body.trim());
				} else {
					rej({err:err, status: response.statusMessage})
				}
			});
		})
	} else {
		throw Error('invalid format');
	}
}

/**
 * fetch info of the resource
 * @param  {string} rid id of resource
 * @return {object}     info of the resource
 */
function fetchSongData(rid) {
	let uri = `http://player.kuwo.cn/webmusic/st/getNewMuiseByRid?rid=MUSIC_${rid}`;
	return new PM((res, rej)=>{
		request(uri, (err, response, body)=>{
			if(!err && response.statusCode === 200) {

				let song = body
					.split(/\r\n|\r|\n/g)
					.slice(1, -2)
					.reduce((song, item)=>{
						let data = item.match(/<(.*?)>(.*?)<(.*?)>/);
						song[data[1]] = data[2];
						return song;
					}, {});
				res(song);
			} else {
				rej({err:err, status: response.statusMessage})
			}
		});
	})
}


/**
 * fetch lyric of the resource
 * @param  {string} rid id of the resource
 * @return {string}     lyric of the resource
 */
function fetchLyric(rid) {
	return fetchSongData(rid)
		.then(song=>{
			return new PM((res, rej)=>{
				return new request({
					uri: `http://newlyric.kuwo.cn/newlyric.lrc?${song.lyric}`,
					encoding: null
				}, (err, response, body)=>{
					// 分离并解压、转码文件
					if(!err && response.statusCode === 200) {
						let location = body.toString().indexOf("\r\n\r\n");
						zlib.unzip(body.slice(location+4), (err, buffer) => {
						  if (!err) {
						    res(iconv.decode(buffer, 'GB2312'))
						  } else {
						    rej(err)
						  }
						});
					} else {
						rej({err:err, status: response.statusMessage})
					}

				});
			})
		})
}

module.exports = {
	song: fetchSong,
	lyric: fetchLyric,
	full: fetchSongData
}