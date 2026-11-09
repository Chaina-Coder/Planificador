# Planificador de viaje · Netlify Blobs

## Publicación

1. Importa esta carpeta como proyecto en Netlify mediante Git o Netlify CLI. **Netlify Drop no instala las dependencias ni compila las Functions** y no sirve para esta versión.
2. Configura la variable de entorno `PLANNER_PASSWORD` con una contraseña larga y exclusiva, disponible para Functions.
3. Despliega con `npm install && netlify deploy --build --prod` (requiere Netlify CLI y haber vinculado el sitio), o usa Git con el build automático de Netlify.
4. Abre la web y pulsa **Conectar nube**. Introduce la contraseña; se conserva solo en la sesión de esa pestaña.
5. El primer dispositivo sube sus datos locales; en los siguientes dispositivos usa la misma contraseña y URL.

## Notas técnicas y límites

- Almacenamiento: un registro JSON por visita, gasto, souvenir y configuración en Netlify Blobs, con lectura consistente.
- Sincronización automática diferida 1,4 segundos; al recuperar conexión, volver a la pestaña y cada 90 segundos mientras esté visible.
- Cambios offline: cola persistente en localStorage. Exporta respaldos JSON periódicamente.
- Conflictos: versiones optimistas por registro, devuelve HTTP 409 y no sobrescribe deliberadamente el registro cambiado. **No es una transacción CAS atómica**, así que dos escrituras exactamente simultáneas al mismo registro aún podrían competir; para garantías estrictas se requiere una base de datos transaccional.
- Los datos se comparten mediante una contraseña común. No hay cuentas ni roles individuales. Evita introducir datos sensibles.
- Las funciones y Blobs consumen recursos del plan de Netlify. El objetivo de 100 créditos no puede garantizarse; revisa el panel de uso de Netlify.
- Si ya usabas la versión local, exporta primero un respaldo y prueba la migración en un solo dispositivo antes de conectar otros.


## Versión 3
- Nuevo mapa Leaflet/OpenStreetMap a pantalla completa, localización de visitas y trazado de rutas caminando o en automóvil mediante servicio público de rutas (sujeto a disponibilidad). Para transporte público usar Google Maps.
- Cabecera fija con saldo real y saldo proyectado separados. El saldo real descuenta solo Pagado; el proyectado descuenta todos los gastos seleccionados, incluyendo pagados.
- Los datos existentes no se eliminan; se mantiene la estructura JSON y la sincronización de Netlify.
- Los servicios de geocodificación/rutas públicos requieren conexión y pueden limitar peticiones; no hay garantía de disponibilidad ni de exactitud.
