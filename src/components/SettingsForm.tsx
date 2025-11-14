import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const GROK_MODELS = [
  { value: "grok-3", label: "grok-3" },
  { value: "grok-3-mini", label: "grok-3-mini (Recommended)" },
  { value: "grok-4-fast-reasoning", label: "grok-4-fast-reasoning" },
  { value: "grok-4-fast-non-reasoning", label: "grok-4-fast-non-reasoning" },
]

const OPENAI_MODELS = [
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
]

export function SettingsForm() {
  const [apiKey, setApiKey] = useState("")
  const [selectedModel, setSelectedModel] = useState("grok-3-mini")
  const [isLoading, setIsLoading] = useState(false)
  
  // OpenAI settings
  const [useOpenAI, setUseOpenAI] = useState(false)
  const [openaiKey, setOpenaiKey] = useState("")
  const [openaiModel, setOpenaiModel] = useState("gpt-4o-mini")
  const [customBaseURL, setCustomBaseURL] = useState("")
  const [useCustomURL, setUseCustomURL] = useState(false)

  useEffect(() => {
    const savedKey = localStorage.getItem("grok-api-key")
    const savedModel = localStorage.getItem("grok-model")
    const savedUseOpenAI = localStorage.getItem("use-openai")
    const savedOpenAIKey = localStorage.getItem("openai-api-key")
    const savedOpenAIModel = localStorage.getItem("openai-model")
    const savedBaseURL = localStorage.getItem("openai-base-url")
    const savedUseCustomURL = localStorage.getItem("use-custom-url")
    
    if (savedKey) {
      setApiKey(savedKey)
    }
    if (savedModel) {
      setSelectedModel(savedModel)
    }
    if (savedUseOpenAI) {
      setUseOpenAI(savedUseOpenAI === "true")
    }
    if (savedOpenAIKey) {
      setOpenaiKey(savedOpenAIKey)
    }
    if (savedOpenAIModel) {
      setOpenaiModel(savedOpenAIModel)
    }
    if (savedBaseURL) {
      setCustomBaseURL(savedBaseURL)
    }
    if (savedUseCustomURL) {
      setUseCustomURL(savedUseCustomURL === "true")
    }
  }, [])

  const handleSave = () => {
    if (useOpenAI) {
      if (!openaiKey.trim()) {
        toast.warning("Empty OpenAI API Key", {
          description: "Please enter an OpenAI API key",
        })
        return
      }
      localStorage.setItem("openai-api-key", openaiKey)
      localStorage.setItem("openai-model", openaiModel)
      localStorage.setItem("use-openai", "true")
      if (useCustomURL) {
        localStorage.setItem("openai-base-url", customBaseURL)
        localStorage.setItem("use-custom-url", "true")
      } else {
        localStorage.removeItem("openai-base-url")
        localStorage.setItem("use-custom-url", "false")
      }
    } else {
      if (!apiKey.trim()) {
        toast.warning("Empty API Key", {
          description: "Please enter a Grok API key",
        })
        return
      }
      localStorage.setItem("grok-api-key", apiKey)
      localStorage.setItem("grok-model", selectedModel)
      localStorage.setItem("use-openai", "false")
    }
    
    toast.success("Saved Successfully!", {
      description: "Your API settings have been stored locally",
    })
  }

  const handleClear = () => {
    if (useOpenAI) {
      setOpenaiKey("")
      localStorage.removeItem("openai-api-key")
      toast.success("OpenAI API Key Cleared", {
        description: "Your OpenAI API key has been removed from local storage",
      })
    } else {
      setApiKey("")
      localStorage.removeItem("grok-api-key")
      toast.success("Grok API Key Cleared", {
        description: "Your Grok API key has been removed from local storage",
      })
    }
  }

  const handleTest = async () => {
    const currentKey = useOpenAI ? openaiKey : apiKey
    const currentModel = useOpenAI ? openaiModel : selectedModel
    
    let baseURL = "https://api.x.ai/v1/chat/completions"
    if (useOpenAI) {
      if (useCustomURL && customBaseURL.trim()) {
        baseURL = customBaseURL.trim()
      } else {
        baseURL = "https://api.openai.com/v1/chat/completions"
      }
    }

    if (!currentKey.trim()) {
      toast.warning("Empty API Key", {
        description: `Please enter ${useOpenAI ? 'an OpenAI' : 'a Grok'} API key first`,
      })
      return
    }

    if (useOpenAI && useCustomURL && !customBaseURL.trim()) {
      toast.warning("Empty Base URL", {
        description: "Please enter a custom base URL or uncheck the custom URL option",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(baseURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentKey}`,
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
          model: currentModel,
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
      <div className="space-y-6" suppressHydrationWarning>
        {/* API Provider Selection */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">API Provider</h2>
          <RadioGroup
            value={useOpenAI ? "openai" : "grok"}
            onValueChange={(value) => setUseOpenAI(value === "openai")}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="grok" id="grok" />
              <label
                htmlFor="grok"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Grok AI (xAI)
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="openai" id="openai" />
              <label
                htmlFor="openai"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                OpenAI Compatible
              </label>
            </div>
          </RadioGroup>
        </div>

        {/* Grok AI Setup */}
        {!useOpenAI && (
          <div className="space-y-4 p-4 border border-border rounded-lg">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Grok AI Setup (by xAI)</h3>
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
            </div>

            <div className="space-y-2">
              <label htmlFor="grok-model" className="text-sm font-medium">
                Grok Model
              </label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger id="grok-model" className="w-full">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {GROK_MODELS.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* OpenAI Compatible Setup */}
        {useOpenAI && (
          <div className="space-y-4 p-4 border border-border rounded-lg">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">OpenAI Compatible API</h3>
              <p className="text-sm text-muted-foreground">
                Works with OpenAI, DeepSeek, ChatAnywhere, and other compatible APIs
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="openai-api-key" className="text-sm font-medium">
                API Key
              </label>
              <input
                id="openai-api-key"
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="Enter your API key..."
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="openai-model" className="text-sm font-medium">
                Model
              </label>
              <Select value={openaiModel} onValueChange={setOpenaiModel}>
                <SelectTrigger id="openai-model" className="w-full">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {OPENAI_MODELS.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="custom-url"
                  checked={useCustomURL}
                  onChange={(e) => setUseCustomURL(e.target.checked)}
                  className="w-4 h-4 rounded border-input"
                />
                <label
                  htmlFor="custom-url"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Use Custom Base URL
                </label>
              </div>

              {useCustomURL && (
                <div className="space-y-2 pl-6">
                  <label htmlFor="base-url" className="text-sm font-medium">
                    Base URL
                  </label>
                  <input
                    id="base-url"
                    type="text"
                    value={customBaseURL}
                    onChange={(e) => setCustomBaseURL(e.target.value)}
                    placeholder="https://api.deepseek.com/v1/chat/completions"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the full API endpoint URL (e.g., DeepSeek, ChatAnywhere)
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          All API keys are stored locally in your browser
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Save Settings
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
          <button
            onClick={handleClear}
            disabled={useOpenAI ? !openaiKey : !apiKey}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-destructive hover:text-destructive-foreground h-10 px-4 py-2"
          >
            Clear API Key
          </button>
        </div>
      </div>
    </div>
  )
}
