import CountUp from "react-countup";
import "./StatCard.css";

export default function StatCard({
  title,
  value,
  icon,
  color,
  change
}) {
  return (
    <div
  className="stat-card"
  style={{
    "--accent": color,
  }}
>
      <div
        className="stat-icon"
        style={{ background: color }}
      >
        {icon}
      </div>

      <div className="stat-info">
        <p className="stat-title">{title}</p>

        <h2>
  {typeof value === "number" ? (
    <CountUp
      end={value}
      duration={2}
      separator=","
    />
  ) : (
    value
  )}
</h2>

        <span className="stat-change">{change}</span>
      </div>
    </div>
  );
}