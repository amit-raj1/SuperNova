import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { BookOpen, GraduationCap, BarChart2, TrendingUp } from "lucide-react";
import { getMyCourses } from "../services/courseService";
import { useToast } from "@/components/ui/use-toast";

interface CourseStats {
  completed: number;
  inProgress: number;
  notStarted: number;
}

interface QuizScore {
  topic: string;
  score: number;
}

const DashboardPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [courseStats, setCourseStats] = useState<CourseStats>({
    completed: 0,
    inProgress: 0,
    notStarted: 0,
  });
  const [quizScores, setQuizScores] = useState<QuizScore[]>([]);
  const [totalCourses, setTotalCourses] = useState(0);

  // Redirect admin users to admin dashboard
  useEffect(() => {
    if (user?.role === "admin") {
      navigate("/admin");
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const coursesResponse = await getMyCourses();

      if (coursesResponse && coursesResponse.courses) {
        const courses = coursesResponse.courses;
        setTotalCourses(courses.length);

        let completed = 0;
        let inProgress = 0;
        let notStarted = 0;

        courses.forEach((course: any) => {
          const completedTopics = course.progress?.completedTopics || 0;
          const totalTopics = course.topics?.length || 0;

          if (totalTopics === 0) {
            notStarted++;
          } else if (completedTopics === totalTopics) {
            completed++;
          } else if (completedTopics > 0) {
            inProgress++;
          } else {
            notStarted++;
          }
        });

        setCourseStats({
          completed,
          inProgress,
          notStarted,
        });

        const quizData: QuizScore[] = [];

        courses.forEach((course: any) => {
          if (course.progress?.testScores?.length > 0) {
            course.progress.testScores.forEach((score: any) => {
              quizData.push({
                topic: score.topic,
                score: score.score,
              });
            });
          }
        });

        if (quizData.length === 0) {
          const mockQuizScores = [
            { topic: "Introduction", score: 85 },
            { topic: "Basic Concepts", score: 92 },
            { topic: "Advanced Topics", score: 78 },
            { topic: "Practical Applications", score: 88 },
            { topic: "Case Studies", score: 95 },
          ];
          setQuizScores(mockQuizScores);
        } else {
          setQuizScores(quizData);
        }
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });

      // fallback mock data
      setCourseStats({
        completed: 1,
        inProgress: 2,
        notStarted: 3,
      });

      const mockQuizScores = [
        { topic: "Introduction", score: 85 },
        { topic: "Basic Concepts", score: 92 },
        { topic: "Advanced Topics", score: 78 },
        { topic: "Practical Applications", score: 88 },
        { topic: "Case Studies", score: 95 },
      ];

      setQuizScores(mockQuizScores);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--primary) / 0.7)",
    "hsl(var(--primary) / 0.5)",
  ];

  const pieData = [
    { name: "Completed", value: courseStats.completed },
    { name: "In Progress", value: courseStats.inProgress },
    { name: "Not Started", value: courseStats.notStarted },
  ];

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="pt-24 px-4 max-w-6xl mx-auto">
          <div className="flex flex-col justify-center items-center h-[60vh]">
            <div className="animate-spin h-12 w-12 border-4 border-primary rounded-full border-t-transparent mb-4"></div>
            <p className="text-xl text-muted-foreground">
              Loading dashboard information...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-24 px-4 max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center md:text-left">
          Dashboard
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-xl p-6 border border-border shadow-md flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <BookOpen size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Courses</p>
              <p className="text-2xl font-bold">{totalCourses}</p>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border shadow-md flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <GraduationCap size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{courseStats.completed}</p>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border shadow-md flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <TrendingUp size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">XP Points</p>
              <p className="text-2xl font-bold">{user.gamification?.xp || 0}</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card rounded-xl p-6 border border-border shadow-md">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BarChart2 size={20} className="text-primary" /> Course Progress
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border shadow-md">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BarChart2 size={20} className="text-primary" /> Quiz Performance
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={quizScores}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="topic"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Bar
                    dataKey="score"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Learning Resources */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-primary" /> Learning Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-secondary rounded-lg">
              <h3 className="font-medium mb-2">Generate Quizzes</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Create custom quizzes for any topic to test your knowledge
              </p>
              <button
                onClick={() => navigate("/QuizPage")}
                className="text-primary hover:opacity-80 text-sm"
              >
                Create Quiz →
              </button>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <h3 className="font-medium mb-2">Upload PDF Notes</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Generate AI-powered study notes from your PDF documents
              </p>
              <button
                onClick={() => navigate("/upload-pdf")}
                className="text-primary hover:opacity-80 text-sm"
              >
                Upload PDF →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
