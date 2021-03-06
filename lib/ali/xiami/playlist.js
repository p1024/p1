const cheerio = require('cheerio');
const Promise = require('bluebird');
const request = Promise.promisifyAll(require('request'), {multiArgs: true});

const parseList = async (html)=> {
    let $ = cheerio.load(html);
    let list = $('.quote_song_list .song_name');
    $('h2 span').empty();
    let albumName = $('h2').text().trim();
    let playlist = [];
    list.each(function(idx, item) {
        let alist = $(item).find('a');
        let song = {artist:[]};
        alist.each(function(idx, alink) {
            alink = $(alink);
          if(idx) {
            let txt = alink.text().trim();
            if(txt !== 'MV') song.artist.push(txt);
          } else {
            song.title = alink.text().trim();
            song.mid = alink.attr('href').replace('/song/', '');
            song.duration = 0;
          }
        }); 
        playlist.push(song);
    });
    return {name: albumName, list: playlist};
}

const getList = async (id, proxy)=> {
    let [response, html] = await request.getAsync({
       uri: `http://www.xiami.com/collect/${id}`,
       headers: {
           // Host: 'music.163.com',
           // Referer: 'http://music.163.com/',
           'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'
       },
       proxy: proxy
    });

    if(response.statusCode !== 200) {
        throw Error({code: response.statusCode, status: response.statusMessage});
    }

    return parseList(html);
}

module.exports = {
    get: getList,
    parse: parseList
};