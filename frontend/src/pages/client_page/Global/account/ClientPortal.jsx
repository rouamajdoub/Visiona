import { useState } from "react";
import logo from "../../img/logo.png"; // Import your logo image here
import "./client-portal.css"; // Import your CSS styles here
import { Footer } from "../../components/Footer/Footer";
// Main App Component
export default function ClientPortal() {
  const [activeTab, setActiveTab] = useState("profile");

  // Render the active component based on the selected tab
  const renderComponent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileComponent />;
      case "notifications":
        return <NotificationComponent />;
      case "favorites":
        return <FavoriteComponent />;
      case "issues":
        return <IssuesComponent />;
      default:
        return <ProfileComponent />;
    }
  };

  return (
    <div className="app-wrapper">
      <div className="app-container">
        {/* Navigation Bar */}
        <nav className="navbar">
          <div className="container navbar-inner">
            <div className="logo">
              <img src={logo} alt="Client Portal Logo" />
            </div>
            <div className="nav-buttons">
              <NavButton
                label="Profile"
                active={activeTab === "profile"}
                onClick={() => setActiveTab("profile")}
              />
              <NavButton
                label="Notifications"
                active={activeTab === "notifications"}
                onClick={() => setActiveTab("notifications")}
              />
              <NavButton
                label="Favorites"
                active={activeTab === "favorites"}
                onClick={() => setActiveTab("favorites")}
              />
              <NavButton
                label="Issues"
                active={activeTab === "issues"}
                onClick={() => setActiveTab("issues")}
              />
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="main-content">
          <div className="container">{renderComponent()}</div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

// Navigation Button Component
function NavButton({ icon, label, active, onClick }) {
  return (
    <button
      className={`nav-button ${active ? "active" : ""}`}
      onClick={onClick}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

// Notification Component
function NotificationComponent() {
  const notifications = [
    {
      id: 1,
      title: "New message received",
      content: "You have a new message from Support Team",
      time: "2 hours ago",
    },
    {
      id: 2,
      title: "System update",
      content: "System will be down for maintenance on Friday",
      time: "1 day ago",
    },
    {
      id: 3,
      title: "Payment received",
      content: "Your payment for April services has been received",
      time: "3 days ago",
    },
  ];

  return (
    <div className="card card-3d">
      <h1 className="card-title">Notifications</h1>
      <div>
        {notifications.map((notification) => (
          <div key={notification.id} className="notification-item">
            <h3 className="notification-title">{notification.title}</h3>
            <p className="notification-content">{notification.content}</p>
            <span className="notification-time">{notification.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Favorite Component
function FavoriteComponent() {
  const favorites = [
    { id: 1, title: "Service 1", description: "Premium support package" },
    { id: 2, title: "Service 2", description: "Web hosting plan" },
    { id: 3, title: "Product 1", description: "Software license" },
  ];

  return (
    <div className="card card-3d">
      <h1 className="card-title">Favorites</h1>
      <div className="favorites-grid">
        {favorites.map((item) => (
          <div key={item.id} className="favorite-item">
            <h3 className="favorite-title">{item.title}</h3>
            <p className="favorite-description">{item.description}</p>
            <button className="btn btn-dark btn-3d">View Details</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Issues Component
function IssuesComponent() {
  return (
    <div className="card card-3d">
      <h1 className="card-title">Report Issues</h1>
      <form className="issues-form">
        <div className="form-group">
          <label className="form-label" htmlFor="issue-title">
            Issue Title
          </label>
          <input
            type="text"
            id="issue-title"
            className="form-control"
            placeholder="Brief description of the issue"
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="issue-details">
            Issue Details
          </label>
          <textarea
            id="issue-details"
            rows="5"
            className="form-control"
            placeholder="Provide detailed information about the issue"
          ></textarea>
        </div>
        <div className="form-group">
          <label className="form-label">Priority</label>
          <select className="form-control">
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>
        </div>
        <button type="submit" className="btn btn-dark btn-3d">
          Submit Report
        </button>
      </form>
    </div>
  );
}

// Profile Component
function ProfileComponent() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    id: "CLI-10057",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "(555) 123-4567",
    address: "123 Main St, Anytown, USA",
    profileImage: "/api/placeholder/150/150",
  });

  const [editForm, setEditForm] = useState({ ...profile });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setProfile({ ...editForm });
    setIsEditing(false);
  };

  const handleImageChange = () => {
    // In a real app, this would open a file picker
    alert("Image upload functionality would be implemented here");
  };

  return (
    <div className="card card-3d">
      <h1 className="card-title">My Profile</h1>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="profile-container">
            <div className="profile-sidebar">
              <div className="profile-image-container animate-float">
                <img
                  src={editForm.profileImage}
                  alt="Profile"
                  className="profile-image"
                />
                <button
                  type="button"
                  onClick={handleImageChange}
                  className="profile-upload-btn"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </button>
              </div>
              <div className="client-id">Client ID: {editForm.id}</div>
            </div>

            <div className="profile-details">
              <div className="profile-info-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="firstName">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={editForm.firstName}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="lastName">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={editForm.lastName}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="email">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="phone">
                    Phone
                  </label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                </div>
                <div className="form-group profile-address">
                  <label className="form-label" htmlFor="address">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={editForm.address}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="btn btn-outlined"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-dark btn-3d">
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-4">
          <div className="profile-container">
            <div className="profile-sidebar">
              <div className="profile-image-container animate-float">
                <img
                  src={profile.profileImage}
                  alt="Profile"
                  className="profile-image"
                />
              </div>
              <div className="client-id">Client ID: {profile.id}</div>
            </div>

            <div className="profile-details">
              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <div className="profile-info-label">First Name</div>
                  <div className="profile-info-value">{profile.firstName}</div>
                </div>
                <div className="profile-info-item">
                  <div className="profile-info-label">Last Name</div>
                  <div className="profile-info-value">{profile.lastName}</div>
                </div>
                <div className="profile-info-item">
                  <div className="profile-info-label">Email</div>
                  <div className="profile-info-value">{profile.email}</div>
                </div>
                <div className="profile-info-item">
                  <div className="profile-info-label">Phone</div>
                  <div className="profile-info-value">{profile.phone}</div>
                </div>
                <div className="profile-info-item profile-address">
                  <div className="profile-info-label">Address</div>
                  <div className="profile-info-value">{profile.address}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-dark btn-3d"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
              Edit Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
