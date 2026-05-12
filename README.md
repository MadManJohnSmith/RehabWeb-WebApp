# RehabWeb-WebApp

Frontend para la webapp de fisioterapia **RehabWeb**, construido con Angular 20, Angular Material, Bootstrap 5 y SCSS.

---

## 📋 Tabla de Tecnologías

| Tecnología | Versión |
|---|---|
| Angular | 20 |
| Angular Material | ^20.2.14 |
| Angular CDK | ^20.2.14 |
| Bootstrap | ^5.3.8 |
| Bootstrap Icons | ^1.13.1 |
| Material Icons | ^1.13.14 |
| jQuery | ^4.0.0 |
| TypeScript | ~5.8 |
| SCSS | (integrado con Angular CLI) |

---

## 🚀 Instalación paso a paso

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd RehabWeb-WebApp
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Iniciar servidor de desarrollo

```bash
ng serve
```

La aplicación estará disponible en: `http://localhost:4200/`

### 4. Compilar para producción (opcional)

```bash
ng build
```

Los archivos generados se almacenarán en la carpeta `dist/`.

---

## 📁 Estructura del proyecto

```
src/app/
├── guards/          ← Auth guards
├── interceptors/    ← HTTP interceptors (auth token)
├── models/          ← Interfaces TypeScript
├── screens/         ← Componentes de pantalla (páginas)
├── services/        ← Servicios HTTP por rol
├── shared/          ← Componentes reutilizables
└── partials/        ← Componentes parciales (navbar, sidebar, footer)
```

### Archivos clave

| Archivo | Descripción |
|---|---|
| `app.config.ts` | Zoneless, HttpClient + interceptor de token, router, SSR |
| `src/app/core/auth.service.ts` | Login / logout contra `/api/v1/auth/login` y `logout` |
| `src/app/core/auth.guard.ts` | Protege rutas bajo `/app` (requiere token en el navegador) |
| `src/app/workspace/services/patients-api.service.ts` | HU-06: lista, ficha, vincular, PATCH, unlink/restore |
| `src/app/workspace/services/session-history-api.service.ts` | HU-05: lista y detalle de sesiones (`/sessions/`) |
| `src/app/workspace/services/dashboard-data.service.ts` | HU-01: `GET /me/dashboard/`; mapper en `data/dashboard-metrics.mapper.ts` |
| `src/app/workspace/services/inactivity-alerts-data.service.ts` | HU-03: `GET /inactivity-alerts/`; mapper en `data/inactivity-alerts.mapper.ts` |
| `src/app/workspace/services/clinical-export-api.service.ts` | HU-02: `POST /reports/export/` (PDF/XLSX, `responseType: 'blob'`) |
| `src/app/workspace/services/performance-compare-api.service.ts` | HU-04: `POST /performance/compare/` (`patientIds`) |
| `app.routes.ts` | Definición de rutas de la aplicación |
| `app.html` | Template principal de la aplicación |
| `app.scss` | Estilos globales de la aplicación |

---

## 🔗 Conexión con el Backend

Este frontend se conecta a la API REST de **RehabWeb-Api** (Django REST Framework).

- Base del API (desarrollo): `http://127.0.0.1:8000/api/v1` — definida en `src/environments/environment.ts`.
- El backend tiene CORS configurado para aceptar peticiones desde `http://localhost:4200`.
- **Autenticación:** token DRF. Tras iniciar sesión en `/login`, las peticiones al API envían `Authorization: Token <clave>`. Ver `AuthService`, `AuthTokenStore` y `auth-http.interceptor.ts` en `src/app/core/`.
- **Arranque típico:** levantar MySQL + `python manage.py runserver` en el API, luego `ng serve` aquí. Sin API, el login mostrará error (red o mensaje del servidor).
- **Pacientes (HU-06):** el directorio y la ficha usan IDs **numéricos** del backend en la URL (`/app/pacientes/12`). Hay tests unitarios de mappers y `AuthService` (ver sección **Tests** más abajo).
- **Sesiones (HU-05):** el historial usa `GET /api/v1/sessions/` y el panel lateral `GET /api/v1/sessions/<id>/`. El filtro “por paciente” se rellena con los vínculos del terapeuta vía `GET /api/v1/patients/`.
- **Dashboard (HU-01):** métricas desde `GET /api/v1/me/dashboard/`; si la petición falla, el servicio usa el mock local para no dejar la pantalla vacía.
- **Inactividad (HU-03):** listado desde `GET /api/v1/inactivity-alerts/` (`thresholdDays`, `inactiveCount`, `alerts[]`); si falla, mock de respaldo.
- **Exportación clínica (HU-02):** `POST /api/v1/reports/export/` con `patientId` (entero), fechas y `format`: `pdf` o `xlsx`; descarga vía `Blob` y nombre desde `Content-Disposition` o convención local.
- **Comparativa (HU-04):** `POST /api/v1/performance/compare/` con `patientIds` (hasta 12); la pantalla `/app/comparativa` dibuja series desde `patients[].temporalSeries` y escala grupal con `groupBounds`.

**Variables de entorno / build**

- Desarrollo: `src/environments/environment.ts` → `apiBaseUrl` (por defecto `http://127.0.0.1:8000/api/v1`, sin barra final o con la misma política que `ApiConfigService.url()`).
- Producción: `src/environments/environment.prod.ts` sustituido vía `fileReplacements` en `angular.json` al compilar con configuración `production`.
- El token DRF se guarda en el navegador (`localStorage`, clave interna del `AuthTokenStore`); no usar `Bearer` en llamadas al API de este proyecto.

### Checklist de integración manual (antes de release)

Marca en equipo tras verificar en navegador con API + MySQL reales:

1. Login → dashboard → lista pacientes → detalle → historial de sesiones → alertas → exportación PDF/XLSX → comparativa (flujo feliz con usuario terapeuta).
2. **401:** token inválido o caducado → redirección a `/login` y sesión limpia (interceptor).
3. **403 / sin terapeuta:** mensaje del API en pantallas que llamen endpoints protegidos (export, dashboard, etc.); comprobar que el texto sea comprensible.
4. **Paginación:** lista de pacientes y de sesiones con muchos registros (`page` / `page_size`).

---

## 🧪 Tests unitarios (Karma + Jasmine)

- Comando: `npm test` (equivale a `ng test`).
- Incluyen adaptadores `mapDashboardApiToDto`, `mapInactivityApiResponseToView` / `mapInactivityApiItemToRow` y `AuthService` (login + logout con `HttpClientTestingModule`).
- **Requisito local:** navegador Chrome instalado o variable de entorno `CHROME_BIN` apuntando al ejecutable, porque Karma usa `ChromeHeadless` por defecto del builder. Si falla el launcher, instala Chrome o define `CHROME_BIN` y vuelve a ejecutar `npm test`.

---

## 🌿 Estrategia de Branching

Este proyecto sigue una estrategia de branching por equipos con revisión en staging.

### Diagrama de flujo

```
main ← staging ← equipo/{nombre} ← dev/{nombre-desarrollador}
```

### Ramas principales

| Rama | Propósito | ¿Quién hace merge aquí? |
|------|-----------|-------------------------|
| `main` | Producción estable. Solo código probado y aprobado. | Líder del proyecto tras aprobación en staging |
| `staging` | Rama de integración y pruebas. Aquí se valida que todos los equipos funcionen juntos. | Líderes de equipo |
| `equipo/equipo-1` | Rama principal del Equipo 1. | Los desarrolladores del Equipo 1 |
| `equipo/equipo-2` | Rama principal del Equipo 2. | Los desarrolladores del Equipo 2 |
| `equipo/equipo-3` | Rama principal del Equipo 3. | Los desarrolladores del Equipo 3 |
| `equipo/equipo-4` | Rama principal del Equipo 4. | Los desarrolladores del Equipo 4 |
| `equipo/equipo-5` | Rama principal del Equipo 5. | Los desarrolladores del Equipo 5 |
| `equipo/equipo-6` | Rama principal del Equipo 6. | Los desarrolladores del Equipo 6 |
| `dev/{nombre}` | Rama personal de cada desarrollador (ej: `dev/juan-lopez`). | El desarrollador individual |

### Flujo de trabajo

1. **Cada desarrollador** trabaja en su rama personal `dev/{nombre}`.
2. Al terminar su sprint o tarea asignada, el desarrollador crea un **Pull Request** hacia la rama de su equipo `equipo/{nombre}`.
3. El **líder de equipo** revisa el PR y hace merge a `equipo/{nombre}`.
4. Cuando el equipo completa su sprint, el líder crea un **Pull Request** de `equipo/{nombre}` → `staging`.
5. En `staging` se ejecutan **pruebas de integración** para verificar que todo funcione en conjunto.
6. Si las pruebas pasan, se crea un **Pull Request** de `staging` → `main`.

### Convención de commits

Usar el formato **Conventional Commits**:

```
<tipo>(<alcance>): <descripción corta>

[cuerpo opcional]
```

#### Tipos permitidos

| Tipo | Uso |
|------|-----|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Cambios en documentación |
| `style` | Formato, punto y coma faltantes, etc. (no cambia lógica) |
| `refactor` | Refactorización de código (no agrega ni corrige) |
| `test` | Agregar o corregir tests |
| `chore` | Tareas de mantenimiento (dependencias, configs) |

#### Ejemplos

```
feat(auth): agregar endpoint de login con JWT
fix(formulario): corregir validación de email en registro
docs(readme): actualizar instrucciones de instalación
refactor(servicios): extraer lógica de HTTP a servicio base
chore(deps): actualizar Angular a v20.3
```

### Reglas importantes

> ⚠️ **NUNCA** hacer push directo a `main` o `staging`.
>
> ⚠️ **SIEMPRE** crear Pull Requests para cualquier merge entre ramas.
>
> ⚠️ Antes de crear un PR, hacer `git pull` de la rama destino para evitar conflictos.
