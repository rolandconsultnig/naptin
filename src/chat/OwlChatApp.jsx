import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import {
  getApiBase,
  hasChatBackend,
  isChatEnvForcedOffline,
  isChatForcedOffline,
} from './chatConfig'
import { ensureOwlTalkSession } from './owlTalkSession'
import { useChatSocket } from './ChatSocketContext'
import { useChatCall } from './ChatCallContext'
import { Search, MoreVertical, Smile, Paperclip, Send, Phone, Video, MessageCircle, Shield, Edit2, Trash2, Check, CheckCheck, Reply, Forward, Mic, Star, Archive, X, Play, Users, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import axios from 'axios'
import { notify } from './soundNotifications'
import { GroupModal } from './GroupModal'
import { ProfileEditModal } from './ProfileEditModal'
import { MeetingModal } from './MeetingModal'
import MediaGallery from './MediaGallery'
import { STAFF } from '../data/mock'

function staffToChatUserId(raw) {
  let h = 0
  for (let i = 0; i < raw.length; i++) h = (Math.imul(31, h) + raw.charCodeAt(i)) | 0
  return Math.abs(h) % 900000 + 1000
}

function sameChatUser(a, b) {
  if (a === b) return true
  return Number(a) === Number(b)
}

export function OwlChatApp() {
  const { user, logout } = useAuth()
  const { addNotification } = useNotifications()
  const { socket, connected, owlTalkUser, sendMessage, joinChat, startTyping, stopTyping } = useChatSocket()
  const { startCall } = useChatCall()
  const owlUser = useMemo(
    () => ({
      id: owlTalkUser?.id ?? user?.chatUserId ?? 1,
      username: owlTalkUser?.username || user?.name || user?.email || 'User',
      email: owlTalkUser?.email || user?.email,
      profile_picture: owlTalkUser?.profile_picture || user?.profile_picture,
      is_admin: user?.roleKey === 'director' || user?.roleKey === 'ict_admin',
    }),
    [user, owlTalkUser]
  )
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [selectedChat, setSelectedChat] = useState(null)
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState({})
  const [editingMessageId, setEditingMessageId] = useState(null)
  const [showMessageSearch, setShowMessageSearch] = useState(false)
  const [messageSearchTerm, setMessageSearchTerm] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [messageStatus, setMessageStatus] = useState({}) // Track message delivery/read status
  const [typingTimeout, setTypingTimeout] = useState(null)
  const [replyingTo, setReplyingTo] = useState(null) // Message being replied to
  const [forwardingFrom, setForwardingFrom] = useState(null) // Message being forwarded
  const [archivedChats, setArchivedChats] = useState([]) // Archived chat IDs
  const [starredMessages, setStarredMessages] = useState({}) // Starred message IDs
  const [isRecording, setIsRecording] = useState(false)
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [showMeetingModal, setShowMeetingModal] = useState(false)
  const [showMediaGallery, setShowMediaGallery] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [selectedUserInfo, setSelectedUserInfo] = useState(null)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [currentUserInfo, setCurrentUserInfo] = useState(null)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const mediaRecorderRef = useRef(null)

  const buildStaffChatList = () =>
    STAFF.filter((s) => s.email !== user?.email).map((s) => ({
      id: staffToChatUserId(s.id),
      username: s.name,
      status: 'offline',
      lastMessage: 'NAPTIN directory',
      time: '',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=006838&color=fff`,
    }))

  const usersLoadWarnedRef = useRef(false)

  // Load users: try live API (production :4003; dev may use Vite proxy), else fall back to STAFF
  useEffect(() => {
    if (!user) return

    if (isChatForcedOffline()) {
      setUsers(buildStaffChatList())
      return
    }

    const myChatId = owlTalkUser?.id ?? user?.chatUserId ?? 1

    const loadUsers = async () => {
      await ensureOwlTalkSession(user)
      try {
        const response = await axios.get(`${getApiBase()}/users`, {
          withCredentials: true,
        })

        const raw = Array.isArray(response.data) ? response.data : []
        const usersList = raw
          .map((u) => ({
            id: u.id,
            username: u.username,
            status: u.status || 'offline',
            lastMessage: 'No messages yet',
            time: new Date(u.last_seen || u.created_at).toLocaleTimeString(),
            avatar: u.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username)}&background=random`,
          }))
          .filter((u) => !sameChatUser(u.id, myChatId))

        if (usersList.length === 0) {
          setUsers(buildStaffChatList())
          toast('Chat server returned no contacts — showing NAPTIN directory preview.', { icon: '👥' })
          return
        }
        usersLoadWarnedRef.current = false
        setUsers(usersList)
      } catch (error) {
        setUsers(buildStaffChatList())
        if (!usersLoadWarnedRef.current) {
          usersLoadWarnedRef.current = true
          console.warn(
            'Chat user list: server unavailable — using directory preview. Start Owl Talk (dev/main.py on :4003), open firewall TCP 4003, and ensure PM2 app naptin-chat is running. Dev: Vite proxies /proxy-chat-api → 127.0.0.1:4003.',
            error?.message || error
          )
          toast.error(
            'Cannot reach chat server (port 4003). On the server: create dev/venv, pip install -r dev/requirements.txt, pm2 restart naptin-chat, open port 4003. Using directory preview.',
            { id: 'chat-users-fallback' }
          )
        }
      }
    }

    loadUsers()
  }, [user?.email, user?.chatUserId, owlTalkUser?.id])

  // Socket.IO event handlers
  useEffect(() => {
    if (!socket) return

    socket.on('receive_message', (message) => {
      console.log('📩 Received message:', message)
      setMessages((prev) => {
        const exists = prev.some(m => m.id === message.id)
        if (exists) return prev
        return [...prev, message]
      })
      
      // Initialize status for new messages - they start as unread
      setMessageStatus(prev => ({
        ...prev,
        [message.id]: { delivered: false, read: false }
      }))
      
      // Only show notification if message is not from current chat
      if (!selectedChat || !sameChatUser(selectedChat.id, message.sender_id)) {
        // Play notification sound
        notify('message')
        
        toast.success(`New message from ${message.sender_username}`, {
          duration: 3000,
          icon: '📩'
        })
        addNotification({
          title: `New message from ${message.sender_username}`,
          sub: message.content ? message.content.slice(0, 80) : 'New message',
          type: 'info',
          link: '/app/chat',
          module: 'Chat',
        })
      }
    })
    
    socket.on('message_sent', (message) => {
      console.log('✅ Message confirmed sent:', message)
      setMessages((prev) => {
        // Replace temporary messages (those with timestamp IDs) with the real message
        const updatedMessages = prev.map(m => 
          m.id === message.id ? message : m
        )
        // If message not found, try to find and replace a temporary message
        const hasMessage = updatedMessages.some(m => m.id === message.id)
        if (!hasMessage && prev.length > 0) {
          // Find the most recent temporary message that matches content
          for (let i = prev.length - 1; i >= 0; i--) {
            const m = prev[i]
            if (m.id >= 1000000000000 && m.content === message.content && sameChatUser(m.sender_id, owlUser.id)) {
              updatedMessages[i] = message
              return updatedMessages
            }
          }
          // If no match found, just add the message
          updatedMessages.push(message)
        }
        return updatedMessages
      })
      
      // Update status to sent
      setMessageStatus(prev => ({
        ...prev,
        [message.id]: { delivered: false, read: false }
      }))
      toast.success('Message sent ✓')
    })

    socket.on('message_delivered', (data) => {
      console.log('📬 Message delivered:', data)
      const messageId = data.message_id || data.id
      setMessageStatus(prev => ({
        ...prev,
        [messageId]: { delivered: true, read: false }
      }))
    })

    socket.on('message_read', (data) => {
      console.log('👁️ Message read:', data)
      const messageId = data.message_id || data.id
      setMessageStatus(prev => ({
        ...prev,
        [messageId]: { delivered: true, read: true }
      }))
    })

    socket.on('user_status_update', (data) => {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === data.user_id ? { ...u, status: data.status } : u
        )
      )
    })

    socket.on('user_typing', (data) => {
      // Track typing status for all users
      setTypingUsers(prev => ({
        ...prev,
        [data.user_id]: data.is_typing
      }))
      
      // Show typing indicator for current chat
      if (selectedChat && sameChatUser(data.user_id, selectedChat.id)) {
        setIsTyping(data.is_typing)
      }
    })

    return () => {
      socket.off('receive_message')
      socket.off('message_sent')
      socket.off('message_delivered')
      socket.off('message_read')
      socket.off('user_status_update')
      socket.off('user_typing')
    }
  }, [socket, selectedChat, addNotification, owlUser.id])

  useEffect(() => {
    if (connected && selectedChat && !isChatForcedOffline()) {
      joinChat(selectedChat.id)
    }
  }, [connected, selectedChat?.id, joinChat])

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showEmojiPicker && !event.target.closest('.emoji-picker-container')) {
        setShowEmojiPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showEmojiPicker])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!selectedChat) {
      toast.error('Select a contact in the sidebar to start a conversation.')
      return
    }
    if (!newMessage.trim()) return

    const messageContent = newMessage.trim()

    // If editing, update the message (only if it's a real database ID, not a temporary one)
      if (editingMessageId && editingMessageId < 1000000000000) {
        const messageExists = messages.some((m) => m.id === editingMessageId)
        if (messageExists) {
          if (isChatForcedOffline()) {
            setMessages((prev) =>
              prev.map((m) => (m.id === editingMessageId ? { ...m, content: messageContent } : m))
            )
            setEditingMessageId(null)
            setNewMessage('')
            toast.success('Message updated')
            return
          }
          try {
            await axios.put(
              `${getApiBase()}/messages/${editingMessageId}`,
              { content: messageContent },
              { withCredentials: true }
            )

            setMessages((prev) =>
              prev.map((m) => (m.id === editingMessageId ? { ...m, content: messageContent } : m))
            )
            setEditingMessageId(null)
            setNewMessage('')
            toast.success('Message updated')
            return
          } catch (error) {
            console.error('Failed to update message:', error)
            toast.error('Failed to update message')
          }
        }
      }
      
      // Clear editing state if we're sending a new message
      if (editingMessageId) {
        setEditingMessageId(null)
      }
      
      // Add message to UI immediately (optimistic update)
      const tempMessage = {
        id: Date.now(), // Temporary ID
        sender_id: owlUser.id,
        receiver_id: selectedChat.id,
        content: messageContent,
        message_type: 'text',
        timestamp: new Date().toISOString(),
        is_read: false
      }
      
      setMessages((prev) => [...prev, tempMessage])
      setNewMessage('')
      stopTyping(selectedChat.id)

      if (isChatForcedOffline()) {
        setMessageStatus((prev) => ({
          ...prev,
          [tempMessage.id]: { delivered: true, read: true },
        }))
        toast.success('Sent (this tab only)')
        return
      }

      if (!connected || !socket) {
        setMessageStatus((prev) => ({
          ...prev,
          [tempMessage.id]: { delivered: true, read: true },
        }))
        toast('Not connected to chat server — message kept in this tab only.', {
          icon: '⚠️',
          duration: 4500,
        })
        return
      }

    sendMessage(selectedChat.id, messageContent)
  }
  
  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return

    if (isChatForcedOffline() || !connected) {
      setMessages((prev) => prev.filter((m) => m.id !== messageId))
      toast.success('Message deleted')
      return
    }

    try {
      await axios.delete(`${getApiBase()}/messages/${messageId}`, {
        withCredentials: true,
      })

      setMessages((prev) => prev.filter((m) => m.id !== messageId))
      toast.success('Message deleted')
    } catch (error) {
      console.error('Failed to delete message:', error)
      setMessages((prev) => prev.filter((m) => m.id !== messageId))
      toast.error('Server delete failed — removed locally.')
    }
  }
  
  const handleEditMessage = (messageId, currentContent) => {
    setEditingMessageId(messageId)
    setNewMessage(currentContent)
  }

  const handleReplyMessage = (message) => {
    setReplyingTo(message)
    toast.success('Reply mode enabled')
  }

  const handleForwardMessage = (message) => {
    setForwardingFrom(message)
    toast('Select a chat to forward', { icon: '↪️' })
  }

  const handleArchiveChat = async (chatId) => {
    setArchivedChats(prev => [...prev, chatId])
    toast.success('Chat archived')
  }

  const handleStarMessage = (messageId) => {
    setStarredMessages(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }))
    toast.success('Message ' + (starredMessages[messageId] ? 'unstarred' : 'starred'))
  }

  const handleDeleteForEveryone = async (messageId) => {
    if (isChatForcedOffline() || !connected) {
      setMessages((prev) => prev.filter((m) => m.id !== messageId))
      toast.success('Message removed (this tab only)')
      return
    }
    try {
      await axios.delete(`${getApiBase()}/messages/${messageId}/delete-everyone`, {
        withCredentials: true,
      })
      setMessages((prev) => prev.filter((m) => m.id !== messageId))
      toast.success('Message deleted for everyone')
    } catch (error) {
      setMessages((prev) => prev.filter((m) => m.id !== messageId))
      toast.error('Server failed — removed locally.')
    }
  }

  const startVoiceRecording = async () => {
    try {
      if (!selectedChat) {
        toast.error('Please select a chat first')
        return
      }
      
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error('Microphone access is not supported in this browser. Please use HTTPS or localhost.')
        console.error('getUserMedia is not available')
        return
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      
      const chunks = []
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })

        if (isChatForcedOffline() || !connected) {
          toast.error('Voice messages need the chat server running and connected (Owl Talk on port 4003).')
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        try {
          // Create FormData for upload
          const formData = new FormData()
          formData.append('file', blob, 'voice-message.webm')
          
          // Upload voice message
          const uploadResponse = await axios.post(`${getApiBase()}/upload`, formData, {
            withCredentials: true,
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          
          const audioUrl = uploadResponse.data.file_path
          
          // Send as message
          if (socket && connected && selectedChat) {
            sendMessage(selectedChat.id, audioUrl, 'audio')
          }
          
          toast.success('Voice message sent')
        } catch (error) {
          console.error('Failed to upload voice message:', error)
          toast.error('Failed to send voice message')
        }
        
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorderRef.current = { recorder: mediaRecorder, stream, chunks }
      mediaRecorder.start()
      setIsRecording(true)
      
      // Auto stop after 60 seconds max
      setTimeout(() => {
        if (mediaRecorderRef.current?.recorder && mediaRecorderRef.current.recorder.state === 'recording') {
          stopVoiceRecording()
        }
      }, 60000)
      
      toast.success('Recording started')
    } catch (error) {
      console.error('Recording error:', error)
      toast.error('Failed to start recording. Please allow microphone access.')
    }
  }

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current?.recorder && mediaRecorderRef.current.recorder.state === 'recording') {
      mediaRecorderRef.current.recorder.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
      mediaRecorderRef.current = null
    }
  }

  const handleChatSelect = async (chatUser) => {
    setSelectedChat(chatUser)
    setMessages([])
    joinChat(chatUser.id)

    if (isChatForcedOffline()) {
      const offlineNotice = isChatEnvForcedOffline()
        ? 'Offline mode — messages stay in this browser only until you reconnect.'
        : 'Chat server is unavailable — messages stay in this browser only until you reconnect.'

      setMessages([
        {
          id: 1,
          sender_id: chatUser.id,
          receiver_id: owlUser.id,
          content: `Hi ${owlUser.username}. ${offlineNotice}`,
          message_type: 'text',
          timestamp: new Date().toISOString(),
          is_read: true,
        },
      ])
      return
    }

    try {
      const response = await axios.get(`${getApiBase()}/messages/${chatUser.id}`, {
        withCredentials: true,
      })
      
      const loadedMessages = response.data.map(msg => ({
        id: msg.id,
        sender_id: msg.sender_id,
        receiver_id: msg.receiver_id,
        content: msg.content,
        message_type: msg.message_type || 'text',
        timestamp: msg.timestamp,
        is_read: msg.is_read
      }))
      
      setMessages(loadedMessages)

      // Initialize status for all loaded messages
      const statuses = {}
      loadedMessages.forEach(msg => {
        statuses[msg.id] = {
          delivered: true, // Messages from database are already delivered
          read: msg.is_read
        }
      })
      setMessageStatus(prev => ({ ...prev, ...statuses }))

      // Mark unread messages as read
      const unreadMessages = loadedMessages.filter(
        (m) => sameChatUser(m.receiver_id, owlUser.id) && !m.is_read
      )
      
      for (const msg of unreadMessages) {
        try {
          await axios.post(`${getApiBase()}/messages/${msg.id}/read`, {}, {
            withCredentials: true
          })
          
          // Also emit socket event for read receipt
          if (socket && connected) {
            socket.emit('message_read_receipt', { message_id: msg.id })
          }
        } catch (err) {
          console.error('Failed to mark message as read:', err)
        }
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
      toast.error('Could not load history from server — you can still message here.')
      setMessages([
        {
          id: 1,
          sender_id: chatUser.id,
          receiver_id: owlUser.id,
          content: `Chat with ${chatUser.username}. Server history is unavailable; new messages work in this tab when the server is offline.`,
          message_type: 'text',
          timestamp: new Date().toISOString(),
          is_read: true,
        },
      ])
    }
  }

  const handleShowProfile = async () => {
    if (!selectedChat) return

    if (isChatForcedOffline()) {
      setSelectedUserInfo({
        username: selectedChat.username,
        email: `${selectedChat.username.replace(/\s+/g, '.').toLowerCase()}@naptin.gov.ng`,
        bio: 'Offline profile preview',
        profile_picture: selectedChat.avatar,
        last_seen: null,
        is_admin: false,
      })
      setShowProfile(true)
      return
    }

    try {
      const response = await axios.get(`${getApiBase()}/users/${selectedChat.id}`, {
        withCredentials: true,
      })
      setSelectedUserInfo(response.data)
      setShowProfile(true)
    } catch (error) {
      console.error('Failed to load user info:', error)
      setSelectedUserInfo({
        username: selectedChat.username,
        email: `${selectedChat.username.replace(/\s+/g, '.').toLowerCase()}@naptin.gov.ng`,
        bio: 'Profile preview (server unavailable)',
        profile_picture: selectedChat.avatar,
        last_seen: null,
        is_admin: false,
      })
      setShowProfile(true)
    }
  }

  const handleEditProfile = async () => {
    if (isChatForcedOffline()) {
      setCurrentUserInfo({
        username: owlUser.username,
        email: owlUser.email,
        bio: user?.department ? `Department: ${user.department}` : '',
        profile_picture: owlUser.profile_picture,
      })
      setShowEditProfile(true)
      return
    }
    try {
      const response = await axios.get(`${getApiBase()}/me`, {
        withCredentials: true,
      })
      setCurrentUserInfo(response.data.user)
      setShowEditProfile(true)
    } catch (error) {
      console.error('Failed to load profile:', error)
      setCurrentUserInfo({
        username: owlUser.username,
        email: owlUser.email,
        bio: user?.department ? `Department: ${user.department}` : '',
        profile_picture: owlUser.profile_picture,
      })
      setShowEditProfile(true)
    }
  }

  const handleProfileUpdate = (updatedUser) => {
    // Update the user in context/auth if needed
    setCurrentUserInfo(updatedUser)
    toast.success('Profile updated!')
  }

  const handleTyping = (e) => {
    setNewMessage(e.target.value)
    if (selectedChat) {
      if (e.target.value.length > 0) {
        startTyping(selectedChat.id)
        
        // Clear existing timeout
        if (typingTimeout) {
          clearTimeout(typingTimeout)
        }
        
        // Set new timeout to stop typing after 2 seconds of inactivity
        const timeout = setTimeout(() => {
          stopTyping(selectedChat.id)
        }, 2000)
        
        setTypingTimeout(timeout)
      } else {
        // Clear timeout and stop typing
        if (typingTimeout) {
          clearTimeout(typingTimeout)
          setTypingTimeout(null)
        }
        stopTyping(selectedChat.id)
      }
    }
  }
  
  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout)
      }
    }
  }, [typingTimeout])

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Common emojis
  const commonEmojis = ['😀', '😂', '😍', '😎', '😢', '😡', '👍', '👎', '❤️', '💯', '🔥', '✨', '🎉', '🙏', '🤔', '👏', '💪', '🎈', '⭐', '🌈']

  const handleEmojiClick = (emoji) => {
    setNewMessage(prev => prev + emoji)
    setShowEmojiPicker(false)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (isChatForcedOffline()) {
      toast.error('File upload needs the chat server. Turn off offline mode or try again when the chat service is running.')
      e.target.value = ''
      return
    }

    try {
      // Create FormData to upload file
      const formData = new FormData()
      formData.append('file', file)

      // Upload file to server
      const response = await axios.post(`${getApiBase()}/upload`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      const fileUrl = response.data.file_path
      const fileName = response.data.file_name
      const fileSize = response.data.file_size

      // Determine message type based on file extension
      const isImage = file.type.startsWith('image/')
      const messageType = isImage ? 'image' : 'file'

      if (isImage) {
        // For images, send as content with URL
        setNewMessage(`${newMessage} ${getApiBase().replace('/api', '')}${fileUrl}`)
        toast.success('Image attached!')
      } else {
        // For files, just send the filename
        setNewMessage(`${newMessage} [${fileName} (${(fileSize / 1024).toFixed(2)} KB)]`)
        toast.success('File attached!')
      }
    } catch (error) {
      console.error('File upload failed:', error)
      toast.error('File upload failed')
    }

    // Reset file input
    e.target.value = ''
  }

  return (
      <div className="flex h-full min-h-0 bg-[#e9edef]">
      {/* Socket.IO Connection Status */}
      {hasChatBackend() && !connected && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 text-sm z-50">
          ⚠️ Connecting to server... Please wait
        </div>
      )}
      
      {/* Sidebar - WhatsApp Style */}
      <div className="whatsapp-sidebar bg-white flex flex-col">
        {/* Sidebar Header */}
        <div className="bg-[#008069] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={handleEditProfile}>
            <img 
              src={owlUser?.profile_picture || "/logo.png"} 
              alt="Profile" 
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(owlUser?.username)}&background=00a884&color=fff`
              }}
            />
            <div>
              <span className="text-white font-medium">{owlUser?.username}</span>
              {connected && (
                <div className="flex items-center space-x-1 mt-0.5">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-white/70">online</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Paperclip 
              className="h-5 w-5 text-white cursor-pointer hover:opacity-80" 
              onClick={() => setShowMediaGallery(true)}
              title="Media Gallery"
            />
            <Video 
              className="h-5 w-5 text-white cursor-pointer hover:opacity-80" 
              onClick={() => setShowMeetingModal(true)}
              title="Create Meeting (Zoom-like)"
            />
            {owlUser?.is_admin && (
              <Shield 
                className="h-5 w-5 text-white cursor-pointer hover:opacity-80" 
                onClick={() => navigate('/admin')}
                title="Admin Dashboard"
              />
            )}
            <Users 
              className="h-5 w-5 text-white cursor-pointer hover:opacity-80" 
              onClick={() => setShowGroupModal(true)}
              title="Create Group"
            />
            <Edit2 
              className="h-5 w-5 text-white cursor-pointer hover:opacity-80" 
              onClick={handleEditProfile}
              title="Edit Profile"
            />
            <Settings 
              className="h-5 w-5 text-white cursor-pointer hover:opacity-80" 
              onClick={() => setShowSettings(true)}
              title="Settings"
            />
            <Search className="h-5 w-5 text-white cursor-pointer hover:opacity-80" />
            <MoreVertical className="h-5 w-5 text-white cursor-pointer hover:opacity-80" onClick={logout} />
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3 bg-white">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search or start new chat"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2 bg-[#f0f2f5] rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00a884]"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredUsers.map((u) => (
            <div
              key={u.id}
              onClick={() => handleChatSelect(u)}
              className={`chat-item ${selectedChat?.id === u.id ? 'chat-item-active' : ''}`}
            >
              <img
                src={u.avatar || `https://ui-avatars.com/api/?name=${u.username}&background=00a884`}
                alt={u.username}
                className="w-12 h-12 rounded-full flex-shrink-0"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${u.username}&background=00a884`
                }}
              />
              <div className="ml-3 flex-1 min-w-0 relative">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 truncate">{u.username}</h3>
                  <span className="text-xs text-gray-500 ml-2">{u.time}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-gray-600 truncate">
                    {typingUsers[u.id] ? (
                      <span className="text-blue-600 italic">typing...</span>
                    ) : (
                      u.lastMessage
                    )}
                  </p>
                </div>
              </div>
              {/* Online status indicator */}
              {u.status === 'online' && (
                <div className="absolute bottom-3 left-10 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window - WhatsApp Style */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-[#008069] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3 cursor-pointer" onClick={handleShowProfile}>
                <div className="relative">
                  <img
                    src={selectedChat.avatar || `https://ui-avatars.com/api/?name=${selectedChat.username}&background=008069`}
                    alt={selectedChat.username}
                    className="w-10 h-10 rounded-full"
                  />
                  {/* Online status indicator */}
                  {selectedChat.status === 'online' && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <h3 className="text-white font-medium">{selectedChat.username}</h3>
                  <p className="text-xs text-white/80">
                    {isTyping ? (
                      <span className="italic">typing...</span>
                    ) : selectedChat.status === 'online' ? (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        online
                      </span>
                    ) : selectedChat.status === 'away' ? (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                        away
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                        offline
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Search 
                  className="h-6 w-6 text-white cursor-pointer hover:opacity-80"
                  onClick={() => setShowMessageSearch(!showMessageSearch)}
                  title="Search messages"
                />
                <Video 
                  className="h-6 w-6 text-white cursor-pointer hover:opacity-80" 
                  onClick={() => startCall(selectedChat.id, 'video')}
                  title="Start video call"
                />
                <Phone 
                  className="h-6 w-6 text-white cursor-pointer hover:opacity-80"
                  onClick={() => startCall(selectedChat.id, 'audio')}
                  title="Start voice call"
                />
                <MoreVertical className="h-6 w-6 text-white cursor-pointer hover:opacity-80" />
              </div>
            </div>
            
            {/* Message Search Bar */}
            {showMessageSearch && (
              <div className="px-4 py-2 bg-gray-50 border-b">
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={messageSearchTerm}
                  onChange={(e) => setMessageSearchTerm(e.target.value)}
                  className="w-full px-3 py-1 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008069]"
                  autoFocus
                />
              </div>
            )}

            {/* Messages */}
            <div className="whatsapp-chat-bg flex-1 overflow-y-auto p-4">
              {(messageSearchTerm ? messages.filter(m => 
                m.content?.toLowerCase().includes(messageSearchTerm.toLowerCase())
              ) : messages).map((msg, index) => (
                <div
                  key={msg.id || index}
                  className={`flex ${sameChatUser(msg.sender_id, owlUser.id) ? 'justify-end' : 'justify-start'} mb-2 group`}
                >
                  <div className={`relative ${
                    sameChatUser(msg.sender_id, owlUser.id) ? 'message-sent' : 'message-received'
                  }`}>
                    {/* Check if content is an image URL */}
                    {msg.content && msg.content.startsWith('http') && /\.(jpg|jpeg|png|gif|webp)/i.test(msg.content) ? (
                      <img 
                        src={msg.content} 
                        alt="Shared image" 
                        className="max-w-xs rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'block'
                        }}
                      />
                    ) : null}
                    
                    {/* Check if content is an audio file */}
                    {msg.message_type === 'audio' && msg.content && msg.content.startsWith('http') ? (
                      <div className="bg-white p-3 rounded-lg flex items-center gap-2">
                        <Play className="h-5 w-5 text-blue-600" />
                        <audio src={msg.content} controls className="flex-1" />
                      </div>
                    ) : null}
                    
                    <p className="text-sm whitespace-pre-wrap break-words" style={{
                      display: (msg.content && msg.content.startsWith('http') && /\.(jpg|jpeg|png|gif|webp)/i.test(msg.content)) || msg.message_type === 'audio' ? 'none' : 'block'
                    }}>{msg.content}</p>
                    <div className="flex items-center justify-end gap-2 mt-1">
                      <span className="text-xs">
                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      {sameChatUser(msg.sender_id, owlUser.id) && (() => {
                        const status = messageStatus[msg.id] || { delivered: false, read: false }
                        const isRead = status.read
                        const isDelivered = status.delivered
                        
                        if (isRead) {
                          // Double blue checks (read)
                          return (
                            <div className="flex items-center">
                              <CheckCheck className="h-3 w-3 text-blue-500" />
                            </div>
                          )
                        } else if (isDelivered) {
                          // Double grey checks (delivered)
                          return (
                            <div className="flex items-center">
                              <CheckCheck className="h-3 w-3 text-gray-500" />
                            </div>
                          )
                        } else {
                          // Single grey check (sent)
                          return (
                            <div className="flex items-center">
                              <Check className="h-3 w-3 text-gray-500" />
                            </div>
                          )
                        }
                      })()}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleReplyMessage(msg)}
                          className="text-gray-500 hover:text-green-600"
                          title="Reply"
                        >
                          <Reply className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleForwardMessage(msg)}
                          className="text-gray-500 hover:text-blue-600"
                          title="Forward"
                        >
                          <Forward className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleStarMessage(msg.id)}
                          className={`hover:text-yellow-600 ${starredMessages[msg.id] ? 'text-yellow-500' : 'text-gray-500'}`}
                          title="Star"
                        >
                          <Star className="h-3 w-3" fill={starredMessages[msg.id] ? 'currentColor' : 'none'} />
                        </button>
                        {sameChatUser(msg.sender_id, owlUser.id) && (
                          <>
                            <button
                              onClick={() => handleEditMessage(msg.id, msg.content)}
                              className="text-gray-500 hover:text-blue-600"
                              title="Edit"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="text-gray-500 hover:text-orange-600"
                              title="Delete for me"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteForEveryone(msg.id)}
                              className="text-gray-500 hover:text-red-600"
                              title="Delete for everyone"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-[#f0f2f5] px-4 py-3 flex flex-col space-y-2 relative">
              {/* Reply Preview */}
              {replyingTo && (
                <div className="bg-white px-3 py-2 rounded-lg border-l-4 border-green-500 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-green-600 font-medium">Replying to message</p>
                    <p className="text-sm text-gray-700 truncate">{replyingTo.content}</p>
                  </div>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {editingMessageId && (
                <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center justify-between">
                  <span>Editing message...</span>
                  <button
                    onClick={() => {
                      setEditingMessageId(null)
                      setNewMessage('')
                    }}
                    className="ml-2 underline"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="emoji-picker-container absolute bottom-16 left-4 bg-white rounded-lg shadow-lg p-3 grid grid-cols-5 gap-2 w-64 z-10">
                  {commonEmojis.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => handleEmojiClick(emoji)}
                      className="hover:bg-gray-100 p-2 rounded text-xl"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="hover:bg-gray-200 rounded-full p-2"
                >
                  <Smile className="h-6 w-6 text-gray-600" />
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  onChange={handleFileUpload}
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="hover:bg-gray-200 rounded-full p-2"
                >
                  <Paperclip className="h-6 w-6 text-gray-600" />
                </button>
                
                {/* Voice Message Button */}
                {isRecording ? (
                  <button
                    onClick={stopVoiceRecording}
                    className="bg-red-600 hover:bg-red-700 rounded-full p-2 transition-colors animate-pulse"
                    title="Stop Recording"
                  >
                    <Mic className="h-6 w-6 text-white" />
                  </button>
                ) : (
                  <button
                    onClick={startVoiceRecording}
                    className="hover:bg-gray-200 rounded-full p-2"
                    title="Voice Message"
                  >
                    <Mic className="h-6 w-6 text-gray-600" />
                  </button>
                )}
              </div>
              
              <form onSubmit={handleSendMessage} className="flex-1 flex items-center space-x-2">
                <input
                  type="text"
                  placeholder={editingMessageId ? "Edit your message..." : "Type a message"}
                  value={newMessage}
                  onChange={handleTyping}
                  className="flex-1 px-4 py-2 bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-[#00a884] text-sm"
                />
                <button
                  type="submit"
                  className="bg-[#00a884] hover:bg-[#008069] text-white p-2 rounded-full transition-colors"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-[#00a884] rounded-full mx-auto mb-4 flex items-center justify-center">
                <MessageCircle className="h-12 w-12 text-white" />
              </div>
              <p className="text-gray-600 font-medium">Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Group Creation Modal */}
      <GroupModal 
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        onGroupCreated={(group) => {
          console.log('Group created:', group)
          toast.success(`Group "${group.name}" created successfully!`)
          setShowGroupModal(false)
        }}
      />
      
      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        user={currentUserInfo}
        onUpdate={handleProfileUpdate}
      />
      
      {/* Profile Modal */}
      {showProfile && selectedUserInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick={() => setShowProfile(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Profile Header */}
            <div className="bg-[#008069] px-6 py-6 text-white relative">
              <button
                onClick={() => setShowProfile(false)}
                className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-1"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="flex flex-col items-center">
                <img
                  src={selectedUserInfo.profile_picture || `https://ui-avatars.com/api/?name=${selectedUserInfo.username}&background=008069&color=fff`}
                  alt={selectedUserInfo.username}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                />
                <h2 className="text-2xl font-bold mt-4">{selectedUserInfo.username}</h2>
                <p className="text-white/80 text-sm mt-1">{selectedUserInfo.email}</p>
                
                {/* Status Badge */}
                <div className="mt-3 flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                  <div className={`w-2 h-2 rounded-full ${
                    selectedChat?.status === 'online' ? 'bg-green-400' :
                    selectedChat?.status === 'away' ? 'bg-yellow-400' :
                    'bg-gray-400'
                  }`}></div>
                  <span className="text-sm capitalize">{selectedChat?.status || 'offline'}</span>
                </div>
              </div>
            </div>
            
            {/* Profile Details */}
            <div className="px-6 py-4 space-y-4">
              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setShowProfile(false)
                    startCall(selectedChat.id, 'audio')
                  }}
                  className="flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-3 rounded-lg transition-colors"
                >
                  <Phone className="h-5 w-5" />
                  <span className="font-medium">Voice Call</span>
                </button>
                <button
                  onClick={() => {
                    setShowProfile(false)
                    startCall(selectedChat.id, 'video')
                  }}
                  className="flex items-center justify-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 px-4 py-3 rounded-lg transition-colors"
                >
                  <Video className="h-5 w-5" />
                  <span className="font-medium">Video Call</span>
                </button>
              </div>
              
              {/* Info Section */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact Information</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <MessageCircle className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">About</p>
                      <p className="text-sm font-medium text-gray-900">{selectedUserInfo.bio || 'No status set'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-600 text-sm">📧</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-sm font-medium text-gray-900">{selectedUserInfo.email}</p>
                    </div>
                  </div>
                  
                  {selectedUserInfo.last_seen && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-600 text-sm">🕐</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Last Seen</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(selectedUserInfo.last_seen).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {selectedUserInfo.is_admin && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Role</p>
                        <p className="text-sm font-medium text-yellow-600">Administrator</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Creation Modal */}
      <MeetingModal
        isOpen={showMeetingModal}
        onClose={() => setShowMeetingModal(false)}
        onMeetingCreated={(meeting) => {
          console.log('Meeting created:', meeting)
          toast.success(`Meeting "${meeting.title}" created successfully!`)
          // Optionally navigate to the meeting or keep modal open to join
          if (meeting?.meeting_code) {
            // Show meeting link option in modal
            console.log('Meeting code:', meeting.meeting_code)
          }
        }}
      />

      {/* Media Gallery Modal */}
      <MediaGallery
        isOpen={showMediaGallery}
        onClose={() => setShowMediaGallery(false)}
      />

      {/* Settings Modal */}
      {showSettings && <SettingsModal 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />}
    </div>
  )
}

// Settings Modal Component
function SettingsModal({ isOpen, onClose }) {
  const [settings, setSettings] = useState({
    show_online_status: true,
    show_last_seen: true,
    allow_group_invites: true,
    allow_direct_messages: true,
    notifications_enabled: true,
    sound_notifications: true
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadSettings()
    }
  }, [isOpen])

  const loadSettings = async () => {
    if (isChatForcedOffline()) {
      try {
        const saved = localStorage.getItem('naptin_chat_settings')
        if (saved) setSettings(JSON.parse(saved))
      } catch {}
      return
    }
    try {
      const response = await axios.get(`${getApiBase()}/settings`, {
        withCredentials: true
      })
      setSettings(response.data)
    } catch (error) {
      console.error('Failed to load settings:', error)
      toast.error('Failed to load settings')
    }
  }

  const handleUpdateSettings = async () => {
    if (isChatForcedOffline()) {
      try { localStorage.setItem('naptin_chat_settings', JSON.stringify(settings)) } catch {}
      toast.success('Settings saved locally.')
      onClose()
      return
    }
    try {
      setLoading(true)
      await axios.put(`${getApiBase()}/settings`, settings, {
        withCredentials: true
      })
      toast.success('Settings updated successfully!')
      onClose()
    } catch (error) {
      // Save locally as fallback
      try { localStorage.setItem('naptin_chat_settings', JSON.stringify(settings)) } catch {}
      toast.success('Settings saved locally (server unavailable).')
      onClose()
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-[#008069] px-6 py-4 flex items-center justify-between text-white">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Privacy Settings
          </h2>
          <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Privacy</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Show Online Status</p>
                  <p className="text-xs text-gray-500">Let others see when you're online</p>
                </div>
                <button
                  onClick={() => setSettings({...settings, show_online_status: !settings.show_online_status})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.show_online_status ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.show_online_status ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </label>

              <label className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Show Last Seen</p>
                  <p className="text-xs text-gray-500">Let others see when you were last active</p>
                </div>
                <button
                  onClick={() => setSettings({...settings, show_last_seen: !settings.show_last_seen})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.show_last_seen ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.show_last_seen ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Messages</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Allow Group Invites</p>
                  <p className="text-xs text-gray-500">Let others add you to groups</p>
                </div>
                <button
                  onClick={() => setSettings({...settings, allow_group_invites: !settings.allow_group_invites})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.allow_group_invites ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.allow_group_invites ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </label>

              <label className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Allow Direct Messages</p>
                  <p className="text-xs text-gray-500">Let others message you directly</p>
                </div>
                <button
                  onClick={() => setSettings({...settings, allow_direct_messages: !settings.allow_direct_messages})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.allow_direct_messages ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.allow_direct_messages ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Notifications</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Enable Notifications</p>
                  <p className="text-xs text-gray-500">Receive notifications for new messages</p>
                </div>
                <button
                  onClick={() => setSettings({...settings, notifications_enabled: !settings.notifications_enabled})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications_enabled ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications_enabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </label>

              <label className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Sound Notifications</p>
                  <p className="text-xs text-gray-500">Play sounds for notifications</p>
                </div>
                <button
                  onClick={() => setSettings({...settings, sound_notifications: !settings.sound_notifications})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.sound_notifications ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.sound_notifications ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateSettings}
              disabled={loading}
              className="px-4 py-2 bg-[#008069] text-white rounded-lg hover:bg-[#00a884] disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
