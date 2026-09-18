const $ = (selector) => document.querySelector(selector);
const messages = $('#messages');
const form = $('#chat-form');
const prompt = $('#prompt');
const STORAGE_KEY = 'shayan-ai-history';
const ONBOARD_KEY = 'shayan-ai-onboarded';
const fallbackReplies = [
  'I can help with that. Tell me your goal and I’ll turn it into clear next steps.',
  'A practical way to approach this is to define the outcome, break it into small actions, and complete the first one today.',
  'Great idea. I can help you plan, write, research, or improve it. What would you like to do next?'
];
let chats = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let currentChat = null;
let replyIndex = 0;

function clearMessages() {
  messages.innerHTML = `
    <div class="welcome-card">
      <div class="welcome-icon">✦</div>
      <h2>Welcome to SHAYAN AI</h2>
      <p>Ask anything, plan your work, or turn an idea into something real.</p>
    </div>
  `;
}

function escapeHtml(value = '') {
  return value.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function createChat(title = 'New chat') {
  const chat = { title, date: Date.now(), messages: [] };
  chats.push(chat);
  currentChat = chat;
  persist();
  return chat;
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats.slice(-20)));
  renderRecent();
  renderSaved();
}

function renderRecent() {
  const el = $('#recent-chats');
  if (!el) return;
  el.innerHTML = '';
  chats.slice(-5).reverse().forEach((chat) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'recent-chat';
    button.textContent = chat.title;
    button.addEventListener('click', () => loadChat(chat));
    el.appendChild(button);
  });
}

function renderSaved() {
  const el = $('#saved-list');
  if (!el) return;

  if (!chats.length) {
    el.innerHTML = `
      <div class="empty-state">
        <div>▱</div>
        <h2>No saved chats yet</h2>
        <p>Your conversations are saved locally as you use SHAYAN AI.</p>
      </div>
    `;
    return;
  }

  const items = chats.slice().reverse().map((chat, index) => {
    const realIndex = chats.length - 1 - index;
    return `
      <button class="saved-item" data-index="${realIndex}" type="button">
        <div>
          <strong>${escapeHtml(chat.title)}</strong>
          <small>${chat.messages.length} messages · ${new Date(chat.date).toLocaleDateString()}</small>
        </div>
      </button>
    `;
  }).join('');

  el.innerHTML = items;
  el.querySelectorAll('.saved-item').forEach((button) => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.index);
      loadChat(chats[index]);
    });
  });
}

function addMessage(text, role) {
  const row = document.createElement('div');
  row.className = `message ${role}`;

  if (role === 'assistant') {
    row.innerHTML = '<span class="message-avatar">S</span><div class="message-bubble"></div>';
  } else {
    row.innerHTML = '<div class="message-bubble"></div>';
  }

  const bubble = row.querySelector('.message-bubble');
  bubble.textContent = text;
  messages.appendChild(row);
  messages.scrollTop = messages.scrollHeight;
}

function showScreen(name) {
  document.querySelectorAll('.screen').forEach((screen) => screen.classList.add('hidden'));
  const screen = document.getElementById(`${name}-screen`);
  if (screen) screen.classList.remove('hidden');

  document.querySelectorAll('.nav-item[data-screen]').forEach((item) => {
    item.classList.toggle('active', item.dataset.screen === name);
  });

  const sidebar = $('#sidebar');
  if (sidebar) sidebar.classList.remove('open');
}

function loadChat(chat) {
  currentChat = chat;
  showScreen('chat');
  messages.innerHTML = '';
  chat.messages.forEach((entry) => addMessage(entry.text, entry.role));
  if (!chat.messages.length) clearMessages();
}

async function answer(text) {
  const endpoint = import.meta.env && import.meta.env.VITE_AI_ENDPOINT;

  if (endpoint) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      if (response.ok) {
        const data = await response.json();
        return data.reply || data.message || fallbackReplies[0];
      }
    } catch (error) {
      console.warn('AI endpoint unavailable', error);
    }
  }

  return fallbackReplies[replyIndex++ % fallbackReplies.length];
}

async function send(text) {
  const value = text.trim();
  if (!value) return;

  if ($('.welcome-card')) $('.welcome-card').remove();

  if (!currentChat || currentChat.messages.length === 0 && currentChat.title !== 'New chat') {
    currentChat = createChat(value.slice(0, 42));
  }

  if (!currentChat) {
    currentChat = createChat('New chat');
  }

  currentChat.title = currentChat.title === 'New chat' ? value.slice(0, 42) : currentChat.title;
  currentChat.messages.push({ role: 'user', text: value });
  currentChat.date = Date.now();

  addMessage(value, 'user');
  prompt.value = '';
  prompt.style.height = 'auto';

  const typing = document.createElement('div');
  typing.className = 'message assistant';
  typing.innerHTML = '<span class="message-avatar">S</span><div class="message-bubble">Thinking…</div>';
  messages.appendChild(typing);

  const reply = await answer(value);
  typing.remove();
  addMessage(reply, 'assistant');

  currentChat.messages.push({ role: 'assistant', text: reply });
  persist();
}

function setupVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return;

  const startVoice = () => {
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => {
      $('#voice-btn')?.classList.add('recording');
      $('#voice-top')?.classList.add('recording');
    };
    recognition.onend = () => {
      $('#voice-btn')?.classList.remove('recording');
      $('#voice-top')?.classList.remove('recording');
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      prompt.value = transcript;
      prompt.focus();
      prompt.style.height = 'auto';
      prompt.style.height = `${Math.min(prompt.scrollHeight, 130)}px`;
    };
    recognition.start();
  };

  $('#voice-btn')?.addEventListener('click', startVoice);
  $('#voice-top')?.addEventListener('click', startVoice);
}

function init() {
  if (!localStorage.getItem(ONBOARD_KEY)) {
    $('#onboarding').hidden = false;
  } else {
    $('#onboarding').hidden = true;
  }

  $('#start-app').addEventListener('click', () => {
    localStorage.setItem(ONBOARD_KEY, '1');
    $('#onboarding').hidden = true;
  });

  $('#new-chat').addEventListener('click', () => {
    currentChat = createChat('New chat');
    clearMessages();
    showScreen('chat');
    prompt.focus();
  });

  $('#clear-chat').addEventListener('click', () => {
    currentChat = createChat('New chat');
    clearMessages();
    showScreen('chat');
    prompt.focus();
  });

  $('#menu-btn').addEventListener('click', () => {
    $('#sidebar').classList.toggle('open');
  });

  $('#reset-onboarding').addEventListener('change', (event) => {
    if (event.target.checked) {
      localStorage.removeItem(ONBOARD_KEY);
      $('#onboarding').hidden = false;
    }
  });

  document.querySelectorAll('.nav-item[data-screen]').forEach((item) => {
    item.addEventListener('click', () => showScreen(item.dataset.screen));
  });

  document.querySelectorAll('.suggestion').forEach((button) => {
    button.addEventListener('click', () => {
      prompt.value = button.textContent;
      prompt.focus();
    });
  });

  document.querySelectorAll('.feature-card').forEach((button) => {
    button.addEventListener('click', () => {
      showScreen('chat');
      prompt.value = button.dataset.prompt;
      prompt.focus();
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    send(prompt.value);
  });

  prompt.addEventListener('input', () => {
    prompt.style.height = 'auto';
    prompt.style.height = `${Math.min(prompt.scrollHeight, 130)}px`;
  });

  setupVoiceInput();
  renderRecent();
  renderSaved();
  clearMessages();
  showScreen('chat');
}

init();
