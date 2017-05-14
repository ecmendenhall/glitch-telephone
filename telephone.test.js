const telephone = require('./telephone');

describe('Telephone', () => {

  test('tokenizes the given phrase', () => {
    const phrase = "buddy, they won't even let me";
    expect(telephone.tokenize(phrase)).toEqual(
      ['buddy', ',', 'they', "won't", 'even', 'let', 'me']
    )
  });

  test('shuffles tokens', () => {
    const tokens = ['buddy', 'they', "wont", 'even', 'let', 'me'];
    const shuffledTokens = telephone.shuffleTokens(tokens);
    expect(shuffledTokens).not.toEqual(tokens);
    for (const token of tokens) {
      expect(shuffledTokens).toContain(token);
    }
  });

  test('picks a word', () => {
    const tokens = ['roflcopter', 'buddy', 'they', "wont", 'even', 'let', 'me'];
    expect(telephone.pickWord(tokens)).toBe('buddy');
  });

  test('generates mutations for the word', () => {
    return telephone.loadModel().then((model) => {
      expect(telephone.mutations('buddy', model)).toEqual({
        word: 'buddy',
        mutations: [
          "buddie",
          "buddy",
          "budny",
          "budke",
          "budney",
          "bunney",
          "bussey",
          "bussi",
          "bussie",
          "busey(1)",
          "buffy",
          "buzzy",
          "bucky",
          "buckey",
          "buggy",
          "bunnie",
          "bunny",
          "bovee",
          "boddy",
          "boddie"
        ]});
      });
  });

  test('replaces a word in the phrase', () => {
    expect(
      telephone.applyMutation(
        'buddy, they wont even let me',
        {word: 'buddy', mutations: ["buoy(3)"]}
    )).toEqual(
      'buoy, they wont even let me'
    );
  });

  test('only replaces full words', () => {
    expect(
      telephone.applyMutation(
        "He bit my itty-bitty fitbit! Don't do it!",
        {word: 'it', mutations: ['that']}
    )).toEqual(
      "He bit my itty- bitty fitbit! Don't do that!"
    );
  });

});
