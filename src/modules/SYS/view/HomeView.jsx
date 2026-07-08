import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../view/components/Navbar";
import Footer from "../view/components/Footer";
import useHomeViewModel from "../viewmodel/HomeViewModel";
import MapView from "./components/MapView";

function TarjetaPublicacion({ publicacion }) {
  const esPerdido = publicacion.estado === "PERDIDO";
  const foto = publicacion.imagenIds?.[0];

  return (
    <div className="col-12 col-md-6 col-lg-4">
      <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
        {foto && (
          <img
            src={foto}
            alt={publicacion.titulo}
            className="w-100"
            style={{ height: "180px", objectFit: "cover" }}
          />
        )}
        <div className="card-body">
          <span
            className={`badge rounded-pill mb-2 ${esPerdido ? "text-bg-danger" : "text-bg-success"}`}
          >
            {publicacion.estado}
          </span>
          <h3 className="h6 mb-1">{publicacion.titulo}</h3>
          <p className="text-secondary small mb-2">
            {publicacion.mascota?.especie} · {publicacion.mascota?.raza} ·{" "}
            {publicacion.mascota?.color}
          </p>
          <p className="small mb-0">{publicacion.descripcion}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomeView() {
  const { marcadores, publicaciones, cargando, error } = useHomeViewModel();

  return (
    <div className="py-4">
      <section className="container text-center mb-4">
        <span className="badge rounded-pill text-bg-light border mb-3">
          Sanos & Salvos
        </span>

        <h1 className="text-bg-light mb-3">
          Encuentra mascotas perdidas cerca de ti.
        </h1>

        <p className="lead text-secondary mb-0">
          Explora el mapa base de la plataforma para ubicar reportes de mascotas
          perdidas y encontradas.
        </p>
      </section>

      {error && (
        <div className="alert alert-warning" role="alert">
          {error}
        </div>
      )}

      {cargando ? (
        <div className="container text-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3">Cargando Publicaciones</p>
        </div>
      ) : (
        <>
          <MapView marcadores={marcadores} />

          <section className="container my-4">
            <h2 className="h4 text-bg-light mb-3">Publicaciones</h2>
            {publicaciones.length === 0 ? (
              <p className="text-secondary">Todavía no hay publicaciones.</p>
            ) : (
              <div className="row g-3">
                {publicaciones.map((publicacion) => (
                  <TarjetaPublicacion
                    key={publicacion.id}
                    publicacion={publicacion}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
