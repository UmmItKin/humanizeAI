import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import linuxCommandPrompt from "@/prompts/linux-command-agent.md?raw"

interface CommandOption {
  command: string
  description: string
  example: string
  useCase: string
}

interface LinuxCommandResult {
  purpose: string
  commands: CommandOption[]
}

export function LinuxCommandAgent() {
  const [purpose, setPurpose] = useState("")
  const [result, setResult] = useState<LinuxCommandResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    if (!purpose.trim()) {
      toast.warning("Please describe what you want to do")
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
      const userPrompt = `Purpose: ${purpose}`

      const response = await fetch(baseURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: linuxCommandPrompt },
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
      let jsonString = content.trim()
      
      // Try to extract from markdown code block
      const jsonMatch = jsonString.match(/```(?:json)?\s*\n([\s\S]*?)\n```/)
      if (jsonMatch) {
        jsonString = jsonMatch[1]
      }
      
      // Clean up and try to parse
      jsonString = jsonString.trim()
      
      try {
        const parsed = JSON.parse(jsonString)
        console.log("[LinuxCommandAgent] Parsed result:", parsed)
        setResult(parsed)
        toast.success("Commands generated successfully!")
      } catch (parseError) {
        console.error("Failed to parse JSON:", jsonString)
        console.error("Original content:", content)
        console.error("Parse error:", parseError)
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
        <Label htmlFor="purpose">What do you want to do?</Label>
        <Input
          id="purpose"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="e.g., List directory, Find files, Monitor system resources, etc."
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isLoading) {
              handleGenerate()
            }
          }}
        />
      </div>

      <Button 
        onClick={handleGenerate} 
        disabled={isLoading || !purpose.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Spinner className="mr-2" />
            Finding Commands...
          </>
        ) : (
          "Find Commands"
        )}
      </Button>

      {result && (
        <div className="space-y-6">
          <div className="p-4 rounded-md border border-input bg-muted/50">
            <h3 className="text-lg font-semibold mb-2">Purpose</h3>
            <p className="text-sm">{result.purpose}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Available Commands</h3>
            {result.commands && result.commands.length > 0 ? (
              result.commands.map((cmd, index) => (
                <div key={index} className="border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <code className="text-lg font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                          {cmd.command}
                        </code>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{cmd.description}</p>
                    </div>
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(cmd.example)
                        toast.success("Example copied!")
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Copy Example
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Use Case</Label>
                      <p className="text-sm mt-1">{cmd.useCase}</p>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-muted-foreground">Example Usage</Label>
                      <div className="mt-1 p-3 rounded-md bg-background border border-input">
                        <code className="text-sm font-mono">{cmd.example}</code>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground">
                No commands found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
