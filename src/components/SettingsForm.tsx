import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"

export function SettingsForm() {
  const [apiKey, setApiKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const savedKey = localStorage.getItem("grok-api-key")
    if (savedKey) {
      setApiKey(savedKey)
    }
  }, [])

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast.warning("Empty API Key", {
        description: "Please enter an API key",
      })
      return
    }
    
    localStorage.setItem("grok-api-key", apiKey)
    toast.success("Saved Successfully!", {
      description: "Your API key has been stored locally",
    })
  }

  const handleTest = async () => {
    if (!apiKey.trim()) {
      toast.warning("Empty API Key", {
        description: "Please enter an API key first",
      })
      return
    }

    setIsLoading(true)

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
              content: "You are a test assistant.",
            },
            {
              role: "user",
              content: "Testing. Just say hi and hello world and nothing else.",
            },
          ],
          model: "grok-2-latest",
          stream: false,
          temperature: 0,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success("API Key Valid!", {
          description: data.choices?.[0]?.message?.content || JSON.stringify(data, null, 2),
        })
      } else {
        const errorData = await response.json().catch(() => ({}))
        
        const errorMessage = errorData.error?.message 
          ? `${errorData.error.message}\n\nFull Response: ${JSON.stringify(errorData, null, 2)}`
          : JSON.stringify(errorData, null, 2) || response.statusText
        
        toast.error(`API Test Failed (${response.status})`, {
          description: errorMessage,
          duration: 15000,
        })
      }
    } catch (error) {
      toast.error("Connection Error", {
        description: error instanceof Error ? error.message : "Unknown error",
        duration: 10000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl" suppressHydrationWarning>
      <div className="space-y-4" suppressHydrationWarning>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Grok AI Setup (by xAI)</h2>
          <p className="text-sm text-muted-foreground">
            Get your API key from{" "}
            <a
              href="https://console.x.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              console.x.ai
            </a>
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="grok-api-key" className="text-sm font-medium">
            Grok API Key
          </label>
          <input
            id="grok-api-key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Grok API key..."
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <p className="text-xs text-muted-foreground">
            Your API key is stored locally in your browser
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Save API Key
          </button>
          <button
            onClick={handleTest}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            {isLoading ? (
              <>
                <Spinner className="mr-2" />
                Testing...
              </>
            ) : (
              "Test API Key"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
