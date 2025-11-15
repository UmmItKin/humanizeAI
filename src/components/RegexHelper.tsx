import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { CodeBlock } from "@/components/ui/shadcn-io/code-block"
import regexHelperPrompt from "@/prompts/regex-helper.md?raw"

interface RegexResult {
  regex: string
  explanation: string
  grepCommand: string
  examples: string[]
}

export function RegexHelper() {
  const [sampleText, setSampleText] = useState("")
  const [requirement, setRequirement] = useState("")
  const [result, setResult] = useState<RegexResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [expectedValue, setExpectedValue] = useState("")

  const handleGenerate = async () => {
    if (!sampleText.trim() || !requirement.trim()) {
      toast.warning("Please provide both sample text and requirements")
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
    setResult(null)

    try {
      const userPrompt = `Sample Text:\n${sampleText}\n\nRequirement:\n${requirement}${expectedValue.trim() ? `\n\nExpected result value (example):\n${expectedValue}\n\nGenerate a regex that matches this value in the sample text above.` : ""}`

      const response = await fetch(baseURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: regexHelperPrompt },
            { role: "user", content: userPrompt },
          ],
          model,
          stream: false,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content || ""
      
      // Extract JSON from markdown code block if present
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/)
      let jsonString = jsonMatch ? jsonMatch[1] : content
      
      // Replace single quotes with double quotes for string values
      jsonString = jsonString.replace(/:\s*'([^']*)'/g, ': "$1"')
      
      try {
        const parsed = JSON.parse(jsonString.trim())
        setResult(parsed)
        toast.success("Regex generated successfully!")
      } catch (parseError) {
        console.error("Failed to parse JSON:", jsonString)
        console.error("Original content:", content)
        throw new Error("AI response is not valid JSON. Check console for details.")
      }
    } catch (error) {
      toast.error("Generation failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6" suppressHydrationWarning>
      <div className="space-y-2">
        <label className="text-sm font-medium">Sample Text / Code</label>
        <textarea
          value={sampleText}
          onChange={(e) => setSampleText(e.target.value)}
          placeholder="Paste your sample text or code here..."
          className="w-full h-32 p-4 rounded-md border border-input bg-background text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-mono"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">What do you want to match?</label>
        <textarea
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          placeholder='Example: "Find all class attributes" or "Extract all URLs"'
          className="w-full h-24 p-4 rounded-md border border-input bg-background text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">What is the expected result value? (Enter a sample output, e.g. 123456)</label>
        <input
          type="text"
          value={expectedValue}
          onChange={e => setExpectedValue(e.target.value)}
          placeholder="e.g. 123456, https://example.com, Image, etc. (actual value you want to match)"
          className="w-full p-4 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          disabled={isLoading}
        />
      </div>

      <Button 
        onClick={handleGenerate} 
        disabled={isLoading || !sampleText.trim() || !requirement.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Spinner className="mr-2" />
            Generating Regex...
          </>
        ) : (
          "Generate Regex Pattern"
        )}
      </Button>

      {result && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Regex Code</label>
            <div className="relative">
              <div className="p-4 rounded-md border border-input bg-muted/50 text-sm font-mono">
                {result.regex}
              </div>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(result.regex)
                  toast.success("Regex copied!")
                }}
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
              >
                Copy
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Explanation</label>
            <div className="p-4 rounded-md border border-input bg-muted/50 text-sm">
              {result.explanation}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Grep Command</label>
            <div className="relative">
              <div className="p-4 rounded-md border border-input bg-muted/50 text-sm font-mono">
                {result.grepCommand}
              </div>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(result.grepCommand)
                  toast.success("Grep command copied!")
                }}
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
              >
                Copy
              </Button>
            </div>
          </div>

          {result.examples && result.examples.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Example Matches</label>
              <div className="p-4 rounded-md border border-input bg-muted/50 text-sm space-y-2">
                {result.examples.map((example, index) => (
                  <div key={index} className="font-mono text-xs bg-background/50 p-2 rounded">
                    {example}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
