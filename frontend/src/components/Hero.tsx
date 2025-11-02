import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  BrainCircuit,
  BookOpen,
  Trophy,
  LineChart,
  Sparkles,
} from "lucide-react";

const Home = () => {
  const heroRef = useRef(null);
  const featuresRef = useRef<HTMLDivElement[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    gsap.fromTo(
      heroRef.current,
      { opacity: 0, y: 60 },
      { opacity: 1, y: 0, duration: 1.5, ease: "power3.out" }
    );

    gsap.fromTo(
      featuresRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        stagger: 0.2,
        delay: 0.8,
      }
    );
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-500">
      {/* ---------------- HERO SECTION ---------------- */}
      <section
        ref={heroRef}
        className="relative h-screen flex flex-col justify-center items-center text-center overflow-hidden"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
        >
          <source src="/bg.mp4" type="video/mp4" />
        </video>

        {/* Overlay */}
        <div className="absolute inset-0 z-10 bg-background/70 backdrop-blur-sm" />

        {/* Content */}
        <div className="z-20 max-w-4xl px-6">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            Empower Your Mind with{" "}
            <span className="text-primary">AI Learning</span>
          </h1>
          <p className="text-lg md:text-xl mb-10 text-muted-foreground">
            Learn smarter, not harder — personalized courses, adaptive quizzes,
            and AI-driven progress tracking. Designed for learners who dream big.
          </p>
          <Link to={user ? "/CourseSetup" : "/login"}>
            <button className="bg-primary hover:opacity-90 text-primary-foreground text-lg px-8 py-3 rounded-full shadow-lg transition duration-300 transform hover:scale-105">
              Get Started
            </button>
          </Link>
        </div>
      </section>

      {/* ---------------- FEATURE SECTION ---------------- */}
      <section className="py-20 relative z-20 bg-secondary">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-primary">
            Why Choose Our Platform?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              {
                icon: (
                  <BrainCircuit
                    size={40}
                    className="text-primary mb-4 mx-auto"
                  />
                ),
                title: "AI-Powered Courses",
                desc: "Courses are dynamically generated based on your skill level and interests using AI.",
              },
              {
                icon: (
                  <BookOpen size={40} className="text-blue-400 mb-4 mx-auto" />
                ),
                title: "Smart Notes & Quizzes",
                desc: "Automatically generate detailed notes and quizzes for every topic to strengthen learning.",
              },
              {
                icon: (
                  <LineChart size={40} className="text-green-400 mb-4 mx-auto" />
                ),
                title: "Gamified Progress",
                desc: "Track achievements, earn rewards, and level up while learning with an interactive dashboard.",
              },
              {
                icon: (
                  <Trophy size={40} className="text-yellow-400 mb-4 mx-auto" />
                ),
                title: "Personalized Growth",
                desc: "Adaptive AI adjusts content difficulty and recommendations to match your performance.",
              },
            ].map((f, i) => (
              <div
                key={i}
                ref={(el) => (featuresRef.current[i] = el!)}
                className="p-8 rounded-2xl shadow-lg border border-border bg-card transition-all duration-300 hover:scale-105 hover:border-primary hover:shadow-[0_0_20px_hsl(var(--primary)_/_0.25)]"
              >
                {f.icon}
                <h3 className="text-xl font-semibold mb-3 text-card-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- ABOUT SECTION ---------------- */}
      <section className="py-24 text-center relative z-20 bg-background transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-10 text-primary">
            Revolutionizing Learning with SuperNova
          </h2>
          <p className="text-lg leading-relaxed mb-10 text-muted-foreground">
            SuperNova is more than a learning platform — it's your AI study
            companion. From generating personalized study material and quizzes to
            organizing time with smart timetables, we combine machine
            intelligence with human curiosity. Built for students, professionals,
            and lifelong learners who aim to master new skills efficiently.
          </p>

          <Link to={user ? "/dashboard" : "/signup"}>
            <button className="bg-primary hover:opacity-90 text-primary-foreground px-8 py-3 text-lg rounded-full shadow-lg transition duration-300">
              Join the Revolution
            </button>
          </Link>
        </div>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="py-10 text-center border-t border-border bg-secondary transition-colors duration-500">
        <div className="flex justify-center mb-4 items-center">
          <Sparkles
            className="mr-2 text-primary"
            size={22}
          />
          <h3 className="text-xl font-bold text-primary">
            SuperNova
          </h3>
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} SuperNova AI Learning Platform. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
};

export default Home;