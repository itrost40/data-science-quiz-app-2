import { useState } from 'react';
import { Question } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LineGraph from './LineGraph';

interface QuizQuestionProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: string) => void;
  showResult?: boolean;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  showResult = false
}) => {
  const [answer, setAnswer] = useState(question.userAnswer || '');
  
  const handleSubmit = () => {
    if (answer.trim()) {
      onAnswer(answer.trim());
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };
  
  const renderQuestionContent = () => {
    switch (question.type) {
      case 'line-equation-from-graph':
        return (
          <div className="space-y-6">
            <LineGraph 
              line={question.line} 
              points={question.points}
              width={500}
              height={400}
            />
            <p className="text-muted-foreground text-sm">
              Enter your answer in the form: y = mx + b (e.g., "y = 2x + 1" or "y = -0.5x - 3")
            </p>
          </div>
        );
        
      case 'slope-from-points':
        return (
          <div className="space-y-4">
            <div className="bg-surface-variant p-4 rounded-lg">
              <p className="text-lg">
                Point 1: <span className="math-equation">({question.point1.x}, {question.point1.y})</span>
              </p>
              <p className="text-lg">
                Point 2: <span className="math-equation">({question.point2.x}, {question.point2.y})</span>
              </p>
            </div>
            <p className="text-muted-foreground text-sm">
              Enter the slope as a number (e.g., "2", "-0.5", or "undefined" for vertical lines)
            </p>
          </div>
        );
        
      case 'y-intercept-from-points':
        return (
          <div className="space-y-4">
            <div className="bg-surface-variant p-4 rounded-lg">
              <p className="text-lg">
                Point 1: <span className="math-equation">({question.point1.x}, {question.point1.y})</span>
              </p>
              <p className="text-lg">
                Point 2: <span className="math-equation">({question.point2.x}, {question.point2.y})</span>
              </p>
            </div>
            <p className="text-muted-foreground text-sm">
              Enter the y-intercept as a number (e.g., "3", "-2", "0")
            </p>
          </div>
        );
        
      case 'equation-from-points':
        return (
          <div className="space-y-4">
            <div className="bg-surface-variant p-4 rounded-lg">
              <p className="text-lg">
                Point 1: <span className="math-equation">({question.point1.x}, {question.point1.y})</span>
              </p>
              <p className="text-lg">
                Point 2: <span className="math-equation">({question.point2.x}, {question.point2.y})</span>
              </p>
            </div>
            <p className="text-muted-foreground text-sm">
              Enter the equation in the form: y = mx + b (e.g., "y = 2x + 1")
            </p>
          </div>
        );
        
      case 'point-on-line':
        return (
          <div className="space-y-4">
            <div className="bg-surface-variant p-4 rounded-lg">
              <p className="text-lg">
                Line: <span className="math-equation">{question.correctAnswer === 'yes' ? 
                  'y = ' + question.line.slope + 'x + ' + question.line.yIntercept : 
                  'y = ' + question.line.slope + 'x + ' + question.line.yIntercept}</span>
              </p>
              <p className="text-lg">
                Test Point: <span className="math-equation">({question.testPoint.x}, {question.testPoint.y})</span>
              </p>
            </div>
            <p className="text-muted-foreground text-sm">
              Answer "yes" or "no"
            </p>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  const getResultColor = () => {
    if (!showResult) return '';
    return question.isCorrect ? 'border-success bg-success/5' : 'border-error bg-error/5';
  };
  
  const getResultIcon = () => {
    if (!showResult) return null;
    return question.isCorrect ? (
      <div className="text-success font-semibold">✓ Correct!</div>
    ) : (
      <div className="text-error font-semibold">✗ Incorrect. Answer: {question.correctAnswer}</div>
    );
  };
  
  return (
    <Card className={`shadow-card transition-all duration-300 animate-quiz-enter ${getResultColor()}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">
            Question {questionNumber} of {totalQuestions}
          </CardTitle>
          <div className="text-sm text-muted-foreground bg-primary/10 px-3 py-1 rounded-full">
            {question.type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </div>
        </div>
        <p className="text-lg font-medium text-foreground mt-4">
          {question.question}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderQuestionContent()}
        
        <div className="flex flex-col gap-4">
          <Input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Enter your answer..."
            disabled={showResult}
            className="text-lg"
          />
          
          {!showResult && (
            <Button 
              onClick={handleSubmit}
              disabled={!answer.trim()}
              className="bg-gradient-primary hover:opacity-90 transition-opacity"
              size="lg"
            >
              Submit Answer
            </Button>
          )}
          
          {showResult && getResultIcon()}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizQuestion;