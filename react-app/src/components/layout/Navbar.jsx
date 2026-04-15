import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../state/AuthContext";

function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="navbar">
      <div className="nav-left">
        <button className="btn btn-ghost" onClick={onToggleSidebar} type="button">
          ☰
        </button>
        <div className="brand-block">
          <span className="brand-pill">WT</span>
          <h1>Warranty Tracer</h1>
        </div>
      </div>
      <nav className="nav-right">
        <Link className={location.pathname === "/" ? "active" : ""} to="/">
          Dashboard
        </Link>
        <Link className={location.pathname === "/warranties" ? "active" : ""} to="/warranties">
          All Warranties
        </Link>
        <Link className={location.pathname === "/service-history" ? "active" : ""} to="/service-history">
          Service History
        </Link>
        <Link to="/warranties/new">Add Warranty</Link>
      </nav>
      <div className="nav-user">
        <span className="user-chip">{user?.name || "User"}</span>
        <button className="btn btn-danger" onClick={logout} type="button">
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;
