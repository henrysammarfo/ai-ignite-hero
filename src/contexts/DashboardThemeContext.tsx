import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type ThemeMode = "light" | "dark";

interface DashboardThemeContextType {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  themeClass: string;
}

const DashboardThemeContext = createContext<DashboardThemeContextType>({
  theme: "light",
  setTheme: () => {},
  themeClass: "dashboard-theme",
});

export const useDashboardTheme = () => useContext(DashboardThemeContext);

export const DashboardThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeMode>("dark");

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
  }, []);

  // "dashboard-theme" = light, "dashboard-dark-theme" = dark
  const themeClass = theme === "light" ? "dashboard-theme" : "dashboard-dark-theme";

  return (
    <DashboardThemeContext.Provider value={{ theme, setTheme, themeClass }}>
      {children}
    </DashboardThemeContext.Provider>
  );
};
