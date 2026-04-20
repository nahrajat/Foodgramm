import React, { useEffect, useState } from 'react'
import api from '../../services/api.js'

const UserProfile = () => {
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [editName, setEditName] = useState('')
  const [editUsername, setEditUsername] = useState('')
  const [editPhotoFile, setEditPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [removePhoto, setRemovePhoto] = useState(false)

  useEffect(() => {
    let isMounted = true

    api.get('auth/user/me')
      .then((response) => {
        if (!isMounted) return
        const user = response?.data?.user || null
        setProfile(user)
        setEditName(user?.name || '')
        setEditUsername(user?.username || '')
        setPhotoPreview(user?.profilePhoto || '')
      })
      .catch((err) => {
        if (!isMounted) return
        const message = err?.response?.data?.message || 'Unable to load user profile.'
        setError(message)
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    return () => {
      if (photoPreview && photoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview)
      }
    }
  }, [photoPreview])

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0]
    setRemovePhoto(false)

    if (!file) {
      setEditPhotoFile(null)
      setPhotoPreview(profile?.profilePhoto || '')
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.')
      return
    }

    setError('')
    setEditPhotoFile(file)
    const objectUrl = URL.createObjectURL(file)
    setPhotoPreview(objectUrl)
  }

  const handleSave = async (event) => {
    event.preventDefault()

    try {
      const formData = new FormData()
      formData.append('name', editName)
      formData.append('username', editUsername)

      if (editPhotoFile) {
        formData.append('profilePhoto', editPhotoFile)
      }

      if (removePhoto) {
        formData.append('removeProfilePhoto', 'true')
      }

      const response = await api.put('auth/user/me', formData)
      const updatedUser = response?.data?.user
      setProfile(updatedUser)
      setEditName(updatedUser?.name || '')
      setEditUsername(updatedUser?.username || '')
      setEditPhotoFile(null)
      setPhotoPreview(updatedUser?.profilePhoto || '')
      setRemovePhoto(false)
      setStatus('Profile updated successfully.')
      setError('')
      window.dispatchEvent(new CustomEvent('foodgram:profile-updated', { detail: updatedUser }))
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to update profile.')
      setStatus('')
    }
  }

  return (
    <main style={{ maxWidth: '760px', margin: '80px auto 24px', padding: '0 16px' }}>
      <section style={{ border: '1px solid rgba(148,163,184,.45)', borderRadius: '14px', background: 'rgba(15,23,42,.62)', color: '#e2e8f0', padding: '22px' }}>
        <h1 style={{ margin: '0 0 14px' }}>User Profile</h1>

        {error && <p style={{ color: '#fca5a5', margin: 0 }}>{error}</p>}
        {status && <p style={{ color: '#86efac', margin: '8px 0 0' }}>{status}</p>}

        {profile && (
          <form onSubmit={handleSave} style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'grid', gap: '10px' }}>
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt={`${profile.name} profile`}
                  style={{ width: '96px', height: '96px', borderRadius: '999px', objectFit: 'cover', border: '1px solid rgba(148,163,184,.45)' }}
                />
              ) : (
                <div style={{ width: '96px', height: '96px', borderRadius: '999px', display: 'grid', placeItems: 'center', background: 'rgba(148,163,184,.12)', border: '1px solid rgba(148,163,184,.45)', color: '#cbd5e1' }}>
                  No photo
                </div>
              )}

              <label style={{ display: 'grid', gap: '6px' }}>
                <span>Full name</span>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(148,163,184,.45)', background: 'rgba(15,23,42,.45)', color: '#e2e8f0' }} />
              </label>

              <label style={{ display: 'grid', gap: '6px' }}>
                <span>Username</span>
                <input value={editUsername} onChange={(e) => setEditUsername(e.target.value)} style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(148,163,184,.45)', background: 'rgba(15,23,42,.45)', color: '#e2e8f0' }} />
              </label>

              <p style={{ margin: 0 }}><strong>Email:</strong> {profile.email}</p>

              <label style={{ display: 'grid', gap: '6px' }}>
                <span>Profile photo (optional)</span>
                <input type="file" accept="image/*" onChange={handlePhotoChange} />
              </label>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={removePhoto}
                  onChange={(e) => {
                    setRemovePhoto(e.target.checked)
                    if (e.target.checked) {
                      setEditPhotoFile(null)
                      setPhotoPreview('')
                    } else {
                      setPhotoPreview(profile?.profilePhoto || '')
                    }
                  }}
                />
                Remove current photo
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button type="submit" style={{ padding: '10px 14px', borderRadius: '999px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
                Save changes
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  )
}

export default UserProfile
