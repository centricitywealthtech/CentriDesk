"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, UserCheck, UserX, X, Save, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count: { subscriptions: number };
};

type UserForm = {
  name: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
};

const EMPTY_FORM: UserForm = {
  name: "", email: "", password: "", role: "USER", isActive: true,
};

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  function openAdd() {
    setForm(EMPTY_FORM);
    setEditUser(null);
    setError("");
    setModal("add");
  }

  function openEdit(user: User) {
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      isActive: user.isActive,
    });
    setEditUser(user);
    setError("");
    setModal("edit");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const url = modal === "edit" ? `/api/admin/users/${editUser?.id}` : "/api/admin/users";
    const method = modal === "edit" ? "PUT" : "POST";

    const body = { ...form };
    if (modal === "edit" && !body.password) delete (body as Partial<UserForm>).password;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to save.");
      return;
    }

    setModal(null);
    fetchUsers();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    fetchUsers();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{users.length} users</p>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={14} />
          Add User
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {["Name", "Email", "Role", "Records", "Status", "Created", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading && Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-gray-50">
                <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                <td className="px-4 py-3"><Skeleton className="h-4 w-40" /></td>
                <td className="px-4 py-3"><Skeleton className="h-5 w-14 rounded-full" /></td>
                <td className="px-4 py-3"><Skeleton className="h-4 w-6" /></td>
                <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Skeleton className="h-7 w-7 rounded-md" />
                    <Skeleton className="h-7 w-7 rounded-md" />
                  </div>
                </td>
              </tr>
            ))}
            {!loading && users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                <td className="px-4 py-3 text-gray-600">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === "ADMIN" ? "bg-orange-100 text-orange-800" : "bg-gray-100 text-gray-700"
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{user._count.subscriptions}</td>
                <td className="px-4 py-3">
                  {user.isActive ? (
                    <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                      <UserCheck size={12} /> Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-400 text-xs font-medium">
                      <UserX size={12} /> Inactive
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(user.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(user)}
                      className="p-1.5 rounded-md text-gray-400 hover:text-[#E8952A] hover:bg-orange-50 transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id, user.name)}
                      className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">
                {modal === "add" ? "Add New User" : "Edit User"}
              </h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                  {error}
                </div>
              )}
              <div>
                <label className="form-label">Full Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  placeholder="John Doe"
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                  placeholder="john@company.com"
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">
                  Password {modal === "edit" && "(leave blank to keep current)"}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required={modal === "add"}
                  placeholder="••••••••"
                  className="form-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Role *</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                    className="form-input"
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Status</label>
                  <select
                    value={form.isActive ? "active" : "inactive"}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.value === "active" }))}
                    className="form-input"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1 justify-center">
                  <X size={14} /> Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {saving ? "Saving…" : "Save User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
