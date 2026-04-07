import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { useSocket } from './SocketContext'
import { useAuth } from './AuthContext'
import { playNotificationSound } from '../utils/soundNotifications'
import toast from 'react-hot-toast'

const CallContext = createContext()

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
}

export function CallProvider({ children }) {
  const { socket, connected } = useSocket()
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

  useEffect(() => {
    if (!socket || !connected) return

    // Listen for incoming calls
    socket.on('incoming_call', (data) => {
      console.log('📞 Incoming call:', data)
      
      // Play notification sound based on call type
      const notificationType = data.call_type === 'video' ? 'video' : 'call'
      playNotificationSound(notificationType)
      
      // Also vibrate
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 200])
      }
      
      setCallState(prev => ({
        ...prev,
        incomingCall: data,
        callType: data.call_type
      }))
    })

    // Listen for call acceptance
    socket.on('call_accepted', (data) => {
      console.log('✅ Call accepted by receiver, caller can now start WebRTC')
      // When call is accepted, the caller needs to create peer connection and offer
      // This is handled in the useEffect that watches callState.isInCall
      setCallState(prev => ({
        ...prev,
        isInCall: true,
        isCalling: false
      }))
    })

    // Listen for call rejection
    socket.on('call_rejected', (data) => {
      console.log('❌ Call rejected')
      endCall()
    })

    // Listen for call end
    socket.on('call_ended', (data) => {
      console.log('🔚 Call ended')
      endCall()
    })

    // Define handlers inside useEffect to avoid stale closures
    const handleOfferReceived = async (data) => {
      console.log('📥 Received offer (receiver side)', data)
      
      // Wait for state to be ready with local stream
      const waitForReady = async () => {
        for (let i = 0; i < 20; i++) {
          const state = callStateRef.current
          if (state.isInCall && state.localStream && !state.isCaller) {
            console.log('✅ Ready to handle offer')
            return state
          }
          console.log('⏳ Waiting for local stream...', {
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
        console.log('🔧 Creating peer connection for receiver...')
        const pc = createPeerConnection(otherUserIdRef.current)
        peerConnectionRef.current = pc

        // Add local stream to peer connection
        if (readyState.localStream) {
          readyState.localStream.getTracks().forEach(track => {
            console.log('➕ Adding local track:', track.kind, track.id)
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
          
          console.log('📥 Setting remote description (offer)...')
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription({ sdp: data.sdp, type: 'offer' })
          )
          console.log('✅ Remote description set')

          console.log('📝 Creating answer...')
          const answer = await peerConnectionRef.current.createAnswer()
          await peerConnectionRef.current.setLocalDescription(answer)
          console.log('✅ Answer created and local description set')

          console.log('📤 Sending answer to caller...')
          socket.emit('answer', {
            target_id: otherUserIdRef.current,
            sdp: answer.sdp,
            type: answer.type
          })

          console.log('✅ Answer sent successfully')
        } catch (error) {
          console.error('❌ Error handling offer:', error)
          toast.error('Failed to establish connection')
        }
      }, 200)
    }

    const handleAnswerReceived = async (data) => {
      console.log('📥 Received answer')
      
      if (!peerConnectionRef.current) return

      try {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription({ sdp: data.sdp, type: 'answer' })
        )
        console.log('✅ Answer processed')
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
        console.log('🧊 Added ICE candidate')
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
      console.log('🔍 Checking if should create offer:', {
        isInCall: callState.isInCall,
        isCalling: callState.isCalling,
        hasLocalStream: !!callState.localStream,
        hasOtherUser: !!otherUserIdRef.current,
        isCaller: callState.isCaller
      })
      
      if (callState.isInCall && callState.isCalling === false && callState.localStream && otherUserIdRef.current && callState.isCaller) {
        console.log('📤 Creating offer for accepted call (caller side)')
        
        // Prevent running multiple times
        if (peerConnectionRef.current) {
          console.log('⚠️ Peer connection already exists, skipping')
          return
        }
        
        try {
          console.log('🔧 Creating peer connection for caller...')
          const pc = createPeerConnection(otherUserIdRef.current)
          peerConnectionRef.current = pc

          // Add local stream tracks
          if (callState.localStream) {
            callState.localStream.getTracks().forEach(track => {
              console.log('➕ Adding local track to caller PC:', track.kind, track.id)
              pc.addTrack(track, callState.localStream)
            })
          }

          // Wait a bit to ensure tracks are added
          await new Promise(resolve => setTimeout(resolve, 100))

          // Create and send offer
          console.log('📝 Creating offer...')
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: callState.callType === 'video'
          })
          console.log('✅ Offer created')
          
          await pc.setLocalDescription(offer)
          console.log('✅ Local description set')

          console.log('📤 Sending offer to receiver...')
          socket.emit('offer', {
            target_id: otherUserIdRef.current,
            sdp: offer.sdp,
            type: offer.type
          })

          console.log('✅ Offer sent successfully')
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
      console.log('📹 Received remote stream')
      setCallState(prev => ({
        ...prev,
        remoteStream: event.streams[0]
      }))
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket && userId) {
        console.log('🧊 Sending ICE candidate')
        socket.emit('ice_candidate', {
          target_id: userId,
          candidate: event.candidate.candidate,
          sdpMLineIndex: event.candidate.sdpMLineIndex,
          sdpMid: event.candidate.sdpMid
        })
      }
    }

    // Handle connection state
    pc.onconnectionstatechange = () => {
      console.log('🔌 Connection state:', pc.connectionState)
    }

    return pc
  }

  const startCall = async (receiverId, callType = 'audio') => {
    if (!socket) return

    try {
      console.log(`📞 Starting ${callType} call to user ${receiverId}`)
      
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('getUserMedia is not available')
        toast.error('Camera/microphone access is not supported in this browser. Please use HTTPS or localhost.')
        return
      }
      
      // Request media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === 'video',
        audio: true
      })

      // Log audio track status
      const audioTracks = stream.getAudioTracks()
      console.log(`🎤 Audio tracks obtained: ${audioTracks.length}`)
      if (audioTracks.length > 0) {
        console.log('🎤 Audio track info:', {
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
      console.log('✅ Accepting call:', callData)
      otherUserIdRef.current = callData.caller_id
      socket.emit('call_accept', { call_id: callData.call_id })

      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('getUserMedia is not available')
        toast.error('Camera/microphone access is not supported in this browser.')
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
      console.log(`🎤 Audio tracks obtained: ${audioTracks.length}`)
      if (audioTracks.length > 0) {
        console.log('🎤 Audio track info:', {
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

    console.log('❌ Rejecting call')
    
    // Stop any media that might have been started
    if (callState.localStream) {
      console.log('🛑 Stopping local stream on reject')
      callState.localStream.getTracks().forEach(track => {
        track.stop()
        console.log('✅ Stopped track on reject:', track.kind, track.label)
      })
    }
    
    // Close peer connection if exists
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }
    
    socket.emit('call_reject', { call_id: callState.incomingCall.call_id })
    setCallState(prev => ({
      ...prev,
      incomingCall: null,
      localStream: null,
      remoteStream: null,
      isCalling: false,
      isInCall: false
    }))
    
    console.log('✅ Call rejected - Media tracks stopped')
  }

  const endCall = () => {
    console.log('🔚 Ending call - Stopping all media tracks IMMEDIATELY')
    
    // Store current state before cleanup
    const currentLocalStream = callState.localStream
    const currentRemoteStream = callState.remoteStream
    const currentIsRecording = callState.isRecording
    const currentCallId = callState.incomingCall?.call_id
    
    // STEP 1: Stop call duration timer
    if (callDurationTimerRef.current) {
      console.log('🛑 Stopping call duration timer')
      clearInterval(callDurationTimerRef.current)
      callDurationTimerRef.current = null
    }
    
    // STEP 2: IMMEDIATELY stop recording first
    if (currentIsRecording) {
      console.log('🛑 Stopping recording')
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
        mediaRecorderRef.current = null
      }
      if (recordingRef.current?.timer) {
        clearInterval(recordingRef.current.timer)
        recordingRef.current.timer = null
      }
    }

    // STEP 3: IMMEDIATELY stop screen sharing
    if (screenShareRef.current) {
      console.log('🛑 Stopping screen sharing')
      screenShareRef.current.getTracks().forEach(track => {
        track.stop()
        console.log('✅ Stopped screen track:', track.kind, track.label)
      })
      screenShareRef.current = null
    }

    // STEP 4: IMMEDIATELY stop local stream (camera/microphone) - THIS IS CRITICAL
    if (currentLocalStream) {
      console.log('🛑 Stopping local stream (camera/microphone)')
      currentLocalStream.getTracks().forEach(track => {
        console.log('🛑 Stopping track:', track.kind, track.label, track.readyState)
        track.stop()  // Stop the track synchronously
        console.log('✅ Stopped local track:', track.kind, track.label, 'New state:', track.readyState)
      })
    }

    // STEP 5: IMMEDIATELY stop remote stream
    if (currentRemoteStream) {
      console.log('🛑 Stopping remote stream')
      currentRemoteStream.getTracks().forEach(track => {
        track.stop()
        console.log('✅ Stopped remote track:', track.kind)
      })
    }

    // STEP 6: Close peer connection immediately
    if (peerConnectionRef.current) {
      console.log('🛑 Closing peer connection')
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }

    // STEP 7: Notify backend
    if (socket && otherUserIdRef.current) {
      const callId = callState.incomingCall?.call_id || currentCallId
      console.log('📤 Emitting call_end to backend', { call_id: callId, other_user: otherUserIdRef.current })
      socket.emit('call_end', { 
        call_id: callId || null,
        target_id: otherUserIdRef.current
      })
    }

    // STEP 8: Reset state immediately (after stopping all tracks)
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
      // Reset presentation features
      currentSlide: 0,
      totalSlides: 0,
      slides: [],
      slideImages: [],
      // Reset annotation features
      annotationTool: 'pointer',
      isDrawing: false,
      annotations: [],
      // Reset recording features
      isRecording: false,
      recordingDuration: 0
    })

    otherUserIdRef.current = null
    
    console.log('✅ Call ended - Camera and microphone IMMEDIATELY released')
    console.log('✅ All media tracks stopped and resources cleaned up')
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

      console.log('✅ Screen sharing started')
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

    console.log('🛑 Screen sharing stopped')
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
        
        console.log('✅ Recording complete:', {
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

    console.log('🛑 Recording stopped')
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
      console.log('🧹 Cleaning up CallProvider - Stopping all tracks')
      
      // Step 1: Stop local stream (camera/microphone)
      const state = callStateRef.current
      if (state?.localStream) {
        console.log('🛑 Stopping local stream on unmount')
        state.localStream.getTracks().forEach(track => {
          track.stop()
          console.log('🛑 Stopped local track on unmount:', track.kind, track.label)
        })
      }
      
      // Step 2: Stop remote stream
      if (state?.remoteStream) {
        console.log('🛑 Stopping remote stream on unmount')
        state.remoteStream.getTracks().forEach(track => {
          track.stop()
          console.log('🛑 Stopped remote track on unmount:', track.kind)
        })
      }
      
      // Step 3: Close peer connection
      if (peerConnectionRef.current) {
        console.log('🛑 Closing peer connection on unmount')
        peerConnectionRef.current.close()
        peerConnectionRef.current = null
      }
      
      // Step 4: Stop screen sharing
      if (screenShareRef.current) {
        console.log('🛑 Stopping screen share on unmount')
        screenShareRef.current.getTracks().forEach(track => {
          track.stop()
          console.log('🛑 Stopped screen share track on unmount:', track.kind)
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
        console.log('🛑 Stopping media recorder on unmount')
        mediaRecorderRef.current.stop()
        mediaRecorderRef.current = null
      }
      
      console.log('✅ All media tracks stopped on component unmount')
    }
  }, [])  // Only run on mount/unmount

  // Provide minimal context if not ready
  if (!user || !socket) {
    return (
      <CallContext.Provider value={{
        callState,
        callHistory,
        startCall: () => {},
        acceptCall: () => {},
        rejectCall: () => {},
        endCall: () => {},
        toggleMute: () => {},
        toggleVideo: () => {},
        startScreenShare: () => {},
        stopScreenShare: () => {},
        togglePresentationMode: () => {},
        togglePause: () => {},
        startRecording: () => {},
        stopRecording: () => {},
        nextSlide: () => {},
        previousSlide: () => {},
        goToSlide: () => {},
        loadSlides: () => {},
        setAnnotationTool: () => {}
      }}>
        {children}
      </CallContext.Provider>
    )
  }

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

export function useCall() {
  const context = useContext(CallContext)
  if (!context) {
    throw new Error('useCall must be used within a CallProvider')
  }
  return context
}

