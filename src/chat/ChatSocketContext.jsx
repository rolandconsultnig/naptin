import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'
import {
  clearChatRuntimeOffline,
  getSocketIoClientOptions,
  getSocketUrl,
  isChatEnvForcedOffline,
  isChatForcedOffline,
} from './chatConfig'

const ChatSocketContext = createContext(null)

export function ChatSocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [runtimeOffline, setRuntimeOffline] = useState(() => {
    if (!isChatEnvForcedOffline()) {
      clearChatRuntimeOffline()
    }
    return isChatForcedOffline()
  })
  const { user } = useAuth()

  useEffect(() => {
    if (!user || runtimeOffline || isChatForcedOffline()) {
      setSocket(null)
      setConnected(false)
      return
    }

    const url = getSocketUrl()
    const newSocket = io(url, {
      ...getSocketIoClientOptions(),
      withCredentials: true,
      autoConnect: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    })

    let mounted = true

    newSocket.on('connect', () => {
      if (!mounted) return
      setConnected(true)
      clearChatRuntimeOffline()
      setRuntimeOffline(false)
    })
    newSocket.on('connect_error', () => {
      if (!mounted) return
      setConnected(false)
      // Keep socket.io reconnecting; do not flip to session offline (that killed chat + notifications).
    })
    newSocket.on('disconnect', () => {
      if (mounted) setConnected(false)
    })
    newSocket.on('reconnect', () => {
      if (mounted) setConnected(true)
    })

    setSocket(newSocket)

    return () => {
      mounted = false
      newSocket.removeAllListeners()
      newSocket.disconnect()
    }
  }, [runtimeOffline, user?.email, user?.chatUserId])

  const sendMessage = (receiverId, content, messageType = 'text') => {
    if (!socket || !connected) return
    socket.emit('send_message', {
      receiver_id: receiverId,
      content,
      message_type: messageType,
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
    stopTyping,
  }

  return <ChatSocketContext.Provider value={value}>{children}</ChatSocketContext.Provider>
}

export function useChatSocket() {
  const ctx = useContext(ChatSocketContext)
  if (!ctx) {
    throw new Error('useChatSocket must be used within ChatSocketProvider')
  }
  return ctx
}
