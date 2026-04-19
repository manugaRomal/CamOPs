import { useParams } from "react-router-dom";
import TicketDetail from "../../components/tickets/TicketDetail.tsx";

const TicketDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  return <TicketDetail ticketId={id ?? ""} />;
};

export default TicketDetailPage;