export const environment = {
  production: false,
  nombreEmpresa: "RutaRola",
  /** API local: `cd api && docker compose up` (o `dotnet run --project src/RutaRola.Api`). */
  apiUrl: "http://localhost:8080/api/v1",
  /**
   * Los módulos que ya tienen API (ver `core/repositorios.ts`) usan HTTP. Para trabajar sin el API
   * (todo en `localStorage`): `npm run start:local`.
   */
  usarApi: true,
};
