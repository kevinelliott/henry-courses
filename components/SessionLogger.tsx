"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Student, Subject, Session } from "./Dashboard";

interface Props { tutorId: string; students: Student[]; subjects: Subject[]; sessions: Session[]; onRefresh: () => void; }

export default function SessionLogger({ tutorId, students, subjects, sessions, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    student_id: "", subject_id: "", scheduled_date: new Date().toISOString().split("T")[0],
    duration_minutes: "60", amount: "", status: "completed",
    topics_covered: "", homework_assigned: "", engagement_score: "5", comprehension_score: "5", notes: ""
  });

  const addSession = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("sessions").insert({
      tutor_id: tutorId, student_id: form.student_id, subject_id: form.subject_id || null,
      scheduled_date: form.scheduled_date, duration_minutes: parseInt(form.duration_minutes),
      amount: parseFloat(form.amount) || 0, status: form.status,
      topics_covered: form.topics_covered, homework_assigned: form.homework_assigned,
      engagement_score: parseInt(form.engagement_score), comprehension_score: parseInt(form.comprehension_score),
      notes: form.notes
    });
    setShowForm(false);
    onRefresh();
  };

  const studentName = (id: string) => students.find(s => s.id === id)?.name || "Unknown";
  const subjectName = (id: string) => subjects.find(s => s.id === id)?.name || "";
  const statusIcon = (s: string) => s === "completed" ? "✅" : s === "cancelled" ? "❌" : s === "no-show" ? "⚠️" : "📅";

  // Engagement × Comprehension quadrant label
  const quadrant = (e: number, c: number) => {
    if (e >= 6 && c >= 6) return { label: "Thriving", color: "text-green-600" };
    if (e >= 6 && c < 6) return { label: "Trying Hard", color: "text-yellow-600" };
    if (e < 6 && c >= 6) return { label: "Bored/Easy", color: "text-blue-600" };
    return { label: "Struggling", color: "text-red-600" };
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Sessions</h2>
        <button onClick={() => setShowForm(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">+ Log Session</button>
      </div>

      <div className="space-y-3">
        {sessions.map(s => {
          const q = quadrant(s.engagement_score, s.comprehension_score);
          return (
            <div key={s.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex items-start gap-4">
              <div className="text-2xl">{statusIcon(s.status)}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold">{studentName(s.student_id)}</span>
                  {subjectName(s.subject_id) && <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full">{subjectName(s.subject_id)}</span>}
                  <span className={`text-xs font-medium ${q.color}`}>{q.label}</span>
                </div>
                <p className="text-sm text-slate-500">{s.scheduled_date} · {s.duration_minutes}min · ${s.amount}</p>
                {s.topics_covered && <p className="text-sm mt-1"><span className="font-medium">Topics:</span> {s.topics_covered}</p>}
                {s.homework_assigned && <p className="text-sm mt-1"><span className="font-medium">Homework:</span> {s.homework_assigned}</p>}
                <div className="flex gap-4 mt-2 text-xs text-slate-500">
                  <span>Engagement: {s.engagement_score}/10</span>
                  <span>Comprehension: {s.comprehension_score}/10</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sessions.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <p className="text-4xl mb-2">📅</p>
          <p>No sessions logged yet. Log your first session to start tracking progress.</p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <form onSubmit={addSession} className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl my-8">
            <h3 className="text-xl font-bold mb-4">Log Session</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm font-medium mb-1">Student *</label>
                <select value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })} className="w-full border rounded-lg px-3 py-2" required>
                  <option value="">Select...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <select value={form.subject_id} onChange={e => setForm({ ...form, subject_id: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                  <option value="">None</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-sm font-medium mb-1">Date *</label>
                <input type="date" value={form.scheduled_date} onChange={e => setForm({ ...form, scheduled_date: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration (min)</label>
                <input type="number" value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount ($)</label>
                <input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                <option value="completed">Completed</option>
                <option value="scheduled">Scheduled</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No-Show</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Topics Covered</label>
              <input value={form.topics_covered} onChange={e => setForm({ ...form, topics_covered: e.target.value })} className="w-full border rounded-lg px-3 py-2" placeholder="e.g. Quadratic equations, factoring" />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Homework Assigned</label>
              <input value={form.homework_assigned} onChange={e => setForm({ ...form, homework_assigned: e.target.value })} className="w-full border rounded-lg px-3 py-2" placeholder="e.g. Problems 1-20, Chapter 5" />
            </div>

            {/* Engagement & Comprehension sliders */}
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm font-medium mb-1">Engagement: {form.engagement_score}/10</label>
                <input type="range" min="1" max="10" value={form.engagement_score} onChange={e => setForm({ ...form, engagement_score: e.target.value })} className="w-full accent-indigo-600" />
                <div className="flex justify-between text-xs text-slate-400"><span>Distracted</span><span>Focused</span></div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Comprehension: {form.comprehension_score}/10</label>
                <input type="range" min="1" max="10" value={form.comprehension_score} onChange={e => setForm({ ...form, comprehension_score: e.target.value })} className="w-full accent-indigo-600" />
                <div className="flex justify-between text-xs text-slate-400"><span>Lost</span><span>Mastered</span></div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full border rounded-lg px-3 py-2 h-20" placeholder="Private notes about this session..." />
            </div>

            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700">Log Session</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
