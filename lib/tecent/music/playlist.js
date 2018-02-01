const request = require('bluebird').promisifyAll(require('request'), {multiArgs: true});

const parseList = async(data)=> {
    let {dissname, songlist} = data.cdlist[0];
    songlist = songlist.map(song=>{
        return {
            title: song.songname,
            mid: song.songmid,
            duration: song.switch / 1000,
            artist: song.singer.map(singer=>singer.name)
        };
    });
    return {
        name: dissname,
        list: songlist
    }
}
/**
 * get the playlist
 * @param  {String} id    playlist id
 * @param  {String} proxy proxy
 * @return {Array}        the playlist
 */
const getList = async(id, proxy)=>{
    function playlistinfoCallback(data) {
        return data;
    }

    try {
        let [response, html] = await request.getAsync({
           uri: `https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg?type=1&json=1&utf8=1&onlysong=0&disstid=${id}&format=jsonp&g_tk=5381&jsonpCallback=playlistinfoCallback&loginUin=0&hostUin=0&format=jsonp&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0`,
           headers: {
               Referer: 'https://y.qq.com/',
               'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'
           },
           proxy: proxy
        });

        if(response.statusCode !== 200) {
            throw Error({code: response.statusCode, status: response.statusMessage});
        } else {
            return parseList(eval(html));
        }
    } catch(e) {
        throw(e);
    }
}

module.exports = {
    parse: parseList,
    get: getList
}