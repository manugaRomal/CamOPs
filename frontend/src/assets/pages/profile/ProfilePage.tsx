import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { authApi } from "../../api/authApi";
import { useAuth } from "../../../auth/AuthContext";

const ProfilePage = () => {
  const { user, setToken, refreshUser } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName ?? "");
      setPhone(user.phone ?? "");
      setDepartment(user.department ?? "");
    }
  }, [user]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    setError("");
    setMessage("");

    const body: { fullName?: string; phone?: string; department?: string } = {};
    if (fullName.trim() !== (user.fullName ?? "")) {
      body.fullName = fullName.trim();
    }
    if ((phone?.trim() ?? "") !== (user.phone ?? "")) {
      body.phone = phone.trim();
    }
    if ((department?.trim() ?? "") !== (user.department ?? "")) {
      body.department = department.trim();
    }
    if (Object.keys(body).length === 0) {
      setMessage("No changes to save.");
      return;
    }

    setSaving(true);
    try {
      const { profile, accessToken } = await authApi.patchProfile(body);
      setToken(accessToken);
      setFullName(profile.fullName ?? "");
      setPhone(profile.phone ?? "");
      setDepartment(profile.department ?? "");
      await refreshUser();
      setMessage("Profile updated.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  if (!user) {
    return null;
  }

  const hasChanges =
    fullName.trim() !== (user.fullName ?? "") ||
    (phone?.trim() ?? "") !== (user.phone ?? "") ||
    (department?.trim() ?? "") !== (user.department ?? "");

  return (
    <DashboardLayout>
      <div className="dashboard-grid admin-dashboard-page">
        <section className="hero-panel">
          <div>
            <p className="hero-eyebrow">Account</p>
            <h1>Your profile</h1>
            <p className="hero-description">
              Update the details shown in CamOps. Your sign-in email comes from Google and cannot be changed here.{" "}
              <Link to="/">Back to dashboard</Link>
            </p>
          </div>
        </section>

        <section className="panel modern-panel">
          <p className="profile-readonly">
            <strong>Email</strong> {user.email}
          </p>
          <form className="profile-form" onSubmit={(e) => void handleSubmit(e)}>
            <div className="form-group">
              <label className="field-label" htmlFor="full-name">
                Full name
              </label>
              <input
                id="full-name"
                className="input-control modern-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                maxLength={150}
                required
              />
            </div>
            <div className="form-group">
              <label className="field-label" htmlFor="phone">
                Phone
              </label>
              <input
                id="phone"
                className="input-control modern-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={30}
                placeholder="Optional"
              />
            </div>
            <div className="form-group">
              <label className="field-label" htmlFor="department">
                Department
              </label>
              <input
                id="department"
                className="input-control modern-input"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                maxLength={100}
                placeholder="Optional"
              />
            </div>
            {error ? <p className="error-text">{error}</p> : null}
            {message ? <p className="success-text">{message}</p> : null}
            <button
              type="submit"
              className="primary-btn"
              disabled={saving || !hasChanges}
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </form>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
