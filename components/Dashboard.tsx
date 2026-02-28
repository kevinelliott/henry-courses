"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import StudentManager from "./StudentManager";
import SessionLogger from "./SessionLogger";
import SkillTracker from "./SkillTracker";
import Analytics from "./Analytics";
import GoalTracker from "./GoalTracker";

interface Props { tutorId: string; tutorName: string; onLogout: () => void; }

type Tab = "students" | "sessions" | "skills" | "goals" | "analytics";

export interface Student { id: string; tutor_id: string; name: string; grade: string; parent_name: string; parent_email: string; parent_phone: string; status: string; started_at: string; }
export interface Subject { id: string; tutor_id: string; name: string; category: string; }
export interface Session { id: string; tutor_id: string; student_id: string; subject_id: string; scheduled_date: string; duration_minutes: number; amount: number; status: string; topics_covered: string; homework_assigned: string; engagement_score: number; comprehension_score: number; notes: string; }
export interface Assessment { id: string; tutor_id: string; student_id: string; subject_id: string; skill_name: string; score: number; assessed_at: string; notes: string; }
export interface Goal { id: string; tutor_id: string; student_id: string; title: string; description: string; target_date: string; status: string; }

export default function Dashboard({ tutorId, tutorName, onLogout }: Props) {
  const [tab, setTab] = useState<Tab>("students");
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  const load = useCallback(async () => {
    const [s1, s2, s3, s4, s5] = await Promise.all([
      supabase.from("students").select("*").eq("tutor_id", tutorId).order("name"),
      supabase.from("subjects").select("*").eq("tutor_id", tutorId).order("name"),
      supabase.from("sessions").select("*").eq("tutor_id", tutorId).order("scheduled_date", { ascending: false }),
      supabase.from("assessments").select("*").eq("tutor_id", tutorId).order("assessed_at", { ascending: false }),
      supabase.from("goals").select("*").eq("tutor_id", tutorId).order("created_at", { ascending: false }),
    ]);
    if (s1.data) setStudents(s1.data);
    if (s2.data) setSubjects(s2.data);
    if (s3.data) setSessions(s3.data);
    if (s4.data) setAssessments(s4.data);
    if (s5.data) setGoals(s5.data);
  }, [tutorId]);

  useEffect(() => { load(); }, [load]);

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "students", label: "Students", icon: "👥" },
    { key: "sessions", label: "Sessions", icon: "📅" },
    { key: "skills", label: "Skills", icon: "📈" },
    { key: "goals", label: "Goals", icon: "🎯" },
    { key: "analytics", label: "Analytics", icon: "📊" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">T</div>
          <span className="font-bold text-indigo-900">TutorPulse</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-600">{tutorName}</span>
        </div>
        <button onClick={onLogout} className="text-sm text-slate-500 hover:text-slate-700">Sign Out</button>
      </header>

      <nav className="bg-white border-b border-slate-200 px-6">
        <div className="flex gap-1">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition ${tab === t.key ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-6">
        {tab === "students" && <StudentManager tutorId={tutorId} students={students} subjects={subjects} onRefresh={load} />}
        {tab === "sessions" && <SessionLogger tutorId={tutorId} students={students} subjects={subjects} sessions={sessions} onRefresh={load} />}
        {tab === "skills" && <SkillTracker tutorId={tutorId} students={students} subjects={subjects} assessments={assessments} onRefresh={load} />}
        {tab === "goals" && <GoalTracker tutorId={tutorId} students={students} goals={goals} onRefresh={load} />}
        {tab === "analytics" && <Analytics tutorId={tutorId} students={students} sessions={sessions} assessments={assessments} goals={goals} />}
      </main>
    </div>
  );
}
