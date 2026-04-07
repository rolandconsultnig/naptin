import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext()

// Get Socket URL dynamically based on current host
export const getSocketUrl = () => {
  const hostname = window.location.hostname
  const protocol = window.location.protocol
  // Use same protocol as frontend (HTTPS)
  return `${protocol}//${hostname}:5117`
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return
    
    console.log('🔌 Creating Socket.IO connection for user:', user.username)
    const newSocket = io(getSocketUrl(), {
      withCredentials: true,
      autoConnect: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    })

    let mounted = true

    newSocket.on('connect', () => {
      if (!mounted) return
      console.log('✅ Connected to server (Socket.IO ID:', newSocket.id, ')')
      setConnected(true)
    })

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error:', error)
      if (mounted) {
        setConnected(false)
      }
    })

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from server. Reason:', reason)
      if (mounted) {
        setConnected(false)
      }
    })

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconnected after', attemptNumber, 'attempts')
      if (mounted) {
        setConnected(true)
      }
    })

    newSocket.on('reconnect_attempt', () => {
      console.log('🔄 Attempting to reconnect...')
    })

    setSocket(newSocket)

    return () => {
      console.log('🧹 Cleaning up Socket.IO connection')
      mounted = false
      newSocket.removeAllListeners()
      newSocket.disconnect()
    }
  }, [user?.id]) // Only depend on user ID to prevent recreating connection

  const sendMessage = (receiverId, content, messageType = 'text') => {
    if (!socket) {
      console.error('❌ Socket not available')
      return
    }
    
    if (!connected) {
      console.error('❌ Socket not connected')
      return
    }
    
    console.log('📤 Sending message:', { receiverId, content, messageType })
    socket.emit('send_message', {
      receiver_id: receiverId,
      content,
      message_type: messageType
    })
  }

  const joinChat = (otherUserId) => {
    if (socket && connected) {
      socket.emit('join_chat', { other_user_id: otherUserId })
    }
  }

  const startTyping = (targetId) => {
    if (socket && connected) {
      socket.emit('typing_start', { target_id: targetId })
    }
  }

  const stopTyping = (targetId) => {
    if (socket && connected) {
      socket.emit('typing_stop', { target_id: targetId })
    }
  }

  const value = {
    socket,
    connected,
    sendMessage,
    joinChat,
    startTyping,
    stopTyping
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}
