import { useState, useEffect, useRef } from 'react'
import { 
  Mic, MicOff, Video, VideoOff, Monitor, Users, MessageSquare, 
  Hand, Lock, Settings, Share2, PhoneOff, Download, Upload,
  X, Check, Clock, Calendar, Link as LinkIcon
} from 'lucide-react'
import { useCall } from './CallUI'

/**
 * Zoom-like Meeting Interface Component
 * Features:
 * - Virtual backgrounds
 * - Meeting chat
 * - Participant list
 * - Raise hand
 * - Meeting lock
 * - Waiting room
 * - Meeting scheduling
 */
export default function ZoomMeetingUI() {
  const {
    callState,
    endCall,
    toggleMute,
    toggleVideo,
    startScreenShare,
    stopScreenShare
  } = useCall()

  const [showParticipantList, setShowParticipantList] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [participants, setParticipants] = useState([])
  const [chatMessages, setChatMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [showVirtualBg, setShowVirtualBg] = useState(false)
  const [virtualBackgrounds] = useState([
    { id: 1, name: 'Blur', url: '/virtual-bg/blur.png' },
    { id: 2, name: 'Office', url: '/virtual-bg/office.jpg' },
    { id: 3, name: 'Nature', url: '/virtual-bg/nature.jpg' },
    { id: 4, name: 'Abstract', url: '/virtual-bg/abstract.jpg' }
  ])
  const [selectedBg, setSelectedBg] = useState(null)
  const [meetingSettings, setMeetingSettings] = useState({
    isLocked: false,
    hasWaitingRoom: false,
    allowChat: true,
    allowScreenShare: true
  })

  const chatMessagesEndRef = useRef(null)

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages])

  const handleRaiseHand = () => {
    // Emit raise hand event
    console.log('✋ Hand raised')
  }

  const handleSendChatMessage = () => {
    if (newMessage.trim()) {
      // Emit chat message
      console.log('💬 Sending message:', newMessage)
      setChatMessages([...chatMessages, {
        id: Date.now(),
        sender: 'You',
        content: newMessage,
        timestamp: new Date().toLocaleTimeString()
      }])
      setNewMessage('')
    }
  }

  const toggleLock = () => {
    setMeetingSettings({
      ...meetingSettings,
      isLocked: !meetingSettings.isLocked
    })
  }

  if (!callState.isInCall && !callState.isCalling) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 overflow-hidden">
      {/* Main Video Grid */}
      <div className="h-full flex">
        {/* Participant Video Grid */}
        <div className="flex-1 flex items-center justify-center p-4">
          {callState.isScreenSharing ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="bg-black rounded-lg w-full h-full flex items-center justify-center">
                <span className="text-white">Screen Share</span>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="bg-gray-800 rounded-lg w-full h-full flex items-center justify-center">
                <span className="text-white">Participant Video</span>
              </div>
            </div>
          )}
        </div>

        {/* Side Panels */}
        {showParticipantList && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-white font-semibold">Participants ({participants.length})</h3>
              <button
                onClick={() => setShowParticipantList(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {participants.map((p) => (
                <div key={p.id} className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-sm">{p.name[0]}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">{p.name}</p>
                    {p.isHost && <p className="text-xs text-gray-400">Host</p>}
                  </div>
                  {p.hasRaisedHand && (
                    <button className="text-yellow-500">
                      <Hand className="h-5 w-5" />
                    </button>
                  )}
                  <button className={p.isMuted ? 'text-red-500' : 'text-green-500'}>
                    {p.isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {showChat && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-white font-semibold">Chat</h3>
              <button
                onClick={() => setShowChat(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="mb-3">
                  <p className="text-xs text-gray-400 mb-1">{msg.sender} • {msg.timestamp}</p>
                  <p className="text-white text-sm">{msg.content}</p>
                </div>
              ))}
              <div ref={chatMessagesEndRef} />
            </div>
            <div className="p-4 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendChatMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendChatMessage}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleMute}
              className={`${callState.isMuted ? 'bg-red-600' : 'bg-gray-700'} hover:opacity-90 rounded-full p-3 transition-colors`}
              title={callState.isMuted ? 'Unmute' : 'Mute'}
            >
              {callState.isMuted ? (
                <MicOff className="h-6 w-6 text-white" />
              ) : (
                <Mic className="h-6 w-6 text-white" />
              )}
            </button>

            {callState.callType === 'video' && (
              <button
                onClick={toggleVideo}
                className={`${!callState.isVideoEnabled ? 'bg-red-600' : 'bg-gray-700'} hover:opacity-90 rounded-full p-3 transition-colors`}
                title={callState.isVideoEnabled ? 'Stop Video' : 'Start Video'}
              >
                {callState.isVideoEnabled ? (
                  <Video className="h-6 w-6 text-white" />
                ) : (
                  <VideoOff className="h-6 w-6 text-white" />
                )}
              </button>
            )}

            {/* Screen Share */}
            <button
              onClick={callState.isScreenSharing ? stopScreenShare : startScreenShare}
              className={`${callState.isScreenSharing ? 'bg-blue-600' : 'bg-gray-700'} hover:opacity-90 rounded-full p-3 transition-colors`}
              title={callState.isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
            >
              <Monitor className="h-6 w-6 text-white" />
            </button>

            {/* Raise Hand */}
            <button
              onClick={handleRaiseHand}
              className="bg-gray-700 hover:bg-gray-600 rounded-full p-3 transition-colors"
              title="Raise Hand"
            >
              <Hand className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Center Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleLock}
              className={`${meetingSettings.isLocked ? 'bg-red-600' : 'bg-gray-700'} hover:opacity-90 rounded-full p-3 transition-colors`}
              title={meetingSettings.isLocked ? 'Unlock Meeting' : 'Lock Meeting'}
            >
              <Lock className="h-6 w-6 text-white" />
            </button>

            <button
              onClick={() => setShowParticipantList(!showParticipantList)}
              className={`${showParticipantList ? 'bg-blue-600' : 'bg-gray-700'} hover:opacity-90 rounded-full p-3 transition-colors`}
              title="Show Participants"
            >
              <Users className="h-6 w-6 text-white" />
            </button>

            <button
              onClick={() => setShowChat(!showChat)}
              className={`${showChat ? 'bg-blue-600' : 'bg-gray-700'} hover:opacity-90 rounded-full p-3 transition-colors`}
              title="Show Chat"
            >
              <MessageSquare className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="bg-gray-700 hover:bg-gray-600 rounded-full p-3 transition-colors"
              title="Settings"
            >
              <Settings className="h-6 w-6 text-white" />
            </button>

            <button
              onClick={endCall}
              className="bg-red-600 hover:bg-red-700 rounded-full p-3 transition-colors"
              title="End Meeting"
            >
              <PhoneOff className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg p-6 w-96 max-w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-semibold">Meeting Settings</h2>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Virtual Background */}
            <div className="mb-6">
              <h3 className="text-white text-sm font-semibold mb-3">Virtual Background</h3>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedBg(null)}
                  className={`w-20 h-16 rounded bg-gray-700 border-2 ${selectedBg === null ? 'border-blue-500' : 'border-transparent'} flex items-center justify-center`}
                >
                  <X className="h-6 w-6 text-white" />
                </button>
                {virtualBackgrounds.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => setSelectedBg(bg.url)}
                    className={`w-20 h-16 rounded bg-cover bg-center border-2 ${
                      selectedBg === bg.url ? 'border-blue-500' : 'border-transparent'
                    }`}
                    style={{ backgroundImage: `url(${bg.url})` }}
                    title={bg.name}
                  />
                ))}
              </div>
            </div>

            {/* Meeting Settings */}
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={meetingSettings.hasWaitingRoom}
                  onChange={(e) => setMeetingSettings({ ...meetingSettings, hasWaitingRoom: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-white text-sm">Enable Waiting Room</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={meetingSettings.allowChat}
                  onChange={(e) => setMeetingSettings({ ...meetingSettings, allowChat: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-white text-sm">Allow Chat</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={meetingSettings.allowScreenShare}
                  onChange={(e) => setMeetingSettings({ ...meetingSettings, allowScreenShare: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-white text-sm">Allow Screen Sharing</span>
              </label>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

