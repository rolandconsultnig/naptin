import { useState, useEffect } from 'react'
import { 
  Image, Video, FileText, Music, Download, Trash2, 
  Upload, Grid, List, Search, X, File
} from 'lucide-react'
import axios from 'axios'
import { getApiBase } from './chatConfig'
import toast from 'react-hot-toast'

/**
 * Media Gallery Component
 * Supports:
 * - Image, video, document, and audio file viewing
 * - Thumbnail gallery
 * - Upload media
 * - Download media
 * - Delete media
 * - Search and filter
 */
export default function MediaGallery({ isOpen, onClose }) {
  const [gallery, setGallery] = useState({
    images: [],
    videos: [],
    documents: [],
    audio: []
  })
  const [selectedType, setSelectedType] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // grid or list
  const [searchQuery, setSearchQuery] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState(null)

  useEffect(() => {
    if (isOpen) {
      loadGallery()
    }
  }, [isOpen])

  const loadGallery = async () => {
    try {
      const response = await axios.get(`${getApiBase()}/media/gallery`, {
        withCredentials: true
      })
      setGallery(response.data)
    } catch (error) {
      console.error('Error loading gallery:', error)
      // Show empty state instead of error — offline or server unavailable
      setGallery({ images: [], videos: [], documents: [], audio: [] })
    }
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await axios.post(
        `${getApiBase()}/media/upload`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      toast.success('Media uploaded successfully!')
      loadGallery()
      e.target.value = '' // Reset input
    } catch (error) {
      console.error('Error uploading media:', error)
      toast.error('Failed to upload media')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownload = async (media) => {
    try {
      window.open(`${getApiBase()}/media/download/${media.id}`, '_blank')
    } catch (error) {
      console.error('Error downloading media:', error)
      toast.error('Failed to download media')
    }
  }

  const handleDelete = async (media) => {
    if (!window.confirm(`Delete ${media.file_name}?`)) return

    try {
      await axios.delete(`${getApiBase()}/media/${media.id}`, {
        withCredentials: true
      })

      toast.success('Media deleted')
      loadGallery()
    } catch (error) {
      console.error('Error deleting media:', error)
      toast.error('Failed to delete media')
    }
  }

  const getFilteredMedia = () => {
    let allMedia = []
    
    if (selectedType === 'all') {
      allMedia = [
        ...gallery.images,
        ...gallery.videos,
        ...gallery.documents,
        ...gallery.audio
      ]
    } else {
      allMedia = gallery[selectedType] || []
    }

    if (searchQuery) {
      allMedia = allMedia.filter(m => 
        m.file_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return allMedia
  }

  const getFileIcon = (media) => {
    switch (media.file_type) {
      case 'image':
        return <Image className="h-8 w-8" />
      case 'video':
        return <Video className="h-8 w-8" />
      case 'audio':
        return <Music className="h-8 w-8" />
      case 'document':
        return <FileText className="h-8 w-8" />
      default:
        return <File className="h-8 w-8" />
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const media = getFilteredMedia()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Media Gallery</h2>
          <div className="flex items-center gap-3">
            {/* Upload */}
            <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
              <input
                type="file"
                onChange={handleUpload}
                disabled={isUploading}
                className="hidden"
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.rtf"
                multiple
              />
            </label>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type Filter */}
          <div className="flex gap-2">
            {['all', 'images', 'videos', 'documents', 'audio'].map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                  selectedType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* View Mode */}
          <div className="flex gap-2 border-l border-gray-300 pl-4">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isUploading && (
            <div className="text-center py-8">
              <p className="text-gray-600">Uploading...</p>
            </div>
          )}

          {media.length === 0 ? (
            <div className="text-center py-12">
              <File className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No media files found</p>
              <p className="text-sm text-gray-500 mt-2">Upload files to get started</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {media.map(item => (
                <div
                  key={item.id}
                  className="bg-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group relative"
                  onClick={() => setSelectedMedia(item)}
                >
                  {/* Thumbnail */}
                  <div className="aspect-square flex items-center justify-center bg-gray-200">
                    {item.thumbnail_path ? (
                      <img
                        src={item.thumbnail_path}
                        alt={item.file_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-400">
                        {getFileIcon(item)}
                      </div>
                    )}
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDownload(item)
                      }}
                      className="p-2 bg-white rounded-full hover:bg-gray-100"
                      title="Download"
                    >
                      <Download className="h-5 w-5 text-gray-800" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(item)
                      }}
                      className="p-2 bg-white rounded-full hover:bg-red-100"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5 text-red-600" />
                    </button>
                  </div>

                  {/* File Info */}
                  <div className="p-2 bg-white">
                    <p className="text-xs text-gray-900 truncate" title={item.file_name}>
                      {item.file_name}
                    </p>
                    <p className="text-xs text-gray-500">{formatFileSize(item.file_size)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {media.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                    {item.thumbnail_path ? (
                      <img
                        src={item.thumbnail_path}
                        alt={item.file_name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="text-gray-400">
                        {getFileIcon(item)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{item.file_name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(item.file_size)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(item)}
                      className="p-2 hover:bg-gray-200 rounded transition-colors"
                      title="Download"
                    >
                      <Download className="h-5 w-5 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-2 hover:bg-red-100 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Media Preview Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60 p-8">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-full overflow-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{selectedMedia.file_name}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(selectedMedia)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <Download className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {selectedMedia.file_type === 'image' && selectedMedia.file_path && (
                <img
                  src={selectedMedia.file_path}
                  alt={selectedMedia.file_name}
                  className="max-w-full h-auto mx-auto"
                />
              )}
              {selectedMedia.file_type === 'video' && selectedMedia.file_path && (
                <video
                  src={selectedMedia.file_path}
                  controls
                  className="max-w-full h-auto mx-auto"
                />
              )}
              {selectedMedia.file_type === 'audio' && selectedMedia.file_path && (
                <div className="text-center py-12">
                  <Music className="h-20 w-20 mx-auto text-gray-400 mb-4" />
                  <audio src={selectedMedia.file_path} controls className="mx-auto" />
                </div>
              )}
              {(selectedMedia.file_type === 'document' || selectedMedia.file_type === 'other') && (
                <div className="text-center py-12">
                  <File className="h-20 w-20 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">{selectedMedia.file_name}</p>
                  <button
                    onClick={() => handleDownload(selectedMedia)}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Download className="h-4 w-4 inline mr-2" />
                    Download File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

