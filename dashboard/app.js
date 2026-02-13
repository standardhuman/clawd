// ===== Dashboard App =====

let chartInstance = null;
let dashboardData = null;

(async function () {
  const res = await fetch('data.json');
  dashboardData = await res.json();
  
  renderHeader(dashboardData);
  renderAttention(dashboardData.needsAttention);
  renderSprint(dashboardData.sprintProgress);
  renderProjects(dashboardData.projects);
  renderTodos(dashboardData.todos);
  renderBottomSection(dashboardData);
  renderAgents(dashboardData.agents);
  startClock();
  animateProgressBars();
})();

// ===== Utility: Toggle Expandable =====
function toggleExpand(el) {
  const isExpanded = el.classList.contains('expanded');
  if (isExpanded) {
    el.style.maxHeight = el.scrollHeight + 'px';
    // Force reflow
    el.offsetHeight;
    el.style.maxHeight = '0';
    el.classList.remove('expanded');
  } else {
    el.style.maxHeight = el.scrollHeight + 'px';
    el.classList.add('expanded');
    // After transition, allow content to resize naturally
    el.addEventListener('transitionend', function handler() {
      if (el.classList.contains('expanded')) {
        el.style.maxHeight = 'none';
      }
      el.removeEventListener('transitionend', handler);
    });
  }
}

// ===== Header =====
function renderHeader(data) {
  const updated = new Date(data.lastUpdated);
  const opts = { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' };
  document.getElementById('last-updated').textContent = `Updated ${updated.toLocaleDateString('en-US', opts)}`;
}

function startClock() {
  const el = document.getElementById('live-time');
  function tick() {
    const now = new Date();
    const opts = { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit' };
    el.textContent = now.toLocaleDateString('en-US', opts);
  }
  tick();
  setInterval(tick, 1000);
}

// ===== Needs Attention (Expandable) =====
function renderAttention(items) {
  const container = document.getElementById('attention-grid');
  container.innerHTML = items.map((item, i) => `
    <div class="attention-card ${item.urgency} clickable" onclick="toggleAttentionCard(this)">
      <div class="attention-card-header">
        <div class="icon">${item.icon}</div>
        <span class="expand-chevron">▸</span>
      </div>
      <div class="title">${item.title}</div>
      <div class="status">${item.status}</div>
      <div class="detail">${item.detail}</div>
      ${item.details ? `<div class="expand-content" id="attention-detail-${i}">
        <div class="expand-inner">${item.details}</div>
      </div>` : ''}
    </div>
  `).join('');
}

function toggleAttentionCard(card) {
  const content = card.querySelector('.expand-content');
  if (!content) return;
  const chevron = card.querySelector('.expand-chevron');
  
  card.classList.toggle('expanded');
  toggleExpand(content);
  chevron.textContent = card.classList.contains('expanded') ? '▾' : '▸';
}

// ===== Sprint Progress (with Issues Drill-Down) =====
function renderSprint(sprint) {
  const container = document.getElementById('sprint-section');
  
  const daysRemaining = Math.max(0, Math.ceil((new Date(sprint.launchDate) - new Date()) / 86400000));
  
  const weekBars = sprint.weeks.map(w => `
    <div class="progress-row">
      <span class="progress-label">${w.label}</span>
      <div class="progress-bar">
        <div class="progress-fill ${w.progress === 100 ? 'complete' : ''}" data-width="${w.progress}"></div>
      </div>
      <span class="progress-value">${w.progress}%</span>
    </div>
  `).join('');

  const issueRows = (sprint.issues || []).map(issue => {
    const statusClass = issue.status === 'in-progress' ? 'issue-in-progress' : 'issue-open';
    const statusLabel = issue.status === 'in-progress' ? 'In Progress' : 'Open';
    return `
      <div class="issue-row">
        <span class="issue-dot ${statusClass}"></span>
        <span class="issue-title">${issue.title}</span>
        <span class="issue-status-label ${statusClass}">${statusLabel}</span>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="sprint-bars">
      ${weekBars}
      <div class="progress-row" style="margin-top: 8px;">
        <span class="progress-label" style="font-weight: 600;">Overall</span>
        <div class="progress-bar" style="height: 14px;">
          <div class="progress-fill overall" data-width="${sprint.overallProgress}"></div>
        </div>
        <span class="progress-value" style="font-weight: 600;">${sprint.overallProgress}%</span>
      </div>
    </div>
    <div class="sprint-stats">
      <div class="stat-card">
        <div class="stat-value ${daysRemaining < 20 ? 'warning' : ''}">${daysRemaining}</div>
        <div class="stat-label">Days to Launch</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${sprint.overallProgress}%</div>
        <div class="stat-label">Complete</div>
      </div>
      <div class="stat-card clickable" onclick="toggleSprintIssues()">
        <div class="stat-value warning">${sprint.openIssues}</div>
        <div class="stat-label">Open Issues <span class="expand-chevron" id="issues-chevron">▸</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-value good">14</div>
        <div class="stat-label">${sprint.currentBuild}</div>
      </div>
    </div>
    ${issueRows ? `<div class="expand-content sprint-issues-panel" id="sprint-issues-panel" style="grid-column: 1 / -1;">
      <div class="expand-inner">
        <div class="issues-header">Open Issues</div>
        ${issueRows}
      </div>
    </div>` : ''}
  `;
}

function toggleSprintIssues() {
  const panel = document.getElementById('sprint-issues-panel');
  const chevron = document.getElementById('issues-chevron');
  if (!panel) return;
  
  const isExpanded = panel.classList.contains('expanded');
  toggleExpand(panel);
  chevron.textContent = isExpanded ? '▸' : '▾';
}

// ===== Project Cards (Expandable) =====
function renderProjects(projects) {
  const container = document.getElementById('project-grid');
  container.innerHTML = projects.map((p, i) => {
    const statusClass = p.status.replace(/\s+/g, '-');
    const hasDetails = p.checklist || p.recentActivity || p.docs;
    
    let detailContent = '';
    if (hasDetails) {
      let sections = '';
      
      if (p.checklist && p.checklist.length) {
        sections += `<div class="detail-section">
          <div class="detail-section-title">Checklist</div>
          ${p.checklist.map(c => `
            <div class="detail-checklist-item ${c.done ? 'done' : ''}">
              <span class="check-icon">${c.done ? '✅' : '⬜'}</span>
              <span>${c.text}</span>
            </div>
          `).join('')}
        </div>`;
      }
      
      if (p.recentActivity && p.recentActivity.length) {
        sections += `<div class="detail-section">
          <div class="detail-section-title">Recent Activity</div>
          ${p.recentActivity.map(a => `<div class="detail-activity-item">• ${a}</div>`).join('')}
        </div>`;
      }
      
      if (p.docs && p.docs.length) {
        sections += `<div class="detail-section">
          <div class="detail-section-title">Docs & Links</div>
          <div class="detail-docs">
            ${p.docs.map(d => `<a href="${d.url}" class="detail-doc-link" target="_blank">${d.label}</a>`).join('')}
          </div>
        </div>`;
      }
      
      detailContent = `<div class="expand-content" id="project-detail-${i}">
        <div class="expand-inner project-detail-inner">${sections}</div>
      </div>`;
    }
    
    return `
      <div class="project-card ${hasDetails ? 'clickable' : ''}" ${hasDetails ? `onclick="toggleProjectCard(this)"` : ''}>
        <div class="project-header">
          <span class="project-icon">${p.icon}</span>
          <span class="project-name">${p.name}</span>
          ${hasDetails ? '<span class="expand-chevron project-chevron">▸</span>' : ''}
        </div>
        <span class="status-badge ${statusClass}">${p.status}</span>
        <div class="project-progress">
          <div class="project-progress-fill" data-width="${p.progress}"></div>
        </div>
        <div class="project-metric">${p.metric}</div>
        <div class="project-next">→ ${p.nextAction}</div>
        ${detailContent}
      </div>
    `;
  }).join('');
}

function toggleProjectCard(card) {
  const content = card.querySelector('.expand-content');
  if (!content) return;
  const chevron = card.querySelector('.project-chevron');
  
  card.classList.toggle('expanded');
  toggleExpand(content);
  if (chevron) chevron.textContent = card.classList.contains('expanded') ? '▾' : '▸';
}

// ===== To-Do Section =====
function renderTodos(todos) {
  const container = document.getElementById('todo-section');
  if (!todos) return;
  
  const savedState = JSON.parse(localStorage.getItem('dashboard-todos') || '{}');
  
  const categories = Object.keys(todos);
  container.innerHTML = categories.map(cat => {
    const items = todos[cat];
    const catId = cat.replace(/\s+/g, '-').toLowerCase();
    const categoryEmoji = cat === 'Business' ? '💼' : cat === 'Personal' ? '🏠' : '🍺';
    
    return `
      <div class="todo-category" id="todo-cat-${catId}">
        <div class="todo-category-header clickable" onclick="toggleTodoCategory('${catId}')">
          <span class="expand-chevron todo-cat-chevron" id="todo-chevron-${catId}">▾</span>
          <span>${categoryEmoji} ${cat}</span>
          <span class="todo-count">${items.length}</span>
        </div>
        <div class="todo-items expanded" id="todo-items-${catId}" style="max-height: none;">
          ${items.map((item, j) => {
            const todoKey = `${cat}-${j}`;
            const isChecked = savedState[todoKey] || item.done;
            return `
              <label class="todo-item ${isChecked ? 'checked' : ''}">
                <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleTodo('${cat}', ${j}, this)">
                <span class="todo-checkbox">${isChecked ? '☑' : '☐'}</span>
                <span class="todo-text">${item.link ? `<a href="${item.link}" target="_blank" onclick="event.stopPropagation()">${item.text}</a>` : item.text}</span>
              </label>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function toggleTodoCategory(catId) {
  const items = document.getElementById(`todo-items-${catId}`);
  const chevron = document.getElementById(`todo-chevron-${catId}`);
  if (!items) return;
  
  const isExpanded = items.classList.contains('expanded');
  toggleExpand(items);
  chevron.textContent = isExpanded ? '▸' : '▾';
}

function toggleTodo(category, index, checkbox) {
  const savedState = JSON.parse(localStorage.getItem('dashboard-todos') || '{}');
  const todoKey = `${category}-${index}`;
  savedState[todoKey] = checkbox.checked;
  localStorage.setItem('dashboard-todos', JSON.stringify(savedState));
  
  const label = checkbox.closest('.todo-item');
  const checkboxSpan = label.querySelector('.todo-checkbox');
  if (checkbox.checked) {
    label.classList.add('checked');
    checkboxSpan.textContent = '☑';
  } else {
    label.classList.remove('checked');
    checkboxSpan.textContent = '☐';
  }
}

// ===== Bottom Section (Chart, Activity, Deadlines) =====
function renderBottomSection(data) {
  renderActivity(data.recentActivity);
  renderDeadlines(data.deadlines);
  renderChart(data.timeAllocation);
}

// ===== Activity Timeline (Expandable) =====
function renderActivity(items) {
  const container = document.getElementById('activity-list');
  const fmtOpts = { month: 'short', day: 'numeric' };
  container.innerHTML = items.map((item, i) => {
    const d = new Date(item.date + 'T12:00:00');
    const hasDetails = item.details;
    return `
      <div class="activity-item ${hasDetails ? 'clickable' : ''}" ${hasDetails ? `onclick="toggleActivityItem(this)"` : ''}>
        <div class="activity-main">
          <span class="activity-text">${item.text}</span>
          <span class="activity-date">${d.toLocaleDateString('en-US', fmtOpts)}</span>
          ${hasDetails ? '<span class="expand-chevron activity-chevron">▸</span>' : ''}
        </div>
        ${hasDetails ? `<div class="expand-content" id="activity-detail-${i}">
          <div class="expand-inner activity-detail-text">${item.details}</div>
        </div>` : ''}
      </div>
    `;
  }).join('');
}

function toggleActivityItem(item) {
  const content = item.querySelector('.expand-content');
  if (!content) return;
  const chevron = item.querySelector('.activity-chevron');
  
  item.classList.toggle('expanded');
  toggleExpand(content);
  if (chevron) chevron.textContent = item.classList.contains('expanded') ? '▾' : '▸';
}

function renderDeadlines(items) {
  const container = document.getElementById('deadlines-list');
  const now = new Date();
  container.innerHTML = items.map(item => {
    const d = new Date(item.date + 'T12:00:00');
    const diff = Math.ceil((d - now) / 86400000);
    let badge = '';
    if (diff < 0) badge = `<span class="deadline-badge" style="color:var(--accent-red)">Overdue</span>`;
    else if (diff <= 1) badge = `<span class="deadline-badge" style="color:var(--accent-peach)">Today</span>`;
    else badge = `<span class="deadline-badge">${diff}d</span>`;
    
    const fmtOpts = { month: 'short', day: 'numeric' };
    return `
      <div class="deadline-item">
        <span class="deadline-icon">${item.icon}</span>
        <div class="deadline-content">
          <div class="deadline-text">${item.text}</div>
          <div class="deadline-date">${d.toLocaleDateString('en-US', fmtOpts)}</div>
        </div>
        ${badge}
      </div>
    `;
  }).join('');
}

// ===== Time Allocation Chart (with Drill-Down) =====
function renderChart(allocation) {
  const ctx = document.getElementById('time-chart').getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: allocation.map(a => a.label),
      datasets: [{
        data: allocation.map(a => a.value),
        backgroundColor: allocation.map(a => a.color),
        borderColor: '#1e1e2e',
        borderWidth: 3,
        hoverBorderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '62%',
      onClick: (evt, elements) => {
        if (elements.length > 0) {
          const idx = elements[0].index;
          showTimeDetail(allocation[idx]);
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          onClick: (evt, legendItem, legend) => {
            const idx = legendItem.index;
            showTimeDetail(allocation[idx]);
          },
          labels: {
            color: '#a6adc8',
            font: { size: 11 },
            padding: 12,
            usePointStyle: true,
            pointStyleWidth: 8
          }
        },
        tooltip: {
          backgroundColor: '#313244',
          titleColor: '#cdd6f4',
          bodyColor: '#a6adc8',
          borderColor: '#45475a',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: function(ctx) {
              return ` ${ctx.label}: ${ctx.parsed}%`;
            }
          }
        }
      }
    }
  });
}

function showTimeDetail(item) {
  const panel = document.getElementById('time-detail-panel');
  if (!panel) return;
  
  // If same item is clicked and panel is visible, hide it
  if (panel.classList.contains('expanded') && panel.dataset.label === item.label) {
    panel.style.maxHeight = panel.scrollHeight + 'px';
    panel.offsetHeight;
    panel.style.maxHeight = '0';
    panel.classList.remove('expanded');
    return;
  }
  
  panel.dataset.label = item.label;
  panel.innerHTML = `
    <div class="time-detail-inner">
      <div class="time-detail-header">
        <span class="time-detail-dot" style="background: ${item.color}"></span>
        <strong>${item.label}</strong>
        <span class="time-detail-pct">${item.value}%</span>
      </div>
      <div class="time-detail-body">${item.details || 'No additional details.'}</div>
    </div>
  `;
  
  // Reset and expand
  panel.style.maxHeight = '0';
  panel.classList.remove('expanded');
  panel.offsetHeight;
  panel.style.maxHeight = panel.scrollHeight + 'px';
  panel.classList.add('expanded');
  panel.addEventListener('transitionend', function handler() {
    if (panel.classList.contains('expanded')) {
      panel.style.maxHeight = 'none';
    }
    panel.removeEventListener('transitionend', handler);
  });
}

// ===== Agents =====
function renderAgents(agents) {
  const container = document.getElementById('agents-bar');
  container.innerHTML = agents.map(a => `
    <div class="agent">
      <span class="agent-emoji">${a.emoji}</span>
      <span class="agent-name">${a.name}</span>
      <span class="agent-status ${a.status.toLowerCase()}">${a.status}</span>
      <span style="color: var(--text-muted); font-size: 0.72rem;">${a.role}</span>
    </div>
  `).join('');
}

// ===== Animate Progress Bars =====
function animateProgressBars() {
  requestAnimationFrame(() => {
    setTimeout(() => {
      document.querySelectorAll('[data-width]').forEach(el => {
        el.style.width = el.dataset.width + '%';
      });
    }, 100);
  });
}
