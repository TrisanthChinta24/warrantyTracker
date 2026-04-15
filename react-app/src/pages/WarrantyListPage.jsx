import { useEffect, useState } from "react";
import WarrantyTable from "../components/warranty/WarrantyTable";
import { useWarranties } from "../hooks/useWarranties";
import { deleteWarrantyById, getWarranties } from "../services/warrantyService";
import { useAuth } from "../state/AuthContext";
import { useToast } from "../state/ToastContext";

function WarrantyListPage() {
  const { token, logout } = useAuth();
  const { pushToast } = useToast();
  const [warranties, setWarranties] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("soonest");

  useEffect(() => {
    getWarranties(token)
      .then(setWarranties)
      .catch((error) => {
        if (error.status === 401) logout();
        pushToast("Failed to fetch warranties", "error");
      });
  }, [logout, pushToast, token]);

  const filtered = useWarranties(warranties, search, "all", sort);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this warranty?")) return;
    try {
      await deleteWarrantyById(id, token);
      setWarranties((prev) => prev.filter((item) => item._id !== id));
      pushToast("Warranty deleted", "success");
    } catch {
      pushToast("Delete failed", "error");
    }
  };

  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <h2>All Warranties</h2>
          <p>Sortable and searchable inventory of every product warranty.</p>
        </div>
      </div>
      <div className="surface toolbar">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search warranties..."
        />
        <select value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="soonest">Expiring Soon</option>
          <option value="latest">Recently Added</option>
        </select>
      </div>
      <div className="surface">
        <WarrantyTable warranties={filtered} onDelete={handleDelete} />
      </div>
    </section>
  );
}

export default WarrantyListPage;
