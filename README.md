# Humanize AI

A web application for humanizing AI-generated text using Grok AI models from xAI. Transform robotic-sounding content into natural, human-like text across multiple styles and tones.

## Features

- **Multiple Humanization Modes**
  - Normal: Standard humanization with natural flow
  - Chit-chat: Conversational and casual tone
  - Academic: Scholarly and formal style
  - Shorten: Condensed version while maintaining key information

- **History Tracking**
  - Automatic saving of all humanization results
  - Copy and delete functionality

## Getting Started

### Prerequisites

- Bun package manager
- Grok API key from [console.x.ai](https://console.x.ai)

### Installation

```sh
git clone https://github.com/UmmItKin/humanizeAI.git
cd humanizeAI
bun install
bun run dev
```

### Configuration

1. Navigate to the Settings page
2. Enter your Grok API key
3. Select your preferred Grok model
4. Click "Save API Key" to store locally

### Usage

1. Enter or paste AI-generated text into the input box
2. Select a humanization mode (Normal, Chit-chat, Academic, or Shorten)
3. Click "Humanize AI" to process the text
4. Review and copy the humanized output
5. Access your history to view past results

## License

This project is licensed under the AGPLv3 License.

## Contributing

Contributions are welcome :)

Use conventional commit style!