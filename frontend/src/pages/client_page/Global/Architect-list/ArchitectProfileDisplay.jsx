import React, { createContext, useContext, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchArchitects,
  fetchArchitectProfile,
  fetchServiceOptions,
  fetchGlobalOptions,
  setFilters,
  resetFilters,
  setCurrentPage,
  clearSelectedArchitect,
  selectArchitects,
  selectSelectedArchitect,
  selectPagination,
  selectFilters,
  selectServiceOptions,
  selectGlobalOptions,
  selectLoading,
  selectErrors,
} from "../../../../redux/slices/architectSlice";
import {
  Search,
  Filter,
  MapPin,
  Star,
  Calendar,
  Award,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Navigation Context
const NavigationContext = createContext();

const NavigationProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState("list"); // 'list' | 'detail'
  const [selectedArchitectId, setSelectedArchitectId] = useState(null);

  const navigateToList = () => {
    setCurrentView("list");
    setSelectedArchitectId(null);
  };

  const navigateToDetail = (architectId) => {
    setSelectedArchitectId(architectId);
    setCurrentView("detail");
  };

  return (
    <NavigationContext.Provider
      value={{
        currentView,
        selectedArchitectId,
        navigateToList,
        navigateToDetail,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within NavigationProvider");
  }
  return context;
};

// Filter Component
const ArchitectFilters = () => {
  const dispatch = useDispatch();
  const filters = useSelector(selectFilters);
  const serviceOptions = useSelector(selectServiceOptions);
  const globalOptions = useSelector(selectGlobalOptions);
  const loading = useSelector(selectLoading);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchServiceOptions());
    dispatch(fetchGlobalOptions());
  }, [dispatch]);

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value, page: 1 }));
  };

  const handleArrayFilterChange = (key, value, checked) => {
    const currentArray = filters[key] || [];
    const newArray = checked
      ? [...currentArray, value]
      : currentArray.filter((item) => item !== value);
    handleFilterChange(key, newArray);
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
  };

  return (
    <div className="architect-filters-container">
      {/* Search Bar */}
      <div className="architect-search-wrapper">
        <div className="architect-search-glass">
          <Search className="architect-search-icon" size={20} />
          <input
            type="text"
            placeholder="Rechercher un architecte..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="architect-search-input"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="architect-filter-toggle"
        >
          <Filter size={20} />
          Filtres
        </motion.button>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="architect-filter-panel"
          >
            <div className="architect-filter-grid">
              {/* Location Filter */}
              <div className="architect-filter-group">
                <label className="architect-filter-label">Localisation</label>
                <input
                  type="text"
                  placeholder="Ville, région..."
                  value={filters.location}
                  onChange={(e) =>
                    handleFilterChange("location", e.target.value)
                  }
                  className="architect-filter-input"
                />
              </div>

              {/* Specialization Filter */}
              <div className="architect-filter-group">
                <label className="architect-filter-label">Spécialisation</label>
                <select
                  value={filters.specialty}
                  onChange={(e) =>
                    handleFilterChange("specialty", e.target.value)
                  }
                  className="architect-filter-select"
                >
                  <option value="">Toutes spécialisations</option>
                  <option value="residential">Résidentiel</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industriel</option>
                  <option value="landscape">Paysagisme</option>
                </select>
              </div>

              {/* Budget Range */}
              <div className="architect-filter-group">
                <label className="architect-filter-label">Budget (€)</label>
                <div className="architect-budget-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minBudget}
                    onChange={(e) =>
                      handleFilterChange("minBudget", e.target.value)
                    }
                    className="architect-filter-input architect-budget-input"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxBudget}
                    onChange={(e) =>
                      handleFilterChange("maxBudget", e.target.value)
                    }
                    className="architect-filter-input architect-budget-input"
                  />
                </div>
              </div>

              {/* Experience Years */}
              <div className="architect-filter-group">
                <label className="architect-filter-label">Expérience</label>
                <select
                  value={filters.experienceYears}
                  onChange={(e) =>
                    handleFilterChange("experienceYears", e.target.value)
                  }
                  className="architect-filter-select"
                >
                  <option value="">Toute expérience</option>
                  <option value="1-3">1-3 ans</option>
                  <option value="4-7">4-7 ans</option>
                  <option value="8-15">8-15 ans</option>
                  <option value="15+">15+ ans</option>
                </select>
              </div>

              {/* Services Filter */}
              {serviceOptions.categories.length > 0 && (
                <div className="architect-filter-group architect-services-filter">
                  <label className="architect-filter-label">Services</label>
                  <div className="architect-checkbox-grid">
                    {serviceOptions.categories.map((category) => (
                      <label
                        key={category._id}
                        className="architect-checkbox-label"
                      >
                        <input
                          type="checkbox"
                          checked={filters.services.includes(category._id)}
                          onChange={(e) =>
                            handleArrayFilterChange(
                              "services",
                              category._id,
                              e.target.checked
                            )
                          }
                          className="architect-checkbox"
                        />
                        <span className="architect-checkbox-text">
                          {category.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="architect-filter-actions">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleResetFilters}
                className="architect-reset-filters"
              >
                Réinitialiser
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .architect-filters-container {
          margin-bottom: 2rem;
        }

        .architect-search-wrapper {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .architect-search-glass {
          flex: 1;
          position: relative;
          backdrop-filter: blur(20px);
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .architect-search-icon {
          color: rgba(255, 255, 255, 0.7);
        }

        .architect-search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: white;
          font-size: 1rem;
        }

        .architect-search-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .architect-filter-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .architect-filter-toggle:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .architect-filter-panel {
          backdrop-filter: blur(20px);
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 1.5rem;
          margin-top: 1rem;
        }

        .architect-filter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .architect-filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .architect-filter-label {
          color: rgba(255, 255, 255, 0.9);
          font-weight: 600;
          font-size: 0.875rem;
        }

        .architect-filter-input,
        .architect-filter-select {
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          outline: none;
          transition: all 0.3s ease;
        }

        .architect-filter-input:focus,
        .architect-filter-select:focus {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.4);
        }

        .architect-filter-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .architect-budget-inputs {
          display: flex;
          gap: 0.5rem;
        }

        .architect-budget-input {
          flex: 1;
        }

        .architect-services-filter {
          grid-column: 1 / -1;
        }

        .architect-checkbox-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.75rem;
        }

        .architect-checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.8);
          cursor: pointer;
        }

        .architect-checkbox {
          width: 1rem;
          height: 1rem;
        }

        .architect-filter-actions {
          margin-top: 1.5rem;
          display: flex;
          justify-content: flex-end;
        }

        .architect-reset-filters {
          padding: 0.75rem 1.5rem;
          background: rgba(255, 87, 87, 0.2);
          border: 1px solid rgba(255, 87, 87, 0.3);
          border-radius: 8px;
          color: #ff5757;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .architect-reset-filters:hover {
          background: rgba(255, 87, 87, 0.3);
        }
      `}</style>
    </div>
  );
};

// Architect Card Component
const ArchitectCard = ({ architect }) => {
  const { navigateToDetail } = useNavigation();

  const handleViewProfile = () => {
    navigateToDetail(architect._id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="architect-card-glass"
    >
      {/* Profile Image */}
      <div className="architect-card-image">
        <img
          src={architect.profilePicture || "/api/placeholder/150/150"}
          alt={`${architect.firstName} ${architect.lastName}`}
          className="architect-profile-img"
        />
        <div className="architect-card-overlay">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleViewProfile}
            className="architect-view-btn"
          >
            <Eye size={20} />
          </motion.button>
        </div>
      </div>

      {/* Card Content */}
      <div className="architect-card-content">
        <h3 className="architect-card-name">
          {architect.firstName} {architect.lastName}
        </h3>

        <div className="architect-card-specialty">
          {architect.specialty || "Architecte"}
        </div>

        <div className="architect-card-location">
          <MapPin size={16} />
          <span>{architect.location?.city || "Non spécifié"}</span>
        </div>

        <div className="architect-card-rating">
          <div className="architect-rating-stars">
            <Star size={16} fill="currentColor" />
            <span>{architect.rating?.average?.toFixed(1) || "N/A"}</span>
          </div>
          <span className="architect-rating-count">
            ({architect.rating?.count || 0} avis)
          </span>
        </div>

        <div className="architect-card-experience">
          <Calendar size={16} />
          <span>{architect.experienceYears || 0} ans d'expérience</span>
        </div>

        {architect.certifications?.length > 0 && (
          <div className="architect-card-certified">
            <Award size={16} />
            <span>Certifié</span>
          </div>
        )}

        <div className="architect-card-services">
          {architect.services?.slice(0, 3).map((service, index) => (
            <span key={index} className="architect-service-tag">
              {service.name}
            </span>
          ))}
          {architect.services?.length > 3 && (
            <span className="architect-service-more">
              +{architect.services.length - 3}
            </span>
          )}
        </div>
      </div>

      <style jsx>{`
        .architect-card-glass {
          backdrop-filter: blur(20px);
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 1.5rem;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .architect-card-image {
          position: relative;
          margin-bottom: 1rem;
        }

        .architect-profile-img {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .architect-card-overlay {
          position: absolute;
          top: 0;
          right: 0;
        }

        .architect-view-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(59, 130, 246, 0.8);
          border: none;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .architect-view-btn:hover {
          background: rgba(59, 130, 246, 1);
        }

        .architect-card-content {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .architect-card-name {
          color: white;
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0;
        }

        .architect-card-specialty {
          color: rgba(59, 130, 246, 0.9);
          font-weight: 600;
          font-size: 0.875rem;
        }

        .architect-card-location,
        .architect-card-rating,
        .architect-card-experience,
        .architect-card-certified {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.875rem;
        }

        .architect-rating-stars {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #fbbf24;
        }

        .architect-rating-count {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.75rem;
        }

        .architect-card-certified {
          color: #10b981;
        }

        .architect-card-services {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .architect-service-tag {
          padding: 0.25rem 0.75rem;
          background: rgba(59, 130, 246, 0.2);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 12px;
          color: rgba(59, 130, 246, 0.9);
          font-size: 0.75rem;
          font-weight: 500;
        }

        .architect-service-more {
          padding: 0.25rem 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.75rem;
        }
      `}</style>
    </motion.div>
  );
};

// Architects List Component
const ArchitectsList = () => {
  const dispatch = useDispatch();
  const architects = useSelector(selectArchitects);
  const pagination = useSelector(selectPagination);
  const filters = useSelector(selectFilters);
  const loading = useSelector(selectLoading);
  const errors = useSelector(selectErrors);

  useEffect(() => {
    dispatch(fetchArchitects(filters));
  }, [dispatch, filters]);

  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
  };

  if (loading.architects) {
    return (
      <div className="architect-loading">
        <div className="architect-loading-spinner"></div>
        <p>Chargement des architectes...</p>
      </div>
    );
  }

  if (errors.architects) {
    return (
      <div className="architect-error">
        <p>Erreur: {errors.architects}</p>
      </div>
    );
  }

  return (
    <div className="architects-list-container">
      <div className="architects-list-header">
        <h2 className="architects-list-title">
          Architectes disponibles ({pagination?.total || 0}){" "}
        </h2>
      </div>

      <div className="architects-grid">
        <AnimatePresence>
          {(architects || []).map((architect, index) => (
            <motion.div
              key={architect._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <ArchitectCard architect={architect} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {(!architects || architects.length === 0) && (
        <div className="architect-empty-state">
          <p>Aucun architecte trouvé avec ces critères.</p>
        </div>
      )}

      {/* Pagination */}
      {pagination?.pages > 1 && (
        <div className="architect-pagination">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={pagination?.current <= 1}
            onClick={() => handlePageChange(pagination?.current - 1)}
            className="architect-pagination-btn"
          >
            <ChevronLeft size={20} />
          </motion.button>

          <div className="architect-pagination-info">
            Page {pagination?.current || 1} sur {pagination?.pages || 1}{" "}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={pagination?.current >= pagination?.pages}
            onClick={() => handlePageChange(pagination?.current + 1)}
            className="architect-pagination-btn"
          >
            <ChevronRight size={20} />
          </motion.button>
        </div>
      )}

      <style jsx>{`
        .architects-list-container {
          padding: 2rem 0;
        }

        .architects-list-header {
          margin-bottom: 2rem;
        }

        .architects-list-title {
          color: white;
          font-size: 2rem;
          font-weight: 700;
          margin: 0;
        }

        .architects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .architect-loading,
        .architect-error,
        .architect-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
          color: rgba(255, 255, 255, 0.8);
        }

        .architect-loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.2);
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          animation: architect-spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes architect-spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .architect-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .architect-pagination-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .architect-pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .architect-pagination-btn:not(:disabled):hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .architect-pagination-info {
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

// Architect Detail Component
const ArchitectDetail = () => {
  const dispatch = useDispatch();
  const { selectedArchitectId, navigateToList } = useNavigation();
  const selectedArchitect = useSelector(selectSelectedArchitect);
  const loading = useSelector(selectLoading);
  const errors = useSelector(selectErrors);

  useEffect(() => {
    if (selectedArchitectId) {
      dispatch(fetchArchitectProfile(selectedArchitectId));
    }
  }, [dispatch, selectedArchitectId]);

  useEffect(() => {
    return () => {
      dispatch(clearSelectedArchitect());
    };
  }, [dispatch]);

  if (loading.selectedArchitect) {
    return (
      <div className="architect-detail-loading">
        <div className="architect-loading-spinner"></div>
        <p>Chargement du profil...</p>
      </div>
    );
  }

  if (errors.selectedArchitect) {
    return (
      <div className="architect-detail-error">
        <p>Erreur: {errors.selectedArchitect}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={navigateToList}
          className="architect-back-btn"
        >
          Retour à la liste
        </motion.button>
      </div>
    );
  }

  if (!selectedArchitect) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="architect-detail-container"
    >
      {/* Header */}
      <div className="architect-detail-header">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={navigateToList}
          className="architect-back-btn"
        >
          <ChevronLeft size={20} />
          Retour
        </motion.button>
      </div>

      {/* Profile Section */}
      <div className="architect-detail-profile">
        <div className="architect-detail-glass">
          <div className="architect-profile-section">
            <div className="architect-profile-image-large">
              <img
                src={
                  selectedArchitect.profilePicture || "/api/placeholder/150/150"
                }
                alt={`${selectedArchitect.firstName} ${selectedArchitect.lastName}`}
                className="architect-profile-img-large"
              />
            </div>

            <div className="architect-profile-info">
              <h1 className="architect-detail-name">
                {selectedArchitect.firstName} {selectedArchitect.lastName}
              </h1>

              <div className="architect-detail-specialty">
                {selectedArchitect.specialty || "Architecte"}
              </div>

              <div className="architect-detail-meta">
                <div className="architect-meta-item">
                  <MapPin size={18} />
                  <span>
                    {selectedArchitect.location?.city || "Non spécifié"}
                  </span>
                </div>

                <div className="architect-meta-item">
                  <Star size={18} fill="currentColor" />
                  <span>
                    {selectedArchitect.rating?.average?.toFixed(1) || "N/A"}
                  </span>
                  <span className="architect-rating-count">
                    ({selectedArchitect.rating?.count || 0} avis)
                  </span>
                </div>

                <div className="architect-meta-item">
                  <Calendar size={18} />
                  <span>
                    {selectedArchitect.experienceYears || 0} ans d'expérience
                  </span>
                </div>

                {selectedArchitect.certifications?.length > 0 && (
                  <div className="architect-meta-item architect-certified">
                    <Award size={18} />
                    <span>Architecte certifié</span>
                  </div>
                )}
              </div>

              {selectedArchitect.bio && (
                <div className="architect-bio">
                  <h3>À propos</h3>
                  <p>{selectedArchitect.bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      {selectedArchitect.services?.length > 0 && (
        <div className="architect-detail-section">
          <div className="architect-detail-glass">
            <h3 className="architect-section-title">Services proposés</h3>
            <div className="architect-services-grid">
              {selectedArchitect.services.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="architect-service-card"
                >
                  <h4>{service.name}</h4>
                  {service.description && <p>{service.description}</p>}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Section */}
      {selectedArchitect.portfolio?.length > 0 && (
        <div className="architect-detail-section">
          <div className="architect-detail-glass">
            <h3 className="architect-section-title">Portfolio</h3>
            <div className="architect-portfolio-grid">
              {selectedArchitect.portfolio.map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="architect-portfolio-item"
                >
                  <img
                    src={image.url || "/api/placeholder/300/200"}
                    alt={`Portfolio ${index + 1}`}
                    className="architect-portfolio-image"
                  />
                  {image.title && (
                    <div className="architect-portfolio-overlay">
                      <h4>{image.title}</h4>
                      {image.description && <p>{image.description}</p>}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Certifications Section */}
      {selectedArchitect.certifications?.length > 0 && (
        <div className="architect-detail-section">
          <div className="architect-detail-glass">
            <h3 className="architect-section-title">Certifications</h3>
            <div className="architect-certifications-grid">
              {selectedArchitect.certifications.map((cert, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="architect-certification-item"
                >
                  <Award size={24} />
                  <div className="architect-cert-info">
                    <h4>{cert.name}</h4>
                    {cert.issuer && (
                      <p className="architect-cert-issuer">{cert.issuer}</p>
                    )}
                    {cert.date && (
                      <p className="architect-cert-date">
                        {new Date(cert.date).getFullYear()}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Contact Section */}
      <div className="architect-detail-section">
        <div className="architect-detail-glass">
          <h3 className="architect-section-title">Contact</h3>
          <div className="architect-contact-info">
            {selectedArchitect.email && (
              <div className="architect-contact-item">
                <span className="architect-contact-label">Email:</span>
                <span className="architect-contact-value">
                  {selectedArchitect.email}
                </span>
              </div>
            )}
            {selectedArchitect.phone && (
              <div className="architect-contact-item">
                <span className="architect-contact-label">Téléphone:</span>
                <span className="architect-contact-value">
                  {selectedArchitect.phone}
                </span>
              </div>
            )}
            {selectedArchitect.website && (
              <div className="architect-contact-item">
                <span className="architect-contact-label">Site web:</span>
                <a
                  href={selectedArchitect.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="architect-contact-link"
                >
                  {selectedArchitect.website}
                </a>
              </div>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="architect-contact-btn"
          >
            Contacter cet architecte
          </motion.button>
        </div>
      </div>

      <style jsx>{`
        .architect-detail-container {
          padding: 2rem 0;
          max-width: 1200px;
          margin: 0 auto;
        }

        .architect-detail-header {
          margin-bottom: 2rem;
        }

        .architect-back-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .architect-back-btn:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .architect-detail-glass {
          backdrop-filter: blur(20px);
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 2rem;
        }

        .architect-detail-profile {
          margin-bottom: 2rem;
        }

        .architect-profile-section {
          display: flex;
          gap: 2rem;
          align-items: flex-start;
        }

        .architect-profile-image-large {
          flex-shrink: 0;
        }

        .architect-profile-img-large {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid rgba(255, 255, 255, 0.3);
        }

        .architect-profile-info {
          flex: 1;
        }

        .architect-detail-name {
          color: white;
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
        }

        .architect-detail-specialty {
          color: rgba(59, 130, 246, 0.9);
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }

        .architect-detail-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .architect-meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .architect-meta-item:has(.architect-rating-count) {
          color: #fbbf24;
        }

        .architect-rating-count {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.875rem;
          margin-left: 0.25rem;
        }

        .architect-certified {
          color: #10b981 !important;
        }

        .architect-bio {
          margin-top: 2rem;
        }

        .architect-bio h3 {
          color: white;
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0 0 1rem 0;
        }

        .architect-bio p {
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.6;
          margin: 0;
        }

        .architect-detail-section {
          margin-bottom: 2rem;
        }

        .architect-section-title {
          color: white;
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0 0 1.5rem 0;
        }

        .architect-services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
        }

        .architect-service-card {
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .architect-service-card:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .architect-service-card h4 {
          color: white;
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
        }

        .architect-service-card p {
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
          line-height: 1.5;
        }

        .architect-portfolio-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .architect-portfolio-item {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
        }

        .architect-portfolio-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
          transition: all 0.3s ease;
        }

        .architect-portfolio-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
          padding: 2rem 1.5rem 1.5rem;
          color: white;
        }

        .architect-portfolio-overlay h4 {
          margin: 0 0 0.5rem 0;
          font-weight: 600;
        }

        .architect-portfolio-overlay p {
          margin: 0;
          font-size: 0.875rem;
          opacity: 0.9;
        }

        .architect-certifications-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .architect-certification-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #10b981;
        }

        .architect-cert-info h4 {
          color: white;
          font-weight: 600;
          margin: 0 0 0.25rem 0;
        }

        .architect-cert-issuer {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.875rem;
          margin: 0;
        }

        .architect-cert-date {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.75rem;
          margin: 0.25rem 0 0 0;
        }

        .architect-contact-info {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .architect-contact-item {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .architect-contact-label {
          color: rgba(255, 255, 255, 0.7);
          font-weight: 500;
          min-width: 100px;
        }

        .architect-contact-value {
          color: white;
        }

        .architect-contact-link {
          color: #3b82f6;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .architect-contact-link:hover {
          color: #60a5fa;
          text-decoration: underline;
        }

        .architect-contact-btn {
          width: 100%;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 1.125rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .architect-contact-btn:hover {
          background: linear-gradient(135deg, #2563eb, #1e40af);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
        }

        .architect-detail-loading,
        .architect-detail-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
          color: rgba(255, 255, 255, 0.8);
        }

        @media (max-width: 768px) {
          .architect-profile-section {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .architect-detail-name {
            font-size: 2rem;
          }

          .architect-detail-meta {
            justify-content: center;
          }

          .architect-portfolio-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </motion.div>
  );
};

// Main Component
const ArchitectProfileSystem = () => {
  const { currentView } = useNavigation();

  return (
    <div className="architect-system-container">
      <div className="architect-system-background">
        <div className="architect-gradient-orb architect-orb-1"></div>
        <div className="architect-gradient-orb architect-orb-2"></div>
        <div className="architect-gradient-orb architect-orb-3"></div>
      </div>

      <div className="architect-system-content">
        <AnimatePresence mode="wait">
          {currentView === "list" ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ArchitectFilters />
              <ArchitectsList />
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ArchitectDetail />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .architect-system-container {
          min-height: 100vh;
          position: relative;
          background: linear-gradient(
            135deg,
            #0f172a 0%,
            #1e293b 50%,
            #334155 100%
          );
          overflow-x: hidden;
        }

        .architect-system-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .architect-gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.3;
          animation: architect-float 6s ease-in-out infinite;
        }

        .architect-orb-1 {
          width: 400px;
          height: 400px;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          top: -200px;
          left: -200px;
          animation-delay: 0s;
        }

        .architect-orb-2 {
          width: 300px;
          height: 300px;
          background: linear-gradient(45deg, #06b6d4, #3b82f6);
          top: 50%;
          right: -150px;
          animation-delay: 2s;
        }

        .architect-orb-3 {
          width: 500px;
          height: 500px;
          background: linear-gradient(45deg, #8b5cf6, #ec4899);
          bottom: -250px;
          left: 50%;
          transform: translateX(-50%);
          animation-delay: 4s;
        }

        @keyframes architect-float {
          0%,
          100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.05);
          }
        }

        .architect-system-content {
          position: relative;
          z-index: 1;
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        @media (max-width: 768px) {
          .architect-system-content {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

// Export the main component wrapped with NavigationProvider
export default function App() {
  return (
    <NavigationProvider>
      <ArchitectProfileSystem />
    </NavigationProvider>
  );
}
