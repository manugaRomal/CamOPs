//StatCard.tsx

type StatCardProps = {
  title: string;
  value: number;
  subtitle: string;
};

const StatCard = ({ title, value, subtitle }: StatCardProps) => {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <h4>{title}</h4>
        <span className="stat-card-icon">+</span>
      </div>
      <h2>{value}</h2>
      <p>{subtitle}</p>
    </div>
  );
};

export default StatCard;