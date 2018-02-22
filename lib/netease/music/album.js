const cheerio = require('cheerio');
const Promise = require('bluebird');
const request = Promise.promisifyAll(require('request'), {multiArgs: true});

const parseAlbum = (html)=> {
    let $ = cheerio.load(html);
    let albumName = $('h2').text().trim();
    let cacheContainer = $('#song-list-pre-cache');
    let dataContainer = cacheContainer.find('textarea').eq(0);

    let playList = JSON.parse(dataContainer.val());
    // 如果歌曲有版权，咁st就系0，否则就系-200
    playList = playList.filter(song=>song.privilege.st===0).map(song=>{
        return {
            title: song.name,
            mid: song.id,
            duration: song.duration / 1000,
            artist: song.artists.map(artist=>artist.name)
        };
    });

    return {name: albumName, list: playList};
}

/**
 * get the album
 * @param  {String} id    album id
 * @param  {String} proxy proxy
 * @return {Array}        the album
 */
const getAlbum = async (id, proxy)=> {
     let [, html] = await request.getAsync({
        uri: 'http://music.163.com/album?id='+id,
        headers: {
            Host: 'music.163.com',
            Referer: 'http://music.163.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'
        },
        proxy: proxy
     });
     return parseAlbum(html);
}


module.exports = {
    get: getAlbum,
    parse: parseAlbum
};