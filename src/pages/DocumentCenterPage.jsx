import { NAPTIN_LOGO } from '../assets/images'
import { DMS_RECORDS } from '../data/mock'
import { Archive, Lock, Search } from 'lucide-react'

export default function DocumentCenterPage() {
  return (
    <div className="animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <img src={NAPTIN_LOGO} alt="" className="w-9 h-9 object-contain hidden sm:block" />
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Document management</h1>
            <p className="text-sm text-slate-400">Enterprise records, classification, and retention register.</p>
          </div>
        </div>
        <button type="button" className="btn-primary self-start">
          <Archive size={15} /> Register document
        </button>
      </div>

      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 mb-5 max-w-md">
        <Search size={16} className="text-slate-400" />
        <input placeholder="Search by ref, title, owner..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="table-th text-left">Reference</th>
              <th className="table-th text-left">Title</th>
              <th className="table-th text-left">Classification</th>
              <th className="table-th text-left">Owner unit</th>
              <th className="table-th text-left">Retention</th>
            </tr>
          </thead>
          <tbody>
            {DMS_RECORDS.map((d, i) => (
              <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/80">
                <td className="table-td font-mono text-xs">{d.ref}</td>
                <td className="table-td font-semibold text-slate-800 flex items-center gap-2">
                  {d.classification === 'Confidential' && <Lock size={12} className="text-amber-500 flex-shrink-0" />}
                  {d.title}
                </td>
                <td className="table-td">
                  <span className={d.classification === 'Confidential' ? 'badge badge-red text-[10px]' : 'badge badge-blue text-[10px]'}>
                    {d.classification}
                  </span>
                </td>
                <td className="table-td">{d.owner}</td>
                <td className="table-td text-slate-500 text-xs">{d.retention}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
