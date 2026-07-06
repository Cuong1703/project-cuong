import React, { useState } from "react";
import { Loader2, Mail, Lock, LogIn, UserPlus } from "lucide-react";
import { supabase } from "./lib/supabaseClient";

export default function AuthScreen() {
  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setInfo("Đăng ký thành công! Kiểm tra email để xác nhận tài khoản, sau đó đăng nhập.");
      }
    } catch (err) {
      setError(err.message || "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#F4F8FC", fontFamily: "'Inter', sans-serif" }}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
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

        <div className="flex rounded-lg bg-slate-100 p-1 mb-5">
          <button
            type="button"
            onClick={() => { setMode("signin"); setError(""); setInfo(""); }}
            className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${
              mode === "signin" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => { setMode("signup"); setError(""); setInfo(""); }}
            className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${
              mode === "signup" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
            }`}
          >
            Đăng ký
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ban@congty.com"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Mật khẩu</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
          </div>

          {error && (
            <div className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</div>
          )}
          {info && (
            <div className="text-xs text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">{info}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
            style={{ backgroundColor: "#1D4ED8" }}
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : mode === "signin" ? (
              <LogIn size={15} />
            ) : (
              <UserPlus size={15} />
            )}
            {mode === "signin" ? "Đăng nhập" : "Tạo tài khoản"}
          </button>
        </form>
      </div>
    </div>
  );
}
