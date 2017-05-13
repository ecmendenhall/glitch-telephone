const chewiePics = require('chewie-pics');
const assets = require('npm-assets');
const fs = require('fs');
const instantBot = require('instant-bot');

assets(process.cwd(), 'assets');

const loadChewiePic = () => {
    return `./assets/` + chewiePics.random();
}

const loadChewiePicData = () => {
    return fs.readFileSync(loadChewiePic(), {encoding: 'base64'});
}


instantBot({host: 'glitch', rate: '5m'}, (bot) => {

  console.log('running chewie pics...');

  bot.client.post('media/upload', {media_data: loadChewiePicData()}).then((res) => {
    console.log(res.data);
    return res.data.media_id_string;
  }).then((id) => {
    return bot.client.post('statuses/update', {status: "🐶", media_ids: [id]});
  });

});
