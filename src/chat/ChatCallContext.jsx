import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { useChatSocket } from './ChatSocketContext'
import { useAuth } from '../context/AuthContext'
import { playNotificationSound } from './soundNotifications'
import toast from 'react-hot-toast'

const CHAT_DEBUG_ENABLED =
  import.meta.env.VITE_CHAT_DEBUG === '1' || import.meta.env.VITE_CHAT_DEBUG === 'true'

const ccLog = (...args) => {
  if (CHAT_DEBUG_ENABLED) console.log(...args)
}

const CallContext = createContext()

function parseCsvEnv(raw) {
  return String(raw || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
}

function createIceServers() {
  const stunUrls = parseCsvEnv(import.meta.env.VITE_CHAT_STUN_URLS)
  const turnUrls = parseCsvEnv(import.meta.env.VITE_CHAT_TURN_URLS)
  const turnUsername = String(import.meta.env.VITE_CHAT_TURN_USERNAME || '').trim()
  const turnCredential = String(import.meta.env.VITE_CHAT_TURN_CREDENTIAL || '').trim()

  const effectiveStunUrls =
    stunUrls.length > 0
      ? stunUrls
      : ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302']

  const iceServers = effectiveStunUrls.map((url) => ({ urls: url }))

  if (turnUrls.length > 0) {
    if (!turnUsername || !turnCredential) {
      if (CHAT_DEBUG_ENABLED) {
        console.warn('[chat-call] TURN URLs provided but username/credential missing; TURN skipped.')
      }
    } else {
      iceServers.push({
        urls: turnUrls.length === 1 ? turnUrls[0] : turnUrls,
        username: turnUsername,
        credential: turnCredential,
      })
    }
  }

  return { iceServers }
}

const ICE_SERVERS = createIceServers()

function isBrowserLocalhost() {
  const h = window.location.hostname
  return h === 'localhost' || h === '127.0.0.1' || h === '[::1]'
}

function callMediaSupportCheck() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return {
      ok: false,
      reason: 'unsupported',
      message: 'Camera/microphone access is not supported in this browser.',
    }
  }

  const secure = window.isSecureContext || isBrowserLocalhost()
  if (secure) return { ok: true }

  const canRedirectToHttps = window.location.protocol === 'http:' && !isBrowserLocalhost()
  return {
    ok: false,
    reason: canRedirectToHttps ? 'needs_https_redirect' : 'insecure_context',
    message: canRedirectToHttps
      ? 'Calls need HTTPS. Redirecting to secure chat…'
      : 'Calls need a secure context (HTTPS or localhost).',
  }
}

function redirectToHttpsForCall() {
  try {
    const url = new URL(window.location.href)
    if (url.protocol === 'http:') {
      url.protocol = 'https:'
      window.location.replace(url.toString())
      return true
    }
  } catch {
    // no-op
  }
  return false
}

export function ChatCallProvider({ children }) {
  const { socket, connected } = useChatSocket()
  const { user } = useAuth()
  const peerConnectionRef = useRef(null)
  const otherUserIdRef = useRef(null)
  const callStateRef = useRef(null)
  
  const [callState, setCallState] = useState({
    isCalling: false,
    isInCall: false,
    incomingCall: null,
    callType: null,
    localStream: null,
    remoteStream: null,
    isCaller: false, // Track if this person initiated the call
    isMuted: false,
    isVideoEnabled: true,
    callQuality: 'good', // 'good', 'fair', 'poor'
    callDuration: 0,
    isScreenSharing: false,
    screenShareStream: null,
    presentationMode: false,
    isPaused: false,
    // Presentation features
    currentSlide: 0,
    totalSlides: 0,
    slides: [],
    slideImages: [],
    // Annotation features
    annotationTool: 'pointer', // pointer, pen, highlighter, eraser
    isDrawing: false,
    annotations: [],
    // Recording features
    isRecording: false,
    recordingDuration: 0
  })
  
  // Keep ref in sync with state
  useEffect(() => {
    callStateRef.current = callState
  }, [callState])
  const [callHistory, setCallHistory] = useState([])
  const callDurationTimerRef = useRef(null)
  const screenShareRef = useRef(null)
  const recordingRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  /** Avoid stale `callState` inside Socket.IO handlers (esp. call_ended / call_rejected). */
  const socketRef = useRef(null)
  const localStreamRef = useRef(null)
  const remoteStreamRef = useRef(null)
  const activeCallIdRef = useRef(null)
  const isRecordingRef = useRef(false)
  const endCallRef = useRef(() => {})

  useEffect(() => {
    socketRef.current = socket
  }, [socket])

  useEffect(() => {
    localStreamRef.current = callState.localStream
    remoteStreamRef.current = callState.remoteStream
    isRecordingRef.current = callState.isRecording
  }, [callState.localStream, callState.remoteStream, callState.isRecording])

  const endCall = useCallback(() => {
    ccLog('🔚 Ending call - Stopping all media tracks')

    const currentLocalStream = localStreamRef.current
    const currentRemoteStream = remoteStreamRef.current
    const currentIsRecording = isRecordingRef.current
    const callIdForEmit = activeCallIdRef.current
    const sock = socketRef.current

    if (callDurationTimerRef.current) {
      clearInterval(callDurationTimerRef.current)
      callDurationTimerRef.current = null
    }

    if (currentIsRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
        mediaRecorderRef.current = null
      }
      if (recordingRef.current?.timer) {
        clearInterval(recordingRef.current.timer)
        recordingRef.current.timer = null
      }
    }

    if (screenShareRef.current) {
      screenShareRef.current.getTracks().forEach((track) => track.stop())
      screenShareRef.current = null
    }

    if (currentLocalStream) {
      currentLocalStream.getTracks().forEach((track) => track.stop())
    }
    if (currentRemoteStream) {
      currentRemoteStream.getTracks().forEach((track) => track.stop())
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }

    if (sock && otherUserIdRef.current) {
      sock.emit('call_end', {
        call_id: callIdForEmit ?? null,
        target_id: otherUserIdRef.current,
      })
    }

    activeCallIdRef.current = null

    setCallState({
      isCalling: false,
      isInCall: false,
      incomingCall: null,
      callType: null,
      localStream: null,
      remoteStream: null,
      isCaller: false,
      isMuted: false,
      isVideoEnabled: true,
      callQuality: 'good',
      callDuration: 0,
      isScreenSharing: false,
      screenShareStream: null,
      presentationMode: false,
      isPaused: false,
      currentSlide: 0,
      totalSlides: 0,
      slides: [],
      slideImages: [],
      annotationTool: 'pointer',
      isDrawing: false,
      annotations: [],
      isRecording: false,
      recordingDuration: 0,
    })

    otherUserIdRef.current = null
  }, [])

  useEffect(() => {
    endCallRef.current = endCall
  }, [endCall])

  useEffect(() => {
    if (!socket || !connected) return

    // Listen for incoming calls
    socket.on('incoming_call', (data) => {
      ccLog('📞 Incoming call:', data)
      if (data?.call_id != null) activeCallIdRef.current = data.call_id

      // Play notification sound based on call type
      const notificationType = data.call_type === 'video' ? 'video' : 'call'
      playNotificationSound(notificationType)

      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 200])
      }

      setCallState((prev) => ({
        ...prev,
        incomingCall: data,
        callType: data.call_type,
      }))
    })

    socket.on('call_initiated', (data) => {
      ccLog('📞 Call initiated (caller)', data)
      if (data?.call_id != null) activeCallIdRef.current = data.call_id
    })

    // Listen for call acceptance
    socket.on('call_accepted', (data) => {
      ccLog('✅ Call accepted by receiver, caller can now start WebRTC')
      setCallState((prev) => ({
        ...prev,
        isInCall: true,
        isCalling: false,
      }))
    })

    // Listen for call rejection
    socket.on('call_rejected', (data) => {
      ccLog('❌ Call rejected')
      endCallRef.current()
    })

    // Listen for call end
    socket.on('call_ended', (data) => {
      ccLog('🔚 Call ended')
      endCallRef.current()
    })

    // Define handlers inside useEffect to avoid stale closures
    const handleOfferReceived = async (data) => {
      ccLog('📥 Received offer (receiver side)', data)
      
      // Wait for state to be ready with local stream
      const waitForReady = async () => {
        for (let i = 0; i < 20; i++) {
          const state = callStateRef.current
          if (state.isInCall && state.localStream && !state.isCaller) {
            ccLog('✅ Ready to handle offer')
            return state
          }
          ccLog('⏳ Waiting for local stream...', {
            iteration: i,
            isInCall: state.isInCall,
            hasLocalStream: !!state.localStream,
            isCaller: state.isCaller
          })
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        console.error('❌ Timeout waiting for local stream')
        return null
      }

      const readyState = await waitForReady()
      if (!readyState) {
        toast.error('Failed to establish connection - timeout')
        return
      }

      // Create peer connection if it doesn't exist
      if (!peerConnectionRef.current) {
        ccLog('🔧 Creating peer connection for receiver...')
        const pc = createPeerConnection(otherUserIdRef.current)
        peerConnectionRef.current = pc

        // Add local stream to peer connection
        if (readyState.localStream) {
          readyState.localStream.getTracks().forEach(track => {
            ccLog('➕ Adding local track:', track.kind, track.id)
            pc.addTrack(track, readyState.localStream)
          })
        }
      }

      // Handle offer
      setTimeout(async () => {
        try {
          if (!peerConnectionRef.current) {
            console.error('❌ Peer connection is null!')
            return
          }
          
          ccLog('📥 Setting remote description (offer)...')
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription({ sdp: data.sdp, type: 'offer' })
          )
          ccLog('✅ Remote description set')

          ccLog('📝 Creating answer...')
          const answer = await peerConnectionRef.current.createAnswer()
          await peerConnectionRef.current.setLocalDescription(answer)
          ccLog('✅ Answer created and local description set')

          ccLog('📤 Sending answer to caller...')
          socketRef.current?.emit('answer', {
            target_id: otherUserIdRef.current,
            sdp: answer.sdp,
            type: answer.type
          })

          ccLog('✅ Answer sent successfully')
        } catch (error) {
          console.error('❌ Error handling offer:', error)
          toast.error('Failed to establish connection')
        }
      }, 200)
    }

    const handleAnswerReceived = async (data) => {
      ccLog('📥 Received answer')
      
      if (!peerConnectionRef.current) return

      try {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription({ sdp: data.sdp, type: 'answer' })
        )
        ccLog('✅ Answer processed')
      } catch (error) {
        console.error('Error handling answer:', error)
      }
    }

    const handleIceCandidateReceived = async (data) => {
      if (!peerConnectionRef.current) return

      try {
        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate({
            candidate: data.candidate,
            sdpMLineIndex: data.sdpMLineIndex,
            sdpMid: data.sdpMid
          })
        )
        ccLog('🧊 Added ICE candidate')
      } catch (error) {
        console.error('Error adding ICE candidate:', error)
      }
    }

    // WebRTC signaling
    socket.on('offer', handleOfferReceived)
    socket.on('answer', handleAnswerReceived)
    socket.on('ice_candidate', handleIceCandidateReceived)

    return () => {
      socket.off('incoming_call')
      socket.off('call_initiated')
      socket.off('call_accepted')
      socket.off('call_rejected')
      socket.off('call_ended')
      socket.off('offer')
      socket.off('answer')
      socket.off('ice_candidate')
    }
  }, [socket, connected])

  // Create and send offer when call is accepted (ONLY for caller, not receiver)
  useEffect(() => {
    const createOfferForCall = async () => {
      ccLog('🔍 Checking if should create offer:', {
        isInCall: callState.isInCall,
        isCalling: callState.isCalling,
        hasLocalStream: !!callState.localStream,
        hasOtherUser: !!otherUserIdRef.current,
        isCaller: callState.isCaller
      })
      
      if (callState.isInCall && callState.isCalling === false && callState.localStream && otherUserIdRef.current && callState.isCaller) {
        ccLog('📤 Creating offer for accepted call (caller side)')
        
        // Prevent running multiple times
        if (peerConnectionRef.current) {
          ccLog('⚠️ Peer connection already exists, skipping')
          return
        }
        
        try {
          ccLog('🔧 Creating peer connection for caller...')
          const pc = createPeerConnection(otherUserIdRef.current)
          peerConnectionRef.current = pc

          // Add local stream tracks
          if (callState.localStream) {
            callState.localStream.getTracks().forEach(track => {
              ccLog('➕ Adding local track to caller PC:', track.kind, track.id)
              pc.addTrack(track, callState.localStream)
            })
          }

          // Wait a bit to ensure tracks are added
          await new Promise(resolve => setTimeout(resolve, 100))

          // Create and send offer
          ccLog('📝 Creating offer...')
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: callState.callType === 'video'
          })
          ccLog('✅ Offer created')
          
          await pc.setLocalDescription(offer)
          ccLog('✅ Local description set')

          ccLog('📤 Sending offer to receiver...')
          socketRef.current?.emit('offer', {
            target_id: otherUserIdRef.current,
            sdp: offer.sdp,
            type: offer.type
          })

          ccLog('✅ Offer sent successfully')
        } catch (error) {
          console.error('❌ Error creating offer:', error)
          toast.error('Failed to start call')
        }
      }
    }

    createOfferForCall()
  }, [callState.isInCall, callState.isCalling, callState.localStream, callState.isCaller, socket])

  const createPeerConnection = (userId) => {
    const pc = new RTCPeerConnection(ICE_SERVERS)

    // Handle incoming stream
    pc.ontrack = (event) => {
      ccLog('📹 Received remote stream')
      setCallState(prev => ({
        ...prev,
        remoteStream: event.streams[0]
      }))
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && userId) {
        ccLog('🧊 Sending ICE candidate')
        socketRef.current?.emit('ice_candidate', {
          target_id: userId,
          candidate: event.candidate.candidate,
          sdpMLineIndex: event.candidate.sdpMLineIndex,
          sdpMid: event.candidate.sdpMid
        })
      }
    }

    // Handle connection state
    pc.onconnectionstatechange = () => {
      ccLog('🔌 Connection state:', pc.connectionState)
      if (pc.connectionState === 'failed') {
        toast.error('Call dropped (network). You can try again.')
        endCallRef.current?.()
      }
    }

    return pc
  }

  const startCall = async (receiverId, callType = 'audio') => {
    if (!socket || !connected) {
      toast.error('Calls need Owl Talk on port 4003 and an active Socket.IO connection.')
      return
    }

    try {
      ccLog(`📞 Starting ${callType} call to user ${receiverId}`)

      const mediaCheck = callMediaSupportCheck()
      if (!mediaCheck.ok) {
        console.error('Call media check failed:', mediaCheck.reason)
        toast.error(mediaCheck.message)
        if (mediaCheck.reason === 'needs_https_redirect') {
          setTimeout(() => {
            redirectToHttpsForCall()
          }, 250)
        }
        return
      }
      
      // Request media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === 'video',
        audio: true
      })

      // Log audio track status
      const audioTracks = stream.getAudioTracks()
      ccLog(`🎤 Audio tracks obtained: ${audioTracks.length}`)
      if (audioTracks.length > 0) {
        ccLog('🎤 Audio track info:', {
          enabled: audioTracks[0].enabled,
          muted: audioTracks[0].muted,
          readyState: audioTracks[0].readyState,
          label: audioTracks[0].label
        })
      }

      setCallState(prev => ({
        ...prev,
        isCalling: true,
        callType,
        localStream: stream,
        isCaller: true, // Mark as caller
        isMuted: false,
        isVideoEnabled: callType === 'video',
        callQuality: 'good',
        callDuration: 0
      }))

      otherUserIdRef.current = receiverId

      // Initiate call via Socket.IO
      socket.emit('call_initiate', {
        receiver_id: receiverId,
        call_type: callType
      })
    } catch (error) {
      console.error('Failed to start call:', error)
      endCall()
    }
  }

  const acceptCall = async (callData) => {
    if (!socket) return

    try {
      ccLog('✅ Accepting call:', callData)
      otherUserIdRef.current = callData.caller_id
      socket.emit('call_accept', { call_id: callData.call_id })

      const mediaCheck = callMediaSupportCheck()
      if (!mediaCheck.ok) {
        console.error('Call media check failed:', mediaCheck.reason)
        toast.error(mediaCheck.message)
        if (mediaCheck.reason === 'needs_https_redirect') {
          setTimeout(() => {
            redirectToHttpsForCall()
          }, 250)
        }
        rejectCall()
        return
      }

      // Request media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: callData.call_type === 'video',
        audio: true
      })

      // Log audio track status
      const audioTracks = stream.getAudioTracks()
      ccLog(`🎤 Audio tracks obtained: ${audioTracks.length}`)
      if (audioTracks.length > 0) {
        ccLog('🎤 Audio track info:', {
          enabled: audioTracks[0].enabled,
          muted: audioTracks[0].muted,
          readyState: audioTracks[0].readyState,
          label: audioTracks[0].label
        })
      }

      setCallState(prev => ({
        ...prev,
        isInCall: true,
        isCalling: false, // Explicitly set to false for receiver
        incomingCall: null,
        callType: callData.call_type,
        localStream: stream,
        isCaller: false, // Mark as receiver
        isMuted: false,
        isVideoEnabled: callData.call_type === 'video',
        callQuality: 'good',
        callDuration: 0
      }))
    } catch (error) {
      console.error('Failed to accept call:', error)
      rejectCall()
    }
  }

  const rejectCall = () => {
    if (!socket || !callState.incomingCall) return

    ccLog('❌ Rejecting call')
    
    // Stop any media that might have been started
    if (callState.localStream) {
      ccLog('🛑 Stopping local stream on reject')
      callState.localStream.getTracks().forEach(track => {
        track.stop()
        ccLog('✅ Stopped track on reject:', track.kind, track.label)
      })
    }
    
    // Close peer connection if exists
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }
    
    socket.emit('call_reject', { call_id: callState.incomingCall.call_id })
    activeCallIdRef.current = null
    setCallState(prev => ({
      ...prev,
      incomingCall: null,
      localStream: null,
      remoteStream: null,
      isCalling: false,
      isInCall: false
    }))
    
    ccLog('✅ Call rejected - Media tracks stopped')
  }

  const toggleMute = () => {
    if (callState.localStream) {
      const audioTracks = callState.localStream.getAudioTracks()
      const isCurrentlyMuted = !audioTracks[0]?.enabled
      
      audioTracks.forEach(track => {
        track.enabled = !track.enabled
      })
      
      setCallState(prev => ({
        ...prev,
        isMuted: isCurrentlyMuted
      }))
    }
  }

  const toggleVideo = () => {
    if (callState.localStream) {
      const videoTracks = callState.localStream.getVideoTracks()
      const isCurrentlyEnabled = videoTracks[0]?.enabled
      
      videoTracks.forEach(track => {
        track.enabled = !track.enabled
      })
      
      setCallState(prev => ({
        ...prev,
        isVideoEnabled: !isCurrentlyEnabled
      }))
    }
  }

  // Track call duration
  useEffect(() => {
    if (callState.isInCall) {
      callDurationTimerRef.current = setInterval(() => {
        setCallState(prev => ({
          ...prev,
          callDuration: prev.callDuration + 1
        }))
      }, 1000)
    } else {
      if (callDurationTimerRef.current) {
        clearInterval(callDurationTimerRef.current)
        callDurationTimerRef.current = null
      }
    }

    return () => {
      if (callDurationTimerRef.current) {
        clearInterval(callDurationTimerRef.current)
      }
    }
  }, [callState.isInCall])

  // Monitor call quality
  useEffect(() => {
    if (!peerConnectionRef.current || !callState.isInCall) return

    const monitorQuality = async () => {
      try {
        const stats = await peerConnectionRef.current.getStats()
        let audioBytesReceived = 0
        let videoBytesReceived = 0
        
        stats.forEach(report => {
          if (report.type === 'inbound-rtp') {
            if (report.mediaType === 'audio') {
              audioBytesReceived = report.bytesReceived || 0
            } else if (report.mediaType === 'video') {
              videoBytesReceived = report.bytesReceived || 0
            }
          }
        })

        // Simple quality determination based on bytes received
        const hasAudio = audioBytesReceived > 0
        const hasVideo = videoBytesReceived > 0 && callState.callType === 'video'
        
        let quality = 'good'
        if (!hasAudio) {
          quality = 'poor'
        } else if (callState.callType === 'video' && !hasVideo) {
          quality = 'fair'
        }

        setCallState(prev => ({
          ...prev,
          callQuality: quality
        }))
      } catch (error) {
        console.error('Error monitoring call quality:', error)
      }
    }

    const interval = setInterval(monitorQuality, 3000)
    
    return () => clearInterval(interval)
  }, [callState.isInCall, callState.callType])

  const startScreenShare = async () => {
    try {
      // Check if getDisplayMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        console.error('getDisplayMedia is not available')
        toast.error('Screen sharing is not supported in this browser.')
        return
      }
      
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: true
      })

      screenShareRef.current = stream

      // Track screen sharing stream end
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare()
      }

      // Replace video track in peer connection
      if (peerConnectionRef.current && callState.localStream) {
        const videoTracks = stream.getVideoTracks()
        const sender = peerConnectionRef.current.getSenders().find(
          s => s.track && s.track.kind === 'video'
        )
        
        if (sender && videoTracks.length > 0) {
          sender.replaceTrack(videoTracks[0])
        }
      }

      setCallState(prev => ({
        ...prev,
        isScreenSharing: true,
        screenShareStream: stream
      }))

      ccLog('✅ Screen sharing started')
    } catch (error) {
      console.error('Failed to start screen sharing:', error)
    }
  }

  const stopScreenShare = () => {
    if (screenShareRef.current) {
      screenShareRef.current.getTracks().forEach(track => track.stop())
      screenShareRef.current = null
    }

    // Restore camera video track
    if (peerConnectionRef.current && callState.localStream) {
      const videoTracks = callState.localStream.getVideoTracks()
      const sender = peerConnectionRef.current.getSenders().find(
        s => s.track && s.track.kind === 'video'
      )
      
      if (sender && videoTracks.length > 0) {
        sender.replaceTrack(videoTracks[0])
      }
    }

    setCallState(prev => ({
      ...prev,
      isScreenSharing: false,
      screenShareStream: null
    }))

    ccLog('🛑 Screen sharing stopped')
  }

  const togglePresentationMode = () => {
    setCallState(prev => ({
      ...prev,
      presentationMode: !prev.presentationMode
    }))
  }

  const togglePause = () => {
    setCallState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }))
  }

  // Recording functions
  const startRecording = async () => {
    try {
      if (!callState.screenShareStream && !callState.localStream) {
        toast.error('No stream available to record')
        return
      }

      const stream = callState.screenShareStream || callState.localStream
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm'
      })

      const chunks = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        
        ccLog('✅ Recording complete:', {
          duration: callState.recordingDuration,
          size: blob.size
        })

        // Upload recording
        try {
          const formData = new FormData()
          formData.append('file', blob, 'recording.webm')
          formData.append('duration', callState.recordingDuration)

          toast.success('Recording uploaded successfully')
        } catch (error) {
          console.error('Failed to upload recording:', error)
          toast.error('Failed to upload recording')
        }
        
        URL.revokeObjectURL(url)
      }

      mediaRecorderRef.current = mediaRecorder
      recordingRef.current = { chunks, startTime: Date.now() }
      
      mediaRecorder.start()
      
      setCallState(prev => ({
        ...prev,
        isRecording: true,
        recordingDuration: 0
      }))

      // Recording duration timer
      const recordingTimer = setInterval(() => {
        setCallState(prev => ({
          ...prev,
          recordingDuration: Math.floor((Date.now() - recordingRef.current.startTime) / 1000)
        }))
      }, 1000)

      recordingRef.current.timer = recordingTimer

      toast.success('Recording started')
    } catch (error) {
      console.error('Failed to start recording:', error)
      toast.error('Failed to start recording')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }

    if (recordingRef.current?.timer) {
      clearInterval(recordingRef.current.timer)
    }

    setCallState(prev => ({
      ...prev,
      isRecording: false,
      recordingDuration: 0
    }))

    ccLog('🛑 Recording stopped')
  }

  // Slide navigation functions
  const nextSlide = () => {
    setCallState(prev => {
      if (prev.currentSlide < prev.totalSlides - 1) {
        return {
          ...prev,
          currentSlide: prev.currentSlide + 1
        }
      }
      return prev
    })
  }

  const previousSlide = () => {
    setCallState(prev => {
      if (prev.currentSlide > 0) {
        return {
          ...prev,
          currentSlide: prev.currentSlide - 1
        }
      }
      return prev
    })
  }

  const goToSlide = (slideNumber) => {
    setCallState(prev => ({
      ...prev,
      currentSlide: Math.max(0, Math.min(slideNumber, prev.totalSlides - 1))
    }))
  }

  const loadSlides = (slides) => {
    setCallState(prev => ({
      ...prev,
      slides: slides,
      totalSlides: slides.length,
      currentSlide: 0
    }))
  }

  const setAnnotationTool = (tool) => {
    setCallState(prev => ({
      ...prev,
      annotationTool: tool
    }))
  }

  // Cleanup effect: Ensure all tracks are stopped when component unmounts
  useEffect(() => {
    return () => {
      ccLog('🧹 Cleaning up CallProvider - Stopping all tracks')
      
      // Step 1: Stop local stream (camera/microphone)
      const state = callStateRef.current
      if (state?.localStream) {
        ccLog('🛑 Stopping local stream on unmount')
        state.localStream.getTracks().forEach(track => {
          track.stop()
          ccLog('🛑 Stopped local track on unmount:', track.kind, track.label)
        })
      }
      
      // Step 2: Stop remote stream
      if (state?.remoteStream) {
        ccLog('🛑 Stopping remote stream on unmount')
        state.remoteStream.getTracks().forEach(track => {
          track.stop()
          ccLog('🛑 Stopped remote track on unmount:', track.kind)
        })
      }
      
      // Step 3: Close peer connection
      if (peerConnectionRef.current) {
        ccLog('🛑 Closing peer connection on unmount')
        peerConnectionRef.current.close()
        peerConnectionRef.current = null
      }
      
      // Step 4: Stop screen sharing
      if (screenShareRef.current) {
        ccLog('🛑 Stopping screen share on unmount')
        screenShareRef.current.getTracks().forEach(track => {
          track.stop()
          ccLog('🛑 Stopped screen share track on unmount:', track.kind)
        })
        screenShareRef.current = null
      }
      
      // Step 5: Clear timers
      if (callDurationTimerRef.current) {
        clearInterval(callDurationTimerRef.current)
        callDurationTimerRef.current = null
      }
      
      if (recordingRef.current?.timer) {
        clearInterval(recordingRef.current.timer)
        recordingRef.current.timer = null
      }
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        ccLog('🛑 Stopping media recorder on unmount')
        mediaRecorderRef.current.stop()
        mediaRecorderRef.current = null
      }
      
      ccLog('✅ All media tracks stopped on component unmount')
    }
  }, [])  // Only run on mount/unmount

  const value = {
    callState,
    callHistory,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    togglePresentationMode,
    togglePause,
    startRecording,
    stopRecording,
    nextSlide,
    previousSlide,
    goToSlide,
    loadSlides,
    setAnnotationTool
  }

  return (
    <CallContext.Provider value={value}>
      {children}
    </CallContext.Provider>
  )
}

export function useChatCall() {
  const context = useContext(CallContext)
  if (!context) {
    throw new Error('useChatCall must be used within ChatCallProvider')
  }
  return context
}

