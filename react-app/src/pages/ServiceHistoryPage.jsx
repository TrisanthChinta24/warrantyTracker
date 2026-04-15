import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../services/apiClient";
import { getWarranties } from "../services/warrantyService";
import {
  createServiceHistory,
  deleteServiceHistory,
  getAllServiceHistory,
} from "../services/serviceHistoryService";
import { useAuth } from "../state/AuthContext";
import { useToast } from "../state/ToastContext";

function resolveDocUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}/${String(path).replace(/\\/g, "/")}`;
}

function ServiceHistoryPage() {
  const { token, logout } = useAuth();
  const { pushToast } = useToast();
  const [warranties, setWarranties] = useState([]);
  const [records, setRecords] = useState([]);
  const [filterWarrantyId, setFilterWarrantyId] = useState("all");
  const [isModalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    warrantyId: "",
    serviceDate: "",
    description: "",
    cost: "",
    documents: [],
  });

  const loadData = async () => {
    try {
      const [warrantyData, recordData] = await Promise.all([
        getWarranties(token),
        getAllServiceHistory(token),
      ]);
      setWarranties(warrantyData);
      setRecords(recordData.sort((a, b) => new Date(b.serviceDate) - new Date(a.serviceDate)));
    } catch (error) {
      if (error.status === 401) logout();
      pushToast("Failed to load service history", "error");
    }
  };

  useEffect(() => {
    loadData();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const warrantyNameMap = useMemo(() => {
    const map = new Map();
    warranties.forEach((item) => map.set(item._id, item.productName));
    return map;
  }, [warranties]);

  const filteredRecords = useMemo(() => {
    if (filterWarrantyId === "all") return records;
    return records.filter((item) => item.warranty === filterWarrantyId);
  }, [filterWarrantyId, records]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.warrantyId) {
      pushToast("Please select a warranty item", "error");
      return;
    }

    try {
      await createServiceHistory(form, token);
      pushToast("Service record added", "success");
      setModalOpen(false);
      setForm({ warrantyId: "", serviceDate: "", description: "", cost: "", documents: [] });
      await loadData();
    } catch (error) {
      if (error.status === 401) logout();
      pushToast("Failed to save service record", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this service record?")) return;
    try {
      await deleteServiceHistory(id, token);
      pushToast("Service record deleted", "success");
      setRecords((prev) => prev.filter((item) => item._id !== id));
    } catch {
      pushToast("Failed to delete record", "error");
    }
  };

  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <h2>Service History</h2>
          <p>Maintain all repair and maintenance records for your warranty items.</p>
        </div>
      </div>

      <div className="surface toolbar">
        <select value={filterWarrantyId} onChange={(event) => setFilterWarrantyId(event.target.value)}>
          <option value="all">All Warranties</option>
          {warranties.map((item) => (
            <option key={item._id} value={item._id}>
              {item.productName}
            </option>
          ))}
        </select>
        <button className="btn btn-primary" type="button" onClick={() => setModalOpen(true)}>
          + Add Service Record
        </button>
      </div>

      <div className="service-grid">
        {!filteredRecords.length ? (
          <div className="empty-state">
            <h3>No service records found</h3>
            <p>Add your first maintenance entry to keep product history complete.</p>
          </div>
        ) : (
          filteredRecords.map((record) => (
            <article key={record._id} className="service-card">
              <div className="service-head">
                <h3>{warrantyNameMap.get(record.warranty) || "Unknown Product"}</h3>
                <button className="btn btn-danger" type="button" onClick={() => handleDelete(record._id)}>
                  Delete
                </button>
              </div>
              <p>{record.description}</p>
              <p>
                <strong>Date:</strong> {new Date(record.serviceDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Cost:</strong> {record.cost ? `Rs. ${Number(record.cost).toLocaleString()}` : "Not provided"}
              </p>
              {record.documents?.length ? (
                <div className="doc-grid">
                  {record.documents.map((doc, index) => (
                    <a key={`${doc}-${index}`} href={resolveDocUrl(doc)} target="_blank" rel="noreferrer">
                      Document {index + 1}
                    </a>
                  ))}
                </div>
              ) : null}
            </article>
          ))
        )}
      </div>

      {isModalOpen ? (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal-panel" onClick={(event) => event.stopPropagation()}>
            <h3>Add Service Record</h3>
            <form className="warranty-form" onSubmit={handleSubmit}>
              <label>
                Warranty Item
                <select
                  value={form.warrantyId}
                  onChange={(event) => setForm((prev) => ({ ...prev, warrantyId: event.target.value }))}
                  required
                >
                  <option value="">Select product</option>
                  {warranties.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.productName}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Service Date
                <input
                  type="date"
                  value={form.serviceDate}
                  onChange={(event) => setForm((prev) => ({ ...prev, serviceDate: event.target.value }))}
                  required
                />
              </label>
              <label>
                Cost (optional)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.cost}
                  onChange={(event) => setForm((prev) => ({ ...prev, cost: event.target.value }))}
                  placeholder="e.g. 4999"
                />
              </label>
              <label>
                Description
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                  required
                />
              </label>
              <label>
                Documents
                <input
                  type="file"
                  multiple
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, documents: Array.from(event.target.files || []) }))
                  }
                />
              </label>
              <div className="row-actions">
                <button className="btn btn-ghost" type="button" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" type="submit">
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default ServiceHistoryPage;
