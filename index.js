const THEME_KEY = 'party-texter-theme';
const DRAFT_KEY = 'party-texter-draft';
const PLAYER_COUNT_NORMAL = 4;
const PLAYER_COUNT_HARDCORE = 3;

const Submit = document.getElementById('Submit');
const Clear = document.getElementById('Clear');
const Copy = document.getElementById('Copy');
const ThemeToggle = document.getElementById('Theme-Toggle');
const HardcoreModeCheckbox = document.getElementById('Hardcore-Mode');

const StrategyNameInput = document.getElementById('Strategy-Name');
const StrategyLinkInput = document.getElementById('Strategy-Link');
const RequirementsInput = document.getElementById('Requirements');
const OutputElement = document.getElementById('output-1');
const PlayerContainer = document.getElementById('Player-Container');
const PlayerSummary = document.getElementById('Player-Summary');
const Toast = document.getElementById('Toast');
const OutputTabs = document.querySelectorAll('.output-tabs .tab');

// Raw Discord markdown of the last generated message ('' = nothing generated yet).
let outputText = '';
let outputView = 'preview';
let closedPlayers = new Set();
let toastTimer = null;

/* ---------- Storage helpers ---------- */
function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  } catch (error) {
    // ignore storage errors (private mode, blocked storage)
  }
}

/* ---------- Theme ---------- */
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  ThemeToggle.textContent = theme === 'dark' ? '☀ Light' : '☾ Dark';
  ThemeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
}

ThemeToggle.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  writeStorage(THEME_KEY, next);
});

/* ---------- Players ---------- */
function getPlayerCount() {
  return HardcoreModeCheckbox.checked ? PLAYER_COUNT_HARDCORE : PLAYER_COUNT_NORMAL;
}

function renderPlayers() {
  const count = getPlayerCount();
  // Drop slots that no longer exist (e.g. switching to hardcore).
  closedPlayers = new Set([...closedPlayers].filter((n) => n <= count));

  PlayerContainer.replaceChildren();
  for (let i = 1; i <= count; i++) {
    const label = document.createElement('label');
    label.className = 'player-check';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = 'Player-' + i;
    input.className = 'check-box';
    input.checked = closedPlayers.has(i);
    input.addEventListener('change', () => {
      if (input.checked) {
        closedPlayers.add(i);
      } else {
        closedPlayers.delete(i);
      }
      updatePlayerSummary();
      onFormChange();
    });

    const name = document.createElement('span');
    name.className = 'player-label';
    name.textContent = 'Player ' + i;

    const status = document.createElement('span');
    status.className = 'player-status';

    label.append(input, name, status);
    PlayerContainer.appendChild(label);
  }
  updatePlayerSummary();
}

function updatePlayerSummary() {
  const count = getPlayerCount();
  const open = count - closedPlayers.size;
  PlayerSummary.textContent = `${open} / ${count} open`;
}

function buildPlayerLines() {
  const lines = [];
  for (let i = 1; i <= getPlayerCount(); i++) {
    lines.push(closedPlayers.has(i)
      ? `Player ${i} : Closed :red_circle:`
      : `Player ${i} : Open :green_circle:`);
  }
  return lines;
}

HardcoreModeCheckbox.addEventListener('change', () => {
  renderPlayers();
  onFormChange();
});

/* ---------- Validation ---------- */
function setFieldError(input, message) {
  const error = document.getElementById(input.id + '-Error');
  input.classList.toggle('is-invalid', Boolean(message));
  input.setAttribute('aria-invalid', String(Boolean(message)));
  if (error) {
    error.textContent = message;
  }
}

function validate() {
  const checks = [
    [StrategyNameInput, 'Please fill the Strategy Name'],
    [StrategyLinkInput, 'Please fill the Strategy Link']
  ];
  let firstInvalid = null;
  for (const [input, message] of checks) {
    const invalid = !input.value.trim();
    setFieldError(input, invalid ? message : '');
    if (invalid && !firstInvalid) {
      firstInvalid = input;
    }
  }
  if (firstInvalid) {
    firstInvalid.focus();
    return false;
  }
  return true;
}

/* ---------- Output ---------- */
function buildMessage() {
  const strategyName = StrategyNameInput.value.trim();
  const strategyLink = StrategyLinkInput.value.trim();
  const requirements = RequirementsInput.value.trim();

  return [
    `Hosting ${strategyName}`,
    `Strategy Link : **${strategyLink}**`,
    ...buildPlayerLines(),
    requirements ? `Requirements : ${requirements}` : ''
  ]
    .filter(Boolean)
    .join('\n');
}

function generateOutput() {
  if (!validate()) {
    showToast('Please fill in the required fields', 'error');
    return;
  }
  outputText = buildMessage();
  renderOutput(true);
}

const EMOJI = {
  ':red_circle:': '🔴',
  ':green_circle:': '🟢'
};

// Renders a Discord-ish preview using DOM nodes (no innerHTML, so input is never interpreted as HTML).
function renderPreview(text) {
  const fragment = document.createDocumentFragment();
  text.split('\n').forEach((line, index) => {
    if (index > 0) {
      fragment.appendChild(document.createElement('br'));
    }
    line.split(/(\*\*[^*]+\*\*|:red_circle:|:green_circle:)/g).forEach((part) => {
      if (!part) {
        return;
      }
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        const strong = document.createElement('strong');
        strong.textContent = part.slice(2, -2);
        fragment.appendChild(strong);
      } else if (EMOJI[part]) {
        const emoji = document.createElement('span');
        emoji.className = 'discord-emoji-marker';
        emoji.textContent = EMOJI[part];
        fragment.appendChild(emoji);
      } else {
        fragment.appendChild(document.createTextNode(part));
      }
    });
  });
  return fragment;
}

function renderOutput(animate) {
  OutputElement.replaceChildren();
  OutputElement.classList.toggle('is-raw', outputView === 'raw');

  if (!outputText) {
    const empty = document.createElement('p');
    empty.className = 'output-empty';
    empty.textContent = 'Fill in the form and press Submit to generate your message.';
    OutputElement.appendChild(empty);
  } else if (outputView === 'raw') {
    OutputElement.textContent = outputText;
  } else {
    OutputElement.appendChild(renderPreview(outputText));
  }

  if (animate) {
    OutputElement.classList.remove('reveal');
    void OutputElement.offsetWidth; // restart animation
    OutputElement.classList.add('reveal');
  }
}

OutputTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    outputView = tab.dataset.view;
    OutputTabs.forEach((t) => {
      const active = t === tab;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', String(active));
    });
    renderOutput(false);
  });
});

/* ---------- Copy / Clear ---------- */
async function copyOutput() {
  if (!outputText) {
    showToast('Nothing to copy — press Submit first', 'error');
    return;
  }

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(outputText);
    } else {
      fallbackCopy(outputText);
    }
    showToast('Copied to clipboard!', 'success');
    Copy.classList.add('is-done');
    Copy.textContent = 'Copied ✓';
    setTimeout(() => {
      Copy.classList.remove('is-done');
      Copy.textContent = 'Copy';
    }, 1500);
  } catch (error) {
    console.error('Could not copy text:', error);
    showToast('Could not copy text', 'error');
  }
}

function fallbackCopy(text) {
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand('copy');
  area.remove();
  if (!ok) {
    throw new Error('execCommand copy failed');
  }
}

function clearForm() {
  StrategyNameInput.value = '';
  StrategyLinkInput.value = '';
  RequirementsInput.value = '';
  closedPlayers.clear();
  outputText = '';

  setFieldError(StrategyNameInput, '');
  setFieldError(StrategyLinkInput, '');
  renderPlayers();
  renderOutput(false);
  writeStorage(DRAFT_KEY, null);
  showToast('Cleared');
  StrategyNameInput.focus();
}

/* ---------- Toast ---------- */
function showToast(message, kind) {
  Toast.textContent = message;
  Toast.className = 'toast is-visible' + (kind ? ' toast-' + kind : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    Toast.classList.remove('is-visible');
  }, 2200);
}

/* ---------- Draft persistence & live update ---------- */
function saveDraft() {
  writeStorage(DRAFT_KEY, JSON.stringify({
    name: StrategyNameInput.value,
    link: StrategyLinkInput.value,
    requirements: RequirementsInput.value,
    hardcore: HardcoreModeCheckbox.checked,
    closed: [...closedPlayers]
  }));
}

function loadDraft() {
  try {
    const draft = JSON.parse(readStorage(DRAFT_KEY));
    if (!draft) {
      return;
    }
    StrategyNameInput.value = draft.name || '';
    StrategyLinkInput.value = draft.link || '';
    RequirementsInput.value = draft.requirements || '';
    HardcoreModeCheckbox.checked = Boolean(draft.hardcore);
    closedPlayers = new Set(Array.isArray(draft.closed) ? draft.closed : []);
  } catch (error) {
    // ignore corrupted drafts
  }
}

// Once a message has been generated, keep it in sync with the form.
function onFormChange() {
  saveDraft();
  if (outputText && StrategyNameInput.value.trim() && StrategyLinkInput.value.trim()) {
    outputText = buildMessage();
    renderOutput(false);
  }
}

[StrategyNameInput, StrategyLinkInput, RequirementsInput].forEach((input) => {
  input.addEventListener('input', () => {
    if (input.classList.contains('is-invalid') && input.value.trim()) {
      setFieldError(input, '');
    }
    onFormChange();
  });
});

/* ---------- Wiring ---------- */
Submit.addEventListener('click', generateOutput);
Clear.addEventListener('click', clearForm);
Copy.addEventListener('click', copyOutput);

document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault();
    generateOutput();
  }
});

applyTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
loadDraft();
renderPlayers();
renderOutput(false);
