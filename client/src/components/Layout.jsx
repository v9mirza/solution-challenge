import { Outlet, NavLink } from "react-router-dom";

const linkStyle = ({ isActive }) => ({
  fontWeight: isActive ? 600 : 400,
  marginRight: "1rem",
  color: "inherit",
});

export function Layout() {
  return (
    <div className="layout">
      <header className="layout-header">
        <strong>Smart Hospital</strong>
        <nav>
          <NavLink to="/" end style={linkStyle}>
            Home
          </NavLink>
          <NavLink to="/patient" style={linkStyle}>
            Patient
          </NavLink>
          <NavLink to="/staff" style={linkStyle}>
            Staff
          </NavLink>
        </nav>
      </header>
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}
