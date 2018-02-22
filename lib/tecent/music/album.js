const request = require('bluebird').promisifyAll(require('request'), {multiArgs: true});

const parseAlbum = async(data)=> {
    let {list: songlist} = data.data;
    songlist = songlist.map(song=>{
        return {
            title: song.songname,
            mid: song.songmid,
            duration: song.interval,
            artist: song.singer.map(singer=>singer.name)
        };
    });
    return {
        name: data.data.list[0].albumname,
        list: songlist
    }
}
/**
 * get the playlist
 * @param  {String} id    playlist id
 * @param  {String} proxy proxy
 * @return {Array}        the playlist
 */
const getAlbum = async(id, proxy)=>{
    function albuminfoCallback(data) {
        return data;
    }

    let [response, html] = await request.getAsync({
       uri: `https://c.y.qq.com/v8/fcg-bin/fcg_v8_album_info_cp.fcg?albummid=${id}&g_tk=5381&jsonpCallback=albuminfoCallback&loginUin=0&hostUin=0&format=jsonp&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0`,
       headers: {
           Referer: 'https://y.qq.com/',
           'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'
       },
       proxy: proxy
    });

    if(response.statusCode !== 200) {
        throw Error({code: response.statusCode, status: response.statusMessage});
    } else {
        return parseAlbum(eval(html));
    }
}

module.exports = {
    parse: parseAlbum,
    get: getAlbum
};