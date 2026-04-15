import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createWarranty,
  getWarrantyById,
  runOcr,
  updateWarranty,
} from "../services/warrantyService";
import { useAuth } from "../state/AuthContext";
import { useToast } from "../state/ToastContext";

const initialValues = {
  productName: "",
  vendor: "",
  purchaseDate: "",
  expiryDate: "",
  notes: "",
};

function WarrantyFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { token } = useAuth();
  const { pushToast } = useToast();
  const [form, setForm] = useState(initialValues);
  const [extraFiles, setExtraFiles] = useState([]);
  const [customTitles, setCustomTitles] = useState([]);

  useEffect(() => {
    if (!isEdit) return;
    getWarrantyById(id, token)
      .then((data) => {
        setForm({
          productName: data.productName || "",
          vendor: data.vendor || data.brand || "",
          purchaseDate: data.purchaseDate?.slice(0, 10) || "",
          expiryDate: data.expiryDate?.slice(0, 10) || "",
          notes: data.notes || "",
        });
      })
      .catch(() => pushToast("Failed to load warranty", "error"));
  }, [id, isEdit, pushToast, token]);

  const previews = useMemo(() => extraFiles.map((file) => URL.createObjectURL(file)), [extraFiles]);

  const onFieldChange = (event) =>
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  const onExtraFilesChange = (event) => {
    const files = Array.from(event.target.files || []);
    setExtraFiles(files);
    setCustomTitles(files.map((file) => file.name));
  };

  const handleOcrChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const data = await runOcr(file, token);
      const extracted = data.extracted || {};
      setForm((prev) => ({
        ...prev,
        productName: extracted.productName || prev.productName,
        vendor: extracted.brand || prev.vendor,
        purchaseDate: extracted.purchaseDate?.slice(0, 10) || prev.purchaseDate,
        expiryDate: extracted.expiryDate?.slice(0, 10) || prev.expiryDate,
      }));
      pushToast("OCR extraction completed", "success");
    } catch {
      pushToast("OCR failed, continue manually", "error");
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => body.append(key, value));
    extraFiles.forEach((file) => body.append("images", file));
    body.append("customTitles", JSON.stringify(customTitles));

    try {
      if (isEdit) {
        await updateWarranty(id, body, token);
        pushToast("Warranty updated", "success");
        navigate(`/warranties/${id}`);
      } else {
        await createWarranty(body, token);
        pushToast("Warranty created", "success");
        navigate("/warranties");
      }
    } catch {
      pushToast("Failed to save warranty", "error");
    }
  };

  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <h2>{isEdit ? "Edit Warranty" : "Add New Warranty"}</h2>
          <p>Store product details and attach proof documents for quick access.</p>
        </div>
      </div>
      <form className="warranty-form" onSubmit={onSubmit}>
        <div className="surface-muted">
          <label>
            OCR Upload
            <input type="file" accept="image/*" onChange={handleOcrChange} />
          </label>
        </div>
        <div className="form-grid">
          <label>
            Product Name
            <input name="productName" value={form.productName} onChange={onFieldChange} required />
          </label>
          <label>
            Vendor
            <input name="vendor" value={form.vendor} onChange={onFieldChange} required />
          </label>
          <label>
            Purchase Date
            <input
              name="purchaseDate"
              type="date"
              value={form.purchaseDate}
              onChange={onFieldChange}
              required
            />
          </label>
          <label>
            Expiry Date
            <input name="expiryDate" type="date" value={form.expiryDate} onChange={onFieldChange} required />
          </label>
        </div>
        <label>
          Notes
          <textarea name="notes" value={form.notes} onChange={onFieldChange} rows={3} />
        </label>
        <label>
          Extra Attachments
          <input type="file" multiple onChange={onExtraFilesChange} />
        </label>
        <div className="preview-list">
          {extraFiles.map((file, index) => (
            <div key={file.name + index} className="preview-item">
              <img src={previews[index]} alt={file.name} />
              <input
                value={customTitles[index] || ""}
                onChange={(event) =>
                  setCustomTitles((prev) =>
                    prev.map((item, current) => (current === index ? event.target.value : item))
                  )
                }
              />
            </div>
          ))}
        </div>
        <button className="btn btn-primary" type="submit">
          {isEdit ? "Update Warranty" : "Save Warranty"}
        </button>
      </form>
    </section>
  );
}

export default WarrantyFormPage;
