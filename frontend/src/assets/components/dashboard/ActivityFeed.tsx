//ActivityFeed.tsx

type ActivityFeedProps = {
  items: string[];
};

const ActivityFeed = ({ items }: ActivityFeedProps) => {
  return (
    <div className="panel">
      <h3>Recent Activity</h3>
      <ul className="activity-feed">
        {items.map((item, index) => (
          <li key={index}>• {item}</li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityFeed;