'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getAllCategories, getServicesPaginated, subscribeToServicesMeta, acquireLock, renewLock, releaseLock } from '../../lib/firestore';
import { app } from '../../lib/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import LanguageTabs from '../../components/LanguageTabs';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';
import { PLATFORMS } from '../../lib/platforms';
import { FiPlus, FiEdit2, FiTrash2, FiCopy, FiSearch, FiX, FiEye, FiEyeOff, FiChevronDown, FiChevronUp, FiLock, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';

const functions = getFunctions(app);
const LANGS     = ['sor', 'bad', 'ar', 'en'];
const PAGE_SIZE = 15;

// ── Cache key builder ──────────────────────────────────────────────────────────
// Produces a stable string key from the active filter set.
// Each unique combination of filters gets its own bucket with its own cursor.
function buildCacheKey(categoryId, searchTerm) {
  // Search is always client-side so the cache key only varies by category.
  // Two different categories = two separate Firestore query streams.
  return `cat:${categoryId || '__all__'}`;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function extractCategoryId(ref) {
  if (!ref) return '';
  if (typeof ref === 'object' && ref.id)   return ref.id;
  if (typeof ref === 'object' && ref.path) return ref.path.split('/').pop();
  if (typeof ref === 'string') return ref.includes('/') ? ref.split('/').pop() : ref;
  return '';
}

function timestampToDateString(ts) {
  if (!ts) return '';
  try {
    const d = ts.toDate
      ? ts.toDate()
      : new Date(typeof ts === 'object' && ts.seconds != null ? ts.seconds * 1000 : ts);
    return d.toISOString().slice(0, 16);
  } catch { return ''; }
}

function toStringArray(value) {
  if (!value) return [];
  if (typeof value === 'string') return value.trim() ? [value.trim()] : [];
  if (Array.isArray(value))      return value.map(v => String(v).trim()).filter(Boolean);
  if (typeof value === 'object') return Object.values(value).map(v => String(v).trim()).filter(Boolean);
  return [String(value).trim()].filter(Boolean);
}

// ── Empty form factory ─────────────────────────────────────────────────────────
function emptyForm() {
  const f = {};
  LANGS.forEach(l => {
    f[`name_${l}`]          = '';
    f[`jobtitle_${l}`]      = '';
    f[`jobtitle1_${l}`]     = '';
    f[`job_${l}`]           = '';
    f[`image_${l}`]         = '';
    f[`search_${l}`]        = '';
    f[`tags_${l}`]          = '';
    f[`gallery_${l}`]       = '';
    f[`info_${l}`]          = '';
    f[`providedby_${l}`]    = '';
    f[`visibility_${l}`]    = true;
    f[`pageview_${l}`]      = 0;
    f[`latlng_${l}`]        = { lat: '', lng: '' };
    f[`createddate_${l}`]   = '';
    f[`expiredate_${l}`]    = '';
    f[`sortingorder_${l}`]  = '';
    f[`contract_paid_${l}`] = false;
    for (let d = 1; d <= 6; d++) {
      f[`dd${d}_${l}`]     = '';
      f[`dd${d}text_${l}`] = '';
    }
    f[`dd_${l}`]       = [];
    f[`tags_${l}_dd`]  = [];
  });
  f.categoryref     = '';
  f.categoryref_new = [];
  f.payment_info    = [];
  f.details         = [];
  PLATFORMS.forEach(p => { f[`${p.key}data`] = []; });
  return f;
}

function serviceToForm(service) {
  const f = emptyForm();
  LANGS.forEach(l => {
    f[`name_${l}`]          = service[`name_${l}`]          || '';
    f[`jobtitle_${l}`]      = service[`jobtitle_${l}`]      || '';
    f[`jobtitle1_${l}`]     = service[`jobtitle1_${l}`]     || '';
    f[`job_${l}`]           = service[`job_${l}`]           || '';
    f[`image_${l}`]         = service[`image_${l}`]         || '';
    f[`providedby_${l}`]    = service[`providedby_${l}`]    || '';
    f[`visibility_${l}`]    = service[`visibility_${l}`]    ?? true;
    f[`pageview_${l}`]      = service[`pageview_${l}`]      ?? 0;
    f[`sortingorder_${l}`]  = service[`sortingorder_${l}`]  ?? '';
    f[`contract_paid_${l}`] = service[`contract_paid_${l}`] ?? false;
    f[`createddate_${l}`]   = timestampToDateString(service[`createddate_${l}`]);
    f[`expiredate_${l}`]    = timestampToDateString(service[`expiredate_${l}`]);
    f[`search_${l}`]        = toStringArray(service[`search_${l}`]).join(', ');
    f[`tags_${l}`]          = toStringArray(service[`tags_${l}`]).join(', ');
    f[`gallery_${l}`]       = toStringArray(service[`gallery_${l}`]).join('\n');
    f[`info_${l}`]          = toStringArray(service[`info_${l}`]).join('\n');
    const ll = service[`latlng_${l}`];
    f[`latlng_${l}`] = ll
      ? { lat: ll.latitude ?? ll.lat ?? '', lng: ll.longitude ?? ll.lng ?? '' }
      : { lat: '', lng: '' };
    for (let d = 1; d <= 6; d++) {
      f[`dd${d}_${l}`]     = toStringArray(service[`dd${d}_${l}`]).join(', ');
      f[`dd${d}text_${l}`] = service[`dd${d}text_${l}`] || '';
    }
    const ddArr = service[`dd_${l}`];
    if (ddArr) {
      const entries = Array.isArray(ddArr) ? ddArr : Object.values(ddArr);
      f[`dd_${l}`] = entries.map(e => ({
        [`icon_${l}`]:  e[`icon_${l}`]  || '',
        [`value_${l}`]: e[`value_${l}`] || '',
      }));
    }
    const tdd = service[`tags_${l}_dd`];
    if (tdd) {
      const entries = Array.isArray(tdd) ? tdd : Object.values(tdd);
      f[`tags_${l}_dd`] = entries.map(e => ({
        dd1Values: toStringArray(e.dd1Values),
        tagData:   e.tagData || '',
      }));
    }
  });

  f.categoryref = extractCategoryId(service.categoryref);

  const crn = service.categoryref_new;
  if (crn) {
    const arr = Array.isArray(crn) ? crn : Object.values(crn);
    f.categoryref_new = arr.map(extractCategoryId).filter(Boolean);
  }

  const pi = service.payment_info;
  if (pi) {
    const entries = Array.isArray(pi) ? pi : Object.values(pi);
    f.payment_info = entries.map(e => {
      const entry = {};
      LANGS.forEach(l => {
        entry[`date_${l}`]           = timestampToDateString(e[`date_${l}`]);
        entry[`url_${l}`]            = e[`url_${l}`]            || '';
        entry[`amount_${l}`]         = e[`amount_${l}`]         ?? '';
        entry[`duration_month_${l}`] = e[`duration_month_${l}`] ?? '';
      });
      return entry;
    });
  }

  const det = service.details;
  if (det) {
    const entries = Array.isArray(det) ? det : Object.values(det);
    f.details = entries.map(e => {
      const entry = {};
      LANGS.forEach(l => {
        entry[`title_${l}`]  = e[`title_${l}`]  || '';
        entry[`detail_${l}`] = e[`detail_${l}`] || '';
      });
      return entry;
    });
  }

  PLATFORMS.forEach(p => {
    const raw = service[`${p.key}data`];
    if (!raw) { f[`${p.key}data`] = []; return; }
    const entries = Array.isArray(raw) ? raw : Object.values(raw);
    f[`${p.key}data`] = entries.map(entry => {
      const e = {};
      LANGS.forEach(l => {
        e[`${p.key}_${l}`]           = entry[`${p.key}_${l}`]           || '';
        e[`${p.key}text_${l}`]       = entry[`${p.key}text_${l}`]       || '';
        e[`${p.key}clickcount_${l}`] = entry[`${p.key}clickcount_${l}`] ?? 0;
      });
      return e;
    });
  });

  return f;
}

function formToServiceData(f) {
  const data = {};
  LANGS.forEach(l => {
    data[`name_${l}`]          = f[`name_${l}`];
    data[`jobtitle_${l}`]      = f[`jobtitle_${l}`];
    data[`jobtitle1_${l}`]     = f[`jobtitle1_${l}`];
    data[`job_${l}`]           = f[`job_${l}`];
    data[`image_${l}`]         = f[`image_${l}`];
    data[`providedby_${l}`]    = f[`providedby_${l}`];
    data[`visibility_${l}`]    = f[`visibility_${l}`];
    data[`pageview_${l}`]      = Number(f[`pageview_${l}`]) || 0;
    data[`contract_paid_${l}`] = f[`contract_paid_${l}`] ?? false;
    data[`sortingorder_${l}`]  = f[`sortingorder_${l}`] !== '' ? Number(f[`sortingorder_${l}`]) : null;

    const toTs = (str) => {
      if (!str) return null;
      const d = new Date(str);
      return isNaN(d) ? null : { seconds: Math.floor(d.getTime() / 1000), nanoseconds: 0 };
    };
    data[`createddate_${l}`] = toTs(f[`createddate_${l}`]);
    data[`expiredate_${l}`]  = toTs(f[`expiredate_${l}`]);

    data[`search_${l}`]  = f[`search_${l}`].split(',').map(s => s.trim()).filter(Boolean);
    data[`tags_${l}`]    = f[`tags_${l}`].split(',').map(s => s.trim()).filter(Boolean);
    data[`gallery_${l}`] = f[`gallery_${l}`].split('\n').map(s => s.trim()).filter(Boolean);
    data[`info_${l}`]    = f[`info_${l}`].split('\n').map(s => s.trim()).filter(Boolean);

    for (let d = 1; d <= 6; d++) {
      data[`dd${d}_${l}`]     = f[`dd${d}_${l}`].split(',').map(s => s.trim()).filter(Boolean);
      data[`dd${d}text_${l}`] = f[`dd${d}text_${l}`];
    }

    const lat = parseFloat(f[`latlng_${l}`]?.lat);
    const lng = parseFloat(f[`latlng_${l}`]?.lng);
    data[`latlng_${l}`] = !isNaN(lat) && !isNaN(lng) ? { lat, lng } : null;

    data[`dd_${l}`] = (f[`dd_${l}`] || [])
      .filter(e => e[`value_${l}`]?.trim())
      .map(e => ({ [`icon_${l}`]: e[`icon_${l}`] || '', [`value_${l}`]: e[`value_${l}`] || '' }));

    data[`tags_${l}_dd`] = (f[`tags_${l}_dd`] || [])
      .filter(e => e.tagData?.trim() || e.dd1Values?.length)
      .map(e => ({ dd1Values: e.dd1Values || [], tagData: e.tagData || '' }));
  });

  data.categoryref     = f.categoryref || null;
  data.categoryref_new = (f.categoryref_new || []).filter(Boolean);

  data.payment_info = (f.payment_info || []).map(e => {
    const entry = {};
    LANGS.forEach(l => {
      entry[`date_${l}`]           = e[`date_${l}`] ? { seconds: Math.floor(new Date(e[`date_${l}`]).getTime() / 1000), nanoseconds: 0 } : null;
      entry[`url_${l}`]            = e[`url_${l}`]            || '';
      entry[`amount_${l}`]         = e[`amount_${l}`]         !== '' ? Number(e[`amount_${l}`])         : null;
      entry[`duration_month_${l}`] = e[`duration_month_${l}`] !== '' ? Number(e[`duration_month_${l}`]) : null;
    });
    return entry;
  });

  data.details = (f.details || []).map(e => {
    const entry = {};
    LANGS.forEach(l => {
      entry[`title_${l}`]  = e[`title_${l}`]  || '';
      entry[`detail_${l}`] = e[`detail_${l}`] || '';
    });
    return entry;
  });

  PLATFORMS.forEach(p => {
    const entries = f[`${p.key}data`] || [];
    data[`${p.key}data`] = entries.map(entry => {
      const e = {};
      LANGS.forEach(l => {
        e[`${p.key}_${l}`]           = entry[`${p.key}_${l}`]           || '';
        e[`${p.key}text_${l}`]       = entry[`${p.key}text_${l}`]       || '';
        e[`${p.key}clickcount_${l}`] = entry[`${p.key}clickcount_${l}`] ?? 0;
      });
      return e;
    });
  });

  return data;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Section({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
        <span className="font-semibold text-gray-800 text-sm">{title}</span>
        {open ? <FiChevronUp className="text-gray-500" /> : <FiChevronDown className="text-gray-500" />}
      </button>
      {open && <div className="p-4 space-y-4">{children}</div>}
    </div>
  );
}

function ContactEntryEditor({ platform, entries, onChange }) {
  const addEntry = () => {
    const e = {};
    LANGS.forEach(l => {
      e[`${platform.key}_${l}`]           = '';
      e[`${platform.key}text_${l}`]       = '';
      e[`${platform.key}clickcount_${l}`] = 0;
    });
    onChange([...entries, e]);
  };
  const remove = (i)            => onChange(entries.filter((_, idx) => idx !== i));
  const update = (i, field, v)  => onChange(entries.map((e, idx) => idx === i ? { ...e, [field]: v } : e));

  return (
    <div className="space-y-3">
      {entries.map((entry, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-500">Entry {i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
          </div>
          {LANGS.map(l => (
            <div key={l} className="border border-gray-100 rounded-lg p-2 bg-white space-y-2">
              <p className="text-xs font-semibold text-primary">{l.toUpperCase()}</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{platform.label} value</label>
                  <input type="text" value={entry[`${platform.key}_${l}`] || ''} onChange={e => update(i, `${platform.key}_${l}`, e.target.value)} className="input text-sm py-1" placeholder={`${platform.label} value`} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Label</label>
                  <input type="text" value={entry[`${platform.key}text_${l}`] || ''} onChange={e => update(i, `${platform.key}text_${l}`, e.target.value)} className="input text-sm py-1" placeholder="Display label" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Click Count</label>
                <input type="number" min="0" value={entry[`${platform.key}clickcount_${l}`] ?? 0} onChange={e => update(i, `${platform.key}clickcount_${l}`, Number(e.target.value))} className="input text-sm py-1" placeholder="0" />
              </div>
            </div>
          ))}
        </div>
      ))}
      <button type="button" onClick={addEntry} className="btn btn-secondary btn-sm w-full">+ Add {platform.label} Entry</button>
    </div>
  );
}

function DdArrayEditor({ lang, entries, onChange }) {
  const add    = () => onChange([...entries, { [`icon_${lang}`]: '', [`value_${lang}`]: '' }]);
  const remove = (i)           => onChange(entries.filter((_, idx) => idx !== i));
  const update = (i, field, v) => onChange(entries.map((e, idx) => idx === i ? { ...e, [field]: v } : e));

  return (
    <div className="space-y-2">
      {entries.map((entry, i) => (
        <div key={i} className="flex gap-2 items-center">
          <span className="text-xs text-gray-400 w-5 shrink-0">{i + 1}</span>
          <input type="text" value={entry[`icon_${lang}`] || ''} onChange={e => update(i, `icon_${lang}`, e.target.value)} className="input text-sm w-24 shrink-0" placeholder="Icon (emoji/url)" />
          <input type="text" value={entry[`value_${lang}`] || ''} onChange={e => update(i, `value_${lang}`, e.target.value)} className="input text-sm flex-1" placeholder="Value" />
          <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-600 shrink-0"><FiX size={14} /></button>
        </div>
      ))}
      <button type="button" onClick={add} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"><FiPlus size={12} /> Add Entry</button>
    </div>
  );
}

function TagsDdEditor({ lang, entries, onChange, ddOptions }) {
  const add    = () => onChange([...entries, { dd1Values: [], tagData: '' }]);
  const remove = (i)           => onChange(entries.filter((_, idx) => idx !== i));
  const update = (i, field, v) => onChange(entries.map((e, idx) => idx === i ? { ...e, [field]: v } : e));

  const toggleValue = (entryIdx, val) => {
    const current = entries[entryIdx].dd1Values || [];
    const next    = current.includes(val) ? current.filter(v => v !== val) : [...current, val];
    update(entryIdx, 'dd1Values', next);
  };

  return (
    <div className="space-y-3">
      {entries.map((entry, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-500">Tag Entry {i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Tag Data</label>
            <input type="text" value={entry.tagData || ''} onChange={e => update(i, 'tagData', e.target.value)} className="input text-sm" placeholder="Tag data value" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Subcategory Values <span className="text-gray-400">(select from dd_{lang} entries)</span>
            </label>
            {(entry.dd1Values || []).length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {(entry.dd1Values || []).map(v => {
                  const opt = ddOptions.find(o => o.value === v);
                  return (
                    <span key={v} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {opt?.icon && (opt.icon.startsWith('http')
                        ? <img src={opt.icon} alt="" className="w-3 h-3 rounded-sm object-cover" />
                        : <span>{opt.icon}</span>)}
                      {v}
                      <button type="button" onClick={() => toggleValue(i, v)} className="hover:text-red-500"><FiX size={10} /></button>
                    </span>
                  );
                })}
              </div>
            )}
            {ddOptions.length > 0 ? (
              <select value="" onChange={e => { if (e.target.value) toggleValue(i, e.target.value); }} className="select text-sm">
                <option value="">+ Select subcategory value…</option>
                {ddOptions
                  .filter(o => !(entry.dd1Values || []).includes(o.value))
                  .map(o => (
                    <option key={o.value} value={o.value}>
                      {o.icon && !o.icon.startsWith('http') ? `${o.icon} ` : ''}{o.value}
                    </option>
                  ))}
              </select>
            ) : (
              <p className="text-xs text-gray-400">No dd_{lang} options available — add subcategory entries in the DD Array section first</p>
            )}
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"><FiPlus size={12} /> Add Tag Entry</button>
    </div>
  );
}

function PaymentInfoEditor({ entries, onChange }) {
  const addEntry = () => {
    const e = {};
    LANGS.forEach(l => {
      e[`date_${l}`]           = '';
      e[`url_${l}`]            = '';
      e[`amount_${l}`]         = '';
      e[`duration_month_${l}`] = '';
    });
    onChange([...entries, e]);
  };
  const remove = (i)           => onChange(entries.filter((_, idx) => idx !== i));
  const update = (i, field, v) => onChange(entries.map((e, idx) => idx === i ? { ...e, [field]: v } : e));

  return (
    <div className="space-y-3">
      {entries.map((entry, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-500">Payment Entry {i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
          </div>
          {LANGS.map(l => (
            <div key={l} className="border border-gray-100 rounded-lg p-2 bg-white space-y-2">
              <p className="text-xs font-semibold text-primary">{l.toUpperCase()}</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Date</label>
                  <input type="datetime-local" value={entry[`date_${l}`] || ''} onChange={e => update(i, `date_${l}`, e.target.value)} className="input text-sm py-1" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">URL</label>
                  <input type="url" value={entry[`url_${l}`] || ''} onChange={e => update(i, `url_${l}`, e.target.value)} className="input text-sm py-1" placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Amount</label>
                  <input type="number" min="0" step="0.01" value={entry[`amount_${l}`] ?? ''} onChange={e => update(i, `amount_${l}`, e.target.value)} className="input text-sm py-1" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Duration (months)</label>
                  <input type="number" min="0" value={entry[`duration_month_${l}`] ?? ''} onChange={e => update(i, `duration_month_${l}`, e.target.value)} className="input text-sm py-1" placeholder="0" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
      <button type="button" onClick={addEntry} className="btn btn-secondary btn-sm w-full">+ Add Payment Entry</button>
    </div>
  );
}

function DetailsEditor({ entries, onChange }) {
  const add = () => {
    const e = {};
    LANGS.forEach(l => { e[`title_${l}`] = ''; e[`detail_${l}`] = ''; });
    onChange([...entries, e]);
  };
  const remove = (i)           => onChange(entries.filter((_, idx) => idx !== i));
  const update = (i, field, v) => onChange(entries.map((e, idx) => idx === i ? { ...e, [field]: v } : e));

  return (
    <div className="space-y-3">
      {entries.map((entry, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-500">Detail Item {i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
          </div>
          {LANGS.map(l => (
            <div key={l} className="border border-gray-100 rounded-lg p-2 bg-white space-y-2">
              <p className="text-xs font-semibold text-primary">{l.toUpperCase()}</p>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Title</label>
                <input type="text" value={entry[`title_${l}`] || ''} onChange={e => update(i, `title_${l}`, e.target.value)} className="input text-sm py-1" placeholder="Title" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Detail</label>
                <textarea value={entry[`detail_${l}`] || ''} onChange={e => update(i, `detail_${l}`, e.target.value)} className="textarea text-sm py-1" rows={2} placeholder="Detail text" />
              </div>
            </div>
          ))}
        </div>
      ))}
      <button type="button" onClick={add} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"><FiPlus size={12} /> Add Detail Item</button>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ServicesPage() {
  const { canAccess, canAccessService, user } = useAuth();

  // ── UI state ───────────────────────────────────────────────────────────────
  const [categories, setCategories]             = useState([]);
  const [displayedDocs, setDisplayedDocs]       = useState([]);  // what's shown in the grid
  const [loading, setLoading]                   = useState(true);
  const [loadingMore, setLoadingMore]           = useState(false);
  const [saving, setSaving]                     = useState(false);
  const [hasMore, setHasMore]                   = useState(false);
  const [searchTerm, setSearchTerm]             = useState('');
  const [categoryFilter, setCategoryFilter]     = useState('');
  const [subCatFilter, setSubCatFilter]         = useState({ sor: '', bad: '', ar: '', en: '' });
  const [ddSelections, setDdSelections]         = useState({ dd1: '', dd2: '', dd3: '', dd4: '', dd5: '', dd6: '' });
  const [showModal, setShowModal]               = useState(false);
  const [editingService, setEditingService]     = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [confirmDialog, setConfirmDialog]       = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [formData, setFormData]                 = useState(emptyForm());
  const [staleBanner, setStaleBanner]           = useState(false); // "data updated, refresh?"

  // Lock state
  const [lockInfo, setLockInfo]       = useState(null);   // { lockedByName, expiresAt } when blocked
  const [lockAcquired, setLockAcquired] = useState(false); // true when WE hold the lock

  // ── Refs ───────────────────────────────────────────────────────────────────
  const loaderRef        = useRef(null);
  const metaUnsubRef     = useRef(null);  // unsubscribe for meta listener
  const heartbeatRef     = useRef(null);  // interval id for lock heartbeat
  const myWriteRef       = useRef(false); // true right after our own save so we skip the meta signal
  const activeCacheKey   = useRef('');    // tracks which bucket is currently displayed

  // Cache: Map<cacheKey, { docs, cursor, hasMore, fetchedAt }>
  // fetchedAt is a JS Date — compared against meta updatedAt to detect stale buckets
  const cacheRef = useRef({});

  const currentCacheKey = buildCacheKey(categoryFilter, searchTerm);

  // ── Firestore fetch for one page ───────────────────────────────────────────
  const fetchPage = useCallback(async (cacheKey, categoryId, afterCursor = null) => {
    const { docs, cursor, hasMore } = await getServicesPaginated({
      categoryId: categoryId || null,
      afterCursor,
      pageSize: PAGE_SIZE,
    });

    // Filter to only services this admin can access
    const accessible = docs.filter(s => canAccessService(s.id, s.categoryref));
    return { docs: accessible, cursor, hasMore };
  }, [canAccessService]);

  // ── Initial load of active bucket ─────────────────────────────────────────
  const loadActiveBucket = useCallback(async (cacheKey, categoryId, { force = false } = {}) => {
    const existing = cacheRef.current[cacheKey];

    // Serve from cache if fresh and not forced
    if (existing && existing.fetchedAt && !force) {
      setDisplayedDocs(existing.docs);
      setHasMore(existing.hasMore);
      activeCacheKey.current = cacheKey;
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { docs, cursor, hasMore } = await fetchPage(cacheKey, categoryId);
      cacheRef.current[cacheKey] = { docs, cursor, hasMore, fetchedAt: new Date() };
      setDisplayedDocs(docs);
      setHasMore(hasMore);
      activeCacheKey.current = cacheKey;
    } catch (err) {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  }, [fetchPage]);

  // ── Load next page (infinite scroll) ──────────────────────────────────────
  const loadNextPage = useCallback(async () => {
    const cacheKey  = currentCacheKey;
    const existing  = cacheRef.current[cacheKey];
    if (!existing || !existing.hasMore || loadingMore) return;

    setLoadingMore(true);
    try {
      const { docs: newDocs, cursor, hasMore } = await fetchPage(cacheKey, categoryFilter, existing.cursor);

      // Merge — avoid duplicates by id
      const existingIds = new Set(existing.docs.map(d => d.id));
      const merged      = [...existing.docs, ...newDocs.filter(d => !existingIds.has(d.id))];

      cacheRef.current[cacheKey] = { docs: merged, cursor, hasMore, fetchedAt: existing.fetchedAt };
      setDisplayedDocs(merged);
      setHasMore(hasMore);
    } catch (err) {
      toast.error('Failed to load more services');
    } finally {
      setLoadingMore(false);
    }
  }, [currentCacheKey, categoryFilter, fetchPage, loadingMore]);

  // ── IntersectionObserver for infinite scroll trigger ──────────────────────
  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasMore && !loadingMore) loadNextPage(); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadNextPage]);

  // ── Load categories once ───────────────────────────────────────────────────
  useEffect(() => {
    getAllCategories()
      .then(setCategories)
      .catch(() => toast.error('Failed to load categories'));
  }, []);

  // ── Load / switch bucket when category filter changes ─────────────────────
  useEffect(() => {
    if (!canAccess('services_new')) return;
    loadActiveBucket(currentCacheKey, categoryFilter);
  }, [categoryFilter, canAccess]); // intentionally omit loadActiveBucket to avoid loop

  // ── Meta listener: watches services_new/reference for updatedAt changes ───
  useEffect(() => {
    if (!canAccess('services_new')) return;

    metaUnsubRef.current = subscribeToServicesMeta((remoteUpdatedAt) => {
      // If this update was triggered by our own save, skip it
      if (myWriteRef.current) {
        myWriteRef.current = false;
        return;
      }

      // Mark all cache buckets whose fetchedAt is older than remoteUpdatedAt as stale
      let activeIsStale = false;
      Object.keys(cacheRef.current).forEach(key => {
        const bucket = cacheRef.current[key];
        if (bucket.fetchedAt && bucket.fetchedAt < remoteUpdatedAt) {
          cacheRef.current[key] = { ...bucket, fetchedAt: null }; // null = stale
          if (key === activeCacheKey.current) activeIsStale = true;
        }
      });

      if (activeIsStale) {
        // Show a non-intrusive banner instead of auto-refreshing mid-browse
        setStaleBanner(true);
      }
    });

    return () => { if (metaUnsubRef.current) metaUnsubRef.current(); };
  }, [canAccess]);

  // ── Refresh active bucket when user clicks the stale banner ───────────────
  const handleRefreshBanner = () => {
    setStaleBanner(false);
    loadActiveBucket(currentCacheKey, categoryFilter, { force: true });
  };

  // ── Client-side filtering on top of fetched docs ───────────────────────────
  // We only run client-side filters against what's already in the cache bucket.
  // If subcat / dd filters are active we narrow the already-fetched set.
  // Search is also client-side so zero extra reads.
  const filteredDocs = (() => {
    let docs = displayedDocs;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      docs = docs.filter(s => LANGS.some(l => s[`name_${l}`]?.toLowerCase().includes(term)));
    }

    LANGS.forEach(l => {
      if (subCatFilter[l]) {
        docs = docs.filter(s => {
          const arr     = s[`dd_${l}`];
          if (!arr) return false;
          const entries = Array.isArray(arr) ? arr : Object.values(arr);
          return entries.some(e => e[`value_${l}`]?.trim() === subCatFilter[l]);
        });
      }
    });

    for (let d = 1; d <= 6; d++) {
      if (ddSelections[`dd${d}`]) {
        docs = docs.filter(s => toStringArray(s[`dd${d}_sor`]).includes(ddSelections[`dd${d}`]));
      }
    }

    return docs;
  })();

  // ── Subcategory options built from fetched docs ───────────────────────────
  const getSubCatOptions = () => {
    const result = {};
    LANGS.forEach(l => {
      const seen = new Set();
      const opts = [];
      displayedDocs.forEach(s => {
        const arr = s[`dd_${l}`];
        if (!arr) return;
        const entries = Array.isArray(arr) ? arr : Object.values(arr);
        entries.forEach(e => {
          const val = e[`value_${l}`]?.trim();
          if (val && !seen.has(val)) { seen.add(val); opts.push({ icon: e[`icon_${l}`] || '', value: val }); }
        });
      });
      if (opts.length > 0) result[l] = opts;
    });
    return result;
  };

  const getDdOptions = (level) => {
    let pool = displayedDocs;
    LANGS.forEach(l => {
      if (subCatFilter[l]) {
        pool = pool.filter(s => {
          const arr     = s[`dd_${l}`];
          if (!arr) return false;
          const entries = Array.isArray(arr) ? arr : Object.values(arr);
          return entries.some(e => e[`value_${l}`]?.trim() === subCatFilter[l]);
        });
      }
    });
    for (let i = 1; i < level; i++) {
      if (ddSelections[`dd${i}`]) pool = pool.filter(s => toStringArray(s[`dd${i}_sor`]).includes(ddSelections[`dd${i}`]));
    }
    return [...new Set(pool.flatMap(s => toStringArray(s[`dd${level}_sor`])))].sort();
  };

  const getDdLabel = (level) => displayedDocs.find(s => s[`dd${level}text_sor`])?.[`dd${level}text_sor`] || null;

  const handleDdSelect = (level, value) => {
    const next = { ...ddSelections, [`dd${level}`]: value };
    for (let i = level + 1; i <= 6; i++) next[`dd${i}`] = '';
    setDdSelections(next);
  };

  const clearDdFilters  = () => setDdSelections({ dd1: '', dd2: '', dd3: '', dd4: '', dd5: '', dd6: '' });
  const clearSubCat     = () => setSubCatFilter({ sor: '', bad: '', ar: '', en: '' });
  const clearAllFilters = () => { clearDdFilters(); clearSubCat(); };

  const handleCategoryChange = (val) => { setCategoryFilter(val); clearAllFilters(); };

  const hasActiveSubCat = Object.values(subCatFilter).some(Boolean);
  const hasActiveDd     = Object.values(ddSelections).some(Boolean);
  const subCatOptions   = getSubCatOptions();
  const subCatLangs     = Object.keys(subCatOptions);
  const LANG_LABELS     = { sor: 'Sorani', bad: 'Badini', ar: 'Arabic', en: 'English' };

  // ── dd options for TagsDdEditor in modal ─────────────────────────────────
  const getDdOptionsForModal = (lang) => {
    const seen = new Set();
    const opts = [];
    displayedDocs.forEach(s => {
      const arr = s[`dd_${lang}`];
      if (!arr) return;
      const entries = Array.isArray(arr) ? arr : Object.values(arr);
      entries.forEach(e => {
        const val = e[`value_${lang}`]?.trim();
        if (val && !seen.has(val)) { seen.add(val); opts.push({ icon: e[`icon_${lang}`] || '', value: val }); }
      });
    });
    (formData[`dd_${lang}`] || []).forEach(e => {
      const val = e[`value_${lang}`]?.trim();
      if (val && !seen.has(val)) { seen.add(val); opts.push({ icon: e[`icon_${lang}`] || '', value: val }); }
    });
    return opts;
  };

  // ── Lock helpers ───────────────────────────────────────────────────────────
  const startHeartbeat = (serviceId) => {
    stopHeartbeat();
    heartbeatRef.current = setInterval(() => {
      renewLock(serviceId, user?.uid).catch(() => {});
    }, 60 * 1000); // renew every 60s (well within 3-min TTL)
  };

  const stopHeartbeat = () => {
    if (heartbeatRef.current) { clearInterval(heartbeatRef.current); heartbeatRef.current = null; }
  };

  // Release lock + stop heartbeat on modal close (any path)
  const doReleaseLock = useCallback(async (serviceId) => {
    stopHeartbeat();
    if (serviceId && user?.uid) {
      await releaseLock(serviceId, user.uid).catch(() => {});
    }
    setLockAcquired(false);
    setLockInfo(null);
  }, [user]);

  // ── Modal open / close ────────────────────────────────────────────────────
  const handleOpenModal = async (service = null) => {
    setLockInfo(null);
    setLockAcquired(false);

    if (service) {
      // Try to acquire a lock
      const result = await acquireLock(service.id, user?.uid, user?.displayName || user?.email || 'Admin');
      if (!result.acquired) {
        setLockInfo({ lockedByName: result.lockedByName, expiresAt: result.expiresAt });
        toast.error(`Locked by ${result.lockedByName}`);
        return; // Don't open modal
      }
      setLockAcquired(true);
      startHeartbeat(service.id);
    }

    setEditingService(service || null);
    setFormData(service ? serviceToForm(service) : emptyForm());
    setShowModal(true);
  };

  const handleCloseModal = async () => {
    if (editingService && lockAcquired) {
      await doReleaseLock(editingService.id);
    }
    setShowModal(false);
    setEditingService(null);
  };

  const setField = (key, value) => setFormData(f => ({ ...f, [key]: value }));

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const serviceData = formToServiceData(formData);
      const fn          = httpsCallable(functions, 'createOrUpdateService');
      const result      = await fn({ id: editingService?.id || null, serviceData });
      const isUpdate    = result.data.action === 'updated';
      const savedId     = result.data.id || editingService?.id;

      // Mark as our own write so the meta listener doesn't trigger a stale banner
      myWriteRef.current = true;

      // Optimistic update: patch the cache immediately, no re-fetch
      const cacheKey = currentCacheKey;
      const bucket   = cacheRef.current[cacheKey];
      if (bucket) {
        const fullService = { ...serviceData, id: savedId, updatedAt: new Date() };
        if (isUpdate) {
          cacheRef.current[cacheKey] = {
            ...bucket,
            docs: bucket.docs.map(d => d.id === savedId ? fullService : d),
          };
        } else {
          // Prepend new service
          cacheRef.current[cacheKey] = {
            ...bucket,
            docs: [fullService, ...bucket.docs],
          };
        }
        setDisplayedDocs(cacheRef.current[cacheKey].docs);
      }

      toast.success(isUpdate ? 'Service updated!' : 'Service created!');

      if (editingService && lockAcquired) await doReleaseLock(editingService.id);
      setShowModal(false);
      setEditingService(null);
    } catch (error) {
      toast.error(error.message || 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = (id) => {
    setConfirmDialog({
      isOpen: true, title: 'Delete Service?', message: 'Are you sure you want to delete this service?',
      onConfirm: async () => {
        try {
          await httpsCallable(functions, 'deleteItems')({ collection: 'services_new', ids: [id] });
          myWriteRef.current = true;

          // Optimistic: remove from active bucket
          const cacheKey = currentCacheKey;
          const bucket   = cacheRef.current[cacheKey];
          if (bucket) {
            cacheRef.current[cacheKey] = { ...bucket, docs: bucket.docs.filter(d => d.id !== id) };
            setDisplayedDocs(cacheRef.current[cacheKey].docs);
          }

          toast.success('Service deleted!');
        } catch (error) { toast.error(error.message || 'Failed to delete'); }
        finally { setConfirmDialog(p => ({ ...p, isOpen: false })); }
      },
    });
  };

  // ── Duplicate ──────────────────────────────────────────────────────────────
  const handleDuplicate = async (id) => {
    setLoading(true);
    try {
      const result = await httpsCallable(functions, 'duplicateItem')({ collection: 'services_new', id });
      myWriteRef.current = true;

      // Optimistic: append a copy to the active bucket
      const cacheKey  = currentCacheKey;
      const bucket    = cacheRef.current[cacheKey];
      const original  = bucket?.docs.find(d => d.id === id);
      if (bucket && original) {
        const copy = {
          ...original,
          id:      result.data?.id || `dup_${Date.now()}`,
          name_sor: (original.name_sor || '') + ' (نووسخە)',
          name_en:  (original.name_en  || '') + ' (Copy)',
          updatedAt: new Date(),
        };
        cacheRef.current[cacheKey] = { ...bucket, docs: [...bucket.docs, copy] };
        setDisplayedDocs(cacheRef.current[cacheKey].docs);
      }

      toast.success('Service duplicated!');
    } catch (error) { toast.error(error.message || 'Failed to duplicate'); }
    finally { setLoading(false); }
  };

  // ── Bulk delete ───────────────────────────────────────────────────────────
  const handleBulkDelete = () => {
    setConfirmDialog({
      isOpen: true, title: 'Delete Selected?',
      message: `Delete ${selectedServices.length} selected services?`,
      onConfirm: async () => {
        try {
          await httpsCallable(functions, 'deleteItems')({ collection: 'services_new', ids: selectedServices });
          myWriteRef.current = true;

          const cacheKey = currentCacheKey;
          const bucket   = cacheRef.current[cacheKey];
          if (bucket) {
            const removed = new Set(selectedServices);
            cacheRef.current[cacheKey] = { ...bucket, docs: bucket.docs.filter(d => !removed.has(d.id)) };
            setDisplayedDocs(cacheRef.current[cacheKey].docs);
          }

          toast.success(`${selectedServices.length} services deleted!`);
          setSelectedServices([]);
        } catch (error) { toast.error(error.message || 'Failed'); }
        finally { setConfirmDialog(p => ({ ...p, isOpen: false })); }
      },
    });
  };

  const toggleCategoryNew = (catId) => {
    const current = formData.categoryref_new || [];
    setField('categoryref_new', current.includes(catId) ? current.filter(id => id !== catId) : [...current, catId]);
  };

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopHeartbeat();
      if (metaUnsubRef.current) metaUnsubRef.current();
      // Release any held lock
      if (editingService && lockAcquired && user?.uid) {
        releaseLock(editingService.id, user.uid).catch(() => {});
      }
    };
  }, []); // eslint-disable-line

  if (!canAccess('services_new')) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-xl text-gray-600">You don't have access to this page.</p>
    </div>
  );

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 lg:ml-64 p-4 pt-16 lg:p-8 lg:pt-8">

          {/* ── Stale data banner ── */}
          {staleBanner && (
            <div className="mb-4 flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5">
              <p className="text-sm text-amber-800 flex items-center gap-2">
                <FiRefreshCw size={14} className="shrink-0" />
                Data was updated externally. Refresh to see the latest.
              </p>
              <div className="flex gap-2 shrink-0">
                <button onClick={handleRefreshBanner} className="text-xs font-semibold text-amber-900 hover:underline">Refresh now</button>
                <button onClick={() => setStaleBanner(false)} className="text-gray-400 hover:text-gray-600"><FiX size={14} /></button>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Services</h1>
              <p className="text-gray-600 mt-1">Manage all services</p>
            </div>
            <button onClick={() => handleOpenModal()} className="btn btn-primary flex items-center gap-2">
              <FiPlus size={20} /> Add New Service
            </button>
          </div>

          {/* Filters */}
          <div className="card mb-6 space-y-3">
            <div className="flex flex-col lg:flex-row gap-3 items-center">
              <div className="relative w-full lg:w-72 shrink-0">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search services..." value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)} className="input pl-10 pr-10 w-full" />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <FiX size={16} />
                  </button>
                )}
              </div>
              <select value={categoryFilter} onChange={e => handleCategoryChange(e.target.value)} className="select w-full lg:flex-1">
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name_sor || cat.name_en || cat.id}</option>
                ))}
              </select>
              {selectedServices.length > 0 && (
                <button onClick={handleBulkDelete} className="btn btn-danger flex items-center gap-2 whitespace-nowrap">
                  <FiTrash2 /> Delete {selectedServices.length}
                </button>
              )}
            </div>

            {subCatLangs.length > 0 && (
              <div className="border border-gray-100 rounded-lg p-3 bg-gray-50 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Subcategory</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {subCatLangs.map(l => {
                    const opts     = subCatOptions[l];
                    const selected = subCatFilter[l];
                    return (
                      <div key={l} className="relative">
                        <label className="block text-xs text-gray-400 mb-1">{LANG_LABELS[l]}</label>
                        <div className="relative">
                          <select value={selected}
                            onChange={e => { setSubCatFilter(prev => ({ ...prev, [l]: e.target.value })); clearDdFilters(); }}
                            className={`select w-full text-sm ${selected ? 'border-primary font-medium' : ''}`}>
                            <option value="">All</option>
                            {opts.map(opt => (
                              <option key={opt.value} value={opt.value}>
                                {opt.icon && !opt.icon.startsWith('http') ? `${opt.icon} ` : ''}{opt.value}
                              </option>
                            ))}
                          </select>
                          {selected && (
                            <button onClick={() => { setSubCatFilter(prev => ({ ...prev, [l]: '' })); clearDdFilters(); }}
                              className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                              <FiX size={13} />
                            </button>
                          )}
                        </div>
                        {selected && subCatOptions[l]?.find(o => o.value === selected)?.icon?.startsWith('http') && (
                          <div className="flex items-center gap-1 mt-1">
                            <img src={subCatOptions[l].find(o => o.value === selected).icon} alt="" className="w-4 h-4 rounded object-cover" />
                            <span className="text-xs text-primary truncate">{selected}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {[1,2,3,4,5,6].map(level => {
              const parentOk = level === 1 ? true : !!ddSelections[`dd${level - 1}`];
              if (!parentOk) return null;
              const opts     = getDdOptions(level);
              if (opts.length === 0) return null;
              const label    = getDdLabel(level);
              const selected = ddSelections[`dd${level}`];
              return (
                <div key={level} className="flex items-center gap-2" style={{ paddingLeft: `${(level - 1) * 16}px` }}>
                  {level > 1 && <span className="text-gray-300 text-xs shrink-0 -ml-4">↳</span>}
                  <div className="relative flex-1">
                    <select value={selected} onChange={e => handleDdSelect(level, e.target.value)}
                      className={`select w-full ${selected ? 'border-primary font-medium' : ''}`}>
                      <option value="">{label ? `All ${label}` : `All (level ${level})`}</option>
                      {opts.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    {selected && (
                      <button onClick={() => handleDdSelect(level, '')} className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <FiX size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {(hasActiveSubCat || hasActiveDd) && (
              <div className="flex justify-end">
                <button onClick={clearAllFilters} className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1">
                  <FiX size={12} /> Clear all filters
                </button>
              </div>
            )}
          </div>

          {/* Count */}
          {!loading && (
            <div className="flex items-center gap-3 mb-4">
              <p className="text-sm text-gray-500 shrink-0">
                {filteredDocs.length} service{filteredDocs.length !== 1 ? 's' : ''}
                {(hasActiveSubCat || hasActiveDd || searchTerm) && displayedDocs.length !== filteredDocs.length
                  ? ` (filtered from ${displayedDocs.length} loaded)`
                  : ''}
                {hasMore && <span className="text-gray-400"> · more available</span>}
              </p>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
          )}

          {/* List */}
          {loading && !displayedDocs.length ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="card text-center py-12"><p className="text-gray-600">No services found</p></div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocs.map(service => (
                  <div key={service.id} className="card hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <input type="checkbox" checked={selectedServices.includes(service.id)}
                        onChange={e => {
                          if (e.target.checked) setSelectedServices(p => [...p, service.id]);
                          else setSelectedServices(p => p.filter(id => id !== service.id));
                        }} className="w-4 h-4 text-primary rounded" />
                      <div className="flex gap-1 items-center">
                        {/* Lock badge — shown when we know this service is locked by someone else */}
                        {lockInfo && editingService?.id === service.id && (
                          <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                            <FiLock size={11} /> {lockInfo.lockedByName}
                          </span>
                        )}
                        <button onClick={() => handleOpenModal(service)} className="p-1.5 hover:bg-gray-100 rounded" title="Edit">
                          <FiEdit2 size={16} className="text-gray-600" />
                        </button>
                        <button onClick={() => handleDuplicate(service.id)} className="p-1.5 hover:bg-gray-100 rounded" title="Duplicate">
                          <FiCopy size={16} className="text-gray-600" />
                        </button>
                        <button onClick={() => handleDelete(service.id)} className="p-1.5 hover:bg-gray-100 rounded" title="Delete">
                          <FiTrash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </div>

                    {service.image_sor && (
                      <div className="w-full h-40 bg-gray-100 rounded-lg mb-3 overflow-hidden">
                        <img src={service.image_sor} alt={service.name_sor} className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="space-y-1">
                      <h3 className="font-semibold text-gray-900">{service.name_sor || service.name_en}</h3>
                      {service.jobtitle_sor && <p className="text-sm text-gray-600">{service.jobtitle_sor}</p>}
                      {service.job_sor      && <p className="text-xs text-gray-500 line-clamp-2">{service.job_sor}</p>}

                      {(() => {
                        const arr = service.dd_sor;
                        if (!arr) return null;
                        const entries = Array.isArray(arr) ? arr : Object.values(arr);
                        const valid   = entries.filter(e => e.value_sor?.trim());
                        if (!valid.length) return null;
                        return (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {valid.map((e, i) => (
                              <span key={i} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                {e.icon_sor?.startsWith('http')
                                  ? <img src={e.icon_sor} alt="" className="w-3 h-3 rounded-sm object-cover" />
                                  : e.icon_sor ? <span>{e.icon_sor}</span> : null}
                                {e.value_sor}
                              </span>
                            ))}
                          </div>
                        );
                      })()}

                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {service.visibility_sor ? <FiEye className="text-green-600" size={16} /> : <FiEyeOff className="text-gray-400" size={16} />}
                        <span className="text-xs text-gray-500">Views: {service.pageview_sor || 0}</span>
                        {service.sortingorder_sor != null && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">#{service.sortingorder_sor}</span>
                        )}
                        {service.contract_paid_sor && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Paid</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Infinite scroll trigger */}
              {hasMore && (
                <div ref={loaderRef} className="flex items-center justify-center py-8">
                  {loadingMore
                    ? <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    : <div className="h-8" /> /* invisible sentinel */}
                </div>
              )}
              {!hasMore && filteredDocs.length >= PAGE_SIZE && (
                <p className="text-center text-sm text-gray-400 py-6">All services loaded</p>
              )}
            </>
          )}
        </main>
      </div>

      <DeleteConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(p => ({ ...p, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
      />

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal max-w-5xl" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-xl font-bold">{editingService ? 'Edit Service' : 'Add New Service'}</h2>
              <button onClick={handleCloseModal} title="Close"><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body space-y-4">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category * <span className="text-gray-400 font-normal text-xs">(primary)</span>
                  </label>
                  <select value={formData.categoryref} onChange={e => setField('categoryref', e.target.value)} className="select" required>
                    <option value="">Select a category</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name_sor || cat.name_en || cat.id}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Categories <span className="text-gray-400 font-normal text-xs">(categoryref_new)</span>
                  </label>
                  {(formData.categoryref_new || []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {(formData.categoryref_new || []).map(catId => {
                        const cat = categories.find(c => c.id === catId);
                        return (
                          <span key={catId} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {cat ? (cat.name_sor || cat.name_en || catId) : catId}
                            <button type="button" onClick={() => toggleCategoryNew(catId)} className="hover:text-red-500"><FiX size={10} /></button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <select value="" onChange={e => { if (e.target.value) toggleCategoryNew(e.target.value); }} className="select">
                    <option value="">+ Add a category…</option>
                    {categories.filter(c => !(formData.categoryref_new || []).includes(c.id)).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name_sor || cat.name_en || cat.id}</option>
                    ))}
                  </select>
                </div>

                <Section title="📝 Names, Titles & Descriptions" defaultOpen>
                  <LanguageTabs>
                    {lang => (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Service Name ({lang.toUpperCase()}) *</label>
                          <input type="text" value={formData[`name_${lang}`]} onChange={e => setField(`name_${lang}`, e.target.value)} className="input" placeholder="Service name" required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Job Title ({lang.toUpperCase()})</label>
                            <input type="text" value={formData[`jobtitle_${lang}`]} onChange={e => setField(`jobtitle_${lang}`, e.target.value)} className="input" placeholder="e.g. Doctor" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Job Title 2 ({lang.toUpperCase()})</label>
                            <input type="text" value={formData[`jobtitle1_${lang}`]} onChange={e => setField(`jobtitle1_${lang}`, e.target.value)} className="input" placeholder="e.g. Specialist" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Description ({lang.toUpperCase()})</label>
                          <textarea value={formData[`job_${lang}`]} onChange={e => setField(`job_${lang}`, e.target.value)} className="textarea" rows={3} placeholder="Service description" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Provided By ({lang.toUpperCase()})</label>
                          <input type="text" value={formData[`providedby_${lang}`]} onChange={e => setField(`providedby_${lang}`, e.target.value)} className="input" placeholder="Provider name" />
                        </div>
                      </div>
                    )}
                  </LanguageTabs>
                </Section>

                <Section title="🖼️ Images">
                  <LanguageTabs>
                    {lang => (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image URL ({lang.toUpperCase()})</label>
                          <input type="url" value={formData[`image_${lang}`]} onChange={e => setField(`image_${lang}`, e.target.value)} className="input" placeholder="https://..." />
                          {formData[`image_${lang}`] && <img src={formData[`image_${lang}`]} alt="Preview" className="w-24 h-24 object-cover rounded mt-2" />}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gallery URLs ({lang.toUpperCase()}) <span className="text-gray-400 font-normal">— one per line</span>
                          </label>
                          <textarea value={formData[`gallery_${lang}`]} onChange={e => setField(`gallery_${lang}`, e.target.value)} className="textarea" rows={4} placeholder={"https://image1.jpg\nhttps://image2.jpg"} />
                        </div>
                      </div>
                    )}
                  </LanguageTabs>
                </Section>

                <Section title="👁️ Visibility, Sorting & Dates">
                  <LanguageTabs>
                    {lang => (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex items-center gap-3">
                            <input type="checkbox" id={`vis_${lang}`} checked={formData[`visibility_${lang}`]} onChange={e => setField(`visibility_${lang}`, e.target.checked)} className="w-4 h-4 text-primary rounded" />
                            <label htmlFor={`vis_${lang}`} className="text-sm font-medium text-gray-700">Visible ({lang.toUpperCase()})</label>
                          </div>
                          <div className="flex items-center gap-3">
                            <input type="checkbox" id={`cp_${lang}`} checked={formData[`contract_paid_${lang}`]} onChange={e => setField(`contract_paid_${lang}`, e.target.checked)} className="w-4 h-4 text-primary rounded" />
                            <label htmlFor={`cp_${lang}`} className="text-sm font-medium text-gray-700">Contract Paid ({lang.toUpperCase()})</label>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Page Views ({lang.toUpperCase()})</label>
                            <input type="number" min="0" value={formData[`pageview_${lang}`]} onChange={e => setField(`pageview_${lang}`, e.target.value)} className="input" placeholder="0" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sorting Order ({lang.toUpperCase()})</label>
                            <input type="number" value={formData[`sortingorder_${lang}`]} onChange={e => setField(`sortingorder_${lang}`, e.target.value)} className="input" placeholder="0" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Created Date ({lang.toUpperCase()})</label>
                            <input type="datetime-local" value={formData[`createddate_${lang}`]} onChange={e => setField(`createddate_${lang}`, e.target.value)} className="input" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Expire Date ({lang.toUpperCase()})</label>
                            <input type="datetime-local" value={formData[`expiredate_${lang}`]} onChange={e => setField(`expiredate_${lang}`, e.target.value)} className="input" />
                          </div>
                        </div>
                      </div>
                    )}
                  </LanguageTabs>
                </Section>

                <Section title="🔍 Search, Tags & Info Bullets">
                  <LanguageTabs>
                    {lang => (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search Keywords ({lang.toUpperCase()}) <span className="text-gray-400 font-normal">— comma separated</span>
                          </label>
                          <input type="text" value={formData[`search_${lang}`]} onChange={e => setField(`search_${lang}`, e.target.value)} className="input" placeholder="keyword1, keyword2, keyword3" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tags ({lang.toUpperCase()}) <span className="text-gray-400 font-normal">— comma separated</span>
                          </label>
                          <input type="text" value={formData[`tags_${lang}`]} onChange={e => setField(`tags_${lang}`, e.target.value)} className="input" placeholder="tag1, tag2, tag3" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Info Bullets ({lang.toUpperCase()}) <span className="text-gray-400 font-normal">— one per line</span>
                          </label>
                          <textarea value={formData[`info_${lang}`]} onChange={e => setField(`info_${lang}`, e.target.value)} className="textarea" rows={3} placeholder={"Info point 1\nInfo point 2"} />
                        </div>
                      </div>
                    )}
                  </LanguageTabs>
                </Section>

                <Section title="📍 Location (Lat/Lng)">
                  <LanguageTabs>
                    {lang => (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Latitude ({lang.toUpperCase()})</label>
                          <input type="number" step="any" value={formData[`latlng_${lang}`]?.lat || ''} onChange={e => setField(`latlng_${lang}`, { ...formData[`latlng_${lang}`], lat: e.target.value })} className="input" placeholder="36.18" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Longitude ({lang.toUpperCase()})</label>
                          <input type="number" step="any" value={formData[`latlng_${lang}`]?.lng || ''} onChange={e => setField(`latlng_${lang}`, { ...formData[`latlng_${lang}`], lng: e.target.value })} className="input" placeholder="44.00" />
                        </div>
                      </div>
                    )}
                  </LanguageTabs>
                </Section>

                <Section title="🗂️ Dropdown Filter Data (dd1–dd6)">
                  <p className="text-xs text-gray-500 mb-3">Values are comma-separated lists. Labels are the header text shown to users.</p>
                  <LanguageTabs>
                    {lang => (
                      <div className="space-y-4">
                        {[1,2,3,4,5,6].map(d => (
                          <div key={d} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                            <p className="text-xs font-semibold text-gray-600 mb-2">DD{d} ({lang.toUpperCase()})</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Label (dd{d}text_{lang})</label>
                                <input type="text" value={formData[`dd${d}text_${lang}`]} onChange={e => setField(`dd${d}text_${lang}`, e.target.value)} className="input text-sm" placeholder={`DD${d} header label`} />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Values — comma separated</label>
                                <input type="text" value={formData[`dd${d}_${lang}`]} onChange={e => setField(`dd${d}_${lang}`, e.target.value)} className="input text-sm" placeholder="value1, value2, value3" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </LanguageTabs>
                </Section>

                <Section title="🏷️ DD Array / Subcategories (dd_sor / dd_bad / dd_ar / dd_en)">
                  <p className="text-xs text-gray-500 mb-3">
                    These define the subcategory values shown in the list page filters. Each entry has an icon (URL or emoji) and a display value, stored per language.
                  </p>
                  <LanguageTabs>
                    {lang => (
                      <DdArrayEditor
                        lang={lang}
                        entries={formData[`dd_${lang}`] || []}
                        onChange={entries => setField(`dd_${lang}`, entries)}
                      />
                    )}
                  </LanguageTabs>
                </Section>

                <Section title="🔖 Tag DD Mapping (tags_sor_dd / tags_bad_dd / tags_ar_dd / tags_en_dd)">
                  <p className="text-xs text-gray-500 mb-3">
                    Each entry maps subcategory (dd_*) values to a tag. Select values from the DD Array entries defined above or from other services.
                  </p>
                  <LanguageTabs>
                    {lang => (
                      <TagsDdEditor
                        lang={lang}
                        entries={formData[`tags_${lang}_dd`] || []}
                        onChange={entries => setField(`tags_${lang}_dd`, entries)}
                        ddOptions={getDdOptionsForModal(lang)}
                      />
                    )}
                  </LanguageTabs>
                </Section>

                <Section title="📋 Details">
                  <p className="text-xs text-gray-500 mb-3">Each detail item has a title and detail text, per language.</p>
                  <DetailsEditor entries={formData.details || []} onChange={entries => setField('details', entries)} />
                </Section>

                <Section title="💳 Payment Info">
                  <p className="text-xs text-gray-500 mb-3">Each payment entry has date, URL, amount, and duration per language.</p>
                  <PaymentInfoEditor entries={formData.payment_info || []} onChange={entries => setField('payment_info', entries)} />
                </Section>

                <Section title="📞 Contact Platforms">
                  <p className="text-xs text-gray-500 mb-3">Each platform can have multiple entries. Each entry has values per language plus a display label.</p>
                  <div className="space-y-4">
                    {PLATFORMS.map(platform => (
                      <div key={platform.key} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200">
                          <span>{platform.icon}</span>
                          <span className="text-sm font-semibold text-gray-700">{platform.label}</span>
                          {(formData[`${platform.key}data`] || []).length > 0 && (
                            <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              {formData[`${platform.key}data`].length} entr{formData[`${platform.key}data`].length === 1 ? 'y' : 'ies'}
                            </span>
                          )}
                        </div>
                        <div className="p-3">
                          <ContactEntryEditor
                            platform={platform}
                            entries={formData[`${platform.key}data`] || []}
                            onChange={entries => setField(`${platform.key}data`, entries)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>

              </div>

              <div className="modal-footer">
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingService ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
