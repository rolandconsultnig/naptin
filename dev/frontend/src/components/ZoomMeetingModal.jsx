import { useState } from 'react'
import { 
  X, Calendar, Clock, Lock, Users, Settings, Video, 
  Eye, EyeOff, Copy, Check
} from 'lucide-react'
import { toast } from 'react-toastify'

export default function ZoomMeetingModal({ isOpen, onClose, onCreateMeeting }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    meeting_type: 'instant', // instant, scheduled, recurring
    scheduled_date: '',
    scheduled_time: '',
    duration: 60, // minutes
    has_password: false,
    password: '',
    has_waiting_room: false,
    allow_participants_to_share: true,
    allow_participants_to_unmute: true,
    allow_chat: true,
    max_participants: 100,
    auto_record: false
  })

  const [copied, setCopied] = useState(false)
  const [generatedLink, setGeneratedLink] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error('Meeting title is required')
      return
    }

    if (formData.has_password && !formData.password.trim()) {
      toast.error('Password is required when meeting is password protected')
      return
    }

    if (formData.meeting_type === 'scheduled' && !formData.scheduled_date) {
      toast.error('Scheduled date is required for scheduled meetings')
      return
    }

    // Generate meeting link
    const meetingCode = Math.random().toString(36).substring(2, 15)
    const link = `${window.location.origin}/meeting/${meetingCode}`
    setGeneratedLink(link)

    // Call parent callback
    onCreateMeeting && onCreateMeeting({
      ...formData,
      meeting_code: meetingCode,
      link
    })

    toast.success('Meeting created successfully!')
    onClose()
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink)
    setCopied(true)
    toast.success('Link copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Create New Meeting</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {/* Basic Info */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter meeting title"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter meeting description"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Meeting Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Meeting Type
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, meeting_type: 'instant' })}
                className={`flex-1 px-4 py-3 rounded-lg border-2 ${
                  formData.meeting_type === 'instant'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } transition-colors`}
              >
                <Video className="h-6 w-6 mx-auto mb-2 text-gray-700" />
                <p className="font-medium text-gray-900">Instant</p>
                <p className="text-xs text-gray-500">Start immediately</p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, meeting_type: 'scheduled' })}
                className={`flex-1 px-4 py-3 rounded-lg border-2 ${
                  formData.meeting_type === 'scheduled'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } transition-colors`}
              >
                <Calendar className="h-6 w-6 mx-auto mb-2 text-gray-700" />
                <p className="font-medium text-gray-900">Scheduled</p>
                <p className="text-xs text-gray-500">Set date and time</p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, meeting_type: 'recurring' })}
                className={`flex-1 px-4 py-3 rounded-lg border-2 ${
                  formData.meeting_type === 'recurring'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } transition-colors`}
              >
                <Clock className="h-6 w-6 mx-auto mb-2 text-gray-700" />
                <p className="font-medium text-gray-900">Recurring</p>
                <p className="text-xs text-gray-500">Repeat weekly/monthly</p>
              </button>
            </div>
          </div>

          {/* Scheduling (if scheduled) */}
          {formData.meeting_type === 'scheduled' && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time *
                </label>
                <input
                  type="time"
                  value={formData.scheduled_time}
                  onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          )}

          {/* Duration */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes)
            </label>
            <select
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
              <option value={180}>3 hours</option>
            </select>
          </div>

          {/* Security Settings */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-5 w-5 text-gray-700" />
              <h3 className="font-semibold text-gray-900">Security Settings</h3>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.has_password}
                  onChange={(e) => setFormData({ ...formData, has_password: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Require meeting password</span>
              </label>

              {formData.has_password && (
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter meeting password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.has_waiting_room}
                  onChange={(e) => setFormData({ ...formData, has_waiting_room: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Enable waiting room</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allow_chat}
                  onChange={(e) => setFormData({ ...formData, allow_chat: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Allow chat during meeting</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allow_participants_to_share}
                  onChange={(e) => setFormData({ ...formData, allow_participants_to_share: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Allow participants to share screen</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allow_participants_to_unmute}
                  onChange={(e) => setFormData({ ...formData, allow_participants_to_unmute: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Allow participants to unmute themselves</span>
              </label>
            </div>
          </div>

          {/* Max Participants */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Participants
            </label>
            <input
              type="number"
              value={formData.max_participants}
              onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) || 100 })}
              min={2}
              max={500}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Generated Link */}
          {generatedLink && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <LinkIcon className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Meeting Link Generated</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={generatedLink}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white border border-blue-200 rounded text-sm"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm flex items-center gap-2"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Create Meeting
          </button>
        </div>
      </div>
    </div>
  )
}

