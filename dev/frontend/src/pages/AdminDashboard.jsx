import React, { useState, useEffect } from 'react'
import { useAuth, getApiBase } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Settings, 
  Shield, 
  Activity,
  UserPlus,
  Ban,
  Edit,
  Trash,
  Search,
  Filter,
  BarChart,
  PieChart,
  LineChart,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Phone,
  MicOff,
  Users as UsersIcon,
  Video,
  FileText,
  PhoneCall
} from 'lucide-react'

export function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [users, setUsers] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [showCreateUserModal, setShowCreateUserModal] = useState(false)
  const [showEditUserModal, setShowEditUserModal] = useState(false)
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false)
  const [showCreateMeetingModal, setShowCreateMeetingModal] = useState(false)
  const [showAddParticipantModal, setShowAddParticipantModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [newGroup, setNewGroup] = useState({ name: '', description: '' })
  const [newMeeting, setNewMeeting] = useState({ title: '', description: '', meeting_type: 'meeting' })
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [selectedParticipantRole, setSelectedParticipantRole] = useState('participant')
  const [allUsers, setAllUsers] = useState([])
  const [selectedMemberRole, setSelectedMemberRole] = useState('member')
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    is_admin: false,
    is_banned: false
  })
  const [stats, setStats] = useState({
    totalUsers: 0,
    onlineUsers: 0,
    totalMessages: 0,
    messagesToday: 0,
    groups: 0,
    newUsersToday: 0
  })
  const [activity, setActivity] = useState([])
  const [groups, setGroups] = useState([])
  const [meetings, setMeetings] = useState([])
  const [calls, setCalls] = useState([])
  const [media, setMedia] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [selectedMeeting, setSelectedMeeting] = useState(null)
  const [groupMembers, setGroupMembers] = useState([])
  const [meetingParticipants, setMeetingParticipants] = useState([])
  const [groupLogs, setGroupLogs] = useState([])
  const [showGroupDetailsTab, setShowGroupDetailsTab] = useState('members') // 'members', 'logs', 'manage'
  const [suspensionReason, setSuspensionReason] = useState('')
  const [generatedAuthCode, setGeneratedAuthCode] = useState(null)
  const [analytics, setAnalytics] = useState({
    dailyMessages: [],
    dailySignups: [],
    userStatus: {},
    messageTypes: {},
    callStats: {},
    recentActivity: {}
  })
  const [ldapConfig, setLdapConfig] = useState({
    enabled: false,
    server: '',
    port: 389,
    base_dn: '',
    bind_dn: '',
    bind_password: '',
    user_search_filter: '(sAMAccountName={username})',
    user_dn_template: 'CN={username},{base_dn}'
  })
  const [ldapTestResult, setLdapTestResult] = useState(null)
  const [testingLdap, setTestingLdap] = useState(false)

  useEffect(() => {
    // Fetch dashboard stats
    loadStats()
    loadActivity()
    if (activeTab === 'users') loadUsers()
    if (activeTab === 'messages') loadMessages()
    if (activeTab === 'analytics') loadAnalytics()
    if (activeTab === 'groups') loadGroups()
    if (activeTab === 'meetings') loadMeetings()
    if (activeTab === 'calls') loadCalls()
    if (activeTab === 'media') loadMedia()
    if (activeTab === 'ldap') loadLdapConfig()
    
    // Auto-refresh stats every 30 seconds when on dashboard tab
    const interval = setInterval(() => {
      if (activeTab === 'dashboard') {
        loadStats()
        loadActivity()
      }
      if (activeTab === 'analytics') {
        loadAnalytics()
      }
    }, 30000) // Refresh every 30 seconds
    
    return () => clearInterval(interval)
  }, [activeTab])

  const loadStats = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${getApiBase()}/admin/stats`, {
        withCredentials: true
      })
      setStats(response.data)
    } catch (error) {
      console.error('Failed to load stats:', error)
      toast.error('Failed to load dashboard stats')
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${getApiBase()}/admin/users`, {
        withCredentials: true
      })
      setUsers(response.data)
    } catch (error) {
      console.error('Failed to load users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${getApiBase()}/admin/messages`, {
        withCredentials: true
      })
      setMessages(response.data)
    } catch (error) {
      console.error('Failed to load messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const loadActivity = async () => {
    try {
      const response = await axios.get(`${getApiBase()}/admin/activity`, {
        withCredentials: true
      })
      setActivity(response.data)
    } catch (error) {
      console.error('Failed to load activity:', error)
      // Don't show error toast, just log it
    }
  }

  const loadAnalytics = async () => {
    try {
      const response = await axios.get(`${getApiBase()}/admin/analytics`, {
        withCredentials: true
      })
      setAnalytics(response.data)
    } catch (error) {
      console.error('Failed to load analytics:', error)
      toast.error('Failed to load analytics data')
    }
  }

  const handleBanUser = async (userId, isBanned) => {
    try {
      setLoading(true)
      const endpoint = isBanned ? 'unban' : 'ban'
      await axios.post(`${getApiBase()}/admin/users/${userId}/${endpoint}`, {}, {
        withCredentials: true
      })
      toast.success(isBanned ? 'User unbanned successfully' : 'User banned successfully')
      loadUsers() // Refresh user list
      loadStats() // Refresh stats
    } catch (error) {
      console.error('Failed to ban/unban user:', error)
      toast.error('Failed to update user status')
    } finally {
      setLoading(false)
    }
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setShowEditUserModal(true)
  }

  const handleSaveUser = async (e) => {
    e.preventDefault()
    if (!selectedUser) return
    
    try {
      setLoading(true)
      await axios.put(`${getApiBase()}/admin/users/${selectedUser.id}/edit`, selectedUser, {
        withCredentials: true
      })
      toast.success('User updated successfully')
      setShowEditUserModal(false)
      setSelectedUser(null)
      loadUsers()
      loadStats()
    } catch (error) {
      console.error('Failed to update user:', error)
      toast.error(error.response?.data?.error || 'Failed to update user')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return
    
    try {
      setLoading(true)
      await axios.post(`${getApiBase()}/admin/users/${userId}/delete`, {}, {
        withCredentials: true
      })
      toast.success('User deleted successfully')
      loadUsers()
      loadStats()
    } catch (error) {
      console.error('Failed to delete user:', error)
      toast.error(error.response?.data?.error || 'Failed to delete user')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'online' && user.status === 'online') ||
      (filterStatus === 'offline' && user.status === 'offline') ||
      (filterStatus === 'banned' && user.is_banned) ||
      (filterStatus === 'admins' && user.is_admin)
    
    return matchesSearch && matchesFilter
  })

  const loadAllUsers = async () => {
    try {
      const response = await axios.get(`${getApiBase()}/api/users`, {
        withCredentials: true
      })
      setAllUsers(response.data)
    } catch (error) {
      console.error('Failed to load users:', error)
    }
  }

  const handleCreateGroup = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      await axios.post(`${getApiBase()}/admin/groups/create`, newGroup, {
        withCredentials: true
      })
      toast.success('Group created successfully')
      setShowCreateGroupModal(false)
      setNewGroup({ name: '', description: '' })
      loadGroups()
      loadStats()
    } catch (error) {
      console.error('Failed to create group:', error)
      toast.error(error.response?.data?.error || 'Failed to create group')
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async () => {
    if (!selectedGroup || !selectedUser) return
    
    try {
      setLoading(true)
      await axios.post(
        `${getApiBase()}/admin/groups/${selectedGroup.id}/members/add`,
        { user_id: selectedUser.id, role: selectedMemberRole },
        { withCredentials: true }
      )
      toast.success('Member added successfully')
      setShowAddMemberModal(false)
      setSelectedUser(null)
      handleViewGroupDetails(selectedGroup)
      loadGroupLogs()
    } catch (error) {
      console.error('Failed to add member:', error)
      toast.error(error.response?.data?.error || 'Failed to add member')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMeeting = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      await axios.post(`${getApiBase()}/admin/meetings/create`, newMeeting, {
        withCredentials: true
      })
      toast.success('Meeting created successfully')
      setShowCreateMeetingModal(false)
      setNewMeeting({ title: '', description: '', meeting_type: 'meeting' })
      loadMeetings()
      loadStats()
    } catch (error) {
      console.error('Failed to create meeting:', error)
      toast.error(error.response?.data?.error || 'Failed to create meeting')
    } finally {
      setLoading(false)
    }
  }

  const handleAddParticipant = async () => {
    if (!selectedMeeting || !selectedUser) return
    
    try {
      setLoading(true)
      await axios.post(
        `${getApiBase()}/admin/meetings/${selectedMeeting.id}/participants/add`,
        { user_id: selectedUser.id, role: selectedParticipantRole },
        { withCredentials: true }
      )
      toast.success('Participant added successfully')
      setShowAddParticipantModal(false)
      setSelectedUser(null)
      handleViewMeetingDetails(selectedMeeting)
    } catch (error) {
      console.error('Failed to add participant:', error)
      toast.error(error.response?.data?.error || 'Failed to add participant')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveParticipant = async (participantId, username) => {
    if (!selectedMeeting || !window.confirm(`Remove ${username} from this meeting?`)) return
    
    try {
      setLoading(true)
      await axios.post(
        `${getApiBase()}/admin/meetings/${selectedMeeting.id}/participants/${participantId}/remove`,
        {},
        { withCredentials: true }
      )
      toast.success('Participant removed successfully')
      handleViewMeetingDetails(selectedMeeting)
    } catch (error) {
      console.error('Failed to remove participant:', error)
      toast.error(error.response?.data?.error || 'Failed to remove participant')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await axios.post(`${getApiBase()}/admin/users/create`, newUser, {
        withCredentials: true
      })
      toast.success('User created successfully')
      setShowCreateUserModal(false)
      setNewUser({ username: '', email: '', password: '', is_admin: false, is_banned: false })
      loadUsers() // Refresh user list
      loadStats() // Refresh stats
    } catch (error) {
      console.error('Failed to create user:', error)
      toast.error(error.response?.data?.error || 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return
    
    try {
      setLoading(true)
      await axios.post(`${getApiBase()}/admin/messages/${messageId}/delete`, {}, {
        withCredentials: true
      })
      toast.success('Message deleted successfully')
      loadMessages() // Refresh message list
      loadStats() // Refresh stats
    } catch (error) {
      console.error('Failed to delete message:', error)
      toast.error('Failed to delete message')
    } finally {
      setLoading(false)
    }
  }

  const loadGroups = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${getApiBase()}/admin/groups`, {
        withCredentials: true
      })
      setGroups(response.data)
    } catch (error) {
      console.error('Failed to load groups:', error)
      toast.error('Failed to load groups')
    } finally {
      setLoading(false)
    }
  }

  const loadMeetings = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${getApiBase()}/admin/meetings`, {
        withCredentials: true
      })
      setMeetings(response.data)
    } catch (error) {
      console.error('Failed to load meetings:', error)
      toast.error('Failed to load meetings')
    } finally {
      setLoading(false)
    }
  }

  const loadCalls = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${getApiBase()}/admin/calls`, {
        withCredentials: true
      })
      setCalls(response.data)
    } catch (error) {
      console.error('Failed to load calls:', error)
      toast.error('Failed to load calls')
    } finally {
      setLoading(false)
    }
  }

  const loadMedia = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${getApiBase()}/admin/media`, {
        withCredentials: true
      })
      setMedia(response.data)
    } catch (error) {
      console.error('Failed to load media:', error)
      toast.error('Failed to load media')
    } finally {
      setLoading(false)
    }
  }

  const loadLdapConfig = async () => {
    try {
      const response = await axios.get(`${getApiBase()}/admin/ldap/config`, {
        withCredentials: true
      })
      setLdapConfig(response.data)
    } catch (error) {
      console.error('Failed to load LDAP config:', error)
    }
  }

  const handleSaveLdapConfig = async () => {
    try {
      setLoading(true)
      await axios.post(`${getApiBase()}/admin/ldap/config`, ldapConfig, {
        withCredentials: true
      })
      toast.success('LDAP configuration saved successfully')
      setLdapTestResult(null)
    } catch (error) {
      console.error('Failed to save LDAP config:', error)
      toast.error('Failed to save LDAP configuration')
    } finally {
      setLoading(false)
    }
  }

  const handleTestLdapConnection = async () => {
    try {
      setTestingLdap(true)
      setLdapTestResult(null)
      const response = await axios.post(`${getApiBase()}/admin/ldap/test`, ldapConfig, {
        withCredentials: true
      })
      setLdapTestResult(response.data)
      if (response.data.success) {
        toast.success('LDAP connection test successful!')
      } else {
        toast.error(response.data.message || 'LDAP connection failed')
      }
    } catch (error) {
      console.error('Failed to test LDAP:', error)
      setLdapTestResult({
        success: false,
        message: error.response?.data?.error || 'Failed to test LDAP connection'
      })
      toast.error('Failed to test LDAP connection')
    } finally {
      setTestingLdap(false)
    }
  }

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) return
    
    try {
      setLoading(true)
      await axios.post(`${getApiBase()}/admin/groups/${groupId}/delete`, {}, {
        withCredentials: true
      })
      toast.success('Group deleted successfully')
      loadGroups()
      loadStats()
    } catch (error) {
      console.error('Failed to delete group:', error)
      toast.error('Failed to delete group')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMeeting = async (meetingId) => {
    if (!window.confirm('Are you sure you want to delete this meeting? This action cannot be undone.')) return
    
    try {
      setLoading(true)
      await axios.post(`${getApiBase()}/admin/meetings/${meetingId}/delete`, {}, {
        withCredentials: true
      })
      toast.success('Meeting deleted successfully')
      loadMeetings()
      loadStats()
    } catch (error) {
      console.error('Failed to delete meeting:', error)
      toast.error('Failed to delete meeting')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCall = async (callId) => {
    if (!window.confirm('Are you sure you want to delete this call record? This action cannot be undone.')) return
    
    try {
      setLoading(true)
      await axios.post(`${getApiBase()}/admin/calls/${callId}/delete`, {}, {
        withCredentials: true
      })
      toast.success('Call record deleted successfully')
      loadCalls()
      loadStats()
    } catch (error) {
      console.error('Failed to delete call:', error)
      toast.error('Failed to delete call record')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMedia = async (mediaId) => {
    if (!window.confirm('Are you sure you want to delete this media file? This action cannot be undone.')) return
    
    try {
      setLoading(true)
      await axios.post(`${getApiBase()}/admin/media/${mediaId}/delete`, {}, {
        withCredentials: true
      })
      toast.success('Media file deleted successfully')
      loadMedia()
      loadStats()
    } catch (error) {
      console.error('Failed to delete media:', error)
      toast.error('Failed to delete media file')
    } finally {
      setLoading(false)
    }
  }

  const handleViewGroupDetails = async (group) => {
    try {
      setLoading(true)
      const membersResponse = await axios.get(`${getApiBase()}/admin/groups/${group.id}/members`, {
        withCredentials: true
      })
      setGroupMembers(membersResponse.data)
      setSelectedGroup(group)
      setShowGroupDetailsTab('members')
      setGeneratedAuthCode(null)
      // Load all users for the add member dropdown
      await loadAllUsers()
    } catch (error) {
      console.error('Failed to load group details:', error)
      toast.error('Failed to load group details')
    } finally {
      setLoading(false)
    }
  }

  const loadGroupLogs = async () => {
    if (!selectedGroup) return
    try {
      const response = await axios.get(`${getApiBase()}/admin/groups/${selectedGroup.id}/logs`, {
        withCredentials: true
      })
      setGroupLogs(response.data)
    } catch (error) {
      console.error('Failed to load group logs:', error)
      toast.error('Failed to load group logs')
    }
  }

  const handleSuspendGroup = async () => {
    if (!selectedGroup) return
    if (!suspensionReason) {
      toast.error('Please provide a reason for suspension')
      return
    }
    
    try {
      setLoading(true)
      await axios.post(`${getApiBase()}/admin/groups/${selectedGroup.id}/suspend`, 
        { reason: suspensionReason }, 
        { withCredentials: true }
      )
      toast.success('Group suspended successfully')
      setSuspensionReason('')
      loadGroups()
      loadStats()
    } catch (error) {
      console.error('Failed to suspend group:', error)
      toast.error('Failed to suspend group')
    } finally {
      setLoading(false)
    }
  }

  const handleUnsuspendGroup = async () => {
    if (!selectedGroup) return
    
    try {
      setLoading(true)
      await axios.post(`${getApiBase()}/admin/groups/${selectedGroup.id}/unsuspend`, {}, {
        withCredentials: true
      })
      toast.success('Group unsuspended successfully')
      loadGroups()
      loadStats()
    } catch (error) {
      console.error('Failed to unsuspend group:', error)
      toast.error('Failed to unsuspend group')
    } finally {
      setLoading(false)
    }
  }

  const handleAuthorizeGroup = async () => {
    if (!selectedGroup) return
    
    try {
      setLoading(true)
      await axios.post(`${getApiBase()}/admin/groups/${selectedGroup.id}/authorize`, {}, {
        withCredentials: true
      })
      toast.success('Group authorized successfully')
      loadGroups()
      loadStats()
    } catch (error) {
      console.error('Failed to authorize group:', error)
      toast.error('Failed to authorize group')
    } finally {
      setLoading(false)
    }
  }

  const handleDeauthorizeGroup = async () => {
    if (!selectedGroup) return
    
    try {
      setLoading(true)
      await axios.post(`${getApiBase()}/admin/groups/${selectedGroup.id}/deauthorize`, {}, {
        withCredentials: true
      })
      toast.success('Group deauthorized successfully')
      loadGroups()
      loadStats()
    } catch (error) {
      console.error('Failed to deauthorize group:', error)
      toast.error('Failed to deauthorize group')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateAuthCode = async () => {
    if (!selectedGroup) return
    
    try {
      setLoading(true)
      const response = await axios.post(`${getApiBase()}/admin/groups/${selectedGroup.id}/generate-auth-code`, {}, {
        withCredentials: true
      })
      setGeneratedAuthCode(response.data.auth_code)
      toast.success('Authorization code generated')
      loadGroups()
      loadGroupLogs()
    } catch (error) {
      console.error('Failed to generate auth code:', error)
      toast.error('Failed to generate authorization code')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (memberId, username) => {
    if (!selectedGroup || !window.confirm(`Remove ${username} from this group?`)) return
    
    try {
      setLoading(true)
      await axios.post(`${getApiBase()}/admin/groups/${selectedGroup.id}/members/${memberId}/remove`, {}, {
        withCredentials: true
      })
      toast.success('Member removed successfully')
      handleViewGroupDetails(selectedGroup)
      loadGroupLogs()
    } catch (error) {
      console.error('Failed to remove member:', error)
      toast.error('Failed to remove member')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedGroup && showGroupDetailsTab === 'logs') {
      loadGroupLogs()
    }
  }, [selectedGroup, showGroupDetailsTab])

  const handleViewMeetingDetails = async (meeting) => {
    try {
      setLoading(true)
      const response = await axios.get(`${getApiBase()}/admin/meetings/${meeting.id}/participants`, {
        withCredentials: true
      })
      setMeetingParticipants(response.data)
      setSelectedMeeting(meeting)
      // Load all users for the add participant dropdown
      await loadAllUsers()
    } catch (error) {
      console.error('Failed to load meeting participants:', error)
      toast.error('Failed to load meeting details')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'groups', label: 'Groups', icon: UsersIcon },
    { id: 'meetings', label: 'Meetings', icon: Video },
    { id: 'calls', label: 'Calls', icon: PhoneCall },
    { id: 'media', label: 'Media', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'ldap', label: 'LDAP/AD', icon: Shield },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white">
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <ArrowLeft 
              className="h-5 w-5 text-white cursor-pointer hover:text-gray-300" 
              onClick={() => navigate('/')}
              title="Back to Chat"
            />
            <Shield className="h-8 w-8 text-blue-400" />
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>
        </div>
        
        <nav className="mt-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-6 py-4 transition-colors ${
                activeTab === tab.id ? 'bg-gray-700 border-l-4 border-blue-400' : 'hover:bg-gray-700'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-64 p-6">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-semibold">{user?.username?.charAt(0)}</span>
              </div>
              <div>
                <p className="font-semibold">{user?.username}</p>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg flex items-center space-x-3">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span>Loading...</span>
            </div>
          </div>
        )}
        
        {activeTab === 'dashboard' && (
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Online Users</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.onlineUsers}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Activity className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Messages</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalMessages}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Messages Today</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.messagesToday}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Groups</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.groups}</p>
                  </div>
                  <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-pink-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">New Users Today</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.newUsersToday}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <UserPlus className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {activity.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No recent activity</p>
                  </div>
                ) : (
                  activity.slice(0, 20).map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-xl">
                        {item.icon || '📌'}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.description}</p>
                        <p className="text-sm text-gray-500">
                          {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Unknown time'}
                        </p>
                      </div>
                      {item.type === 'message' && <MessageSquare className="h-5 w-5 text-blue-500" />}
                      {item.type === 'call' && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {item.type === 'user_registration' && <UserPlus className="h-5 w-5 text-green-500" />}
                      {item.type === 'group_created' && <Users className="h-5 w-5 text-purple-500" />}
                      {item.type === 'media_upload' && <Activity className="h-5 w-5 text-orange-500" />}
                      {item.type === 'meeting_created' && <Activity className="h-5 w-5 text-pink-500" />}
                      {item.type === 'user_offline' && <XCircle className="h-5 w-5 text-red-500" />}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Users</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="banned">Banned</option>
                  <option value="admins">Admins</option>
                </select>
                <button 
                  onClick={() => setShowCreateUserModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Add User</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                              <span className="text-white font-semibold">{u.username.charAt(0)}</span>
                            </div>
                            <div className="ml-3">
                              <p className="font-medium text-gray-900">{u.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{u.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            u.status === 'online' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            u.is_admin 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {u.is_admin ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleEditUser(u)} 
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit user"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            {!u.is_admin && (
                              <button 
                                onClick={() => handleBanUser(u.id, u.is_banned)} 
                                className={u.is_banned ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}
                                title={u.is_banned ? 'Unban user' : 'Ban user'}
                              >
                                <Ban className="h-5 w-5" />
                              </button>
                            )}
                            {!u.is_admin && (
                              <button 
                                onClick={() => handleDeleteUser(u.id)} 
                                className="text-red-600 hover:text-red-800"
                                title="Delete user"
                              >
                                <Trash className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Message Management</h1>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sender</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receiver</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Content</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {messages.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        No messages found
                      </td>
                    </tr>
                  ) : (
                    messages.map((msg) => (
                      <tr key={msg.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">#{msg.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{msg.sender_username || 'Unknown'}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{msg.receiver_username || 'Unknown'}</td>
                        <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{msg.content || 'No content'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">{msg.message_type || 'text'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">{msg.timestamp ? new Date(msg.timestamp).toLocaleString() : 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button onClick={() => handleDeleteMessage(msg.id)} className="text-red-600 hover:text-red-800" title="Delete message">
                            <Trash className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics & Reports</h1>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Call Success Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.callStats?.total > 0 
                        ? Math.round((analytics.callStats?.successful / analytics.callStats?.total) * 100) 
                        : 0}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Activity className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Calls</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.callStats?.total || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">New Groups (7 days)</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.recentActivity?.newGroups || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Media Uploads (7 days)</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.recentActivity?.newMedia || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Activity className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Message Activity Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Daily Message Activity (Last 30 Days)</h2>
                <div className="h-64 flex items-end justify-between gap-1">
                  {analytics.dailyMessages.length > 0 ? (
                    analytics.dailyMessages.slice(-14).map((item, index) => {
                      const maxCount = Math.max(...analytics.dailyMessages.map(m => m.count || 0), 1)
                      const height = ((item.count || 0) / maxCount) * 100
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div 
                            className="w-full bg-blue-500 hover:bg-blue-600 transition-colors cursor-pointer rounded-t"
                            style={{ height: `${height}%` }}
                            title={`${item.date}: ${item.count} messages`}
                          ></div>
                          <span className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left">
                            {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      )
                    })
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <BarChart className="h-32 w-32" />
                    </div>
                  )}
                </div>
              </div>

              {/* User Status Distribution */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">User Status Distribution</h2>
                <div className="space-y-4">
                  {analytics.userStatus && Object.entries(analytics.userStatus).map(([status, count]) => {
                    const total = Object.values(analytics.userStatus).reduce((a, b) => a + b, 0)
                    const percentage = total > 0 ? Math.round((count / total) * 100) : 0
                    const color = status === 'online' ? 'bg-green-500' : status === 'away' ? 'bg-yellow-500' : status === 'banned' ? 'bg-red-500' : 'bg-gray-500'
                    return (
                      <div key={status}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize">{status}</span>
                          <span className="font-bold">{count} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className={`${color} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Message Type Distribution */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Message Type Distribution</h2>
                <div className="space-y-3">
                  {analytics.messageTypes && Object.entries(analytics.messageTypes).map(([type, count]) => {
                    const total = Object.values(analytics.messageTypes).reduce((a, b) => a + b, 0)
                    const percentage = total > 0 ? Math.round((count / total) * 100) : 0
                    return (
                      <div key={type} className="flex items-center gap-3">
                        <span className="capitalize text-sm w-16">{type}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-4">
                          <div className="bg-blue-500 h-4 rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>
                        <span className="text-sm font-bold w-16 text-right">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* User Signup Trend */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">User Signups (Last 30 Days)</h2>
                <div className="h-64 flex items-end justify-between gap-1">
                  {analytics.dailySignups.length > 0 ? (
                    analytics.dailySignups.slice(-14).map((item, index) => {
                      const maxCount = Math.max(...analytics.dailySignups.map(m => m.count || 0), 1)
                      const height = ((item.count || 0) / maxCount) * 100
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div 
                            className="w-full bg-green-500 hover:bg-green-600 transition-colors cursor-pointer rounded-t"
                            style={{ height: `${height}%` }}
                            title={`${item.date}: ${item.count} signups`}
                          ></div>
                          <span className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left">
                            {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      )
                    })
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <LineChart className="h-32 w-32" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">System Settings</h1>
            
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Allow User Registration</p>
                      <p className="text-sm text-gray-500">Users can create new accounts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Enable Two-Factor Authentication</p>
                      <p className="text-sm text-gray-500">Require 2FA for admin accounts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Message Length</label>
                    <input type="number" defaultValue="5000" className="border border-gray-300 rounded-lg px-4 py-2 w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message Retention (days)</label>
                    <input type="number" defaultValue="365" className="border border-gray-300 rounded-lg px-4 py-2 w-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Groups Tab */}
        {activeTab === 'groups' && (
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Groups Management</h1>
              <button 
                onClick={() => {
                  setNewGroup({ name: '', description: '' })
                  setShowCreateGroupModal(true)
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <UserPlus className="h-5 w-5" />
                <span>Create Group</span>
              </button>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Group Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Members
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {groups.map((group) => (
                      <tr key={group.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <UsersIcon className="h-5 w-5 text-blue-500 mr-2" />
                            <span className="text-sm font-medium text-gray-900">{group.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {group.description || 'No description'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {group.member_count || 0} members
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(group.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleViewGroupDetails(group)}
                              className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1"
                            >
                              <Edit className="h-4 w-4" />
                              View
                            </button>
                            <button
                              onClick={() => handleDeleteGroup(group.id)}
                              className="text-red-600 hover:text-red-900 inline-flex items-center gap-1"
                            >
                              <Trash className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Meetings Tab */}
        {activeTab === 'meetings' && (
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Meetings Management</h1>
              <button 
                onClick={() => {
                  setNewMeeting({ title: '', description: '', meeting_type: 'meeting' })
                  setShowCreateMeetingModal(true)
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <UserPlus className="h-5 w-5" />
                <span>Create Meeting</span>
              </button>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Meeting Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {meetings.map((meeting) => (
                      <tr key={meeting.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Video className="h-5 w-5 text-green-500 mr-2" />
                            <span className="text-sm font-medium text-gray-900">{meeting.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                          {meeting.meeting_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            meeting.status === 'active' ? 'bg-green-100 text-green-800' :
                            meeting.status === 'ended' ? 'bg-gray-100 text-gray-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {meeting.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                          {meeting.meeting_code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(meeting.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleViewMeetingDetails(meeting)}
                              className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1"
                            >
                              <Edit className="h-4 w-4" />
                              View
                            </button>
                            <button
                              onClick={() => handleDeleteMeeting(meeting.id)}
                              className="text-red-600 hover:text-red-900 inline-flex items-center gap-1"
                            >
                              <Trash className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Calls Tab */}
        {activeTab === 'calls' && (
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Call History</h1>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {calls.map((call) => (
                      <tr key={call.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {call.call_type === 'video' ? (
                              <Video className="h-5 w-5 text-blue-500 mr-2" />
                            ) : (
                              <Phone className="h-5 w-5 text-green-500 mr-2" />
                            )}
                            <span className="text-sm font-medium text-gray-900 capitalize">{call.call_type} Call</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            call.status === 'completed' ? 'bg-green-100 text-green-800' :
                            call.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {call.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {call.duration ? `${call.duration}s` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(call.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleDeleteCall(call.id)}
                            className="text-red-600 hover:text-red-900 inline-flex items-center gap-1"
                          >
                            <Trash className="h-4 w-4" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Media Tab */}
        {activeTab === 'media' && (
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Media Management</h1>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        File Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Uploaded
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {media.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-purple-500 mr-2" />
                            <span className="text-sm font-medium text-gray-900">{item.file_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                          {item.file_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {(item.file_size / 1024).toFixed(2)} KB
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(item.uploaded_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleDeleteMedia(item.id)}
                            className="text-red-600 hover:text-red-900 inline-flex items-center gap-1"
                          >
                            <Trash className="h-4 w-4" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* LDAP/AD Tab */}
        {activeTab === 'ldap' && (
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">LDAP/Active Directory Configuration</h1>
            
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                LDAP Settings
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ldapConfig.enabled}
                      onChange={(e) => setLdapConfig({ ...ldapConfig, enabled: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <span className="font-medium">Enable LDAP Authentication</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LDAP Server *
                  </label>
                  <input
                    type="text"
                    value={ldapConfig.server}
                    onChange={(e) => setLdapConfig({ ...ldapConfig, server: e.target.value })}
                    placeholder="ldap://your-domain.com or 192.168.1.10"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Use ldap:// or ldaps:// prefix</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Port *
                    </label>
                    <input
                      type="number"
                      value={ldapConfig.port}
                      onChange={(e) => setLdapConfig({ ...ldapConfig, port: parseInt(e.target.value) })}
                      placeholder="389"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">389 for LDAP, 636 for LDAPS</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Base DN *
                    </label>
                    <input
                      type="text"
                      value={ldapConfig.base_dn}
                      onChange={(e) => setLdapConfig({ ...ldapConfig, base_dn: e.target.value })}
                      placeholder="DC=example,DC=com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bind DN (Admin Account)
                  </label>
                  <input
                    type="text"
                    value={ldapConfig.bind_dn}
                    onChange={(e) => setLdapConfig({ ...ldapConfig, bind_dn: e.target.value })}
                    placeholder="CN=admin,CN=Users,DC=example,DC=com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bind Password
                  </label>
                  <input
                    type="password"
                    value={ldapConfig.bind_password}
                    onChange={(e) => setLdapConfig({ ...ldapConfig, bind_password: e.target.value })}
                    placeholder="Admin password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User Search Filter
                    </label>
                    <input
                      type="text"
                      value={ldapConfig.user_search_filter}
                      onChange={(e) => setLdapConfig({ ...ldapConfig, user_search_filter: e.target.value })}
                      placeholder="(sAMAccountName={username})"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User DN Template
                    </label>
                    <input
                      type="text"
                      value={ldapConfig.user_dn_template}
                      onChange={(e) => setLdapConfig({ ...ldapConfig, user_dn_template: e.target.value })}
                      placeholder="CN={username},{base_dn}"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Test Result */}
                {ldapTestResult && (
                  <div className={`p-4 rounded-lg ${
                    ldapTestResult.success 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      {ldapTestResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className={`font-medium ${
                        ldapTestResult.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {ldapTestResult.message}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-4">
                  <button
                    onClick={handleTestLdapConnection}
                    disabled={testingLdap || !ldapConfig.server}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {testingLdap ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Activity className="h-4 w-4" />
                        Test Connection
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleSaveLdapConfig}
                    disabled={loading || !ldapConfig.server}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : 'Save Configuration'}
                  </button>
                </div>
              </div>
            </div>

            {/* Documentation */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Quick Setup Guide</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p><strong>For Active Directory:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Server: ldap://your-domain.com</li>
                  <li>Port: 389 (LDAP) or 636 (LDAPS)</li>
                  <li>Base DN: DC=example,DC=com</li>
                  <li>Bind DN: CN=admin,CN=Users,DC=example,DC=com</li>
                  <li>User DN Template: CN=&#123;username&#125;,&#123;base_dn&#125;</li>
                </ul>
                <p className="pt-3"><strong>Environment Variables:</strong></p>
                <div className="bg-blue-100 p-3 rounded font-mono text-xs">
                  <p>export LDAP_SERVER="ldap://your-domain.com"</p>
                  <p>export LDAP_PORT="389"</p>
                  <p>export LDAP_BASE_DN="DC=example,DC=com"</p>
                  <p>export LDAP_BIND_DN_TEMPLATE="CN=&#123;username&#125;,&#123;base_dn&#125;"</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Group Details Modal */}
        {selectedGroup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedGroup.name}</h2>
                  {selectedGroup.is_suspended && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      Suspended
                    </span>
                  )}
                  {!selectedGroup.is_authorized && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Not Authorized
                    </span>
                  )}
                </div>
                <button
                  onClick={() => { setSelectedGroup(null); setGroupMembers([]); setGroupLogs([]); }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-4 text-gray-600">
                <p>{selectedGroup.description || 'No description'}</p>
                <p className="text-sm mt-2">Created: {new Date(selectedGroup.created_at).toLocaleDateString()}</p>
                {selectedGroup.auth_code && (
                  <div className="mt-2 p-2 bg-blue-50 rounded">
                    <p className="text-xs text-gray-600">Authorization Code:</p>
                    <p className="text-lg font-mono font-bold text-blue-600">{selectedGroup.auth_code}</p>
                  </div>
                )}
                {generatedAuthCode && (
                  <div className="mt-2 p-2 bg-green-50 rounded">
                    <p className="text-xs text-gray-600">New Authorization Code:</p>
                    <p className="text-lg font-mono font-bold text-green-600">{generatedAuthCode}</p>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="border-b mb-4">
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowGroupDetailsTab('members')}
                    className={`px-4 py-2 font-medium ${
                      showGroupDetailsTab === 'members' 
                        ? 'border-b-2 border-blue-600 text-blue-600' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Members ({groupMembers.length})
                  </button>
                  <button
                    onClick={() => setShowGroupDetailsTab('logs')}
                    className={`px-4 py-2 font-medium ${
                      showGroupDetailsTab === 'logs' 
                        ? 'border-b-2 border-blue-600 text-blue-600' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Activity Logs
                  </button>
                  <button
                    onClick={() => setShowGroupDetailsTab('manage')}
                    className={`px-4 py-2 font-medium ${
                      showGroupDetailsTab === 'manage' 
                        ? 'border-b-2 border-blue-600 text-blue-600' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Management
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              {showGroupDetailsTab === 'members' && (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        loadAllUsers()
                        setShowAddMemberModal(true)
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Add Member</span>
                    </button>
                  </div>
                  <div className="space-y-2">
                  {groupMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-gray-900">{member.username || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">Role: {member.role}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          member.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {member.role}
                        </span>
                        <button
                          onClick={() => handleRemoveMember(member.id, member.username)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
              )}

              {showGroupDetailsTab === 'logs' && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {groupLogs.map((log) => (
                    <div key={log.id} className="flex items-start p-3 bg-gray-50 rounded">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{log.username}</span>
                          <span className="text-sm text-gray-500">{new Date(log.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-gray-700 capitalize">{log.action.replace('_', ' ')}</p>
                        {log.details && <p className="text-xs text-gray-600 mt-1">{log.details}</p>}
                      </div>
                    </div>
                  ))}
                  {groupLogs.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No activity logs yet</p>
                  )}
                </div>
              )}

              {showGroupDetailsTab === 'manage' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded">
                      <h3 className="font-semibold mb-2">Suspension</h3>
                      {selectedGroup.is_suspended ? (
                        <div>
                          <p className="text-sm text-red-600 mb-2">{selectedGroup.suspension_reason}</p>
                          <button
                            onClick={handleUnsuspendGroup}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Unsuspend Group
                          </button>
                        </div>
                      ) : (
                        <div>
                          <textarea
                            value={suspensionReason}
                            onChange={(e) => setSuspensionReason(e.target.value)}
                            placeholder="Enter suspension reason..."
                            className="w-full p-2 border rounded mb-2"
                          />
                          <button
                            onClick={handleSuspendGroup}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 w-full"
                          >
                            Suspend Group
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="p-4 border rounded">
                      <h3 className="font-semibold mb-2">Authorization</h3>
                      <div className="space-y-2">
                        {selectedGroup.is_authorized ? (
                          <button
                            onClick={handleDeauthorizeGroup}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 w-full"
                          >
                            Revoke Authorization
                          </button>
                        ) : (
                          <button
                            onClick={handleAuthorizeGroup}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 w-full"
                          >
                            Authorize Group
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded">
                    <h3 className="font-semibold mb-2">Authorization Code</h3>
                    <button
                      onClick={handleGenerateAuthCode}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
                    >
                      Generate New Code
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Meeting Details Modal */}
        {selectedMeeting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedMeeting.title}</h2>
                <button
                  onClick={() => { setSelectedMeeting(null); setMeetingParticipants([]); }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedMeeting.status === 'active' ? 'bg-green-100 text-green-800' :
                    selectedMeeting.status === 'ended' ? 'bg-gray-100 text-gray-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedMeeting.status}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Meeting Code:</span>
                  <span className="ml-2 font-mono text-sm text-gray-600">{selectedMeeting.meeting_code}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Type:</span>
                  <span className="ml-2 text-sm text-gray-600 capitalize">{selectedMeeting.meeting_type}</span>
                </div>
                {selectedMeeting.description && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Description:</span>
                    <p className="text-sm text-gray-600 mt-1">{selectedMeeting.description}</p>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Participants ({meetingParticipants.length})</h3>
                  <button
                    onClick={() => {
                      loadAllUsers()
                      setShowAddParticipantModal(true)
                    }}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Add Participant</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {meetingParticipants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {participant.user?.username?.[0] || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{participant.user?.username || 'Unknown'}</p>
                          <p className="text-sm text-gray-500 capitalize">Role: {participant.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {participant.is_muted && <MicOff className="h-4 w-4 text-red-500" />}
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          participant.role === 'host' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {participant.role}
                        </span>
                        <button
                          onClick={() => handleRemoveParticipant(participant.id, participant.user?.username)}
                          className="text-red-600 hover:text-red-800"
                          title="Remove participant"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create User Modal */}
        {showCreateUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Create New User</h2>
                <button 
                  onClick={() => setShowCreateUserModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter password"
                  />
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_admin"
                      checked={newUser.is_admin}
                      onChange={(e) => setNewUser({ ...newUser, is_admin: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_admin" className="ml-2 text-sm text-gray-700">
                      Admin User
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_banned"
                      checked={newUser.is_banned}
                      onChange={(e) => setNewUser({ ...newUser, is_banned: e.target.checked })}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_banned" className="ml-2 text-sm text-gray-700">
                      Banned
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateUserModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Group Modal */}
        {showCreateGroupModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Create New Group</h2>
                <button 
                  onClick={() => setShowCreateGroupModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter group name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter group description"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateGroupModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Group'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Member Modal */}
        {showAddMemberModal && selectedGroup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Add Member to {selectedGroup.name}</h2>
                <button 
                  onClick={() => {
                    setShowAddMemberModal(false)
                    setSelectedUser(null)
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select User *
                  </label>
                  <select
                    value={selectedUser?.id || ''}
                    onChange={(e) => {
                      const userId = parseInt(e.target.value)
                      const user = allUsers.find(u => u.id === userId)
                      setSelectedUser(user || null)
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a user...</option>
                    {allUsers
                      .filter(user => !groupMembers.find(m => m.user_id === user.id))
                      .map(user => (
                        <option key={user.id} value={user.id}>
                          {user.username} ({user.email})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    value={selectedMemberRole}
                    onChange={(e) => setSelectedMemberRole(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddMemberModal(false)
                      setSelectedUser(null)
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddMember}
                    disabled={loading || !selectedUser}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add Member'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Meeting Modal */}
        {showCreateMeetingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Create New Meeting</h2>
                <button 
                  onClick={() => setShowCreateMeetingModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleCreateMeeting} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newMeeting.title}
                    onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter meeting title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newMeeting.description}
                    onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter meeting description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Type
                  </label>
                  <select
                    value={newMeeting.meeting_type}
                    onChange={(e) => setNewMeeting({ ...newMeeting, meeting_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="meeting">Meeting</option>
                    <option value="presentation">Presentation</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateMeetingModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Meeting'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Participant Modal */}
        {showAddParticipantModal && selectedMeeting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Add Participant to {selectedMeeting.title}</h2>
                <button 
                  onClick={() => {
                    setShowAddParticipantModal(false)
                    setSelectedUser(null)
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select User *
                  </label>
                  <select
                    value={selectedUser?.id || ''}
                    onChange={(e) => {
                      const userId = parseInt(e.target.value)
                      const user = allUsers.find(u => u.id === userId)
                      setSelectedUser(user || null)
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a user...</option>
                    {allUsers
                      .filter(user => !meetingParticipants.find(p => p.user_id === user.id))
                      .map(user => (
                        <option key={user.id} value={user.id}>
                          {user.username} ({user.email})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    value={selectedParticipantRole}
                    onChange={(e) => setSelectedParticipantRole(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="participant">Participant</option>
                    <option value="host">Host</option>
                    <option value="presenter">Presenter</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddParticipantModal(false)
                      setSelectedUser(null)
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddParticipant}
                    disabled={loading || !selectedUser}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add Participant'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Edit User</h2>
                <button 
                  onClick={() => {
                    setShowEditUserModal(false)
                    setSelectedUser(null)
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleSaveUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedUser.username}
                    onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={selectedUser.email}
                    onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password (leave blank to keep current)
                  </label>
                  <input
                    type="password"
                    value={selectedUser.password || ''}
                    onChange={(e) => setSelectedUser({ ...selectedUser, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedUser.is_admin || false}
                        onChange={(e) => setSelectedUser({ ...selectedUser, is_admin: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Admin</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedUser.is_banned || false}
                        onChange={(e) => setSelectedUser({ ...selectedUser, is_banned: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Banned</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditUserModal(false)
                      setSelectedUser(null)
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
