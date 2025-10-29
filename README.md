# NeuralDesk

NeuralDesk es un panel de productividad construido con Next.js 14 y Tailwind que combina planificación asistida por IA, integración opcional con Google Calendar y un workspace tipo Notion. El objetivo principal es ayudarte a definir un mínimo viable diario, visualizar tu avance y recibir recomendaciones inteligentes sobre qué atacar a continuación.

## Características principales

- **Panel modular**: tareas, metas, workspace, calendario y copiloto IA viven en módulos independientes dentro de `modules/` para favorecer el mantenimiento.
- **IA integrada**: el motor en `lib/ai/` analiza tareas y metas para generar un snapshot de foco, estimar la carga diaria y alimentar un chatbot que entiende tus proyectos.
- **Workspace tipo Notion**: crea páginas personalizadas con bloques de texto, checklist, callouts, divisores y encabezados.
- **Google Calendar opcional**: conecta tu cuenta (mock) para sincronizar eventos y ver tu agenda en contexto.
- **Personalización visual**: ajusta tema, densidad, sombras, tonos de tarjetas y acento de color desde el panel de preferencias.

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
