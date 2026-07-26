// --- State Management ---
const STATE_KEY = 'study_rpg_state';

let state = {
  user: {
    xp: 0,
    level: 1,
    title: GAME_CONFIG.getLevelTitle(1),
    streak: 0,
    lastLogin: new Date().toISOString().split('T')[0],
    inventory: [] // array of loot IDs
  },
  subjects: JSON.parse(JSON.stringify(GAME_CONFIG.defaultSubjects)),
  bosses: JSON.parse(JSON.stringify(GAME_CONFIG.bosses))
};

function loadState() {
  const saved = localStorage.getItem(STATE_KEY);
  if (saved) {
    try {
      state = JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load state", e);
    }
  } else {
    saveState();
  }
  loadStreakData();
  checkStreakExpired();
}

function saveState() {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

let streakData = { currentStreak: 0, lastStudyDate: null };

function loadStreakData() {
  const saved = localStorage.getItem('streakData');
  if (saved) {
    try {
      streakData = JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load streakData", e);
    }
  }
}

function saveStreakData() {
  localStorage.setItem('streakData', JSON.stringify(streakData));
}

function getYesterday() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}

function checkStreakExpired() {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = getYesterday();
  
  if (streakData.lastStudyDate !== today && streakData.lastStudyDate !== yesterday) {
    streakData.currentStreak = 0;
    saveStreakData();
  }
}

function updateStreak() {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = getYesterday();

  if (streakData.lastStudyDate === today) {
    // do nothing
  } else if (streakData.lastStudyDate === yesterday) {
    streakData.currentStreak += 1;
    streakData.lastStudyDate = today;
  } else {
    streakData.currentStreak = 1;
    streakData.lastStudyDate = today;
  }
  saveStreakData();
  renderStreakBadge();
}

function renderStreakBadge() {
  const streakCountEl = document.getElementById('streak-count');
  if (streakCountEl) {
    streakCountEl.textContent = streakData.currentStreak.toString().padStart(2, '0');
  }
}

// --- UI Rendering ---

let radarChartInstance = null;

function renderApp() {
  renderDashboard();
  renderSubjects();
  renderInventory();
  renderBosses();
  renderLogModalSelect();
  lucide.createIcons();
}

function renderDashboard() {
  // Update Streak
  renderStreakBadge();
  
  // Update Character
  document.getElementById('char-title').textContent = state.user.title;
  document.getElementById('char-level').textContent = state.user.level;
  
  const currentLevelReq = GAME_CONFIG.getLevelRequirement(state.user.level);
  const prevLevelReq = state.user.level === 1 ? 0 : GAME_CONFIG.getLevelRequirement(state.user.level - 1);
  const xpIntoLevel = state.user.xp - prevLevelReq;
  const xpNeededForNext = currentLevelReq - prevLevelReq;
  
  const xpPercent = Math.min(100, Math.max(0, (xpIntoLevel / xpNeededForNext) * 100));
  
  document.getElementById('char-xp').textContent = state.user.xp;
  document.getElementById('char-xp-req').textContent = currentLevelReq;
  document.getElementById('char-xp-bar').style.width = `${xpPercent}%`;
  
  // Update Subjects Summary
  const subjectsContainer = document.getElementById('dashboard-subjects');
  subjectsContainer.innerHTML = state.subjects.map(sub => {
    const nextLvlReq = GAME_CONFIG.getLevelRequirement(sub.level);
    const prevLvlReq = sub.level === 1 ? 0 : GAME_CONFIG.getLevelRequirement(sub.level - 1);
    const subXpPercent = Math.min(100, Math.max(0, ((sub.xp - prevLvlReq) / (nextLvlReq - prevLvlReq)) * 100));
    
    return `
      <div class="subject-item">
        <div class="subject-icon" style="background-color: ${sub.color}20; color: ${sub.color}">
          <i data-lucide="${sub.icon}"></i>
        </div>
        <div class="subject-details">
          <div class="subject-header">
            <span class="subject-name">${sub.name}</span>
            <span class="subject-level">Lv ${sub.level}</span>
          </div>
          <div class="xp-bar-container">
            <div class="xp-bar" style="width: ${subXpPercent}%; background: ${sub.color}"></div>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  renderRadarChart();
}

function renderRadarChart() {
  const ctx = document.getElementById('radar-chart').getContext('2d');
  
  const data = {
    labels: state.subjects.map(s => s.name.split(' ')),
    datasets: [{
      label: 'Level',
      data: state.subjects.map(s => s.level),
      backgroundColor: 'rgba(0, 240, 255, 0.2)',
      borderColor: 'rgba(0, 240, 255, 1)',
      pointBackgroundColor: 'rgba(255, 0, 127, 1)',
      borderWidth: 2,
    }]
  };
  
  if (radarChartInstance) {
    radarChartInstance.data = data;
    radarChartInstance.update();
  } else {
    radarChartInstance = new Chart(ctx, {
      type: 'radar',
      data: data,
      options: {
        responsive: true,
        scales: {
          r: {
            angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
            pointLabels: { color: '#94a3b8', font: { family: 'Outfit', size: 12 } },
            ticks: { display: false, min: 0 }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}

function renderSubjects() {
  const container = document.getElementById('full-subjects-list');
  container.innerHTML = state.subjects.map(sub => {
    const nextLvlReq = GAME_CONFIG.getLevelRequirement(sub.level);
    const prevLvlReq = sub.level === 1 ? 0 : GAME_CONFIG.getLevelRequirement(sub.level - 1);
    const subXpPercent = Math.min(100, Math.max(0, ((sub.xp - prevLvlReq) / (nextLvlReq - prevLvlReq)) * 100));
    
    return `
      <div class="glass-card" style="margin-bottom: 16px;">
        <div class="subject-header">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div class="subject-icon" style="background-color: ${sub.color}20; color: ${sub.color}">
              <i data-lucide="${sub.icon}"></i>
            </div>
            <span class="subject-name">${sub.name}</span>
          </div>
          <span class="subject-level" style="color: ${sub.color}">Level ${sub.level}</span>
        </div>
        <p class="xp-text" style="margin-top: 12px; margin-bottom: 4px;">XP: ${sub.xp} / ${nextLvlReq}</p>
        <div class="xp-bar-container">
          <div class="xp-bar" style="width: ${subXpPercent}%; background: ${sub.color}"></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderInventory() {
  const container = document.getElementById('inventory-grid');
  if (state.user.inventory.length === 0) {
    container.innerHTML = `<p style="color: var(--text-secondary); grid-column: 1 / -1; text-align: center;">No loot yet. Log sessions to earn rewards!</p>`;
    return;
  }
  
  container.innerHTML = state.user.inventory.map(id => {
    const item = GAME_CONFIG.lootPool.find(l => l.id === id);
    if (!item) return '';
    return `
      <div class="glass-card loot-item">
        <div style="color: var(--accent-gold); margin-bottom: 8px;">
          <i data-lucide="${item.icon}"></i>
        </div>
        <span>${item.name}</span>
      </div>
    `;
  }).join('');
}

function renderBosses() {
  const container = document.getElementById('boss-list');
  container.innerHTML = state.bosses.map(boss => {
    // Calculate total XP for this boss based on all subjects for MVP
    const totalXp = state.user.xp;
    const hpPercent = Math.min(100, (totalXp / boss.requiredXp) * 100);
    
    return `
      <div class="glass-card boss-card">
        <div class="boss-header">
          <span class="boss-name">${boss.name}</span>
          <span class="boss-date">${boss.date}</span>
        </div>
        <div class="xp-bar-container boss-hp-bar">
          <div class="xp-bar boss-hp-fill" style="width: ${hpPercent}%"></div>
        </div>
        <p class="xp-text" style="text-align: right; margin-top: 4px;">Prep: ${Math.floor(hpPercent)}%</p>
      </div>
    `;
  }).join('');
}

function renderLogModalSelect() {
  const select = document.getElementById('subject-select');
  select.innerHTML = state.subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
}

// --- Interactions ---

// Navigation
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', (e) => {
    // Tab switching
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    const targetBtn = e.currentTarget;
    targetBtn.classList.add('active');
    
    const targetViewId = targetBtn.getAttribute('data-target');
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(targetViewId).classList.add('active');
  });
});

// Modal Logic
const modal = document.getElementById('log-modal');
document.getElementById('fab-log-session').addEventListener('click', () => {
  modal.classList.add('show');
});
document.getElementById('close-log-modal').addEventListener('click', () => {
  modal.classList.remove('show');
});

// Star Rating
document.querySelectorAll('.star-rating i').forEach(star => {
  star.addEventListener('click', (e) => {
    const rating = parseInt(e.currentTarget.getAttribute('data-rating'));
    document.getElementById('focus-input').value = rating;
    document.querySelectorAll('.star-rating i').forEach(s => {
      if (parseInt(s.getAttribute('data-rating')) <= rating) {
        s.classList.add('active');
      } else {
        s.classList.remove('active');
      }
    });
  });
});

// Session Submission
document.getElementById('log-session-form').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const subjectId = parseInt(document.getElementById('subject-select').value);
  const duration = parseInt(document.getElementById('duration-input').value);
  const focus = parseInt(document.getElementById('focus-input').value) || 3;
  
  processSession(subjectId, duration, focus);
  
  modal.classList.remove('show');
  document.getElementById('log-session-form').reset();
  document.querySelectorAll('.star-rating i').forEach(s => s.classList.remove('active'));
});

function processSession(subjectId, duration, focus) {
  updateStreak();
  let earnedXp = GAME_CONFIG.calculateXP(duration);
  // Add streak bonus (e.g. 1 XP per streak day up to 10)
  earnedXp += Math.min(streakData.currentStreak, 10);
  
  // Update Subject
  const subject = state.subjects.find(s => s.id === subjectId);
  subject.xp += earnedXp;
  
  let subjectLeveledUp = false;
  while (subject.xp >= GAME_CONFIG.getLevelRequirement(subject.level)) {
    subject.level++;
    subjectLeveledUp = true;
  }
  
  // Update User
  state.user.xp += earnedXp;
  let userLeveledUp = false;
  while (state.user.xp >= GAME_CONFIG.getLevelRequirement(state.user.level)) {
    state.user.level++;
    state.user.title = GAME_CONFIG.getLevelTitle(state.user.level);
    userLeveledUp = true;
  }
  
  saveState();
  renderApp();
  
  // Roll for loot (20% chance + focus modifier)
  const lootChance = 0.2 + (focus * 0.05); 
  if (Math.random() < lootChance) {
    dropLoot();
  } else if (userLeveledUp || subjectLeveledUp) {
    // Notify level up if no loot drop overlays it
    // For MVP, just updating the UI is smooth, but we could add a toast here.
  }
}

function dropLoot() {
  const loot = GAME_CONFIG.lootPool[Math.floor(Math.random() * GAME_CONFIG.lootPool.length)];
  
  // Add to inventory if not already there
  if (!state.user.inventory.includes(loot.id)) {
    state.user.inventory.push(loot.id);
    saveState();
    renderInventory();
  }
  
  // Show Drop UI
  document.getElementById('loot-drop-icon').setAttribute('data-lucide', loot.icon);
  document.getElementById('loot-drop-name').textContent = loot.name;
  document.getElementById('loot-drop-desc').textContent = loot.desc || loot.quote;
  
  const overlay = document.getElementById('loot-drop-overlay');
  overlay.classList.add('show');
  lucide.createIcons();
}

document.getElementById('collect-loot-btn').addEventListener('click', () => {
  document.getElementById('loot-drop-overlay').classList.remove('show');
});

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  renderApp();
});
