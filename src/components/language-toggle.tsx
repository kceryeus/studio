"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"

export function LanguageToggle() {
    const [language, setLanguage] = React.useState("EN");

    const toggleLanguage = () => {
        setLanguage(prev => prev === "EN" ? "PT" : "EN");
    }

  return (
    <Button variant="outline" size="icon" onClick={toggleLanguage}>
        <span className="font-bold text-sm">{language}</span>
        <span className="sr-only">Toggle Language</span>
    </Button>
  )
}
