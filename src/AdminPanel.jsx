import React, { useState, useEffect } from "react";
import {
  Users, LayoutGrid, Loader2, CheckCircle2, Ban, ShieldCheck, ShieldOff, Calendar,
} from "lucide-react";
import { supabase } from "./lib/supabaseClient";

const STAGE_NAMES = ["Báo giá", "Đặt hàng", "Sản xuất gia công", "Giao hàng", "Thi công lắp đặt"];

function formatVND(n) {
  if (n === null || n === undefined || n === "" || isNaN(n)) return "—";
  return new Intl.NumberFormat("vi-VN").format(n) + " đ";
}

function StatusPill({ status }) {
  const map = {
    pending: { label: "Chờ duyệt", fg: "#B54708", bg: "#FEF6E7" },
    approved: { label: "Đã duyệt", fg: "#0F9D58", bg: "#EAFBF1" },
    blocked: { label: "Đã khoá", fg: "#B42318", bg: "#FEF0EE" },
  };
  const s = map[status] || map.pending;
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ color: s.fg, backgroundColor: s.bg }}
    >
      {s.label}
    </span>
  );
}

function UsersTab({ currentUserId }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && data) setProfiles(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (id, status) => {
    setBusyId(id);
    const { error } = await supabase.from("profiles").update({ status }).eq("id", id);
    if (!error) {
      setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    }
    setBusyId(null);
  };

  const setRole = async (id, role) => {
    setBusyId(id);
    const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
    if (!error) {
      setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, role } : p)));
    }
    setBusyId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="animate-spin text-blue-500" size={24} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-xs text-slate-400 uppercase tracking-wide">
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Vai trò</th>
            <th className="px-4 py-3 font-medium">Trạng thái</th>
            <th className="px-4 py-3 font-medium text-right">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {profiles.map((p) => {
            const isSelf = p.id === currentUserId;
            const busy = busyId === p.id;
            return (
              <tr key={p.id} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-3 text-slate-700">
                  {p.email}
                  {isSelf && <span className="ml-1.5 text-xs text-slate-400">(bạn)</span>}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {p.role === "admin" ? "Quản lý" : "Thành viên"}
                </td>
                <td className="px-4 py-3">
                  <StatusPill status={p.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5 flex-wrap">
                    {p.status !== "approved" && (
                      <button
                        disabled={busy}
                        onClick={() => setStatus(p.id, "approved")}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50"
                      >
                        <CheckCircle2 size={13} /> Duyệt
                      </button>
                    )}
                    {p.status !== "blocked" && (
                      <button
                        disabled={busy || isSelf}
                        onClick={() => setStatus(p.id, "blocked")}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 disabled:opacity-50"
                      >
                        <Ban size={13} /> Khoá
                      </button>
                    )}
                    {p.role !== "admin" ? (
                      <button
                        disabled={busy}
                        onClick={() => setRole(p.id, "admin")}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 disabled:opacity-50"
                      >
                        <ShieldCheck size={13} /> Đặt làm quản lý
                      </button>
                    ) : (
                      !isSelf && (
                        <button
                          disabled={busy}
                          onClick={() => setRole(p.id, "member")}
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 disabled:opacity-50"
                        >
                          <ShieldOff size={13} /> Bỏ quyền quản lý
                        </button>
                      )
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function AllProjectsTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: projects }, { data: profiles }] = await Promise.all([
        supabase.from("projects").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, email"),
      ]);
      const emailById = Object.fromEntries((profiles || []).map((p) => [p.id, p.email]));
      setRows((projects || []).map((row) => ({ ...row, ownerEmail: emailById[row.user_id] || "—" })));
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="animate-spin text-blue-500" size={24} />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="text-center py-16 text-sm text-slate-400 bg-white rounded-2xl border border-slate-200">
        Chưa có dự án nào trong hệ thống.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-xs text-slate-400 uppercase tracking-wide">
            <th className="px-4 py-3 font-medium">Dự án</th>
            <th className="px-4 py-3 font-medium">Chủ dự án</th>
            <th className="px-4 py-3 font-medium">Giai đoạn</th>
            <th className="px-4 py-3 font-medium">Giá trị</th>
            <th className="px-4 py-3 font-medium">Hạn hoàn thành</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-slate-50 last:border-0">
              <td className="px-4 py-3 font-medium text-slate-700">{r.name}</td>
              <td className="px-4 py-3 text-slate-500">{r.ownerEmail}</td>
              <td className="px-4 py-3 text-slate-500">{STAGE_NAMES[r.stage] || "—"}</td>
              <td className="px-4 py-3 font-mono text-xs text-slate-600">{formatVND(r.value)}</td>
              <td className="px-4 py-3 text-slate-500">
                {r.deadline ? (
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={11} /> {new Date(r.deadline).toLocaleDateString("vi-VN")}
                  </span>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminPanel({ currentUserId }) {
  const [tab, setTab] = useState("users"); // users | projects

  return (
    <div className="max-w-5xl mx-auto px-5 py-6">
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => setTab("users")}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium ${
            tab === "users" ? "bg-white shadow-sm text-slate-800 border border-slate-200" : "text-slate-500 hover:bg-white/60"
          }`}
        >
          <Users size={15} /> Người dùng
        </button>
        <button
          onClick={() => setTab("projects")}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium ${
            tab === "projects" ? "bg-white shadow-sm text-slate-800 border border-slate-200" : "text-slate-500 hover:bg-white/60"
          }`}
        >
          <LayoutGrid size={15} /> Toàn bộ dự án
        </button>
      </div>

      {tab === "users" ? <UsersTab currentUserId={currentUserId} /> : <AllProjectsTab />}
    </div>
  );
}
