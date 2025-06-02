import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEvents } from "../../../../../redux/slices/eventSlice"; // Adjust import path
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useNavigate } from "react-router-dom";
import "./CalenderS.css";

// Define colors for different event types (you can customize these)
const getEventColor = (event) => {
  // You can customize this logic based on your event properties
  if (event.type) {
    const eventColors = {
      meeting: "#3b82f6", // blue
      projectStart: "#10b981", // green
      projectDeadline: "#ef4444", // red
      reminder: "#f59e0b", // orange
      default: "#6b7280", // gray
    };
    return eventColors[event.type] || eventColors.default;
  }

  // Default color if no type is specified
  return "#3b82f6";
};

const CalenderS = () => {
  const dispatch = useDispatch();
  const {
    events: reduxEvents,
    loading,
    error,
  } = useSelector((state) => state.events);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tooltip, setTooltip] = useState({
    visible: false,
    content: "",
    x: 0,
    y: 0,
  });
  const navigate = useNavigate();

  // Convert Redux event dates to proper Date objects and ensure they're valid
  const events = reduxEvents
    .map((event) => {
      const eventDate = new Date(event.date);
      // Check if the date is valid
      if (isNaN(eventDate.getTime())) {
        console.warn("Invalid date found in event:", event);
        return null;
      }
      return {
        ...event,
        date: eventDate,
      };
    })
    .filter(Boolean); // Remove null entries

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  // Handle day click - navigate to full calendar view if there are events
  const onClickDay = (value) => {
    const dayEvents = events.filter(
      (ev) => ev.date.toDateString() === value.toDateString()
    );

    if (dayEvents.length > 0) {
      navigate("/calendar");
    }
  };

  // Show tooltip on mouse enter
  const handleMouseEnter = (date, e) => {
    const dayEvents = events.filter(
      (ev) => ev.date.toDateString() === date.toDateString()
    );

    if (dayEvents.length > 0) {
      // Create tooltip content with event names/titles
      const tooltipContent = dayEvents
        .map((ev) => ev.title || ev.name || ev.description || "Untitled Event")
        .join(", ");

      setTooltip({
        visible: true,
        content: tooltipContent,
        x: e.clientX,
        y: e.clientY,
      });
    }
  };

  // Hide tooltip on mouse leave
  const handleMouseLeave = () => {
    setTooltip({
      visible: false,
      content: "",
      x: 0,
      y: 0,
    });
  };

  // Add event indicators on calendar tiles
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const dayEvents = events.filter(
        (ev) => ev.date.toDateString() === date.toDateString()
      );

      if (dayEvents.length === 0) return null;

      return (
        <div
          style={{
            marginTop: 4,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          onMouseEnter={(e) => handleMouseEnter(date, e)}
          onMouseLeave={handleMouseLeave}
        >
          {dayEvents.length === 1 ? (
            // Single event - show a dot
            <span
              style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: getEventColor(dayEvents[0]),
                border: "1px solid rgba(255,255,255,0.3)",
              }}
              title={dayEvents[0].title || dayEvents[0].name || "Event"}
            />
          ) : (
            // Multiple events - show count
            <span
              style={{
                display: "inline-block",
                minWidth: "16px",
                height: "16px",
                borderRadius: "50%",
                backgroundColor: "#3b82f6",
                color: "white",
                fontSize: "10px",
                fontWeight: "bold",
                textAlign: "center",
                lineHeight: "16px",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
              title={`${dayEvents.length} events`}
            >
              {dayEvents.length}
            </span>
          )}
        </div>
      );
    }
    return null;
  };

  // Loading state
  if (loading) {
    return (
      <div className="calenderS-container">
        <h3 className="text-xl font-bold mb-4">Your Meetings & Reminders</h3>
        <div style={{ padding: "20px", textAlign: "center" }}>
          Loading calendar events...
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="calenderS-container">
        <h3 className="text-xl font-bold mb-4">Your Meetings & Reminders</h3>
        <div style={{ padding: "20px", textAlign: "center", color: "red" }}>
          Error loading events: {error}
        </div>
        <button
          onClick={() => dispatch(fetchEvents())}
          style={{
            padding: "8px 16px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="calenderS-container">
      <h3 className="text-xl font-bold mb-4">
        Your Meetings & Reminders
        {events.length > 0 && (
          <span style={{ fontSize: "14px", color: "#666", marginLeft: "8px" }}>
            ({events.length} events)
          </span>
        )}
      </h3>

      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        onClickDay={onClickDay}
        tileContent={tileContent}
        className="custom-calendar"
      />

      {/* Custom Tooltip */}
      {tooltip.visible && (
        <div
          className="event-tooltip"
          style={{
            position: "fixed",
            left: tooltip.x + 10,
            top: tooltip.y + 10,
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            color: "white",
            padding: "8px 12px",
            borderRadius: "6px",
            fontSize: "12px",
            maxWidth: "200px",
            wordWrap: "break-word",
            zIndex: 1000,
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default CalenderS;
