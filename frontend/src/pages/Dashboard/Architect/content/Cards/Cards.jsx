import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./cards.css";
import Card from "../Card/Card";
import {
  fetchArchitectStats,
  selectClientGrowthStats,
  selectActiveProjectsStats,
  selectProfileViewsStats,
  selectStatsLoading,
  selectStatsError,
} from "../../../../../redux/slices/statSlice";
import LoadingSpinner from "./LoadingSpinner"; // You may need to create this component

const Cards = () => {
  const dispatch = useDispatch();
  const [expandedCard, setExpandedCard] = useState(null);

  // Get current user ID from auth state
  const currentUser = useSelector((state) => state.auth.user); // Adjust based on your auth slice
  const architectId = currentUser?._id;

  // Select stats from redux store
  const clientGrowth = useSelector(selectClientGrowthStats);
  const activeProjects = useSelector(selectActiveProjectsStats);
  const profileViews = useSelector(selectProfileViewsStats);
  const isLoading = useSelector(selectStatsLoading);
  const error = useSelector(selectStatsError);

  useEffect(() => {
    if (architectId) {
      dispatch(fetchArchitectStats(architectId));
    }
  }, [dispatch, architectId]);

  const handleCardClick = (title) => {
    setExpandedCard((prev) => (prev === title ? null : title));
  };

  // Define card colors
  const cardColors = {
    clients: {
      backGround: "linear-gradient(180deg, #bb67ff 0%, #c484f3 100%)",
      boxShadow: "0px 10px 20px 0px #e0c6f5",
    },
    projects: {
      backGround: "linear-gradient(180deg, #FF919D 0%, #FC929D 100%)",
      boxShadow: "0px 10px 20px 0px #FDC0C7",
    },
    views: {
      backGround:
        "linear-gradient(rgb(248, 212, 154) -146.42%, rgb(255 202 113) -46.42%)",
      boxShadow: "0px 10px 20px 0px #F9D59B",
    },
  };

  // Prepare card data based on API response
  const cardsData = [
    {
      title: "Client Growth",
      color: cardColors.clients,
      barValue: clientGrowth.percentageChange || 0,
      value: clientGrowth.currentMonthCount || 0,
      series: [
        {
          name: "Clients",
          data:
            clientGrowth.monthlyData?.map((item) => item.count) ||
            Array(12).fill(0),
        },
      ],
    },
    {
      title: "Active Projects",
      color: cardColors.projects,
      barValue: activeProjects.percentageChange || 0,
      value: activeProjects.currentMonthCount || 0,
      series: [
        {
          name: "Projects",
          data:
            activeProjects.monthlyData?.map((item) => item.count) ||
            Array(12).fill(0),
        },
      ],
    },
    {
      title: "Profile Views",
      color: cardColors.views,
      barValue: profileViews.percentageChange || 0,
      value: profileViews.currentMonthCount || 0,
      series: [
        {
          name: "Views",
          data:
            profileViews.monthlyData?.map((item) => item.count) ||
            Array(12).fill(0),
        },
      ],
    },
  ];

  if (isLoading) {
    return (
      <div className="Cards">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="Cards error-message">
        Error loading statistics: {error}
      </div>
    );
  }

  return (
    <div className="Cards">
      {cardsData.map((card, id) => (
        <div className="parentContainer" key={id}>
          <Card
            title={card.title}
            color={card.color}
            barValue={card.barValue}
            value={card.value}
            series={card.series}
            isExpanded={expandedCard === card.title}
            onCardClick={() => handleCardClick(card.title)}
            timeFrame="Monthly"
          />
        </div>
      ))}
    </div>
  );
};

export default Cards;
