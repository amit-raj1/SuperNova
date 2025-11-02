import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { FileText, Upload, X, Check, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import {
  generateNotesFromPdf,
  getPdfNotes,
  saveNotesToCourse,
} from "../services/pdfService";

const PdfNotesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { courseId, subject, level } = location.state || {
    courseId: "",
    subject: "",
    level: "",
  };

  // Redirect admin users to admin dashboard
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

  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedNotes, setGeneratedNotes] = useState(null);
  const [notesSaved, setNotesSaved] = useState(false);
  const [existingNotes, setExistingNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch existing PDF notes when component mounts
  useEffect(() => {
    if (courseId) {
      fetchExistingNotes();
    }
  }, [courseId]);

  const fetchExistingNotes = async () => {
    if (!courseId) return;
    try {
      setLoadingNotes(true);
      const response = await getPdfNotes(courseId);
      if (response && response.pdfNotes) {
        setExistingNotes(response.pdfNotes);
      }
    } catch (error) {
      console.error("Failed to fetch PDF notes:", error);
      toast({
        title: "Error",
        description: "Failed to load existing PDF notes",
        variant: "destructive",
      });
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF file",
          variant: "destructive",
        });
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF file",
          variant: "destructive",
        });
      }
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();
  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!file) return;
    if (!courseId) {
      toast({
        title: "Error",
        description: "Course ID is required to generate notes from PDF",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => (prev >= 95 ? 95 : prev + 5));
    }, 100);

    try {
      const response = await generateNotesFromPdf(courseId, file, false);
      clearInterval(progressInterval);
      setUploadProgress(100);
      setIsUploading(false);
      setIsProcessing(true);

      if (response && response.notes) {
        setTimeout(() => {
          setIsProcessing(false);
          setGeneratedNotes(response.notes);
          toast({
            title: "Success",
            description: "PDF notes generated successfully!",
          });
        }, 1000);
      } else {
        throw new Error("Failed to generate notes from PDF");
      }
    } catch (error) {
      console.error("Failed to generate notes from PDF:", error);
      clearInterval(progressInterval);
      setUploadProgress(0);
      setIsUploading(false);
      toast({
        title: "Error",
        description: "Failed to generate notes from PDF. Please try again.",
        variant: "destructive",
      });

      // Mock notes for demo
      setTimeout(() => {
        setIsProcessing(false);
        setGeneratedNotes(
          `# ${subject}: ${level} Level Study Notes

## Introduction
AI-generated sample notes for demonstration...`
        );
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />
      <div className="pt-24 px-4 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
              <FileText size={32} className="text-primary" />
              Generate Notes from PDF
            </h1>
            <p className="text-muted-foreground">
              {subject} ({level})
            </p>
          </div>
          <button
            onClick={() => navigate("/my-courses")}
            className="flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft size={20} /> Back to Courses
          </button>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-md border border-border">
          {!generatedNotes ? (
            <>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center ${
                  isDragging
                    ? "border-primary/60 bg-primary/10"
                    : "border-border hover:border-primary/40 hover:bg-muted/30"
                } transition-all`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {!file ? (
                  <div className="flex flex-col items-center">
                    <Upload size={48} className="text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">
                      Drag & Drop your PDF here
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      or click to browse your files
                    </p>
                    <Button onClick={handleUploadClick}>Select PDF</Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="application/pdf"
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-3 bg-muted p-3 rounded-lg w-full max-w-md mb-6">
                      <FileText size={24} className="text-primary" />
                      <div className="flex-1 truncate">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={handleRemoveFile}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {isUploading && (
                      <div className="w-full max-w-md mb-6">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} className="h-2" />
                      </div>
                    )}

                    {!isUploading && !isProcessing && (
                      <Button onClick={handleSubmit}>Generate Notes</Button>
                    )}

                    {isProcessing && (
                      <div className="flex flex-col items-center">
                        <Loader2
                          size={32}
                          className="animate-spin text-primary mb-4"
                        />
                        <p>Processing your PDF and generating notes...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Steps Section */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">How it works</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { step: "1", title: "Upload PDF", desc: "Upload your study material." },
                    { step: "2", title: "AI Processing", desc: "AI analyzes and extracts key info." },
                    { step: "3", title: "Get Notes", desc: "Receive structured, concise notes." },
                  ].map((s) => (
                    <div
                      key={s.step}
                      className="bg-muted p-4 rounded-lg border border-border"
                    >
                      <div className="bg-primary/20 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                        <span className="text-primary font-bold">{s.step}</span>
                      </div>
                      <h4 className="font-medium text-lg mb-2">{s.title}</h4>
                      <p className="text-muted-foreground">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Existing Notes */}
              {loadingNotes ? (
                <div className="mt-12 flex justify-center">
                  <div className="flex flex-col items-center">
                    <Loader2
                      size={32}
                      className="animate-spin text-primary mb-4"
                    />
                    <p className="text-muted-foreground">
                      Loading your existing PDF notes...
                    </p>
                  </div>
                </div>
              ) : existingNotes.length > 0 && !generatedNotes ? (
                <div className="mt-12 border-t border-border pt-8">
                  <h3 className="text-xl font-semibold mb-6">
                    Your Existing PDF Notes
                  </h3>
                  <div className="space-y-6">
                    {existingNotes.map((note, index) => (
                      <div
                        key={note._id || index}
                        className="bg-muted p-6 rounded-xl border border-border"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/20 p-2 rounded-full">
                              <FileText size={20} className="text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium text-lg">
                                {note.fileName}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Created on{" "}
                                {new Date(note.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setGeneratedNotes(note.notes)}
                          >
                            View Notes
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-6 bg-primary/10 p-4 rounded-lg border border-primary/30">
                <Check size={22} className="text-primary" />
                <div>
                  <p className="font-bold text-primary">
                    {notesSaved
                      ? "Notes saved to your course!"
                      : "Notes successfully generated!"}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {notesSaved
                      ? "You can view these notes in My Courses section"
                      : "Your notes are ready to view and save"}
                  </p>
                </div>
              </div>

              <div className="bg-muted p-8 rounded-xl border border-border whitespace-pre-line overflow-auto shadow-inner max-h-[70vh]">
                <div className="prose-lg">{generatedNotes}</div>
              </div>

              <div className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
                {!notesSaved ? (
                  <Button
                    onClick={async () => {
                      if (!courseId || !generatedNotes) return;
                      try {
                        setIsSaving(true);
                        const fileName = `${subject} ${level} Notes - ${new Date().toLocaleDateString()}`;
                        await saveNotesToCourse(courseId, generatedNotes, fileName);
                        setIsSaving(false);
                        setNotesSaved(true);
                        toast({
                          title: "Notes Saved",
                          description: "Your notes have been saved to your course.",
                        });
                      } catch (error) {
                        setIsSaving(false);
                        toast({
                          title: "Error",
                          description: "Failed to save notes. Try again.",
                          variant: "destructive",
                        });
                      }
                    }}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Notes"
                    )}
                  </Button>
                ) : (
                  <Button onClick={() => navigate("/my-courses")}>
                    View in My Courses
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => {
                    setGeneratedNotes(null);
                    setFile(null);
                    setNotesSaved(false);
                  }}
                >
                  Generate New Notes
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfNotesPage;
