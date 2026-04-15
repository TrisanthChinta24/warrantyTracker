import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import WarrantyCard from "../components/warranty/WarrantyCard";
import { useWarranties } from "../hooks/useWarranties";
import { getWarranties } from "../services/warrantyService";
import { useAuth } from "../state/AuthContext";
import { useToast } from "../state/ToastContext";

function DashboardPage() {
  const { token, logout } = useAuth();
  const { pushToast } = useToast();
  const [warranties, setWarranties] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    getWarranties(token)
      .then(setWarranties)
      .catch((error) => {
        if (error.status === 401) logout();
        pushToast("Failed to load warranties", "error");
      });
  }, [logout, pushToast, token]);

  const filtered = useWarranties(warranties, search, filter);
  const now = Date.now();
  const activeCount = warranties.filter(
    (item) => new Date(item.expiryDate).getTime() - now > 30 * 24 * 60 * 60 * 1000
  ).length;
  const expiringCount = warranties.filter((item) => {
    const days = Math.ceil((new Date(item.expiryDate).getTime() - now) / (1000 * 60 * 60 * 24));
    return days > 0 && days <= 30;
  }).length;
  const expiredCount = warranties.filter((item) => new Date(item.expiryDate).getTime() <= now).length;

  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <h2>My Warranties</h2>
          <p>Track coverage, avoid expiry misses, and manage documents in one place.</p>
        </div>
      </div>
      <div className="stats-grid">
        <article className="stat-card">
          <p>Total</p>
          <h3>{warranties.length}</h3>
        </article>
        <article className="stat-card">
          <p>Active</p>
          <h3>{activeCount}</h3>
        </article>
        <article className="stat-card">
          <p>Expiring Soon</p>
          <h3>{expiringCount}</h3>
        </article>
        <article className="stat-card">
          <p>Expired</p>
          <h3>{expiredCount}</h3>
        </article>
      </div>
      <div className="surface toolbar">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products..."
        />
        <select value={filter} onChange={(event) => setFilter(event.target.value)}>
          <option value="all">All</option>
          <option value="expiring">Expiring Soon</option>
          <option value="expired">Expired</option>
          <option value="active">Active</option>
        </select>
      </div>
      <div className="card-grid">
        {!filtered.length ? (
          <div className="empty-state">
            <h3>No warranties match this filter</h3>
            <p>Try a different search or add a new warranty.</p>
          </div>
        ) : (
          filtered.map((warranty) => <WarrantyCard key={warranty._id} warranty={warranty} compact />)
        )}
      </div>
      <Link className="fab" to="/warranties/new" title="Add new warranty">
        + New
      </Link>
    </section>
  );
}

export default DashboardPage;
