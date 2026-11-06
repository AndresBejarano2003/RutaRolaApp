export const environment = {
  production: true,
  nombreEmpresa: "RutaRola",
  /**
   * URL del API en producción: `https://<host-del-api>/api/v1`. Se define al desplegar el API
   * (o se usa un proxy de Netlify de `/api/*` al API).
   */
  apiUrl: "/api/v1",
  /** Producción sigue en modo local hasta desplegar el API; entonces pasar a `true`. */
  usarApi: false,
};
