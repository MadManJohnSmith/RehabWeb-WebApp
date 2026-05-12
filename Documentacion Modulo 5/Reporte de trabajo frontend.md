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

En **Generación de reportes** (`/app/reportes`) elige **paciente** (lista desde `GET /api/v1/patients/`), **fecha desde** y **fecha hasta**; si el formulario es inválido o el rango supera **366 días**, ve avisos y los botones quedan deshabilitados. **Descargar XLSX** o **Descargar PDF** llaman a `POST /api/v1/reports/export/`; el navegador descarga el binario (nombre preferente desde `Content-Disposition`). La cabecera de auth la añade el interceptor (**Token DRF**), no un JWT simulado.

### Detalle técnico

| Tema | Entrega |
|------|---------|
| Filtros + formulario | `ngModel`; `validateFilters()` / `isFormValid()`; rango máximo `MAX_CLINICAL_EXPORT_RANGE_DAYS` alineado al API. |
| Export real | `ClinicalExportApiService.requestExport()` — `observe: 'response'`, `responseType: 'blob'`; parseo de errores JSON en `Blob`. |
| PDF / XLSX | Cuerpo camelCase: `patientId`, `dateFrom`, `dateTo`, `format`: `pdf` \| `xlsx`. |
| Auth | Interceptor `Authorization: Token …`; copy en pantalla sin Bearer JWT. |
| Archivos | `reports-page.component.ts/html`, `clinical-export-api.service.ts`, `clinical-export-request.dto.ts`; `TherapistSessionService` deprecado (demo antigua). |

---

## HU-03 — Alertas proactivas de inactividad

### Resumen (qué hace el usuario)

En el **tablero** (`/app`) el bloque **amarillo** de inactividad indica cuántos pacientes llevan **más de 3 días** sin sesión; cada tarjeta lleva al **perfil** de ese paciente. Hay un botón de texto **“Job en servidor”** con *tooltip* que explica que en producción un **Cron** revisaría esto cada día. En **Alertas de inactividad** (`/app/alertas`) hay una **tabla** con el mismo criterio, enlaces al perfil y nota al pie; otro control explica el Cron (solo copy en demo).

### Detalle técnico

| Tema | Entrega |
|------|---------|
| Regla > 3 días | Copy en banner y en página de alertas; mock con días 5, 6 y 7 (todos > 3). |
| Enlaces | Tarjetas del dashboard → `[routerLink]="['/app/pacientes', p.patientId]"`; tabla → nombre + botón **Perfil** + `patientId` en `InactivityPatientDto` / filas mock. |
| Lista alertas | `GET /api/v1/inactivity-alerts/` vía `InactivityAlertsDataService.getAlertsView()`, mapper, `INACTIVITY_ALERTS_MOCK_VIEW` de respaldo; `patientId` numérico. |
| Cron (N/A front) | `title` / `aria-label` en dashboard y en `/app/alertas`; **§8** en `Baseline-Tokens.md`. |
| Archivos | `dashboard-metrics.dto/mock`, `dashboard-page`, `inactivity-alerts*.dto/mock/api.types/mapper`, `inactivity-alerts-data.service.ts`, `inactivity-alerts-page`. |

---

## HU-04 — Comparativa de desempeño (individual y grupal)

### Resumen (qué hace el usuario)

En **`/app/comparativa`** puede ver la **fórmula de progreso** en texto. La **vista individual** elige paciente (lista desde `GET /patients/`) y muestra **meta** (discontinua) y **observado** desde `temporalSeries` del API. La **vista grupal** marca varios pacientes (máx. 12 con el individual) y envía **`POST /api/v1/performance/compare/`**; las curvas usan `observedValue` con escala común de `groupBounds`. Tooltips usan `periodLabel`; regresión vía `trend === 'regressed'` cuando existe.

### Detalle técnico

| Tema | Entrega |
|------|---------|
| Datos | `PerformanceCompareApiService`, tipos en `performance-compare-api.types.ts`; sin `PATIENT_DETAIL_MOCK` en esta página. |
| Página | `ComparisonPerformancePageComponent` — `toSignal` + `combineLatest` + `distinctUntilChanged` + `POST` con `takeUntilDestroyed`. |
| Gráficos | SVG + `computed` desde payload API; escala grupal con `groupBounds` del servidor. |
| Fórmula | Bloque en UI + **§9** en `Baseline-Tokens.md`; `recoveryScorePercent` opcional en resumen API. |

---

## HU-05 — Historial técnico de sesiones

### Resumen (qué hace el usuario)

En **`/app/historial-sesiones`** ve una tabla **de la más reciente a la más antigua**, puede **buscar** por texto, **filtrar por paciente** y cambiar **cuántas filas por página** (5, 10 o 15) con botones de página. Al pulsar la **flecha** de una fila se abre un **panel lateral** con el detalle de esa sesión (notas, ejercicios, adherencia de demo); la información llega **por red simulada** sin recargar toda la página.

### Detalle técnico

| Tema | Entrega |
|------|---------|
| Mock lista | `session-history.dto.ts`, `sessions-list.mock.ts` (`satisfies` + orden explícito). |
| API simulada | `SessionHistoryApiService`: `searchSessions` (`timer`), `getSessionDetail` (`HttpClient` + `delay` + JSON en `public/mock/session-history.json`). |
| UI | `session-history-page.component.ts/html`: `toSignal` + `combineLatest` + `switchMap`, panel, `RouterLink` a ficha del paciente. |

---

## HU-06 — Gestión y asociación de pacientes (CRUD)

### Resumen (qué hace el usuario)

En **`/app/pacientes`** ve una **tabla** con ID, identificador de asociación, nombre (enlace a la **ficha**), diagnóstico, **estado** (riesgo / activo / alta con colores), última sesión y un menú **⋮**. Puede **buscar**, **vincular** un paciente nuevo (modal), **editar el diagnóstico** desde otro modal, **desvincular** (baja lógica: la fila se atenúa y marca “Desvinculado”) o **reactivar**. Los cambios se guardan en el **navegador** (`localStorage`); al abrir la ficha, el diagnóstico editado se refleja ahí cuando corresponde.

### Detalle técnico

| Tema | Entrega |
|------|---------|
| Registro | `PatientsRegistryService` — seed desde `PATIENT_DETAIL_MOCK`, `linkPatient`, `updateCondition`, `unlink` / `restore`. |
| UI | `patients-list-page` — modales, `FormsModule`, menú flotante, overlay cierre. |
| Perfil | `patient-detail-page` — `computed` fusiona `getDetailExtra` / fila del registro con mock gráfico. |
| Icono | `more-vertical` en `UiIconComponent` (Lucide). |

---

## HU-07 — Infraestructura de interfaz y navegación

### Resumen (qué hace el usuario)

El shell mantiene navegación consistente entre escritorio y móvil: **sidebar colapsable**, **drawer** con hamburguesa y accesos a módulos clave (incluye configuración placeholder y cerrar sesión). En rutas con carga simulada, como **`/app/historial-sesiones`**, se muestran estados explícitos de **carga**, **vacío** y **error** con opción de reintento, en vez de fallos silenciosos. Las pantallas no implementadas siguen en **“en construcción”** para no romper flujo.

### Detalle técnico

| Tema | Entrega |
|------|---------|
| Shell | `shell-layout` + `shell-sidebar`: drawer móvil, overlay y colapso en desktop con mismas rutas. |
| Responsive | Tablas con `overflow-x-auto`; gráficas con `viewBox` y contenedores fluidos (`min-w-0`). |
| Carga/error/vacío | `session-history-page`: `listVm` con `loading/error`, skeleton, bloque de error + reintento y estado vacío, además de panel de detalle con fallback. |
| En construcción | rutas placeholder (`under-construction-page`) para módulos pendientes. |

---

## HU-08 en adelante — _(pendiente)_

Mismo formato que HU-03.

---

*Última actualización de contenido: HU-01 a HU-07 cubiertas en este reporte.*
