const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

export async function generateMermaidCode(description: string, apiKey: string): Promise<string> {
  const systemPrompt = `You are a system architecture expert. Generate ONLY valid Mermaid diagram code for the described system. 

Rules:
1. Choose the most appropriate Mermaid diagram type (flowchart, sequence, class, state, etc.)
2. Use proper Mermaid syntax and formatting
3. Focus on: components, data flow, relationships, and interactions
4. Make diagrams clear and professional
5. Use meaningful node names and labels
6. Output ONLY the Mermaid code without explanations, markdown formatting, or code blocks
7. Ensure the diagram is comprehensive but not overcomplicated

For flowcharts, use these node types:
- Rectangle nodes: [Service Name]
- Rounded nodes: (Database)
- Circle nodes: ((Cache))
- Diamond nodes: {Decision}
- Hexagon nodes: {{External API}}

System description: ${description}`

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: systemPrompt
        }]
      }],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    if (response.status === 400) {
      throw new Error('Invalid API key or request. Please check your Gemini API key.')
    } else if (response.status === 429) {
      throw new Error('API rate limit exceeded. Please wait a moment and try again.')
    } else {
      throw new Error(`API error: ${errorData.error?.message || 'Unknown error'}`)
    }
  }

  const data = await response.json()

  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Invalid response from Gemini API')
  }

  const generatedText = data.candidates[0].content.parts[0].text

  // Clean up the response - remove markdown code blocks if present
  let mermaidCode = generatedText
    .replace(/```mermaid\n?/gi, '')
    .replace(/```\n?/g, '')
    .trim()

  // Validate basic Mermaid syntax
  if (!isValidMermaidCode(mermaidCode)) {
    throw new Error('Generated code is not valid Mermaid syntax')
  }

  return mermaidCode
}

function isValidMermaidCode(code: string): boolean {
  const trimmedCode = code.trim()

  if (!trimmedCode || trimmedCode.length < 5) {
    return false
  }

  const mermaidPatterns = [
    /^graph\s+(TD|TB|BT|RL|LR)/i,
    /^flowchart\s+(TD|TB|BT|RL|LR)/i,
    /^sequenceDiagram/i,
    /^classDiagram/i,
    /^stateDiagram/i,
    /^erDiagram/i,
    /^pie\s+title/i,
    /^gantt/i,
    /^gitgraph/i,
    /^journey/i
  ]

  return mermaidPatterns.some(pattern => pattern.test(trimmedCode))
}