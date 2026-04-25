//ActivityFeed.tsx

type ActivityFeedProps = {
  items: string[];
};

const ActivityFeed = ({ items }: ActivityFeedProps) => {
  return (
    <div className="panel modern-panel">
      <div className="panel-header-row">
        <div>
          <h3>Recent Activity</h3>
          <p className="panel-subtitle">Latest updates across bookings, resources, and maintenance.</p>
        </div>
        <button className="ghost-btn" type="button">View all</button>
      </div>
      <ul className="activity-feed">
        {items.map((item, index) => (
          <li key={index}>
            <span className="activity-dot" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityFeed;