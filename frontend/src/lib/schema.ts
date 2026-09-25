const CITIES = [
  { value: "stockholm", label: "Stockholm" },
  { value: "gothenburg", label: "Gothenburg" },
  { value: "malmo", label: "Malmö" },
];

const REASONS_FOR_THERAPY = [
  { value: "stress", label: "Stress" },
  { value: "anxiety", label: "Anxiety" },
  { value: "depression", label: "Depression" },
  { value: "relationship", label: "Relationships" },
  { value: "trauma", label: "Trauma" },
  { value: "self_development", label: "Personal growth" },
  { value: "grief", label: "Grief" },
  { value: "burnout", label: "Burnout" },
  { value: "phobia", label: "Phobias" },
  { value: "other", label: "Something else" },
];

const MODALITIES = [
  { value: "cbt", label: "CBT" },
  { value: "psychodynamic", label: "Psychodynamic therapy" },
  { value: "act", label: "ACT" },
  { value: "ipt", label: "Interpersonal therapy" },
  { value: "unsure", label: "Not sure" },
];

export type InputType = "single" | "multi" | "text" | "select";

export type Question = {
  id: string;
  title: string;
  help?: string;
  inputType: InputType;
  options?: { value: string; label: string }[];
  max?: number;
  showIf?: (a: Answer) => boolean;
};

export type Answer = Record<string, unknown>;
export type FormSchema = Question[][];

export const steps: Question[][] = [
  [
    {
      id: "goals",
      title: "What would you like to work on in therapy?",
      help: "Pick 1–5 areas.",
      inputType: "multi",
      max: 5,
      options: REASONS_FOR_THERAPY,
    },
    {
      id: "goals_other",
      title: "What else would you like to work on?",
      inputType: "text",
      showIf: (a: Answer) => ((a.goals as string[]) ?? []).includes("other"),
    },
  ],
  [
    {
      id: "format",
      title: "Would you prefer therapy in person or online?",
      help: "Sessions are the same length and your therapist is just as engaged either way.",
      inputType: "single",
      options: [
        { value: "in_person", label: "In person" },
        { value: "digital", label: "Online" },
        { value: "either", label: "No preference" },
      ],
    },
    {
      id: "has_modality_preference",
      title: "Do you have a preferred type of therapy?",
      inputType: "single",
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No, suggest one for me" },
      ],
    },
    {
      id: "modality",
      title: "Which type of therapy?",
      inputType: "single",
      options: MODALITIES,
      showIf: (a: Answer) => a.has_modality_preference === "yes",
    },
  ],
  [
    {
      id: "location",
      title: "For in-person therapy, choose a city.",
      help: "Pick somewhere you're often based so we can match you as close by as possible.",
      inputType: "select",
      options: CITIES,
      showIf: (a: Answer) => a.format === "in_person" || a.format === "either",
    },
    {
      id: "channel",
      title: "How would you like to meet online?",
      inputType: "multi",
      options: [
        { value: "video", label: "Video call" },
        { value: "phone", label: "Phone" },
        { value: "chat", label: "Chat" },
      ],
      showIf: (a: Answer) => a.format === "digital" || a.format === "either",
    },
  ],
];

export const pruneAnswers = (schema: FormSchema, answers: Answer): Answer => {
  const relevant = new Set(
    schema
      .flat()
      .filter((q) => !q.showIf || q.showIf(answers))
      .map((q) => q.id),
  );

  return Object.fromEntries(
    Object.entries(answers).filter(([key]) => relevant.has(key)),
  );
};
