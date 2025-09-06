// app/types/game.ts

export type CandyType = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'empty';

export interface Position {
  row: number;
  col: number;
}

export type SwipeDirection = 'up' | 'down' | 'left' | 'right';

export interface GameState {
  board: CandyType[][];
  score: number;
  movesLeft: number;
  movesMade: number;
  selectedCandy: Position | null;
  isAnimating: boolean;
  matches: Position[];
}

export interface Match {
  positions: Position[];
  type: 'horizontal' | 'vertical' | 'square' | 'l-shape' | 't-shape';
  length: number;
}

export type GameAction =
  | { type: 'ATTEMPT_SWAP'; payload: { from: Position; direction: SwipeDirection } }
  | { type: 'SELECT_CANDY'; payload: { position: Position } }
  | { type: 'CHECK_MATCHES' }
  | { type: 'CLEAR_MATCHES'; payload: { matches: Position[] } }
  | { type: 'DROP_CANDIES' }
  | { type: 'FILL_BOARD' }
  | { type: 'SET_ANIMATING'; payload: { isAnimating: boolean } }
  | { type: 'RESTART_GAME' };