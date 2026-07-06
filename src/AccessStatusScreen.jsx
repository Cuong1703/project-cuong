import React from "react";
import { Clock, ShieldAlert, LogOut } from "lucide-react";
import { supabase } from "./lib/supabaseClient";

export default function AccessStatusScreen({ status, email }) {
  const isPending = status === "pending";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#F4F8FC", fontFamily: "'Inter', sans-serif" }}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
          style={{
            backgroundColor: isPending ? "#FEF6E7" : "#FEF0EE",
            color: isPending ? "#B54708" : "#B42318",
          }}
        >
          {isPending ? <Clock size={22} /> : <ShieldAlert size={22} />}
        </div>

        <h2 className="font-semibold text-slate-800 mb-1.5">
          {isPending ? "Tài khoản đang chờ duyệt" : "Tài khoản đã bị khoá"}
        </h2>
        <p className="text-sm text-slate-500 mb-1">
          {isPending
            ? "Quản lý cần kích hoạt tài khoản trước khi bạn có thể sử dụng."
            : "Liên hệ quản lý nếu bạn cho rằng đây là nhầm lẫn."}
        </p>
        {email && <p className="text-xs text-slate-400 mb-5">{email}</p>}

        <button
          onClick={() => supabase.auth.signOut()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <LogOut size={14} /> Đăng xuất
        </button>
      </div>
    </div>
  );
}
