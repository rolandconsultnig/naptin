import React, { useEffect, useRef } from 'react'
import { useChatCall } from './ChatCallContext'
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, X, Monitor, MonitorOff, Pause, Play, Presentation, Circle, ChevronLeft, ChevronRight, Eraser } from 'lucide-react'
import toast from 'react-hot-toast'

export function CallUI() {
  const { callState, acceptCall, rejectCall, endCall, toggleMute, toggleVideo, startScreenShare, stopScreenShare, togglePresentationMode, togglePause, startRecording, stopRecording, nextSlide, previousSlide, setAnnotationTool } = useChatCall()
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const remoteAudioRef = useRef(null) // For audio-only calls

  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Get quality indicator color
  const getQualityColor = () => {
    switch (callState.callQuality) {
      case 'good': return 'text-green-500'
      case 'fair': return 'text-yellow-500'
      case 'poor': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  // Get quality indicator
  const getQualityIndicator = () => {
    switch (callState.callQuality) {
      case 'good': return '🟢'
      case 'fair': return '🟡'
      case 'poor': return '🔴'
      default: return '⚪'
    }
  }

  useEffect(() => {
    if (localVideoRef.current && callState.localStream) {
      localVideoRef.current.srcObject = callState.localStream
      localVideoRef.current.play().catch(err => console.error('Error playing local video:', err))
    } else if (localVideoRef.current) {
      localVideoRef.current.srcObject = null
    }
  }, [callState.localStream])

  useEffect(() => {
    if (remoteVideoRef.current && callState.remoteStream) {
      remoteVideoRef.current.srcObject = callState.remoteStream
      // Ensure audio is enabled for remote video
      remoteVideoRef.current.muted = false
      // Attempt to play with audio
      remoteVideoRef.current.play().catch(err => {
        console.error('Error playing remote video:', err)
        // If autoplay fails (browser policy), user needs to interact
        toast.error('Please click to enable audio')
      })
    } else if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null
    }
  }, [callState.remoteStream])

  // Handle remote audio for audio-only calls
  useEffect(() => {
    if (remoteAudioRef.current && callState.remoteStream) {
      remoteAudioRef.current.srcObject = callState.remoteStream
      // Ensure audio is enabled
      remoteAudioRef.current.muted = false
      console.log('🎵 Playing remote audio stream')
      remoteAudioRef.current.play().catch(err => {
        console.error('Error playing remote audio:', err)
        toast.error('Please click to enable audio')
      })
    } else if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null
    }
  }, [callState.remoteStream])

  if (!callState.isCalling && !callState.isInCall && !callState.incomingCall) {
    return null
  }
  
  const isVideoCall = callState.isInCall && callState.callType === 'video'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      
      {/* INCOMING CALL SCREEN */}
      {callState.incomingCall && (
        <div className="text-center text-white bg-gray-900 rounded-lg shadow-2xl p-12 max-w-md flex flex-col border-2 border-blue-500">
          {/* HEADER */}
          <div className="mb-8">
            <div className="w-32 h-32 bg-green-500 rounded-full mx-auto flex items-center justify-center mb-4">
              <Phone className="h-16 w-16 text-white" />
            </div>
            <h2 className="text-2xl font-bold">{callState.incomingCall.caller_username}</h2>
            <p className="text-gray-400 mt-2">
              {callState.callType === 'video' ? 'Video call' : 'Voice call'}
            </p>
          </div>
          
          {/* BUTTONS */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => rejectCall()}
              className="bg-red-600 hover:bg-red-700 rounded-full p-4 transition-colors"
              title="Reject"
            >
              <PhoneOff className="h-8 w-8" />
            </button>
            <button
              onClick={() => acceptCall(callState.incomingCall)}
              className="bg-green-600 hover:bg-green-700 rounded-full p-4 transition-colors"
              title="Accept"
            >
              <Phone className="h-8 w-8" />
            </button>
          </div>
        </div>
      )}

      {/* CALLING SCREEN */}
      {callState.isCalling && !callState.isInCall && (
        <div className="text-center text-white bg-gray-900 rounded-lg shadow-2xl p-12 max-w-md flex flex-col border-2 border-blue-500">
          <div className="mb-8">
            <div className="w-32 h-32 bg-blue-500 rounded-full mx-auto flex items-center justify-center mb-4 animate-pulse">
              <Phone className="h-16 w-16 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Calling...</h2>
            <p className="text-gray-400 mt-2">Please wait...</p>
          </div>
          <button
            onClick={endCall}
            className="bg-red-600 hover:bg-red-700 rounded-full p-4 transition-colors mx-auto"
            title="Cancel"
          >
            <X className="h-8 w-8" />
          </button>
        </div>
      )}

      {/* VIDEO CALL - POPUP WINDOW */}
      {isVideoCall && callState.isInCall && (
        <div className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden border-2 border-blue-500 relative">
          {/* HEADER - Close Button */}
          <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-700">
            <div className="flex items-center gap-4">
              <Video className="h-5 w-5 text-green-500" />
              <span className="text-white font-semibold">Video Call</span>
              <span className="text-gray-400 text-sm">
                {callState.remoteStream ? 'Connected' : 'Connecting...'}
              </span>
              {callState.remoteStream && (
                <span className={`text-sm ${getQualityColor()}`}>
                  {getQualityIndicator()} {callState.callQuality}
                </span>
              )}
            </div>
            <button
              onClick={endCall}
              className="p-2 hover:bg-red-600 rounded-full transition-colors"
              title="End Call & Close"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* MAIN VIDEO DISPLAY */}
          <div className="flex-1 bg-gray-900 relative overflow-hidden">
            {/* Remote Video */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              controls={false}
              className="w-full h-full object-cover"
            />
            
            {/* Local Video (PiP) */}
            {callState.localStream && (
              <div className="absolute bottom-4 right-4 w-64 h-40 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600 relative">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {callState.isMuted && (
                  <div className="absolute top-2 left-2 bg-red-600 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
                    <MicOff className="h-3 w-3" />
                    Muted
                  </div>
                )}
              </div>
            )}

            {/* Call Duration Overlay */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 px-3 py-2 rounded-lg flex items-center gap-2">
              <span className={getQualityColor()}>{getQualityIndicator()}</span>
              <span className="text-white font-mono">{formatDuration(callState.callDuration)}</span>
            </div>

            {/* Screen Sharing Indicator */}
            {callState.isScreenSharing && (
              <div className="absolute top-4 right-4 bg-green-600 px-3 py-2 rounded-lg flex items-center gap-2">
                <Monitor className="h-4 w-4 text-white" />
                <span className="text-white text-sm font-medium">Screen Sharing</span>
              </div>
            )}

            {/* Recording Indicator */}
            {callState.isRecording && (
              <div className="absolute bottom-20 left-4 bg-red-600 px-4 py-2 rounded-lg flex items-center gap-2 animate-pulse">
                <Circle className="h-4 w-4 text-white fill-white" />
                <span className="text-white text-sm font-medium">
                  Recording {formatDuration(callState.recordingDuration)}
                </span>
              </div>
            )}

            {/* Slide Info */}
            {callState.presentationMode && callState.totalSlides > 0 && (
              <div className="absolute top-4 right-4 bg-blue-600 px-4 py-2 rounded-lg">
                <span className="text-white text-sm font-medium">
                  Slide {callState.currentSlide + 1} / {callState.totalSlides}
                </span>
              </div>
            )}
          </div>

          {/* CONTROLS BAR */}
          <div className="bg-gray-800 px-6 py-4 flex justify-center gap-4 flex-wrap border-t border-gray-700">
            {/* Mute Toggle */}
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

            {/* Video Toggle */}
            <button
              onClick={toggleVideo}
              className={`${!callState.isVideoEnabled ? 'bg-red-600' : 'bg-gray-700'} hover:opacity-90 rounded-full p-3 transition-colors`}
              title={callState.isVideoEnabled ? 'Disable Video' : 'Enable Video'}
            >
              {callState.isVideoEnabled ? (
                <Video className="h-6 w-6 text-white" />
              ) : (
                <VideoOff className="h-6 w-6 text-white" />
              )}
            </button>

            {/* Screen Share */}
            <button
              onClick={callState.isScreenSharing ? stopScreenShare : startScreenShare}
              className={`${callState.isScreenSharing ? 'bg-green-600' : 'bg-gray-700'} hover:opacity-90 rounded-full p-3 transition-colors`}
              title={callState.isScreenSharing ? 'Stop Screen Share' : 'Start Screen Share'}
            >
              {callState.isScreenSharing ? (
                <MonitorOff className="h-6 w-6 text-white" />
              ) : (
                <Monitor className="h-6 w-6 text-white" />
              )}
            </button>

            {/* Presentation Mode */}
            <button
              onClick={togglePresentationMode}
              className={`${callState.presentationMode ? 'bg-blue-600' : 'bg-gray-700'} hover:opacity-90 rounded-full p-3 transition-colors`}
              title={callState.presentationMode ? 'Exit Presentation' : 'Enter Presentation'}
            >
              <Presentation className="h-6 w-6 text-white" />
            </button>

            {/* Pause/Resume */}
            {callState.presentationMode && (
              <button
                onClick={togglePause}
                className={`${callState.isPaused ? 'bg-yellow-600' : 'bg-gray-700'} hover:opacity-90 rounded-full p-3 transition-colors`}
                title={callState.isPaused ? 'Resume' : 'Pause'}
              >
                {callState.isPaused ? (
                  <Play className="h-6 w-6 text-white" />
                ) : (
                  <Pause className="h-6 w-6 text-white" />
                )}
              </button>
            )}

            {/* Recording */}
            {callState.isScreenSharing && (
              <button
                onClick={callState.isRecording ? stopRecording : startRecording}
                className={`${callState.isRecording ? 'bg-red-600' : 'bg-gray-700'} hover:opacity-90 rounded-full p-3 transition-colors`}
                title={callState.isRecording ? 'Stop Recording' : 'Start Recording'}
              >
                <Circle className={`h-6 w-6 text-white ${callState.isRecording ? 'fill-white' : ''}`} />
              </button>
            )}

            {/* End Call */}
            <button
              onClick={endCall}
              className="bg-red-600 hover:bg-red-700 rounded-full p-3 transition-colors"
              title="End Call"
            >
              <PhoneOff className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Slide Navigation */}
          {callState.presentationMode && callState.totalSlides > 0 && (
            <div className="absolute bottom-28 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
              <button
                onClick={previousSlide}
                disabled={callState.currentSlide === 0}
                className={`${callState.currentSlide === 0 ? 'bg-gray-600 opacity-50' : 'bg-blue-600 hover:bg-blue-700'} rounded-full p-3 transition-colors`}
                title="Previous Slide"
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
              <div className="bg-gray-800 px-4 py-2 rounded-lg text-white font-mono">
                {callState.currentSlide + 1} / {callState.totalSlides}
              </div>
              <button
                onClick={nextSlide}
                disabled={callState.currentSlide === callState.totalSlides - 1}
                className={`${callState.currentSlide === callState.totalSlides - 1 ? 'bg-gray-600 opacity-50' : 'bg-blue-600 hover:bg-blue-700'} rounded-full p-3 transition-colors`}
                title="Next Slide"
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </button>
            </div>
          )}

          {/* Annotation Tools */}
          {callState.presentationMode && callState.isScreenSharing && (
            <div className="absolute bottom-36 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg">
              <div className="text-white text-sm mr-2">Tools:</div>
              <button
                onClick={() => setAnnotationTool('pointer')}
                className={`${callState.annotationTool === 'pointer' ? 'bg-blue-600' : 'bg-gray-700'} hover:opacity-90 rounded px-3 py-1 text-white text-xs`}
              >
                Pointer
              </button>
              <button
                onClick={() => setAnnotationTool('pen')}
                className={`${callState.annotationTool === 'pen' ? 'bg-blue-600' : 'bg-gray-700'} hover:opacity-90 rounded px-3 py-1 text-white text-xs`}
              >
                ✏️ Pen
              </button>
              <button
                onClick={() => setAnnotationTool('highlighter')}
                className={`${callState.annotationTool === 'highlighter' ? 'bg-blue-600' : 'bg-gray-700'} hover:opacity-90 rounded px-3 py-1 text-white text-xs`}
              >
                🖍️ Highlight
              </button>
              <button
                onClick={() => setAnnotationTool('eraser')}
                className={`${callState.annotationTool === 'eraser' ? 'bg-blue-600' : 'bg-gray-700'} hover:opacity-90 rounded px-3 py-1 text-white text-xs`}
              >
                <Eraser className="h-3 w-3 inline" /> Eraser
              </button>
            </div>
          )}

          {/* Paused Overlay */}
          {callState.isPaused && callState.presentationMode && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-10">
              <div className="text-center text-white">
                <Pause className="h-20 w-20 mx-auto mb-4" />
                <h2 className="text-3xl font-bold">Paused</h2>
              </div>
            </div>
          )}
        </div>
      )}

      {/* AUDIO CALL - POPUP WINDOW */}
      {callState.isInCall && callState.callType === 'audio' && (
        <div className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-md flex flex-col overflow-hidden border-2 border-blue-500 relative">
          {/* Hidden audio element for audio-only calls */}
          <audio
            ref={remoteAudioRef}
            autoPlay
            playsInline
          />
          
          {/* HEADER */}
          <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-700">
            <div className="flex items-center gap-4">
              <Phone className="h-5 w-5 text-green-500" />
              <span className="text-white font-semibold">Voice Call</span>
              <span className={`text-sm ${getQualityColor()}`}>
                {getQualityIndicator()}
              </span>
            </div>
            <button
              onClick={endCall}
              className="p-2 hover:bg-red-600 rounded-full transition-colors"
              title="End Call"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* CONTENT */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center text-white">
              <div className="w-32 h-32 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Phone className="h-16 w-16 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">In Call</h2>
              <p className="text-gray-400 mb-4">Audio call active</p>
              <div className="text-3xl font-mono font-bold">
                {formatDuration(callState.callDuration)}
              </div>
            </div>
          </div>

          {/* CONTROLS */}
          <div className="bg-gray-800 px-6 py-6 flex justify-center gap-4 flex-wrap border-t border-gray-700">
            <button
              onClick={toggleMute}
              className={`${callState.isMuted ? 'bg-red-600' : 'bg-gray-700'} hover:opacity-90 rounded-full p-4 transition-colors`}
              title={callState.isMuted ? 'Unmute' : 'Mute'}
            >
              {callState.isMuted ? (
                <MicOff className="h-6 w-6 text-white" />
              ) : (
                <Mic className="h-6 w-6 text-white" />
              )}
            </button>

            <button
              onClick={endCall}
              className="bg-red-600 hover:bg-red-700 rounded-full p-4 transition-colors"
              title="End Call"
            >
              <PhoneOff className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
