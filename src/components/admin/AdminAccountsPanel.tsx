"use client";

import { useEffect, useState } from "react";

type AdminAccount = { id: string; email: string; createdAt: string };

export default function AdminAccountsPanel() {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [selfId, setSelfId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [accountsRes, meRes] = await Promise.all([
      fetch("/api/admin/accounts"),
      fetch("/api/admin/auth"),
    ]);
    setAccounts(await accountsRes.json());
    const me = await meRes.json().catch(() => null);
    setSelfId(me?.adminId ?? null);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error === "EMAIL_TAKEN" ? "Email đã tồn tại" : "Tạo tài khoản thất bại");
      return;
    }
    setEmail("");
    setPassword("");
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Xóa tài khoản admin này?")) return;
    const res = await fetch(`/api/admin/accounts/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(
        data.error === "CANNOT_DELETE_LAST_ADMIN"
          ? "Không thể xóa admin cuối cùng."
          : "Không thể xóa tài khoản này."
      );
      return;
    }
    load();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <form onSubmit={handleCreate} className="lg:col-span-1 space-y-3 rounded-xl border border-neutral-200 bg-white p-5 h-fit">
        <h3 className="font-semibold">Thêm tài khoản admin</h3>
        <input
          required
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
        />
        <input
          required
          type="password"
          minLength={6}
          placeholder="Mật khẩu (tối thiểu 6 ký tự)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit" className="rounded-lg bg-brand text-white px-4 py-2 text-sm font-medium hover:bg-brand-dark transition-colors">
          Tạo tài khoản
        </button>
      </form>

      <div className="lg:col-span-2 rounded-xl border border-neutral-200 bg-white overflow-hidden">
        {loading ? (
          <p className="text-neutral-500 p-5">Đang tải...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 text-left text-neutral-500 border-b border-neutral-200">
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Tạo lúc</th>
                <th className="px-4 py-3 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {accounts.map((a) => (
                <tr key={a.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium">
                    {a.email}
                    {a.id === selfId && <span className="text-neutral-400 ml-2 text-xs">(bạn)</span>}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {new Date(a.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {a.id === selfId ? (
                      <span className="text-neutral-300">—</span>
                    ) : (
                      <button onClick={() => handleDelete(a.id)} className="text-red-500 hover:underline">
                        Xóa
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
