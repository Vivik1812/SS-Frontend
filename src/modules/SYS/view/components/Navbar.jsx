import { useNavigate, useLocation } from "react-router-dom";
import { FaPaw } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import { Autenticado, cerrarSesion } from "../../service/AuthService";
import NotificacionCampana from "./NotificacionCampana";

export default function Navbar({ variant = "default" }) {
  const navigate = useNavigate();
  const location = useLocation();

  const autenticado = Autenticado();

  const links = [
    { name: "Inicio", path: "/" },
    { name: "Chat", path: "/chat" },
  ];

  return (
    <nav className="navbar bg-white shadow-sm px-4 py-3">
      <div
        className="d-flex align-items-center gap-2"
        style={{ cursor: "pointer" }}
        onClick={() => navigate("/")}
      >
        <FaPaw size={32} className="text-success" />
        <div>
          <h6 className="text-success fw-bold m-0">Sanos & Salvos</h6>
          <small className="text-muted">Unidos por ellos</small>
        </div>
      </div>

      {variant === "default" && (
        <div className="d-flex gap-4">
          {links.map((link) => (
            <button
              key={link.path}
              className={`btn btn-link text-decoration-none ${
                location.pathname === link.path ? "text-success fw-bold" : "text-dark"
              }`}
              onClick={() => navigate(link.path)}
            >
              {link.name}
            </button>
          ))}
        </div>
      )}

      <div className="d-flex gap-2 align-items-center">
        {!autenticado && (
          <button className="btn" onClick={() => navigate("/login")}>
            Iniciar Sesion
          </button>
        )}

        {autenticado && (
          <>
            <NotificacionCampana />
            <button className="btn" onClick={() => navigate("/perfil")}>
              Mi cuenta
            </button>
            <button
              className="btn btn-success"
              onClick={() => navigate("/publicar")}
            >
              <FiPlus className="me-2" />
              Crear publicacion
            </button>
            <button
              className="btn btn-outline-danger"
              onClick={() => cerrarSesion()}
            >
              Cerrar Sesion
            </button>
          </>
        )}
      </div>
    </nav>
  );
}