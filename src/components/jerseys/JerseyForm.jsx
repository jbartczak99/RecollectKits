import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PhotoIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { usePublicJerseys } from '../../hooks/useJerseys'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { supabase } from '../../lib/supabase'

export default function JerseyForm({ onSuccess, onCancel }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addPublicJersey } = usePublicJerseys()
  const [loading, setLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [frontImageFile, setFrontImageFile] = useState(null)
  const [backImageFile, setBackImageFile] = useState(null)
  const [frontImagePreview, setFrontImagePreview] = useState(null)
  const [backImagePreview, setBackImagePreview] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})
  const [formData, setFormData] = useState({
    team_name: '',
    season_year: '',
    jersey_type: 'home',
    manufacturer: 'Adidas',
    main_sponsor: '',
    additional_sponsors: '',
    primary_color: '',
    secondary_color: '',
    description: '',
    front_image_url: '',
    back_image_url: '',
    player_name: ''
  })

  const uploadImage = async (file, imageType = 'front') => {
    if (!user) {
      throw new Error('User must be authenticated to upload images')
    }

    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const fileName = `${user.id}/${timestamp}-${imageType}.${fileExt}`
    const filePath = fileName

    setUploadProgress(`Uploading ${imageType} image...`)

    const { data, error } = await supabase.storage
      .from('jersey-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw new Error(`Upload failed for ${imageType} image: ${error.message}`)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('jersey-images')
      .getPublicUrl(filePath)

    return urlData.publicUrl
  }

  const validateForm = () => {
    const errors = {}
    
    // Required field validation
    if (!formData.team_name.trim()) {
      errors.team_name = 'Team name is required'
    }
    
    if (!formData.season_year.trim()) {
      errors.season_year = 'Season year is required'
    }
    
    if (!formData.jersey_type) {
      errors.jersey_type = 'Jersey type is required'
    }
    
    // Image validation
    if (!frontImageFile && !backImageFile) {
      errors.images = 'At least one image (front or back) is required'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setValidationErrors({})

    // Validate form
    if (!validateForm()) {
      return
    }

    // Check user authentication
    if (!user) {
      setError('You must be signed in to submit a kit')
      return
    }

    setLoading(true)
    setUploadProgress('Preparing submission...')

    try {
      let frontImageUrl = null
      let backImageUrl = null

      // Upload images if files are selected
      if (frontImageFile || backImageFile) {
        setUploadingImages(true)
        
        if (frontImageFile) {
          frontImageUrl = await uploadImage(frontImageFile, 'front')
        }
        
        if (backImageFile) {
          backImageUrl = await uploadImage(backImageFile, 'back')
        }
        
        setUploadingImages(false)
        setUploadProgress('Saving jersey data...')
      }

      // Process additional sponsors into array
      let additionalSponsorsArray = null
      if (formData.additional_sponsors?.trim()) {
        additionalSponsorsArray = formData.additional_sponsors
          .split(',')
          .map(sponsor => sponsor.trim())
          .filter(sponsor => sponsor.length > 0)
      }

      // Prepare jersey data for database
      const jerseyData = {
        team_name: formData.team_name.trim(),
        season: formData.season_year.trim(),
        jersey_type: formData.jersey_type,
        manufacturer: formData.manufacturer,
        player_name: formData.player_name?.trim() || null,
        description: formData.description?.trim() || null,
        main_sponsor: formData.main_sponsor?.trim() || null,
        additional_sponsors: additionalSponsorsArray,
        primary_color: formData.primary_color?.trim() || null,
        secondary_color: formData.secondary_color?.trim() || null,
        front_image_url: frontImageUrl,
        back_image_url: backImageUrl,
        created_by: user.id,
        created_at: new Date().toISOString()
      }

      // Insert into database
      const { data, error } = await supabase
        .from('public_jerseys')
        .insert(jerseyData)
        .select()
        .single()

      if (error) {
        throw new Error(`Database error: ${error.message}`)
      }

      // Success state
      setSuccess(true)
      setUploadProgress('Kit submitted successfully!')
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/jerseys')
      }, 2000)

    } catch (err) {
      console.error('Submission error:', err)
      setError(err.message || 'An unexpected error occurred')
      setLoading(false)
      setUploadingImages(false)
      setUploadProgress('')
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleImageChange = (e, imageType) => {
    console.log('handleImageChange called with imageType:', imageType)
    const file = e.target.files[0]
    console.log('Selected file:', file)
    
    if (file) {
      console.log('File details:', {
        name: file.name,
        type: file.type,
        size: file.size
      })
      
      // Validate file type - only allow specific image formats
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        console.error('Invalid file type:', file.type)
        setError(`Please select a valid image file for ${imageType} (JPEG, PNG, GIF, or WebP only)`)
        e.target.value = '' // Clear the input
        return
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        console.error('File too large:', file.size)
        setError(`${imageType} image file size must be less than 10MB`)
        e.target.value = '' // Clear the input
        return
      }

      console.log('File validation passed, processing imageType:', imageType)
      
      // Set the appropriate file and preview based on type
      if (imageType === 'front') {
        console.log('Setting front image file')
        setFrontImageFile(file)
        
        // Create preview
        const reader = new FileReader()
        reader.onload = (event) => {
          console.log('Front image FileReader loaded')
          setFrontImagePreview(event.target.result)
        }
        reader.onerror = (error) => {
          console.error('FileReader error:', error)
        }
        reader.readAsDataURL(file)
      } else if (imageType === 'back') {
        console.log('Setting back image file')
        setBackImageFile(file)
        
        // Create preview
        const reader = new FileReader()
        reader.onload = (event) => {
          console.log('Back image FileReader loaded')
          setBackImagePreview(event.target.result)
        }
        reader.onerror = (error) => {
          console.error('FileReader error:', error)
        }
        reader.readAsDataURL(file)
      }
      
      setError('') // Clear any previous errors
    } else {
      console.log('No file selected')
    }
  }

  const removeImage = (imageType) => {
    if (imageType === 'front') {
      setFrontImageFile(null)
      setFrontImagePreview(null)
      // Clear file input
      const fileInput = document.getElementById('front_jersey_image')
      if (fileInput) fileInput.value = ''
    } else if (imageType === 'back') {
      setBackImageFile(null)
      setBackImagePreview(null)
      // Clear file input
      const fileInput = document.getElementById('back_jersey_image')
      if (fileInput) fileInput.value = ''
    }
  }

  // Success state
  if (success) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <CheckCircleIcon className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Kit Submitted Successfully!</h2>
          <p className="text-gray-600 text-lg mb-6">
            Your kit has been added to the database and is now available for other collectors to view.
          </p>
          <div className="animate-pulse text-sm text-gray-500">
            Redirecting to Kits page...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Kit</h2>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-lg shadow-sm">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}
      
      {uploadProgress && (uploadingImages || loading) && (
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-700 rounded-lg shadow-sm">
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {uploadProgress}
          </div>
        </div>
      )}
      
      {validationErrors.images && (
        <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 rounded-lg shadow-sm">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {validationErrors.images}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="team_name" className="block text-sm font-medium text-gray-700 mb-1">
              Team Name *
            </label>
            <input
              type="text"
              id="team_name"
              name="team_name"
              value={formData.team_name}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                validationErrors.team_name 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
              }`}
              placeholder="Arsenal FC"
            />
            {validationErrors.team_name && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.team_name}</p>
            )}
          </div>

          <div>
            <label htmlFor="season_year" className="block text-sm font-medium text-gray-700 mb-1">
              Season Year *
            </label>
            <input
              type="text"
              id="season_year"
              name="season_year"
              value={formData.season_year}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                validationErrors.season_year 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
              }`}
              placeholder="2023-24"
            />
            {validationErrors.season_year && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.season_year}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="player_name" className="block text-sm font-medium text-gray-700 mb-1">
            Player Name (Optional)
          </label>
          <input
            type="text"
            id="player_name"
            name="player_name"
            value={formData.player_name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Bukayo Saka"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="jersey_type" className="block text-sm font-medium text-gray-700 mb-1">
              Kit Type *
            </label>
            <select
              id="jersey_type"
              name="jersey_type"
              value={formData.jersey_type}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                validationErrors.jersey_type 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
              }`}
            >
              <option value="home">Home</option>
              <option value="away">Away</option>
              <option value="third">Third</option>
              <option value="special">Special</option>
            </select>
            {validationErrors.jersey_type && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.jersey_type}</p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Additional details about this kit..."
              />
            </div>

            <div>
              <label htmlFor="main_sponsor" className="block text-sm font-medium text-gray-700 mb-1">
                Main Sponsor
              </label>
              <input
                type="text"
                id="main_sponsor"
                name="main_sponsor"
                value={formData.main_sponsor}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Emirates"
              />
            </div>

            <div>
              <label htmlFor="additional_sponsors" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Sponsors
              </label>
              <input
                type="text"
                id="additional_sponsors"
                name="additional_sponsors"
                value={formData.additional_sponsors}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Visit Rwanda, Mastercard, etc."
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700 mb-1">
            Manufacturer
          </label>
          <select
            id="manufacturer"
            name="manufacturer"
            value={formData.manufacturer}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="Adidas">Adidas</option>
            <option value="Joma">Joma</option>
            <option value="New Balance">New Balance</option>
            <option value="Nike">Nike</option>
            <option value="Puma">Puma</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="primary_color" className="block text-sm font-medium text-gray-700 mb-1">
              Primary Color
            </label>
            <input
              type="text"
              id="primary_color"
              name="primary_color"
              value={formData.primary_color}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Red"
            />
          </div>

          <div>
            <label htmlFor="secondary_color" className="block text-sm font-medium text-gray-700 mb-1">
              Secondary Color
            </label>
            <input
              type="text"
              id="secondary_color"
              name="secondary_color"
              value={formData.secondary_color}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="White"
            />
          </div>
        </div>

        {/* Image Upload Sections */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-4">
            Kit Images
          </label>
          
          <div className="flex gap-6">
            {/* Front of Kit Upload */}
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700 mb-3 text-center">Front of Kit</div>
              
              {!frontImagePreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors" style={{height: '200px'}}>
                  <input
                    type="file"
                    id="front_jersey_image"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={(e) => handleImageChange(e, 'front')}
                    className="hidden"
                  />
                  <label
                    htmlFor="front_jersey_image"
                    className="cursor-pointer flex flex-col items-center justify-center h-full"
                  >
                    <PhotoIcon className="h-10 w-10 text-gray-400 mb-3" />
                    <span className="text-sm font-medium text-gray-600">Upload Front View</span>
                    <span className="text-xs text-gray-500 mt-1">JPEG, PNG, GIF, WebP</span>
                    <span className="text-xs text-gray-500">up to 10MB</span>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={frontImagePreview}
                    alt="Front of kit preview"
                    className="w-full object-cover rounded-lg border border-gray-300"
                    style={{height: '200px'}}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage('front')}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm font-medium">
                    Front
                  </div>
                </div>
              )}
              
              {frontImageFile && (
                <div className="mt-2 text-sm text-gray-600 text-center">
                  <div className="font-medium truncate">{frontImageFile.name}</div>
                  <div className="text-xs text-gray-500">({(frontImageFile.size / 1024 / 1024).toFixed(1)}MB)</div>
                </div>
              )}
            </div>

            {/* Back of Kit Upload */}
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700 mb-3 text-center">Back of Kit</div>
              
              {!backImagePreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors" style={{height: '200px'}}>
                  <input
                    type="file"
                    id="back_jersey_image"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={(e) => handleImageChange(e, 'back')}
                    className="hidden"
                  />
                  <label
                    htmlFor="back_jersey_image"
                    className="cursor-pointer flex flex-col items-center justify-center h-full"
                  >
                    <PhotoIcon className="h-10 w-10 text-gray-400 mb-3" />
                    <span className="text-sm font-medium text-gray-600">Upload Back View</span>
                    <span className="text-xs text-gray-500 mt-1">JPEG, PNG, GIF, WebP</span>
                    <span className="text-xs text-gray-500">up to 10MB</span>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={backImagePreview}
                    alt="Back of kit preview"
                    className="w-full object-cover rounded-lg border border-gray-300"
                    style={{height: '200px'}}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage('back')}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm font-medium">
                    Back
                  </div>
                </div>
              )}
              
              {backImageFile && (
                <div className="mt-2 text-sm text-gray-600 text-center">
                  <div className="font-medium truncate">{backImageFile.name}</div>
                  <div className="text-xs text-gray-500">({(backImageFile.size / 1024 / 1024).toFixed(1)}MB)</div>
                </div>
              )}
            </div>
          </div>
        </div>


        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading || uploadingImages}
            className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
          >
            {uploadingImages ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading Images...
              </span>
            ) : loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding Kit...
              </span>
            ) : (
              'Add Kit'
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading || uploadingImages}
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}