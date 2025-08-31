import { SeededRandom } from './seedRandom';
import { Question, QuestionType, Point, Line } from '@/types/quiz';

export class QuestionGenerator {
  private rng: SeededRandom;
  
  constructor(seed: number) {
    this.rng = new SeededRandom(seed);
  }
  
  private generateRandomPoints(): [Point, Point] {
    const x1 = this.rng.nextInt(-8, 8);
    const y1 = this.rng.nextInt(-8, 8);
    let x2 = this.rng.nextInt(-8, 8);
    let y2 = this.rng.nextInt(-8, 8);
    
    // Ensure points are different
    while (x1 === x2 && y1 === y2) {
      x2 = this.rng.nextInt(-8, 8);
      y2 = this.rng.nextInt(-8, 8);
    }
    
    return [{ x: x1, y: y1 }, { x: x2, y: y2 }];
  }
  
  private calculateSlope(p1: Point, p2: Point): number {
    if (p1.x === p2.x) return Infinity; // Vertical line
    return (p2.y - p1.y) / (p2.x - p1.x);
  }
  
  private calculateYIntercept(p1: Point, slope: number): number {
    return p1.y - slope * p1.x;
  }
  
  private lineToEquation(line: Line): string {
    const { slope, yIntercept } = line;
    
    if (slope === 0) {
      return `y = ${yIntercept}`;
    }
    
    if (slope === 1) {
      return yIntercept >= 0 ? `y = x + ${yIntercept}` : `y = x - ${Math.abs(yIntercept)}`;
    }
    
    if (slope === -1) {
      return yIntercept >= 0 ? `y = -x + ${yIntercept}` : `y = -x - ${Math.abs(yIntercept)}`;
    }
    
    const slopeStr = Number.isInteger(slope) ? slope.toString() : 
                     slope > 0 ? `${slope.toFixed(2)}` : slope.toFixed(2);
    
    if (yIntercept === 0) {
      return `y = ${slopeStr}x`;
    }
    
    return yIntercept > 0 ? `y = ${slopeStr}x + ${yIntercept}` : `y = ${slopeStr}x - ${Math.abs(yIntercept)}`;
  }
  
  generateLineEquationFromGraph(id: string): Question {
    // Generate a simple line with nice slope and y-intercept
    const slopes = [-2, -1, -0.5, 0.5, 1, 2];
    const yIntercepts = [-3, -2, -1, 0, 1, 2, 3];
    
    const slope = this.rng.pick(slopes);
    const yIntercept = this.rng.pick(yIntercepts);
    
    const line: Line = { slope, yIntercept };
    
    // Generate two points on the line for reference
    const x1 = this.rng.nextInt(-5, 5);
    const y1 = slope * x1 + yIntercept;
    const x2 = x1 + this.rng.nextInt(1, 4);
    const y2 = slope * x2 + yIntercept;
    
    const points: Point[] = [{ x: x1, y: y1 }, { x: x2, y: y2 }];
    
    return {
      id,
      type: 'line-equation-from-graph',
      question: 'What is the equation of the line shown in the graph?',
      correctAnswer: this.lineToEquation(line),
      line,
      points
    };
  }
  
  generateSlopeFromPoints(id: string): Question {
    const [point1, point2] = this.generateRandomPoints();
    const slope = this.calculateSlope(point1, point2);
    
    return {
      id,
      type: 'slope-from-points',
      question: `Find the slope of the line passing through points (${point1.x}, ${point1.y}) and (${point2.x}, ${point2.y}).`,
      correctAnswer: slope === Infinity ? 'undefined' : slope.toString(),
      point1,
      point2
    };
  }
  
  generateYInterceptFromPoints(id: string): Question {
    const [point1, point2] = this.generateRandomPoints();
    
    // Ensure we don't get a vertical line
    while (point1.x === point2.x) {
      const [newPoint1, newPoint2] = this.generateRandomPoints();
      point1.x = newPoint1.x;
      point1.y = newPoint1.y;
      point2.x = newPoint2.x;
      point2.y = newPoint2.y;
    }
    
    const slope = this.calculateSlope(point1, point2);
    const yIntercept = this.calculateYIntercept(point1, slope);
    
    return {
      id,
      type: 'y-intercept-from-points',
      question: `Find the y-intercept of the line passing through points (${point1.x}, ${point1.y}) and (${point2.x}, ${point2.y}).`,
      correctAnswer: yIntercept.toString(),
      point1,
      point2
    };
  }
  
  generateEquationFromPoints(id: string): Question {
    const [point1, point2] = this.generateRandomPoints();
    
    // Ensure we don't get a vertical line for simplicity
    while (point1.x === point2.x) {
      const [newPoint1, newPoint2] = this.generateRandomPoints();
      point1.x = newPoint1.x;
      point1.y = newPoint1.y;
      point2.x = newPoint2.x;
      point2.y = newPoint2.y;
    }
    
    const slope = this.calculateSlope(point1, point2);
    const yIntercept = this.calculateYIntercept(point1, slope);
    const line: Line = { slope, yIntercept };
    
    return {
      id,
      type: 'equation-from-points',
      question: `Find the equation of the line passing through points (${point1.x}, ${point1.y}) and (${point2.x}, ${point2.y}).`,
      correctAnswer: this.lineToEquation(line),
      point1,
      point2
    };
  }
  
  generatePointOnLine(id: string): Question {
    // Generate a line
    const slopes = [-2, -1, -0.5, 0, 0.5, 1, 2];
    const yIntercepts = [-3, -2, -1, 0, 1, 2, 3];
    
    const slope = this.rng.pick(slopes);
    const yIntercept = this.rng.pick(yIntercepts);
    const line: Line = { slope, yIntercept };
    
    // Generate a test point (50% chance it's on the line)
    const isOnLine = this.rng.next() < 0.5;
    let testPoint: Point;
    
    if (isOnLine) {
      const x = this.rng.nextInt(-5, 5);
      const y = slope * x + yIntercept;
      testPoint = { x, y };
    } else {
      const x = this.rng.nextInt(-5, 5);
      let y = slope * x + yIntercept;
      y += this.rng.nextInt(1, 3) * (this.rng.next() < 0.5 ? 1 : -1); // Offset by 1-3
      testPoint = { x, y };
    }
    
    return {
      id,
      type: 'point-on-line',
      question: `Is the point (${testPoint.x}, ${testPoint.y}) on the line ${this.lineToEquation(line)}?`,
      correctAnswer: isOnLine ? 'yes' : 'no',
      line,
      testPoint
    };
  }
  
  generateQuestion(type: QuestionType, id: string): Question {
    switch (type) {
      case 'line-equation-from-graph':
        return this.generateLineEquationFromGraph(id);
      case 'slope-from-points':
        return this.generateSlopeFromPoints(id);
      case 'y-intercept-from-points':
        return this.generateYInterceptFromPoints(id);
      case 'equation-from-points':
        return this.generateEquationFromPoints(id);
      case 'point-on-line':
        return this.generatePointOnLine(id);
      default:
        throw new Error(`Unknown question type: ${type}`);
    }
  }
  
  generateQuiz(questionCount: number): Question[] {
    const questionTypes: QuestionType[] = [
      'line-equation-from-graph',
      'slope-from-points', 
      'y-intercept-from-points',
      'equation-from-points',
      'point-on-line'
    ];
    
    const questions: Question[] = [];
    
    for (let i = 0; i < questionCount; i++) {
      const type = this.rng.pick(questionTypes);
      const question = this.generateQuestion(type, `q-${i + 1}`);
      questions.push(question);
    }
    
    return questions;
  }
}