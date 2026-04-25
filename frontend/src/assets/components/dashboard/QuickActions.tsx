//QuickActions.tsx

type QuickActionsProps = {
  actions: string[];
  onActionClick?: (action: string) => void;
};

const QuickActions = ({ actions, onActionClick }: QuickActionsProps) => {
  return (
    <div className="panel">
      <h3>Quick Actions</h3>
      <div className="quick-actions">
        {actions.map((action, index) => (
          <button key={index} className="primary-btn" onClick={() => onActionClick?.(action)}>
            {action}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;