import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../services/apiClient";
import {
  deleteAttachment,
  deleteWarrantyById,
  getWarrantyById,
  renameAttachment,
} from "../services/warrantyService";
import { useAuth } from "../state/AuthContext";
import { useToast } from "../state/ToastContext";

function WarrantyDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token } = useAuth();
  const { pushToast } = useToast();
  const [warranty, setWarranty] = useState(null);

  useEffect(() => {
    getWarrantyById(id, token)
      .then(setWarranty)
      .catch(() => pushToast("Failed to load details", "error"));
  }, [id, pushToast, token]);

  const onDeleteWarranty = async () => {
    if (!window.confirm("Delete warranty permanently?")) return;
    await deleteWarrantyById(id, token);
    pushToast("Warranty deleted", "success");
    navigate("/warranties");
  };

  const onRenameAttachment = async (index, currentName) => {
    const nextName = window.prompt("Rename attachment", currentName);
    if (!nextName || nextName === currentName) return;
    await renameAttachment(id, index, nextName, token);
    const fresh = await getWarrantyById(id, token);
    setWarranty(fresh);
  };

  const onDeleteAttachment = async (index, diskPath) => {
    if (!window.confirm("Delete this attachment?")) return;
    await deleteAttachment(id, index, diskPath, token);
    const fresh = await getWarrantyById(id, token);
    setWarranty(fresh);
  };

  if (!warranty) return <p>Loading details...</p>;

  return (
    <section className="page-shell">
      <div className="page-header">
        <Link className="back-link" to="/warranties">
          Back to list
        </Link>
        <div>
          <h2>{warranty.productName}</h2>
          <p>Full warranty info and linked documents.</p>
        </div>
      </div>
      <div className="surface detail-grid">
        <p>Vendor: {warranty.vendor || warranty.brand || "Unknown"}</p>
        <p>Purchase: {new Date(warranty.purchaseDate).toLocaleDateString()}</p>
        <p>Expiry: {new Date(warranty.expiryDate).toLocaleDateString()}</p>
        <p>Notes: {warranty.notes || "No additional notes."}</p>
        <div className="row-actions">
          <Link to={`/warranties/${id}/edit`}>Edit</Link>
          <button className="btn btn-danger" type="button" onClick={onDeleteWarranty}>
            Delete
          </button>
        </div>
      </div>

      <div className="surface">
        <h3>Attachments</h3>
        {!warranty.images?.length ? <p>No attachments</p> : null}
        <ul className="attachment-list">
          {warranty.images?.map((image, index) => {
            const displayName = image.customName || image.originalName || "File";
            const fileUrl = image.path ? `${API_BASE_URL}/${image.path.replace(/\\/g, "/")}` : "";
            return (
              <li key={`${displayName}-${index}`}>
                <a href={fileUrl} target="_blank" rel="noreferrer">
                  {displayName}
                </a>
                <button className="btn btn-ghost" type="button" onClick={() => onRenameAttachment(index, displayName)}>
                  Rename
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => onDeleteAttachment(index, image.path)}
                >
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export default WarrantyDetailsPage;
