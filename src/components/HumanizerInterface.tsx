import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import normalPrompt from "@/prompts/normal-prompt.md?raw"
import chitChatPrompt from "@/prompts/chit-chat-prompt.md?raw"
import academicPrompt from "@/prompts/academic-prompt.md?raw"
import shortenPrompt from "@/prompts/shorten-prompt.md?raw"

const modes = [
  "Normal",
  "Chit-chat",
  "Academic",
  "Shorten",
] as const

const PROMPTS = {
  "Normal": normalPrompt,
  "Chit-chat": chitChatPrompt,
  "Academic": academicPrompt,
  "Shorten": shortenPrompt,
}

export function HumanizerInterface() {
  const [selectedMode, setSelectedMode] = useState<typeof modes[number]>("Normal")
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)

  const inputWordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0
  const outputWordCount = outputText.trim() ? outputText.trim().split(/\s+/).length : 0

  const handleHumanize = async () => {
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
              content: PROMPTS[selectedMode],
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
      
      if (!humanizedText) {
        toast.error("No response from API")
        return
      }

      if (humanizedText.startsWith("ERROR:")) {
        toast.error("Unable to humanize", {
          description: humanizedText.replace("ERROR: ", ""),
          duration: 8000,
        })
        return
      }

      setOutputText(humanizedText)
      
      saveToHistory(inputText, humanizedText, selectedMode)
      
      toast.success("Text humanized successfully!")
    } catch (error) {
      toast.error("Connection Error", {
        description: error instanceof Error ? error.message : "Failed to connect to Grok API",
        duration: 10000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveToHistory = (input: string, output: string, mode: string) => {
    const historyItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      mode,
      input,
      output,
    }

    const savedHistory = localStorage.getItem("humanize-history")
    const history = savedHistory ? JSON.parse(savedHistory) : []
    history.unshift(historyItem)
    
    if (history.length > 100) {
      history.pop()
    }
    
    localStorage.setItem("humanize-history", JSON.stringify(history))
  }

  const handleButtonClick = () => {
    if (outputText.trim()) {
      setShowDialog(true)
    } else {
      handleHumanize()
    }
  }

  return (
    <>
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
            <div className="relative flex-1 min-h-0">
              <textarea
                value={outputText}
                readOnly
                placeholder="Paraphrased text will appear here"
                className="flex-1 w-full h-full rounded-lg border border-input bg-muted px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/80 rounded-lg">
                  <Spinner className="size-16 text-primary" />
                </div>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {outputWordCount} words
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleButtonClick}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner className="mr-2" />
                Humanizing...
              </>
            ) : (
              "Humanize AI"
            )}
          </Button>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Replace existing text?</DialogTitle>
            <DialogDescription>
              Are you sure you want to replace the current output text? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowDialog(false)
                handleHumanize()
              }}
            >
              Yes, Replace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}