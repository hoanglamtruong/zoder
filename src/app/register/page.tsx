"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error === "PHONE_TAKEN" ? "Số điện thoại đã được đăng ký" : "Đăng ký thất bại");
      }
      router.push("/account");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng ký thất bại");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-neutral-100 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-brand">Zoder</h1>
          <p className="text-neutral-500 text-sm mt-1">Tạo tài khoản mới</p>
        </div>
        <form onSubmit={handleSubmit} className="rounded-xl border border-neutral-200 bg-white p-6 space-y-4 shadow-sm">
          <div>
            <label className="block text-sm font-medium mb-1">Họ và tên</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:border-brand focus:ring-1 focus:ring-brand outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Số điện thoại</label>
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:border-brand focus:ring-1 focus:ring-brand outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mật khẩu</label>
            <input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:border-brand focus:ring-1 focus:ring-brand outline-none"
            />
            <p className="text-xs text-neutral-400 mt-1">Tối thiểu 6 ký tự.</p>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-brand px-6 py-3 text-white font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50"
          >
            {submitting ? "Đang đăng ký..." : "Đăng ký"}
          </button>
          <p className="text-center text-sm text-neutral-500">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-brand hover:underline">
              Đăng nhập
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
