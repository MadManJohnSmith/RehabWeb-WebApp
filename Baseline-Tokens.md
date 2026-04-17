# Baseline Token Set

Este documento define los colores, tipografías y tokens de diseño para el desarrollo de interfaces.

## 1. Roles de color

| Categoría | Token | Valor claro | Valor oscuro | Notas / uso |
|-----------|-------|-------------|--------------|-------------|
| Primario (acción / éxito) | Verde primario | `#00A781` | `#33C9A0` | Color de acción primario. Botones y enlaces. |
| Primario bajo | Verde primario bajo | `#E6F6F2` | `#0D3328` | Fondos suaves para elementos seleccionados. |
| Navegación / títulos | Azul oscuro texto | `#1A2B3E` | `#E2EAF4` | Texto primario y encabezados. Color constante de marca. |
| Fondo | Fondo aplicación | `#F8FAFC` | `#0F1923` | Lienzo principal de la aplicación. |
| Superficie | Fondo tarjeta / contenedor | `#FFFFFF` | `#1A2535` | Fondos de tarjetas y modales. |
| Texto secundario | Texto secundario | `#707E8C` | `#94A3B8` | Texto atenuado. Contraste ~4.5:1. |
| Texto atenuado | Texto deshabilitado | `#94A3B8` | `#607080` | Placeholders e iconografía deshabilitada. |
| Borde / divisor | Borde claro | `#E2E8F0` | `#2A3A4E` | Bordes estándar de UI. |
| Error / peligro | Estado peligro | `#FF5C5C` | `#FF8080` | Indicadores de riesgo y errores. |
| Fondo error | Fondo estado peligro | `#FFF0F0` | `#3D1010` | Banners de error y alertas inline. |
| Advertencia | Estado advertencia | `#FFB84D` | `#FFD080` | Indicadores de advertencia y badges. |
| Info / bueno | Estado info | `#4D94FF` | `#80B6FF` | Chips informativos e indicadores de progreso. |
| Anillo enfoque | Anillo enfoque | `#00A781` | `#33C9A0` | Contorno de 2 px. Cumple WCAG 2.2. |

## 2. Tipografía

- **Familia:** Inter (sans-serif).

### Tamaños de fuente

| Token | Tamaño | Uso |
|-------|--------|-----|
| XS | 12 px | Leyendas |
| S | 14 px | Cuerpo pequeño |
| M (base) | 16 px | Texto base / 1 rem |
| L | 20 px | Encabezados de sección |
| XL | 24 px | Títulos de página |
| 2XL | 32 px | Encabezados display |

### Pesos y estilos

- **Regular (400):** Cuerpo de texto.
- **Medium (500):** Subtítulos y etiquetas de UI.
- **Bold (700):** Encabezados y énfasis fuerte.

### Alto de línea

- **Sólido:** 1.2  
- **Predeterminado:** 1.5  
- **Suelto:** 1.8  

### Espaciado de letra

- **Normal:** 0  
- **Ancho:** 0.5 px  

## 3. Espaciado y radios

### Espaciado (incrementos de 4 px)

| Token | Valor | Uso |
|-------|-------|-----|
| 0 — Cero | 0 px | — |
| 1 — XXS | 4 px | Brechas internas |
| 2 — XS | 8 px | Icono a etiqueta |
| 3 — SM | 16 px | Campos de formulario |
| 4 — MD | 24 px | Relleno de tarjeta |
| 5 — LG | 32 px | Relleno de sección |
| 6 — XL | 40 px | — |
| 7 — 2XL | 48 px | — |
| 8 — 3XL | 64 px | Márgenes de página |

### Radios de borde

| Token | Valor | Uso |
|-------|-------|-----|
| Ninguno | 0 px | — |
| SM | 4 px | Inputs |
| MD | 8 px | Sidebar, dropdowns |
| LG | 12 px | Tarjetas, modales |
| XL | 16 px | Botones, elementos prominentes |
| Píldora | 9999 px | Insignias, estados |

## 4. Elevación y movimiento

### Elevación (sombras)

| Nivel | Claro | Oscuro |
|-------|--------|--------|
| 0 — Plano | Ninguna | Ninguna |
| 1 — SM | `0 1px 3px 0 rgba(0, 0, 0, 0.10)` | `0 1px 3px 0 rgba(0, 0, 0, 0.25)` |
| 2 — MD | `0 4px 6px -1px rgba(0, 0, 0, 0.10)` | `0 4px 6px -1px rgba(0, 0, 0, 0.30)` |
| 3 — LG | `0 10px 15px -3px rgba(0, 0, 0, 0.10)` | `0 10px 15px -3px rgba(0, 0, 0, 0.35)` |

### Movimiento (duración)

| Token | Duración | Uso |
|-------|----------|-----|
| Rápido | 100 ms | Hover |
| Base | 200 ms | Transiciones UI |
| Lento | 400 ms | Fade-in modal |

## 5. Estructura de interfaz (PhysioMetrics)

Basado en las capturas de pantalla.

### Navegación lateral

- Tablero de control  
- Pacientes  
- Historial de sesiones  
- Comparativa de desempeño  
- Alertas de inactividad  
- Generación de reportes  

### Secciones principales

| Sección | Descripción |
|---------|-------------|
| **Generación de reportes** | Exportación de datos clínicos (Excel/PDF). |
| **Comparativa de desempeño** | Rango de movimiento (ROM) y score de recuperación. |
| **Historial de sesiones** | Registro detallado de intervenciones. |
| **Directorio de pacientes** | Gestión y monitoreo de perfiles clínicos. |
| **Tablero de control** | Resumen general de evolución y alertas de inactividad. |
