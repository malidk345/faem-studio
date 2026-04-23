export interface ThemePreset {
  name: string;
  value: string;
  label?: string;
  preset?: any;
  styles: {
    dark: Record<string, string>;
    light: Record<string, string>;
  };
}

export interface ImportedTheme {
  name: string;
  colors: Record<string, string>;
  radius?: string;
  dark: Record<string, string>;
  light: Record<string, string>;
}
