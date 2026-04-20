import React, { useEffect, useState } from 'react'
import '../../styles/profile.css'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api.js'

const Profile = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [ profile, setProfile ] = useState(null)
    const [ videos, setVideos ] = useState([])
    const [ isOwner, setIsOwner ] = useState(false)
    const [ selectedFood, setSelectedFood ] = useState(null)
    const [ editName, setEditName ] = useState('')
    const [ editDescription, setEditDescription ] = useState('')
    const [ editRedirectLink, setEditRedirectLink ] = useState('')
    const [ editVideoFile, setEditVideoFile ] = useState(null)
    const [ editVideoPreview, setEditVideoPreview ] = useState('')
    const [ editVideoObjectUrl, setEditVideoObjectUrl ] = useState('')
    const [ statusMessage, setStatusMessage ] = useState('')
    const [ errorMessage, setErrorMessage ] = useState('')
    const [ editProfilePhotoFile, setEditProfilePhotoFile ] = useState(null)
    const [ editProfilePhotoPreview, setEditProfilePhotoPreview ] = useState('')
    const [ removeProfilePhoto, setRemoveProfilePhoto ] = useState(false)

    const getRedirectLink = (link) => {
        if (!link || typeof link !== 'string') return ''
        const trimmed = link.trim()
        if (!trimmed) return ''
        return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    }

    const openExternalLink = (link) => {
        const url = getRedirectLink(link)
        if (!url) return false
        window.open(url, '_blank', 'noopener,noreferrer')
        return true
    }

    const startEditing = (food) => {
        setSelectedFood(food)
        setEditName(food.name || '')
        setEditDescription(food.description || '')
        setEditRedirectLink(food.redirectLink || '')
        setEditVideoFile(null)
        setEditVideoPreview(food.video || '')
        setStatusMessage('')
        setErrorMessage('')
    }

    const handleEditVideoChange = (event) => {
        const file = event.target.files?.[0]
        if (!file) {
            setEditVideoFile(null)
            setEditVideoPreview(selectedFood?.video || '')
            if (editVideoObjectUrl) {
                URL.revokeObjectURL(editVideoObjectUrl)
                setEditVideoObjectUrl('')
            }
            return
        }

        if (!file.type.startsWith('video/')) {
            setErrorMessage('Please select a valid video file.')
            return
        }

        setErrorMessage('')
        setEditVideoFile(file)
        if (editVideoObjectUrl) {
            URL.revokeObjectURL(editVideoObjectUrl)
        }
        const objectUrl = URL.createObjectURL(file)
        setEditVideoObjectUrl(objectUrl)
        setEditVideoPreview(objectUrl)
    }

    const cancelEditing = () => {
        setSelectedFood(null)
        setEditName('')
        setEditDescription('')
        setEditRedirectLink('')
        setEditVideoFile(null)
        setEditVideoPreview('')
        if (editVideoObjectUrl) {
            URL.revokeObjectURL(editVideoObjectUrl)
            setEditVideoObjectUrl('')
        }
        setStatusMessage('')
        setErrorMessage('')
    }

    const handleProfilePhotoChange = (event) => {
        const file = event.target.files?.[0]
        setRemoveProfilePhoto(false)

        if (!file) {
            setEditProfilePhotoFile(null)
            setEditProfilePhotoPreview(profile?.profilePhoto || '')
            return
        }

        if (!file.type.startsWith('image/')) {
            setErrorMessage('Please select a valid image file.')
            return
        }

        setErrorMessage('')
        setEditProfilePhotoFile(file)
        const objectUrl = URL.createObjectURL(file)
        setEditProfilePhotoPreview(objectUrl)
    }

    const handleProfilePhotoSave = async (event) => {
        event.preventDefault()

        try {
            const formData = new FormData()
            if (editProfilePhotoFile) {
                formData.append('profilePhoto', editProfilePhotoFile)
            }
            if (removeProfilePhoto) {
                formData.append('removeProfilePhoto', 'true')
            }

            const response = await api.put('food-partner/me', formData)
            const updatedPartner = response?.data?.foodPartner
            setProfile((prev) => prev ? { ...prev, profilePhoto: updatedPartner?.profilePhoto || '' } : prev)
            setEditProfilePhotoFile(null)
            setEditProfilePhotoPreview(updatedPartner?.profilePhoto || '')
            setRemoveProfilePhoto(false)
            setStatusMessage('Profile photo updated successfully.')
            setErrorMessage('')
            window.dispatchEvent(new CustomEvent('foodgram:profile-updated', { detail: updatedPartner }))
        } catch (error) {
            setErrorMessage(error?.response?.data?.message || error?.message || 'Profile photo update failed')
            setStatusMessage('')
        }
    }

    const handleDelete = async (foodId) => {
        const confirmed = window.confirm('Delete this post?')
        if (!confirmed) return

        try {
            await api.delete(`food/${foodId}`)
            setVideos((prev) => prev.filter((item) => item._id !== foodId))
            if (selectedFood?._id === foodId) {
                cancelEditing()
            }
            setStatusMessage('Post deleted successfully.')
            setErrorMessage('')
        } catch (error) {
            setErrorMessage(error?.response?.data?.message || error?.message || 'Delete failed')
            setStatusMessage('')
        }
    }

    const handleUpdate = async (event) => {
        event.preventDefault()
        if (!selectedFood) return

        const formData = new FormData()
        formData.append('name', editName)
        formData.append('description', editDescription)
        formData.append('redirectLink', editRedirectLink)
        if (editVideoFile) {
            formData.append('videourl', editVideoFile)
        }

        try {
            const response = await api.put(`food/${selectedFood._id}`, formData)
            setVideos((prev) => prev.map((item) => (item._id === selectedFood._id ? response.data.food : item)))
            setSelectedFood(response.data.food)
            setEditName(response.data.food.name || '')
            setEditDescription(response.data.food.description || '')
            setEditRedirectLink(response.data.food.redirectLink || '')
            setEditVideoFile(null)
            setEditVideoPreview(response.data.food.video || '')
            if (editVideoObjectUrl) {
                URL.revokeObjectURL(editVideoObjectUrl)
                setEditVideoObjectUrl('')
            }
            setStatusMessage('Post updated successfully.')
            setErrorMessage('')
        } catch (error) {
            setErrorMessage(error?.response?.data?.message || error?.message || 'Update failed')
            setStatusMessage('')
        }
    }

    useEffect(() => {
        let isMounted = true

        api.get(`food-partner/${id}`)
            .then(response => {
                if (!isMounted) return
                setProfile(response.data.foodPartner)
                setVideos(response.data.foodPartner.foodItems)
            })

        api.get('food-partner/me')
            .then(response => {
                if (!isMounted) return
                setIsOwner(String(response.data.foodPartner._id) === String(id))
            })
            .catch(() => {
                if (!isMounted) return
                setIsOwner(false)
            })

        return () => {
            isMounted = false
        }
    }, [ id ])

    useEffect(() => {
        return () => {
            if (editVideoObjectUrl) {
                URL.revokeObjectURL(editVideoObjectUrl)
            }
            if (editProfilePhotoPreview && editProfilePhotoPreview.startsWith('blob:')) {
                URL.revokeObjectURL(editProfilePhotoPreview)
            }
        }
    }, [ editVideoObjectUrl, editProfilePhotoPreview ])


    return (
        <main className="profile-page">
            <section className="profile-header">
                <div className="profile-meta">
                    {profile?.profilePhoto ? (
                        <img className="profile-avatar" src={profile.profilePhoto} alt={`${profile?.name || 'Food partner'} profile`} />
                    ) : (
                        <div className="profile-avatar profile-avatar--fallback" aria-hidden="true">
                            {(profile?.name || 'F').slice(0, 1).toUpperCase()}
                        </div>
                    )}

                    <div className="profile-info">
                        <h1 className="profile-pill profile-business" title="Business name">
                            {profile?.name}
                        </h1>
                        <p className="profile-pill profile-address" title="Address">
                            {profile?.address}
                        </p>
                    </div>
                </div>

                <div className="profile-stats" role="list" aria-label="Stats">
                    <div className="profile-stat" role="listitem">
                        <span className="profile-stat-label">total meals</span>
                        <span className="profile-stat-value">{profile?.totalMeals}</span>
                    </div>
                    <div className="profile-stat" role="listitem">
                        <span className="profile-stat-label">customer served</span>
                        <span className="profile-stat-value">{profile?.customersServed}</span>
                    </div>
                </div>

                {isOwner && (
                    <div className="profile-owner-actions">
                        <button className="profile-primary-btn" type="button" onClick={() => navigate('/create-food')}>
                            Create new post
                        </button>
                    </div>
                )}
            </section>

            {isOwner && (
                <section className="profile-editor" aria-label="Edit profile photo">
                    <div className="profile-editor__header">
                        <h2>Edit profile photo</h2>
                    </div>

                    <form className="profile-editor__form" onSubmit={handleProfilePhotoSave}>
                        <div className="field-group">
                            <label htmlFor="partnerProfilePhoto">Profile photo (optional)</label>
                            <input id="partnerProfilePhoto" type="file" accept="image/*" onChange={handleProfilePhotoChange} />
                        </div>

                        {editProfilePhotoPreview && (
                            <div className="profile-editor__preview">
                                <img src={editProfilePhotoPreview} alt="Profile preview" style={{ display: 'block', width: '100%', maxHeight: '360px', objectFit: 'cover' }} />
                            </div>
                        )}

                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <input
                                type="checkbox"
                                checked={removeProfilePhoto}
                                onChange={(e) => {
                                    setRemoveProfilePhoto(e.target.checked)
                                    if (e.target.checked) {
                                        setEditProfilePhotoFile(null)
                                        setEditProfilePhotoPreview('')
                                    } else {
                                        setEditProfilePhotoPreview(profile?.profilePhoto || '')
                                    }
                                }}
                            />
                            Remove current photo
                        </label>

                        {errorMessage && <p className="error-text" role="alert">{errorMessage}</p>}
                        {statusMessage && <p className="success-text" role="status">{statusMessage}</p>}

                        <div className="profile-editor__actions">
                            <button className="profile-primary-btn" type="submit">Save profile photo</button>
                        </div>
                    </form>
                </section>
            )}

            <hr className="profile-sep" />

            <section className="profile-grid" aria-label="Videos">
                {videos.map((v) => (
                    <div
                        key={v._id || v.id}
                        className="profile-grid-item"
                        role={getRedirectLink(v.redirectLink) ? 'button' : undefined}
                        tabIndex={getRedirectLink(v.redirectLink) ? 0 : -1}
                        onClick={() => openExternalLink(v.redirectLink)}
                        onKeyDown={(e) => {
                            if ((e.key === 'Enter' || e.key === ' ') && openExternalLink(v.redirectLink)) {
                                e.preventDefault()
                            }
                        }}
                    >
                        <video
                            className="profile-grid-video"
                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                            src={v.video}
                            autoPlay
                            muted
                            defaultMuted
                            playsInline
                            loop
                            preload="metadata"
                        />
                        {isOwner && (
                            <div className="profile-grid-actions" onClick={(e) => e.stopPropagation()}>
                                <button type="button" className="profile-mini-btn" onClick={() => startEditing(v)}>Edit</button>
                                <button type="button" className="profile-mini-btn danger" onClick={() => handleDelete(v._id)}>Delete</button>
                            </div>
                        )}

                    </div>
                ))}
            </section>

            {isOwner && selectedFood && (
                <section className="profile-editor" aria-label="Edit post">
                    <div className="profile-editor__header">
                        <h2>Edit post</h2>
                        <button type="button" className="profile-text-btn" onClick={cancelEditing}>Cancel</button>
                    </div>

                    <form className="profile-editor__form" onSubmit={handleUpdate}>
                        <div className="field-group">
                            <label htmlFor="editName">Name</label>
                            <input id="editName" type="text" value={editName} onChange={(e) => setEditName(e.target.value)} />
                        </div>

                        <div className="field-group">
                            <label htmlFor="editDescription">Description</label>
                            <textarea id="editDescription" rows={4} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                        </div>

                        <div className="field-group">
                            <label htmlFor="editRedirectLink">Direct Link</label>
                            <input id="editRedirectLink" type="url" value={editRedirectLink} onChange={(e) => setEditRedirectLink(e.target.value)} />
                        </div>

                        <div className="field-group">
                            <label htmlFor="editVideo">Replace Video</label>
                            <input id="editVideo" type="file" accept="video/*" onChange={handleEditVideoChange} />
                        </div>

                        {editVideoPreview && (
                            <div className="profile-editor__preview">
                                <video src={editVideoPreview} controls playsInline preload="metadata" />
                            </div>
                        )}

                        {errorMessage && <p className="error-text" role="alert">{errorMessage}</p>}
                        {statusMessage && <p className="success-text" role="status">{statusMessage}</p>}

                        <div className="profile-editor__actions">
                            <button className="profile-primary-btn" type="submit">Save changes</button>
                        </div>
                    </form>
                </section>
            )}
        </main>
    )
}

export default Profile