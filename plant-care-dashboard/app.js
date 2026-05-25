const STORAGE_KEY = "plantCareDashboard.v1";
const todayISO = () => new Date().toISOString().slice(0, 10);

const state = {
  data: { plants: [], activityLog: [], completedTasks: [] },
  filters: { zone: "all", priority: "all", action: "all" },
  selectedPlantId: null,
  hideCompleted: false,
  lastNotificationKey: ""
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

document.addEventListener("DOMContentLoaded", init);

async function init() {
  registerServiceWorker();
  const saved = localStorage.getItem(STORAGE_KEY);
  state.data = saved ? JSON.parse(saved) : await fetchInitialData();
  state.data.activityLog ||= [];
  state.data.completedTasks ||= [];
  state.data.photoInbox ||= await fetchPhotoInbox();
  state.selectedPlantId = state.data.plants[0]?.id ?? null;
  bindEvents();
  fillPlantSelects();
  renderAll();
  startBasicReminders();
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch((error) => {
      console.warn("No se pudo registrar el service worker:", error);
    });
  });
}

async function fetchInitialData() {
  const response = await fetch("data/plants.json");
  if (!response.ok) throw new Error("No se pudo cargar data/plants.json");
  return response.json();
}

async function fetchPhotoInbox() {
  try {
    const response = await fetch("data/photo-inbox.json");
    if (!response.ok) return [];
    const data = await response.json();
    return data.photos || [];
  } catch {
    return [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
}

function bindEvents() {
  $$(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      $$(".tab").forEach((item) => item.classList.remove("active"));
      $$(".view").forEach((view) => view.classList.remove("active"));
      tab.classList.add("active");
      $(`#${tab.dataset.view}View`).classList.add("active");
      if (tab.dataset.view === "plants") requestAnimationFrame(renderPlantDetail);
    });
  });

  $("#zoneFilter").addEventListener("change", (event) => {
    state.filters.zone = event.target.value;
    renderDashboard();
  });
  $("#priorityFilter").addEventListener("change", (event) => {
    state.filters.priority = event.target.value;
    renderDashboard();
  });
  $("#actionFilter").addEventListener("change", (event) => {
    state.filters.action = event.target.value;
    renderDashboard();
  });

  $("#plantSelect").addEventListener("change", (event) => {
    state.selectedPlantId = Number(event.target.value);
    renderPlantDetail();
  });

  $("#activityForm").addEventListener("submit", handleActivitySubmit);
  $("#plantForm").addEventListener("submit", handlePlantSubmit);
  $("#addPlantBtn").addEventListener("click", () => $("#plantDialog").showModal());
  $("#closePlantDialogBtn").addEventListener("click", () => $("#plantDialog").close());
  $("#enableNotificationsBtn").addEventListener("click", requestNotificationPermission);
  $("#exportJsonBtn").addEventListener("click", exportJson);
  $("#importJsonInput").addEventListener("change", importJson);
  $("#exportCsvBtn").addEventListener("click", exportCsv);
  $("#clearCompletedBtn").addEventListener("click", () => {
    state.hideCompleted = !state.hideCompleted;
    $("#clearCompletedBtn").textContent = state.hideCompleted ? "Mostrar completadas" : "Ocultar completadas";
    renderTasks();
  });

  const dateInput = $('#activityForm input[name="date"]');
  dateInput.value = todayISO();
}

function fillPlantSelects() {
  const options = state.data.plants
    .map((plant) => `<option value="${plant.id}">${escapeHtml(plant.commonName)}</option>`)
    .join("");
  $('#activityForm select[name="plantId"]').innerHTML = options;
  $("#plantSelect").innerHTML = options;
  $("#plantSelect").value = state.selectedPlantId;
}

function renderAll() {
  renderDashboard();
  renderTasks();
  renderLog();
  renderPlantDetail();
  renderPhotoInbox();
}

function renderDashboard() {
  const plants = getFilteredPlants();
  renderTodayAlerts();
  $("#summaryGrid").innerHTML = renderSummary();
  $("#plantGrid").innerHTML = plants.map(renderPlantCard).join("") || `<p class="empty">No hay plantas con esos filtros.</p>`;
  $$(".open-detail").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedPlantId = Number(button.dataset.id);
      $("#plantSelect").value = state.selectedPlantId;
      $$('.tab[data-view="plants"]')[0].click();
    });
  });
}

function renderTodayAlerts() {
  const dueTasks = getDueTasks();
  const banner = $("#todayAlerts");
  if (!dueTasks.length) {
    banner.classList.remove("active");
    banner.innerHTML = "";
    return;
  }
  const visibleTasks = dueTasks.slice(0, 4);
  banner.classList.add("active");
  banner.innerHTML = `
    <strong>${dueTasks.length} cuidado${dueTasks.length === 1 ? "" : "s"} urgente${dueTasks.length === 1 ? "" : "s"} para hoy</strong>
    ${visibleTasks.map((task) => `<span>${escapeHtml(task.plant)}: ${escapeHtml(task.action)}</span>`).join("")}
    ${dueTasks.length > visibleTasks.length ? `<span class="muted">Y ${dueTasks.length - visibleTasks.length} más en el plan de acción.</span>` : ""}
  `;
}

function getFilteredPlants() {
  return state.data.plants.filter((plant) => {
    const alerts = evaluatePlant(plant);
    const actions = `${plant.urgentActions} ${plant.maintenanceActions} ${plant.nextRecommendedAction} ${alerts.map((a) => a.action).join(" ")}`.toLowerCase();
    const matchesZone = state.filters.zone === "all" || plant.zone === state.filters.zone;
    const matchesPriority = state.filters.priority === "all" || plant.humidifierPriority === state.filters.priority;
    const matchesAction = state.filters.action === "all" || actions.includes(state.filters.action.toLowerCase());
    return matchesZone && matchesPriority && matchesAction;
  });
}

function renderSummary() {
  const tasks = buildTasks();
  const count = (needle) => tasks.filter((task) => `${task.action} ${task.reason}`.toLowerCase().includes(needle)).length;
  const items = [
    ["Riego", count("riego")],
    ["Trasplante", count("trasplante")],
    ["Humidificador", count("humidificador")],
    ["Raíces", count("raíz") + count("raices")],
    ["Ubicación", count("ubicación") + count("luz indirecta")],
    ["pH", count("ph")]
  ];
  return items.map(([label, value]) => `<article class="summary-card"><strong>${value}</strong><span>${label}</span></article>`).join("");
}

function renderPlantCard(plant) {
  const alerts = evaluatePlant(plant);
  const urgency = getUrgency(alerts, plant);
  return `
    <article class="plant-card">
      <div class="plant-top">
        <div>
          <h3>${escapeHtml(plant.commonName)}</h3>
          <p class="muted">${escapeHtml(plant.probableSpecies || "Especie por definir")}</p>
        </div>
        <span class="status-dot urgency-${urgency.color}" title="${urgency.label}"></span>
      </div>
      <div class="chips">
        <span class="chip">${labelZone(plant.zone)}</span>
        <span class="chip">Humidificador: ${plant.humidifierPriority}</span>
        <span class="chip">${plant.generalState || "Sin estado"}</span>
      </div>
      <div class="metric-row">
        <div class="metric"><span>pH</span><strong>${valueOrDash(plant.currentPH)}</strong></div>
        <div class="metric"><span>Humedad</span><strong>${valueOrDash(plant.currentMoisture)}%</strong></div>
        <div class="metric"><span>Luz</span><strong>${valueOrDash(plant.currentLight)}</strong></div>
      </div>
      <div class="alert-list">
        ${alerts.slice(0, 3).map(renderAlert).join("") || `<p class="muted">Sin alertas críticas.</p>`}
      </div>
      <button class="ghost open-detail" data-id="${plant.id}">Ver evolución</button>
    </article>
  `;
}

function evaluatePlant(plant) {
  const alerts = [];
  const moisture = numberOrNull(plant.currentMoisture);
  const ph = numberOrNull(plant.currentPH);
  const light = numberOrNull(plant.currentLight);
  const tropical = plant.plantType === "tropical" || plant.plantType === "tropical_exigente";
  const demanding = plant.plantType === "tropical_exigente";
  const cactus = plant.plantType === "cactus_sansevieria";
  const text = `${plant.generalState} ${plant.diagnosis} ${plant.mainProblem} ${plant.urgentActions} ${plant.maintenanceActions}`.toLowerCase();

  if (moisture !== null && moisture < 20 && tropical) {
    alerts.push(makeAlert("high", "Riego urgente", "Humedad menor a 20% en tropical.", "riego"));
  }
  if (moisture !== null && moisture > 80 && tropical) {
    alerts.push(makeAlert("high", "Riesgo de pudrición", "Humedad mayor a 80% en tropical.", "revisión de raíces"));
  }
  if (moisture !== null && moisture > 50 && cactus) {
    alerts.push(makeAlert("high", "Exceso de agua", "Humedad mayor a 50% en cactus o sansevieria.", "suspender riego"));
  }
  if (ph !== null && ph > 8) {
    alerts.push(makeAlert("high", "Corrección prioritaria de pH", "pH mayor a 8.0.", "corrección de pH"));
  } else if (ph !== null && ph > 7.5 && tropical) {
    alerts.push(makeAlert("medium", "Alcalinidad alta", "pH mayor a 7.5 en tropical.", "corrección de pH"));
  }
  if (plant.humidifierPriority === "alta" && plant.zone !== "humidificador") {
    alerts.push(makeAlert("medium", "Mover a zona humidificador", "Prioridad alta fuera de zona húmeda.", "humidificador"));
  }
  if (light !== null && light < 500 && demanding) {
    alerts.push(makeAlert("medium", "Baja luz", "Tropical exigente con luz baja.", "cambio de ubicación"));
  }
  if (text.includes("estrés") || text.includes("estres") || text.includes("triste")) {
    alerts.push(makeAlert("medium", "Posible estrés", "El estado o diagnóstico menciona estrés.", "monitorear"));
  }
  if (text.includes("trasplante") || text.includes("compact")) {
    alerts.push(makeAlert("low", "Trasplante recomendado", "El diagnóstico sugiere sustrato compacto o trasplante.", "trasplante"));
  }
  if (text.includes("raíz") || text.includes("raices") || text.includes("radicular")) {
    alerts.push(makeAlert("high", "Revisión de raíces recomendada", "Hay señales de posible problema radicular.", "revisión de raíces"));
  }
  return dedupeAlerts(alerts);
}

function makeAlert(severity, title, reason, action) {
  return { severity, title, reason, action };
}

function dedupeAlerts(alerts) {
  const seen = new Set();
  return alerts.filter((alert) => {
    const key = `${alert.title}-${alert.action}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function renderAlert(alert) {
  const klass = alert.severity === "high" ? "high" : alert.severity === "low" ? "low" : "";
  return `<div class="alert ${klass}"><strong>${alert.title}</strong><br>${alert.reason}</div>`;
}

function getUrgency(alerts, plant) {
  if (alerts.some((alert) => alert.severity === "high")) return { color: "red", label: "Urgente" };
  if (alerts.some((alert) => alert.severity === "medium") || `${plant.generalState}`.toLowerCase().includes("estr")) {
    return { color: "yellow", label: "Atención" };
  }
  return { color: "green", label: "Estable" };
}

function buildTasks() {
  const tasks = [];
  state.data.plants.forEach((plant) => {
    evaluatePlant(plant).forEach((alert) => {
      const bucket = bucketForAlert(alert);
      tasks.push({
        id: taskId(plant.id, alert.title, alert.action),
        plantId: plant.id,
        plant: plant.commonName,
        action: alert.action,
        reason: alert.reason,
        priority: alert.severity === "high" ? "Alta" : alert.severity === "medium" ? "Media" : "Baja",
        deadline: deadlineForBucket(bucket),
        bucket
      });
    });
    if (plant.urgentActions) {
      tasks.push({
        id: taskId(plant.id, plant.urgentActions, "acción urgente"),
        plantId: plant.id,
        plant: plant.commonName,
        action: plant.urgentActions,
        reason: plant.mainProblem || plant.diagnosis || "Acción importada desde Excel.",
        priority: plant.humidifierPriority === "alta" ? "Alta" : "Media",
        deadline: deadlineForBucket("Hoy"),
        bucket: "Hoy"
      });
    }
  });
  return dedupeTasks(tasks).sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority));
}

function renderTasks() {
  const buckets = ["Hoy", "Esta semana", "Este mes", "Monitorear"];
  const tasks = buildTasks().filter((task) => !state.hideCompleted || !isTaskDone(task.id));
  $("#taskBoard").innerHTML = buckets.map((bucket) => {
    const bucketTasks = tasks.filter((task) => task.bucket === bucket);
    return `
      <section class="task-column">
        <h3>${bucket}</h3>
        <div class="task-list">
          ${bucketTasks.map(renderTask).join("") || `<p class="empty">Sin tareas.</p>`}
        </div>
      </section>
    `;
  }).join("");

  $$(".task input").forEach((checkbox) => {
    checkbox.addEventListener("change", () => toggleTask(checkbox.dataset.id, checkbox.checked));
  });
}

function getDueTasks() {
  const today = todayISO();
  return buildTasks().filter((task) => !isTaskDone(task.id) && task.deadline <= today);
}

async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    alert("Este navegador no permite notificaciones.");
    return;
  }
  const permission = await Notification.requestPermission();
  updateNotificationButton();
  if (permission === "granted") {
    notifyDueTasks(true);
  }
}

function startBasicReminders() {
  updateNotificationButton();
  renderTodayAlerts();
  notifyDueTasks(false);
  window.setInterval(() => {
    renderTodayAlerts();
    notifyDueTasks(false);
  }, 30 * 60 * 1000);
}

function updateNotificationButton() {
  const button = $("#enableNotificationsBtn");
  if (!button) return;
  if (!("Notification" in window)) {
    button.textContent = "Avisos no disponibles";
    button.disabled = true;
    return;
  }
  if (Notification.permission === "granted") {
    button.textContent = "Avisos activos";
  } else if (Notification.permission === "denied") {
    button.textContent = "Avisos bloqueados";
  } else {
    button.textContent = "Activar avisos";
  }
}

function notifyDueTasks(force) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const dueTasks = getDueTasks();
  if (!dueTasks.length) return;
  const key = `${todayISO()}-${dueTasks.map((task) => task.id).sort().join("|")}`;
  if (!force && state.lastNotificationKey === key) return;
  state.lastNotificationKey = key;
  const first = dueTasks[0];
  const body = dueTasks.length === 1
    ? `${first.plant}: ${first.action}`
    : `${first.plant}: ${first.action}. Hay ${dueTasks.length - 1} cuidado(s) más.`;
  new Notification("Cuidados de plantas para hoy", {
    body,
    icon: "icons/icon-192.png",
    badge: "icons/icon-192.png"
  });
}

function renderTask(task) {
  const done = isTaskDone(task.id);
  return `
    <article class="task ${done ? "done" : ""}">
      <div class="task-head">
        <input type="checkbox" data-id="${escapeHtml(task.id)}" ${done ? "checked" : ""} aria-label="Marcar tarea">
        <div>
          <strong>${escapeHtml(task.plant)}</strong>
          <p>${escapeHtml(task.action)}</p>
        </div>
      </div>
      <span class="chip">Prioridad ${task.priority}</span>
      <small class="muted">${escapeHtml(task.reason)} · Fecha límite: ${task.deadline}</small>
    </article>
  `;
}

function bucketForAlert(alert) {
  if (alert.severity === "high") return "Hoy";
  if (["riego", "humidificador", "cambio de ubicación", "corrección de pH"].includes(alert.action)) return "Esta semana";
  if (["trasplante", "revisión de raíces"].includes(alert.action)) return "Este mes";
  return "Monitorear";
}

function deadlineForBucket(bucket) {
  const date = new Date();
  const days = { Hoy: 0, "Esta semana": 7, "Este mes": 30, Monitorear: 45 }[bucket] ?? 7;
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function taskId(plantId, title, action) {
  return `${plantId}-${slugify(title)}-${slugify(action)}`;
}

function dedupeTasks(tasks) {
  const seen = new Set();
  return tasks.filter((task) => {
    if (seen.has(task.id)) return false;
    seen.add(task.id);
    return true;
  });
}

function priorityRank(priority) {
  return { Alta: 1, Media: 2, Baja: 3 }[priority] ?? 4;
}

function isTaskDone(id) {
  return state.data.completedTasks.includes(id);
}

function toggleTask(id, done) {
  if (done && !isTaskDone(id)) state.data.completedTasks.push(id);
  if (!done) state.data.completedTasks = state.data.completedTasks.filter((item) => item !== id);
  save();
  renderTasks();
}

async function handleActivitySubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const plant = findPlant(Number(data.get("plantId")));
  const photoFile = data.get("photo");
  const photoData = photoFile && photoFile.size ? await readFileAsDataURL(photoFile) : "";
  const entry = {
    id: window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}`,
    date: data.get("date") || todayISO(),
    plantId: plant.id,
    plantName: plant.commonName,
    activity: data.get("activity"),
    notes: data.get("notes"),
    ph: numberOrNull(data.get("ph")),
    moisture: numberOrNull(data.get("moisture")),
    light: numberOrNull(data.get("light")),
    state: data.get("state"),
    photo: photoData
  };
  state.data.activityLog.unshift(entry);
  updatePlantFromEntry(plant, entry);
  save();
  form.reset();
  $('#activityForm input[name="date"]').value = todayISO();
  fillPlantSelects();
  renderAll();
}

function updatePlantFromEntry(plant, entry) {
  if (entry.ph !== null) plant.currentPH = entry.ph;
  if (entry.moisture !== null) plant.currentMoisture = entry.moisture;
  if (entry.light !== null) plant.currentLight = entry.light;
  if (entry.state) plant.generalState = entry.state;
  plant.lastReviewDate = entry.date;
  plant.measurements ||= [];
  if (entry.ph !== null || entry.moisture !== null || entry.light !== null || entry.state) {
    plant.measurements.push({
      date: entry.date,
      ph: entry.ph ?? plant.currentPH,
      moisture: entry.moisture ?? plant.currentMoisture,
      light: entry.light ?? plant.currentLight,
      state: entry.state || plant.generalState,
      note: entry.notes || entry.activity
    });
  }
  if (entry.photo) {
    plant.photos ||= [];
    plant.photos.push({ date: entry.date, src: entry.photo, caption: entry.notes || entry.activity });
  }
}

function renderLog() {
  $("#logList").innerHTML = state.data.activityLog.map((entry) => `
    <article class="log-item">
      <strong>${escapeHtml(entry.date)} · ${escapeHtml(entry.plantName)}</strong>
      <p>${escapeHtml(entry.activity)}${entry.notes ? ` · ${escapeHtml(entry.notes)}` : ""}</p>
      <small class="muted">pH ${valueOrDash(entry.ph)} · Humedad ${valueOrDash(entry.moisture)} · Luz ${valueOrDash(entry.light)} · Estado ${escapeHtml(entry.state || "-")}</small>
    </article>
  `).join("") || `<p class="empty">Aún no hay actividades registradas.</p>`;
}

function renderPlantDetail() {
  const plant = findPlant(state.selectedPlantId) || state.data.plants[0];
  if (!plant) {
    $("#plantDetail").innerHTML = `<p class="empty">Agrega tu primera planta.</p>`;
    return;
  }
  state.selectedPlantId = plant.id;
  const alerts = evaluatePlant(plant);
  $("#plantSelect").value = plant.id;
  $("#plantDetail").innerHTML = `
    <section class="detail-grid">
      <article class="panel">
        <h2>${escapeHtml(plant.commonName)}</h2>
        <p class="muted">${escapeHtml(plant.probableSpecies || "")}</p>
        <div class="chips">
          <span class="chip">${labelZone(plant.zone)}</span>
          <span class="chip">${plant.plantType}</span>
          <span class="chip">Revisión: ${escapeHtml(plant.reviewFrequency || "-")}</span>
        </div>
        <div class="metric-row">
          <div class="metric"><span>pH</span><strong>${valueOrDash(plant.currentPH)}</strong></div>
          <div class="metric"><span>Humedad</span><strong>${valueOrDash(plant.currentMoisture)}%</strong></div>
          <div class="metric"><span>Luz</span><strong>${valueOrDash(plant.currentLight)}</strong></div>
        </div>
        <h3>Recomendaciones actuales</h3>
        <div class="recommendations">
          ${alerts.map(renderAlert).join("") || `<p class="muted">Sin alertas críticas.</p>`}
          ${plant.nextRecommendedAction ? `<div class="alert low"><strong>Siguiente acción</strong><br>${escapeHtml(plant.nextRecommendedAction)}</div>` : ""}
        </div>
      </article>
      <article class="panel">
        <h2>Historial de estado</h2>
        ${renderMeasurementHistory(plant)}
      </article>
    </section>
    <section class="chart-grid">
      <article class="panel"><h3>pH</h3><canvas id="phChart"></canvas></article>
      <article class="panel"><h3>Humedad</h3><canvas id="moistureChart"></canvas></article>
      <article class="panel"><h3>Luz</h3><canvas id="lightChart"></canvas></article>
    </section>
    <section class="panel">
      <h2>Fotos y progreso visual</h2>
      <div class="photo-grid">
        ${(plant.photos || []).map((photo) => `
          <figure class="photo-card">
            <img src="${photo.src}" alt="Foto de ${escapeHtml(plant.commonName)}">
            <p>${escapeHtml(photo.date)} · ${escapeHtml(photo.caption || "")}</p>
          </figure>
        `).join("") || `<p class="empty">Agrega fotos desde la bitácora para comparar el progreso.</p>`}
      </div>
    </section>
  `;
  drawChart($("#phChart"), plant.measurements || [], "ph", "#477a52");
  drawChart($("#moistureChart"), plant.measurements || [], "moisture", "#7aa7a0");
  drawChart($("#lightChart"), plant.measurements || [], "light", "#d6a334");
}

function renderPhotoInbox() {
  const photos = (state.data.photoInbox || []).filter((photo) => !photo.assignedPlantId);
  const count = $("#photoInboxCount");
  if (count) count.textContent = `${photos.length} pendiente${photos.length === 1 ? "" : "s"}`;
  const inbox = $("#photoInbox");
  if (!inbox) return;
  const plantOptions = state.data.plants
    .map((plant) => `<option value="${plant.id}">${escapeHtml(plant.commonName)}</option>`)
    .join("");
  inbox.innerHTML = photos.map((photo) => `
    <article class="photo-card">
      <img src="${escapeHtml(photo.src)}" loading="lazy" alt="Foto pendiente ${escapeHtml(photo.id)}">
      <div class="photo-actions">
        <label>Asignar a
          <select data-photo-select="${escapeHtml(photo.id)}">
            <option value="">Seleccionar planta</option>
            ${plantOptions}
          </select>
        </label>
        <button class="primary assign-photo" data-photo-id="${escapeHtml(photo.id)}">Guardar foto</button>
        <small class="muted">${escapeHtml(photo.originalName || photo.id)}</small>
      </div>
    </article>
  `).join("") || `<p class="empty">No hay fotos pendientes por asignar.</p>`;
  $$(".assign-photo").forEach((button) => {
    button.addEventListener("click", () => {
      const photoId = button.dataset.photoId;
      const select = $(`[data-photo-select="${photoId}"]`);
      const plantId = Number(select.value);
      if (!plantId) {
        alert("Selecciona una planta para esta foto.");
        return;
      }
      assignInboxPhoto(photoId, plantId);
    });
  });
}

function assignInboxPhoto(photoId, plantId) {
  const photo = (state.data.photoInbox || []).find((item) => item.id === photoId);
  const plant = findPlant(plantId);
  if (!photo || !plant) return;
  photo.assignedPlantId = plant.id;
  plant.photos ||= [];
  plant.photos.push({
    date: photo.date || todayISO(),
    src: photo.src,
    caption: photo.caption || "Foto importada"
  });
  state.selectedPlantId = plant.id;
  save();
  renderAll();
}

function renderMeasurementHistory(plant) {
  const measurements = [...(plant.measurements || [])].reverse();
  return measurements.map((item) => `
    <div class="log-item">
      <strong>${escapeHtml(item.date)}</strong>
      <p>${escapeHtml(item.state || "-")} · ${escapeHtml(item.note || "")}</p>
      <small class="muted">pH ${valueOrDash(item.ph)} · Humedad ${valueOrDash(item.moisture)} · Luz ${valueOrDash(item.light)}</small>
    </div>
  `).join("") || `<p class="empty">Sin mediciones todavía.</p>`;
}

function drawChart(canvas, measurements, key, color) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const ratio = window.devicePixelRatio || 1;
  const width = canvas.clientWidth * ratio;
  const height = canvas.clientHeight * ratio;
  canvas.width = width;
  canvas.height = height;
  ctx.scale(ratio, ratio);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  ctx.clearRect(0, 0, w, h);
  const values = measurements.map((m) => numberOrNull(m[key])).filter((v) => v !== null);
  ctx.strokeStyle = "#dbe4d4";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(36, 12);
  ctx.lineTo(36, h - 28);
  ctx.lineTo(w - 12, h - 28);
  ctx.stroke();
  if (!values.length) {
    ctx.fillStyle = "#667264";
    ctx.fillText("Sin datos", 48, h / 2);
    return;
  }
  const min = Math.min(...values, key === "ph" ? 5 : 0);
  const max = Math.max(...values, key === "ph" ? 9 : key === "moisture" ? 100 : 1000);
  const points = measurements
    .map((m, index) => ({ value: numberOrNull(m[key]), index }))
    .filter((p) => p.value !== null)
    .map((p, i, arr) => {
      const x = 36 + (arr.length === 1 ? 0.5 : i / (arr.length - 1)) * (w - 56);
      const y = h - 28 - ((p.value - min) / Math.max(1, max - min)) * (h - 48);
      return { x, y, value: p.value };
    });
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  points.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
  ctx.stroke();
  ctx.fillStyle = color;
  points.forEach((point) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

function handlePlantSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const nextId = Math.max(0, ...state.data.plants.map((plant) => plant.id)) + 1;
  const plant = {
    id: nextId,
    slug: slugify(data.get("commonName")),
    commonName: data.get("commonName"),
    probableSpecies: data.get("probableSpecies"),
    location: data.get("location") || "Por definir",
    zone: data.get("zone"),
    plantType: data.get("plantType"),
    humidifierPriority: data.get("humidifierPriority"),
    currentPH: numberOrNull(data.get("currentPH")),
    currentMoisture: numberOrNull(data.get("currentMoisture")),
    currentLight: numberOrNull(data.get("currentLight")),
    temperature: data.get("temperature") || "Por medir",
    generalState: data.get("generalState"),
    diagnosis: data.get("diagnosis"),
    mainProblem: data.get("diagnosis"),
    urgentActions: data.get("urgentActions"),
    maintenanceActions: data.get("maintenanceActions"),
    reviewFrequency: data.get("reviewFrequency") || "Semanal",
    lastReviewDate: todayISO(),
    nextRecommendedAction: data.get("maintenanceActions") || data.get("urgentActions"),
    notes: "",
    measurements: [{
      date: todayISO(),
      ph: numberOrNull(data.get("currentPH")),
      moisture: numberOrNull(data.get("currentMoisture")),
      light: numberOrNull(data.get("currentLight")),
      state: data.get("generalState"),
      note: "Registro inicial"
    }],
    photos: []
  };
  state.data.plants.push(plant);
  state.selectedPlantId = plant.id;
  save();
  form.reset();
  $("#plantDialog").close();
  fillPlantSelects();
  renderAll();
}

function exportJson() {
  downloadFile("plantas-dashboard-backup.json", JSON.stringify(state.data, null, 2), "application/json");
}

function importJson(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    state.data = JSON.parse(reader.result);
    state.data.activityLog ||= [];
    state.data.completedTasks ||= [];
    state.selectedPlantId = state.data.plants[0]?.id ?? null;
    save();
    fillPlantSelects();
    renderAll();
    event.target.value = "";
  };
  reader.readAsText(file);
}

function exportCsv() {
  const headers = ["fecha", "planta", "actividad", "observaciones", "ph", "humedad", "luz", "estado"];
  const rows = state.data.activityLog.map((entry) => [
    entry.date, entry.plantName, entry.activity, entry.notes, entry.ph, entry.moisture, entry.light, entry.state
  ]);
  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  downloadFile("bitacora-plantas.csv", csv, "text/csv;charset=utf-8");
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function findPlant(id) {
  return state.data.plants.find((plant) => plant.id === Number(id));
}

function numberOrNull(value) {
  if (value === "" || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function valueOrDash(value) {
  return value === null || value === undefined || value === "" ? "-" : value;
}

function labelZone(zone) {
  return { humidificador: "Zona humidificador", normal: "Zona normal", seca: "Zona seca" }[zone] || zone;
}

function slugify(value) {
  return `${value || "planta"}`
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function escapeHtml(value) {
  return `${value ?? ""}`
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function csvCell(value) {
  return `"${`${value ?? ""}`.replace(/"/g, '""')}"`;
}
