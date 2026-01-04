
import React, { useState, useEffect, useCallback } from 'react';
import { GameState, LEARNING_GOALS, Question } from './types';
import { generateQuestion } from './geminiService';
import { BookOpen, Trophy, Target, ChevronRight, AlertCircle, CheckCircle2, RefreshCw, Star } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentGoalIndex: 0,
    correctAnswersInGoal: 0,
    totalCorrect: 0,
    playerLevel: 1,
    consecutiveWrong: 0,
  });

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string; show: boolean } | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [gameFinished, setGameFinished] = useState(false);

  const fetchNewQuestion = useCallback(async (state: GameState) => {
    setIsLoading(true);
    setFeedback(null);
    setUserAnswer('');
    try {
      const question = await generateQuestion(state);
      setCurrentQuestion(question);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNewQuestion(gameState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswerSubmit = (answer: string) => {
    if (!currentQuestion || feedback?.show) return;

    const isCorrect = answer.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();
    
    if (isCorrect) {
      const nextCorrectCount = gameState.correctAnswersInGoal + 1;
      const nextTotalCorrect = gameState.totalCorrect + 1;
      
      let nextGoalIndex = gameState.currentGoalIndex;
      let nextCorrectAnswersInGoal = nextCorrectCount;
      let nextPlayerLevel = gameState.playerLevel;

      if (nextCorrectCount >= 3) {
        if (nextGoalIndex < LEARNING_GOALS.length - 1) {
          nextGoalIndex += 1;
          nextCorrectAnswersInGoal = 0;
          nextPlayerLevel += 1;
        } else {
          setGameFinished(true);
        }
      }

      const newState = {
        ...gameState,
        currentGoalIndex: nextGoalIndex,
        correctAnswersInGoal: nextCorrectAnswersInGoal,
        totalCorrect: nextTotalCorrect,
        playerLevel: nextPlayerLevel,
        consecutiveWrong: 0,
      };

      setGameState(newState);
      setFeedback({
        isCorrect: true,
        message: currentQuestion.explanation,
        show: true
      });
    } else {
      setGameState(prev => ({
        ...prev,
        consecutiveWrong: prev.consecutiveWrong + 1
      }));
      setFeedback({
        isCorrect: false,
        message: `Helaas! ${currentQuestion.explanation}`,
        show: true
      });
    }
  };

  const nextAction = () => {
    if (gameFinished) return;
    fetchNewQuestion(gameState);
  };

  if (gameFinished) {
    return (
      <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center space-y-6">
          <div className="flex justify-center">
            <Trophy className="w-24 h-24 text-yellow-400 animate-bounce" />
          </div>
          <h1 className="text-4xl font-black text-gray-800">GEFELICITEERD!</h1>
          <p className="text-xl text-gray-600">Je hebt alle economische leerdoelen over vraag en aanbod voltooid.</p>
          <div className="bg-gray-50 p-6 rounded-xl space-y-2">
            <p className="font-bold text-gray-500 uppercase tracking-widest text-sm">Eindscore</p>
            <div className="text-5xl font-black text-indigo-600">{gameState.totalCorrect}</div>
            <p className="text-gray-400">Vragen correct beantwoord</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl transition-all active:scale-95"
          >
            Opnieuw Spelen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar - Progress */}
      <aside className="w-full md:w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto max-h-screen">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Target className="w-6 h-6 text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Economeester</h2>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Level</span>
              <span className="text-2xl font-black text-indigo-600">{gameState.playerLevel}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-indigo-600 h-3 rounded-full transition-all duration-500" 
                style={{ width: `${(gameState.currentGoalIndex / LEARNING_GOALS.length) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Leerdoel {gameState.currentGoalIndex + 1} van {LEARNING_GOALS.length}
            </p>
          </div>

          <nav className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Jouw Voortgang</p>
            {LEARNING_GOALS.map((goal, idx) => (
              <div 
                key={idx}
                className={`flex items-start gap-3 p-3 rounded-lg text-sm transition-colors ${
                  idx === gameState.currentGoalIndex 
                    ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                    : idx < gameState.currentGoalIndex 
                      ? 'text-green-600' 
                      : 'text-gray-400 opacity-60'
                }`}
              >
                {idx < gameState.currentGoalIndex ? (
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                ) : (
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                    idx === gameState.currentGoalIndex ? 'border-indigo-600' : 'border-gray-300'
                  }`}>
                    {idx === gameState.currentGoalIndex && <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>}
                  </div>
                )}
                <span className="line-clamp-2 leading-snug">{goal}</span>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 md:p-8 lg:p-12 items-center">
        <div className="w-full max-w-3xl">
          {/* Header */}
          <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Huidig Leerdoel</h3>
              <h1 className="text-2xl font-black text-gray-900">{LEARNING_GOALS[gameState.currentGoalIndex]}</h1>
            </div>
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                    i < gameState.correctAnswersInGoal 
                      ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-200' 
                      : 'border-gray-200 text-gray-300'
                  }`}
                >
                  <Star className={`w-4 h-4 ${i < gameState.correctAnswersInGoal ? 'fill-current' : ''}`} />
                </div>
              ))}
            </div>
          </header>

          {/* Question Area */}
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100 min-h-[400px] flex flex-col">
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-indigo-600 font-bold animate-pulse">Nieuwe vraag genereren...</p>
              </div>
            ) : currentQuestion ? (
              <div className="flex-1 p-6 md:p-10 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase tracking-wider">
                    {currentQuestion.questionType}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    currentQuestion.difficulty === 'makkelijk' ? 'bg-green-100 text-green-700' :
                    currentQuestion.difficulty === 'gemiddeld' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {currentQuestion.difficulty}
                  </span>
                </div>

                <h2 className="text-xl md:text-2xl font-bold text-gray-800 leading-relaxed mb-10">
                  {currentQuestion.question}
                </h2>

                <div className="space-y-3 mb-8 flex-1">
                  {currentQuestion.options && currentQuestion.options.length > 0 ? (
                    currentQuestion.options.map((opt, i) => (
                      <button
                        key={i}
                        disabled={!!feedback}
                        onClick={() => setUserAnswer(opt)}
                        className={`w-full text-left p-5 rounded-2xl border-2 transition-all group flex items-center justify-between ${
                          userAnswer === opt 
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                            : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50 text-gray-600'
                        } ${feedback ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span className="font-semibold text-lg">{opt}</span>
                        <ChevronRight className={`w-5 h-5 transition-transform ${userAnswer === opt ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                      </button>
                    ))
                  ) : (
                    <div className="space-y-4">
                      <input 
                        type="text"
                        placeholder="Type hier je antwoord..."
                        className="w-full p-5 rounded-2xl border-2 border-gray-100 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none text-lg transition-all"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        disabled={!!feedback}
                        onKeyDown={(e) => e.key === 'Enter' && handleAnswerSubmit(userAnswer)}
                      />
                      <p className="text-sm text-gray-400 italic">Druk op Enter of klik op 'Antwoord Controleren'</p>
                    </div>
                  )}
                </div>

                {!feedback ? (
                  <button
                    onClick={() => handleAnswerSubmit(userAnswer)}
                    disabled={!userAnswer}
                    className={`w-full py-5 rounded-2xl font-black text-lg transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
                      userAnswer 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Antwoord Controleren
                  </button>
                ) : (
                  <div className={`p-6 rounded-2xl flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ${
                    feedback.isCorrect ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      {feedback.isCorrect ? (
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                      ) : (
                        <AlertCircle className="w-8 h-8 text-red-600" />
                      )}
                      <span className={`text-xl font-bold ${feedback.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                        {feedback.isCorrect ? 'Helemaal goed!' : 'Net niet goed...'}
                      </span>
                    </div>
                    <p className={`text-center text-sm font-medium ${feedback.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {feedback.message}
                    </p>
                    <button
                      onClick={nextAction}
                      className={`w-full mt-2 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                        feedback.isCorrect 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      {feedback.isCorrect ? (
                        <>Volgende Vraag <ChevronRight className="w-5 h-5" /></>
                      ) : (
                        <>Probeer een andere <RefreshCw className="w-5 h-5" /></>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
                <AlertCircle className="w-16 h-16 text-gray-300" />
                <h3 className="text-xl font-bold text-gray-600">Er ging iets mis</h3>
                <p className="text-gray-400">We konden geen nieuwe vraag laden. Controleer je internetverbinding.</p>
                <button 
                  onClick={() => fetchNewQuestion(gameState)}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold"
                >
                  Opnieuw Proberen
                </button>
              </div>
            )}
          </div>
          
          <p className="text-center mt-8 text-gray-400 text-sm flex items-center justify-center gap-2">
            <BookOpen className="w-4 h-4" /> Economeester © 2024 - Adaptief Leren met AI
          </p>
        </div>
      </main>
    </div>
  );
};

export default App;
