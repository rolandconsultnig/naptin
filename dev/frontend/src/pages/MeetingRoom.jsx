import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getApiBase } from '../contexts/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  Users,
  MessageSquare,
  Settings,
  PhoneOff,
  X,
  Hand,
  MoreVertical,
  Calendar,
  Clock
} from 'lucide-react'

export function MeetingRoom() {
  const { code } = useParams()
  const navigate = useNavigate()
  const [meeting, setMeeting] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [localStream, setLocalStream] = useState(null)
  const [remoteStreams, setRemoteStreams] = useState([])
  const [showChat, setShowChat] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [participants, setParticipants] = useState([])
  const [chatMessages, setChatMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    loadMeeting()
    requestMediaPermissions()
    
    return () => {
      // Cleanup on unmount
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [code])

  const loadMeeting = async () => {
    try {
      const response = await axios.get(`${getApiBase()}/meetings/${code}`, {
        withCredentials: true
      })
      setMeeting(response.data.meeting)
      
      // Join the meeting
      await axios.post(`${getApiBase()}/meetings/${response.data.meeting.id}/join`, {}, {
        withCredentials: true
      })
      
      // Load participants
      await loadParticipants(response.data.meeting.id)
    } catch (error) {
      console.error('Failed to load meeting:', error)
      toast.error('Meeting not found or access denied')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const loadParticipants = async (meetingId) => {
    try {
      const response = await axios.get(`${getApiBase()}/meetings/${meetingId}/participants`, {
        withCredentials: true
      })
      setParticipants(response.data.participants)
    } catch (error) {
      console.error('Failed to load participants:', error)
    }
  }

  const requestMediaPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      })
      setLocalStream(stream)
    } catch (error) {
      console.error('Failed to request media permissions:', error)
      toast.error('Camera and microphone access denied')
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted
      })
    }
  }

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled)
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = isVideoEnabled
      })
    }
  }

  const handleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        })
        setIsScreenSharing(true)
        // Replace video track with screen share
        if (localStream) {
          const videoTrack = stream.getVideoTracks()[0]
          localStream.getVideoTracks().forEach(track => {
            track.stop()
          })
          localStream.addTrack(videoTrack)
        }
      } else {
        setIsScreenSharing(false)
        // Stop screen share and restart camera
        requestMediaPermissions()
      }
    } catch (error) {
      console.error('Failed to share screen:', error)
      toast.error('Failed to share screen')
    }
  }

  const handleLeaveMeeting = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
    }
    navigate('/')
  }

  const handleEndMeeting = async () => {
    if (!meeting) return
    
    try {
      await axios.post(`${getApiBase()}/meetings/${meeting.id}/end`, {}, {
        withCredentials: true
      })
      toast.success('Meeting ended')
      handleLeaveMeeting()
    } catch (error) {
      console.error('Failed to end meeting:', error)
      toast.error('Failed to end meeting')
    }
  }

  const sendChatMessage = () => {
    if (!newMessage.trim()) return
    
    setChatMessages([...chatMessages, {
      id: Date.now(),
      sender: 'You',
      content: newMessage,
      timestamp: new Date()
    }])
    setNewMessage('')
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
  }

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Joining meeting...</p>
        </div>
      </div>
    )
  }

  if (!meeting) {
    return null
  }

  const dt = formatDateTime(meeting.scheduled_at)
  const isHost = meeting.host_id // Should compare with current user ID in real implementation

  return (
    <div className="h-screen w-screen bg-gray-900 flex">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-white font-semibold text-lg">{meeting.title}</h1>
            {meeting.meeting_code && (
              <span className="text-gray-400 text-sm font-mono bg-gray-700 px-3 py-1 rounded">
                {meeting.meeting_code}
              </span>
            )}
            {dt && (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Calendar className="h-4 w-4" />
                <span>{dt.date}</span>
                <Clock className="h-4 w-4 ml-3" />
                <span>{dt.time}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {isHost && (
              <button
                onClick={handleEndMeeting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm"
              >
                <PhoneOff className="h-4 w-4" />
                End Meeting
              </button>
            )}
            <button
              onClick={handleLeaveMeeting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm"
            >
              <X className="h-4 w-4" />
              Leave
            </button>
          </div>
        </div>

        {/* Video Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 overflow-y-auto">
          {/* Local Video */}
          <div className="bg-gray-800 rounded-lg overflow-hidden relative aspect-video">
            {localStream && isVideoEnabled ? (
              <video
                ref={(video) => {
                  if (video) {
                    video.srcObject = localStream
                    video.muted = true
                    video.play().catch(console.error)
                  }
                }}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-700">
                <div className="text-center text-white">
                  <div className="w-16 h-16 bg-gray-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <VideoOff className="h-8 w-8" />
                  </div>
                  <p className="text-sm">Camera Off</p>
                </div>
              </div>
            )}
            {isMuted && (
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 px-3 py-1 rounded flex items-center gap-1 text-white text-sm">
                <MicOff className="h-4 w-4" />
                Muted
              </div>
            )}
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 px-3 py-1 rounded text-white text-sm">
              You
            </div>
          </div>

          {/* Placeholder for other participants */}
          {participants.filter(p => p.role !== 'host' || p.user_id !== meeting.host_id).map((participant, index) => (
            <div key={index} className="bg-gray-800 rounded-lg overflow-hidden relative aspect-video">
              <div className="w-full h-full flex items-center justify-center bg-gray-700">
                <div className="text-center text-white">
                  <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <Users className="h-8 w-8" />
                  </div>
                  <p className="text-sm">{participant.user?.username || 'Participant'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-center gap-4">
          <button
            onClick={toggleMute}
            className={`${isMuted ? 'bg-red-600' : 'bg-gray-700'} text-white p-4 rounded-full hover:opacity-90 transition-colors`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </button>

          <button
            onClick={toggleVideo}
            className={`${isVideoEnabled ? 'bg-gray-700' : 'bg-red-600'} text-white p-4 rounded-full hover:opacity-90 transition-colors`}
            title={isVideoEnabled ? 'Turn off video' : 'Turn on video'}
          >
            {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
          </button>

          <button
            onClick={handleScreenShare}
            className={`${isScreenSharing ? 'bg-blue-600' : 'bg-gray-700'} text-white p-4 rounded-full hover:opacity-90 transition-colors`}
            title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          >
            {isScreenSharing ? <MonitorOff className="h-6 w-6" /> : <Monitor className="h-6 w-6" />}
          </button>

          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className="bg-gray-700 text-white p-4 rounded-full hover:opacity-90 transition-colors"
            title="Participants"
          >
            <Users className="h-6 w-6" />
          </button>

          <button
            onClick={() => setShowChat(!showChat)}
            className="bg-gray-700 text-white p-4 rounded-full hover:opacity-90 transition-colors"
            title="Chat"
          >
            <MessageSquare className="h-6 w-6" />
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="bg-gray-700 text-white p-4 rounded-full hover:opacity-90 transition-colors"
            title="Settings"
          >
            <Settings className="h-6 w-6" />
          </button>

          <button
            onClick={handleLeaveMeeting}
            className="bg-red-600 text-white p-4 rounded-full hover:opacity-90 transition-colors"
            title="Leave"
          >
            <PhoneOff className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Sidebar - Participants */}
      {showParticipants && (
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              Participants ({participants.length})
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {participants.map((participant, index) => (
              <div key={index} className="flex items-center gap-3 py-3 border-b border-gray-700">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {participant.user?.username?.[0] || '?'}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{participant.user?.username || 'Unknown'}</p>
                  <p className="text-gray-400 text-sm capitalize">{participant.role}</p>
                </div>
                {participant.is_muted && (
                  <MicOff className="h-5 w-5 text-gray-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sidebar - Chat */}
      {showChat && (
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Meeting Chat
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {chatMessages.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-2" />
                <p>No messages yet</p>
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div key={msg.id} className="mb-4">
                  <p className="text-gray-400 text-sm mb-1">{msg.sender}</p>
                  <p className="text-white">{msg.content}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              ))
            )}
          </div>
          <div className="px-6 py-4 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={sendChatMessage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar - Settings */}
      {showSettings && (
        <div className="w-80 bg-gray-800 border-l border-gray-700 p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Meeting Settings
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-400 text-sm mb-2">Meeting Info</p>
              <p className="text-white">{meeting.title}</p>
              {meeting.description && (
                <p className="text-gray-400 text-sm mt-2">{meeting.description}</p>
              )}
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-2">Meeting Code</p>
              <p className="text-white font-mono">{meeting.meeting_code}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-2">Settings</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">Screen Sharing</span>
                  <span className={`text-xs px-2 py-1 rounded ${meeting.allow_screen_sharing ? 'bg-green-600' : 'bg-red-600'} text-white`}>
                    {meeting.allow_screen_sharing ? 'Allowed' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">Presentation</span>
                  <span className={`text-xs px-2 py-1 rounded ${meeting.allow_presentation ? 'bg-green-600' : 'bg-red-600'} text-white`}>
                    {meeting.allow_presentation ? 'Allowed' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

