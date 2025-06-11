import React, { useState } from 'react';
import './ProfileImage.css';

const ProfileImage = () => {
  const [profilePic, setProfilePic] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setProfilePic(imageURL);
    }
  };

  return (
    <div className="profile-image-wrapper">
      <label htmlFor="profile-upload">
        <div className="profile-image-circle" style={{ backgroundImage: `url(${profilePic})` }}>
          {!profilePic && <span className="placeholder">+</span>}
        </div>
      </label>
      <input
        type="file"
        id="profile-upload"
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default ProfileImage;
