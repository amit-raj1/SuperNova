import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import gsap from "gsap";
import Navbar from "../components/Navbar";
import ChatBot from "../components/ChatBot";
import { generateNotes } from "../utils/api";
import {
  Download,
  MessageSquare,
  Check,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportNotesAsDocx } from "../utils/exportDoc";
import html2pdf from "html2pdf.js";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "../context/ThemeContext"; // ✅ Added theme support
import {
  getMyCourses,
  Course,
  Topic,
  markTopicCompleted,
  getCourseProgress,
} from "../services/courseService";

export default function CourseNotes() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { theme, isDark, isWhite } = useTheme(); // ✅ Theme context

  const { courseId: paramCourseId } = useParams<{ courseId: string }>();
  const { subject, level, redirectTo, generate } = location.state || {};

  const [courseId, setCourseId] = useState<string | null>(paramCourseId || null);
  const formRef = useRef<HTMLDivElement>(null);
  const shapesRef = useRef<HTMLDivElement[]>([]);
  const notesRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [showChatBot, setShowChatBot] = useState(false);
  const [markingCompleted, setMarkingCompleted] = useState<string | null>(null);

  // 🚫 Restrict admin access
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

  // ⚙️ Load or generate course data
  useEffect(() => {
    gsap.fromTo(
      formRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: "power2.out" }
    );

    shapesRef.current.forEach((shape, i) => {
      gsap.to(shape, {
        y: "+=20",
        x: "+=10",
        repeat: -1,
        yoyo: true,
        duration: 3 + i,
        ease: "sine.inOut",
      });
    });

    if (paramCourseId) {
      setCourseId(paramCourseId);
      fetchCourseData(paramCourseId);
    } else if (subject && level) {
      handleGenerateNotes();
    } else {
      toast({
        title: "Error",
        description: "No course information found.",
        variant: "destructive",
      });
      navigate("/my-courses");
    }
  }, [paramCourseId, user]);

  const fetchCourseData = async (id: string) => {
    try {
      setLoading(true);
      const response = await getMyCourses();
      if (!response?.courses || !Array.isArray(response.courses)) {
        throw new Error("Invalid response from server");
      }

      const foundCourse = response.courses.find((c: Course) => c._id === id);

      if (foundCourse) {
        setCourse(foundCourse);
        setTopics(foundCourse.topics || []);

        try {
          const progressResponse = await getCourseProgress(id);
          if (progressResponse?.completedTopics) {
            setCompletedTopics(
              progressResponse.completedTopics.map(
                (t: { topicId: string }) => t.topicId
              )
            );
          }
        } catch (progressError) {
          console.error("Error fetching progress:", progressError);
        }
      } else {
        toast({
          title: "Error",
          description: "Course not found.",
          variant: "destructive",
        });
        navigate("/my-courses");
      }
    } catch (error) {
      console.error("Error fetching course data:", error);
      toast({
        title: "Error",
        description: "Failed to load course data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addShapeRef = (el: HTMLDivElement | null) => {
    if (el && !shapesRef.current.includes(el)) shapesRef.current.push(el);
  };

  const handleGenerateNotes = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "You need to be logged in to generate notes.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const response = await generateNotes(subject, level);
      if (response?.course) {
        const newCourse = response.course;
        setCourse(newCourse);
        setTopics(newCourse.topics);
        setCourseId(newCourse._id);

        if (redirectTo) {
          const newPath = `${redirectTo}/${newCourse._id}`;
          toast({ title: "Success", description: "Course created! Redirecting..." });
          navigate(newPath, {
            state: { ...location.state, courseId: newCourse._id },
            replace: true,
          });
        } else {
          navigate(`/course-notes/${newCourse._id}`, {
            state: { ...location.state, courseId: newCourse._id },
            replace: true,
          });
        }
      } else {
        throw new Error("Failed to get course data");
      }
    } catch (error) {
      console.error("Error generating notes:", error);
      toast({
        title: "Error",
        description: "Failed to generate notes. Try again.",
        variant: "destructive",
      });
      navigate("/CourseSetup");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkTopicCompleted = async (topicId: string) => {
    if (!courseId) {
      toast({
        title: "Error",
        description: "Missing course ID.",
        variant: "destructive",
      });
      return;
    }

    try {
      setMarkingCompleted(topicId);
      const response = await markTopicCompleted(topicId, courseId);
      setCompletedTopics((prev) => [...prev, topicId]);

      if (course && response?.progress) {
        setCourse({
          ...course,
          progress: response.progress,
        });
      }

      toast({ title: "Success", description: "Topic marked as completed!" });
    } catch (error) {
      console.error("Error marking completed:", error);
      toast({
        title: "Error",
        description: "Failed to mark topic as completed.",
        variant: "destructive",
      });
    } finally {
      setMarkingCompleted(null);
    }
  };

  const handleDownloadPDF = () => {
    if (notesRef.current) {
      html2pdf()
        .from(notesRef.current)
        .save(
          `${course?.subject || subject}_${
            course?.difficulty || level
          }_notes.pdf`
        );
    }
  };

  const handleDownloadDocx = () => {
    if (topics.length > 0) {
      const notesContent = topics
        .map((t) => `${t.title}\n\n${t.content || t.notes}`)
        .join("\n\n");
      exportNotesAsDocx(
        `${course?.subject || subject}_${course?.difficulty || level}_notes`,
        notesContent
      );
    }
  };

  // 🎨 Dynamic background based on theme
  const bgClass = isDark
    ? "bg-gradient-to-br from-gray-950 via-black to-gray-900 text-gray-100"
    : isWhite
    ? "bg-white text-gray-900"
    : "bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 text-gray-800";

  // ✅ CHANGED: Set text to dark black for white theme
  const textColor = isDark
    ? "text-gray-200"
    : isWhite
    ? "text-gray-900" // Dark black text for white mode
    : "text-gray-900";

  const shapeStyles = isDark
    ? [
        "bg-purple-600",
        "border border-purple-500",
        "bg-purple-700",
        "bg-gray-200",
        "border-2 border-purple-600",
        "bg-purple-800",
        "border-2 border-purple-500",
        "bg-gray-300",
        "bg-purple-500",
      ]
    : isWhite
    ? [
        "bg-gray-200",
        "border border-gray-400",
        "bg-gray-300",
        "bg-gray-400",
        "border-2 border-gray-300",
        "bg-gray-300",
        "border-2 border-gray-200",
        "bg-gray-300",
        "bg-gray-200",
      ]
    : [
        "bg-purple-300",
        "border border-purple-200",
        "bg-pink-200",
        "bg-white",
        "border-2 border-indigo-200",
        "bg-indigo-200",
        "border-2 border-pink-100",
        "bg-white",
        "bg-purple-100",
      ];

  return (
    <div
      className={`relative min-h-screen overflow-hidden transition-colors duration-500 ${bgClass}`}
    >
      <Navbar />

      {topics.length > 0 && (
        <button
          onClick={() => setShowChatBot(!showChatBot)}
          className="fixed bottom-6 right-6 z-50 bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg transition-all"
          aria-label={showChatBot ? "Hide AI Assistant" : "Show AI Assistant"}
        >
          <MessageSquare size={24} />
        </button>
      )}
      <ChatBot
        visible={showChatBot}
        subject={course?.subject || subject || ""}
        level={course?.difficulty || level || ""}
      />

      {/* Floating animated shapes */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {shapeStyles.map((style, i) => (
          <div
            key={i}
            ref={addShapeRef}
            className={`absolute opacity-10 ${style} ${
              [
                "top-4 left-8 w-8 h-8",
                "top-6 right-10 w-12 h-12 rounded-full",
                "top-16 left-1/3 w-5 h-5",
                "top-24 left-10 w-10 h-10 rotate-45",
                "bottom-20 right-20 w-16 h-16 rounded-full",
                "top-1/2 left-1/3 w-6 h-6",
                "bottom-10 left-1/4 w-12 h-12 rotate-12",
                "top-1/4 right-1/4 w-6 h-6 rotate-45",
                "top-1/3 left-10 w-5 h-5 rounded-full",
              ][i]
            }`}
          />
        ))}
      </div>

      {/* Notes Section */}
      <div
        ref={formRef}
        className="relative z-10 max-w-4xl mx-auto mt-28 p-6 text-center"
      >
        <h2 className={`text-3xl font-bold mb-6 ${textColor}`}>
          {course?.subject || subject || "Course"} (
          {course?.difficulty || level || "Notes"})
        </h2>

        {/* ✅ CHANGED: Removed gradient and applied textColor */}
        <h3 className={`text-2xl font-bold mb-6 ${textColor}`}>
          Course Topics
        </h3>

        {loading && (
          // ✅ CHANGED: Removed text-purple-500 and applied textColor
          <div
            className={`generate-loader mt-10 flex flex-col items-center justify-center ${textColor}`}
          >
            <Loader2 size={32} className="animate-spin mb-4" />
            {subject ? "Generating your new course..." : "Loading course notes..."}{" "}
            ✨
          </div>
        )}

        {!loading && topics.length === 0 && (
          <div className="flex flex-col items-center">
            {/* ✅ CHANGED: Replaced text-gray-400 with themed text */}
            <p className={`mb-4 ${textColor} opacity-70`}>
              No notes found for this course.
            </p>
            <Button onClick={() => navigate("/my-courses")}>
              Back to My Courses
            </Button>
          </div>
        )}

        {!loading && topics.length > 0 && (
          <div>
            <div
              ref={notesRef}
              // ✅ CHANGED: Removed fixed text colors from container
              className={`mt-10 p-8 rounded-xl text-left shadow-xl max-w-4xl mx-auto divide-y ${
                isDark
                  ? "bg-gray-900 border border-indigo-500/20 divide-indigo-800/30"
                  : isWhite
                  ? "bg-white border border-gray-200 divide-gray-100"
                  : "bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 divide-indigo-100"
              }`}
            >
              {topics.map((topic, index) => (
                <div key={topic._id || index} className="py-6 first:pt-0 last:pb-0">
                  <div className="flex justify-between items-start gap-4">
                    {/* This title is a gradient, which you said was visible */}
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 mb-4">
                      {topic.title}
                    </h2>
                    {/* ✅ CHANGED: Added full theme logic to the button */}
                    <button
                      onClick={() => handleMarkTopicCompleted(topic._id)}
                      disabled={
                        completedTopics.includes(topic._id) ||
                        markingCompleted === topic._id
                      }
                      className={`mt-1 flex-shrink-0 items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        completedTopics.includes(topic._id)
                          ? isDark
                            ? "bg-green-900/30 text-green-400 cursor-default"
                            : "bg-green-100 text-green-700 cursor-default"
                          : isDark
                          ? "bg-purple-900/30 text-purple-400 hover:bg-purple-900/50"
                          : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                      }`}
                    >
                      {markingCompleted === topic._id ? (
                        <div className="animate-spin h-4 w-4 border-2 border-current rounded-full border-t-transparent" />
                      ) : completedTopics.includes(topic._id) ? (
                        <>
                          <CheckCircle2 size={16} />
                          <span>Completed</span>
                        </>
                      ) : (
                        <>
                          <Check size={16} />
                          <span>Mark Complete</span>
                        </>
                      )}
                    </button>
                  </div>
                  {/* ✅ THIS IS THE FIX: The 'textColor' variable is now correctly applied here */}
                  <div
                    className={`markdown-content prose-lg max-w-none leading-relaxed mt-3 ${textColor}`}
                  >
                    {topic.content || topic.notes}
                  </div>
                </div>
              ))}
            </div>

            {/* Download Buttons */}
            <div className="mt-6 flex flex-wrap justify-center gap-4 mb-10">
              <button
                onClick={handleDownloadPDF}
                className="inline-flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white px-5 py-3 rounded-xl font-semibold transition-all"
              >
                <Download size={18} /> Download PDF
              </button>
              <button
                onClick={handleDownloadDocx}
                className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-5 py-3 rounded-xl font-semibold transition-all"
              >
                <Download size={18} /> Download Word (.docx)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}