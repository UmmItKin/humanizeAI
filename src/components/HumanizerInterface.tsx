import { useState } from "react"
import { Button } from "@/components/ui/button"

const modes = [
  "Chit-chat",
  "Academic",
  "Shorten",
]

export function HumanizerInterface() {
  const [selectedMode, setSelectedMode] = useState("Chit-chat")
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")

  const inputWordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0
  const outputWordCount = outputText.trim() ? outputText.trim().split(/\s+/).length : 0

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex gap-1 flex-wrap">
        {modes.map((mode) => (
          <button
            key={mode}
            onClick={() => setSelectedMode(mode)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedMode === mode
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="flex flex-col gap-2 min-h-0">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your text here..."
            className="flex-1 w-full rounded-lg border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
          />
          <div className="text-sm text-muted-foreground">
            {inputWordCount} words
          </div>
        </div>

        <div className="flex flex-col gap-2 min-h-0">
          <textarea
            value={outputText}
            readOnly
            placeholder="Paraphrased text will appear here"
            className="flex-1 w-full rounded-lg border border-input bg-muted px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
          />
          <div className="text-sm text-muted-foreground">
            {outputWordCount} words
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={() => {
            // TODO: Add humanization logic will be here :)
          }}
        >
          Humanize AI
        </Button>
      </div>
    </div>
  )
}