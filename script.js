/**
 * Gerador de Senhas
 * Gera senhas criptograficamente seguras usando a Web Crypto API.
 */

// ─── Conjuntos de caracteres ──────────────────────────────────────────────────
const CHARS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers:   '0123456789',
  symbols:   '!@#$%^&*()-_=+[]{}|;:,.<>?',
};

// ─── Referências ao DOM ───────────────────────────────────────────────────────
const passwordText  = document.getElementById('passwordText');
const copyBtn       = document.getElementById('copyBtn');
const copyIcon      = document.getElementById('copyIcon');
const checkIcon     = document.getElementById('checkIcon');
const generateBtn   = document.getElementById('generateBtn');
const lengthRange   = document.getElementById('lengthRange');
const lengthValue   = document.getElementById('lengthValue');
const strengthFill  = document.getElementById('strengthFill');
const strengthLabel = document.getElementById('strengthLabel');
const toast         = document.getElementById('toast');

const checkboxes = {
  uppercase: document.getElementById('optUppercase'),
  lowercase: document.getElementById('optLowercase'),
  numbers:   document.getElementById('optNumbers'),
  symbols:   document.getElementById('optSymbols'),
};

// ─── Estado ───────────────────────────────────────────────────────────────────
let currentPassword = '';
let toastTimer      = null;
let copyResetTimer  = null;

// ─── Slider: atualiza o valor exibido ─────────────────────────────────────────
lengthRange.addEventListener('input', () => {
  lengthValue.textContent = lengthRange.value;
  // Se já existe uma senha exibida, atualiza a força em tempo real
  if (currentPassword) updateStrength(currentPassword);
});

// ─── Gerar ────────────────────────────────────────────────────────────────────
generateBtn.addEventListener('click', () => {
  const selected = getSelectedCharsets();

  if (selected.length === 0) {
    showToast('Selecione ao menos um tipo de caractere', 'error');
    return;
  }

  const length   = parseInt(lengthRange.value, 10);
  const password = generatePassword(length, selected);

  currentPassword = password;
  displayPassword(password);
  updateStrength(password);
});

// ─── Copiar ───────────────────────────────────────────────────────────────────
copyBtn.addEventListener('click', async () => {
  if (!currentPassword) return;

  try {
    await navigator.clipboard.writeText(currentPassword);
    showCopiedState();
    showToast('Copiado para a área de transferência');
  } catch {
    showToast('Não foi possível copiar a senha', 'error');
  }
});

// ─── Lógica principal ─────────────────────────────────────────────────────────

/**
 * Retorna um array com os conjuntos de caracteres selecionados.
 */
function getSelectedCharsets() {
  return Object.entries(checkboxes)
    .filter(([, el]) => el.checked)
    .map(([key]) => CHARS[key]);
}

/**
 * Gera uma senha com o tamanho e conjuntos de caracteres fornecidos.
 * Usa crypto.getRandomValues para imprevisibilidade.
 *
 * Estratégia: garante ao menos um caractere de cada tipo selecionado,
 * depois preenche o restante aleatoriamente a partir do pool completo.
 */
function generatePassword(length, charsets) {
  const pool = charsets.join('');
  const result = [];

  // Garante ao menos um caractere de cada tipo selecionado
  for (const set of charsets) {
    result.push(randomChar(set));
  }

  // Preenche os slots restantes com o pool completo
  for (let i = result.length; i < length; i++) {
    result.push(randomChar(pool));
  }

  // Embaralha para evitar padrão previsível no prefixo
  return cryptoShuffle(result).join('');
}

/**
 * Escolhe um caractere aleatório de uma string usando crypto.getRandomValues.
 */
function randomChar(str) {
  const array = new Uint32Array(1);
  // Rejection sampling para evitar viés de módulo
  const max = Math.floor(0xFFFFFFFF / str.length) * str.length;
  let value;
  do {
    crypto.getRandomValues(array);
    value = array[0];
  } while (value >= max);
  return str[value % str.length];
}

/**
 * Embaralhamento Fisher-Yates usando crypto.getRandomValues.
 */
function cryptoShuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const uint = new Uint32Array(1);
    const max  = Math.floor(0xFFFFFFFF / (i + 1)) * (i + 1);
    let val;
    do {
      crypto.getRandomValues(uint);
      val = uint[0];
    } while (val >= max);
    const j = val % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─── Atualizações de UI ───────────────────────────────────────────────────────

/**
 * Exibe a senha gerada com animação de entrada suave.
 */
function displayPassword(password) {
  passwordText.classList.remove('animate');
  // Força reflow para reiniciar a animação corretamente
  void passwordText.offsetWidth;
  passwordText.textContent = password;
  passwordText.classList.add('has-password', 'animate');
}

/**
 * Calcula e renderiza o indicador de força da senha.
 *
 * Bits de entropia ≈ log2(tamanhoDPool ^ tamanho)
 * Limites: fraca < 40 | razoável < 60 | boa < 80 | forte ≥ 80
 */
function updateStrength(password) {
  const pool    = estimatePoolSize();
  const entropy = password.length * Math.log2(pool || 1);

  let pct, label, color;

  if (entropy < 40) {
    pct = 25;  label = 'Fraca';   color = 'var(--strength-weak)';
  } else if (entropy < 60) {
    pct = 50;  label = 'Razoável'; color = 'var(--strength-fair)';
  } else if (entropy < 80) {
    pct = 75;  label = 'Boa';    color = 'var(--strength-good)';
  } else {
    pct = 100; label = 'Forte';  color = 'var(--strength-strong)';
  }

  strengthFill.style.width           = `${pct}%`;
  strengthFill.style.backgroundColor = color;
  strengthLabel.style.color          = color;
  strengthLabel.textContent          = label;
}

/**
 * Retorna o tamanho do pool de caracteres atualmente selecionado.
 */
function estimatePoolSize() {
  return getSelectedCharsets().join('').length;
}

/**
 * Exibe o ícone de confirmação no botão de copiar por alguns instantes.
 */
function showCopiedState() {
  clearTimeout(copyResetTimer);
  copyBtn.classList.add('copied');
  copyIcon.classList.add('hidden');
  checkIcon.classList.remove('hidden');

  copyResetTimer = setTimeout(() => {
    copyBtn.classList.remove('copied');
    copyIcon.classList.remove('hidden');
    checkIcon.classList.add('hidden');
  }, 1800);
}

// ─── Toast ────────────────────────────────────────────────────────────────────

/**
 * Exibe uma mensagem toast temporária.
 * @param {string} message
 * @param {'info'|'error'} type
 */
function showToast(message, type = 'info') {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.className   = 'toast show' + (type === 'error' ? ' error' : '');

  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);
}

// ─── Senha inicial ao carregar a página ───────────────────────────────────────
generateBtn.click();
