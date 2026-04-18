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
import { ensureOwlTalkSession } from './owlTalkSession'

const ChatSocketContext = createContext(null)

export function ChatSocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  /** Owl Talk DB user from /login or /me — use this id for sends/UI, not portal `chatUserId`. */
  const [owlTalkUser, setOwlTalkUser] = useState(null)
  const [sessionPrimed, setSessionPrimed] = useState(false)
  const [runtimeOffline, setRuntimeOffline] = useState(() => {
    if (!isChatEnvForcedOffline()) {
      clearChatRuntimeOffline()
    }
    return isChatForcedOffline()
  })
  const { user } = useAuth()

  // Establish Flask session cookie before Socket.IO — otherwise connect has no session and
  // send_message cannot resolve sender_id / active_users.
  useEffect(() => {
    if (!user || runtimeOffline || isChatForcedOffline()) {
      setOwlTalkUser(null)
      setSessionPrimed(true)
      return
    }

    const ac = new AbortController()
    setSessionPrimed(false)
    setOwlTalkUser(null)

    ;(async () => {
      try {
        const { ok, user: ot } = await ensureOwlTalkSession(user, { signal: ac.signal })
        if (ac.signal.aborted) return
        if (ok && ot?.id != null) setOwlTalkUser(ot)
      } catch (e) {
        if (e?.code === 'ERR_CANCELED' || e?.name === 'CanceledError') return
      } finally {
        if (!ac.signal.aborted) setSessionPrimed(true)
      }
    })()

    return () => ac.abort()
  }, [runtimeOffline, user?.email])

  useEffect(() => {
    if (!user || runtimeOffline || isChatForcedOffline() || !sessionPrimed || !owlTalkUser) {
      setSocket(null)
      setConnected(false)
      return
    }

    const url = getSocketUrl()
    const newSocket = io(url, {
      ...getSocketIoClientOptions(),
      withCredentials: true,
      autoConnect: true,
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
  }, [runtimeOffline, sessionPrimed, owlTalkUser?.id, user?.email])

  const sendMessage = (receiverId, content, messageType = 'text', replyToId = null) => {
    if (!socket || !connected) return
    const payload = {
      receiver_id: receiverId,
      content,
      message_type: messageType,
    }
    if (replyToId != null) payload.reply_to_id = replyToId
    socket.emit('send_message', payload)
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
    owlTalkUser,
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
