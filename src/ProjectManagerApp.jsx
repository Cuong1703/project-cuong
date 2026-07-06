import React, { useState, useEffect, useRef } from "react";
import {
  Plus, X, Calendar, User, Trash2, Pencil, Search,
  FileText, ShoppingCart, Settings, Truck, Wrench,
  ChevronLeft, ChevronRight, GripVertical, AlertTriangle,
  LayoutGrid, Loader2, CheckCircle2, LogOut, ShieldCheck
} from "lucide-react";
import { supabase } from "./lib/supabaseClient";
import AuthScreen from "./AuthScreen";
import AccessStatusScreen from "./AccessStatusScreen";
import AdminPanel from "./AdminPanel";

const STAGES = [
  { id: 0, title: "Báo giá", icon: FileText, color: "#1D4ED8", bg: "#EEF3FF" },
  { id: 1, title: "Đặt hàng", icon: ShoppingCart, color: "#2F6FED", bg: "#EEF3FF" },
  { id: 2, title: "Sản xuất gia công", icon: Settings, color: "#5B7CE5", bg: "#EEF1FE" },
  { id: 3, title: "Giao hàng", icon: Truck, color: "#0E9BA6", bg: "#E9FAFB" },
  { id: 4, title: "Thi công lắp đặt", icon: Wrench, color: "#0F9D58", bg: "#EAFBF1" },
];

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function formatVND(n) {
  if (n === "" || n === null || n === undefined || isNaN(n)) return "—";
  return new Intl.NumberFormat("vi-VN").format(n) + " đ";
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86400000);
}

function DeadlineBadge({ deadline }) {
  if (!deadline) return null;
  const d = daysUntil(deadline);
  let tone = { fg: "#6E85AC", bg: "#F1F5FB", label: `${new Date(deadline).toLocaleDateString("vi-VN")}` };
  if (d < 0) tone = { fg: "#B42318", bg: "#FEF0EE", label: `Trễ ${Math.abs(d)} ngày` };
  else if (d === 0) tone = { fg: "#B54708", bg: "#FEF6E7", label: `Hôm nay` };
  else if (d <= 3) tone = { fg: "#B54708", bg: "#FEF6E7", label: `Còn ${d} ngày` };
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ color: tone.fg, backgroundColor: tone.bg }}
    >
      <Calendar size={11} strokeWidth={2.2} />
      {tone.label}
    </span>
  );
}

function ProjectCard({ project, onEdit, onDelete, onMove, onDragStart, isDragging }) {
  const stage = STAGES[project.stage];
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, project.id)}
      className="group bg-white rounded-xl border border-slate-200 p-3.5 mb-2.5 cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md"
      style={{ opacity: isDragging ? 0.4 : 1, borderLeftWidth: "3px", borderLeftColor: stage.color }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-1.5 min-w-0">
          <GripVertical size={14} className="text-slate-300 mt-0.5 flex-shrink-0" />
          <h4 className="font-semibold text-sm text-slate-800 leading-snug break-words">{project.name}</h4>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={() => onEdit(project)} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600">
            <Pencil size={13} />
          </button>
          <button onClick={() => onDelete(project.id)} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {project.customer && (
        <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
          <User size={11} />
          <span className="truncate">{project.customer}</span>
        </div>
      )}

      <div className="flex items-center justify-between mt-2.5">
        <span className="font-mono text-xs font-semibold text-slate-700">{formatVND(project.value)}</span>
        <DeadlineBadge deadline={project.deadline} />
      </div>

      {project.notes && (
        <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-2">{project.notes}</p>
      )}

      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100">
        <button
          onClick={() => onMove(project.id, -1)}
          disabled={project.stage === 0}
          className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-0 disabled:pointer-events-none"
          aria-label="Chuyển về giai đoạn trước"
        >
          <ChevronLeft size={15} />
        </button>
        <span className="text-[10px] uppercase tracking-wide font-medium text-slate-300">
          Giai đoạn {project.stage + 1}/5
        </span>
        <button
          onClick={() => onMove(project.id, 1)}
          disabled={project.stage === STAGES.length - 1}
          className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-0 disabled:pointer-events-none"
          aria-label="Chuyển sang giai đoạn kế tiếp"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

function ProjectFormModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(
    initial || { name: "", customer: "", value: "", deadline: "", notes: "", stage: 0 }
  );
  const nameRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({ ...form, value: form.value === "" ? "" : Number(form.value) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(10,20,40,0.45)" }}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">{initial ? "Chỉnh sửa dự án" : "Dự án mới"}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100 text-slate-400">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Tên dự án *</label>
            <input
              ref={nameRef}
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="VD: Lắp đặt hệ thống ống dẫn nhà máy A"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Khách hàng</label>
            <input
              value={form.customer}
              onChange={(e) => setForm({ ...form, customer: e.target.value })}
              placeholder="Tên công ty / khách hàng"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Giá trị (đ)</label>
              <input
                type="number"
                min="0"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                placeholder="0"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Hạn hoàn thành</label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Giai đoạn hiện tại</label>
            <select
              value={form.stage}
              onChange={(e) => setForm({ ...form, stage: Number(e.target.value) })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            >
              {STAGES.map((s) => (
                <option key={s.id} value={s.id}>{s.id + 1}. {s.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Ghi chú</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              placeholder="Ghi chú nội bộ..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Huỷ
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg py-2 text-sm font-semibold text-white shadow-sm"
              style={{ backgroundColor: "#1D4ED8" }}
            >
              {initial ? "Lưu thay đổi" : "Tạo dự án"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmDelete({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(10,20,40,0.45)" }}>
      <div className="bg-white rounded-2xl w-full max-w-xs shadow-2xl p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2.5 text-red-500 mb-2">
          <AlertTriangle size={20} />
          <h3 className="font-semibold text-slate-800 text-sm">Xoá dự án này?</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">Hành động này không thể hoàn tác.</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
            Huỷ
          </button>
          <button onClick={onConfirm} className="flex-1 rounded-lg bg-red-500 py-2 text-sm font-semibold text-white hover:bg-red-600">
            Xoá
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectManagerApp() {
  const [session, setSession] = useState(undefined); // undefined = chưa xác định, null = chưa đăng nhập
  const [profile, setProfile] = useState(undefined); // undefined = đang tải, null = chưa có
  const [view, setView] = useState("board"); // board | admin
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);
  const [search, setSearch] = useState("");

  // Theo dõi trạng thái đăng nhập (Supabase Auth)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setProfile(undefined);
      setView("board");
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Tải hồ sơ (vai trò + trạng thái duyệt) của người đang đăng nhập
  useEffect(() => {
    if (!session) return;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();
      setProfile(!error && data ? data : null);
    })();
  }, [session]);

  // Chuyển đổi giữa dữ liệu app (camelCase) và dòng dữ liệu trong Supabase (snake_case)
  const fromRow = (row) => ({
    id: row.id,
    name: row.name,
    customer: row.customer || "",
    value: row.value ?? "",
    deadline: row.deadline || "",
    notes: row.notes || "",
    stage: row.stage,
    createdAt: row.created_at,
  });

  // Tải danh sách dự án của người dùng đang đăng nhập (chỉ khi đã được duyệt)
  useEffect(() => {
    if (!session || profile?.status !== "approved") return;
    setLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: true });
      if (!error && data) {
        setProjects(data.map(fromRow));
      }
      setLoading(false);
    })();
  }, [session, profile]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setProjects([]);
  };

  const handleSave = async (data) => {
    setSaveState("saving");
    if (editingProject) {
      const { error } = await supabase
        .from("projects")
        .update({
          name: data.name,
          customer: data.customer,
          value: data.value === "" ? null : data.value,
          deadline: data.deadline || null,
          notes: data.notes,
          stage: data.stage,
        })
        .eq("id", editingProject.id);
      if (!error) {
        setProjects((prev) => prev.map((p) => (p.id === editingProject.id ? { ...p, ...data } : p)));
        setSaveState("saved");
      } else {
        setSaveState("error");
      }
    } else {
      const { data: inserted, error } = await supabase
        .from("projects")
        .insert({
          user_id: session.user.id,
          name: data.name,
          customer: data.customer,
          value: data.value === "" ? null : data.value,
          deadline: data.deadline || null,
          notes: data.notes,
          stage: data.stage,
        })
        .select()
        .single();
      if (!error && inserted) {
        setProjects((prev) => [...prev, fromRow(inserted)]);
        setSaveState("saved");
      } else {
        setSaveState("error");
      }
    }
    setModalOpen(false);
    setEditingProject(null);
  };

  const handleDelete = async (id) => {
    setSaveState("saving");
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (!error) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setSaveState("saved");
    } else {
      setSaveState("error");
    }
    setDeletingId(null);
  };

  const updateStage = async (id, nextStage) => {
    setSaveState("saving");
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, stage: nextStage } : p)));
    const { error } = await supabase.from("projects").update({ stage: nextStage }).eq("id", id);
    setSaveState(error ? "error" : "saved");
  };

  const handleMove = (id, delta) => {
    const proj = projects.find((p) => p.id === id);
    if (!proj) return;
    const next = Math.min(STAGES.length - 1, Math.max(0, proj.stage + delta));
    updateStage(id, next);
  };

  const handleDrop = (stageId) => {
    if (draggedId != null) {
      updateStage(draggedId, stageId);
    }
    setDraggedId(null);
    setDragOverStage(null);
  };

  const filtered = projects.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || (p.customer || "").toLowerCase().includes(q);
  });

  const totalValue = projects.reduce((sum, p) => sum + (Number(p.value) || 0), 0);
  const overdueCount = projects.filter((p) => p.deadline && daysUntil(p.deadline) < 0).length;

  const isPendingLoad =
    session === undefined ||
    (session && profile === undefined) ||
    (session && profile?.status === "approved" && loading);

  if (isPendingLoad) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-500" size={28} />
      </div>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  if (!profile || profile.status !== "approved") {
    return <AccessStatusScreen status={profile?.status || "pending"} email={session.user.email} />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F4F8FC", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-5 py-3.5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
              style={{ background: "linear-gradient(155deg,#2F6FED,#0A1F44)" }}
            >
              M
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm tracking-wide">MANAGER</div>
              <div className="text-xs text-slate-400">Quản lý dự án công nghiệp</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-1 max-w-md min-w-[200px]">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm dự án hoặc khách hàng..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
          </div>

          {view === "board" && (
            <button
              onClick={() => { setEditingProject(null); setModalOpen(true); }}
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm flex-shrink-0"
              style={{ backgroundColor: "#1D4ED8" }}
            >
              <Plus size={16} /> Dự án mới
            </button>
          )}

          <div className="flex items-center gap-2 flex-shrink-0">
            {profile.role === "admin" && (
              <button
                onClick={() => setView(view === "board" ? "admin" : "board")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium ${
                  view === "admin"
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                <ShieldCheck size={15} /> {view === "admin" ? "Dự án của tôi" : "Quản trị"}
              </button>
            )}
            <span className="text-xs text-slate-400 max-w-[140px] truncate hidden sm:inline">
              {session.user.email}
            </span>
            <button
              onClick={handleSignOut}
              title="Đăng xuất"
              className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Stats bar */}
        {view === "board" && (
        <div className="max-w-7xl mx-auto px-5 pb-3 flex items-center gap-5 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <LayoutGrid size={13} />
            <span className="font-semibold text-slate-700">{projects.length}</span> dự án
          </div>
          <div className="text-slate-500">
            Tổng giá trị: <span className="font-mono font-semibold text-slate-700">{formatVND(totalValue)}</span>
          </div>
          {overdueCount > 0 && (
            <div className="flex items-center gap-1 text-red-500 font-medium">
              <AlertTriangle size={13} /> {overdueCount} dự án trễ hạn
            </div>
          )}
          <div className="ml-auto flex items-center gap-1.5 text-slate-400">
            {saveState === "saving" && <><Loader2 size={12} className="animate-spin" /> Đang lưu...</>}
            {saveState === "saved" && <><CheckCircle2 size={12} className="text-emerald-500" /> Đã lưu</>}
            {saveState === "error" && <span className="text-red-500">Lỗi lưu dữ liệu</span>}
          </div>
        </div>
        )}
      </header>

      {view === "admin" ? (
        <AdminPanel currentUserId={session.user.id} />
      ) : (
      <>
      {/* Board */}
      <main className="max-w-7xl mx-auto px-5 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {STAGES.map((stage) => {
            const stageProjects = filtered.filter((p) => p.stage === stage.id);
            const Icon = stage.icon;
            const isOver = dragOverStage === stage.id;
            return (
              <div
                key={stage.id}
                onDragOver={(e) => { e.preventDefault(); setDragOverStage(stage.id); }}
                onDragLeave={() => setDragOverStage((s) => (s === stage.id ? null : s))}
                onDrop={(e) => { e.preventDefault(); handleDrop(stage.id); }}
                className="rounded-2xl p-3 min-h-[200px] transition-colors"
                style={{
                  backgroundColor: isOver ? "#E4EDFB" : stage.bg,
                  outline: isOver ? `2px dashed ${stage.color}` : "2px dashed transparent",
                }}
              >
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                    style={{ backgroundColor: stage.color }}
                  >
                    <Icon size={14} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-slate-800 truncate">{stage.title}</div>
                    <div className="text-[10px] font-mono text-slate-400">{stageProjects.length} dự án</div>
                  </div>
                </div>

                {stageProjects.length === 0 && (
                  <div className="text-xs text-slate-300 text-center py-6 border border-dashed border-slate-200 rounded-xl">
                    Chưa có dự án
                  </div>
                )}

                {stageProjects.map((p) => (
                  <ProjectCard
                    key={p.id}
                    project={p}
                    isDragging={draggedId === p.id}
                    onDragStart={(e, id) => { setDraggedId(id); e.dataTransfer.effectAllowed = "move"; }}
                    onEdit={(proj) => { setEditingProject(proj); setModalOpen(true); }}
                    onDelete={(id) => setDeletingId(id)}
                    onMove={handleMove}
                  />
                ))}
              </div>
            );
          })}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-400 text-sm mb-3">Chưa có dự án nào. Bắt đầu bằng cách tạo dự án đầu tiên.</p>
            <button
              onClick={() => { setEditingProject(null); setModalOpen(true); }}
              className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: "#1D4ED8" }}
            >
              <Plus size={16} /> Tạo dự án đầu tiên
            </button>
          </div>
        )}
      </main>
      </>
      )}

      {modalOpen && (
        <ProjectFormModal
          initial={editingProject}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditingProject(null); }}
        />
      )}
      {deletingId && (
        <ConfirmDelete
          onConfirm={() => handleDelete(deletingId)}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </div>
  );
}
