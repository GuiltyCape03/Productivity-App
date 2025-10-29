# NeuralDesk

NeuralDesk es un panel de productividad construido con Next.js 14 y Tailwind que combina planificación asistida por IA, integración opcional con Google Calendar y un workspace tipo Notion. El objetivo principal es ayudarte a definir un mínimo viable diario, visualizar tu avance y recibir recomendaciones inteligentes sobre qué atacar a continuación.

## Características principales

- **Panel modular**: tareas, metas, workspace, calendario y copiloto IA viven en módulos independientes dentro de `modules/` para favorecer el mantenimiento.
- **IA integrada**: el motor en `lib/ai/` analiza tareas y metas para generar un snapshot de foco, estimar la carga diaria y alimentar un chatbot que entiende tus proyectos.
- **Chat en streaming**: la ruta `/chat` consume el endpoint server-side `/api/chat` con la Responses API de OpenAI para entregar respuestas en vivo, memoria corta por proyecto y botón de borrado de historial.
- **Workspace tipo Notion**: crea páginas personalizadas con bloques de texto, checklist, callouts, divisores y encabezados.
- **Google Calendar opcional**: conecta tu cuenta (mock) para sincronizar eventos y ver tu agenda en contexto.
- **Personalización visual**: ajusta tema, densidad, sombras, tonos de tarjetas y acento de color desde el panel de preferencias.
- **Pestañas dinámicas**: la barra superior permite crear, renombrar, reordenar y cerrar pestañas que apuntan a rutas como Dashboard, Tasks, Goals, Workspace, Calendar, Coach y Chat. Se sincronizan en `localStorage` bajo la clave `nd.tabs.v1`.

## Diseño y temas

- **Tipografías**: el proyecto carga [Inter](https://fonts.google.com/specimen/Inter) como tipografía base y [Noto Color Emoji](https://fonts.google.com/noto/specimen/Noto+Color+Emoji) para los iconos tipo Notion mediante `next/font/google`. Las familias se inyectan como variables CSS `--font-sans` y `--font-emoji`.
- **Tokens**: los colores clave se definen en `app/globals.css` usando variables (`--surface-base`, `--surface-elevated`, `--surface-muted`, `--foreground-strong`, `--accent-*`) y se exponen en Tailwind a través de `tailwind.config.ts`. También se definen variables para el padding dinámico de las tarjetas según la densidad seleccionada.
- **Modo claro/oscuro**: el tema activo se controla con el atributo `data-theme` del elemento `<html>`. Desde la UI puedes alternarlo en **Personaliza → Tema**, o manualmente estableciendo `document.documentElement.dataset.theme = "light" | "dark"`. El modo claro usa superficies crema (`#FAFAFC`) y texto `#0B0F12` para cumplir AA.
- **Densidad**: el atributo `data-density` del `<body>` acepta los valores `comfortable`, `cozy` o `compact`. Cambia la densidad desde preferencias o con `document.body.dataset.density = "cozy"` para ajustar espacios y padding en tiempo real.

## Estructura del proyecto

```
app/
  layout.tsx
  page.tsx
modules/
  dashboard/
  tasks/
  goals/
  workspace/
  calendar/
  ai/
  preferences/
lib/
  ai/
  google/
components/
  layout/
  ui/
i18n/
styles/
```

## Scripts

```bash
npm run dev     # iniciar el entorno de desarrollo
npm run build   # compilar para producción
npm run start   # servir la compilación
npm run lint    # ejecutar ESLint
```

> **Nota:** los eventos de Google Calendar están simulados localmente hasta que configures credenciales reales. Ajusta `lib/google/calendar.ts` con tu propia implementación cuando dispongas de claves OAuth.

## Configuración de OpenAI y pestañas

1. Crea un archivo `.env.local` en la raíz con tu clave de OpenAI:

   ```bash
   OPENAI_API_KEY=sk-...
   # opcionalmente puedes sobrescribir el modelo
   # OPENAI_MODEL=gpt-5
   ```

2. Instala dependencias (`npm install`) y ejecuta `npm run dev`.
3. Abre `/chat` para probar el flujo de streaming. El historial se guarda por proyecto en `localStorage` con la clave `nd.chat.v1.<projectId>`.
4. Usa el botón `+` de la barra de pestañas para abrir vistas adicionales o enfocar una página de workspace.
