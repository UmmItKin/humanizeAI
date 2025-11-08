import { useState } from "react"
import { AppLayout } from "@/components/AppLayout"
import { HumanizerInterface } from "@/components/HumanizerInterface"
import { HistoryList } from "@/components/HistoryList"
import { SettingsForm } from "@/components/SettingsForm"

type Section = "home" | "history" | "settings"

export function App() {
  const [currentSection, setCurrentSection] = useState<Section>("home")

  const renderSection = () => {
    switch (currentSection) {
      case "home":
        return <HumanizerInterface />
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
      onSectionChange={setCurrentSection}
      title={getTitleForSection(currentSection)}
    >
      {renderSection()}
    </AppLayout>
  )
}
