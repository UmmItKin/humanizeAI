import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import translatePrompt from "@/prompts/translate-zh-en.md?raw"

export function TranslateInterface() {
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const inputWordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0
  const outputWordCount = outputText.trim() ? outputText.trim().split(/\s+/).length : 0

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast.warning("Please enter Chinese text")
      return
    }

    if (!/[\u4e00-\u9fff]/u.test(inputText)) {
      toast.error("Please enter Chinese text for translation")
      return
    }

    const apiPriority = (localStorage.getItem("api-priority") || "grok") as "grok" | "openai"
    const isOpenAI = apiPriority === "openai"
    
    const apiKey = localStorage.getItem(isOpenAI ? "openai-api-key" : "grok-api-key")
    const model = localStorage.getItem(isOpenAI ? "openai-model" : "grok-model") || (isOpenAI ? "gpt-4o-mini" : "grok-3-mini")
    
    let baseURL = "https://api.x.ai/v1/chat/completions"
    if (isOpenAI) {
      const useCustomURL = localStorage.getItem("use-custom-url") === "true"
      const customBaseURL = localStorage.getItem("openai-base-url")
      baseURL = (useCustomURL && customBaseURL) ? customBaseURL : "https://api.openai.com/v1/chat/completions"
    }

    if (!apiKey) {
      toast.error(`Please set your ${isOpenAI ? "OpenAI" : "Grok"} API key in Settings`)
      return
    }

    setIsLoading(true)
    setOutputText("")

    try {
      const response = await fetch(baseURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: translatePrompt },
            { role: "user", content: inputText },
          ],
          model,
          stream: false,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const result = data.choices[0]?.message?.content || ""
      setOutputText(result)

      toast.success("Translation completed!")
    } catch (error) {
      toast.error("Translation failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
      setOutputText("")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6" suppressHydrationWarning>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Chinese Text</label>
          <span className="text-xs text-muted-foreground">{inputWordCount} words</span>
        </div>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="輸入中文文字..."
          className="w-full h-48 p-4 rounded-md border border-input bg-background text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          disabled={isLoading}
        />
      </div>

      <Button 
        onClick={handleTranslate} 
        disabled={isLoading || !inputText.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Spinner className="mr-2" />
            Translating...
          </>
        ) : (
          "Translate to English"
        )}
      </Button>

      {outputText && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">English Translation</label>
            <span className="text-xs text-muted-foreground">{outputWordCount} words</span>
          </div>
          <div className="relative">
            <textarea
              value={outputText}
              readOnly
              className="w-full h-48 p-4 rounded-md border border-input bg-muted/50 text-sm resize-none focus-visible:outline-none"
            />
            <Button
              onClick={() => {
                navigator.clipboard.writeText(outputText)
                toast.success("Copied!")
              }}
              variant="outline"
              size="sm"
              className="absolute top-2 right-2"
            >
              Copy
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
