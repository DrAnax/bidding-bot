const cardScore = {
  A: 14,
  K: 13,
  Q: 12,
  J: 11,
  T: 10,
  '9': 9,
  '8': 8,
  '7': 7,
  '6': 6,
  '5': 5,
  '4': 4,
  '3': 3,
  '2': 2,
}

const vulnerability = [
  'none', 'ns', 'ew', 'all',
  'ns', 'ew', 'all', 'none',
  'ew', 'all', 'none', 'ns',
  'all', 'none', 'ns', 'ew',
]

export function pbnParser(pbn, boardNumber) {
  // Check if the string is in the correct format
  const regex = /^([NSWE]):([2-9AKQJT.]{16}) ([2-9AKQJT.]{16}) ([2-9AKQJT.]{16}) ([2-9AKQJT.]{16})$/;

  let deal;
  let dealer;
  let hands = [];
  let startingPlayer = 0;

  const deck = [
    ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'],
    ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'],
    ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'],
    ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'],
  ];

  if ((deal = regex.exec(pbn)) !== null) {
    // The result can be accessed through the `m`-variable.
    deal.forEach((match, groupIndex) => {
      if (groupIndex == 1) {
        dealer = match;
      } else if (groupIndex > 1) {
        hands.push(match);
      }
    });
  } else {
    return null;
  }

  // rotate hands array based on the value of dealer
  if (dealer == 'E') {
    hands = [hands[3], hands[0], hands[1], hands[2]];
    startingPlayer = 3;
  } else if (dealer == 'S') {
    hands = [hands[2], hands[3], hands[0], hands[1]];
    startingPlayer = 2;
  } else if (dealer == 'W') {
    hands = [hands[1], hands[2], hands[3], hands[0]];
    startingPlayer = 1;
  }

  hands = hands.map((hand) => {
    if (hand == '-') return null;

    let suits = hand.split('.');
    if (suits.length != 4) return null;

    let count = 0;
    suits = suits.map((suit) => {
      suit = suit.split('')
        .sort((card1, card2) => cardScore[card2] - cardScore[card1])
        .map((card) => {
          if (!deck[count].includes(card)) return null;
          const index = deck[count].indexOf(card);
          deck[count].splice(index, 1);
          return card;
        })
        .join('');
      count++;
      return suit;
    });

    startingPlayer = startingPlayer % 4;

    return {
      position: startingPlayer++ + 1,
      spades: suits[0],
      hearts: suits[1],
      diamonds: suits[2],
      clubs: suits[3],
    };
  });

  if (deck.join('').length != 0) return null;

  return {
    source: pbn,
    board: boardNumber,
    dealer: dealer,
    vulnerability: vulnerability[(boardNumber - 1) % 16],
    north: hands[0],
    east: hands[1],
    south: hands[2],
    west: hands[3],
  };
}