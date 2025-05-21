import React from "react";
import "./Card.css";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { motion, AnimatePresence } from "framer-motion";
import { UilTimes } from "@iconscout/react-unicons";
import Chart from "react-apexcharts";

const Card = ({
  title,
  color,
  barValue,
  value,
  series,
  isExpanded,
  onCardClick,
  timeFrame = "Monthly", // Add timeFrame prop with default value
}) => {
  return (
    <AnimatePresence>
      {isExpanded ? (
        <ExpandedCard
          key={`expanded-${title}`}
          title={title}
          color={color}
          series={series}
          onClose={onCardClick}
          timeFrame={timeFrame}
        />
      ) : (
        <CompactCard
          key={`compact-${title}`}
          title={title}
          color={color}
          barValue={barValue}
          value={value}
          onClick={onCardClick}
          timeFrame={timeFrame}
        />
      )}
    </AnimatePresence>
  );
};

const CompactCard = ({ title, color, barValue, value, onClick, timeFrame }) => {
  return (
    <motion.div
      className="CompactCard"
      style={{
        background: color.backGround,
        boxShadow: color.boxShadow,
      }}
      layoutId={`card-${title}`}
      onClick={onClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="radialBar">
        <CircularProgressbar value={barValue} text={`${barValue}%`} />
        <span>{title}</span>
      </div>
      <div className="detail">
        <span>{value}</span>
        <span>This month's {title.toLowerCase()}</span>
        <span className="percentage-change">
          {barValue > 0 ? "+" : ""}
          {barValue}% vs last month
        </span>
      </div>
    </motion.div>
  );
};

const ExpandedCard = ({ title, color, series, onClose, timeFrame }) => {
  const data = {
    options: {
      chart: {
        type: "area",
        height: "auto",
      },
      fill: {
        colors: ["#fff"],
        type: "gradient",
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
        colors: ["white"],
      },
      tooltip: {
        x: {
          format: "MMM",
        },
      },
      grid: {
        show: true,
        borderColor: "rgba(255, 255, 255, 0.2)",
        strokeDashArray: 0,
      },
      xaxis: {
        categories: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        labels: {
          style: {
            colors: "#fff",
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: "#fff",
          },
        },
      },
    },
  };

  return (
    <motion.div
      className="ExpandedCard"
      style={{
        background: color.backGround,
        boxShadow: color.boxShadow,
      }}
      layoutId={`card-${title}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div style={{ alignSelf: "flex-end", cursor: "pointer", color: "white" }}>
        <UilTimes onClick={onClose} />
      </div>
      <span>{title}</span>
      <div className="chartContainer">
        <Chart options={data.options} series={series} type="area" />
      </div>
      <span>
        {timeFrame} trends for {new Date().getFullYear()}
      </span>
    </motion.div>
  );
};

export default Card;
