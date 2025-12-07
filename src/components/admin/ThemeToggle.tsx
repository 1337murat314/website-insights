import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("admin-theme");
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    const shouldBeLight = savedTheme === "light" || (!savedTheme && prefersLight);
    setIsLight(shouldBeLight);
    
    // Apply theme immediately on mount
    if (shouldBeLight) {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, []);

  useEffect(() => {
    if (isLight) {
      document.documentElement.classList.add("light");
      localStorage.setItem("admin-theme", "light");
    } else {
      document.documentElement.classList.remove("light");
      localStorage.setItem("admin-theme", "dark");
    }
  }, [isLight]);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setIsLight(!isLight)}
      className="rounded-full"
    >
      {isLight ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5 text-amber-400" />
      )}
    </Button>
  );
};

export default ThemeToggle;
