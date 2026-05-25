# Dashboard de cuidado de plantas

App web estática para hacer seguimiento a plantas de interior, priorizar acciones urgentes y mantener una bitácora con mediciones y fotos. Está pensada para publicarse en GitHub Pages y no necesita servidor ni base de datos.

## Archivos

- `index.html`: estructura de la app.
- `styles.css`: diseño responsive tipo dashboard botánico.
- `app.js`: reglas de decisión, filtros, tareas, bitácora, gráficas y localStorage.
- `data/plants.json`: datos iniciales importados desde `plantas_cuidado_dashboard.xlsx`.
- `manifest.webmanifest`: configuración para instalarla como web app.
- `service-worker.js`: cache básico para abrirla más rápido y con soporte offline inicial.
- `icons/`: íconos para Android, iPhone y navegador.

## Uso local

Abre una terminal en esta carpeta y corre:

```bash
python3 -m http.server 8000
```

Luego abre `http://localhost:8000`. El servidor local es necesario porque el navegador debe cargar `data/plants.json`.

## Cómo se guardan los cambios

La app guarda registros, tareas completadas, nuevas plantas, mediciones y fotos en `localStorage` del navegador. Para hacer backup usa el botón `Exportar JSON`. Para restaurar o mover tus datos a otro navegador usa `Importar JSON`.

Las fotos se guardan como datos base64 dentro del JSON exportado, así que el archivo puede crecer si subes muchas fotos.

## Editar o agregar plantas

Puedes agregar plantas desde el botón `Nueva planta`. También puedes editar manualmente `data/plants.json` siguiendo esta estructura mínima:

```json
{
  "id": 30,
  "commonName": "Nombre común",
  "probableSpecies": "Especie probable",
  "location": "Sala",
  "zone": "normal",
  "plantType": "tropical",
  "humidifierPriority": "media",
  "currentPH": 6.8,
  "currentMoisture": 45,
  "currentLight": 1200,
  "temperature": "21°C",
  "generalState": "Estable",
  "diagnosis": "Sin problemas visibles",
  "mainProblem": "",
  "urgentActions": "",
  "maintenanceActions": "Revisión semanal",
  "reviewFrequency": "Semanal",
  "lastReviewDate": "2026-05-25",
  "nextRecommendedAction": "Revisar humedad",
  "measurements": [],
  "photos": []
}
```

Valores recomendados:

- `zone`: `humidificador`, `normal` o `seca`.
- `plantType`: `tropical`, `tropical_exigente` o `cactus_sansevieria`.
- `humidifierPriority`: `alta`, `media`, `baja` o `no`.

## Reglas de alertas

La app marca alertas para:

- Riego urgente en tropicales con humedad menor a 20%.
- Riesgo de pudrición en tropicales con humedad mayor a 80%.
- Exceso de agua en cactus/sansevieria con humedad mayor a 50%.
- Alcalinidad alta en tropicales con pH mayor a 7.5.
- Corrección prioritaria de pH con pH mayor a 8.0.
- Movimiento a zona humidificador si la prioridad es alta y la planta no está allí.
- Baja luz en tropicales exigentes.
- Posible estrés, trasplante o revisión de raíces cuando el diagnóstico lo sugiere.

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub.
2. Sube el contenido de esta carpeta.
3. En GitHub, entra a `Settings > Pages`.
4. En `Build and deployment`, elige `Deploy from a branch`.
5. Selecciona la rama `main` y la carpeta `/root`.
6. Guarda los cambios y espera a que GitHub publique la URL.

Si prefieres poner esta app dentro de un repositorio con otros archivos, sube la carpeta completa `plant-care-dashboard` y configura GitHub Pages para publicar desde esa carpeta, o mueve estos archivos a la raíz del repositorio.

## Instalar en el teléfono

Después de publicarla en GitHub Pages:

### iPhone

1. Abre la URL en Safari.
2. Toca el botón de compartir.
3. Elige `Agregar a pantalla de inicio`.
4. Confirma el nombre `Mis plantas`.

### Android

1. Abre la URL en Chrome.
2. Toca el menú de tres puntos.
3. Elige `Instalar app` o `Agregar a pantalla principal`.
4. Confirma la instalación.

La app se abrirá en modo independiente, con ícono propio. Los datos se siguen guardando en el navegador del teléfono; usa `Exportar JSON` como copia de seguridad.

## Avisos básicos

La app incluye avisos simples sin backend:

- Muestra una franja de cuidados urgentes al abrir el dashboard.
- Permite tocar `Activar avisos` para pedir permiso de notificaciones del navegador.
- Si hay tareas vencidas o para hoy, muestra una notificación cuando la app está abierta.
- Revisa de nuevo cada 30 minutos mientras la app siga abierta.

Estos avisos no son push remotos. Si el teléfono cierra completamente la app, el sistema puede dejar de revisar recordatorios hasta que vuelvas a abrirla.
