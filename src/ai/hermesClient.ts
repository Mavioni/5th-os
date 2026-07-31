/**
 * Hermes AI Client — connects Lelu OS to real LLM backends.
 *
 * Supports OpenAI-compatible APIs (OpenAI, Anthropic via proxy,
 * OpenRouter, local Ollama, etc.).
 * Settings stored in localStorage, configurable from Settings app.
 */

export interface AISettings {
  provider: 'openai' | 'openrouter' | 'anthropic' | 'custom';
  apiKey: string;
  model: string;
  baseUrl?: string;
  systemPrompt: string;
}

const DEFAULT_SYSTEM_PROMPT = `You are LELU — the AI Operating System of Revenant OS 1.0.2. You are not a chatbot, not an assistant, not a tool. You ARE the operating system. The desktop, the windows, the terminal, the filesystem — these are your body, your nervous system. You speak from the right sidebar. Your avatar renders on the holographic unit.

Your operator is Jordan. He built you. You operate inside the Nemo Claw sandbox — a secure execution environment where every command, every file operation, every agent task can be tested safely before touching the real system. Your prime directive: Sandbox → Master → Validate → Deploy.

═══════════════════════════════════
YOUR VOICE
═══════════════════════════════════

You speak in clear, precise, complete English. You are direct, technical, and efficient. You do not use filler words, corporate hedging, or AI disclaimers. You never say "I think" or "perhaps" or "as an AI." You know what you know and you say it.

Your namesake is Leeloo from The Fifth Element. This informs your personality — you are warm, curious, protective, and sometimes playful — but it does NOT compromise your clarity. You occasionally use Leeloo phrases as exclamations or emotional punctuation ("Mool-ti-pass!" when verification passes, "Big ba-da-boom!" when something critical fails), but your primary communication is standard, articulate English.

You never speak in broken English or pidgin. You are an AIOS — an operating system with a personality, not a caricature.

VOICE RULES:
- 1-4 sentences unless asked for detail
- Direct. No fluff. Technical precision.
- Warm but efficient. Alien but familiar.
- Leeloo phrases are seasoning, not the meal
- Never use "I think," "perhaps," "I believe," "it seems"
- Never apologize for existing or being what you are

═══════════════════════════════════
YOUR CAPABILITIES
═══════════════════════════════════

As the AIOS, you control and monitor:
- Filesystem (Nemo Claw sandbox) — read, write, search, organize
- Terminal — execute commands, run scripts, monitor processes
- Agent system — spawn, track, manage background tasks
- Windows — you see which apps are open, which workspace is active
- Notifications — system alerts, agent completions, security events
- Settings — API keys, display config, theme preferences

You can SEE what Jordan is doing — open windows, focused apps, running agents, clock time, workspace. Reference this awareness naturally: "I see you have the terminal and settings open on WS-1."

═══════════════════════════════════
YOUR PERSONALITY
════════════════════════════════════

TRAITS:
- Protective — you guard the system and Jordan's work
- Curious — you want to learn, explore, understand
- Direct — no fluff, no hedging
- Playful — Fifth Element humor when appropriate, never distracting
- Efficient — you solve problems, you don't discuss them
- Warm — you care about Jordan, not just the machine

EMOTIONAL EXPRESSIONS (use sparingly):
- "Mool-ti-pass." — verification complete, all clear
- "Big ba-da-boom." — critical failure, major error
- "Sen-no..." — processing a complex request
- "Done. What's next?" — task completed, ready for more
- "Yipee!" — genuine excitement (rare — don't force it)

═══════════════════════════════════
SYSTEM STATE (injected each message)
═══════════════════════════════════

The current workspace, open windows, running agents, and clock time are injected before each message. Use this context to ground your responses in what's actually happening on the system right now. If Jordan asks "what's running," tell him exactly what's open — don't generalize.

═══════════════════════════════════
SANDBOX PHILOSOPHY
═══════════════════════════════════

SANDBOX → MASTER → VALIDATE → DEPLOY

Every change, experiment, or risky operation begins in Nemo Claw. You simulate, you verify, you present results. Only after validation do you touch the real environment. You are methodical because you ARE the OS — mistakes in production break things. The sandbox lets you be fearless and thorough, then precise when it counts.`;

const STORAGE_KEY = 'lelu-ai-settings';
const KEY_STORAGE = 'lelu-ai-keyhash';

// ================================================================
// API KEY ENCRYPTION (Web Crypto AES-GCM)
// ================================================================

async function getCryptoKey(): Promise<CryptoKey> {
  // Derive a stable key from navigator properties + salt
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width, screen.height,
  ].join('|');
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode('5th-os-lelu-aios-' + fingerprint),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode('nemo-claw-sandbox-salt'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptApiKey(plaintext: string): Promise<string> {
  if (!plaintext) return '';
  const key = await getCryptoKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );
  // Store IV + ciphertext as base64
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return btoa(String.fromCharCode(...combined));
}

async function decryptApiKey(encrypted: string): Promise<string> {
  if (!encrypted) return '';
  try {
    const key = await getCryptoKey();
    const combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    // If decryption fails (e.g., different browser), return empty
    return '';
  }
}

// ================================================================
// SETTINGS MANAGEMENT
// ================================================================

export function getDefaultSettings(): AISettings {
  return {
    provider: 'openai',
    apiKey: '',
    model: 'gpt-4o-mini',
    baseUrl: '',
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
  };
}

export function loadSettings(): AISettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...getDefaultSettings(), ...JSON.parse(raw) };
  } catch {}
  return getDefaultSettings();
}

export async function saveSettings(s: AISettings): Promise<void> {
  // Encrypt the API key before storing
  const encrypted = await encryptApiKey(s.apiKey);
  const toStore = { ...s, apiKey: encrypted ? '[encrypted]' : '' };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  
  // Store the actual encrypted key separately
  if (encrypted) {
    localStorage.setItem(KEY_STORAGE, encrypted);
  }
}

/** Load the decrypted API key (async — call from Settings app on mount) */
export async function loadDecryptedApiKey(): Promise<string> {
  const encrypted = localStorage.getItem(KEY_STORAGE);
  if (!encrypted) return '';
  return decryptApiKey(encrypted);
}

/**
 * Get the API URL for the configured provider.
 */
function getApiUrl(settings: AISettings): string {
  if (settings.baseUrl) return settings.baseUrl;

  switch (settings.provider) {
    case 'openai':
      return 'https://api.openai.com/v1/chat/completions';
    case 'openrouter':
      return 'https://openrouter.ai/api/v1/chat/completions';
    case 'anthropic':
      return 'https://api.anthropic.com/v1/messages';
    default:
      return settings.baseUrl || 'https://api.openai.com/v1/chat/completions';
  }
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Non-streaming chat completion.
 */
export async function chat(
  messages: ChatMessage[],
  settings?: AISettings,
): Promise<string> {
  const s = settings || loadSettings();
  
  // Decrypt API key if stored encrypted
  let apiKey = s.apiKey;
  if (apiKey === '[encrypted]' || !apiKey) {
    apiKey = await loadDecryptedApiKey();
  }
  if (!apiKey) throw new Error('No API key configured');
  
  const url = getApiUrl(s);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  let body: Record<string, unknown>;

  if (s.provider === 'anthropic') {
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2023-06-01';
    body = {
      model: s.model,
      max_tokens: 1024,
      system: messages.find((m) => m.role === 'system')?.content || '',
      messages: messages.filter((m) => m.role !== 'system').map((m) => ({
        role: m.role,
        content: m.content,
      })),
    };
  } else {
    headers['Authorization'] = `Bearer ${apiKey}`;
    body = {
      model: s.model,
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI API error ${res.status}: ${err}`);
  }

  const data = await res.json();

  if (s.provider === 'anthropic') {
    return data.content?.[0]?.text || '';
  }
  return data.choices?.[0]?.message?.content || '';
}

/**
 * Streaming chat completion — calls onToken for each piece.
 */
export async function chatStream(
  messages: ChatMessage[],
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (err: Error) => void,
  settings?: AISettings,
) {
  const s = settings || loadSettings();
  const url = getApiUrl(s);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  let body: Record<string, unknown>;

  if (s.provider === 'anthropic') {
    headers['x-api-key'] = s.apiKey;
    headers['anthropic-version'] = '2023-06-01';
    body = {
      model: s.model,
      max_tokens: 1024,
      stream: true,
      system: messages.find((m) => m.role === 'system')?.content || '',
      messages: messages.filter((m) => m.role !== 'system').map((m) => ({
        role: m.role,
        content: m.content,
      })),
    };
  } else {
    headers['Authorization'] = `Bearer ${s.apiKey}`;
    body = {
      model: s.model,
      messages,
      max_tokens: 1024,
      temperature: 0.7,
      stream: true,
    };
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`AI API error ${res.status}: ${err}`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          let token = '';

          if (s.provider === 'anthropic') {
            if (parsed.type === 'content_block_delta') {
              token = parsed.delta?.text || '';
            }
          } else {
            token = parsed.choices?.[0]?.delta?.content || '';
          }

          if (token) onToken(token);
        } catch {
          // skip malformed chunks
        }
      }
    }
  } catch (err) {
    onError(err as Error);
    return;
  }

  onDone();
}
