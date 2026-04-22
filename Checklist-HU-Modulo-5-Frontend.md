# Checklist — Cumplimiento HU (solo frontend y mocks)

Objetivo: definir **qué debe existir en interfaz y datos simulados** para alinearse con cada historia de usuario mientras **no hay backend**. Los ítems `[ ]` sirven para ir tachando cuando implementéis cada punto.

**Leyenda de revisión preliminar** (solo lectura del repo a fecha de elaboración):

| Símbolo | Significado |
|--------|--------------|
| **Sí** | Cubierto de forma razonable con UI + mocks |
| **Parcial** | Hay algo, pero no cumple del todo el criterio o falta pulir |
| **No** | No cubierto en frontend |
| **N/A** | Depende exclusivamente de servidor / no aplica en mock |

---

## HU-01 — Dashboard de progreso visual

*Objetivo en front:* que el terapeuta vea tendencias con gráficas y feedback interactivo usando **JSON mock** (simulando el resultado de futuras consultas SQL).

### Checklist (frontend + mocks)

- [x] **Representación de datos de métricas:** al menos una vista que muestre **serie temporal** agregada o por cohorte (mock tipo “respuesta API” en TypeScript/servicio simulado).
- [x] **ROM u otra métrica clínica:** gráfica o visualización explícita de ROM o equivalente (barras, líneas o anillos) alimentada por mock, no hardcode “muerto” sin estructura de DTO.
- [x] **Tooltip en interacción:** `mouseover` / `mousemove` (o equivalente accesible) que muestre **valor numérico exacto** del punto.
- [x] **Codificación N vs N−1:** nodos o segmentos en **verde** si el valor mejora respecto al punto anterior y **rojo/coral** si empeora (regla explícita en código, no solo vs “meta”).
- [x] **Rendimiento (< 3 s):** gráficas sin bloquear el hilo principal (datasets mock acotados); opcional: medición en Lighthouse o marca de tiempo en `Performance` en entorno de demo documentada.

### Revisión preliminar

| AC | Notas rápidas |
|----|-----------------|
| AC-01 (Datos / SQL→JSON) | **Sí:** `DashboardMetricsDto` + `DASHBOARD_METRICS_MOCK` + `DashboardDataService` simulan payload; dashboard y ROM leen del mismo origen. |
| AC-02 (Interactividad / color) | **Sí:** tooltips con valores y Δ; nodos coloreados por **N vs N−1** (meta sigue en línea discontinua). |
| AC-03 (Rendimiento) | **Parcial:** mock acotado + nota en UI y `Baseline-Tokens.md` §6; sin Lighthouse formal en repo. |

---

## HU-02 — Generación de reportes clínicos

*Objetivo en front:* pantalla de exportación con **filtros** y acciones que **simulen** PDF/Excel hasta existir el join en servidor.

### Checklist (frontend + mocks)

- [x] **UI de exportación:** botones o flujo claro “Descargar Excel” / “Descargar PDF” (aunque solo disparen descarga simulada o toast).
- [x] **Filtros obligatorios:** selector de paciente (ID o lista) + **rango de fechas** enlazados al estado del formulario (mock o `ngModel`).
- [x] **Feedback post-acción:** mensaje de éxito/error simulado (toast o banner) sin asumir binarios reales.
- [x] **Rol terapeuta (JWT):** en front solo se puede **preparar** envío de `Authorization` en `HttpClient` cuando exista login; checklist: documentar header esperado o guard mock de “sesión terapeuta”.

### Revisión preliminar

| AC | Notas rápidas |
|----|-----------------|
| AC-01 (PDF/Excel backend) | **N/A** en servidor; **Sí** en demo UI: Excel → CSV simulado + toast; PDF → toast (sin binario). |
| AC-02 (Filtros) | **Sí:** paciente obligatorio + rango de fechas con validación y botones deshabilitados si el formulario es inválido. |
| AC-03 (JWT rol terapeuta) | **Parcial:** mock `TherapistSessionService` + cabecera en pantalla y §7 en `Baseline-Tokens.md`; integración real pendiente de login/JWT. |

---

## HU-03 — Alertas proactivas de inactividad

*Objetivo en front:* reflejar la **regla > 3 días** y la **navegación** hacia seguimiento; el *Cron* es backend.

### Checklist (frontend + mocks)

- [x] **Banner en dashboard:** componente visible (p. ej. amarillo) con texto de alerta y contador o lista de afectados **mock** coherente con “> 3 días”.
- [x] **Enlace a seguimiento:** al menos un **hipervínculo** a ruta de alertas, perfil de paciente o lista filtrada por inactivos.
- [x] **Página de alertas:** tabla o lista que muestre pacientes inactivos con criterio **> 3 días** explicado en copy o en datos mock.
- [x] **Simulación de “job”:** opcional en front: comentario o tooltip “En producción: Cron diario” (no sustituye AC real de servidor).

### Revisión preliminar

| AC | Notas rápidas |
|----|-----------------|
| AC-01 (Cron / > 3 días) | **N/A** *Cron*; **Sí** en mock: valores >3, copy + tooltip; **§8** `Baseline-Tokens.md`. |
| AC-02 (UI banner + enlace) | **Sí:** “Ver todos” + **cada tarjeta del banner** enlaza a `/app/pacientes/:id`; tabla de alertas con enlaces a perfil. |

---

## HU-04 — Comparativa de desempeño (individual y grupal)

*Objetivo en front:* gráfica **meta vs real**; multi-selección y fórmula documentada en UI o en código comentado/mock.

### Checklist (frontend + mocks)

- [x] **Vista individual:** dos series superpuestas (“Meta inicial” / “Desempeño real”) + leyenda + tooltips.
- [x] **Fórmula de progreso:** imagen o texto en UI que reproduzca la fórmula del documento HU (o implementación mock alineada a ella).
- [x] **Vista grupal:** selector múltiple de pacientes y un solo canvas/tabla comparativa de *recovery scores* (datos mock).
- [x] **Ruta accesible:** entrada desde menú (no solo “en construcción” sin prototipo).

### Revisión preliminar

| AC | Notas rápidas |
|----|-----------------|
| AC-01 (Cálculo / capas) | **Sí:** `/app/comparativa` con meta vs real + fórmula en texto; **§9** `Baseline-Tokens.md`; figura PNG del doc HU sigue siendo opcional en repo. |
| AC-02 (Multiusuario) | **Sí:** checkboxes + un SVG con una curva «real» por paciente (recovery proxy) y leyenda. |

---

## HU-05 — Historial técnico de sesiones

*Objetivo en front:* lista **ordenada**, **paginada** (aunque sea cliente al inicio) y **detalle** vía petición simulada sin recargar toda la página.

### Checklist (frontend + mocks)

- [x] **Orden cronológico descendente** en la tabla principal (fecha más reciente arriba), verificable en datos mock.
- [x] **Paginación:** controles de página y tamaño de página (mock cliente o servidor simulado con `HttpClient` + `delay`).
- [x] **Detalle de sesión:** al elegir fila o botón, cargar panel/modal/ruta hija con `HttpClient.get` a **JSON estático** o `of()` RxJS sin `window.location.reload`.
- [x] **Búsqueda / filtros** opcionales alineados a la tabla enriquecida del brief.

### Revisión preliminar

| AC | Notas rápidas |
|----|-----------------|
| AC-01 (Orden + paginación) | **Sí:** mock ordenado + paginación cliente con `timer` simulado vía `SessionHistoryApiService.searchSessions`; selector de tamaño de página (5/10/15). |
| AC-02 (AJAX detalle) | **Sí:** panel lateral; `HttpClient.get('/mock/session-history.json')` + `delay`; fallback de detalle desde fila si no hay entrada en JSON. |

---

## HU-06 — Gestión y asociación de pacientes (CRUD)

*Objetivo en front:* lista con **búsqueda**, acciones de **edición / baja lógica**, **estados** Riesgo / Activo / Alta (mock).

### Checklist (frontend + mocks)

- [ ] **Lista de pacientes** con ID único visible y navegación a ficha.
- [ ] **Búsqueda / filtro** por identificador o nombre (mock).
- [ ] **Asociación (UI):** flujo “vincular paciente existente” simulado (modal + confirmación) aunque persista en `localStorage` o memoria.
- [ ] **Edición de diagnóstico** desde la lista (inline o modal) actualizando el modelo mock.
- [ ] **Soft delete:** acción “Desvincular” que marque `deletedAt` / `activo: false` en mock y oculte o degrade la fila.
- [ ] **Menú contextual** (tres puntos o similar) para acciones.
- [ ] **Badge de estado:** Riesgo / Activo / Alta con color semántico en cada fila.

### Revisión preliminar

| AC | Notas rápidas |
|----|-----------------|
| AC-01 (Asociación / búsqueda) | **Parcial:** lista + enlace a detalle; **no** hay búsqueda ni flujo de vinculación explícito. |
| AC-02 (Edición / soft delete / menú) | **No.** |
| AC-03 (Estado Riesgo/Activo/Alta) | **No.** |

---

## HU-07 — Infraestructura de interfaz y navegación

*Objetivo en front:* shell coherente, responsive, estados vacíos/carga/errores y módulos “en obras” sin romper la app.

### Checklist (frontend + mocks)

- [ ] **Sidebar colapsable** (desktop) y **drawer** en móvil con mismas rutas.
- [ ] **Accesos:** tablero, pacientes, reportes, configuración (o equivalente), **cerrar sesión** claro.
- [ ] **Tablas:** scroll horizontal o cards en `max-md` donde la tabla no quepa.
- [ ] **Gráficas:** contenedor que escale (`viewBox`, `min-w-0`, alturas fluidas).
- [ ] **Estados de carga:** *skeleton* o *spinner* en rutas que consuman `HttpClient` (cuando existan llamadas reales); con mocks, simular `delay` y mostrar loading.
- [ ] **Vacío / error / en construcción:** pantalla o bloque dedicado + **sin** errores no capturados en consola en flujos normales.
- [ ] **Toasts o banners** para acciones simuladas (ya alineado con “estado controlado”).

### Revisión preliminar

| AC | Notas rápidas |
|----|-----------------|
| AC-01 (Sidebar) | **Parcial:** colapsable, menú hamburguesa, rutas principales; “Configuración” va a **en construcción** (aceptable como placeholder si está documentado). |
| AC-02 (Responsive) | **Parcial:** muchas vistas adaptan; falta repaso sistemático tabla+gráfica en todas las pantallas. |
| AC-03 (Carga / errores) | **Parcial:** toasts y página en construcción; **faltan** skeletons globales y manejo explícito de error HTTP en vistas con datos remotos (aún no hay API). |

---

## Resumen por prioridad (siguiente oleada sugerida)

1. **HU-06** — mayor brecha: CRUD mock, estados y soft delete.  
2. **HU-05** — detalle asíncrono real (modal/ruta + `HttpClient` mock) y paginación simulada servidor.  
3. **HU-04** — pantalla comparativa con multi-select y fórmula visible.  
4. **HU-01** — alinear color de nodos a regla **N vs N−1** y capa DTO/servicio mock.  
5. **HU-03** — enlaces del banner a perfil por paciente.  
6. **HU-02 / HU-07** — refinar JWT cuando exista auth; medir rendimiento y unificar estados de carga/error.

---

*Este archivo es solo el checklist acordado; las implementaciones se harán después según prioridad.*
