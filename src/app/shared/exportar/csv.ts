/**
 * Descarga una tabla como CSV (separador `;` y BOM para que Excel en
 * español lo abra con tildes y columnas correctas).
 */
export function descargarCsv(nombreArchivo: string, encabezados: string[], filas: (string | number)[][]): void {
  const escapar = (valor: string | number) => {
    const texto = String(valor ?? '');
    return /[";\n]/.test(texto) ? `"${texto.replaceAll('"', '""')}"` : texto;
  };
  const contenido = [encabezados, ...filas].map((fila) => fila.map(escapar).join(';')).join('\r\n');
  const blob = new Blob(['﻿' + contenido], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo.endsWith('.csv') ? nombreArchivo : `${nombreArchivo}.csv`;
  enlace.click();
  URL.revokeObjectURL(url);
}
