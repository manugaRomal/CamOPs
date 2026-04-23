import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { resourceApi } from "../../api/resourceApi";
import type { ResourcePayload, ResourceStatus } from "../../types/resource";

const EMPTY_RESOURCE: ResourcePayload = {
  resourceCode: "",
  resourceName: "",
  resourceType: "",
  description: "",
  status: "ACTIVE",
  location: "",
  capacity: 1,
  resourceImage: "",
  availabilityStartTime: "08:00",
  availabilityEndTime: "17:00",
};

const STATUSES: ResourceStatus[] = ["ACTIVE", "INACTIVE", "MAINTENANCE", "OUT_OF_SERVICE"];

const ResourceFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = useMemo(() => Boolean(id), [id]);
  const [resource, setResource] = useState<ResourcePayload>(EMPTY_RESOURCE);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      return;
    }

    const loadResource = async () => {
      try {
        setLoading(true);
        const result = await resourceApi.getById(Number(id));
        setResource({
          resourceCode: result.resourceCode,
          resourceName: result.resourceName,
          resourceType: result.resourceType,
          description: result.description ?? "",
          status: result.status,
          location: result.location ?? "",
          capacity: result.capacity,
          resourceImage: result.resourceImage ?? "",
          availabilityStartTime: result.availabilityStartTime,
          availabilityEndTime: result.availabilityEndTime,
        });
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load resource");
      } finally {
        setLoading(false);
      }
    };

    void loadResource();
  }, [id]);

  const updateField = <K extends keyof ResourcePayload>(key: K, value: ResourcePayload[K]) => {
    setResource((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      if (isEditMode && id) {
        await resourceApi.update(Number(id), resource);
      } else {
        await resourceApi.create(resource);
      }
      navigate("/resources");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save resource");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role="ADMIN">
      <div className="panel resource-form-panel">
        <h3>{isEditMode ? "Edit Resource" : "Add Resource"}</h3>
        {loading ? <p>Loading resource data...</p> : null}
        {error ? <p className="error-text">{error}</p> : null}

        {!loading ? (
          <form className="resource-form" onSubmit={handleSubmit}>
            <input
              className="input-control"
              placeholder="Resource code"
              value={resource.resourceCode}
              onChange={(event) => updateField("resourceCode", event.target.value)}
              required
            />
            <input
              className="input-control"
              placeholder="Resource name"
              value={resource.resourceName}
              onChange={(event) => updateField("resourceName", event.target.value)}
              required
            />
            <input
              className="input-control"
              placeholder="Resource type"
              value={resource.resourceType}
              onChange={(event) => updateField("resourceType", event.target.value)}
              required
            />
            <input
              className="input-control"
              placeholder="Location"
              value={resource.location}
              onChange={(event) => updateField("location", event.target.value)}
            />
            <input
              className="input-control"
              type="number"
              min={1}
              placeholder="Capacity"
              value={resource.capacity}
              onChange={(event) => updateField("capacity", Number(event.target.value))}
              required
            />
            <select
              className="input-control"
              value={resource.status}
              onChange={(event) => updateField("status", event.target.value as ResourceStatus)}
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <input
              className="input-control"
              type="time"
              value={resource.availabilityStartTime}
              onChange={(event) => updateField("availabilityStartTime", event.target.value)}
              required
            />
            <input
              className="input-control"
              type="time"
              value={resource.availabilityEndTime}
              onChange={(event) => updateField("availabilityEndTime", event.target.value)}
              required
            />
            <input
              className="input-control"
              placeholder="Image URL"
              value={resource.resourceImage}
              onChange={(event) => updateField("resourceImage", event.target.value)}
            />
            <textarea
              className="input-control textarea-control"
              placeholder="Description"
              value={resource.description}
              onChange={(event) => updateField("description", event.target.value)}
            />

            {resource.resourceImage ? (
              <div className="resource-image-preview">
                <p>Image preview</p>
                <img src={resource.resourceImage} alt="Resource preview" />
              </div>
            ) : null}

            <div className="resource-filter-actions">
              <button className="primary-btn" type="submit" disabled={saving}>
                {saving ? "Saving..." : isEditMode ? "Update Resource" : "Create Resource"}
              </button>
              <button className="secondary-btn" type="button" onClick={() => navigate("/resources")}>
                Cancel
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </DashboardLayout>
  );
};

export default ResourceFormPage;
