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
const RESOURCE_TYPES = ["Lecture Hall", "Lab", "Meeting Room", "Equipment", "Vehicle"];

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
      <div className="resource-form-shell">
        <div className="resource-page-head resource-page-head-modern">
          <div>
            <p className="hero-eyebrow">Resource workspace</p>
            <h2>{isEditMode ? "Edit resource" : "Add a new resource"}</h2>
            <p>Register a bookable asset (rooms, equipment, vehicles) available to your campus.</p>
          </div>
          <span className="autosave-chip">Auto-saving draft</span>
        </div>

        <div className="panel resource-form-panel modern-resource-form-card">
          <div className="modern-form-topbar">
            <div>
              <p className="modern-form-kicker">{isEditMode ? "UPDATE ENTRY" : "NEW ENTRY"}</p>
              <h3>Resource Details</h3>
            </div>
            <span className="modern-step-badge">Step 1 of 1</span>
          </div>

          <div className="modern-form-body">
            <p className="modern-form-section-title">Identity</p>
          </div>

        {loading ? <p>Loading resource data...</p> : null}
        {error ? <p className="error-text">{error}</p> : null}

        {!loading ? (
          <form className="resource-form modern-resource-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="field-label" htmlFor="resourceCode">Resource code</label>
              <input
                id="resourceCode"
                className="input-control modern-input"
                placeholder="e.g. LAB-204"
                value={resource.resourceCode}
                onChange={(event) => updateField("resourceCode", event.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="field-label" htmlFor="resourceName">Resource name</label>
              <input
                id="resourceName"
                className="input-control modern-input"
                placeholder="e.g. Robotics Lab"
                value={resource.resourceName}
                onChange={(event) => updateField("resourceName", event.target.value)}
                required
              />
            </div>

            <div className="form-section-divider">Classification</div>

            <div className="form-group">
              <label className="field-label" htmlFor="resourceType">Resource type</label>
              <input
                id="resourceType"
                className="input-control modern-input"
                placeholder="Select type..."
                value={resource.resourceType}
                onChange={(event) => updateField("resourceType", event.target.value)}
                list="resourceTypeOptions"
                required
              />
              <datalist id="resourceTypeOptions">
                {RESOURCE_TYPES.map((type) => (
                  <option key={type} value={type} />
                ))}
              </datalist>
            </div>
            <div className="form-group">
              <label className="field-label" htmlFor="location">Location</label>
              <input
                id="location"
                className="input-control modern-input"
                placeholder="Building / floor"
                value={resource.location}
                onChange={(event) => updateField("location", event.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="field-label" htmlFor="capacity">Capacity</label>
              <div className="capacity-stepper">
                <button
                  type="button"
                  className="stepper-btn"
                  onClick={() => updateField("capacity", Math.max(1, resource.capacity - 1))}
                >
                  -
                </button>
                <input
                  id="capacity"
                  className="stepper-input"
                  type="number"
                  min={1}
                  value={resource.capacity}
                  onChange={(event) => updateField("capacity", Math.max(1, Number(event.target.value) || 1))}
                  required
                />
                <button
                  type="button"
                  className="stepper-btn"
                  onClick={() => updateField("capacity", resource.capacity + 1)}
                >
                  +
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="field-label">Status</label>
              <div className="status-pill-group">
                {STATUSES.map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={`status-pill ${resource.status === status ? "status-pill-active" : ""}`}
                    onClick={() => updateField("status", status as ResourceStatus)}
                  >
                    {status.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-section-divider">Availability</div>

            <div className="form-group">
              <label className="field-label" htmlFor="availabilityStartTime">Opens at</label>
              <input
                id="availabilityStartTime"
                className="input-control modern-input"
                type="time"
                value={resource.availabilityStartTime}
                onChange={(event) => updateField("availabilityStartTime", event.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="field-label" htmlFor="availabilityEndTime">Closes at</label>
              <input
                id="availabilityEndTime"
                className="input-control modern-input"
                type="time"
                value={resource.availabilityEndTime}
                onChange={(event) => updateField("availabilityEndTime", event.target.value)}
                required
              />
            </div>

            <div className="form-section-divider">Presentation</div>

            <div className="form-group">
              <label className="field-label" htmlFor="resourceImage">Image URL</label>
              <input
                id="resourceImage"
                className="input-control modern-input"
                placeholder="https://..."
                value={resource.resourceImage}
                onChange={(event) => updateField("resourceImage", event.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="field-label" htmlFor="description">Description</label>
              <textarea
                id="description"
                className="input-control textarea-control modern-input"
                placeholder="Briefly describe this resource..."
                value={resource.description}
                onChange={(event) => updateField("description", event.target.value)}
              />
            </div>

            {resource.resourceImage ? (
              <div className="resource-image-preview modern-image-preview">
                <p>Image preview</p>
                <img src={resource.resourceImage} alt="Resource preview" />
              </div>
            ) : null}

            <div className="resource-form-footer">
              <span className="resource-form-note">Required fields are validated before submission.</span>
              <div className="resource-filter-actions">
              <button className="secondary-btn" type="button" onClick={() => navigate("/resources")}>
                Cancel
              </button>
                <button className="primary-btn" type="submit" disabled={saving}>
                  {saving ? "Saving..." : isEditMode ? "Update Resource" : "Create Resource"}
                </button>
              </div>
            </div>
          </form>
        ) : null}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResourceFormPage;
