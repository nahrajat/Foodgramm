import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/auth-shared.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FoodPartnerRegister = () => {

  const navigate = useNavigate();
  
  const handleSubmit = (e) => { 
    e.preventDefault();

    const businessName = e.target.businessName.value;
    const contactName = e.target.contactName.value;
    const phone = e.target.phone.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const address = e.target.address.value;
    const restaurantName = e.target.restaurantName.value;
    const profilePhoto = e.target.profilePhoto.files?.[0];

    const formData = new FormData();
    formData.append('name', businessName);
    formData.append('contactName', contactName);
    formData.append('phone', phone);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('address', address);
    formData.append('restaurantName', restaurantName);

    if (profilePhoto) {
      formData.append('profilePhoto', profilePhoto);
    }

    axios.post("/api/auth/food-partner/register", formData, { withCredentials: true }) // Added withCredentials for cookie handling
      .then(response => {
        console.log(response.data);
        navigate("/homepage"); // Redirect to reel feed after successful registration
      })
      .catch(error => {
        // Prefer server-provided message, fall back to generic error
        const msg = error?.response?.data?.message || error?.message || 'Registration failed';
        console.warn('Registration warning:', msg, error);
      });
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card" role="region" aria-labelledby="partner-register-title">
        <header>
          <h1 id="partner-register-title" className="auth-title">Partner sign up</h1>
          <p className="auth-subtitle">Grow your business with our platform.</p>
        </header>
        <nav className="auth-alt-action" style={{marginTop: '-4px'}}>
          <strong style={{fontWeight:600}}>Switch:</strong> <Link to="/user/register">User</Link> • <Link to="/food-partner/register">Food partner</Link>
        </nav>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="field-group">
            <label htmlFor="businessName">Business Name</label>
            <input id="businessName" name="businessName" placeholder="Tasty Bites" autoComplete="organization" />
          </div>
          <div className="two-col">
            <div className="field-group">
              <label htmlFor="contactName">Contact Name</label>
              <input id="contactName" name="contactName" placeholder="Jane Doe" autoComplete="name" />
            </div>
            <div className="field-group">
              <label htmlFor="phone">Phone</label>
              <input id="phone" name="phone" placeholder="+1 555 123 4567" autoComplete="tel" />
            </div>
          </div>
            <div className="field-group">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" placeholder="business@example.com" autoComplete="email" />
            </div>
          <div className="field-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="Create password" autoComplete="new-password" />
          </div>
          <div className="field-group">
            <label htmlFor="address">Address</label>
            <input id="address" name="address" placeholder="123 Market Street" autoComplete="street-address" />
            <p className="small-note">Full address helps customers find you faster.</p>
          </div>
          <div className="field-group">
            <label htmlFor="restaurantName">Restaurant Name</label>
            <input id="restaurantName" name="restaurantName" placeholder="Tasty Bites Downtown" />
          </div>
          <div className="field-group">
            <label htmlFor="profilePhoto">Profile Photo (Optional)</label>
            <input id="profilePhoto" name="profilePhoto" type="file" accept="image/*" />
          </div>
          <button className="auth-submit" type="submit">Create Partner Account</button>
        </form>
        <div className="auth-alt-action">
          Already a partner? <Link to="/food-partner/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default FoodPartnerRegister;