//QuickActions.tsx

type QuickActionsProps = {
  actions: string[];
};

const QuickActions = ({ actions }: QuickActionsProps) => {
  return (
    <div className="panel">
      <h3>Quick Actions</h3>
      <div className="quick-actions">
        {actions.map((action, index) => (
          <button key={index} className="primary-btn">
            {action}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;