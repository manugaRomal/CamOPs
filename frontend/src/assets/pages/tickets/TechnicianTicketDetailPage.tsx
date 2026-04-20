import { useParams } from "react-router-dom";
import TechnicianTicketDetail from "../../components/tickets/TechnicianTicketDetail.tsx";

const TechnicianTicketDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  return <TechnicianTicketDetail ticketId={id ?? ""} />;
};

export default TechnicianTicketDetailPage;