"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Student, Subject, Assessment } from "./Dashboard";

interface Props { tutorId: string; students: Student[]; subjects: Subject[]; assessments: Assessment[]; onRefresh: () => void; }

export default function SkillTracker({ tutorId, students, subjects, assessments, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [form, setForm] = useState({ student_id: "", subject_id: "", skill_name: "", score: "5", notes: "" });

  const addAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("assessments").insert({
      tutor_id: tutorId, student_id: form.student_id, subject_id: form.subject_id || null,
      skill_name: form.skill_name, score: parseInt(form.score), notes: form.notes
    });
    setShowForm(false);
    setForm({ student_id: "", subject_id: "", skill_name: "", score: "5", notes: "" });
    onRefresh();
  };

  const studentName = (id: string) => students.find(s => s.id === id)?.name || "Unknown";

  // Build skill trajectories per student
  const filteredAssessments = selectedStudent ? assessments.filter(a => a.student_id === selectedStudent) : assessments;

  // Group by student → skill → chronological scores
  const trajectories: Record<string, Record<string, { score: number; date: string }[]>> = {};
  filteredAssessments.forEach(a => {
    const sName = studentName(a.student_id);
    if (!trajectories[sName]) trajectories[sName] = {};
    if (!trajectories[sName][a.skill_name]) trajectories[sName][a.skill_name] = [];
    trajectories[sName][a.skill_name].push({ score: a.score, date: a.assessed_at });
  });

  // Sort each skill's entries chronologically
  Object.values(trajectories).forEach(skills => {
    Object.values(skills).forEach(entries => entries.sort((a, b) => a.date.localeCompare(b.date)));
  });

  // Calculate trend for a skill
  const trend = (entries: { score: number }[]) => {
    if (entries.length < 2) return { dir: "—", color: "text-slate-400" };
    const last = entries[entries.length - 1].score;
    const prev = entries[entries.length - 2].score;
    if (last > prev) return { dir: "↑", color: "text-green-600" };
    if (last < prev) return { dir: "↓", color: "text-red-600" };
    return { dir: "→", color: "text-yellow-600" };
  };

  const scoreColor = (s: number) => s >= 8 ? "bg-green-500" : s >= 6 ? "bg-yellow-500" : s >= 4 ? "bg-orange-500" : "bg-red-500";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Skill Tracking</h2>
        <div className="flex gap-2">
          <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            <option value="">All Students</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button onClick={() => setShowForm(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">+ Assessment</button>
        </div>
      </div>

      {/* Skill Trajectories */}
      {Object.entries(trajectories).map(([student, skills]) => (
        <div key={student} className="mb-8">
          <h3 className="font-bold text-lg mb-3">{student}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(skills).map(([skill, entries]) => {
              const t = trend(entries);
              const latest = entries[entries.length - 1];
              return (
                <div key={skill} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{skill}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${t.color}`}>{t.dir}</span>
                      <span className="text-2xl font-bold">{latest.score}/10</span>
                    </div>
                  </div>
                  {/* Visual trajectory bar */}
                  <div className="flex items-end gap-1 h-12">
                    {entries.map((e, i) => (
                      <div key={i} className="flex flex-col items-center flex-1" title={`${e.date}: ${e.score}/10`}>
                        <div className={`w-full rounded-t ${scoreColor(e.score)}`} style={{ height: `${e.score * 10}%` }} />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>{entries[0]?.date}</span>
                    {entries.length > 1 && <span>{latest.date}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {Object.keys(trajectories).length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <p className="text-4xl mb-2">📈</p>
          <p>No skill assessments yet. Add assessments to track student progress over time.</p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={addAssessment} className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Add Skill Assessment</h3>
            <label className="block text-sm font-medium mb-1">Student *</label>
            <select value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })} className="w-full border rounded-lg px-3 py-2 mb-3" required>
              <option value="">Select...</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <select value={form.subject_id} onChange={e => setForm({ ...form, subject_id: e.target.value })} className="w-full border rounded-lg px-3 py-2 mb-3">
              <option value="">None</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <label className="block text-sm font-medium mb-1">Skill Name *</label>
            <input value={form.skill_name} onChange={e => setForm({ ...form, skill_name: e.target.value })} className="w-full border rounded-lg px-3 py-2 mb-3" placeholder="e.g. Factoring, Verb Conjugation, Essay Structure" required />
            <label className="block text-sm font-medium mb-1">Score: {form.score}/10</label>
            <input type="range" min="1" max="10" value={form.score} onChange={e => setForm({ ...form, score: e.target.value })} className="w-full accent-indigo-600 mb-3" />
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full border rounded-lg px-3 py-2 h-16 mb-4" />
            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700">Add Assessment</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
