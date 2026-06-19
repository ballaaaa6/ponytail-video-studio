export interface Env {
  AI: {
    run(model: string, input: unknown): Promise<unknown>
  }
}

type OfficeRequest = {
  message?: string
  selectedAgent?: {
    name?: string
    role?: string
    statusLabel?: string
  }
  agents?: Array<{
    name: string
    role: string
    statusLabel: string
  }>
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return withCors(new Response(null, { status: 204 }))
    }

    if (request.method !== 'POST' || url.pathname !== '/api/office-chat') {
      return withCors(Response.json({ error: 'Not found' }, { status: 404 }))
    }

    const body = (await request.json().catch(() => ({}))) as OfficeRequest
    const selectedAgent = body.selectedAgent?.name || 'Chief of Staff'
    const agentBrief = (body.agents || [])
      .map((agent) => `- ${agent.name}: ${agent.role}, status=${agent.statusLabel}`)
      .join('\n')

    const prompt = [
      'You are the concise command assistant inside a Thai AI video-production office web app.',
      'Answer in Thai.',
      'Keep the answer practical and short, no more than 5 sentences.',
      'The user is the boss. The office currently focuses on YouTube video production.',
      `Selected employee: ${selectedAgent}`,
      `Employees:\n${agentBrief}`,
      `Boss message: ${body.message || ''}`
    ].join('\n\n')

    const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: 'You help route office tasks, explain next actions, and report blockers clearly.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    const text = readAiText(result)

    return withCors(
      Response.json({
        sender: selectedAgent,
        text
      })
    )
  }
}

function readAiText(result: unknown): string {
  if (typeof result === 'object' && result !== null && 'response' in result) {
    const response = (result as { response?: unknown }).response
    if (typeof response === 'string') return response
  }

  return 'รับทราบครับบอส เดี๋ยวผมแยกงานให้ทีมวิดีโอและแจ้งถ้ามีจุดที่ต้องให้บอสช่วย'
}

function withCors(response: Response): Response {
  const headers = new Headers(response.headers)
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  })
}
