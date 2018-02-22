const cheerio = require('cheerio');
const Promise = require('bluebird');
const request = Promise.promisifyAll(require('request'), {multiArgs: true});

const parseList = async (html)=> {
    let $ = cheerio.load(html);
    let artist = [$('#album_info table tr').eq(0).find('td').eq(1).text().trim()];
    let list = $('#track_list .song_name a:not(.show_zhcn)[title]');
    $('h1 span').empty();
    let albumName = $('h1').text().trim();
    let playlist = [];
    list.each(function(idx, item) {
        item = $(item);
        playlist.push({
            title: item.text(),
            mid: item.attr('href').replace('/song/', ''),
            artist,
            duration: 0
        })
    });
    return {name: albumName, list: playlist};
}

const getList = async (id, proxy)=> {
    let [response, html] = await request.getAsync({
       uri: `http://www.xiami.com/album/${id}`,
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
