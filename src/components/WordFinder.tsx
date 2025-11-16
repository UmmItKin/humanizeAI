import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import wordAlternativesPrompt from "@/prompts/word-alternatives.md?raw"

interface Alternative {
  word: string
  definition: string
  example: string
}

export function WordFinder() {
  const [inputWord, setInputWord] = useState("")
  const [alternatives, setAlternatives] = useState<Alternative[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleFind = async () => {
    if (!inputWord.trim()) {
      toast.warning("Please enter a word")
      return
    }

    // Check if input is too long (more than 5 words)
    const wordCount = inputWord.trim().split(/\s+/).length
    if (wordCount > 5) {
      toast.error("Please provide a single word or short phrase (max 5 words)")
      return
    }

    // Determine which API to use based on priority
    const apiPriority = (localStorage.getItem("api-priority") || "grok") as "grok" | "openai" | "deepseek"
    
    let apiKey: string | null
    let model: string
    let baseURL: string
    let apiName: string
    
    if (apiPriority === "deepseek") {
      apiKey = localStorage.getItem("deepseek-api-key")
      model = localStorage.getItem("deepseek-model") || "deepseek-chat"
      apiName = "DeepSeek"
      baseURL = "https://api.deepseek.com/chat/completions"
      
      if (!apiKey) {
        toast.error("Please set your DeepSeek API key in Settings first")
        return
      }
    } else if (apiPriority === "openai") {
      apiKey = localStorage.getItem("openai-api-key")
      model = localStorage.getItem("openai-model") || "gpt-4o-mini"
      apiName = "OpenAI"
      const useCustomURL = localStorage.getItem("use-custom-url") === "true"
      const customBaseURL = localStorage.getItem("openai-base-url")
      
      if (useCustomURL && customBaseURL) {
        baseURL = customBaseURL
      } else {
        baseURL = "https://api.openai.com/v1/chat/completions"
      }
      
      if (!apiKey) {
        toast.error("Please set your OpenAI API key in Settings first")
        return
      }
    } else {
      apiKey = localStorage.getItem("grok-api-key")
      model = localStorage.getItem("grok-model") || "grok-3-mini"
      apiName = "Grok AI"
      baseURL = "https://api.x.ai/v1/chat/completions"
      
      if (!apiKey) {
        toast.error("Please set your Grok API key in Settings first")
        return
      }
    }

    setIsLoading(true)
    setAlternatives([])

    try {
      const response = await fetch(baseURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: wordAlternativesPrompt,
            },
            {
              role: "user",
              content: inputWord,
            },
          ],
          model: model,
          stream: false,
          temperature: 0.5,
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
      let result = data.choices?.[0]?.message?.content || ""
      
      if (!result) {
        toast.error("No response from API")
        return
      }

      if (result.startsWith("ERROR:")) {
        toast.error("Unable to find alternatives", {
          description: result.replace("ERROR: ", ""),
          duration: 8000,
        })
        return
      }

      // Clean up the result - remove markdown code blocks if present
      result = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

      try {
        const parsedAlternatives = JSON.parse(result) as Alternative[]
        setAlternatives(parsedAlternatives)
        toast.success(`Found ${parsedAlternatives.length} alternatives!`)
      } catch (parseError) {
        toast.error("Failed to parse alternatives", {
          description: "The response format was invalid. Please try again.",
          duration: 8000,
        })
      }
    } catch (error) {
      toast.error("Connection Error", {
        description: error instanceof Error ? error.message : "Failed to connect to Grok API",
        duration: 10000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading) {
      handleFind()
    }
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Word Alternatives Finder</h2>
        <p className="text-sm text-muted-foreground">
          Enter a difficult English word to find simpler alternatives with the same meaning
        </p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={inputWord}
          onChange={(e) => setInputWord(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter a word (e.g., Diagnosis, Demonstrate, Utilize...)"
          className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          disabled={isLoading}
        />
        <Button
          onClick={handleFind}
          disabled={isLoading || !inputWord.trim()}
        >
          {isLoading ? (
            <>
              <Spinner className="mr-2" />
              Finding...
            </>
          ) : (
            "Find Alternatives"
          )}
        </Button>
      </div>

      <div className="flex-1 min-h-0 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/80 rounded-lg z-10">
            <Spinner className="size-16 text-primary" />
          </div>
        ) : alternatives.length > 0 ? (
          <div className="h-full flex items-center justify-center px-16">
            <Carousel className="w-full max-w-2xl">
              <CarouselContent>
                {alternatives.map((alt, index) => (
                  <CarouselItem key={index}>
                    <div className="p-1">
                      <div className="rounded-lg border-2 border-primary bg-card p-8 shadow-lg">
                        <div className="space-y-4">
                          <div className="text-center">
                            <h3 className="text-4xl font-bold text-primary mb-2">
                              {alt.word}
                            </h3>
                            <div className="text-sm text-muted-foreground">
                              Alternative {index + 1} of {alternatives.length}
                            </div>
                          </div>
                          
                          <div className="space-y-3 pt-4 border-t">
                            <div>
                              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                                Definition
                              </h4>
                              <p className="text-base leading-relaxed">
                                {alt.definition}
                              </p>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                                Example
                              </h4>
                              <p className="text-base leading-relaxed italic">
                                "{alt.example}"
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center rounded-lg border border-input bg-muted">
            <div className="text-center text-muted-foreground">
              <p className="text-lg mb-2">Send me a word :)</p>
              <p className="text-sm">Enter a word above to find alternatives</p>
              <p className="text-xs mt-1">Works best with single words or short phrases (max 5 words)</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
