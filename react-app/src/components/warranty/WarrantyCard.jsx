import { Link } from "react-router-dom";

function getRemainingDays(expiryDate) {
  return Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function WarrantyCard({ warranty, compact = false }) {
  const remainingDays = getRemainingDays(warranty.expiryDate);
  const statusLabel = remainingDays <= 0 ? "Expired" : `${remainingDays} days left`;
  const statusClass =
    remainingDays <= 0 ? "danger-text" : remainingDays <= 30 ? "warning-text" : "success-text";

  return (
    <article className="warranty-card">
      <div className="warranty-card-head">
        <h3>{warranty.productName}</h3>
        <span className={`status-badge ${statusClass}`}>{statusLabel}</span>
      </div>
      <p>Vendor: {warranty.vendor || warranty.brand || "Unknown"}</p>
      <p>Expiry: {new Date(warranty.expiryDate).toLocaleDateString()}</p>
      {!compact ? <Link to={`/warranties/${warranty._id}`}>Open Details</Link> : null}
    </article>
  );
}

export default WarrantyCard;
