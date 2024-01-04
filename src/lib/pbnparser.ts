import type { Board } from './types/Board';
import type { PlayerHand } from './types/PlayerHand';
import { CardScore } from './utils/CardScore';

const vulnerability: Array<string> = [
  'none',
  'ns',
  'ew',
  'all',
  'ns',
  'ew',
  'all',
  'none',
  'ew',
  'all',
  'none',
  'ns',
  'all',
  'none',
  'ns',
  'ew'
];

function countHCP(hand: string): number {
  return (
    (hand.match(/A/g) || []).length * 4 +
    (hand.match(/K/g) || []).length * 3 +
    (hand.match(/Q/g) || []).length * 2 +
    (hand.match(/J/g) || []).length * 1
  );
}

function countSuitLengthPonts(suit: string): number {
  return Math.min(Math.max(suit.length - 4, 0), 3);
}

function countLP(spades: string, hearts: string, diamonds: string, clubs: string): number {
  return (
    countSuitLengthPonts(spades) +
    countSuitLengthPonts(hearts) +
    countSuitLengthPonts(diamonds) +
    countSuitLengthPonts(clubs)
  );
}

export default function PBNParser(pbn: string, boardNumber: number): Board | null {
  // Check if the string is in the correct format
  const regex =
    /^([NSWE]):([2-9AKQJT.]{16}) ([2-9AKQJT.]{16}) ([2-9AKQJT.]{16}) ([2-9AKQJT.]{16})$/;

  let deal: RegExpExecArray | null;
  let dealer: string = '';
  let hands: Array<string> = [];
  let startingPlayer: number = 0;

  const deck: Array<Array<string>> = [
    ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'],
    ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'],
    ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'],
    ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A']
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

  const playerHands: Array<PlayerHand | null> = hands.map((hand) => {
    if (hand == '-') return null;

    let suits = hand?.split('.');
    if (suits.length != 4) return null;

    let count = 0;
    suits = suits.map((suit) => {
      suit = suit
        .split('')
        .sort((card1, card2) => CardScore[card2] - CardScore[card1])
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

    const hcp = countHCP(suits.join(''));
    const length = countLP(suits[0], suits[1], suits[2], suits[3]);
    const valuation = hcp + length;

    return {
      position: startingPlayer++ + 1,
      spades: suits[0],
      hearts: suits[1],
      diamonds: suits[2],
      clubs: suits[3],
      hcp,
      length,
      valuation
    };
  });

  if (deck.join('').length != 0) return null;

  return {
    source: pbn,
    board: boardNumber,
    dealer: dealer,
    vulnerability: vulnerability[(boardNumber - 1) % 16],
    north: playerHands[0],
    east: playerHands[1],
    south: playerHands[2],
    west: playerHands[3]
  };
}
