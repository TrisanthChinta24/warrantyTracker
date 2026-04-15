import { Link } from "react-router-dom";

function WarrantyTable({ warranties, onDelete }) {
  if (!warranties.length) {
    return <p>No warranties found for the selected search/filter.</p>;
  }

  return (
    <div className="table-wrap">
      <table className="warranty-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Vendor</th>
            <th>Purchase</th>
            <th>Expiry</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {warranties.map((warranty) => (
            <tr key={warranty._id}>
              <td>{warranty.productName}</td>
              <td>{warranty.vendor || warranty.brand || "Unknown"}</td>
              <td>{new Date(warranty.purchaseDate).toLocaleDateString()}</td>
              <td>{new Date(warranty.expiryDate).toLocaleDateString()}</td>
              <td className="row-actions">
                <Link to={`/warranties/${warranty._id}`}>Details</Link>
                <Link to={`/warranties/${warranty._id}/edit`}>Edit</Link>
                <button type="button" className="btn btn-danger" onClick={() => onDelete(warranty._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default WarrantyTable;
