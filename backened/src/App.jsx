import { useEffect, useState } from 'react';

const ST = ['New', 'Contacted', 'Qualified', 'Lost'];
const blank = { fullName: '', email: '', companyName: '', phone: '', leadSource: 'Website', estimatedDealValue: '' };

export default function App() {
  const [form, setForm] = useState(blank);
  const [msg, setMsg] = useState('');
  const [f, setF] = useState({ search: '', status: '', priority: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], totalPages: 0 });

  const load = () =>
    fetch(`/api/leads?${new URLSearchParams({ ...f, page })}`)
      .then((r) => r.json()).then(setData);

  useEffect(() => { load(); }, [f, page]);

  const filter = (patch) => { setF({ ...f, ...patch }); setPage(1); };

  const submit = async (e) => {
    e.preventDefault();
    const r = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const b = await r.json();
    if (r.status === 201) { setMsg(`Saved. Priority: ${b.priority}`); setForm(blank); load(); }
    else setMsg(b.error);
  };

  const changeStatus = async (id, status) => {
    const r = await fetch(`/api/leads/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setMsg(r.ok ? 'Status updated.' : 'Status update failed.');
    if (r.ok) load();
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Smart Lead Management</h2>

      <form onSubmit={submit}>
        {['fullName', 'email', 'companyName', 'phone'].map((k) => (
          <input key={k} placeholder={k} value={form[k]}
            onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
        ))}
        <select value={form.leadSource} onChange={(e) => setForm({ ...form, leadSource: e.target.value })}>
          {['Website', 'LinkedIn', 'Referral', 'Event'].map((s) => <option key={s}>{s}</option>)}
        </select>
        <input type="number" placeholder="Deal value" value={form.estimatedDealValue}
          onChange={(e) => setForm({ ...form, estimatedDealValue: e.target.value })} />
        <button>Add lead</button>
      </form>

      <p>{msg}</p>

      <input placeholder="Search" value={f.search} onChange={(e) => filter({ search: e.target.value })} />
      <select value={f.status} onChange={(e) => filter({ status: e.target.value })}>
        <option value="">All status</option>
        {ST.map((s) => <option key={s}>{s}</option>)}
      </select>
      <select value={f.priority} onChange={(e) => filter({ priority: e.target.value })}>
        <option value="">All priority</option>
        <option>High</option><option>Medium</option><option>Low</option>
      </select>

      <table border="1" cellPadding="4" style={{ marginTop: 8 }}>
        <thead>
          <tr><th>Name</th><th>Email</th><th>Company</th><th>Deal</th><th>Priority</th><th>Status</th></tr>
        </thead>
        <tbody>
          {data.items.length === 0
            ? <tr><td colSpan={6}>No leads found</td></tr>
            : data.items.map((l) => (
              <tr key={l.id}>
                <td>{l.fullName}</td>
                <td>{l.email}</td>
                <td>{l.companyName}</td>
                <td>₹{l.estimatedDealValue}</td>
                <td>{l.priority}</td>
                <td>
                  <select value={l.status} onChange={(e) => changeStatus(l.id, e.target.value)}>
                    {ST.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      <p>
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
        {' '}Page {page} of {Math.max(data.totalPages, 1)}{' '}
        <button disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>Next</button>
      </p>
    </div>
  );
}
