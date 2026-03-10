"use client";

import { useTheme } from "next-themes";
import { Laptop, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  const current = theme ?? "system";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" className="justify-start">
          {current === "light" && <Sun className="mr-2 h-4 w-4" />}
          {current === "dark" && <Moon className="mr-2 h-4 w-4" />}
          {current === "system" && <Laptop className="mr-2 h-4 w-4" />}
          Tema: {current}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        <DropdownMenuItem onClick={() => setTheme("light")}
          className="flex items-center gap-2">
          <Sun className="h-4 w-4" />
          Chiaro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}
          className="flex items-center gap-2">
          <Moon className="h-4 w-4" />
          Scuro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}
          className="flex items-center gap-2">
          <Laptop className="h-4 w-4" />
          Sistema
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
