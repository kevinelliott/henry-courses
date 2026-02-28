"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Student, Goal } from "./Dashboard";

interface Props { tutorId: string; students: Student[]; goals: Goal[]; onRefresh: () => void; }

export default function GoalTracker({ tutorId, students, goals, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ student_id: "", title: "", description: "", target_date: "" });

  const addGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("goals").insert({ tutor_id: tutorId, ...form, target_date: form.target_date || null });
    setForm({ student_id: "", title: "", description: "", target_date: "" });
    setShowForm(false);
    onRefresh();
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("goals").update({ status }).eq("id", id);
    onRefresh();
  };

  const studentName = (id: string) => students.find(s => s.id === id)?.name || "Unknown";

  // Goal urgency: days until target
  const urgency = (g: Goal) => {
    if (!g.target_date || g.status !== "active") return { label: "", color: "" };
    const days = Math.ceil((new Date(g.target_date).getTime() - Date.now()) / 86400000);
    if (days < 0) return { label: `${Math.abs(days)}d overdue`, color: "text-red-600 bg-red-50" };
    if (days <= 7) return { label: `${days}d left`, color: "text-orange-600 bg-orange-50" };
    if (days <= 30) return { label: `${days}d left`, color: "text-yellow-600 bg-yellow-50" };
    return { label: `${days}d left`, color: "text-green-600 bg-green-50" };
  };

  const activeGoals = goals.filter(g => g.status === "active");
  const achievedGoals = goals.filter(g => g.status === "achieved");
  const abandonedGoals = goals.filter(g => g.status === "abandoned");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Goals</h2>
        <button onClick={() => setShowForm(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">+ Goal</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
          <div className="text-3xl font-bold text-indigo-600">{activeGoals.length}</div>
          <div className="text-sm text-slate-500">Active</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
          <div className="text-3xl font-bold text-green-600">{achievedGoals.length}</div>
          <div className="text-sm text-slate-500">Achieved</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
          <div className="text-3xl font-bold text-slate-400">{abandonedGoals.length}</div>
          <div className="text-sm text-slate-500">Abandoned</div>
        </div>
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div className="mb-8">
          <h3 className="font-bold text-lg mb-3">🎯 Active Goals</h3>
          <div className="space-y-3">
            {activeGoals.map(g => {
              const u = urgency(g);
              return (
                <div key={g.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold">{g.title}</span>
                      <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{studentName(g.student_id)}</span>
                      {u.label && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.color}`}>{u.label}</span>}
                    </div>
                    {g.description && <p className="text-sm text-slate-500">{g.description}</p>}
                    {g.target_date && <p className="text-xs text-slate-400 mt-1">Target: {g.target_date}</p>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => updateStatus(g.id, "achieved")} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">✓ Achieved</button>
                    <button onClick={() => updateStatus(g.id, "abandoned")} className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded hover:bg-slate-200">✗</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Achieved Goals */}
      {achievedGoals.length > 0 && (
        <div className="mb-8">
          <h3 className="font-bold text-lg mb-3">🏆 Achieved</h3>
          <div className="space-y-2">
            {achievedGoals.map(g => (
              <div key={g.id} className="bg-green-50 rounded-lg p-3 border border-green-200 flex items-center gap-2">
                <span className="font-medium">{g.title}</span>
                <span className="text-xs text-slate-500">{studentName(g.student_id)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {goals.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <p className="text-4xl mb-2">🎯</p>
          <p>No goals set yet. Set goals for your students to track their progress.</p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={addGoal} className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Set a Goal</h3>
            <label className="block text-sm font-medium mb-1">Student *</label>
            <select value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })} className="w-full border rounded-lg px-3 py-2 mb-3" required>
              <option value="">Select...</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <label className="block text-sm font-medium mb-1">Goal Title *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full border rounded-lg px-3 py-2 mb-3" placeholder="e.g. Master quadratic equations" required />
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border rounded-lg px-3 py-2 h-16 mb-3" placeholder="What does success look like?" />
            <label className="block text-sm font-medium mb-1">Target Date</label>
            <input type="date" value={form.target_date} onChange={e => setForm({ ...form, target_date: e.target.value })} className="w-full border rounded-lg px-3 py-2 mb-4" />
            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700">Set Goal</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
