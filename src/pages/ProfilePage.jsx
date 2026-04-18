import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { NAPTIN_LOGO } from '../assets/images'
import { Mail, Phone, MapPin, Briefcase, Hash, Shield, Save, UploadCloud, Lock } from 'lucide-react'
import { hrmsApi } from '../services/hrmsService'
import { UserAvatar } from '../components/UserAvatar'

function fmtDate(v) {
  if (!v) return '—'
  try {
    return new Date(v).toLocaleDateString()
  } catch {
    return '—'
  }
}

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const portalPhotoRef = useRef(null)
  const [portalForm, setPortalForm] = useState({
    name: '',
    phone: '',
    location: '',
    bio: '',
  })
  const [portalSaving, setPortalSaving] = useState(false)
  const [portalPhotoBusy, setPortalPhotoBusy] = useState(false)
  const [portalNote, setPortalNote] = useState('')
  const [employee, setEmployee] = useState(null)
  const [employeeId, setEmployeeId] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [docSaving, setDocSaving] = useState(false)
  const [note, setNote] = useState('')
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    residentialAddress: '',
    stateOfOrigin: '',
    lga: '',
    maritalStatus: '',
    bankName: '',
    bankAccountNo: '',
  })
  const [docForm, setDocForm] = useState({
    docType: 'identity',
    title: '',
    fileUrl: '',
    expiresAt: '',
  })

  const email = String(user?.email || '').trim().toLowerCase()

  const avatarUser = useMemo(
    () =>
      user
        ? {
            ...user,
            profilePicture: user.profilePicture || employee?.profilePhotoUrl || null,
          }
        : null,
    [user, employee?.profilePhotoUrl]
  )

  useEffect(() => {
    if (!user) return
    if (employee?.id) {
      setPortalForm({
        name: employee.portalDisplayName || employee.name || user.name || '',
        phone: employee.phone ?? '',
        location: employee.officeLocation ?? '',
        bio: employee.portalBio ?? '',
      })
      return
    }
    setPortalForm({
      name: user.name || '',
      phone: user.phone || '',
      location: user.location || '',
      bio: user.bio ?? '',
    })
  }, [user, employee?.id, employee?.updatedAt])

  const handlePortalPhoto = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setPortalNote('Choose an image file (PNG, JPG, or WebP).')
      return
    }
    if (file.size > 600 * 1024) {
      setPortalNote('Image must be 600KB or smaller.')
      return
    }
    setPortalPhotoBusy(true)
    setPortalNote('')
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result
      if (typeof dataUrl !== 'string' || dataUrl.length > 900_000) {
        setPortalNote('Image is too large for browser storage. Try a smaller file.')
        setPortalPhotoBusy(false)
        return
      }
      void (async () => {
        try {
          const r = await updateProfile({ profilePicture: dataUrl })
          if (r?.employee) setEmployee(r.employee)
          setPortalNote(
            r?.ok ? 'Profile photo saved to HR database.' : 'Photo saved on this device only; HR database was not updated.'
          )
        } finally {
          setPortalPhotoBusy(false)
        }
      })()
    }
    reader.onerror = () => {
      setPortalNote('Could not read the image file.')
      setPortalPhotoBusy(false)
    }
    reader.readAsDataURL(file)
  }

  const handlePortalSave = async () => {
    if (!updateProfile) return
    setPortalSaving(true)
    setPortalNote('')
    try {
      const r = await updateProfile({
        name: portalForm.name.trim() || user?.name || 'User',
        phone: portalForm.phone.trim(),
        location: portalForm.location.trim(),
        bio: portalForm.bio.trim(),
      })
      if (r?.employee) setEmployee(r.employee)
      setPortalNote(
        r?.ok ? 'Portal profile saved to HR database.' : 'Saved on this device only; HR database was not updated (run API and npm run db:hrms:portal).'
      )
    } finally {
      setPortalSaving(false)
    }
  }

  const clearPortalPhoto = async () => {
    if (!updateProfile) return
    const r = await updateProfile({ profilePicture: null })
    if (r?.employee) setEmployee(r.employee)
    setPortalNote(
      r?.ok ? 'Profile photo removed from HR database.' : 'Photo cleared on this device only; HR database was not updated.'
    )
  }

  const loadProfile = async () => {
    if (!email) {
      setLoading(false)
      setNote('Sign in with your organisation email to load HR profile.')
      return
    }
    setLoading(true)
    try {
      const empData = await hrmsApi.getEmployees({ limit: 400 })
      const list = Array.isArray(empData?.employees) ? empData.employees : []
      const found = list.find((e) => String(e.email || '').toLowerCase() === email)
      if (!found) {
        setEmployee(null)
        setEmployeeId(null)
        setDocuments([])
        setNote('No HR master record matches your account email yet. Contact HR admin to link your profile.')
        return
      }
      setEmployeeId(found.id)
      const [full, docs] = await Promise.all([
        hrmsApi.getEmployee(found.id),
        hrmsApi.getEmployeeDocuments(found.id).catch(() => []),
      ])
      setEmployee(full)
      setForm({
        firstName: full.firstName || '',
        lastName: full.lastName || '',
        phone: full.phone || '',
        residentialAddress: full.residentialAddress || '',
        stateOfOrigin: full.stateOfOrigin || '',
        lga: full.lga || '',
        maritalStatus: full.maritalStatus || '',
        bankName: full.bankName || '',
        bankAccountNo: full.bankAccountNo || '',
      })
      setDocuments(Array.isArray(docs) ? docs : [])
      setNote('Profile synced with HR master data.')
    } catch (e) {
      setNote(e?.response?.data?.error || 'Unable to load HR profile right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email])

  const title = useMemo(() => {
    if (employee) return employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim()
    return user?.name || 'Staff'
  }, [employee, user?.name])

  const handleSave = async () => {
    if (!employeeId) return
    setSaving(true)
    setNote('')
    try {
      const updated = await hrmsApi.updateEmployee(employeeId, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim() || null,
        residentialAddress: form.residentialAddress.trim() || null,
        stateOfOrigin: form.stateOfOrigin.trim() || null,
        lga: form.lga.trim() || null,
        maritalStatus: form.maritalStatus.trim() || null,
        bankName: form.bankName.trim() || null,
        bankAccountNo: form.bankAccountNo.trim() || null,
      })
      setEmployee(updated)
      setNote('Profile updated in HR master data.')
    } catch (e) {
      setNote(e?.response?.data?.error || 'Profile update failed.')
    } finally {
      setSaving(false)
    }
  }

  const handleDocSave = async () => {
    if (!employeeId || !docForm.title.trim() || !docForm.fileUrl.trim()) return
    setDocSaving(true)
    setNote('')
    try {
      await hrmsApi.createEmployeeDocument(employeeId, {
        docType: docForm.docType,
        title: docForm.title.trim(),
        fileUrl: docForm.fileUrl.trim(),
        uploadedBy: user?.email || null,
        expiresAt: docForm.expiresAt || null,
      })
      setDocForm({ docType: 'identity', title: '', fileUrl: '', expiresAt: '' })
      const docs = await hrmsApi.getEmployeeDocuments(employeeId)
      setDocuments(Array.isArray(docs) ? docs : [])
      setNote('Document registered on your HR profile.')
    } catch (e) {
      setNote(e?.response?.data?.error || 'Could not save document.')
    } finally {
      setDocSaving(false)
    }
  }

  return (
    <div className="animate-fade-up max-w-5xl space-y-5">
      <div className="flex items-center gap-3">
        <img src={NAPTIN_LOGO} alt="" className="w-9 h-9 object-contain hidden sm:block" />
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">My profile</h1>
          <p className="text-sm text-slate-400">Employee portal view linked to HR master data (edits and documents).</p>
        </div>
      </div>

      {note ? (
        <p className="text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600">{note}</p>
      ) : null}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="card xl:col-span-1 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-slate-800">Portal profile</h2>
            <button
              type="button"
              className="btn-primary text-xs"
              disabled={portalSaving}
              onClick={handlePortalSave}
            >
              <Save size={13} /> {portalSaving ? 'Saving…' : 'Save'}
            </button>
          </div>
          {portalNote ? (
            <p className="text-[11px] rounded-lg border border-emerald-100 bg-emerald-50/80 px-2.5 py-1.5 text-emerald-900">{portalNote}</p>
          ) : null}
          <div className="flex flex-col items-center text-center">
            <div className="relative inline-block mb-3">
              <UserAvatar user={avatarUser} className="w-24 h-24 rounded-2xl" textClassName="text-2xl" />
              <button
                type="button"
                title="Change profile photo"
                disabled={portalPhotoBusy}
                onClick={() => portalPhotoRef.current?.click()}
                className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#006838] shadow-sm hover:bg-slate-50 disabled:opacity-50"
              >
                <UploadCloud size={16} />
              </button>
              <input
                ref={portalPhotoRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePortalPhoto}
              />
            </div>
            {portalPhotoBusy ? <p className="text-[10px] text-slate-500 mb-1">Processing image…</p> : null}
            {user?.profilePicture ? (
              <button type="button" onClick={clearPortalPhoto} className="text-[10px] text-slate-500 hover:text-red-600 underline mb-2">
                Remove photo
              </button>
            ) : null}
            <p className="text-sm font-bold text-slate-900">{title}</p>
            <p className="text-xs text-slate-500">{employee?.positionTitle || user?.role || 'Staff'}</p>
            <span className="badge badge-green text-[9px] mt-2">Active</span>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Lock size={10} /> Username
              </label>
              <input
                className="np-input mt-1 w-full text-sm bg-slate-50 text-slate-600 cursor-not-allowed"
                value={user?.username || '—'}
                readOnly
                title="Username cannot be changed"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Display name</label>
              <input
                className="np-input mt-1 w-full text-sm"
                value={portalForm.name}
                onChange={(e) => setPortalForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Phone</label>
              <input
                className="np-input mt-1 w-full text-sm"
                value={portalForm.phone}
                onChange={(e) => setPortalForm((p) => ({ ...p, phone: e.target.value }))}
                inputMode="tel"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Location</label>
              <input
                className="np-input mt-1 w-full text-sm"
                value={portalForm.location}
                onChange={(e) => setPortalForm((p) => ({ ...p, location: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Bio</label>
              <textarea
                className="np-input mt-1 w-full text-sm min-h-[64px]"
                value={portalForm.bio}
                onChange={(e) => setPortalForm((p) => ({ ...p, bio: e.target.value }))}
                placeholder="Short introduction visible on the portal"
              />
            </div>
          </div>
          <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
            {[
              { icon: Mail, label: 'Work email', value: employee?.email || user?.email },
              { icon: Briefcase, label: 'Department', value: employee?.departmentName || user?.department },
              { icon: Hash, label: 'Staff ID', value: employee?.employeeId || user?.staffId, mono: true },
              { icon: MapPin, label: 'Location', value: user?.location || '—' },
            ].map((row, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <row.icon size={14} className="text-[#006838] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{row.label}</p>
                  <p className={`text-xs text-slate-800 ${row.mono ? 'font-mono' : ''}`}>{row.value || '—'}</p>
                </div>
              </div>
            ))}
            <div className="flex items-start gap-2 p-2 rounded-xl bg-amber-50 border border-amber-100">
              <Shield size={14} className="text-amber-600 mt-0.5" />
              <p className="text-xs text-amber-900">
                Role key: <span className="font-mono font-bold">{user?.roleKey ?? '—'}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="card xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">HR master profile</h2>
            <button type="button" className="btn-primary text-xs" disabled={saving || loading || !employeeId} onClick={handleSave}>
              <Save size={13} /> {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
          {loading ? <p className="text-xs text-slate-400">Loading profile…</p> : null}
          {!loading && !employeeId ? (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
              HR profile not found for this login email.
            </p>
          ) : null}
          {employeeId ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                ['First name', 'firstName'],
                ['Last name', 'lastName'],
                ['Phone', 'phone'],
                ['Marital status', 'maritalStatus'],
                ['State of origin', 'stateOfOrigin'],
                ['LGA', 'lga'],
                ['Bank name', 'bankName'],
                ['Bank account', 'bankAccountNo'],
              ].map(([label, key]) => (
                <div key={key}>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">{label}</label>
                  <input
                    className="np-input mt-1 w-full text-sm"
                    value={form[key]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                  />
                </div>
              ))}
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Residential address</label>
                <textarea
                  className="np-input mt-1 w-full text-sm min-h-[72px]"
                  value={form.residentialAddress}
                  onChange={(e) => setForm((prev) => ({ ...prev, residentialAddress: e.target.value }))}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">Employee documents</h2>
          <span className="text-[10px] text-slate-400">{documents.length} document(s)</span>
        </div>
        {employeeId ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <input
              className="np-input text-xs"
              placeholder="Document title"
              value={docForm.title}
              onChange={(e) => setDocForm((p) => ({ ...p, title: e.target.value }))}
            />
            <select className="np-input text-xs" value={docForm.docType} onChange={(e) => setDocForm((p) => ({ ...p, docType: e.target.value }))}>
              <option value="identity">Identity</option>
              <option value="qualification">Qualification</option>
              <option value="medical">Medical</option>
              <option value="contract">Contract</option>
              <option value="other">Other</option>
            </select>
            <input
              className="np-input text-xs"
              placeholder="File URL (https://...)"
              value={docForm.fileUrl}
              onChange={(e) => setDocForm((p) => ({ ...p, fileUrl: e.target.value }))}
            />
            <input
              type="date"
              className="np-input text-xs"
              value={docForm.expiresAt}
              onChange={(e) => setDocForm((p) => ({ ...p, expiresAt: e.target.value }))}
            />
            <div className="md:col-span-4">
              <button
                type="button"
                className="btn-primary text-xs"
                disabled={docSaving || !docForm.title.trim() || !docForm.fileUrl.trim()}
                onClick={handleDocSave}
              >
                <UploadCloud size={13} /> {docSaving ? 'Saving…' : 'Register document'}
              </button>
            </div>
          </div>
        ) : null}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-th text-left">
                <th className="table-th">Title</th>
                <th className="table-th">Type</th>
                <th className="table-th">Added</th>
                <th className="table-th">Expires</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((d) => (
                <tr key={d.id} className="border-b border-slate-50">
                  <td className="table-td text-xs">
                    <a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-[#006838] hover:underline">
                      {d.title}
                    </a>
                  </td>
                  <td className="table-td text-xs">{d.docType}</td>
                  <td className="table-td text-xs text-slate-500">{fmtDate(d.createdAt)}</td>
                  <td className="table-td text-xs text-slate-500">{fmtDate(d.expiresAt)}</td>
                </tr>
              ))}
              {documents.length === 0 ? (
                <tr>
                  <td className="table-td text-xs text-slate-400" colSpan={4}>
                    No employee documents on record yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
