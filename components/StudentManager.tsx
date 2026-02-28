"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Student, Subject } from "./Dashboard";

interface Props { tutorId: string; students: Student[]; subjects: Subject[]; onRefresh: () => void; }

export default function StudentManager({ tutorId, students, subjects, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [form, setForm] = useState({ name: "", grade: "", parent_name: "", parent_email: "", parent_phone: "" });
  const [subjectForm, setSubjectForm] = useState({ name: "", category: "" });

  const addStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("students").insert({ ...form, tutor_id: tutorId });
    setForm({ name: "", grade: "", parent_name: "", parent_email: "", parent_phone: "" });
    setShowForm(false);
    onRefresh();
  };

  const addSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("subjects").insert({ ...subjectForm, tutor_id: tutorId });
    setSubjectForm({ name: "", category: "" });
    setShowSubjectForm(false);
    onRefresh();
  };

  const toggleStatus = async (s: Student) => {
    const next = s.status === "active" ? "paused" : "active";
    await supabase.from("students").update({ status: next }).eq("id", s.id);
    onRefresh();
  };

  const statusColor = (s: string) => s === "active" ? "bg-green-100 text-green-700" : s === "paused" ? "bg-yellow-100 text-yellow-700" : s === "graduated" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Students & Subjects</h2>
        <div className="flex gap-2">
          <button onClick={() => setShowSubjectForm(true)} className="border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">+ Subject</button>
          <button onClick={() => setShowForm(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">+ Student</button>
        </div>
      </div>

      {/* Subjects */}
      {subjects.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {subjects.map(s => (
            <span key={s.id} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">{s.name}{s.category ? ` · ${s.category}` : ""}</span>
          ))}
        </div>
      )}

      {/* Student Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map(s => (
          <div key={s.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg">{s.name}</h3>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(s.status)}`}>{s.status}</span>
            </div>
            {s.grade && <p className="text-sm text-slate-500 mb-1">Grade: {s.grade}</p>}
            {s.parent_name && <p className="text-sm text-slate-500 mb-1">Parent: {s.parent_name}</p>}
            {s.parent_email && <p className="text-sm text-slate-500 mb-1">📧 {s.parent_email}</p>}
            <div className="mt-3 flex gap-2">
              <button onClick={() => toggleStatus(s)} className="text-xs border px-2 py-1 rounded hover:bg-slate-50">
                {s.status === "active" ? "Pause" : "Activate"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {students.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <p className="text-4xl mb-2">👥</p>
          <p>No students yet. Add your first student to get started.</p>
        </div>
      )}

      {/* Add Student Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={addStudent} className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Add Student</h3>
            <label className="block text-sm font-medium mb-1">Student Name *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 mb-3" required />
            <label className="block text-sm font-medium mb-1">Grade</label>
            <input value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })} className="w-full border rounded-lg px-3 py-2 mb-3" placeholder="e.g. 8th, 10th, College" />
            <label className="block text-sm font-medium mb-1">Parent Name</label>
            <input value={form.parent_name} onChange={e => setForm({ ...form, parent_name: e.target.value })} className="w-full border rounded-lg px-3 py-2 mb-3" />
            <label className="block text-sm font-medium mb-1">Parent Email</label>
            <input value={form.parent_email} onChange={e => setForm({ ...form, parent_email: e.target.value })} className="w-full border rounded-lg px-3 py-2 mb-3" type="email" />
            <label className="block text-sm font-medium mb-1">Parent Phone</label>
            <input value={form.parent_phone} onChange={e => setForm({ ...form, parent_phone: e.target.value })} className="w-full border rounded-lg px-3 py-2 mb-4" />
            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700">Add Student</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Add Subject Modal */}
      {showSubjectForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={addSubject} className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Add Subject</h3>
            <label className="block text-sm font-medium mb-1">Subject Name *</label>
            <input value={subjectForm.name} onChange={e => setSubjectForm({ ...subjectForm, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 mb-3" placeholder="e.g. Algebra, SAT Prep, Spanish" required />
            <label className="block text-sm font-medium mb-1">Category</label>
            <input value={subjectForm.category} onChange={e => setSubjectForm({ ...subjectForm, category: e.target.value })} className="w-full border rounded-lg px-3 py-2 mb-4" placeholder="e.g. Math, Language, Test Prep" />
            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700">Add Subject</button>
              <button type="button" onClick={() => setShowSubjectForm(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
