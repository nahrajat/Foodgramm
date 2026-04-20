import React, { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { useLocation, useNavigate } from 'react-router-dom'
import '../styles/top-profile-menu.css'

const TopProfileMenu = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const containerRef = useRef(null)

  const [isOpen, setIsOpen] = useState(false)
  const [session, setSession] = useState({ loading: true, role: null, name: '', profileId: '', profilePhoto: '' })

  const hiddenOnPaths = useMemo(
    () => new Set(['/user/login', '/user/register', '/food-partner/login', '/food-partner/register', '/register', '/choose-register']),
    []
  )

  useEffect(() => {
    let isMounted = true

    const detectSession = async () => {
      try {
        const partnerRes = await axios.get('/api/food-partner/me', { withCredentials: true })
        if (!isMounted) return
        const partner = partnerRes?.data?.foodPartner
        setSession({
          loading: false,
          role: 'food-partner',
          name: partner?.name || 'Food Partner',
          profileId: partner?._id || '',
          profilePhoto: partner?.profilePhoto || '',
        })
        return
      } catch {
        // continue with user check
      }

      try {
        const userRes = await axios.get('/api/auth/user/me', { withCredentials: true })
        if (!isMounted) return
        const user = userRes?.data?.user
        setSession({
          loading: false,
          role: 'user',
          name: user?.name || user?.username || 'User',
          profileId: user?.id || '',
          profilePhoto: user?.profilePhoto || '',
        })
      } catch {
        if (!isMounted) return
        setSession({ loading: false, role: null, name: '', profileId: '', profilePhoto: '' })
      }
    }

    detectSession()

    return () => {
      isMounted = false
    }
  }, [location.pathname])

  useEffect(() => {
    const onProfileUpdated = (event) => {
      const updatedProfile = event?.detail
      if (!updatedProfile) return

      setSession((current) => {
        return {
          ...current,
          name: updatedProfile.name || current.name,
          profilePhoto: updatedProfile.profilePhoto || '',
        }
      })
    }

    window.addEventListener('foodgram:profile-updated', onProfileUpdated)
    return () => window.removeEventListener('foodgram:profile-updated', onProfileUpdated)
  }, [])

  useEffect(() => {
    const onDocumentClick = (event) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('click', onDocumentClick)
    return () => document.removeEventListener('click', onDocumentClick)
  }, [])

  const goToProfile = () => {
    if (session.role === 'food-partner' && session.profileId) {
      navigate(`/food-partner/${session.profileId}`)
      setIsOpen(false)
      return
    }

    if (session.role === 'user') {
      navigate('/user/profile')
      setIsOpen(false)
    }
  }

  const logout = async () => {
    try {
      if (session.role === 'food-partner') {
        await axios.get('/api/auth/food-partner/logout', { withCredentials: true })
      } else {
        await axios.get('/api/auth/user/logout', { withCredentials: true })
      }
    } catch {
      // Treat logout as best effort. We still redirect.
    }

    setIsOpen(false)
    setSession({ loading: false, role: null, name: '', profileId: '', profilePhoto: '' })
    navigate('/')
  }

  if (session.loading || !session.role || hiddenOnPaths.has(location.pathname)) {
    return null
  }

  return (
    <div className="top-profile-menu" ref={containerRef}>
      <button
        type="button"
        className="top-profile-menu__trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <span className="top-profile-menu__avatar" aria-hidden="true">
          {session.profilePhoto ? (
            <img src={session.profilePhoto} alt="" className="top-profile-menu__avatar-image" />
          ) : (
            (session.name || 'U').slice(0, 1).toUpperCase()
          )}
        </span>
        <span className="top-profile-menu__label">{session.name}</span>
      </button>

      {isOpen && (
        <div className="top-profile-menu__panel" role="menu" aria-label="Profile menu">
          <button type="button" role="menuitem" className="top-profile-menu__item" onClick={goToProfile}>
            Profile
          </button>
          <button type="button" role="menuitem" className="top-profile-menu__item danger" onClick={logout}>
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

export default TopProfileMenu
