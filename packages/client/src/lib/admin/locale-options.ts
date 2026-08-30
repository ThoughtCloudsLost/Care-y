export const LOCALE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "de", label: "Deutsch" },
  { value: "fr", label: "Français" },
  { value: "it", label: "Italiano" },
  { value: "pl", label: "Polski" },
  { value: "ru", label: "Russkiy" },
] as const;

export function friendlyLocaleLabel(locale: string): string {
  return LOCALE_OPTIONS.find((l) => l.value === locale)?.label ?? locale;
}
