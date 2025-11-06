import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import humanizePromptRaw from "@/prompts/humanize-prompt.md?raw"

const modes = [
  "Chit-chat",
  "Academic",
  "Shorten",
]

const SYSTEM_PROMPT = humanizePromptRaw + "\n\nReturn ONLY the humanized text without any explanations or additional formatting."

export function HumanizerInterface() {
  const [selectedMode, setSelectedMode] = useState("Chit-chat")
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")
  const [isLoading, setIsLoading] = useState(false)

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
          onClick={async () => {
            if (!inputText.trim()) {
              toast.warning("Please enter some text to humanize")
              return
            }

            const apiKey = localStorage.getItem("grok-api-key")
            if (!apiKey) {
              toast.error("Please set your Grok API key in Settings first")
              return
            }

            setIsLoading(true)
            setOutputText("")

            try {
              const response = await fetch("https://api.x.ai/v1/chat/completions", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                  messages: [
                    {
                      role: "system",
                      content: SYSTEM_PROMPT,
                    },
                    {
                      role: "user",
                      content: inputText,
                    },
                  ],
                  model: "grok-2-latest",
                  stream: false,
                  temperature: 0.7,
                }),
              })

              if (!response.ok) {
                const errorData = await response.json()
                toast.error("API Error", {
                  description: JSON.stringify(errorData, null, 2),
                  duration: 15000,
                })
                return
              }

              const data = await response.json()
              const humanizedText = data.choices?.[0]?.message?.content || ""
              
              if (humanizedText) {
                setOutputText(humanizedText)
                toast.success("Text humanized successfully!")
              } else {
                toast.error("No response from API")
              }
            } catch (error) {
              toast.error("Connection Error", {
                description: error instanceof Error ? error.message : "Failed to connect to Grok API",
                duration: 10000,
              })
            } finally {
              setIsLoading(false)
            }
          }}
          disabled={isLoading}
        >
          {isLoading ? "Humanizing..." : "Humanize AI"}
        </Button>
      </div>
    </div>
  )
}