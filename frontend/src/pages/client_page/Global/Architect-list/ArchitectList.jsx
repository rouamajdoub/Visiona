import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { debounce } from "lodash";
import { useArchitect } from "./ArchitectContext";
import {
  fetchArchitects,
  updateSearchFilters,
  resetSearchFilters,
  selectArchitects,
  selectArchitectsPagination,
  selectArchitectsFilters,
  selectSearchFilters,
  selectLoadingStates,
  selectErrorStates,
  addArchitectToFavorites,
  removeArchitectFromFavorites,
} from "../../../../redux/slices/findArchitectSlice";
import "./ArchitectList.css";
import { Footer } from "../../components/Footer/Footer";

const ArchitectList = () => {
  const dispatch = useDispatch();
  const { showArchitectProfile } = useArchitect();
  const architects = useSelector(selectArchitects);
  const pagination = useSelector(selectArchitectsPagination);
  const filters = useSelector(selectArchitectsFilters);
  const searchFilters = useSelector(selectSearchFilters);
  const loading = useSelector(selectLoadingStates);
  const error = useSelector(selectErrorStates);

  const [showFilters, setShowFilters] = useState(false);
  const [localSearchValue, setLocalSearchValue] = useState(
    searchFilters.search
  );

  // Debounced search function
  const debouncedSearch = React.useMemo(
    () =>
      debounce((searchTerm) => {
        dispatch(updateSearchFilters({ search: searchTerm, page: 1 }));
      }, 500),
    [dispatch]
  );

  // Effect for non-search filters (immediate fetch)
  useEffect(() => {
    dispatch(fetchArchitects(searchFilters));
  }, [
    dispatch,
    searchFilters,
    searchFilters.page,
    searchFilters.specialization,
    searchFilters.location,
    searchFilters.experienceYears,
    searchFilters.rating,
    searchFilters.sortBy,
    searchFilters.sortOrder,
  ]);

  // Effect for search filter (debounced fetch)
  useEffect(() => {
    if (searchFilters.search !== localSearchValue) {
      dispatch(fetchArchitects(searchFilters));
    }
  }, [dispatch, searchFilters, localSearchValue]);

  // Handle search input change
  const handleSearchChange = useCallback(
    (e) => {
      const value = e.target.value;
      setLocalSearchValue(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const handleFilterChange = (key, value) => {
    dispatch(updateSearchFilters({ [key]: value, page: 1 }));
  };

  const handlePageChange = (page) => {
    dispatch(updateSearchFilters({ page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResetFilters = () => {
    dispatch(resetSearchFilters());
    setLocalSearchValue("");
  };

  const handleFavoriteToggle = async (architect) => {
    try {
      if (architect.isFavorite) {
        await dispatch(removeArchitectFromFavorites(architect._id)).unwrap();
      } else {
        await dispatch(
          addArchitectToFavorites({ architectId: architect._id })
        ).unwrap();
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleArchitectSelect = (architectId) => {
    showArchitectProfile(architectId);
  };

  // Format services for better display
  const formatServices = (services) => {
    if (!services || !Array.isArray(services)) return [];

    // Clean up service names and make them more readable
    return services.map((service) => {
      if (typeof service === "string") {
        // Convert codes like "m1", "s3" to readable names
        const serviceMap = {
          m1: "Modern Architecture",
          m2: "Minimalist Design",
          s1: "Sustainable Design",
          s2: "Smart Homes",
          s3: "Structural Engineering",
          service1: "Residential Design",
          service2: "Commercial Design",
          service3: "Interior Design",
          // Add more mappings as needed
        };

        return (
          serviceMap[service.toLowerCase()] ||
          service.charAt(0).toUpperCase() +
            service.slice(1).replace(/([A-Z])/g, " $1")
        );
      }
      return service;
    });
  };

  const renderPagination = () => {
    if (pagination.pages <= 1) return null;

    const pages = [];
    const currentPage = pagination.current;
    const totalPages = pagination.pages;
    const delta = 2;

    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          className="arch-list-pagination-btn arch-list-pagination-nav"
          onClick={() => handlePageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="15,18 9,12 15,6"></polyline>
          </svg>
          Previous
        </button>
      );
    }

    if (currentPage > delta + 1) {
      pages.push(
        <button
          key={1}
          className="arch-list-pagination-btn"
          onClick={() => handlePageChange(1)}
        >
          1
        </button>
      );
      if (currentPage > delta + 2) {
        pages.push(
          <span key="ellipsis1" className="arch-list-pagination-ellipsis">
            ...
          </span>
        );
      }
    }

    for (
      let i = Math.max(1, currentPage - delta);
      i <= Math.min(totalPages, currentPage + delta);
      i++
    ) {
      pages.push(
        <button
          key={i}
          className={`arch-list-pagination-btn ${
            i === currentPage ? "arch-list-pagination-active" : ""
          }`}
          onClick={() => handlePageChange(i)}
          aria-label={`Page ${i}`}
          aria-current={i === currentPage ? "page" : undefined}
        >
          {i}
        </button>
      );
    }

    if (currentPage < totalPages - delta) {
      if (currentPage < totalPages - delta - 1) {
        pages.push(
          <span key="ellipsis2" className="arch-list-pagination-ellipsis">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          className="arch-list-pagination-btn"
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          className="arch-list-pagination-btn arch-list-pagination-nav"
          onClick={() => handlePageChange(currentPage + 1)}
          aria-label="Next page"
        >
          Next
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </button>
      );
    }

    return (
      <nav className="arch-list-pagination" aria-label="Pagination Navigation">
        {pages}
      </nav>
    );
  };

  const LoadingSkeleton = () => (
    <div className="arch-list-grid">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="arch-list-card arch-list-card-skeleton">
          <div className="arch-list-card-image arch-skeleton-image"></div>
          <div className="arch-list-card-content">
            <div className="arch-skeleton-line arch-skeleton-line-title"></div>
            <div className="arch-skeleton-line arch-skeleton-line-subtitle"></div>
            <div className="arch-skeleton-line arch-skeleton-line-text"></div>
            <div className="arch-skeleton-services">
              <div className="arch-skeleton-service-tag"></div>
              <div className="arch-skeleton-service-tag"></div>
              <div className="arch-skeleton-service-tag"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="arch-list-container">
      {/* Hero Header */}
      <div className="arch-list-hero">
        <div className="arch-list-hero-content">
          <h1 className="arch-list-hero-title">
            Find Your Perfect Architect
            <span className="arch-list-hero-accent">✨</span>
          </h1>
          <p className="arch-list-hero-subtitle">
            Discover talented architects who bring your vision to life
          </p>
        </div>
        <button
          className="arch-list-filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
          aria-expanded={showFilters}
          aria-controls="architect-filters"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"></polygon>
          </svg>
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {/* Enhanced Filters */}
      {showFilters && (
        <div id="architect-filters" className="arch-list-filters">
          <div className="arch-list-filters-header">
            <h3>Refine Your Search</h3>
            <button
              className="arch-list-filter-close"
              onClick={() => setShowFilters(false)}
            >
              ×
            </button>
          </div>

          <form className="arch-list-filter-form">
            {/* Enhanced Search */}
            <div className="arch-list-filter-group arch-list-filter-search">
              <label className="arch-list-filter-label" htmlFor="search-input">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="21 21l-4.35-4.35"></path>
                </svg>
                Search Architects
              </label>
              <input
                id="search-input"
                type="text"
                className="arch-list-filter-input"
                placeholder="Search by name, specialization..."
                value={localSearchValue}
                onChange={handleSearchChange}
              />
            </div>

            {/* Specialization */}
            <div className="arch-list-filter-group">
              <label
                className="arch-list-filter-label"
                htmlFor="specialization-select"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21,15 16,10 5,21"></polyline>
                </svg>
                Specialization
              </label>
              <select
                id="specialization-select"
                className="arch-list-filter-select"
                value={searchFilters.specialization || ""}
                onChange={(e) =>
                  handleFilterChange("specialization", e.target.value || null)
                }
              >
                <option value="">All Specializations</option>
                {filters.specializations?.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="arch-list-filter-group">
              <label
                className="arch-list-filter-label"
                htmlFor="location-input"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                Location
              </label>
              <input
                id="location-input"
                type="text"
                className="arch-list-filter-input"
                placeholder="City or Governorate"
                value={searchFilters.location}
                onChange={(e) => handleFilterChange("location", e.target.value)}
              />
            </div>

            {/* Experience Years */}
            <div className="arch-list-filter-group">
              <label
                className="arch-list-filter-label"
                htmlFor="experience-input"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
                Min Experience (Years)
              </label>
              <input
                id="experience-input"
                type="number"
                className="arch-list-filter-input"
                min="0"
                max="50"
                placeholder="e.g. 5"
                value={searchFilters.experienceYears || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "experienceYears",
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
              />
            </div>

            {/* Rating */}
            <div className="arch-list-filter-group">
              <label className="arch-list-filter-label" htmlFor="rating-select">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
                </svg>
                Min Rating
              </label>
              <select
                id="rating-select"
                className="arch-list-filter-select"
                value={searchFilters.rating || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "rating",
                    e.target.value ? parseFloat(e.target.value) : null
                  )
                }
              >
                <option value="">Any Rating</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="arch-list-filter-group">
              <label
                className="arch-list-filter-label"
                htmlFor="sort-by-select"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 6h18M7 12h10m-7 6h4"></path>
                </svg>
                Sort By
              </label>
              <select
                id="sort-by-select"
                className="arch-list-filter-select"
                value={searchFilters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              >
                <option value="rating.average">Rating</option>
                <option value="experienceYears">Experience</option>
                <option value="createdAt">Recently Joined</option>
                <option value="name">Name</option>
              </select>
            </div>

            {/* Filter Actions */}
            <div className="arch-list-filter-actions">
              <button
                type="button"
                className="arch-list-filter-btn arch-list-filter-btn-reset"
                onClick={handleResetFilters}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5h5"></path>
                </svg>
                Reset All
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Results Info */}
      <div className="arch-list-results-info">
        <div className="arch-list-results-content">
          <p className="arch-list-results-text">
            {loading.architects
              ? "Searching for architects..."
              : `${pagination.total} architect${
                  pagination.total !== 1 ? "s" : ""
                } found`}
          </p>
          {!loading.architects && pagination.total > 0 && (
            <p className="arch-list-results-page">
              Showing page {pagination.current} of {pagination.pages}
            </p>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error.architects && (
        <div className="arch-list-error" role="alert">
          <div className="arch-list-error-icon">⚠️</div>
          <div className="arch-list-error-content">
            <p className="arch-list-error-text">{error.architects}</p>
            <button
              className="arch-list-retry-btn"
              onClick={() => dispatch(fetchArchitects(searchFilters))}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5M21 21v-5h-5"></path>
              </svg>
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Architects Grid */}
      {loading.architects ? (
        <LoadingSkeleton />
      ) : architects.length === 0 ? (
        <div className="arch-list-empty">
          <div className="arch-list-empty-icon">🏗️</div>
          <h3 className="arch-list-empty-title">No architects found</h3>
          <p className="arch-list-empty-text">
            Try adjusting your search criteria or browse all architects.
          </p>
          <button
            className="arch-list-empty-reset-btn"
            onClick={handleResetFilters}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="arch-list-grid">
          {architects.map((architect) => (
            <div key={architect._id} className="arch-list-card">
              {/* Profile Image */}
              <div className="arch-list-card-image">
                <img
                  src={architect.profilePicture || "/default-avatar.png"}
                  alt={`${architect.name}'s profile`}
                  className="arch-list-card-img"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = "/default-avatar.png";
                  }}
                />
                <div className="arch-list-card-overlay">
                  <button
                    className={`arch-list-favorite-btn ${
                      architect.isFavorite ? "arch-list-favorite-active" : ""
                    }`}
                    onClick={() => handleFavoriteToggle(architect)}
                    disabled={
                      loading.addingFavorite || loading.removingFavorite
                    }
                    aria-label={
                      architect.isFavorite
                        ? `Remove ${architect.name} from favorites`
                        : `Add ${architect.name} to favorites`
                    }
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill={architect.isFavorite ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>
                </div>
                {architect.isOnline && (
                  <div className="arch-list-online-badge">Online</div>
                )}
              </div>

              {/* Card Content */}
              <div className="arch-list-card-content">
                <div className="arch-list-card-header">
                  <h3 className="arch-list-card-name">{architect.name}</h3>
                  <p className="arch-list-card-specialization">
                    {architect.specialization}
                  </p>
                </div>

                {/* Rating */}
                {architect.rating && (
                  <div className="arch-list-card-rating">
                    <div className="arch-list-rating-stars">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`arch-list-star ${
                            i < Math.floor(architect.rating.average)
                              ? "filled"
                              : ""
                          }`}
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
                        </svg>
                      ))}
                    </div>
                    <span className="arch-list-rating-text">
                      {architect.rating.average.toFixed(1)} (
                      {architect.rating.count})
                    </span>
                  </div>
                )}

                {/* Info Grid */}
                <div className="arch-list-card-info">
                  <div className="arch-list-info-item">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>
                      {architect.location?.city},{" "}
                      {architect.location?.governorate}
                    </span>
                  </div>

                  <div className="arch-list-info-item">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                    </svg>
                    <span>
                      {architect.experienceYears} year
                      {architect.experienceYears !== 1 ? "s" : ""} exp.
                    </span>
                  </div>
                </div>

                {/* Services */}
                {architect.services && architect.services.length > 0 && (
                  <div className="arch-list-card-services">
                    <div className="arch-list-services-label">Services:</div>
                    <div className="arch-list-services-tags">
                      {formatServices(architect.services)
                        .slice(0, 2)
                        .map((service, index) => (
                          <span key={index} className="arch-list-service-tag">
                            {service}
                          </span>
                        ))}
                      {architect.services.length > 2 && (
                        <span className="arch-list-service-more">
                          +{architect.services.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* View Profile Button */}
                <button
                  className="arch-list-view-profile-btn"
                  onClick={() => handleArchitectSelect(architect._id)}
                >
                  <span>View Profile</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {renderPagination()}
      <Footer />
    </div>
  );
};

export default ArchitectList;
