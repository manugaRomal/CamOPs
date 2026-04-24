import { useParams } from "react-router-dom";
import AdminTicketDetail from "../../components/tickets/AdminTicketDetail";

const AdminTicketDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  return <AdminTicketDetail ticketId={id ?? ""} />;
};

export default AdminTicketDetailPage;