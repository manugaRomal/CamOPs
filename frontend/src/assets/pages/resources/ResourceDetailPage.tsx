import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import QRCode from "qrcode";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatusBadge from "../../components/dashboard/StatusBadge";
import { resourceApi } from "../../api/resourceApi";
import type { Resource } from "../../types/resource";
import type { ResourceHealth } from "../../types/resourceHealth";

const ResourceDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [resource, setResource] = useState<Resource | null>(null);
  const [health, setHealth] = useState<ResourceHealth | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [healthLoading, setHealthLoading] = useState(false);
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

  useEffect(() => {
    if (!id) {
      return;
    }

    const loadHealth = async () => {
      try {
        setHealthLoading(true);
        const result = await resourceApi.getHealth(Number(id));
        setHealth(result);
      } catch {
        setHealth(null);
      } finally {
        setHealthLoading(false);
      }
    };

    void loadHealth();
  }, [id]);

  useEffect(() => {
    if (!id) {
      return;
    }

    const detailUrl = `${window.location.origin}/resources/${id}`;
    void QRCode.toDataURL(detailUrl, { width: 200, margin: 2, errorCorrectionLevel: "M" })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
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
    <DashboardLayout>
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

            <div className="resource-special-panel">
              <div className="resource-qr-card">
                <h4>Resource QR</h4>
                <p className="resource-qr-hint">Scan to open this resource in CamOPs (same device network / deployment URL).</p>
                {qrDataUrl ? <img className="resource-qr-image" src={qrDataUrl} alt="Resource QR code" /> : <p>QR unavailable</p>}
              </div>

              <div className="resource-health-card">
                <h4>Health score</h4>
                {healthLoading ? <p>Calculating health...</p> : null}
                {!healthLoading && health ? (
                  <>
                    <div className="resource-health-score-row">
                      <span className={`resource-health-score health-${health.label.toLowerCase().replace(/\s+/g, "-")}`}>
                        {health.score}
                      </span>
                      <span className="resource-health-label">{health.label}</span>
                    </div>
                    <p className="resource-health-meta">
                      Open tickets: {health.openTicketCount} · Urgent open: {health.urgentOpenTicketCount} · Total linked:{" "}
                      {health.totalTicketCount}
                    </p>
                    <ul className="resource-health-factors">
                      {health.factors.map((factor) => (
                        <li key={factor}>{factor}</li>
                      ))}
                    </ul>
                  </>
                ) : null}
                {!healthLoading && !health ? <p>Health data could not be loaded.</p> : null}
              </div>
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
