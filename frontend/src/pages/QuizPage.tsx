import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { useToast } from "@/components/ui/use-toast";
import {
  generateQuiz,
  submitQuiz,
  QuizQuestion,
} from "../services/quizService";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Trophy,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface QuizState {
  id: string;
  questions: QuizQuestion[];
  currentQuestion: number;
  selectedAnswers: string[];
  timeRemaining: number;
  quizCompleted: boolean;
  score: number | null;
  results: {
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }[] | null;
}

const QuizPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { courseId, subject, level, generate } = location.state || {};

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [quizState, setQuizState] = useState<QuizState>({
    id: "",
    questions: [],
    currentQuestion: 0,
    selectedAnswers: [],
    timeRemaining: 0,
    quizCompleted: false,
    score: null,
    results: null,
  });
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  // Redirect admin users
  useEffect(() => {
    if (user?.role === "admin") {
      toast({
        title: "Access Restricted",
        description: "Admin users cannot access learner features.",
        variant: "destructive",
      });
      navigate("/admin");
    }
  }, [user, navigate, toast]);

  useEffect(() => {
    if (generate) {
      handleGenerateQuiz();
    } else {
      fetchQuiz();
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [courseId, subject, level, generate]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await generateQuiz(subject, level, courseId);
      if (response && response.quiz) {
        const quiz = response.quiz;
        if (quiz.completed) {
          setQuizState({
            id: quiz.id,
            questions: quiz.questions,
            currentQuestion: 0,
            selectedAnswers: new Array(quiz.questions.length).fill(""),
            timeRemaining: 0,
            quizCompleted: true,
            score: quiz.score,
            results: quiz.results,
          });
          toast({
            title: "Quiz Results",
            description: `You previously scored ${quiz.score} / ${quiz.questions.length}!`,
          });
        } else {
          startNewQuiz(quiz);
        }
      }
    } catch (error) {
      console.error("Failed to fetch quiz:", error);
      toast({
        title: "Error",
        description: "Failed to load quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    try {
      setGenerating(true);
      const quizSubject = subject || "General Knowledge";
      const quizLevel = level || "intermediate";
      const response = await generateQuiz(quizSubject, quizLevel, courseId);
      if (response && response.quiz) {
        const quiz = response.quiz;
        if (quiz.completed) {
          setQuizState({
            id: quiz.id,
            questions: quiz.questions,
            currentQuestion: 0,
            selectedAnswers: new Array(quiz.questions.length).fill(""),
            timeRemaining: 0,
            quizCompleted: true,
            score: quiz.score,
            results: quiz.results,
          });
          toast({
            title: "Quiz Results",
            description: `You previously scored ${quiz.score} / ${quiz.questions.length}!`,
          });
        } else {
          startNewQuiz(quiz);
        }
      }
    } catch (error) {
      console.error("Failed to generate quiz:", error);
      toast({
        title: "Error",
        description: "Failed to generate quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  const startNewQuiz = (quiz: any) => {
    setQuizState({
      id: quiz.id,
      questions: quiz.questions,
      currentQuestion: 0,
      selectedAnswers: new Array(quiz.questions.length).fill(""),
      timeRemaining: quiz.questions.length * 30,
      quizCompleted: false,
      score: null,
      results: null,
    });

    const intervalId = setInterval(() => {
      setQuizState((prev) => {
        if (prev.timeRemaining <= 1) {
          clearInterval(intervalId);
          handleSubmitQuiz(prev.selectedAnswers);
          return { ...prev, timeRemaining: 0 };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);

    setTimer(intervalId);
  };

  const handleSelectAnswer = (answer: string) => {
    setQuizState((prev) => {
      const newAnswers = [...prev.selectedAnswers];
      newAnswers[prev.currentQuestion] = answer;
      return { ...prev, selectedAnswers: newAnswers };
    });
  };

  const handleSubmitQuiz = async (answers = quizState.selectedAnswers) => {
    try {
      if (timer) clearInterval(timer);
      const response = await submitQuiz(quizState.id, answers);
      setQuizState((prev) => ({
        ...prev,
        quizCompleted: true,
        score: response.score,
        results: response.results,
      }));
      toast({
        title: "Quiz Submitted",
        description: `You scored ${response.score} / ${quizState.questions.length}!`,
      });
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // 🌀 Loading State
  if (loading || generating) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="pt-24 flex flex-col justify-center items-center h-[60vh]">
          <div className="animate-spin h-12 w-12 border-4 border-primary rounded-full border-t-transparent mb-4"></div>
          <p className="text-lg">
            {generating ? "Generating quiz..." : "Loading quiz..."}
          </p>
        </div>
      </div>
    );
  }

  // ✅ Completed Quiz
  if (quizState.quizCompleted && quizState.results) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="pt-24 px-4 max-w-6xl mx-auto">
          <div className="bg-card border border-border rounded-xl p-6 shadow">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold">Quiz Results</h1>
              <button
                onClick={() => navigate("/my-courses")}
                className="flex items-center gap-2 text-primary hover:text-primary/80"
              >
                <ArrowLeft size={20} /> Back to Courses
              </button>
            </div>

            <div className="flex flex-col items-center mb-8">
              <div className="bg-primary/10 p-6 rounded-full mb-4">
                <Trophy size={64} className="text-yellow-500" />
              </div>
              <h2 className="text-3xl font-bold mb-2">
                {quizState.score} / {quizState.questions.length}
              </h2>
              <p className="text-muted-foreground">
                {quizState.score === quizState.questions.length
                  ? "Perfect Score! 🎉"
                  : quizState.score! > quizState.questions.length / 2
                  ? "Good Job! 👍"
                  : "Keep Practicing! 💪"}
              </p>
            </div>

            <div className="space-y-6">
              {quizState.results.map((r, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-lg ${
                    r.isCorrect
                      ? "bg-green-500/10 border border-green-600/40"
                      : "bg-red-500/10 border border-red-600/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {r.isCorrect ? (
                      <CheckCircle className="text-green-500 mt-1" />
                    ) : (
                      <XCircle className="text-red-500 mt-1" />
                    )}
                    <div>
                      <p className="font-medium mb-2">
                        Q{i + 1}: {r.question}
                      </p>
                      <p className="text-sm text-muted-foreground mb-1">
                        Your answer:{" "}
                        <span
                          className={
                            r.isCorrect ? "text-green-500" : "text-red-500"
                          }
                        >
                          {r.userAnswer || "(No answer)"}
                        </span>
                      </p>
                      {!r.isCorrect && (
                        <p className="text-sm text-green-500">
                          Correct answer: {r.correctAnswer}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() => navigate("/my-courses")}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/80"
              >
                Back to Courses
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-secondary text-foreground px-6 py-3 rounded-lg hover:opacity-80"
              >
                View Progress
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 🧠 Active Quiz
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-24 px-4 max-w-6xl mx-auto">
        <div className="bg-card border border-border rounded-xl p-6 shadow">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">
              {subject} Quiz
            </h1>
            <div className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-lg">
              <Clock size={20} className="text-primary" />
              <span className="font-mono text-lg">
                {formatTime(quizState.timeRemaining)}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span>
                Question {quizState.currentQuestion + 1} of{" "}
                {quizState.questions.length}
              </span>
              <span>
                {quizState.selectedAnswers.filter((a) => a !== "").length} of{" "}
                {quizState.questions.length} answered
              </span>
            </div>
            <Progress
              value={
                ((quizState.currentQuestion + 1) /
                  quizState.questions.length) *
                100
              }
              className="h-2"
            />
          </div>

          {quizState.questions.length > 0 && (
            <div className="mb-8">
              <div className="bg-secondary p-6 rounded-lg mb-6">
                <h2 className="text-xl font-medium mb-4">
                  {quizState.questions[quizState.currentQuestion].question}
                </h2>
                <div className="space-y-3">
                  {quizState.questions[
                    quizState.currentQuestion
                  ].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectAnswer(option)}
                      className={`w-full text-left p-4 rounded-lg transition ${
                        quizState.selectedAnswers[
                          quizState.currentQuestion
                        ] === option
                          ? "bg-primary text-white"
                          : "bg-background border border-border hover:bg-muted"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() =>
                    setQuizState((prev) => ({
                      ...prev,
                      currentQuestion: Math.max(prev.currentQuestion - 1, 0),
                    }))
                  }
                  disabled={quizState.currentQuestion === 0}
                  className="bg-secondary text-foreground px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>

                {quizState.currentQuestion <
                quizState.questions.length - 1 ? (
                  <button
                    onClick={() =>
                      setQuizState((prev) => ({
                        ...prev,
                        currentQuestion: Math.min(
                          prev.currentQuestion + 1,
                          prev.questions.length - 1
                        ),
                      }))
                    }
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubmitQuiz()}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
                  >
                    Submit Quiz
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {quizState.questions.map((_, index) => (
              <button
                key={index}
                onClick={() =>
                  setQuizState((prev) => ({
                    ...prev,
                    currentQuestion: index,
                  }))
                }
                className={`w-full aspect-square flex items-center justify-center rounded-lg text-sm font-medium ${
                  index === quizState.currentQuestion
                    ? "bg-primary text-white"
                    : quizState.selectedAnswers[index]
                    ? "bg-secondary text-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
