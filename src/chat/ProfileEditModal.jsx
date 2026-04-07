import React, { useState, useRef } from 'react'
import { X, Upload, User, Edit2, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { getApiBase } from './chatConfig'

export function ProfileEditModal({ isOpen, onClose, user, onUpdate }) {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || ''
  })
  const [profilePicture, setProfilePicture] = useState(user?.profile_picture || null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)
  const [previewImage, setPreviewImage] = useState(null)

  if (!isOpen || !user) return null

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewImage(reader.result)
    }
    reader.readAsDataURL(file)

    // Upload the file
    uploadProfilePicture(file)
  }

  const uploadProfilePicture = async (file) => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await axios.post(`${getApiBase()}/profile/upload`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setProfilePicture(response.data.profile_picture)
      toast.success('Profile picture updated!')
      
      if (onUpdate) {
        onUpdate(response.data.user)
      }
    } catch (error) {
      console.error('Failed to upload profile picture:', error)
      toast.error(error.response?.data?.error || 'Failed to upload profile picture')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async () => {
    try {
      const response = await axios.put(`${getApiBase()}/profile`, formData, {
        withCredentials: true
      })

      toast.success('Profile updated successfully!')
      onUpdate(response.data.user)
      onClose()
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error(error.response?.data?.error || 'Failed to update profile')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-[#008069] px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-1"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src={previewImage || profilePicture || `https://ui-avatars.com/api/?name=${formData.username}&background=008069&color=fff`}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-[#008069] shadow-lg"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-0 right-0 bg-[#008069] hover:bg-[#006d56] text-white rounded-full p-3 shadow-lg transition-colors disabled:opacity-50"
                title="Change profile picture"
              >
                <Upload className="h-5 w-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            {isUploading && (
              <p className="text-sm text-gray-600 mt-2">Uploading...</p>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline-block h-4 w-4 mr-2" />
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008069]"
                placeholder="Enter your username"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="inline-block">📧</span> Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008069]"
                placeholder="Enter your email"
              />
            </div>

            {/* Bio / Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Edit2 className="inline-block h-4 w-4 mr-2" />
                About / Status
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={3}
                maxLength={150}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008069] resize-none"
                placeholder="Write something about yourself..."
              />
              <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/150</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-[#008069] text-white rounded-lg hover:bg-[#006d56] transition-colors flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
