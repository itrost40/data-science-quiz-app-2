import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import QuizQuestion from '@/components/QuizQuestion';
import { QuestionGenerator } from '@/utils/questionGenerator';
import { Question, QuizState } from '@/types/quiz';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  
  // Get URL parameters
  const urlSeed = parseInt(searchParams.get('seed') || '0') || Math.floor(Math.random() * 1000000);
  const urlQuestionCount = parseInt(searchParams.get('count') || '10');
  
  const [quizState, setQuizState] = useState<QuizState>({
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    isComplete: false,
    seed: urlSeed,
    questionCount: Math.min(Math.max(urlQuestionCount, 5), 50) // Limit between 5-50
  });
  
  const [isStarted, setIsStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [customSeed, setCustomSeed] = useState(urlSeed.toString());
  const [customCount, setCustomCount] = useState(urlQuestionCount.toString());
  
  // Generate questions when quiz starts
  const questions = useMemo(() => {
    if (!isStarted) return [];
    const generator = new QuestionGenerator(quizState.seed);
    return generator.generateQuiz(quizState.questionCount);
  }, [isStarted, quizState.seed, quizState.questionCount]);
  
  useEffect(() => {
    if (questions.length > 0) {
      setQuizState(prev => ({ ...prev, questions }));
    }
  }, [questions]);
  
  // Update URL when seed or count changes
  useEffect(() => {
    const newParams = new URLSearchParams();
    newParams.set('seed', quizState.seed.toString());
    newParams.set('count', quizState.questionCount.toString());
    setSearchParams(newParams, { replace: true });
  }, [quizState.seed, quizState.questionCount, setSearchParams]);
  
  const startQuiz = () => {
    const seed = parseInt(customSeed) || Math.floor(Math.random() * 1000000);
    const count = Math.min(Math.max(parseInt(customCount) || 10, 5), 50);
    
    setQuizState(prev => ({
      ...prev,
      seed,
      questionCount: count,
      currentQuestionIndex: 0,
      score: 0,
      isComplete: false
    }));
    
    setIsStarted(true);
    setShowResults(false);
  };
  
  const resetQuiz = () => {
    setIsStarted(false);
    setShowResults(false);
    setQuizState(prev => ({
      ...prev,
      questions: [],
      currentQuestionIndex: 0,
      score: 0,
      isComplete: false
    }));
  };
  
  const checkAnswer = (userAnswer: string, correctAnswer: string, questionType: string): boolean => {
    const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '');
    const normalizedUser = normalize(userAnswer);
    const normalizedCorrect = normalize(correctAnswer);
    
    // For point-on-line questions, accept various forms of yes/no
    if (questionType === 'point-on-line') {
      const yesAnswers = ['yes', 'y', 'true', '1'];
      const noAnswers = ['no', 'n', 'false', '0'];
      
      const userIsYes = yesAnswers.includes(normalizedUser);
      const userIsNo = noAnswers.includes(normalizedUser);
      const correctIsYes = normalizedCorrect === 'yes';
      
      return (userIsYes && correctIsYes) || (userIsNo && !correctIsYes);
    }
    
    // For equations, try to normalize different valid formats
    if (questionType.includes('equation') || questionType.includes('line-equation')) {
      // Remove spaces and normalize y = mx + b format
      const cleanUser = normalizedUser.replace(/y=/g, '').replace(/\+/g, '+').replace(/-/g, '-');
      const cleanCorrect = normalizedCorrect.replace(/y=/g, '').replace(/\+/g, '+').replace(/-/g, '-');
      
      return cleanUser === cleanCorrect;
    }
    
    // For numeric answers, handle decimal precision
    const userNum = parseFloat(normalizedUser);
    const correctNum = parseFloat(normalizedCorrect);
    
    if (!isNaN(userNum) && !isNaN(correctNum)) {
      return Math.abs(userNum - correctNum) < 0.01;
    }
    
    return normalizedUser === normalizedCorrect;
  };
  
  const handleAnswer = (answer: string) => {
    const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
    const isCorrect = checkAnswer(answer, currentQuestion.correctAnswer, currentQuestion.type);
    
    // Update the question with user's answer
    const updatedQuestions = [...quizState.questions];
    updatedQuestions[quizState.currentQuestionIndex] = {
      ...currentQuestion,
      userAnswer: answer,
      isCorrect
    };
    
    const newScore = quizState.score + (isCorrect ? 1 : 0);
    const nextIndex = quizState.currentQuestionIndex + 1;
    const isComplete = nextIndex >= quizState.questions.length;
    
    setQuizState(prev => ({
      ...prev,
      questions: updatedQuestions,
      score: newScore,
      currentQuestionIndex: nextIndex,
      isComplete
    }));
    
    if (isComplete) {
      setShowResults(true);
      toast({
        title: "Quiz Complete!",
        description: `You scored ${newScore} out of ${quizState.questions.length}`,
      });
    } else {
      // Show feedback for current question
      toast({
        title: isCorrect ? "Correct!" : "Incorrect",
        description: isCorrect ? "Great job!" : `The answer was: ${currentQuestion.correctAnswer}`,
        variant: isCorrect ? "default" : "destructive"
      });
    }
  };
  
  const shareQuiz = () => {
    const url = `${window.location.origin}${window.location.pathname}?seed=${quizState.seed}&count=${quizState.questionCount}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied!",
      description: "Share this link to let others take the same quiz.",
    });
  };
  
  const progress = quizState.questions.length > 0 ? 
    (quizState.currentQuestionIndex / quizState.questions.length) * 100 : 0;
  
  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gradient-surface flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-quiz">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Line Math Quiz
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Test your knowledge of linear equations, slopes, and coordinate geometry
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Quiz Seed (for sharing)</label>
                <Input
                  type="number"
                  value={customSeed}
                  onChange={(e) => setCustomSeed(e.target.value)}
                  placeholder="Random seed number"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Same seed = same questions for sharing
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Number of Questions</label>
                <Input
                  type="number"
                  min="5"
                  max="50"
                  value={customCount}
                  onChange={(e) => setCustomCount(e.target.value)}
                  placeholder="10"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Between 5 and 50 questions
                </p>
              </div>
            </div>
            
            <Button 
              onClick={startQuiz} 
              className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
              size="lg"
            >
              Start Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (showResults) {
    const percentage = Math.round((quizState.score / quizState.questions.length) * 100);
    
    return (
      <div className="min-h-screen bg-gradient-surface p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="shadow-quiz">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold">Quiz Results</CardTitle>
              <div className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mt-4">
                {percentage}%
              </div>
              <p className="text-xl text-muted-foreground">
                {quizState.score} out of {quizState.questions.length} correct
              </p>
            </CardHeader>
            <CardContent className="flex justify-center gap-4">
              <Button onClick={resetQuiz} variant="outline" size="lg">
                Take Another Quiz
              </Button>
              <Button onClick={shareQuiz} className="bg-gradient-primary" size="lg">
                Share This Quiz
              </Button>
            </CardContent>
          </Card>
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Review Your Answers</h3>
            {quizState.questions.map((question, index) => (
              <QuizQuestion
                key={question.id}
                question={question}
                questionNumber={index + 1}
                totalQuestions={quizState.questions.length}
                onAnswer={() => {}} // No-op since it's review mode
                showResult={true}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-surface p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-quiz">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Line Math Quiz</h1>
              <div className="text-sm text-muted-foreground">
                Score: {quizState.score}/{quizState.currentQuestionIndex}
              </div>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Question {quizState.currentQuestionIndex + 1} of {quizState.questions.length}
            </p>
          </CardContent>
        </Card>
        
        {/* Current Question */}
        {quizState.questions[quizState.currentQuestionIndex] && (
          <QuizQuestion
            question={quizState.questions[quizState.currentQuestionIndex]}
            questionNumber={quizState.currentQuestionIndex + 1}
            totalQuestions={quizState.questions.length}
            onAnswer={handleAnswer}
          />
        )}
      </div>
    </div>
  );
};

export default Index;