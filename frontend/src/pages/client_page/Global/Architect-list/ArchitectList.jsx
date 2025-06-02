import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { debounce } from "lodash";
import { useArchitect } from "./ArchitectContext"; // Update path accordingly
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

const ArchitectList = () => {
  const dispatch = useDispatch();
  const { showArchitectProfile } = useArchitect(); // Get the function from context
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

  // Handle architect selection - use context function
  const handleArchitectSelect = (architectId) => {
    showArchitectProfile(architectId);
  };

  // ... rest of your existing code (renderPagination, LoadingSkeleton, etc.) ...

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
          className="arch-list-pagination-btn"
          onClick={() => handlePageChange(currentPage - 1)}
          aria-label="Previous page"
        >
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
          className="arch-list-pagination-btn"
          onClick={() => handlePageChange(currentPage + 1)}
          aria-label="Next page"
        >
          Next
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
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="arch-list-container">
      {/* Header */}
      <div className="arch-list-header">
        <h1 className="arch-list-title">Find Architects</h1>
        <button
          className="arch-list-filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
          aria-expanded={showFilters}
          aria-controls="architect-filters"
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div id="architect-filters" className="arch-list-filters">
          <form className="arch-list-filter-form">
            {/* Search */}
            <div className="arch-list-filter-group">
              <label className="arch-list-filter-label" htmlFor="search-input">
                Search
              </label>
              <input
                id="search-input"
                type="text"
                className="arch-list-filter-input"
                placeholder="Search architects..."
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
                Min Experience (Years)
              </label>
              <input
                id="experience-input"
                type="number"
                className="arch-list-filter-input"
                min="0"
                max="50"
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

            {/* Sort Order */}
            <div className="arch-list-filter-group">
              <label
                className="arch-list-filter-label"
                htmlFor="sort-order-select"
              >
                Order
              </label>
              <select
                id="sort-order-select"
                className="arch-list-filter-select"
                value={searchFilters.sortOrder}
                onChange={(e) =>
                  handleFilterChange("sortOrder", e.target.value)
                }
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>

            {/* Filter Actions */}
            <div className="arch-list-filter-actions">
              <button
                type="button"
                className="arch-list-filter-btn arch-list-filter-btn-secondary"
                onClick={handleResetFilters}
              >
                Reset Filters
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Results Info */}
      <div className="arch-list-results-info">
        <p className="arch-list-results-text">
          {loading.architects
            ? "Loading..."
            : `${pagination.total} architect${
                pagination.total !== 1 ? "s" : ""
              } found`}
        </p>
      </div>

      {/* Error Message */}
      {error.architects && (
        <div className="arch-list-error" role="alert">
          <p className="arch-list-error-text">{error.architects}</p>
          <button
            className="arch-list-retry-btn"
            onClick={() => dispatch(fetchArchitects(searchFilters))}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Architects Grid */}
      {loading.architects ? (
        <LoadingSkeleton />
      ) : architects.length === 0 ? (
        <div className="arch-list-empty">
          <div className="arch-list-empty-icon">🔍</div>
          <p className="arch-list-empty-text">
            No architects found matching your criteria.
          </p>
          <button
            className="arch-list-empty-reset-btn"
            onClick={handleResetFilters}
          >
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
                <button
                  className={`arch-list-favorite-btn ${
                    architect.isFavorite ? "arch-list-favorite-active" : ""
                  }`}
                  onClick={() => handleFavoriteToggle(architect)}
                  disabled={loading.addingFavorite || loading.removingFavorite}
                  aria-label={
                    architect.isFavorite
                      ? `Remove ${architect.name} from favorites`
                      : `Add ${architect.name} to favorites`
                  }
                >
                  {architect.isFavorite ? "♥" : "♡"}
                </button>
              </div>

              {/* Card Content */}
              <div className="arch-list-card-content">
                <h3 className="arch-list-card-name">{architect.name}</h3>
                <p className="arch-list-card-specialization">
                  {architect.specialization}
                </p>

                {/* Rating */}
                {architect.rating && (
                  <div className="arch-list-card-rating">
                    <span
                      className="arch-list-rating-stars"
                      aria-label={`${architect.rating.average} out of 5 stars`}
                    >
                      {"★".repeat(Math.floor(architect.rating.average))}
                      {"☆".repeat(5 - Math.floor(architect.rating.average))}
                    </span>
                    <span className="arch-list-rating-text">
                      {architect.rating.average.toFixed(1)} (
                      {architect.rating.count} review
                      {architect.rating.count !== 1 ? "s" : ""})
                    </span>
                  </div>
                )}

                {/* Location */}
                <p className="arch-list-card-location">
                  📍 {architect.location?.city},{" "}
                  {architect.location?.governorate}
                </p>

                {/* Experience */}
                <p className="arch-list-card-experience">
                  {architect.experienceYears} year
                  {architect.experienceYears !== 1 ? "s" : ""} experience
                </p>

                {/* Services */}
                {architect.services && architect.services.length > 0 && (
                  <div className="arch-list-card-services">
                    {architect.services.slice(0, 3).map((service, index) => (
                      <span key={index} className="arch-list-service-tag">
                        {service}
                      </span>
                    ))}
                    {architect.services.length > 3 && (
                      <span className="arch-list-service-more">
                        +{architect.services.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* View Profile Button - Updated to use context */}
                <button
                  className="arch-list-view-profile-btn"
                  onClick={() => handleArchitectSelect(architect._id)}
                >
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
};
export default ArchitectList;
