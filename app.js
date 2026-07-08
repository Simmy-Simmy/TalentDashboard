const talentData = window.TALENT_DATA || {};

const STORAGE_KEY = "adaptovate-talent-dashboard-internal-v5";
const DATA_KEY = `${STORAGE_KEY}:data`;
const CHAT_KEY = `${STORAGE_KEY}:chat`;

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readDataState() {
  try {
    return JSON.parse(localStorage.getItem(DATA_KEY) || "null");
  } catch {
    return null;
  }
}

function writeDataState(nextData) {
  localStorage.setItem(DATA_KEY, JSON.stringify(nextData));
}

function mergeByKey(localItems, sourceItems, key) {
  const localList = Array.isArray(localItems) ? localItems : [];
  const sourceList = Array.isArray(sourceItems) ? sourceItems : [];
  const localMap = new Map(localList.map((item) => [item?.[key], item]).filter(([value]) => value !== undefined && value !== null && value !== ""));
  const merged = sourceList.map((sourceItem) => {
    const localItem = localMap.get(sourceItem?.[key]);
    return localItem ? { ...sourceItem, ...localItem } : sourceItem;
  });
  localList.forEach((localItem) => {
    const localKey = localItem?.[key];
    if (localKey === undefined || localKey === null || localKey === "") return;
    if (!sourceList.find((sourceItem) => sourceItem?.[key] === localKey)) {
      merged.push(localItem);
    }
  });
  return merged;
}

function mergeSourceData(localData, sourceData) {
  const source = deepClone(sourceData || {});
  const local = localData ? deepClone(localData) : null;
  if (!local) return source;

  const merged = {
    ...source,
    ...local,
    summary: {
      ...(source.summary || {}),
      ...(local.summary || {}),
    },
    funnel: {
      ...(source.funnel || {}),
      ...(local.funnel || {}),
      global: {
        ...((source.funnel || {}).global || {}),
        ...((local.funnel || {}).global || {}),
      },
      offices: {
        ...((source.funnel || {}).offices || {}),
        ...((local.funnel || {}).offices || {}),
      },
    },
  };

  merged.summary.officeSummary = mergeByKey((local.summary || {}).officeSummary, (source.summary || {}).officeSummary, "office");
  merged.summary.roleSummary = mergeByKey((local.summary || {}).roleSummary, (source.summary || {}).roleSummary, "id");
  merged.summary.bottlenecks = Array.isArray((local.summary || {}).bottlenecks) && (local.summary || {}).bottlenecks.length
    ? (local.summary || {}).bottlenecks
    : (source.summary || {}).bottlenecks || [];
  merged.summary.leadershipSummary = Array.isArray((local.summary || {}).leadershipSummary) && (local.summary || {}).leadershipSummary.length
    ? (local.summary || {}).leadershipSummary
    : (source.summary || {}).leadershipSummary || [];
  merged.summary.leadershipInsights = Array.isArray((local.summary || {}).leadershipInsights) && (local.summary || {}).leadershipInsights.length
    ? (local.summary || {}).leadershipInsights
    : (source.summary || {}).leadershipInsights || [];
  merged.summary.leadershipDecisions = Array.isArray((local.summary || {}).leadershipDecisions) && (local.summary || {}).leadershipDecisions.length
    ? (local.summary || {}).leadershipDecisions
    : (source.summary || {}).leadershipDecisions || [];
  merged.summary.stageHealth = {
    ...((source.summary || {}).stageHealth || {}),
    ...((local.summary || {}).stageHealth || {}),
  };

  merged.candidates = mergeByKey(local.candidates, source.candidates, "id");
  merged.candidateDetails = mergeByKey(local.candidateDetails, source.candidateDetails, "id");

  const nextLookup = {};
  (merged.candidateDetails || []).forEach((detail) => {
    const name = clean(detail?.candidate_name);
    if (name) nextLookup[name] = detail;
  });
  merged.candidateLookup = nextLookup;

  return merged;
}

let dataState = mergeSourceData(readDataState(), talentData);
let summary = dataState.summary || {};
let meta = dataState.meta || {};
let candidates = dataState.candidates || [];
let candidateDetails = dataState.candidateDetails || [];
let candidateLookup = dataState.candidateLookup || {};
let roles = summary.roleSummary || [];
let offices = summary.officeSummary || [];
let stageHealth = summary.stageHealth || {};
let bottlenecks = summary.bottlenecks || [];
let funnel = dataState.funnel || {};
let selectionDefaults = dataState.selectionDefaults || {};

function refreshDataRefs() {
  summary = dataState.summary || {};
  meta = dataState.meta || {};
  candidates = dataState.candidates || [];
  candidateDetails = dataState.candidateDetails || [];
  candidateLookup = dataState.candidateLookup || {};
  roles = summary.roleSummary || [];
  offices = summary.officeSummary || [];
  stageHealth = summary.stageHealth || {};
  bottlenecks = summary.bottlenecks || [];
  funnel = dataState.funnel || {};
  selectionDefaults = dataState.selectionDefaults || {};
}

const tabs = Array.from(document.querySelectorAll(".tab"));
const panels = Array.from(document.querySelectorAll(".panel"));
const officeButtons = Array.from(document.querySelectorAll("[data-office]"));
const statusEl = document.querySelector("[data-status]");

const els = {
  leadershipSummary: document.getElementById("leadership-summary"),
  leadershipDecisions: document.getElementById("leadership-decisions"),
  mainInsights: document.getElementById("main-insights"),
  kpiGrid: document.getElementById("kpi-grid"),
  officeViewBody: document.getElementById("office-view-body"),
  officeViewPill: document.getElementById("office-view-pill"),
  talentOfficePill: document.getElementById("talent-office-pill"),
  roleViewBody: document.getElementById("role-view-body"),
  pipelineBody: document.getElementById("pipeline-body"),
  stageHealthBody: document.getElementById("stage-health-body"),
  riskBody: document.getElementById("risk-body"),
  roleOverviewBody: document.getElementById("role-overview-body"),
  roleSnapshot: document.getElementById("role-snapshot"),
  roleFunnel: document.getElementById("role-funnel"),
  rolePipelineBody: document.getElementById("role-pipeline-body"),
  selectedRolePill: document.getElementById("selected-role-pill"),
  roleOfficePill: document.getElementById("role-office-pill"),
  selectedCandidatePill: document.getElementById("selected-candidate-pill"),
  funnelPill: document.getElementById("funnel-pill"),
  candidateProfile: document.getElementById("candidate-profile"),
  candidateSummary: document.getElementById("candidate-summary"),
  candidateScorecard: document.getElementById("candidate-scorecard"),
  decisionNote: document.getElementById("decision-note"),
  chatHistory: document.getElementById("chat-history"),
  chatInput: document.getElementById("chat-input"),
};

const stageOrder = [
  "Lead",
  "Applicant",
  "Interview",
  "HR Interview",
  "1st Interview - Take Home Case",
  "1st Interview - Non Take Home Case/Consulting Track",
  "2nd Interview - Case Interview",
  "2nd Interview - Take Home Case",
  "Meet and Greet (Optional)",
  "3rd Round Interview",
  "Reference Check",
  "Background Check",
  "Offer",
  "Hired",
];
const metricFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const officeAliases = {
  UK: "London",
};
const requiredLondonCandidates = [];

const editableDefaults = {
  totalCandidates: summary.kpis?.totalCandidates ?? candidates.length,
  activeCandidates: summary.kpis?.activeCandidates ?? 35,
  openRoles: summary.kpis?.openRoles ?? roles.length,
  averageScore: summary.kpis?.averageScore ?? "",
  highRisk: summary.kpis?.highRisk ?? 0,
  needReview: summary.kpis?.needReview ?? 0,
  leadSummaryOpen: summary.leadershipSummary?.[0] ?? "",
  leadSummaryStuck: summary.leadershipSummary?.[1] ?? "",
  leadSummaryDecision: summary.leadershipSummary?.[2] ?? "",
  insight1: summary.leadershipInsights?.[0] ?? "",
  insight2: summary.leadershipInsights?.[1] ?? "",
  insight3: summary.leadershipInsights?.[2] ?? "",
  insight4: summary.leadershipInsights?.[3] ?? "",
};

function rolePriorityDefault(role) {
  if (role?.priority) return clean(role.priority);
  if (role?.status === "Decision Needed") return "High";
  if (role?.status === "Need Attention") return "Mid";
  return "Low";
}

function roleOverrideDefaults(role) {
  return {
    office: clean(role.office),
    priority: rolePriorityDefault(role),
    pipeline_count: role.pipeline_count ?? "",
    average_score: role.average_score ?? "",
    current_stage: clean(role.current_stage),
    status: clean(role.status),
  };
}

let roleOverrideDefaultsMap = Object.fromEntries(roles.map((role) => [role.id, roleOverrideDefaults(role)]));

function rebuildRoleOverrideDefaultsMap() {
  roleOverrideDefaultsMap = Object.fromEntries(roles.map((role) => [role.id, roleOverrideDefaults(role)]));
}

const defaultState = {
  office: selectionDefaults.office || "Global",
  roleId: selectionDefaults.roleId || roles[0]?.id || "",
  candidateId: selectionDefaults.candidateId || candidates[0]?.id || "",
  tab: "talent-panel",
  roleOverrides: roleOverrideDefaultsMap,
  ...editableDefaults,
};

function clean(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

function canonicalOffice(value) {
  const text = clean(value);
  return officeAliases[text] || text;
}

function officeMatches(left, right) {
  return canonicalOffice(left) === canonicalOffice(right);
}

function notCaptured(value) {
  const text = clean(value);
  return text ? text : "Not captured in ATS.";
}

function blankIfMissing(value) {
  return clean(value);
}

function roleBlank(value) {
  const text = clean(value);
  return text && text !== "Not captured in ATS." ? text : "";
}

function roleRecord(role) {
  if (!role) return null;
  const override = state.roleOverrides?.[role.id] || {};
  return {
    ...role,
    office: override.office ?? role.office,
    priority: override.priority ?? rolePriorityDefault(role),
    pipeline_count: override.pipeline_count === "" || override.pipeline_count === null || override.pipeline_count === undefined
      ? role.pipeline_count
      : Number(override.pipeline_count),
    average_score: override.average_score === "" || override.average_score === null || override.average_score === undefined
      ? role.average_score
      : Number(override.average_score),
    current_stage: override.current_stage ?? role.current_stage,
    status: override.status ?? role.status,
  };
}

function candidateById(id) {
  return candidates.find((item) => item.id === id) || null;
}

function candidateDetailById(id) {
  return candidateDetails.find((item) => item.id === id) || null;
}

function refreshCandidateLookup() {
  const nextLookup = {};
  candidateDetails.forEach((detail) => {
    if (detail?.candidate_name) nextLookup[detail.candidate_name] = detail;
  });
  dataState.candidateLookup = nextLookup;
  candidateLookup = nextLookup;
}

function numericOrText(value) {
  const raw = clean(value);
  if (raw === "") return "";
  const num = Number(raw);
  return Number.isFinite(num) ? num : raw;
}

function syncDashboardCounts() {
  const kpis = dataState.summary?.kpis || {};
  const activeCount = candidates.filter((candidate) => clean(candidate.status || "Active") !== "Deleted").length;
  kpis.totalCandidates = candidates.length;
  kpis.activeCandidates = activeCount;
  kpis.openRoles = roles.length;
  dataState.summary.kpis = kpis;
  state.totalCandidates = kpis.totalCandidates;
  state.activeCandidates = kpis.activeCandidates;
  state.openRoles = kpis.openRoles;
}

function syncSummaryViewsFromCandidates() {
  roles.forEach((role) => {
    const matched = candidates.filter((candidate) => candidate.role === role.role);
    role.pipeline_count = matched.length;
    role.candidate_names = matched.map((candidate) => candidate.candidate_name);
    if (!role.candidate_names.includes(role.selected_candidate)) {
      role.selected_candidate = role.candidate_names[0] || "";
    }
  });

  offices.forEach((office) => {
    const matched = candidates.filter((candidate) => officeMatches(candidate.office_location, office.office));
    office.count = matched.length;
    office.active = matched.length;
  });

  stageOrder.forEach((stage) => {
    const count = candidates.filter((candidate) => clean(candidate.stage) === stage).length;
    stageHealth[stage] = count;
    if (!funnel.global) funnel.global = {};
    funnel.global[stage] = count;
  });

  const officeNames = [...new Set(candidates.map((candidate) => candidate.office_location).filter(Boolean))];
  if (!funnel.offices) funnel.offices = {};
  officeNames.forEach((officeName) => {
    const officeCounts = {};
    stageOrder.forEach((stage) => {
      officeCounts[stage] = candidates.filter((candidate) => candidate.office_location === officeName && clean(candidate.stage) === stage).length;
    });
    funnel.offices[officeName] = officeCounts;
  });
}

function ensureRequiredLondonData() {
  const sourceCandidates = Array.isArray(talentData.candidates) ? talentData.candidates : [];
  const sourceDetails = Array.isArray(talentData.candidateDetails) ? talentData.candidateDetails : [];
  let changed = false;

  requiredLondonCandidates.forEach((candidateName) => {
    const hasCandidate = candidates.some((candidate) => clean(candidate.candidate_name) === candidateName);
    if (!hasCandidate) {
      const sourceCandidate = sourceCandidates.find((candidate) => clean(candidate.candidate_name) === candidateName);
      if (sourceCandidate) {
        dataState.candidates = [...candidates, deepClone(sourceCandidate)];
        candidates = dataState.candidates;
        changed = true;
      }
    }

    const hasDetail = candidateDetails.some((detail) => clean(detail.candidate_name) === candidateName);
    if (!hasDetail) {
      const sourceDetail = sourceDetails.find((detail) => clean(detail.candidate_name) === candidateName);
      if (sourceDetail) {
        dataState.candidateDetails = [...candidateDetails, deepClone(sourceDetail)];
        candidateDetails = dataState.candidateDetails;
        changed = true;
      }
    }
  });

  if (!changed) return;
  refreshCandidateLookup();
  syncSummaryViewsFromCandidates();
}

function updateCandidateDerivedFields(candidate) {
  const detail = candidateDetailById(candidate.id);
  if (!detail) return;
  detail.candidate_name = candidate.candidate_name;
  detail.role = candidate.role;
  detail.role_assessed_for = candidate.role;
  detail.office_location = candidate.office_location;
  detail.location = candidate.office_location;
  detail.current_stage = candidate.stage;
  detail.overall_rating = candidate.interview_score;
  detail.next_step = candidate.next_step;
  detail.risk_level = candidate.risk_level;
  detail.last_updated = candidate.last_updated;
}

function updateRoleLabel(roleId, nextRoleLabel) {
  const role = roles.find((item) => item.id === roleId);
  if (!role) return;
  const prev = role.role;
  role.role = nextRoleLabel;
  candidates.forEach((candidate) => {
    if (candidate.role === prev) {
      candidate.role = nextRoleLabel;
      updateCandidateDerivedFields(candidate);
    }
  });
  refreshCandidateLookup();
}

function updateByPath(path, value) {
  const [kind, a, b, c] = String(path || "").split(":");
  if (!kind) return;
  if (kind === "candidate") {
    const candidate = candidateById(a);
    if (!candidate) return;
    candidate[b] = b === "interview_score" ? numericOrText(value) : clean(value);
    updateCandidateDerivedFields(candidate);
  }
  if (kind === "detail") {
    const detail = candidateDetailById(a);
    if (!detail) return;
    detail[b] = b === "overall_rating" ? numericOrText(value) : clean(value);
    if (b === "candidate_name") {
      const candidate = candidateById(a);
      if (candidate) candidate.candidate_name = clean(value);
    }
    refreshCandidateLookup();
  }
  if (kind === "score") {
    const detail = candidateDetailById(a);
    if (!detail?.scorecard?.[Number(b)]) return;
    detail.scorecard[Number(b)][c] = c === "score" ? numericOrText(value) : clean(value);
  }
  if (kind === "office") {
    const office = offices.find((item) => item.office === a);
    if (!office) return;
    office[b] = b === "office" || b === "top_stage" || b === "status" ? clean(value) : numericOrText(value);
  }
  if (kind === "risk") {
    const item = bottlenecks[Number(a)];
    if (!item) return;
    item[b] = b === "value" ? numericOrText(value) : clean(value);
  }
  if (kind === "decision") {
    const item = (summary.leadershipDecisions || [])[Number(a)];
    if (!item) return;
    item[b] = clean(value);
  }
  if (kind === "stage") {
    const prev = stageOrder[Number(a)];
    if (!prev) return;
    stageHealth[prev] = numericOrText(value);
    if (funnel.global) funnel.global[prev] = numericOrText(value);
  }
  if (kind === "role") {
    const role = roles.find((item) => item.id === a);
    if (!role) return;
    if (b === "role") {
      updateRoleLabel(a, clean(value));
    } else {
      role[b] = b === "pipeline_count" || b === "average_score" ? numericOrText(value) : clean(value);
    }
  }
  syncSummaryViewsFromCandidates();
  syncDashboardCounts();
  refreshDataRefs();
  persistAll();
}

function scoreText(value) {
  if (value === null || value === undefined || value === "") return "Not captured in ATS.";
  const num = Number(value);
  return Number.isFinite(num) ? metricFormatter.format(num) : notCaptured(value);
}

function shortText(value, limit = 96) {
  const text = notCaptured(value);
  if (text === "Not captured in ATS.") return text;
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit - 1).trimEnd();
  return `${cut.slice(0, cut.lastIndexOf(" ") > 30 ? cut.lastIndexOf(" ") : cut.length)}...`;
}

function slug(value) {
  return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function readState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeState(nextState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  if (statusEl) {
    statusEl.textContent = "Saved locally. Changes sync across open copies.";
  }
}

function readChatState() {
  try {
    return JSON.parse(localStorage.getItem(CHAT_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeChatState(nextState) {
  localStorage.setItem(CHAT_KEY, JSON.stringify(nextState));
}

let state = { ...defaultState, ...readState() };
let chatState = readChatState();

state.roleOverrides = {
  ...roleOverrideDefaultsMap,
  ...(state.roleOverrides || {}),
};
Object.keys(state.roleOverrides).forEach((roleId) => {
  state.roleOverrides[roleId] = {
    ...roleOverrideDefaultsMap[roleId],
    ...state.roleOverrides[roleId],
  };
});

if (state.activeCandidates === 37 && summary.kpis?.activeCandidates === 35) {
  state.activeCandidates = 35;
  saveState();
}

ensureRequiredLondonData();
refreshDataRefs();
syncDashboardCounts();

function persistAll() {
  writeDataState(dataState);
  rebuildRoleOverrideDefaultsMap();
  saveState();
}

function saveState() {
  writeState({
    ...state,
  });
}

function visibleRoles() {
  const all = roles.map((role) => roleRecord(role)).filter(Boolean);
  if (state.office === "Global") return all;
  return all.filter((role) => officeMatches(role.office, state.office));
}

function visibleCandidates() {
  if (state.office === "Global") return candidates;
  return candidates.filter((candidate) => officeMatches(candidate.office_location, state.office));
}

function selectedRole() {
  const visible = visibleRoles();
  let role = visible.find((item) => item.id === state.roleId);
  if (!role) {
    role = visible[0] || null;
    state.roleId = role?.id || "";
  }
  return role;
}

function roleCandidates(role) {
  if (!role) return [];
  return candidates.filter((candidate) => candidate.role === role.role);
}

function selectedCandidate(role) {
  if (!role) {
    state.candidateId = "";
    return null;
  }
  const items = roleCandidates(role);
  let candidate = items.find((item) => item.id === state.candidateId);
  if (!candidate) {
    candidate = items[0] || null;
    state.candidateId = candidate?.id || "";
  }
  return candidate;
}

function formatRankedLabel(value) {
  return clean(value) || "Not captured in ATS.";
}

function rankFromStage(stage) {
  return stageOrder.indexOf(clean(stage));
}

function renderPill(target, label) {
  if (target) target.textContent = label;
}

function renderLeadershipSummary() {
  els.leadershipSummary.innerHTML = (summary.leadershipSummary || [])
    .map((item, index) => {
      const key = index === 0 ? "leadSummaryOpen" : index === 1 ? "leadSummaryStuck" : "leadSummaryDecision";
      const value = blankIfMissing(state[key] ?? item);
      return `
      <div class="leadership-line">
        <span>${index === 0 ? "What is happening" : index === 1 ? "What is stuck" : "Decision needed"}</span>
        <span class="editable" contenteditable="true" spellcheck="false" data-save="${key}">${value}</span>
      </div>
      `;
    })
    .join("");

  const insightKeys = ["insight1", "insight2", "insight3", "insight4"];
  els.mainInsights.innerHTML = (summary.leadershipInsights || [])
    .map((item, index) => {
      const key = insightKeys[index] || `insight${index + 1}`;
      const value = blankIfMissing(state[key] ?? item);
      return `<div class="insight-item editable" contenteditable="true" spellcheck="false" data-save="${key}">${value}</div>`;
    })
    .join("");
}

function renderLeadershipDecisions() {
  if (!els.leadershipDecisions) return;
  els.leadershipDecisions.innerHTML = (summary.leadershipDecisions || [])
    .map((decision, index) => {
      return `
      <div class="decision">
        <h4 class="editable" contenteditable="true" spellcheck="false" data-edit="decision:${index}:title">${decision.title || ""}</h4>
        <p class="editable" contenteditable="true" spellcheck="false" data-edit="decision:${index}:description">${decision.description || ""}</p>
      </div>
      `;
    })
    .join("");
}

function renderKpis() {
  const metrics = [
    ["Total Candidates", "totalCandidates"],
    ["Active", "activeCandidates"],
    ["Open Roles", "openRoles"],
    ["Average Score", "averageScore"],
    ["High Risk", "highRisk"],
    ["Needs Review", "needReview"],
  ];

  els.kpiGrid.innerHTML = metrics
    .map(([label, key]) => {
      const value = state[key];
      const display = value === "" || value === null || value === undefined
        ? ""
        : value;
      return `
      <div class="metric">
        <div class="kpi">${label}</div>
        <div class="val editable" contenteditable="true" spellcheck="false" data-save="${key}">${display}</div>
      </div>
      `;
    })
    .join("");
}

function officeRows() {
  const all = offices.slice();
  return state.office === "Global"
    ? all
    : [all.find((item) => officeMatches(item.office, state.office))].filter(Boolean);
}

function renderOfficeView() {
  renderPill(els.officeViewPill, state.office);
  renderPill(els.talentOfficePill, state.office);
  renderPill(els.roleOfficePill, state.office);
  const rows = officeRows();
  els.officeViewBody.innerHTML = rows
    .map((row) => `
      <tr>
        <td><span class="editable role-editable" contenteditable="true" spellcheck="false" data-edit="office:${row.office}:office">${row.office}</span></td>
        <td><span class="editable role-editable" contenteditable="true" spellcheck="false" data-edit="office:${row.office}:count">${row.count}</span></td>
        <td><span class="editable role-editable" contenteditable="true" spellcheck="false" data-edit="office:${row.office}:active">${row.active}</span></td>
        <td><span class="editable role-editable" contenteditable="true" spellcheck="false" data-edit="office:${row.office}:average_score">${row.average_score === null ? "" : metricFormatter.format(row.average_score)}</span></td>
        <td><span class="editable role-editable" contenteditable="true" spellcheck="false" data-edit="office:${row.office}:top_stage">${formatRankedLabel(row.top_stage)}</span></td>
        <td><span class="editable role-editable" contenteditable="true" spellcheck="false" data-edit="office:${row.office}:status">${row.status}</span></td>
      </tr>
    `)
    .join("");
}

function renderRoleView() {
  const rows = visibleRoles();
  els.roleViewBody.innerHTML = rows
    .map((row) => `
      <tr class="${row.id === state.roleId ? "is-selected" : ""}" data-role-id="${row.id}">
        <td><span class="editable role-editable" contenteditable="true" spellcheck="false" data-edit="role:${row.id}:role">${row.role}</span></td>
        <td><span class="editable role-editable" contenteditable="true" spellcheck="false" data-role-save="${row.id}:office">${roleBlank(row.office)}</span></td>
        <td><span class="editable role-editable" contenteditable="true" spellcheck="false" data-role-save="${row.id}:pipeline_count">${row.pipeline_count}</span></td>
        <td><span class="editable role-editable" contenteditable="true" spellcheck="false" data-role-save="${row.id}:average_score">${row.average_score === null ? "" : metricFormatter.format(row.average_score)}</span></td>
        <td><span class="editable role-editable" contenteditable="true" spellcheck="false" data-role-save="${row.id}:current_stage">${roleBlank(row.current_stage)}</span></td>
        <td><span class="editable role-editable" contenteditable="true" spellcheck="false" data-role-save="${row.id}:status">${row.status}</span></td>
      </tr>
    `)
    .join("");

  els.roleViewBody.querySelectorAll("tr[data-role-id]").forEach((row) => {
    row.addEventListener("click", (event) => {
      if (event.target.closest("[contenteditable='true']")) return;
      state.roleId = row.dataset.roleId;
      const role = selectedRole();
      const items = roleCandidates(role);
      if (items.length) state.candidateId = items[0].id;
      state.tab = "role-panel";
      saveState();
      render();
      setTab("role-panel");
    });
  });
}

function renderPipeline() {
  const rows = visibleCandidates();
  els.pipelineBody.innerHTML = rows
    .map((candidate) => `
      <tr data-candidate-id="${candidate.id}" class="${candidate.id === state.candidateId ? "is-selected" : ""}">
        <td><span class="editable role-editable" contenteditable="true" spellcheck="false" data-edit="candidate:${candidate.id}:candidate_name">${candidate.candidate_name}</span></td>
        <td><span class="editable role-editable" contenteditable="true" spellcheck="false" data-edit="candidate:${candidate.id}:role">${candidate.role}</span></td>
        <td><span class="editable role-editable" contenteditable="true" spellcheck="false" data-edit="candidate:${candidate.id}:stage">${formatRankedLabel(candidate.stage)}</span></td>
        <td><span class="editable role-editable" contenteditable="true" spellcheck="false" data-edit="candidate:${candidate.id}:interview_score">${candidate.interview_score === null ? "" : metricFormatter.format(candidate.interview_score)}</span></td>
        <td><span class="editable role-editable" contenteditable="true" spellcheck="false" data-edit="candidate:${candidate.id}:risk_level">${formatRankedLabel(candidate.risk_level)}</span></td>
        <td><span class="editable role-editable" contenteditable="true" spellcheck="false" data-edit="candidate:${candidate.id}:next_step">${blankIfMissing(candidate.next_step)}</span></td>
      </tr>
    `)
    .join("");

  els.pipelineBody.querySelectorAll("tr[data-candidate-id]").forEach((row) => {
    row.addEventListener("click", (event) => {
      if (event.target.closest("[contenteditable='true']")) return;
      state.candidateId = row.dataset.candidateId;
      const candidate = candidateLookupById(state.candidateId);
      if (candidate) {
        const role = roles.find((item) => item.role === candidate.role);
        if (role) state.roleId = role.id;
      }
      state.tab = "role-panel";
      saveState();
      render();
      setTab("role-panel");
    });
  });
}

function renderStageHealth() {
  const officeCounts = state.office === "Global"
    ? null
    : (funnel.offices?.[state.office] || funnel.offices?.[canonicalOffice(state.office)] || null);
  const counts = officeCounts || funnel.global || stageHealth || {};
  const max = Math.max(...stageOrder.map((stage) => counts[stage] || 0), 1);
  els.stageHealthBody.innerHTML = stageOrder
    .map((stage, index) => {
      const count = counts[stage] || 0;
      const width = (count / max) * 100;
      return `
        <div class="stage-row">
          <div class="stage-label">${stage}</div>
          <div class="bar"><div class="fill" style="width:${width}%"></div></div>
          <div class="stage-count editable" contenteditable="true" spellcheck="false" data-edit="stage:${index}:count">${count}</div>
        </div>
      `;
    })
    .join("");
}

function renderRisks() {
  els.riskBody.innerHTML = bottlenecks
    .map((item, index) => `
      <div class="risk-item">
        <div class="risk-top">
          <span class="risk-label editable" contenteditable="true" spellcheck="false" data-edit="risk:${index}:label">${item.label}</span>
          <span class="risk-count editable" contenteditable="true" spellcheck="false" data-edit="risk:${index}:value">${item.value}</span>
        </div>
        <div class="tiny editable" contenteditable="true" spellcheck="false" data-edit="risk:${index}:note">${item.note}</div>
      </div>
    `)
    .join("");
}

function renderRoleOverview() {
  const rows = visibleRoles();
  els.roleOverviewBody.innerHTML = rows
    .map((row) => `
      <tr class="${row.id === state.roleId ? "is-selected" : ""}" data-role-id="${row.id}">
        <td><span class="editable role-editable" contenteditable="true" spellcheck="false" data-edit="role:${row.id}:role">${row.role}</span></td>
        <td><span class="editable role-editable" contenteditable="true" spellcheck="false" data-role-save="${row.id}:office">${roleBlank(row.office)}</span></td>
        <td><span class="editable role-editable" contenteditable="true" spellcheck="false" data-role-save="${row.id}:priority">${roleBlank(row.priority)}</span></td>
        <td><span class="editable role-editable" contenteditable="true" spellcheck="false" data-role-save="${row.id}:pipeline_count">${roleBlank(row.pipeline_count)}</span></td>
        <td><span class="editable role-editable" contenteditable="true" spellcheck="false" data-role-save="${row.id}:average_score">${row.average_score === null ? "" : metricFormatter.format(row.average_score)}</span></td>
        <td><span class="editable role-editable" contenteditable="true" spellcheck="false" data-role-save="${row.id}:current_stage">${roleBlank(row.current_stage)}</span></td>
        <td><span class="editable role-editable" contenteditable="true" spellcheck="false" data-role-save="${row.id}:status">${roleBlank(row.status)}</span></td>
      </tr>
    `)
    .join("");

  els.roleOverviewBody.querySelectorAll("tr[data-role-id]").forEach((row) => {
    row.addEventListener("click", (event) => {
      if (event.target.closest("[contenteditable='true']")) return;
      state.roleId = row.dataset.roleId;
      const role = selectedRole();
      const items = roleCandidates(role);
      if (items.length) state.candidateId = items[0].id;
      state.tab = "role-panel";
      saveState();
      render();
      setTab("role-panel");
    });
  });
}

function renderSnapshot(role) {
  const record = roleRecord(role);
  if (!record) {
    els.roleSnapshot.innerHTML = "";
    return;
  }

  const items = roleCandidates(record);
  const finalists = items.filter((item) => clean(item.stage).includes("2nd Interview") || clean(item.stage).includes("3rd Round")).length;
  const offers = items.filter((item) => clean(item.next_step).toLowerCase().includes("offer")).length;
  const decisionNeeded = record.status === "Decision Needed" ? "Yes" : "No";
  const values = [
    ["Role", record.role],
    ["Office", roleBlank(record.office)],
    ["Pipeline", record.pipeline_count],
    ["Current Stage", roleBlank(record.current_stage)],
    ["Candidates", items.length],
    ["Finalists", finalists],
    ["Open Offers", offers],
    ["Decision Needed", decisionNeeded],
  ];

  els.roleSnapshot.innerHTML = values
    .map(([label, value]) => {
      let content = roleBlank(value);
      if (label === "Role") {
        content = `<span class="editable" contenteditable="true" spellcheck="false" data-edit="role:${record.id}:role">${roleBlank(value)}</span>`;
      }
      if (label === "Office") {
        content = `<span class="editable" contenteditable="true" spellcheck="false" data-role-save="${record.id}:office">${roleBlank(value)}</span>`;
      }
      if (label === "Pipeline") {
        content = `<span class="editable" contenteditable="true" spellcheck="false" data-role-save="${record.id}:pipeline_count">${roleBlank(value)}</span>`;
      }
      if (label === "Current Stage") {
        content = `<span class="editable" contenteditable="true" spellcheck="false" data-role-save="${record.id}:current_stage">${roleBlank(value)}</span>`;
      }
      return `
        <div class="snapshot-card">
          <p class="snapshot-label">${label}</p>
          <p class="snapshot-value">${content}</p>
        </div>
      `;
    })
    .join("");

  renderPill(els.selectedRolePill, record.role);
  renderPill(els.funnelPill, state.office === "Global" ? "Global" : state.office);
}

function renderRoleFunnel(role) {
  const record = roleRecord(role);
  const items = roleCandidates(record);
  const counts = stageOrder.reduce((acc, stage) => {
    acc[stage] = items.filter((candidate) => candidate.stage === stage).length;
    return acc;
  }, {});
  const viewLabel = `${state.office === "Global" ? "Global" : state.office} / ${shortText(record?.role || "Selected role", 32)}`;

  const max = Math.max(...stageOrder.map((stage) => counts[stage] || 0), 1);
  els.roleFunnel.innerHTML = `
    <div class="funnel-card">
      <div class="funnel-head">
        <div class="funnel-label">${viewLabel}</div>
        <div class="funnel-note">Current funnel</div>
      </div>
      ${stageOrder
        .map((stage) => {
          const count = counts[stage] || 0;
          const width = (count / max) * 100;
          return `
            <div class="stage-row">
              <div class="stage-label">${stage}</div>
              <div class="bar"><div class="fill" style="width:${width}%"></div></div>
              <div class="stage-count">${count}</div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function candidateLookupById(id) {
  return candidates.find((item) => item.id === id) || null;
}

function latestCandidateDetail(role, candidate) {
  if (!candidate) return null;
  return candidateLookup[candidate.candidate_name] || candidateDetails.find((item) => item.candidate_name === candidate.candidate_name) || null;
}

function candidateSummaryLines(detail, candidate) {
  const lines = [
    ["Overall", detail?.stakeholder_summary || candidate.next_step, `detail:${candidate.id}:stakeholder_summary`],
    ["Strengths", detail?.strengths || candidate.next_step, `detail:${candidate.id}:strengths`],
    ["Concerns", detail?.concerns || candidate.risk_level, `detail:${candidate.id}:concerns`],
    ["What to test", detail?.what_to_test_next || candidate.next_step, `detail:${candidate.id}:what_to_test_next`],
    ["Recommendation", detail?.recommendation, `detail:${candidate.id}:recommendation`],
    ["Red flag", detail?.red_flag_status, `detail:${candidate.id}:red_flag_status`],
    ["Level", detail?.suggested_level, `detail:${candidate.id}:suggested_level`],
    ["Trust", detail?.client_trust, `detail:${candidate.id}:client_trust`],
  ];

  return lines.map(([label, value, path]) => `
    <p class="detail-label">${label}</p>
    <p class="detail-value editable" contenteditable="true" spellcheck="false" data-edit="${path}">${roleBlank(value)}</p>
  `).join("");
}

function renderCandidateDetail(role, candidate) {
  if (!role || !candidate) {
    els.candidateProfile.innerHTML = "";
    els.candidateSummary.innerHTML = "";
    els.candidateScorecard.innerHTML = "";
    els.decisionNote.textContent = "";
    renderChat(candidate);
    return;
  }

  const detail = latestCandidateDetail(role, candidate);
  const nextDate = notCaptured(detail?.interview_date || candidate.last_updated);

  els.candidateProfile.innerHTML = `
    <h4>Candidate Profile</h4>
    <div class="profile-stack">
      <div class="profile-name editable" contenteditable="true" spellcheck="false" data-edit="candidate:${candidate.id}:candidate_name">${candidate.candidate_name}</div>
      <div class="profile-row"><span>Role</span><strong class="editable" contenteditable="true" spellcheck="false" data-edit="candidate:${candidate.id}:role">${roleBlank(candidate.role)}</strong></div>
      <div class="profile-row"><span>Location</span><strong class="editable" contenteditable="true" spellcheck="false" data-edit="candidate:${candidate.id}:office_location">${roleBlank(candidate.office_location)}</strong></div>
      <div class="profile-row"><span>Stage</span><strong class="editable" contenteditable="true" spellcheck="false" data-edit="candidate:${candidate.id}:stage">${roleBlank(candidate.stage)}</strong></div>
      <div class="profile-row"><span>Interview</span><strong class="editable" contenteditable="true" spellcheck="false" data-edit="detail:${candidate.id}:interview_date">${roleBlank(nextDate)}</strong></div>
      <div class="profile-row"><span>Feedback</span><strong class="editable" contenteditable="true" spellcheck="false" data-edit="detail:${candidate.id}:latest_feedback_reference">${roleBlank(detail?.latest_feedback_reference)}</strong></div>
      <div class="profile-row"><span>Rating</span><strong class="editable" contenteditable="true" spellcheck="false" data-edit="detail:${candidate.id}:overall_rating">${roleBlank(detail?.overall_rating ?? candidate.interview_score)}</strong></div>
      <div class="profile-row"><span>Recommendation</span><strong class="editable" contenteditable="true" spellcheck="false" data-edit="detail:${candidate.id}:recommendation">${roleBlank(detail?.recommendation)}</strong></div>
      <div class="profile-row"><span>Red Flag</span><strong class="editable" contenteditable="true" spellcheck="false" data-edit="detail:${candidate.id}:red_flag_status">${roleBlank(detail?.red_flag_status)}</strong></div>
    </div>
  `;

  els.candidateSummary.innerHTML = `
    <h4>Candidate Summary</h4>
    ${candidateSummaryLines(detail, candidate)}
    <div class="summary-block">
      <p class="detail-label">Stakeholder ready</p>
        <p class="detail-value editable" contenteditable="true" spellcheck="false" data-edit="detail:${candidate.id}:stakeholder_summary">${roleBlank(detail?.stakeholder_summary || detail?.notes || candidate.next_step)}</p>
      </div>
    <p class="decision-note editable" contenteditable="true" spellcheck="false" data-edit="detail:${candidate.id}:disclaimer">${blankIfMissing(detail?.disclaimer || "AI structures assessment; final hiring decision remains our human team.")}</p>
  `;

  els.candidateScorecard.innerHTML = `
    <h4>Scorecard</h4>
    <div class="table-wrap scorecard-wrap">
      <table class="scorecard">
        <thead>
          <tr>
            <th>Criteria</th>
            <th>Score</th>
            <th>Assessment note</th>
          </tr>
        </thead>
        <tbody>
          ${(detail?.scorecard || []).map((row, index) => `
            <tr>
              <td class="editable" contenteditable="true" spellcheck="false" data-edit="score:${candidate.id}:${index}:criteria">${row.criteria}</td>
              <td><span class="score editable" contenteditable="true" spellcheck="false" data-edit="score:${candidate.id}:${index}:score">${row.score === null || row.score === undefined ? "" : row.score}</span></td>
              <td class="editable" contenteditable="true" spellcheck="false" data-edit="score:${candidate.id}:${index}:note">${blankIfMissing(row.note)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
    <div class="candidate-notes">
      <div class="candidate-note">
        <p class="detail-label">Overall comment</p>
        <p class="detail-value editable" contenteditable="true" spellcheck="false" data-edit="detail:${candidate.id}:notes">${blankIfMissing(detail?.notes)}</p>
      </div>
      <div class="candidate-note">
        <p class="detail-label">What to test next</p>
        <p class="detail-value editable" contenteditable="true" spellcheck="false" data-edit="detail:${candidate.id}:what_to_test_next">${blankIfMissing(detail?.what_to_test_next || candidate.next_step)}</p>
      </div>
      <div class="candidate-note">
        <p class="detail-label">Reference</p>
        <p class="detail-value editable" contenteditable="true" spellcheck="false" data-edit="detail:${candidate.id}:latest_feedback_reference">${blankIfMissing(detail?.latest_feedback_reference)}</p>
      </div>
    </div>
  `;

  const recommendation = roleBlank(detail?.recommendation || candidate.status);
  const nextTest = roleBlank(detail?.what_to_test_next || candidate.next_step);
  const decisionBits = [];
  if (recommendation) decisionBits.push(`Recommended: ${recommendation}`);
  if (nextTest) decisionBits.push(`Next: ${nextTest}`);
  els.decisionNote.textContent = decisionBits.join(". ");

  renderPill(els.selectedCandidatePill, candidate.candidate_name);
  renderChat(candidate);
}

function chatKey(candidate) {
  return candidate ? candidate.id : "none";
}

function renderChat(candidate) {
  if (!els.chatHistory || !els.chatInput) return;
  const history = chatState[chatKey(candidate)] || [];
  const seedText = candidate ? roleBlank(candidateLookup[candidate.candidate_name]?.what_to_test_next || candidate.next_step) : "";
  const seed = seedText ? [{
    role: "ATS note",
    text: seedText,
  }] : [];

  const combined = [...seed, ...history];
  els.chatHistory.innerHTML = combined.length
    ? combined
        .map((entry) => `
          <div class="chat-message ${entry.role === "ATS note" ? "system" : "user"}">
            <div class="chat-role">${entry.role}</div>
            <div class="chat-text">${entry.text}</div>
          </div>
        `)
        .join("")
    : `<div class="chat-empty">No follow-up note yet.</div>`;

  els.chatInput.value = "";
}

function addChatMessage(candidate) {
  if (!candidate || !els.chatInput) return;
  const text = clean(els.chatInput.value);
  if (!text) return;
  const key = chatKey(candidate);
  const history = chatState[key] || [];
  history.push({ role: "Follow-up", text });
  chatState[key] = history.slice(-12);
  writeChatState(chatState);
  renderChat(candidate);
  if (statusEl) statusEl.textContent = "Follow-up note saved locally.";
}

function clearChat(candidate) {
  if (!candidate) return;
  chatState[chatKey(candidate)] = [];
  writeChatState(chatState);
  renderChat(candidate);
  if (statusEl) statusEl.textContent = "Follow-up note cleared.";
}

function defaultScorecardRows() {
  return [
    "consulting mindset",
    "problem solving",
    "client presence",
    "adaptability",
    "leadership",
    "communication",
    "commercial awareness",
  ].map((criteria) => ({ criteria, score: "", note: "" }));
}

function addCandidate(role) {
  const roleName = role?.role || "New role";
  const officeName = role?.office || state.office || "Global";
  const nextId = slug(`candidate-${Date.now()}`);
  const candidateName = `New Candidate ${candidates.length + 1}`;
  const candidate = {
    id: nextId,
    candidate_name: candidateName,
    role: roleName,
    office_location: officeName,
    stage: role?.current_stage || "HR Interview",
    status: "Active",
    source: "Manual entry",
    interview_score: "",
    risk_level: "",
    next_step: "",
    last_updated: "",
  };
  const detail = {
    id: nextId,
    candidate_name: candidateName,
    role: roleName,
    role_assessed_for: roleName,
    office_location: officeName,
    location: officeName,
    current_stage: candidate.stage,
    company: "",
    interview_date: "",
    latest_feedback_reference: "",
    overall_rating: "",
    recommendation: "",
    red_flag_status: "",
    strengths: "",
    concerns: "",
    what_to_test_next: "",
    stakeholder_summary: "",
    suggested_level: "",
    client_trust: "",
    scorecard: defaultScorecardRows(),
    next_step: "",
    status: "Active",
    risk_level: "",
    source: "Manual entry",
    last_updated: "",
    notes: "",
    disclaimer: "AI structures assessment; final hiring decision remains our human team.",
  };
  dataState.candidates = [...candidates, candidate];
  dataState.candidateDetails = [...candidateDetails, detail];
  refreshDataRefs();
  refreshCandidateLookup();
  syncSummaryViewsFromCandidates();
  syncDashboardCounts();
  state.candidateId = nextId;
  if (role?.id) state.roleId = role.id;
  persistAll();
  render();
  setTab("role-panel");
  if (statusEl) statusEl.textContent = "Candidate added locally.";
}

function deleteCandidate(candidate) {
  if (!candidate) return;
  dataState.candidates = candidates.filter((item) => item.id !== candidate.id);
  dataState.candidateDetails = candidateDetails.filter((item) => item.id !== candidate.id);
  refreshDataRefs();
  refreshCandidateLookup();
  syncSummaryViewsFromCandidates();
  syncDashboardCounts();
  const nextCandidate = candidates.find((item) => item.id !== candidate.id) || dataState.candidates[0] || null;
  state.candidateId = nextCandidate?.id || "";
  persistAll();
  render();
  setTab("role-panel");
  if (statusEl) statusEl.textContent = "Candidate deleted locally.";
}

function render() {
  const role = selectedRole();
  const candidate = selectedCandidate(role);

  renderLeadershipSummary();
  renderLeadershipDecisions();
  renderKpis();
  renderOfficeView();
  renderRoleView();
  renderPipeline();
  renderStageHealth();
  renderRisks();
  renderRoleOverview();
  renderSnapshot(role);
  renderRoleFunnel(role);
  renderRolePipeline(role);
  renderCandidateDetail(role, candidate);
  highlightOfficeButtons();
  bindEditableNodes();
}

function renderRolePipeline(role) {
  const items = roleCandidates(role);
  els.rolePipelineBody.innerHTML = items
    .map((candidate) => {
      const detail = latestCandidateDetail(role, candidate);
      return `
        <tr data-role-candidate-id="${candidate.id}" class="${candidate.id === state.candidateId ? "is-selected" : ""}">
          <td><span class="editable role-editable" contenteditable="true" spellcheck="false" data-edit="candidate:${candidate.id}:candidate_name">${candidate.candidate_name}</span></td>
          <td><span class="editable role-editable" contenteditable="true" spellcheck="false" data-edit="candidate:${candidate.id}:stage">${blankIfMissing(candidate.stage)}</span></td>
              <td><span class="editable role-editable" contenteditable="true" spellcheck="false" data-edit="candidate:${candidate.id}:interview_score">${candidate.interview_score === null ? "" : metricFormatter.format(candidate.interview_score)}</span></td>
          <td><span class="editable role-editable" contenteditable="true" spellcheck="false" data-edit="detail:${candidate.id}:strengths">${roleBlank(shortText(detail?.strengths || candidate.next_step, 60))}</span></td>
          <td><span class="editable role-editable" contenteditable="true" spellcheck="false" data-edit="detail:${candidate.id}:concerns">${roleBlank(shortText(detail?.concerns || candidate.risk_level, 60))}</span></td>
          <td><span class="editable role-editable" contenteditable="true" spellcheck="false" data-edit="detail:${candidate.id}:what_to_test_next">${roleBlank(shortText(detail?.what_to_test_next || candidate.next_step, 60))}</span></td>
        </tr>
      `;
    })
    .join("");

  els.rolePipelineBody.querySelectorAll("tr[data-role-candidate-id]").forEach((row) => {
    row.addEventListener("click", (event) => {
      if (event.target.closest("[contenteditable='true']")) return;
      state.candidateId = row.dataset.roleCandidateId;
      state.tab = "role-panel";
      saveState();
      render();
      setTab("role-panel");
    });
  });
}

function highlightOfficeButtons() {
  officeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.office === state.office);
  });
}

function setTab(id) {
  tabs.forEach((tab) => tab.setAttribute("aria-selected", String(tab.dataset.tab === id)));
  panels.forEach((panel) => panel.classList.toggle("active", panel.id === id));
  state.tab = id;
  saveState();
}

function bindEditableNodes() {
  document.querySelectorAll("[data-save]").forEach((node) => {
    if (node.dataset.bound === "true") return;
    node.dataset.bound = "true";
    node.addEventListener("input", () => {
      const key = node.dataset.save;
      state[key] = clean(node.innerText);
      saveState();
    });
    node.addEventListener("blur", () => {
      const key = node.dataset.save;
      state[key] = clean(node.innerText);
      node.innerText = state[key];
      saveState();
    });
  });

  document.querySelectorAll("[data-role-save]").forEach((node) => {
    if (node.dataset.bound === "true") return;
    node.dataset.bound = "true";
    const [roleId, field] = String(node.dataset.roleSave || "").split(":");
    node.addEventListener("input", () => {
      if (!roleId || !field) return;
      const raw = clean(node.innerText);
      const next = { ...(state.roleOverrides || {}) };
      const current = { ...(next[roleId] || roleOverrideDefaultsMap[roleId] || {}) };
      current[field] = field === "pipeline_count" || field === "average_score"
        ? (raw === "" ? "" : Number.isFinite(Number(raw)) ? Number(raw) : raw)
        : raw;
      next[roleId] = current;
      state.roleOverrides = next;
      saveState();
    });
    node.addEventListener("blur", () => {
      if (!roleId || !field) return;
      const raw = clean(node.innerText);
      const next = { ...(state.roleOverrides || {}) };
      const current = { ...(next[roleId] || roleOverrideDefaultsMap[roleId] || {}) };
      current[field] = field === "pipeline_count" || field === "average_score"
        ? (raw === "" ? "" : Number.isFinite(Number(raw)) ? Number(raw) : raw)
        : raw;
      next[roleId] = current;
      state.roleOverrides = next;
      node.innerText = field === "average_score" && raw !== "" && Number.isFinite(Number(raw))
        ? metricFormatter.format(Number(raw))
        : raw;
      saveState();
    });
  });

  document.querySelectorAll("[data-edit]").forEach((node) => {
    if (node.dataset.bound === "true") return;
    node.dataset.bound = "true";
    const path = node.dataset.edit;
    node.addEventListener("input", () => {
      updateByPath(path, node.innerText);
    });
    node.addEventListener("blur", () => {
      updateByPath(path, node.innerText);
      render();
      setTab(state.tab || "talent-panel");
    });
  });
}

function setOffice(office) {
  state.office = office;
  const visible = visibleRoles();
  const nextRole = visible[0] || null;
  state.roleId = nextRole?.id || "";
  const items = nextRole ? roleCandidates(nextRole) : [];
  state.candidateId = items[0]?.id || "";
  saveState();
  render();
}

function syncFromStorage() {
  dataState = mergeSourceData(readDataState(), talentData);
  refreshDataRefs();
  ensureRequiredLondonData();
  refreshDataRefs();
  rebuildRoleOverrideDefaultsMap();
  const nextState = readState();
  state = { ...defaultState, ...nextState };
  chatState = readChatState();
  render();
  setTab(state.tab || "talent-panel");
}

function handleAction(action) {
  const role = selectedRole();
  const candidate = selectedCandidate(role);
  if (action === "save") {
    saveState();
    if (statusEl) statusEl.textContent = "Saved locally.";
  }
  if (action === "reset") {
    dataState = deepClone(talentData);
    refreshDataRefs();
    refreshCandidateLookup();
    localStorage.removeItem(DATA_KEY);
    state = { ...defaultState };
    chatState = {};
    writeState(defaultState);
    writeChatState({});
    render();
    setTab("talent-panel");
    if (statusEl) statusEl.textContent = "View reset to defaults.";
  }
  if (action === "copy-link") {
    const path = "file:///C:/Users/Admin/Desktop/talent-dashboard/index.html";
    navigator.clipboard.writeText(path).then(() => {
      if (statusEl) statusEl.textContent = "File path copied.";
    }).catch(() => {
      if (statusEl) statusEl.textContent = path;
    });
  }
  if (action === "send-chat") {
    addChatMessage(candidate);
  }
  if (action === "clear-chat") {
    clearChat(candidate);
  }
  if (action === "add-candidate") {
    addCandidate(role);
  }
  if (action === "delete-candidate") {
    deleteCandidate(candidate);
  }
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => setTab(tab.dataset.tab));
});

officeButtons.forEach((button) => {
  button.addEventListener("click", () => setOffice(button.dataset.office));
});

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => handleAction(button.dataset.action));
});

window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_KEY || event.key === CHAT_KEY || event.key === DATA_KEY) {
    syncFromStorage();
    if (statusEl) statusEl.textContent = "Synced from another open copy.";
  }
});

const initialTab = state.tab || "talent-panel";
render();
setTab(initialTab);
