import React, { useState } from 'react'
import { X, Video, Copy, Check, Calendar, Clock } from 'lucide-react'
import { getApiBase } from '../contexts/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'

export function MeetingModal({ isOpen, onClose, onMeetingCreated }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [meetingType, setMeetingType] = useState('instant') // instant, scheduled
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [duration, setDuration] = useState(60) // minutes
  const [allowScreenSharing, setAllowScreenSharing] = useState(true)
  const [allowPresentation, setAllowPresentation] = useState(true)
  const [loading, setLoading] = useState(false)
  const [createdMeeting, setCreatedMeeting] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (meetingType === 'scheduled') {
      if (!scheduledDate || !scheduledTime) {
        toast.error('Please select a date and time for the scheduled meeting')
        return
      }
    }
    
    setLoading(true)

    try {
      const payload = {
        title,
        description,
        meeting_type: meetingType,
        allow_screen_sharing: allowScreenSharing,
        allow_presentation: allowPresentation
      }
      
      if (meetingType === 'scheduled') {
        payload.scheduled_at = `${scheduledDate}T${scheduledTime}`
        payload.duration = duration
      }
      
      const response = await axios.post(`${getApiBase()}/meetings`, payload, {
        withCredentials: true
      })

      setCreatedMeeting(response.data.meeting)
      toast.success('Meeting created successfully!')
      if (onMeetingCreated) {
        onMeetingCreated(response.data.meeting)
      }
    } catch (error) {
      console.error('Failed to create meeting:', error)
      toast.error(error.response?.data?.error || 'Failed to create meeting')
    } finally {
      setLoading(false)
    }
  }

  const copyMeetingLink = () => {
    const link = `${window.location.origin}/meeting/${createdMeeting.meeting_code}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    toast.success('Meeting link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const joinMeeting = () => {
    window.location.href = `/meeting/${createdMeeting.meeting_code}`
  }

  if (!isOpen) return null

  if (createdMeeting) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Meeting Created!</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Code
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={createdMeeting.meeting_code}
                  readOnly
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-lg"
                />
                <button
                  onClick={copyMeetingLink}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={joinMeeting}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Video className="h-5 w-5" />
                Join Meeting
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Video className="h-6 w-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Create Meeting</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter meeting title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Type
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setMeetingType('instant')}
                className={`flex-1 px-4 py-3 border-2 rounded-lg transition-colors ${
                  meetingType === 'instant'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Video className="h-5 w-5 mx-auto mb-1" />
                <div className="text-sm font-medium">Instant Meeting</div>
                <div className="text-xs text-gray-500">Start now</div>
              </button>
              <button
                type="button"
                onClick={() => setMeetingType('scheduled')}
                className={`flex-1 px-4 py-3 border-2 rounded-lg transition-colors ${
                  meetingType === 'scheduled'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Calendar className="h-5 w-5 mx-auto mb-1" />
                <div className="text-sm font-medium">Scheduled</div>
                <div className="text-xs text-gray-500">Plan ahead</div>
              </button>
            </div>
          </div>

          {meetingType === 'scheduled' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date
                  </label>
                  <input
                    type="date"
                    required={meetingType === 'scheduled'}
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Time
                  </label>
                  <input
                    type="time"
                    required={meetingType === 'scheduled'}
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter meeting description"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Allow Screen Sharing
              </label>
              <button
                type="button"
                onClick={() => setAllowScreenSharing(!allowScreenSharing)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  allowScreenSharing ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    allowScreenSharing ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Allow Presentation
              </label>
              <button
                type="button"
                onClick={() => setAllowPresentation(!allowPresentation)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  allowPresentation ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    allowPresentation ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

