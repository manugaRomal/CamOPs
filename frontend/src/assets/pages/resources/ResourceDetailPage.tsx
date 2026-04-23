import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatusBadge from "../../components/dashboard/StatusBadge";
import { resourceApi } from "../../api/resourceApi";
import type { Resource } from "../../types/resource";

//fixing resources
const ResourceDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      return;
    }

    const loadResource = async () => {
      try {
        setLoading(true);
        setError("");
        const result = await resourceApi.getById(Number(id));
        setResource(result);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load resource details");
      } finally {
        setLoading(false);
      }
    };

    void loadResource();
  }, [id]);

  const handleDelete = async () => {
    if (!resource) {
      return;
    }

    const confirmed = window.confirm(`Delete resource ${resource.resourceName}?`);
    if (!confirmed) {
      return;
    }

    try {
      await resourceApi.remove(resource.resourceId);
      navigate("/resources");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete resource");
    }
  };

  return (
    <DashboardLayout role="ADMIN">
      <div className="panel">
        <div className="resources-header">
          <h3>Resource Details</h3>
          <div className="resource-filter-actions">
            <button
              className="secondary-btn"
              onClick={() => {
                if (resource) navigate(`/resources/${resource.resourceId}/edit`);
              }}
            >
              Edit
            </button>
            <button className="secondary-btn" onClick={() => navigate("/resources")}>
              Back to List
            </button>
          </div>
        </div>

        {loading ? <p>Loading resource details...</p> : null}
        {error ? <p className="error-text">{error}</p> : null}

        {!loading && resource ? (
          <div className="resource-details-grid">
            <div>
              <p>
                <strong>Code:</strong> {resource.resourceCode}
              </p>
              <p>
                <strong>Name:</strong> {resource.resourceName}
              </p>
              <p>
                <strong>Type:</strong> {resource.resourceType}
              </p>
              <p>
                <strong>Location:</strong> {resource.location || "-"}
              </p>
              <p>
                <strong>Capacity:</strong> {resource.capacity}
              </p>
              <p>
                <strong>Status:</strong> <StatusBadge status={resource.status} />
              </p>
            </div>

            <div>
              <p>
                <strong>Availability:</strong> {resource.availabilityStartTime} - {resource.availabilityEndTime}
              </p>
              <p>
                <strong>Description:</strong> {resource.description || "-"}
              </p>
              {resource.resourceImage ? (
                <div className="resource-image-preview">
                  <p>Image preview</p>
                  <img src={resource.resourceImage} alt={resource.resourceName} />
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {!loading && resource ? (
          <button className="secondary-btn danger-btn" onClick={() => void handleDelete()}>
            Delete Resource
          </button>
        ) : null}
      </div>
    </DashboardLayout>
  );
};

export default ResourceDetailPage;
