"use client";
import { useState } from "react";
import type { Student, Session, Assessment, Goal } from "./Dashboard";

interface Props { tutorId: string; students: Student[]; sessions: Session[]; assessments: Assessment[]; goals: Goal[]; }

export default function Analytics({ students, sessions, assessments, goals }: Props) {
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const filtered = selectedStudent ? {
    sessions: sessions.filter(s => s.student_id === selectedStudent),
    assessments: assessments.filter(a => a.student_id === selectedStudent),
    goals: goals.filter(g => g.student_id === selectedStudent),
  } : { sessions, assessments, goals };

  const studentName = (id: string) => students.find(s => s.id === id)?.name || "Unknown";

  // ====== INTELLIGENCE LAYER 1: Revenue & Retention ======
  const completedSessions = filtered.sessions.filter(s => s.status === "completed");
  const totalRevenue = completedSessions.reduce((sum, s) => sum + s.amount, 0);
  const totalHours = completedSessions.reduce((sum, s) => sum + s.duration_minutes, 0) / 60;
  const effectiveHourlyRate = totalHours > 0 ? totalRevenue / totalHours : 0;
  const cancelledCount = filtered.sessions.filter(s => s.status === "cancelled" || s.status === "no-show").length;
  const cancellationRate = filtered.sessions.length > 0 ? (cancelledCount / filtered.sessions.length * 100) : 0;
  const lostRevenue = cancelledCount * (completedSessions.length > 0 ? totalRevenue / completedSessions.length : 0);

  // Revenue per student
  const revenueByStudent: Record<string, { revenue: number; sessions: number; hours: number }> = {};
  completedSessions.forEach(s => {
    const n = studentName(s.student_id);
    if (!revenueByStudent[n]) revenueByStudent[n] = { revenue: 0, sessions: 0, hours: 0 };
    revenueByStudent[n].revenue += s.amount;
    revenueByStudent[n].sessions += 1;
    revenueByStudent[n].hours += s.duration_minutes / 60;
  });

  // ====== INTELLIGENCE LAYER 2: Engagement × Comprehension Matrix ======
  const matrixData: { name: string; avgEng: number; avgComp: number; count: number }[] = [];
  if (!selectedStudent) {
    const byStudent: Record<string, { eng: number[]; comp: number[] }> = {};
    completedSessions.forEach(s => {
      const n = studentName(s.student_id);
      if (!byStudent[n]) byStudent[n] = { eng: [], comp: [] };
      byStudent[n].eng.push(s.engagement_score);
      byStudent[n].comp.push(s.comprehension_score);
    });
    Object.entries(byStudent).forEach(([name, d]) => {
      matrixData.push({
        name,
        avgEng: d.eng.reduce((a, b) => a + b, 0) / d.eng.length,
        avgComp: d.comp.reduce((a, b) => a + b, 0) / d.comp.length,
        count: d.eng.length,
      });
    });
  }

  const quadrantLabel = (e: number, c: number) => {
    if (e >= 5.5 && c >= 5.5) return "Thriving 🌟";
    if (e >= 5.5 && c < 5.5) return "Trying Hard 💪";
    if (e < 5.5 && c >= 5.5) return "Needs Challenge 🧠";
    return "At Risk ⚠️";
  };

  // ====== INTELLIGENCE LAYER 3: Skill Improvement Rankings ======
  const skillImprovements: { student: string; skill: string; start: number; end: number; change: number }[] = [];
  const byStudentSkill: Record<string, Record<string, { scores: { score: number; date: string }[] }>> = {};
  filtered.assessments.forEach(a => {
    const sn = studentName(a.student_id);
    if (!byStudentSkill[sn]) byStudentSkill[sn] = {};
    if (!byStudentSkill[sn][a.skill_name]) byStudentSkill[sn][a.skill_name] = { scores: [] };
    byStudentSkill[sn][a.skill_name].scores.push({ score: a.score, date: a.assessed_at });
  });
  Object.entries(byStudentSkill).forEach(([student, skills]) => {
    Object.entries(skills).forEach(([skill, data]) => {
      const sorted = data.scores.sort((a, b) => a.date.localeCompare(b.date));
      if (sorted.length >= 2) {
        skillImprovements.push({
          student, skill,
          start: sorted[0].score,
          end: sorted[sorted.length - 1].score,
          change: sorted[sorted.length - 1].score - sorted[0].score,
        });
      }
    });
  });
  skillImprovements.sort((a, b) => b.change - a.change);

  // ====== INTELLIGENCE LAYER 4: Goal Achievement Rate ======
  const totalGoals = filtered.goals.length;
  const achieved = filtered.goals.filter(g => g.status === "achieved").length;
  const active = filtered.goals.filter(g => g.status === "active").length;
  const overdue = filtered.goals.filter(g => g.status === "active" && g.target_date && new Date(g.target_date) < new Date()).length;
  const achievementRate = totalGoals > 0 ? (achieved / totalGoals * 100) : 0;

  // ====== INTELLIGENCE LAYER 5: Student Retention Risk ======
  const retentionRisks: { student: string; risk: string; color: string; reasons: string[] }[] = [];
  if (!selectedStudent) {
    students.filter(s => s.status === "active").forEach(st => {
      const reasons: string[] = [];
      const sSessions = sessions.filter(s => s.student_id === st.id);
      const sCompleted = sSessions.filter(s => s.status === "completed");
      const sCancelled = sSessions.filter(s => s.status === "cancelled" || s.status === "no-show");

      // Days since last session
      if (sCompleted.length > 0) {
        const last = sCompleted.sort((a, b) => b.scheduled_date.localeCompare(a.scheduled_date))[0];
        const days = Math.ceil((Date.now() - new Date(last.scheduled_date).getTime()) / 86400000);
        if (days > 21) reasons.push(`No session in ${days} days`);
      } else {
        reasons.push("No completed sessions");
      }

      // High cancellation rate
      if (sSessions.length >= 3 && sCancelled.length / sSessions.length > 0.3) {
        reasons.push(`${Math.round(sCancelled.length / sSessions.length * 100)}% cancellation rate`);
      }

      // Declining engagement
      if (sCompleted.length >= 3) {
        const recent = sCompleted.sort((a, b) => b.scheduled_date.localeCompare(a.scheduled_date)).slice(0, 3);
        const avgEng = recent.reduce((s, r) => s + r.engagement_score, 0) / recent.length;
        if (avgEng < 4) reasons.push(`Low recent engagement (${avgEng.toFixed(1)}/10)`);
      }

      // Declining comprehension
      if (sCompleted.length >= 3) {
        const recent = sCompleted.sort((a, b) => b.scheduled_date.localeCompare(a.scheduled_date)).slice(0, 3);
        const avgComp = recent.reduce((s, r) => s + r.comprehension_score, 0) / recent.length;
        if (avgComp < 4) reasons.push(`Low recent comprehension (${avgComp.toFixed(1)}/10)`);
      }

      const risk = reasons.length >= 3 ? "High" : reasons.length >= 1 ? "Medium" : "Low";
      const color = risk === "High" ? "bg-red-100 text-red-700 border-red-200" : risk === "Medium" ? "bg-yellow-100 text-yellow-700 border-yellow-200" : "bg-green-100 text-green-700 border-green-200";
      retentionRisks.push({ student: st.name, risk, color, reasons });
    });
    retentionRisks.sort((a, b) => b.reasons.length - a.reasons.length);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Analytics & Intelligence</h2>
        <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">All Students</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Total Revenue", value: `$${totalRevenue.toFixed(0)}`, color: "text-green-600" },
          { label: "Total Hours", value: totalHours.toFixed(1), color: "text-indigo-600" },
          { label: "Effective $/hr", value: `$${effectiveHourlyRate.toFixed(0)}`, color: "text-blue-600" },
          { label: "Cancellation Rate", value: `${cancellationRate.toFixed(0)}%`, color: cancellationRate > 15 ? "text-red-600" : "text-slate-600" },
          { label: "Revenue Lost", value: `$${lostRevenue.toFixed(0)}`, color: "text-red-600" },
        ].map(m => (
          <div key={m.label} className="bg-white rounded-xl p-4 shadow-sm border text-center">
            <div className={`text-2xl font-bold ${m.color}`}>{m.value}</div>
            <div className="text-xs text-slate-500 mt-1">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Revenue per Student */}
      {Object.keys(revenueByStudent).length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border mb-8">
          <h3 className="font-bold text-lg mb-3">💰 Revenue by Student</h3>
          <div className="space-y-2">
            {Object.entries(revenueByStudent).sort((a, b) => b[1].revenue - a[1].revenue).map(([name, d]) => (
              <div key={name} className="flex items-center gap-3">
                <span className="w-32 font-medium truncate">{name}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full flex items-center justify-end px-2" style={{ width: `${Math.max(5, d.revenue / Math.max(...Object.values(revenueByStudent).map(r => r.revenue)) * 100)}%` }}>
                    <span className="text-xs text-white font-medium">${d.revenue.toFixed(0)}</span>
                  </div>
                </div>
                <span className="text-sm text-slate-500 w-24 text-right">{d.sessions} sessions</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Engagement × Comprehension Matrix */}
      {matrixData.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border mb-8">
          <h3 className="font-bold text-lg mb-1">🧠 Engagement × Comprehension Matrix</h3>
          <p className="text-sm text-slate-500 mb-4">Where each student falls on engagement vs understanding</p>
          <div className="relative bg-slate-50 rounded-lg p-4" style={{ minHeight: 300 }}>
            {/* Axis labels */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-slate-400 font-medium">Comprehension →</div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-slate-400 font-medium">Engagement →</div>
            {/* Quadrant labels */}
            <div className="absolute top-2 left-8 text-xs text-blue-400">Needs Challenge 🧠</div>
            <div className="absolute top-2 right-2 text-xs text-green-400">Thriving 🌟</div>
            <div className="absolute bottom-6 left-8 text-xs text-red-400">At Risk ⚠️</div>
            <div className="absolute bottom-6 right-2 text-xs text-yellow-400">Trying Hard 💪</div>
            {/* Center lines */}
            <div className="absolute top-0 bottom-0 left-1/2 border-l border-dashed border-slate-300" />
            <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-slate-300" />
            {/* Student dots */}
            {matrixData.map(d => {
              const x = ((d.avgEng - 1) / 9) * 85 + 5;
              const y = 95 - ((d.avgComp - 1) / 9) * 85;
              return (
                <div key={d.name} className="absolute flex flex-col items-center" style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}>
                  <div className="w-8 h-8 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center font-bold shadow">{d.name.charAt(0)}</div>
                  <span className="text-xs font-medium mt-1 bg-white px-1 rounded shadow-sm">{d.name}</span>
                </div>
              );
            })}
          </div>
          {/* Legend */}
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            {matrixData.map(d => (
              <div key={d.name} className="flex items-center gap-1">
                <span className="font-medium">{d.name}:</span>
                <span className="text-slate-500">{quadrantLabel(d.avgEng, d.avgComp)} ({d.count} sessions)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skill Improvements */}
      {skillImprovements.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border mb-8">
          <h3 className="font-bold text-lg mb-3">📈 Biggest Skill Improvements</h3>
          <div className="space-y-2">
            {skillImprovements.slice(0, 10).map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className={`text-lg font-bold w-12 ${s.change > 0 ? "text-green-600" : s.change < 0 ? "text-red-600" : "text-slate-400"}`}>
                  {s.change > 0 ? "+" : ""}{s.change}
                </span>
                <span className="font-medium w-28 truncate">{s.student}</span>
                <span className="text-slate-600">{s.skill}</span>
                <span className="text-sm text-slate-400 ml-auto">{s.start} → {s.end}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goal Achievement */}
      <div className="bg-white rounded-xl p-5 shadow-sm border mb-8">
        <h3 className="font-bold text-lg mb-3">🎯 Goal Achievement</h3>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-indigo-600">{totalGoals}</div>
            <div className="text-xs text-slate-500">Total Goals</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">{achievementRate.toFixed(0)}%</div>
            <div className="text-xs text-slate-500">Achievement Rate</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600">{active}</div>
            <div className="text-xs text-slate-500">In Progress</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-red-600">{overdue}</div>
            <div className="text-xs text-slate-500">Overdue</div>
          </div>
        </div>
      </div>

      {/* Retention Risk */}
      {retentionRisks.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border mb-8">
          <h3 className="font-bold text-lg mb-3">⚠️ Student Retention Risk</h3>
          <div className="space-y-3">
            {retentionRisks.map(r => (
              <div key={r.student} className={`rounded-lg p-3 border ${r.color}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold">{r.student}</span>
                  <span className="text-xs font-bold uppercase">{r.risk} Risk</span>
                </div>
                {r.reasons.length > 0 && (
                  <ul className="text-sm space-y-0.5">
                    {r.reasons.map((reason, i) => <li key={i}>• {reason}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {sessions.length === 0 && assessments.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <p className="text-4xl mb-2">📊</p>
          <p>Log sessions and add skill assessments to see analytics.</p>
        </div>
      )}
    </div>
  );
}
