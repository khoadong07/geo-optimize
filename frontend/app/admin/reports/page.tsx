'use client';

import { FormEvent, useEffect, useState } from 'react';
import { API, authHeader } from '../admin-context';

type ReportCategory = 'banking' | 'fmcg' | 'insurance' | 'telecom' | 'real_estate' | 'general';
type ReportStatus = 'draft' | 'published' | 'coming_soon';

type Report = {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  category: ReportCategory;
  priceVnd: number;
  status: ReportStatus;
  coverImagePath: string;
  fileOriginalName: string;
  createdAt: string;
};

const CATEGORIES: ReportCategory[] = ['banking', 'fmcg', 'insurance', 'telecom', 'real_estate', 'general'];
const STATUSES: ReportStatus[] = ['draft', 'published', 'coming_soon'];

const emptyForm = {
  title: '',
  subtitle: '',
  description: '',
  category: 'banking' as ReportCategory,
  priceVnd: '0',
  status: 'draft' as ReportStatus,
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Report | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  function loadReports() {
    return fetch(`${API}/reports/admin/all`, { headers: authHeader() })
      .then((res) => res.json())
      .then(setReports);
  }

  useEffect(() => {
    loadReports()
      .catch(() => setError('Could not load reports.'))
      .finally(() => setLoading(false));
  }, []);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setCoverFile(null);
    setReportFile(null);
  }

  function startEdit(report: Report) {
    setEditingId(report._id);
    setForm({
      title: report.title,
      subtitle: report.subtitle,
      description: report.description,
      category: report.category,
      priceVnd: String(report.priceVnd),
      status: report.status,
    });
    setCoverFile(null);
    setReportFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const body = new FormData();
    body.append('title', form.title);
    body.append('subtitle', form.subtitle);
    body.append('description', form.description);
    body.append('category', form.category);
    body.append('priceVnd', form.priceVnd);
    body.append('status', form.status);
    if (coverFile) body.append('cover', coverFile);
    if (reportFile) body.append('file', reportFile);

    const res = await fetch(`${API}/reports${editingId ? `/${editingId}` : ''}`, {
      method: editingId ? 'PATCH' : 'POST',
      headers: authHeader(),
      body,
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message || 'Could not save report.');
      return;
    }
    setSuccess(editingId ? 'Report updated.' : 'Report created.');
    resetForm();
    loadReports();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`${API}/reports/${deleteTarget._id}`, { method: 'DELETE', headers: authHeader() });
    setDeleting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message || 'Could not delete report.');
      setDeleteTarget(null);
      return;
    }
    setReports((prev) => prev.filter((r) => r._id !== deleteTarget._id));
    if (editingId === deleteTarget._id) resetForm();
    setDeleteTarget(null);
  }

  return (
    <>
      <div className="gb-page-head">
        <div>
          <p className="gb-eyebrow">System admin</p>
          <h1 className="gb-title-lg">Reports</h1>
          <p className="gb-subtitle">Publish AI Visibility reports shown on the marketing site&apos;s Reports section.</p>
        </div>
      </div>

      {error ? <div className="gb-banner error">{error}</div> : null}
      {success ? <div className="gb-banner info">{success}</div> : null}

      <div className="gb-card" style={{ marginBottom: 20 }}>
        <h2>{editingId ? 'Edit report' : 'New report'}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, marginTop: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <label className="gb-label">
              Title
              <input className="gb-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </label>
            <label className="gb-label">
              Category
              <select className="gb-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ReportCategory })}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="gb-label">
            Subtitle / meta line
            <input
              className="gb-input"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              placeholder="10 banks · 50 questions · Gemini + ChatGPT · 07/2026"
            />
          </label>

          <label className="gb-label">
            Description (shown in the preview modal)
            <textarea
              className="gb-input"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label className="gb-label">
              Price (VND, 0 = free)
              <input
                className="gb-input"
                type="number"
                min={0}
                step={1000}
                value={form.priceVnd}
                onChange={(e) => setForm({ ...form, priceVnd: e.target.value })}
              />
            </label>
            <label className="gb-label">
              Status
              <select className="gb-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ReportStatus })}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label className="gb-label">
              Cover image {editingId ? '(leave empty to keep current)' : ''}
              <input className="gb-input" type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
            </label>
            <label className="gb-label">
              Report file (PDF) {editingId ? '(leave empty to keep current)' : ''}
              <input className="gb-input" type="file" accept="application/pdf" onChange={(e) => setReportFile(e.target.files?.[0] || null)} />
            </label>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {editingId ? (
              <button type="button" className="gb-btn gb-btn-ghost" onClick={resetForm}>
                Cancel
              </button>
            ) : null}
            <button className="gb-btn gb-btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Save changes' : 'Create report'}
            </button>
          </div>
        </form>
      </div>

      <div className="gb-card" style={{ padding: 0 }}>
        {loading ? (
          <div className="gb-empty">Loading...</div>
        ) : reports.length ? (
          <div className="gb-table-wrap">
            <table className="gb-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>File</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r._id}>
                    <td>{r.title}</td>
                    <td className="gb-mono">{r.category}</td>
                    <td className="gb-mono">{r.priceVnd === 0 ? 'Free' : `${r.priceVnd.toLocaleString('vi-VN')}₫`}</td>
                    <td>
                      <span className={`gb-badge ${r.status === 'published' ? 'ok' : r.status === 'coming_soon' ? 'warn' : 'neutral'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>{r.fileOriginalName ? <span className="gb-mono">{r.fileOriginalName}</span> : <span className="gb-mono">—</span>}</td>
                    <td style={{ display: 'flex', gap: 10 }}>
                      <button className="gb-link" onClick={() => startEdit(r)}>
                        Edit
                      </button>
                      <button className="gb-link danger" onClick={() => setDeleteTarget(r)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="gb-empty">
            <strong>No reports yet</strong>
            Use the form above to publish your first report.
          </div>
        )}
      </div>

      {deleteTarget ? (
        <div className="gb-modal-overlay" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="gb-modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="gb-modal-head">
              <div>
                <h3>Delete &quot;{deleteTarget.title}&quot;?</h3>
                <p style={{ fontSize: 12, color: 'var(--text-faint)', margin: 0 }}>This also deletes its uploaded cover and file. This cannot be undone.</p>
              </div>
              <button className="gb-modal-close" onClick={() => setDeleteTarget(null)} aria-label="Close">
                ×
              </button>
            </div>
            <div className="gb-modal-body">
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="gb-btn gb-btn-ghost" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                  Cancel
                </button>
                <button className="gb-btn gb-btn-primary" style={{ background: 'var(--red)' }} onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Deleting...' : 'Delete report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
