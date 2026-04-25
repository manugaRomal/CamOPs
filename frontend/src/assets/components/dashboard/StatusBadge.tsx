//StatusBadge.tsx

type StatusBadgeProps = {
  status: string;
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const normalized = status?.toUpperCase() || "";

  const getClassName = () => {
    switch (normalized) {
      case "APPROVED":
      case "RESOLVED":
        return "badge badge-success";
      case "PENDING":
      case "IN_PROGRESS":
      case "MEDIUM":
      case "MAINTENANCE":
        return "badge badge-warning";
      case "REJECTED":
      case "HIGH":
      case "CRITICAL":
      case "OUT_OF_SERVICE":
        return "badge badge-danger";
      case "OPEN":
      case "ACTIVE":
        return "badge badge-primary";
      case "LOW":
      case "CANCELLED":
      case "CLOSED":
      case "INACTIVE":
        return "badge badge-secondary";
      default:
        return "badge badge-secondary";
    }
  };

  return <span className={getClassName()}>{status}</span>;
};

export default StatusBadge;