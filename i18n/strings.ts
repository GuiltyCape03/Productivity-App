export type Locale = "es" | "en";

type Copy = {
  dashboardTitle: string;
  tasks: {
    title: string;
    empty: string;
    addPlaceholder: string;
    estimateLabel: string;
    createButton: string;
  };
  goals: {
    title: string;
    empty: string;
    createButton: string;
  };
  workspace: {
    title: string;
    empty: string;
  };
  calendar: {
    title: string;
    connectButton: string;
    disconnectButton: string;
  };
  ai: {
    title: string;
    refresh: string;
    askPlaceholder: string;
  };
  preferences: {
    title: string;
    theme: string;
    tone: string;
    shadow: string;
    fields: string;
    density: string;
    accent: string;
  };
};

const es: Copy = {
  dashboardTitle: "NeuralDesk",
  tasks: {
    title: "Mis tareas",
    empty: "No hay tareas aún. Empieza creando tu objetivo mínimo viable para hoy.",
    addPlaceholder: "Describe la siguiente acción clara",
    estimateLabel: "Minutos estimados",
    createButton: "Agregar tarea"
  },
  goals: {
    title: "Metas",
    empty: "Configura metas medibles para que el copiloto te acompañe.",
    createButton: "Crear meta"
  },
  workspace: {
    title: "Workspace",
    empty: "Tus páginas tipo Notion aparecerán aquí."
  },
  calendar: {
    title: "Calendario",
    connectButton: "Conectar Google Calendar",
    disconnectButton: "Desconectar"
  },
  ai: {
    title: "Copiloto IA",
    refresh: "Actualizar plan",
    askPlaceholder: "Pregunta algo sobre tus proyectos"
  },
  preferences: {
    title: "Personaliza",
    theme: "Tema",
    tone: "Tono de tarjetas",
    shadow: "Sombras",
    fields: "Campos",
    density: "Densidad",
    accent: "Acento"
  }
};

const en: Copy = {
  dashboardTitle: "NeuralDesk",
  tasks: {
    title: "Tasks",
    empty: "You have no tasks yet. Create your smallest next action for today.",
    addPlaceholder: "Describe the next clear action",
    estimateLabel: "Estimated minutes",
    createButton: "Add task"
  },
  goals: {
    title: "Goals",
    empty: "Define measurable goals so the copilot can help.",
    createButton: "Create goal"
  },
  workspace: {
    title: "Workspace",
    empty: "Your Notion-like pages will appear here."
  },
  calendar: {
    title: "Calendar",
    connectButton: "Connect Google Calendar",
    disconnectButton: "Disconnect"
  },
  ai: {
    title: "AI Copilot",
    refresh: "Refresh plan",
    askPlaceholder: "Ask something about your projects"
  },
  preferences: {
    title: "Customize",
    theme: "Theme",
    tone: "Card tone",
    shadow: "Shadows",
    fields: "Fields",
    density: "Density",
    accent: "Accent"
  }
};

export const STRINGS: Record<Locale, Copy> = { es, en };
