import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom"; // <-- MODIFIED: Added useParams
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { Map, ArrowLeft, Loader2, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { getRoadmap, generateRoadmap, updateCourseFlags } from "../services/courseService";

// ... (RoadmapStep and Roadmap interfaces are fine)
interface RoadmapStep {
  _id: string;
  title: string;
  description: string;
  estimatedDuration: string;
}

interface Roadmap {
  _id: string;
  steps: RoadmapStep[];
}

const RoadmapPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // <-- MODIFIED: Get courseId from URL params -->
  const { courseId } = useParams<{ courseId: string }>();
  // <-- MODIFIED: Get other data from location.state -->
  const { subject, level, generate } = location.state || {};

  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      toast({ title: "Access Restricted", description: "Admins cannot access this page.", variant: "destructive" });
      navigate('/admin');
      return;
    }

    // <-- MODIFIED: This check is now robust -->
    if (!courseId) {
      toast({ title: "Error", description: "No course ID provided.", variant: "destructive" });
      navigate("/my-courses");
      return;
    }

    if (generate) {
      handleGenerateRoadmap();
    } else {
      fetchRoadmap();
    }
    // <-- MODIFIED: courseId is now in the dependency array
  }, [user, navigate, courseId, generate, toast]);

  const fetchRoadmap = async () => {
    if (!courseId) return; // <-- Added safety check
    try {
      setLoading(true);
      setError(null);
      const response = await getRoadmap(courseId);
      setRoadmap(response.roadmap);
    } catch (err) {
      console.error("Failed to fetch roadmap:", err);
      setError("Failed to load roadmap. It might not be generated yet.");
      setRoadmap(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    if (!courseId) return; // <-- Added safety check
    try {
      setLoading(true);
      setError(null);
      const response = await generateRoadmap(courseId);
      setRoadmap(response.roadmap);
      toast({ title: "Success", description: "AI Roadmap generated successfully!" });
      // Update the course flag
      await updateCourseFlags(courseId, { hasRoadmap: true });
    } catch (err) {
      console.error("Failed to generate roadmap:", err);
      setError("An error occurred while generating the AI roadmap. Please try again.");
      toast({ title: "Error", description: "Failed to generate roadmap.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-24 px-4 max-w-4xl mx-auto pb-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
              <Map size={32} className="text-primary" />
              AI Learning Roadmap
            </h1>
            {/* <-- MODIFIED: Use subject/level from state --> */}
            <p className="text-muted-foreground">{subject} ({level})</p>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate("/my-courses")}
            className="flex items-center gap-2 text-primary"
          >
            <ArrowLeft size={20} /> Back to Courses
          </Button>
        </div>

        {/* ... (rest of the JSX is fine) ... */}
        {loading && (
          <div className="flex flex-col items-center justify-center text-center bg-card border border-border rounded-xl p-12 min-h-[300px]">
            <Loader2 size={40} className="animate-spin text-primary mb-4" />
            <h2 className="text-xl font-semibold text-primary">
              {generate ? "Generating Your AI Roadmap..." : "Loading Roadmap..."}
            </h2>
            <p className="text-muted-foreground mt-2">
              Please wait, this may take a moment.
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center text-center bg-card border border-destructive/50 rounded-xl p-12 min-h-[300px]">
            <h2 className="text-xl font-semibold text-destructive mb-4">{error}</h2>
            <Button onClick={handleGenerateRoadmap} className="bg-primary">
              <Map size={18} className="mr-2" />
              Generate Roadmap Now
            </Button>
          </div>
        )}

        {!loading && !error && roadmap && (
          <div className="space-y-6">
            {roadmap.steps.map((step, index) => (
              <div key={step._id || index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                    {index + 1}
                  </div>
                  {index < roadmap.steps.length - 1 && (
                    <div className="w-0.5 flex-1 bg-border my-2"></div>
                  )}
                </div>
                
                <div className="flex-1 bg-card border border-border rounded-xl p-6 mb-4">
                  <span className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
                    <Clock size={16} />
                    {step.estimatedDuration}
                  </span>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default RoadmapPage;