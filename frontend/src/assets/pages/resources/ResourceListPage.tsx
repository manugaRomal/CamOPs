import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatusBadge from "../../components/dashboard/StatusBadge";
import { resourceApi } from "../../api/resourceApi";
import type { Resource, ResourceFilter, ResourceStatus } from "../../types/resource";

const QUICK_STATUSES: ResourceStatus[] = ["ACTIVE", "INACTIVE", "MAINTENANCE", "OUT_OF_SERVICE"];

const ResourceListPage = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<ResourceFilter>({});

  const loadResources = async (activeFilters?: ResourceFilter) => {
    try {
      setLoading(true);
      setError("");
      const result = await resourceApi.list(activeFilters);
      setResources(result);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadResources();
  }, []);

  const handleFilterInput = (field: keyof ResourceFilter, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value === "" ? undefined : field === "capacity" ? Number(value) : value,
    }));
  };

  const handleSearch = async () => {
    await loadResources(filters);
  };

  const handleClearFilters = async () => {
    setFilters({});
    await loadResources();
  };

  const handleQuickStatus = async (status: ResourceStatus) => {
    const nextFilters = { ...filters, status };
    setFilters(nextFilters);
    await loadResources(nextFilters);
  };

  const handleStatusChange = async (resourceId: number, status: ResourceStatus) => {
    try {
      await resourceApi.updateStatus(resourceId, status);
      await loadResources(filters);
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Failed to update resource status");
    }
  };

  return (
    <DashboardLayout role="ADMIN">
      <div className="dashboard-grid">
        <div className="panel">
          <div className="resources-header">
            <h3>Facilities & Assets Catalogue</h3>
            <button className="primary-btn" onClick={() => navigate("/resources/new")}>
              Add Resource
            </button>
          </div>

          <div className="resource-filter-grid">
            <input
              className="input-control"
              placeholder="Type (LAB, ROOM)"
              value={filters.resourceType ?? ""}
              onChange={(event) => handleFilterInput("resourceType", event.target.value)}
            />
            <input
              className="input-control"
              placeholder="Location"
              value={filters.location ?? ""}
              onChange={(event) => handleFilterInput("location", event.target.value)}
            />
            <input
              className="input-control"
              placeholder="Capacity"
              type="number"
              min={1}
              value={typeof filters.capacity === "number" ? String(filters.capacity) : ""}
              onChange={(event) => handleFilterInput("capacity", event.target.value)}
            />
            <select
              className="input-control"
              value={filters.status ?? ""}
              onChange={(event) => handleFilterInput("status", event.target.value)}
            >
              <option value="">All statuses</option>
              {QUICK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="resource-filter-actions">
            <button className="primary-btn" onClick={() => void handleSearch()}>
              Search
            </button>
            <button className="secondary-btn" onClick={() => void handleClearFilters()}>
              Clear
            </button>
          </div>

          <div className="quick-filter-row">
            {QUICK_STATUSES.map((status) => (
              <button key={status} className="secondary-btn" onClick={() => void handleQuickStatus(status)}>
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="panel">
          <h3>Resources</h3>
          {loading ? <p>Loading resources...</p> : null}
          {error ? <p className="error-text">{error}</p> : null}
          {!loading && resources.length === 0 ? <p>No resources found for the selected filters.</p> : null}

          {!loading && resources.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Capacity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {resources.map((resource) => (
                  <tr key={resource.resourceId}>
                    <td>{resource.resourceCode}</td>
                    <td>{resource.resourceName}</td>
                    <td>{resource.resourceType}</td>
                    <td>{resource.location}</td>
                    <td>{resource.capacity}</td>
                    <td>
                      <StatusBadge status={resource.status} />
                    </td>
                    <td className="resource-actions-cell">
                      <button className="link-btn" onClick={() => navigate(`/resources/${resource.resourceId}`)}>
                        View
                      </button>
                      <button className="link-btn" onClick={() => navigate(`/resources/${resource.resourceId}/edit`)}>
                        Edit
                      </button>
                      <button
                        className="link-btn"
                        onClick={() =>
                          void handleStatusChange(
                            resource.resourceId,
                            resource.status === "ACTIVE" ? "OUT_OF_SERVICE" : "ACTIVE",
                          )
                        }
                      >
                        {resource.status === "ACTIVE" ? "Mark Out" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResourceListPage;
