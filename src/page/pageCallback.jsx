import "../style/callBack.css"

export default function Page404() {
  return (
    <div className="content-callback">
      <div className="page-callback">
        <h1>This is fine... But... 404</h1>
        <p>Lo siento, la página que estás buscando no se pudo encontrar.</p>
        <div className="button-callback">
          <a href="/">
              <button className="boton-callback">Volver al inicio</button>
          </a>
        </div>
      </div>
    </div>
  );
}
