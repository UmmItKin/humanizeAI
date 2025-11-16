import { useState } from "react"
import { AppLayout } from "@/components/AppLayout"
import { HumanizerInterface } from "@/components/HumanizerInterface"
import { HistoryList } from "@/components/HistoryList"
import { SettingsForm } from "@/components/SettingsForm"
import { WordFinder } from "@/components/WordFinder"
import { TranslateInterface } from "@/components/TranslateInterface"
import { RegexHelper } from "@/components/RegexHelper"
import { LinuxCommandAgent } from "@/components/LinuxCommandAgent"

type Section = "Humanizer" | "word-finder" | "translate" | "regex-helper" | "linux-command" | "history" | "settings"

export function App() {
  const [currentSection, setCurrentSection] = useState<Section>("Humanizer")

  const renderSection = () => {
    switch (currentSection) {
      case "home":
        return <HumanizerInterface />
      case "word-finder":
        return <WordFinder />
      case "translate":
        return <TranslateInterface />
      case "regex-helper":
        return <RegexHelper />
      case "linux-command":
        return <LinuxCommandAgent />
      case "history":
        return <HistoryList />
      case "settings":
        return <SettingsForm />
      default:
        return <HumanizerInterface />
    }
  }

  const getTitleForSection = (section: Section): string => {
    switch (section) {
      case "home":
        return "Humanizer AI"
      case "word-finder":
        return "Word Alternatives Finder"
      case "translate":
        return "AI Translate (中文 → English)"
      case "regex-helper":
        return "Regex Helper"
      case "linux-command":
        return "GNU/Linux Command Agent"
      case "history":
        return "Humanizer AI - History"
      case "settings":
        return "Humanizer AI - Settings"
      default:
        return "Humanizer AI"
    }
  }

  return (
    <AppLayout 
      currentSection={currentSection} 
      onSectionChange={(section) => setCurrentSection(section as Section)}
      title={getTitleForSection(currentSection)}
    >
      {renderSection()}
    </AppLayout>
  )
}
