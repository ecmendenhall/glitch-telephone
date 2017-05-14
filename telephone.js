const dictionary = require('cmu-pronouncing-dictionary');
const natural = require('natural');
const pos = require('pos');
const w2v = require('word2vec');
const _ = require('lodash');

function loadModel() {
  return new Promise((resolve, reject) => {
    w2v.loadModel('drilmodel.txt', (err, model) => {
      if (err) {
        reject(err);
      }
      if (model) {
        resolve(model);
      }
    });
  });
}

function tokenize(phrase) {
  const tokenizer = new natural.WordPunctTokenizer();
  const tokens = tokenizer.tokenize(phrase);
  return tokens.reduce((acc, val) => {
    const lastItem = acc[acc.length - 1];
    if (val === "'") {
      acc[acc.length - 1] = lastItem + val;
      return acc;
    } else if (lastItem && lastItem.slice(-1) === "'") {
      acc[acc.length - 1] = lastItem + val;
      return acc;
    } else {
      return acc.concat(val);
    }
  },
  []).map((t) => t.trim());
}

function shuffleTokens(tokens) {
  return _.shuffle(tokens);
}

function pickWord(tokens) {
  for (const token of tokens) {
    if (token in dictionary) {
      return token
    }
  }
}

function mutations(word, model) {
  const tagger = new pos.Tagger();
  const partOfSpeech = tagger.tag([word])[0][1];
  const distances = _.map(dictionary, (v, k) => {
    return {
      phonetic_similarity: natural.JaroWinklerDistance(dictionary[word], v),
      semantic_similarity: model.similarity(word, k) || 0.0,
      word: k,
      pos: tagger.tag([k])[0][1]
    };
  }).filter(
    (i) => i.pos === partOfSpeech
  ).sort(
    (a, b) => (b.phonetic_similarity * 2 + b.semantic_similarity) - (a.phonetic_similarity * 2 + a.semantic_similarity)
  );
  return {word: word, mutations: distances.slice(0, 20).map((i) => i.word)};
}

function applyMutation(phrase, mutation) {
  let replacement = shuffleTokens(mutation.mutations)[0].replace(/\(\d\)/, '');
  let tokens = tokenize(phrase);
  let replaced = false;
  let mutatedTokens = tokens.reduce((acc, t) => {
    if (t === mutation.word && !replaced) {
      replaced = true;
      return acc.concat(replacement);
    } else {
      return acc.concat(t);
    }
  }, []);
  const tagger = new pos.Tagger();
  const taggedTokens = tagger.tag(mutatedTokens);
  return taggedTokens.reduce((acc, t) => {
    let token = t[0];
    let partOfSpeech = t[1];
    let punctuation = [',', '.', ':', '$', '#', '(', ')', '!'];
    if (punctuation.includes(partOfSpeech) || acc === '') {
      return acc + token
    } else {
      return acc + ` ${token}`
    }
  }, '');
}


function mutate(phrase, model) {
  const mutation = mutations(pickWord(shuffleTokens(tokenize(phrase))), model);
  return applyMutation(phrase, mutation);
}


module.exports = {
  tokenize: tokenize,
  shuffleTokens: shuffleTokens,
  pickWord: pickWord,
  mutations: mutations,
  applyMutation: applyMutation,
  mutate: mutate,
  loadModel: loadModel
}
