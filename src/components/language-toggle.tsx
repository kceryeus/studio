"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/context/language-context"

export function LanguageToggle() {
    const { language, toggleLanguage } = useLanguage();

  return (
    <Button variant="outline" size="icon" onClick={toggleLanguage}>
        <span className="font-bold text-sm">{language}</span>
        <span className="sr-only">Toggle Language</span>
    </Button>
  )
}
