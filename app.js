/* MiMo Coder - vanilla JavaScript app using Xiaomi MiMo OpenAI-compatible API. */
const API_BASE_URL = 'https://token-plan-sgp.xiaomimimo.com/v1';
const MODEL = 'mimo-v2.5-pro';
const SYSTEM_PROMPT = 'You are MiMo Coder, an expert AI coding assistant powered by Xiaomi MiMo. Help users with code, debugging, architecture, and software engineering.';
const STORAGE_KEY = 'mimo-coder-conversations';
const API_KEY_STORAGE = 'mimo-coder-api-key';

const el = {
  messages: document.getElementById('messages'),
  form: document.getElementById('chatForm'),
  input: document.getElementById('messageInput'),
  send: document.getElementById('sendBtn'),
  history: document.getElementById('historyList'),
  newChat: document.getElementById('newChatBtn'),
  settings: document.getElementById('settingsBtn'),
  modal: document.getElementById('settingsModal'),
  closeSettings: document.getElementById('closeSettingsBtn'),
  saveSettings: document.getElementById('saveSettingsBtn'),
  clearKey: document.getElementById('clearKeyBtn'),
  apiKey: document.getElementById('apiKeyInput'),
  apiHint: document.getElementById('apiHint'),
  title: document.getElementById('conversationTitle'),
  sidebar: document.getElementById('sidebar'),
  mobileMenu: document.getElementById('mobileMenuBtn')
};

let conversations = loadConversations();
let activeId = conversations[0]?.id || createConversation().id;
let isStreaming = false;

marked.setOptions({
  breaks: true,
  highlight(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  }
});

function uid() { return `chat-${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function getApiKey() { return localStorage.getItem(API_KEY_STORAGE) || ''; }
function activeConversation() { return conversations.find(c => c.id === activeId); }
function loadConversations() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function saveConversations() { localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations)); }
function createConversation() {
  const chat = { id: uid(), title: 'New Chat', createdAt: Date.now(), messages: [] };
  conversations.unshift(chat);
  saveConversations();
  return chat;
}

function render() {
  renderHistory();
  renderMessages();
  updateApiHint();
}

function renderHistory() {
  el.history.innerHTML = '';
  conversations.forEach(chat => {
    const btn = document.createElement('button');
    btn.className = `history-item${chat.id === activeId ? ' active' : ''}`;
    btn.type = 'button';
    btn.textContent = chat.title;
    btn.title = chat.title;
    btn.addEventListener('click', () => {
      activeId = chat.id;
      el.sidebar.classList.remove('open');
      render();
    });
    el.history.appendChild(btn);
  });
}

function renderMessages() {
  const chat = activeConversation();
  el.title.textContent = chat?.title || 'Ready to build';
  if (!chat || chat.messages.length === 0) {
    el.messages.innerHTML = emptyState();
    attachSuggestionHandlers();
    return;
  }
  el.messages.innerHTML = chat.messages.map(messageTemplate).join('');
  enhanceCodeBlocks();
  scrollToBottom();
}

function emptyState() {
  return `<div class="empty-state">
    <div class="empty-logo">M</div>
    <h2>Build faster with MiMo Coder</h2>
    <p>An expert coding partner powered by Xiaomi MiMo V2.5. Ask for architecture guidance, debugging help, tests, refactors, and production-ready code.</p>
    <div class="suggestions">
      ${[
        'Design a clean REST API for a task manager in Node.js',
        'Debug this React component and explain the root cause',
        'Write unit tests for a Python service layer',
        'Refactor a legacy function into readable, typed code'
      ].map(text => `<button class="suggestion" type="button">${escapeHtml(text)}</button>`).join('')}
    </div>
  </div>`;
}

function messageTemplate(msg) {
  const avatar = msg.role === 'user' ? 'You' : 'Mi';
  const body = msg.role === 'assistant' ? marked.parse(msg.content || '') : `<p>${escapeHtml(msg.content).replace(/\n/g, '<br>')}</p>`;
  return `<article class="message ${msg.role}"><div class="avatar">${avatar}</div><div class="bubble"><div class="content">${body}</div></div></article>`;
}

function enhanceCodeBlocks() {
  el.messages.querySelectorAll('pre code').forEach(code => {
    hljs.highlightElement(code);
    const pre = code.parentElement;
    if (pre.parentElement.classList.contains('code-wrap')) return;
    const lang = [...code.classList].find(c => c.startsWith('language-'))?.replace('language-', '') || 'code';
    const wrap = document.createElement('div');
    wrap.className = 'code-wrap';
    const label = document.createElement('div');
    label.className = 'code-label';
    label.innerHTML = `<span>${escapeHtml(lang)}</span><button class="copy-code" type="button">Copy</button>`;
    pre.replaceWith(wrap);
    wrap.append(label, pre);
    label.querySelector('button').addEventListener('click', async e => {
      await navigator.clipboard.writeText(code.innerText);
      e.currentTarget.textContent = 'Copied';
      setTimeout(() => (e.currentTarget.textContent = 'Copy'), 1200);
    });
  });
}

function attachSuggestionHandlers() {
  el.messages.querySelectorAll('.suggestion').forEach(btn => {
    btn.addEventListener('click', () => {
      el.input.value = btn.textContent;
      resizeInput();
      el.input.focus();
    });
  });
}

async function sendMessage(text) {
  const apiKey = getApiKey();
  if (!apiKey) { openSettings(); return; }
  const chat = activeConversation();
  chat.messages.push({ role: 'user', content: text });
  if (chat.title === 'New Chat') chat.title = text.slice(0, 54) + (text.length > 54 ? '…' : '');
  const assistantMsg = { role: 'assistant', content: '' };
  chat.messages.push(assistantMsg);
  saveConversations();
  render();
  showTypingInLastBubble();

  isStreaming = true;
  el.send.disabled = true;
  try {
    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: MODEL,
        stream: true,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...chat.messages.filter(m => m.content).map(({ role, content }) => ({ role, content }))
        ]
      })
    });
    if (!response.ok) throw new Error(`MiMo API error ${response.status}: ${await response.text()}`);
    await readStream(response, chunk => {
      assistantMsg.content += chunk;
      updateLastAssistant(assistantMsg.content);
    });
  } catch (error) {
    assistantMsg.content = `⚠️ ${error.message}\n\nCheck your API key, network access, and Xiaomi MiMo account permissions.`;
    updateLastAssistant(assistantMsg.content);
  } finally {
    isStreaming = false;
    el.send.disabled = false;
    saveConversations();
    renderHistory();
  }
}

async function readStream(response, onToken) {
  const reader = response.body.getReader();
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
      if (!trimmed.startsWith('data:')) continue;
      const data = trimmed.slice(5).trim();
      if (data === '[DONE]') return;
      try {
        const json = JSON.parse(data);
        const token = json.choices?.[0]?.delta?.content || '';
        if (token) onToken(token);
      } catch (e) { console.warn('Skipping malformed SSE chunk', e); }
    }
  }
}

function showTypingInLastBubble() {
  const contents = el.messages.querySelectorAll('.message.assistant .content');
  const last = contents[contents.length - 1];
  if (last) last.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
  scrollToBottom();
}

function updateLastAssistant(content) {
  const contents = el.messages.querySelectorAll('.message.assistant .content');
  const last = contents[contents.length - 1];
  if (!last) return;
  last.innerHTML = marked.parse(content || '');
  enhanceCodeBlocks();
  scrollToBottom();
}

function updateApiHint() {
  el.apiHint.textContent = getApiKey()
    ? `Connected to Xiaomi MiMo API • ${MODEL} • Streaming enabled`
    : 'Configure your Xiaomi MiMo API key in settings to start coding.';
}

function openSettings() { el.apiKey.value = getApiKey(); el.modal.classList.add('open'); setTimeout(() => el.apiKey.focus(), 50); }
function closeSettings() { el.modal.classList.remove('open'); }
function resizeInput() { el.input.style.height = 'auto'; el.input.style.height = `${Math.min(el.input.scrollHeight, 180)}px`; }
function scrollToBottom() { el.messages.scrollTop = el.messages.scrollHeight; }
function escapeHtml(str) {
  return String(str).replace(/[&<>'"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[ch]));
}

el.form.addEventListener('submit', e => {
  e.preventDefault();
  const text = el.input.value.trim();
  if (!text || isStreaming) return;
  el.input.value = '';
  resizeInput();
  sendMessage(text);
});
el.input.addEventListener('input', resizeInput);
el.input.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); el.form.requestSubmit(); }
});
el.newChat.addEventListener('click', () => { activeId = createConversation().id; render(); el.input.focus(); });
el.settings.addEventListener('click', openSettings);
el.closeSettings.addEventListener('click', closeSettings);
el.modal.addEventListener('click', e => { if (e.target === el.modal) closeSettings(); });
el.saveSettings.addEventListener('click', () => { localStorage.setItem(API_KEY_STORAGE, el.apiKey.value.trim()); updateApiHint(); closeSettings(); });
el.clearKey.addEventListener('click', () => { localStorage.removeItem(API_KEY_STORAGE); el.apiKey.value = ''; updateApiHint(); });
el.mobileMenu.addEventListener('click', () => el.sidebar.classList.toggle('open'));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSettings(); });

render();
