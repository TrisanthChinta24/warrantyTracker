import { Link } from "react-router-dom";

function Sidebar({ isOpen }) {
  return (
    <aside className={`sidebar ${isOpen ? "" : "hidden"}`}>
      <p className="sidebar-title">Workspace</p>
      <Link to="/">Dashboard</Link>
      <Link to="/warranties">Warranties</Link>
      <Link to="/service-history">Service History</Link>
      <Link to="/warranties/new">Add Warranty</Link>
    </aside>
  );
}

export default Sidebar;
