export type QuestionType = 
  | 'line-equation-from-graph' 
  | 'slope-from-points' 
  | 'y-intercept-from-points' 
  | 'equation-from-points' 
  | 'point-on-line';

export interface Point {
  x: number;
  y: number;
}

export interface Line {
  slope: number;
  yIntercept: number;
}

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  question: string;
  correctAnswer: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface LineEquationFromGraphQuestion extends BaseQuestion {
  type: 'line-equation-from-graph';
  line: Line;
  points: Point[];
}

export interface SlopeFromPointsQuestion extends BaseQuestion {
  type: 'slope-from-points';
  point1: Point;
  point2: Point;
}

export interface YInterceptFromPointsQuestion extends BaseQuestion {
  type: 'y-intercept-from-points';
  point1: Point;
  point2: Point;
}

export interface EquationFromPointsQuestion extends BaseQuestion {
  type: 'equation-from-points';
  point1: Point;
  point2: Point;
}

export interface PointOnLineQuestion extends BaseQuestion {
  type: 'point-on-line';
  line: Line;
  testPoint: Point;
}

export type Question = 
  | LineEquationFromGraphQuestion 
  | SlopeFromPointsQuestion 
  | YInterceptFromPointsQuestion 
  | EquationFromPointsQuestion 
  | PointOnLineQuestion;

export interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  isComplete: boolean;
  seed: number;
  questionCount: number;
}