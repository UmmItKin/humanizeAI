import { Icon } from "@iconify/react"

export function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon icon="mdi:scale-balance" className="size-5" />
            <span>
              Licensed under{" "}
              <a
                href="https://www.gnu.org/licenses/agpl-3.0.en.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                AGPLv3
              </a>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com/UmmItKin/humanizeAI"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              aria-label="View source on GitHub"
            >
              <Icon icon="mdi:github" className="size-6" />
              <span className="text-sm">GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}