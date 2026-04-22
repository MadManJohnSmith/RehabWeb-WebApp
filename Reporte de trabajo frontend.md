# Reporte de trabajo — Frontend (Módulo 5)

Documento vivo: resume **qué se entregó en front** por historia de usuario (HU), en lenguaje claro y con detalle técnico cuando aporta contexto. Las historias nuevas se añaden **al final**, manteniendo el mismo formato.

**Referencias de producto:** `Historias de Usuario Modulo 5.md`, `Checklist-HU-Modulo-5-Frontend.md`, `Baseline-Tokens.md`.

---

## HU-01 — Dashboard de progreso visual

### Resumen (qué hace el usuario)

En el **tablero de control** (`/app`, ruta `dashboard`) el terapeuta ve un resumen con datos de demostración: alertas de inactividad, indicadores en anillo, **ROM semanal en barras**, una **gráfica de evolución** con línea de meta y línea observada, paneles laterales y tabla de sesiones recientes. Al pasar el ratón por los puntos de la gráfica aparece un texto con **valores numéricos** y el criterio de tendencia. Los puntos se pintan en **verde / coral / gris** según si respecto al **periodo anterior** hubo mejora, regresión o sin cambio (primer punto en gris).

### Detalle técnico

| Tema | Entrega |
|------|---------|
| Mock tipo API | `DashboardMetricsDto`, `DASHBOARD_METRICS_MOCK`, `DashboardDataService` (`getDashboardMetrics()`). El componente consume el payload con `toSignal`. |
| ROM | Sección dedicada alimentada por `romByWeek` del mismo mock. |
| N vs N−1 | Lógica en `dotsNvNMinus1` sobre `temporalSeries[].observedValue`. |
| Rendimiento (AC-03) | Datasets acotados; nota en UI y **§6** en `Baseline-Tokens.md` (sin Lighthouse en repo). |
| Rutas / vista | `DashboardPageComponent` — `src/app/workspace/pages/dashboard/`. |

### Ajustes de interfaz relacionados (misma época)

- **Barra lateral y contenido:** corrección de anchos flex y scroll para que el contenido no quede “despegado” y la **barra lateral no se desplace** con el scroll de la página (shell a altura de viewport, scroll solo en la columna principal).

---

## HU-02 — Generación de reportes clínicos

### Resumen (qué hace el usuario)

En **Generación de reportes** (`/app/reportes`) puede elegir **paciente** (obligatorio), **fecha desde** y **fecha hasta**; si algo falta o el rango es inválido, ve un aviso y los botones de exportación **no están activos**. **Descargar Excel** genera un **CSV de demostración** en el navegador y muestra un **toast**; **Descargar PDF** solo confirma el flujo con **toast** (no hay PDF binario). Hay un recuadro que muestra cómo iría la cabecera **`Authorization: Bearer …`** con un **token de terapeuta simulado** (no es login real).

### Detalle técnico

| Tema | Entrega |
|------|---------|
| Filtros + formulario | `ngModel` en paciente y fechas; `validateFilters()` / `isFormValid()`; botones `[disabled]` cuando el formulario es inválido. |
| Excel simulado | `Blob` + descarga `.csv` (solo en navegador; protegido con `isPlatformBrowser` por SSR). |
| PDF | Solo mensajes vía `ToastService` (sin backend). |
| JWT / rol terapeuta | `TherapistSessionService` + **§7** en `Baseline-Tokens.md`; DTO `ClinicalExportFiltersDto` para el cuerpo previsto de la petición. |
| Archivos | `reports-page.component.ts/html`, `therapist-session.service.ts`, `clinical-export-request.dto.ts`. |

---

## HU-03 — _(pendiente de añadir reporte)_

Cuando se implemente, documentar aquí: **resumen para usuario**, **ruta(s)**, **detalle técnico** (archivos / servicios mock) y **enlace al checklist** actualizado.

---

## HU-04 en adelante — _(pendiente)_

Mismo formato que HU-03.

---

*Última actualización de contenido: HU-01 y HU-02 cubiertas en este reporte.*
