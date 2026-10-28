import { useEffect, useState } from 'react';

const SRC = ['Website', 'LinkedIn', 'Referral', 'Event'];
const ST = ['New', 'Contacted', 'Qualified', 'Lost'];
const blank = { fullName: '', email: '', companyName: '', phone: '', leadSource: 'Website', estimatedDealValue: '' };

export default function App() {
  const [form, setForm] = useState(blank);
  const [errs, setErrs] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [f, setF] = useState({ search: '', status: '', priority: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, totalPages: 0 });

  // Leads load karo jab filter ya page badle
  const load = async () => {
    try {
      const res = await fetch(`/api/leads?${new URLSearchParams({ ...f, page })}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      setData(body);
    } catch (e) {
      setMsg({ ok: false, text: 'Load failed: ' + e.message });
    }
  };
  useEffect(() => { load(); }, [f, page]);

  // Filter badalne par page 1 par
  const setFilter = (patch) => { setF({ ...f, ...patch }); setPage(1); };

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return; // repeated submit block
    setSaving(true); setErrs({}); setMsg(null);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const body = await res.json();
      if (res.status === 201) {
        setMsg({ ok: true, text: `Lead saved. Priority: ${body.priority}` });
        setForm(blank); // success par hi form clear
        load();
      } else {
        setErrs(body.fieldErrors || {});
        setMsg({ ok: false, text: body.error }); // form values wahi rahengi
      }
    } catch {
      setMsg({ ok: false, text: 'Network error. Lead save nahi hua.' });
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (id, status) => {
    const res = await fetch(`/api/leads/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) { setMsg({ ok: true, text: 'Status updated.' }); load(); }
    else setMsg({ ok: false, text: 'Status update failed.' }); // fail ko success nahi dikhana
  };

  const field = (name, label) => (
    <label key={name}>
      {label}
      <input value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} />
      {errs[name] && <small style={{ color: 'red' }}>{errs[name]}</small>}
    </label>
  );

  return (
    <div style={{ padding: 16, fontFamily: 'sans-serif' }}>
      <h2>Smart Lead Management</h2>

      <form onSubmit={submit} style={{ display: 'grid', gap: 8, maxWidth: 360 }}>
        {field('fullName', 'Full name')}
        {field('email', 'Email')}
        {field('companyName', 'Company')}
        {field('phone', 'Phone')}
        <label>
          Lead source
          <select value={form.leadSource} onChange={(e) => setForm({ ...form, leadSource: e.target.value })}>
            {SRC.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label>
          Deal value (INR)
          <input type="number" step="0.01" value={form.estimatedDealValue}
            onChange={(e) => setForm({ ...form, estimatedDealValue: e.target.value })} />
          {errs.estimatedDealValue && <small style={{ color: 'red' }}>{errs.estimatedDealValue}</small>}
        </label>
        <button disabled={saving}>{saving ? 'Saving...' : 'Add lead'}</button>
      </form>

      {msg && <p style={{ color: msg.ok ? 'green' : 'red' }}>{msg.text}</p>}

      <h3>Leads</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input placeholder="Search" value={f.search} onChange={(e) => setFilter({ search: e.target.value })} />
        <select value={f.status} onChange={(e) => setFilter({ status: e.target.value })}>
          <option value="">All status</option>
          {ST.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={f.priority} onChange={(e) => setFilter({ priority: e.target.value })}>
          <option value="">All priority</option>
          <option>High</option><option>Medium</option><option>Low</option>
        </select>
        <button onClick={() => { setF({ search: '', status: '', priority: '' }); setPage(1); }}>Clear</button>
        <button onClick={load}>Refresh</button>
      </div>

      <div style={{ overflowX: 'auto', marginTop: 8 }}>
        <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', minWidth: 900 }}>
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Company</th><th>Phone</th><th>Source</th>
              <th>Deal value</th><th>Priority</th><th>Status</th><th>Created (IST)</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.items.length === 0 ? (
              <tr><td colSpan={10}>No leads found</td></tr>
            ) : data.items.map((l) => (
              <tr key={l.id}>
                <td>{l.fullName}</td>
                <td>{l.email}</td>
                <td>{l.companyName}</td>
                <td>{l.phone}</td>
                <td>{l.leadSource}</td>
                <td>₹{l.estimatedDealValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td><b>{l.priority}</b></td>
                <td>{l.status}</td>
                <td>{new Date(l.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</td>
                <td>
                  <select value={l.status} onChange={(e) => changeStatus(l.id, e.target.value)}>
                    {ST.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p>
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
        {' '}Page {page} of {Math.max(data.totalPages, 1)} ({data.total} matching){' '}
        <button disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>Next</button>
      </p>
    </div>
  );
}