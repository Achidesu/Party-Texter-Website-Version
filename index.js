const Submit = document.getElementById('Submit');
const Clear = document.getElementById('Clear');
const Copy = document.getElementById('Copy');

const StrategyNameInput = document.getElementById('Strategy-Name');
const StrategyLinkInput = document.getElementById('Strategy-Link');
const RequirementsInput = document.getElementById('Requirements');
const OutputElement = document.getElementById('output-1');

Submit.addEventListener('click', generateOutput);
Clear.addEventListener('click', clearForm);
Copy.addEventListener('click', copyOutput);

function generateOutput() {
  const strategyName = StrategyNameInput.value.trim();
  const strategyLink = StrategyLinkInput.value.trim();

  if (!strategyName) {
    window.alert('Please fill the Strategy Name');
    return;
  }

  if (!strategyLink) {
    window.alert('Please fill the Strategy Link');
    return;
  }

  const hostingRequirements = RequirementsInput.value.trim();
  const strategyNameLine = `Hosting ${strategyName}`;
  const strategyLinkLine = `Strategy Link : **${strategyLink}**`;
  const requirementsLine = hostingRequirements ? `Requirements : ${hostingRequirements}` : '';

  const playerStatus = checkPlayerStatus();
  const playerLines = buildPlayerLines(playerStatus);

  const discordMarkdown =
    [strategyNameLine, strategyLinkLine, ...playerLines, requirementsLine]
      .filter(Boolean)
      .join('\n');

  OutputElement.textContent = discordMarkdown;
}

function checkPlayerStatus() {
  const statuses = [];
  for (let i = 1; i <= 4; i++) {
    const checked = document.getElementById('Player-' + i).checked;
    statuses.push(checked ? 1 : 0);
  }
  return statuses;
}

function buildPlayerLines(statuses) {
  return statuses.map((status, index) => {
    const playerNumber = index + 1;
    if (status === 1) {
      return `Player ${playerNumber} : Closed :red_circle:`;
    }
    return `Player ${playerNumber} : Open :green_circle:`;
  });
}

function clearForm() {
  StrategyNameInput.value = '';
  StrategyLinkInput.value = '';
  RequirementsInput.value = '';
  OutputElement.textContent = '';

  for (let i = 1; i <= 4; i++) {
    document.getElementById('Player-' + i).checked = false;
  }
}

async function copyOutput() {
  const text = OutputElement.textContent || '';
  if (!text.trim()) {
    window.alert('Nothing to copy');
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    window.alert('Text has been copied!');
  } catch (error) {
    console.error('Could not copy text:', error);
    window.alert('Could not copy text.');
  }
}
