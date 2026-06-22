export interface AgentStatus {
  name: string;
  role: string;
  statusLabel: string;
}

export interface AIChatPayload {
  message: string;
  selectedAgent: {
    name: string;
  };
  agents: AgentStatus[];
}

/**
 * Sends a message to the Cloudflare Workers AI office chat assistant.
 */
export async function callWorkersAI(payload: AIChatPayload): Promise<any> {
  const response = await fetch('https://voice-office-ai.ballaaaa6.workers.dev/api/office-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}
