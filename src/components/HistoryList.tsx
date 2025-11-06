import { useState, useEffect } from "react"
import { Trash2, Copy, Calendar } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

interface HistoryItem {
  id: string
  timestamp: number
  mode: string
  input: string
  output: string
}

export function HistoryList() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = () => {
    const savedHistory = localStorage.getItem("humanize-history")
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory)
        setHistory(parsed.sort((a: HistoryItem, b: HistoryItem) => b.timestamp - a.timestamp))
      } catch (error) {
        console.error("Failed to load history:", error)
      }
    }
  }

  const deleteItem = (id: string) => {
    const newHistory = history.filter(item => item.id !== id)
    setHistory(newHistory)
    localStorage.setItem("humanize-history", JSON.stringify(newHistory))
    toast.success("Deleted from history")
  }

  const clearAll = () => {
    setHistory([])
    localStorage.removeItem("humanize-history")
    toast.success("History cleared")
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <p className="text-muted-foreground mb-4">No history yet</p>
        <p className="text-sm text-muted-foreground">
          Humanized texts will appear here
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{history.length} item{history.length !== 1 ? 's' : ''}</h2>
        <Button variant="destructive" size="sm" onClick={clearAll}>
          Clear All
        </Button>
      </div>

      <div className="space-y-4 overflow-y-auto flex-1">
        {history.map((item) => (
          <div
            key={item.id}
            className="border border-border rounded-lg p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="size-4" />
                <span>{formatDate(item.timestamp)}</span>
                <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-xs">
                  {item.mode}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(item.output)}
                  title="Copy output"
                >
                  <Copy className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteItem(item.id)}
                  title="Delete"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <button
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {expandedId === item.id ? "▼" : "▶"} Input ({item.input.split(/\s+/).length} words)
                </button>
                {expandedId === item.id && (
                  <p className="mt-2 text-sm bg-muted rounded p-3 whitespace-pre-wrap">
                    {item.input}
                  </p>
                )}
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Output ({item.output.split(/\s+/).length} words)</p>
                <p className="text-sm bg-muted rounded p-3 whitespace-pre-wrap">
                  {item.output}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
