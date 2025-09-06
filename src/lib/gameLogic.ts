// app/lib/gameLogic.ts
import { GameState, GameAction, CandyType, Position, SwipeDirection, Match } from '../types/game';

const CANDY_TYPES: CandyType[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

export const initialGameState = (boardSize: number): GameState => ({
  board: generateInitialBoard(boardSize),
  score: 0,
  movesLeft: 30,
  movesMade: 0,
  selectedCandy: null,
  isAnimating: false,
  matches: []
});

function generateInitialBoard(size: number): CandyType[][] {
  const board: CandyType[][] = [];
  
  for (let row = 0; row < size; row++) {
    board[row] = [];
    for (let col = 0; col < size; col++) {
      // Generate candy ensuring no initial matches
      let candy: CandyType;
      do {
        candy = CANDY_TYPES[Math.floor(Math.random() * CANDY_TYPES.length)];
      } while (wouldCreateInitialMatch(board, row, col, candy));
      
      board[row][col] = candy;
    }
  }
  
  return board;
}

function wouldCreateInitialMatch(board: CandyType[][], row: number, col: number, candy: CandyType): boolean {
  // Check horizontal match (3 in a row)
  if (col >= 2 && 
      board[row][col - 1] === candy && 
      board[row][col - 2] === candy) {
    return true;
  }
  
  // Check vertical match (3 in a column)
  if (row >= 2 && 
      board[row - 1][col] === candy && 
      board[row - 2][col] === candy) {
    return true;
  }
  
  return false;
}

function getAdjacentPosition(pos: Position, direction: SwipeDirection): Position {
  switch (direction) {
    case 'up': return { row: pos.row - 1, col: pos.col };
    case 'down': return { row: pos.row + 1, col: pos.col };
    case 'left': return { row: pos.row, col: pos.col - 1 };
    case 'right': return { row: pos.row, col: pos.col + 1 };
  }
}

function isValidPosition(pos: Position, boardSize: number): boolean {
  return pos.row >= 0 && pos.row < boardSize && pos.col >= 0 && pos.col < boardSize;
}

function swapCandies(board: CandyType[][], pos1: Position, pos2: Position): CandyType[][] {
  const newBoard = board.map(row => [...row]);
  const temp = newBoard[pos1.row][pos1.col];
  newBoard[pos1.row][pos1.col] = newBoard[pos2.row][pos2.col];
  newBoard[pos2.row][pos2.col] = temp;
  return newBoard;
}

function findMatches(board: CandyType[][]): Match[] {
  const matches: Match[] = [];
  const boardSize = board.length;
  const visited = new Set<string>();

  // Find horizontal matches (3+ in a row)
  for (let row = 0; row < boardSize; row++) {
    let currentCandy = board[row][0];
    let currentLength = 1;
    let startCol = 0;

    for (let col = 1; col <= boardSize; col++) {
      if (col < boardSize && board[row][col] === currentCandy && currentCandy !== 'empty') {
        currentLength++;
      } else {
        if (currentLength >= 3) {
          const positions: Position[] = [];
          for (let i = startCol; i < startCol + currentLength; i++) {
            positions.push({ row, col: i });
            visited.add(`${row}-${i}`);
          }
          matches.push({
            positions,
            type: 'horizontal',
            length: currentLength
          });
        }
        
        if (col < boardSize) {
          currentCandy = board[row][col];
          currentLength = 1;
          startCol = col;
        }
      }
    }
  }

  // Find vertical matches (3+ in a column)
  for (let col = 0; col < boardSize; col++) {
    let currentCandy = board[0][col];
    let currentLength = 1;
    let startRow = 0;

    for (let row = 1; row <= boardSize; row++) {
      if (row < boardSize && board[row][col] === currentCandy && currentCandy !== 'empty') {
        currentLength++;
      } else {
        if (currentLength >= 3) {
          const positions: Position[] = [];
          for (let i = startRow; i < startRow + currentLength; i++) {
            positions.push({ row: i, col });
            visited.add(`${i}-${col}`);
          }
          matches.push({
            positions,
            type: 'vertical',
            length: currentLength
          });
        }
        
        if (row < boardSize) {
          currentCandy = board[row][col];
          currentLength = 1;
          startRow = row;
        }
      }
    }
  }

  // Find 2x2 square matches
  for (let row = 0; row < boardSize - 1; row++) {
    for (let col = 0; col < boardSize - 1; col++) {
      const candy = board[row][col];
      if (candy !== 'empty' &&
          board[row][col + 1] === candy &&
          board[row + 1][col] === candy &&
          board[row + 1][col + 1] === candy) {
        
        const positions = [
          { row, col },
          { row, col: col + 1 },
          { row: row + 1, col },
          { row: row + 1, col: col + 1 }
        ];

        matches.push({
          positions,
          type: 'square',
          length: 4
        });
      }
    }
  }

  return matches;
}

function dropCandies(board: CandyType[][]): CandyType[][] {
  const newBoard = board.map(row => [...row]);
  const boardSize = newBoard.length;

  for (let col = 0; col < boardSize; col++) {
    // Collect non-empty candies from bottom to top
    const nonEmptyCandies: CandyType[] = [];
    for (let row = boardSize - 1; row >= 0; row--) {
      if (newBoard[row][col] !== 'empty') {
        nonEmptyCandies.push(newBoard[row][col]);
      }
    }

    // Fill column from bottom with non-empty candies
    for (let row = boardSize - 1; row >= 0; row--) {
      if (row >= boardSize - nonEmptyCandies.length) {
        newBoard[row][col] = nonEmptyCandies[boardSize - 1 - row];
      } else {
        newBoard[row][col] = 'empty';
      }
    }
  }

  return newBoard;
}

function fillEmptySpaces(board: CandyType[][]): CandyType[][] {
  const newBoard = board.map(row => [...row]);
  const boardSize = newBoard.length;

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      if (newBoard[row][col] === 'empty') {
        newBoard[row][col] = CANDY_TYPES[Math.floor(Math.random() * CANDY_TYPES.length)];
      }
    }
  }

  return newBoard;
}

function calculateScore(matches: Match[]): number {
  let score = 0;
  
  matches.forEach(match => {
    // Base score
    score += match.positions.length * 10;
    
    // Bonus for special matches
    if (match.type === 'square') score += 50;
    if (match.length >= 4) score += 30;
    if (match.length >= 5) score += 70;
  });
  
  return score;
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SELECT_CANDY':
      return {
        ...state,
        selectedCandy: state.selectedCandy?.row === action.payload.position.row &&
                      state.selectedCandy?.col === action.payload.position.col
                      ? null
                      : action.payload.position
      };

    case 'ATTEMPT_SWAP': {
      if (state.movesLeft <= 0 || state.isAnimating) return state;

      const { from, direction } = action.payload;
      const to = getAdjacentPosition(from, direction);

      if (!isValidPosition(to, state.board.length)) return state;

      // Optimistic swap
      const swappedBoard = swapCandies(state.board, from, to);
      const matches = findMatches(swappedBoard);

      if (matches.length > 0) {
        return {
          ...state,
          board: swappedBoard,
          movesLeft: state.movesLeft - 1,
          movesMade: state.movesMade + 1,
          selectedCandy: null,
          isAnimating: true,
          matches: matches.flatMap(match => match.positions)
        };
      }

      // Invalid swap - no matches found
      return state;
    }

    case 'CHECK_MATCHES': {
      if (state.isAnimating) return state;

      const matches = findMatches(state.board);
      
      if (matches.length > 0) {
        // Clear matches and update score
        const newBoard = state.board.map(row => [...row]);
        const allMatchPositions = matches.flatMap(match => match.positions);
        
        allMatchPositions.forEach(pos => {
          newBoard[pos.row][pos.col] = 'empty';
        });

        const newScore = state.score + calculateScore(matches);
        
        return {
          ...state,
          board: newBoard,
          score: newScore,
          isAnimating: true,
          matches: allMatchPositions
        };
      }

      return {
        ...state,
        isAnimating: false,
        matches: []
      };
    }

    case 'DROP_CANDIES': {
      const droppedBoard = dropCandies(state.board);
      const filledBoard = fillEmptySpaces(droppedBoard);
      
      return {
        ...state,
        board: filledBoard,
        isAnimating: false
      };
    }

    case 'SET_ANIMATING':
      return {
        ...state,
        isAnimating: action.payload.isAnimating
      };

    case 'RESTART_GAME':
      return initialGameState(state.board.length);

    default:
      return state;
  }
}