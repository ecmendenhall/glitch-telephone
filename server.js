const instantBot = require('instant-bot');
const jsdom = require('jsdom');
const dom = new jsdom.JSDOM();
const $ = require('jquery')(dom.window);
const telephone = require('./telephone');

instantBot({host: 'glitch', service: 'mastodon', rate: '1 hour'}, (bot) => {

  console.log('running drilophone...');

  const lastPost = bot.recentPosts[0]
  if(lastPost) {
    const lastPostText = $(lastPost.content).text();
    telephone.loadModel().then((model) => {
      const newPost = telephone.mutate(lastPostText, model);
      bot.post(newPost);
    });
  } else {
    bot.post("another day volunteering at the betsy ross museum. everyone keeps asking me if they can fuck the flag. buddy, they wont even let me fuck it")
  }

});
