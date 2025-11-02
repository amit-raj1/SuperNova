import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { Video, ArrowLeft, Loader2, Plus, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { getLectures, addLecture, deleteLecture, updateCourseFlags } from "../services/courseService";

interface Lecture {
  _id: string;
  title: string;
  url: string;
  duration: string;
}

const LecturesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Get courseId from URL params
  const { courseId } = useParams<{ courseId: string }>();
  // Get subject/level from location.state (may be undefined on refresh)
  const { subject, level } = location.state || {};

  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLecture, setNewLecture] = useState({ title: "", url: "", duration: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Admin check
    if (user?.role === 'admin') {
      toast({ 
        title: "Access Restricted", 
        description: "Admins cannot access this page.", 
        variant: "destructive" 
      });
      navigate('/admin');
      return;
    }

    // Course ID check
    if (!courseId) {
      toast({ 
        title: "Error", 
        description: "No course ID provided.", 
        variant: "destructive" 
      });
      navigate("/my-courses");
      return;
    }

    // Fetch lectures if all checks pass
    fetchLectures();
  }, [user, navigate, courseId, toast]);

  const fetchLectures = async () => {
    if (!courseId) return;
    
    try {
      setLoading(true);
      const response = await getLectures(courseId);
      setLectures(response.lectures || []);
    } catch (error) {
      console.error("Failed to fetch lectures:", error);
      toast({ 
        title: "Error", 
        description: "Failed to load lectures.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!courseId) {
      toast({ 
        title: "Error", 
        description: "Cannot add lecture: Course ID is missing.", 
        variant: "destructive" 
      });
      return;
    }

    if (!newLecture.title || !newLecture.url) {
      toast({ 
        title: "Error", 
        description: "Title and URL are required.", 
        variant: "destructive" 
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await addLecture(courseId, newLecture);
      setLectures(response.lectures);
      setNewLecture({ title: "", url: "", duration: "" });
      toast({ title: "Success", description: "Lecture added!" });

      // Update the course flag
      await updateCourseFlags(courseId, { hasLectures: true });
    } catch (error) {
      console.error("Failed to add lecture:", error);
      toast({ 
        title: "Error", 
        description: "Failed to add lecture.", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLecture = async (lectureId: string) => {
    if (!courseId) {
      toast({ 
        title: "Error", 
        description: "Cannot delete lecture: Course ID is missing.", 
        variant: "destructive" 
      });
      return;
    }
    
    if (!window.confirm("Are you sure you want to delete this lecture?")) {
      return;
    }
    
    try {
      const response = await deleteLecture(courseId, lectureId);
      setLectures(response.lectures);
      toast({ title: "Success", description: "Lecture deleted." });

      // If no lectures are left, update the flag
      if (response.lectures.length === 0) {
        await updateCourseFlags(courseId, { hasLectures: false });
      }
    } catch (error) {
      console.error("Failed to delete lecture:", error);
      toast({ 
        title: "Error", 
        description: "Failed to delete lecture.", 
        variant: "destructive" 
      });
    }
  };

  const getFullUrl = (url: string) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-24 px-4 max-w-6xl mx-auto pb-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
              <Video size={32} className="text-primary" />
              Lectures
            </h1>
            <p className="text-muted-foreground">
              {subject && level ? `${subject} (${level})` : 'Course Lectures'}
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate("/my-courses")}
            className="flex items-center gap-2 text-primary"
          >
            <ArrowLeft size={20} /> Back to Courses
          </Button>
        </div>

        {/* Add New Lecture Form */}
        <div className="bg-card rounded-xl p-6 shadow-md border border-border mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Lecture</h2>
          <form onSubmit={handleAddLecture} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Lecture Title*"
                value={newLecture.title}
                onChange={(e) => setNewLecture({ ...newLecture, title: e.target.value })}
                className="bg-secondary"
                required
              />
              <Input
                placeholder="Video URL (e.g., YouTube)*"
                value={newLecture.url}
                onChange={(e) => setNewLecture({ ...newLecture, url: e.target.value })}
                className="bg-secondary"
                required
              />
              <Input
                placeholder="Duration (e.g., 10:30)"
                value={newLecture.duration}
                onChange={(e) => setNewLecture({ ...newLecture, duration: e.target.value })}
                className="bg-secondary"
              />
            </div>
            <Button type="submit" className="bg-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 size={18} className="mr-2 animate-spin" />
              ) : (
                <Plus size={18} className="mr-2" />
              )}
              Add Lecture
            </Button>
          </form>
        </div>

        {/* Display Lectures */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin h-10 w-10 text-primary" />
          </div>
        ) : lectures.length === 0 ? (
          <div className="text-center bg-card border border-border rounded-xl p-12">
            <Video size={48} className="text-primary opacity-50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Lectures Yet</h3>
            <p className="text-muted-foreground">Add your first lecture using the form above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {lectures.map((lecture) => (
              <div 
                key={lecture._id} 
                className="bg-card p-4 rounded-xl border border-border flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-secondary p-3 rounded-lg">
                    <Video size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">{lecture.title}</h3>
                    {lecture.duration && (
                      <p className="text-sm text-muted-foreground">{lecture.duration}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <a 
                    href={getFullUrl(lecture.url)}
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="flex items-center gap-2">
                      Watch <ExternalLink size={16} />
                    </Button>
                  </a>
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    onClick={() => handleDeleteLecture(lecture._id)}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LecturesPage;