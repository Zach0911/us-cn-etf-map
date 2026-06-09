import { marketData as sampleData } from "./data.js";
import { peopleData } from "./peopleData.js";

let data = sampleData;
let peopleSnapshot = peopleData;
let searchTrackTimer;
const trackedPersonImageLoads = new Set();

const state = {
  horizon: "short",
  signal: "all",
  query: "",
  pageTab: "radar",
  selectedId: data.themes[0].id,
  listCollapsed: false,
  detailCollapsed: false,
  sortKey: "strength",
  sortDir: "desc",
  personId: peopleData.people[0].id,
  personView: "voice",
};

const horizonLabels = {
  short: "短期强弱",
  mid: "中期强弱",
  long: "长期强弱",
  all: "综合强弱",
};

const signalClass = {
  共振: "sync",
  传导: "lead",
  背离: "diverge",
};

const signalDescriptions = {
  共振: "美股主题ETF与A股ETF在多个周期同向走强或走弱，说明跨市场映射更顺畅，适合优先观察。",
  传导: "美股主题ETF已经先动，A股ETF尚未完全跟上，适合观察隔夜到A股开盘后的补涨或补跌传导。",
  背离: "美股主题ETF与A股ETF走势不同步或方向相反，说明本土因素影响更强，需要二次确认。",
};

const strengthDescription =
  "强度是当前美股主题ETF在所选周期内的0-100分。分数使用最新收盘价相对EMA的偏离计算：短期参考EMA5/EMA20，中期参考EMA20/EMA60，长期参考EMA120/年内EMA，综合为三类分数加权。";

const selectedStrengthDescription =
  "这里展示的是当前选中美股主题的强度，不是A股ETF强度。它会随短期、中期、长期、综合周期切换而变化，用来判断美股主题本身的强弱。";

const sortLabels = {
  strength: "强度",
  "1d": "近1日涨跌幅",
  "5d": "近1周涨跌幅",
};

const personViewLabels = {
  voice: "发声影响",
  disclosure: "披露交易",
  policy: "政策关联",
};

const $ = (selector) => document.querySelector(selector);

function applyInitialRoute() {
  const checkParam = new URLSearchParams(window.location.search).get("check") || "";
  if (checkParam.includes("person-radar")) {
    state.pageTab = "people";
  }
}

function trackEvent(eventName, params = {}) {
  if (typeof window.gtag !== "function") return;
  window.gtag("event", eventName, {
    app_name: "us_cn_etf_map",
    ...params,
  });
}

function trackSectionView(reason = "render") {
  trackEvent("section_view", {
    section: state.pageTab,
    reason,
    theme_id: state.selectedId,
    person_id: state.personId,
    person_view: state.personView,
  });
}

function fmtPct(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function returnClass(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "neutral";
  return value >= 0 ? "up" : "down";
}

function fmtAmount(value) {
  if (!value) return "-";
  return `${value.toFixed(1)}亿`;
}

function fmtPersonReturn(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  return fmtPct(value);
}

function personReturnClass(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return "neutral";
  return returnClass(value);
}

function renderSignalPill(signal) {
  const description = signalDescriptions[signal] || "暂无信号说明。";
  return `<span class="signal-pill ${signalClass[signal]}" title="${description}" aria-label="${signal}：${description}">${signal}</span>`;
}

function renderHelp(label, description) {
  return `<span class="help-label">${label} <button class="help-dot" type="button" data-help="${description}" title="${description}" aria-label="${label}说明">?</button></span>`;
}

function getThemeScore(theme) {
  return theme.us.strength[state.horizon] ?? theme.us.strength.all;
}

function getThemeSortValue(theme) {
  if (state.sortKey === "1d") return theme.us.returns["1d"];
  if (state.sortKey === "5d") return theme.us.returns["5d"];
  return getThemeScore(theme);
}

function getFilteredThemes() {
  const query = state.query.trim().toLowerCase();
  return data.themes
    .filter((theme) => {
      const signalOk = state.signal === "all" || theme.signal === state.signal;
      const queryText = [
        theme.name,
        theme.us.primary,
        ...theme.us.etfs,
        ...theme.tags,
        ...theme.cn.map((item) => `${item.code} ${item.name}`),
      ]
        .join(" ")
        .toLowerCase();
      return signalOk && (!query || queryText.includes(query));
    })
    .sort((a, b) => {
      const direction = state.sortDir === "asc" ? 1 : -1;
      const diff = (getThemeSortValue(a) ?? 0) - (getThemeSortValue(b) ?? 0);
      if (diff !== 0) return diff * direction;
      return getThemeScore(b) - getThemeScore(a);
    });
}

function getSelectedTheme(themes = data.themes) {
  return themes.find((theme) => theme.id === state.selectedId) || themes[0] || data.themes[0];
}

function getAllCnEtfs(theme) {
  if (theme) return theme.cn;
  const byCode = new Map();
  data.themes.forEach((item) => {
    item.cn.forEach((etf) => {
      const prev = byCode.get(etf.code);
      if (!prev || etf.mappingScore > prev.mappingScore) {
        byCode.set(etf.code, etf);
      }
    });
  });
  return [...byCode.values()].sort((a, b) => b.mappingScore - a.mappingScore);
}

function renderSummary(themes) {
  const total = data.themes.length;
  const sync = data.themes.filter((theme) => theme.signal === "共振").length;
  const lead = data.themes.filter((theme) => theme.signal === "传导").length;
  const diverge = data.themes.filter((theme) => theme.signal === "背离").length;
  const strongest = [...data.themes].sort((a, b) => getThemeScore(b) - getThemeScore(a))[0];
  const cnCount = new Set(data.themes.flatMap((theme) => theme.cn.map((item) => item.code))).size;

  $("#summary-grid").innerHTML = [
    { label: "美股主题", value: total, unit: "个", note: "主题ETF池", icon: "trend" },
    { label: "A股ETF", value: cnCount, unit: "只", note: "场内候选标的", icon: "fund" },
    { label: "共振", value: sync, unit: "组", note: "两边同向，优先观察", icon: "sync" },
    { label: "传导", value: lead, unit: "组", note: "美股先动，观察跟随", icon: "lead" },
    { label: "背离", value: diverge, unit: "组", note: "不同步，二次确认", icon: "warn" },
    {
      label: "当前最强",
      value: strongest.name,
      unit: "",
      note: `${strongest.us.primary} · ${getThemeScore(strongest)}分`,
      icon: "chip",
    },
  ]
    .map(
      (item) => `
        <article class="summary-card">
          <i class="summary-icon ${item.icon}" aria-hidden="true"></i>
          <div>
            <span>${item.label}</span>
            <strong>${item.value}<small>${item.unit}</small></strong>
            <em>${item.note}</em>
          </div>
        </article>
      `,
    )
    .join("");

  const sortText =
    state.sortKey === "strength"
      ? horizonLabels[state.horizon]
      : `${sortLabels[state.sortKey]}${state.sortDir === "desc" ? "从高到低" : "从低到高"}`;
  $("#rank-caption").textContent = `按${sortText}排序 · ${themes.length} 个主题`;
}

function renderSortButton(key, label) {
  const active = state.sortKey === key;
  const dirText = state.sortDir === "desc" ? "降序" : "升序";
  return `
    <button
      class="sort-head ${active ? "active" : ""}"
      data-sort-key="${key}"
      type="button"
      aria-label="按${label}${active ? dirText : "排序"}"
    >
      <span>${label}</span>
      <i aria-hidden="true">${active ? (state.sortDir === "desc" ? "↓" : "↑") : "↕"}</i>
    </button>
  `;
}

function renderThemeList(themes) {
  const selected = getSelectedTheme(themes);
  if (selected.id !== state.selectedId) state.selectedId = selected.id;

  $("#theme-list").innerHTML = `
    <div class="theme-list-head">
      <span aria-hidden="true"></span>
      <span>主题</span>
      <span>主ETF</span>
      <span>${renderHelp("强度", strengthDescription)}</span>
      <span>${renderSortButton("1d", "近1日")}</span>
      <span>${renderSortButton("5d", "近1周")}</span>
      <span>信号</span>
    </div>
    ${themes
    .map((theme, index) => {
      const score = getThemeScore(theme);
      const active = theme.id === state.selectedId ? "active" : "";
      const oneDayReturn = theme.us.returns["1d"];
      const oneWeekReturn = theme.us.returns["5d"];
      return `
        <button class="theme-row ${active}" data-theme-id="${theme.id}" type="button">
          <span class="rank">${String(index + 1).padStart(2, "0")}</span>
          <span class="theme-main">
            <strong>${theme.name}</strong>
            <small>${theme.us.etfs.join(" / ")}</small>
          </span>
          <span class="theme-primary">${theme.us.primary}</span>
          <span class="theme-metrics">
            <b>${score}</b>
            <i class="mini-bar" style="--value:${score}%"></i>
          </span>
          <span class="theme-return ${returnClass(oneDayReturn)}">
            ${fmtPct(oneDayReturn)}
          </span>
          <span class="theme-return ${returnClass(oneWeekReturn)}">
            ${fmtPct(oneWeekReturn)}
          </span>
          ${renderSignalPill(theme.signal)}
        </button>
      `;
    })
    .join("")}
  `;

  document.querySelectorAll(".theme-row").forEach((row) => {
    row.addEventListener("click", () => {
      state.selectedId = row.dataset.themeId;
      const theme = getSelectedTheme();
      trackEvent("theme_select", {
        theme_id: theme.id,
        theme_name: theme.name,
        us_primary: theme.us.primary,
        signal: theme.signal,
        horizon: state.horizon,
      });
      render();
    });
  });

  document.querySelectorAll("[data-sort-key]").forEach((button) => {
    button.addEventListener("click", () => {
      const sortKey = button.dataset.sortKey;
      if (state.sortKey === sortKey) {
        state.sortDir = state.sortDir === "desc" ? "asc" : "desc";
      } else {
        state.sortKey = sortKey;
        state.sortDir = "desc";
      }
      trackEvent("sort_change", {
        sort_key: state.sortKey,
        sort_dir: state.sortDir,
        horizon: state.horizon,
      });
      render();
    });
  });
}

function renderMetricStrip(theme) {
  const metrics = [
    ["1日", theme.us.returns["1d"]],
    ["5日", theme.us.returns["5d"]],
    ["20日", theme.us.returns["20d"]],
    ["60日", theme.us.returns["60d"]],
    ["120日", theme.us.returns["120d"]],
    ["年初至今", theme.us.returns.ytd],
  ];
  return `
    <div class="metric-strip">
      ${metrics
        .map(
          ([label, value]) => `
            <div class="metric-item">
              <span class="metric-period">${label}</span>
              <strong class="${returnClass(value)}">${fmtPct(value)}</strong>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderBars(theme) {
  const keys = [
    ["短期", "short"],
    ["中期", "mid"],
    ["长期", "long"],
    ["综合", "all"],
  ];
  return `
    <div class="score-bars">
      ${keys
        .map(
          ([label, key]) => `
            <div class="score-bar">
              <span>${label}</span>
              <div class="bar-track"><i style="width:${theme.us.strength[key]}%"></i></div>
              <b>${theme.us.strength[key]}</b>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderDetail(theme) {
  const bestCn = [...theme.cn].sort((a, b) => b.mappingScore - a.mappingScore)[0];
  $("#detail-view").innerHTML = `
    <div class="detail-header">
      <div>
        <h2>${theme.name}</h2>
        <p>${theme.lead}</p>
      </div>
      ${renderSignalPill(theme.signal)}
    </div>

    <div class="detail-layout">
      <div class="detail-main">
        <div class="us-card">
          <div>
            <p class="eyebrow">美股映射</p>
            <h3>${theme.us.primary}</h3>
            <span>${theme.us.etfs.join(" / ")}</span>
          </div>
          <div class="confidence">
            <span>置信度</span>
            <strong>${theme.confidence}</strong>
          </div>
        </div>

        ${renderMetricStrip(theme)}
        ${renderBars(theme)}

        <div class="signal-explain">
          <b>${theme.signal}说明</b>
          <span>${signalDescriptions[theme.signal]}</span>
        </div>

        <div class="tag-row" aria-label="主题标签">
          ${theme.tags.map((tag) => `<span>${tag}</span>`).join("")}
        </div>

        <div class="reason-grid">
          ${bestCn.reasons.map((reason) => `<span>${reason}</span>`).join("")}
        </div>
      </div>

      <aside class="detail-side">
        <div class="score-ring" style="--score:${getThemeScore(theme)}">
          <span>${renderHelp("美股强度", selectedStrengthDescription)}</span>
          <strong>${getThemeScore(theme)}</strong>
          <em>${horizonLabels[state.horizon]}</em>
        </div>
        <div class="mapping-focus">
          <p class="eyebrow">相关ETF</p>
          <h3>${bestCn.code}</h3>
          <strong>${bestCn.name}</strong>
          <span>${bestCn.index}</span>
          <div class="mapping-score">
            <span>映射分</span>
            <b>${bestCn.mappingScore}</b>
          </div>
        </div>
      </aside>
    </div>
  `;
}

function renderCnTable(theme) {
  const items = getAllCnEtfs(theme);
  $("#cn-etf-table").innerHTML = items
    .map(
      (item) => `
        <tr>
          <td>
            <span class="name-cell">${item.name}</span>
            <small>${item.index}</small>
          </td>
          <td><strong>${item.code}</strong></td>
          <td><span class="table-bar" style="--value:${item.mappingScore}%"><i></i><b>${item.mappingScore}</b></span></td>
          <td class="${returnClass(item.returns["1d"])}">${fmtPct(item.returns["1d"])}</td>
          <td class="${returnClass(item.returns["5d"])}">${fmtPct(item.returns["5d"])}</td>
          <td class="${returnClass(item.returns["20d"])}">${fmtPct(item.returns["20d"])}</td>
          <td class="${returnClass(item.returns["60d"])}">${fmtPct(item.returns["60d"])}</td>
          <td class="${returnClass(item.returns["120d"])}">${fmtPct(item.returns["120d"])}</td>
          <td>${fmtAmount(item.amount)}</td>
          <td>${renderSignalPill(item.status)}</td>
        </tr>
      `,
    )
    .join("");
}

function getSelectedPerson() {
  return peopleSnapshot.people.find((person) => person.id === state.personId) || peopleSnapshot.people[0];
}

function getPersonEvents(personId) {
  return peopleSnapshot.events
    .filter((event) => event.personId === personId)
    .sort((a, b) => b.firstMentionedAt.localeCompare(a.firstMentionedAt));
}

function getPersonDisclosureSources(personId) {
  return (peopleSnapshot.disclosureSources || []).filter((source) => source.personId === personId);
}

function getPersonPolicyLinks(personId) {
  return (peopleSnapshot.policyLinks || []).filter((link) => link.personId === personId);
}

function renderPersonTabs() {
  return `
    <nav class="people-tabs" aria-label="人物二级菜单">
      ${peopleSnapshot.people
        .map(
          (person) => `
            <button
              class="people-tab ${person.id === state.personId ? "active" : ""}"
              data-person-id="${person.id}"
              type="button"
            >
              <span>
                <strong>${person.name}</strong>
              </span>
            </button>
          `,
        )
        .join("")}
    </nav>
  `;
}

function renderPersonHero(person) {
  const events = getPersonEvents(person.id);
  const directCount = events.filter((event) => event.eventType === "直接点名").length;
  const highConfidenceCount = events.filter((event) => event.confidence === "高").length;
  const numericReturns = events
    .map((event) => event.returnSinceMention)
    .filter((value) => typeof value === "number");
  const bestReturn = numericReturns.length ? Math.max(...numericReturns) : null;
  const latestEvent = [...events].sort((a, b) => b.firstMentionedAt.localeCompare(a.firstMentionedAt))[0];
  const fallbackSrc = person.image.fallbackSrc || "";
  return `
    <section class="person-hero">
      <figure class="person-photo-card image-loading">
        <img
          data-person-image
          data-person-image-id="${person.id}"
          data-person-fallback-src="${fallbackSrc}"
          src="${person.image.src}"
          alt="${person.image.alt}"
          loading="eager"
          decoding="async"
          fetchpriority="high"
        />
        <figcaption>
          <span>${person.englishName}</span>
          <strong>${person.name}</strong>
          <small>${person.image.credit}</small>
        </figcaption>
        <div class="person-photo-fallback" aria-hidden="true">
          <span>${person.name}</span>
          <small>真实图片加载失败</small>
        </div>
      </figure>
      <div class="person-hero-main">
        <h2>${person.title}</h2>
        <p>${person.subtitle}</p>
        <div class="person-metrics" aria-label="${person.name}摘要指标">
          <article>
            <span>记录事件</span>
            <strong>${events.length}</strong>
          </article>
          <article>
            <span>直接点名公司</span>
            <strong>${directCount}</strong>
          </article>
          <article>
            <span>最高喊单以来</span>
            <strong class="${bestReturn === null ? "neutral" : returnClass(bestReturn)}">
              ${bestReturn === null ? "观察中" : fmtPct(bestReturn)}
            </strong>
          </article>
          <article>
            <span>高可信来源</span>
            <strong>${highConfidenceCount}</strong>
          </article>
          <article>
            <span>最近事件</span>
            <strong>${latestEvent?.firstMentionedAt || "-"}</strong>
          </article>
        </div>
      </div>
    </section>
  `;
}

function renderPersonViewTabs(person) {
  const counts = {
    voice: getPersonEvents(person.id).length,
    disclosure: getPersonDisclosureSources(person.id).length,
    policy: getPersonPolicyLinks(person.id).length,
  };
  return `
    <nav class="person-view-tabs" aria-label="${person.name}数据视图">
      ${Object.entries(personViewLabels)
        .map(
          ([key, label]) => `
            <button
              class="person-view-tab ${state.personView === key ? "active" : ""}"
              data-person-view="${key}"
              type="button"
            >
              <span>${label}</span>
              <b>${counts[key]}</b>
            </button>
          `,
        )
        .join("")}
    </nav>
  `;
}

function renderEvidenceChain() {
  const steps = [
    ["1", "人物动作", "发声 / 披露 / 政策"],
    ["2", "证据来源", "新闻 / OGE / 官方文件"],
    ["3", "上市主体", "ticker 与公司核验"],
    ["4", "行情计算", "日线收盘价回测"],
  ];
  return `
    <section class="evidence-chain" aria-label="证据链">
      ${steps
        .map(
          ([index, title, detail]) => `
            <article>
              <b>${index}</b>
              <span>${title}</span>
              <small>${detail}</small>
            </article>
          `,
        )
        .join("")}
    </section>
  `;
}

function renderPersonLedger(person) {
  const events = getPersonEvents(person.id);
  if (!events.length) {
    return `
      <section class="person-ledger">
        <div class="panel-heading">
          <div>
            <h2>${person.name}概念</h2>
            <p>暂无已核验事件。</p>
          </div>
        </div>
        <div class="empty-state">暂无已核验事件。</div>
      </section>
    `;
  }

  return `
    <section class="person-ledger" aria-label="${person.name}喊单公司列表">
      <div class="panel-heading">
        <div>
          <h2>${person.name}概念</h2>
          <p>点击会议/场景或信息来源回看原始证据</p>
        </div>
      </div>
      <div class="table-wrap">
        <table class="person-table">
          <colgroup>
            <col class="person-col-company" />
            <col class="person-col-ticker" />
            <col class="person-col-date" />
            <col class="person-col-since" />
            <col class="person-col-first-day" />
            <col class="person-col-location" />
            <col class="person-col-event" />
            <col class="person-col-type" />
            <col class="person-col-source" />
            <col class="person-col-confidence" />
          </colgroup>
          <thead>
            <tr>
              <th>喊单公司</th>
              <th>股票代码</th>
              <th>首次喊单时间</th>
              <th>喊单以来涨跌幅</th>
              <th>首日涨跌幅</th>
              <th>地点</th>
              <th>会议/场景</th>
              <th>事件类型</th>
              <th>信息来源</th>
              <th>可信度</th>
            </tr>
          </thead>
          <tbody>
            ${events
              .map(
                (event) => `
                  <tr>
                    <td>
                      <span class="name-cell">${event.company}</span>
                    </td>
                    <td><strong>${event.ticker}</strong></td>
                    <td>${event.firstMentionedAt}</td>
                    <td
                      class="${personReturnClass(event.returnSinceMention)}"
                      title="${event.priceBasis ? `起算 ${event.priceBasis.basisDate} 收盘 ${event.priceBasis.basisClose}，最新 ${event.priceBasis.latestDate} 收盘 ${event.priceBasis.latestClose}` : ""}"
                    >
                      ${fmtPersonReturn(event.returnSinceMention)}
                    </td>
                    <td
                      class="${personReturnClass(event.firstDayReturn)}"
                      title="${event.priceBasis ? `前收 ${event.priceBasis.previousDate} ${event.priceBasis.previousClose}，起算日 ${event.priceBasis.basisDate} ${event.priceBasis.basisClose}` : ""}"
                    >
                      ${fmtPersonReturn(event.firstDayReturn)}
                    </td>
                    <td>${event.location}</td>
                    <td>
                      <a class="event-link" href="${event.sourceUrl}" target="_blank" rel="noreferrer">
                        ${event.event}
                      </a>
                    </td>
                    <td><span class="event-type">${event.eventType}</span></td>
                    <td>
                      <a class="source-link" href="${event.sourceUrl}" target="_blank" rel="noreferrer">
                        ${event.sourceName}
                      </a>
                    </td>
                    <td><span class="confidence-label ${event.confidence === "高" ? "high" : event.confidence === "中" ? "mid" : "low"}">${event.confidence}</span></td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderDisclosureView(person) {
  const sources = getPersonDisclosureSources(person.id);
  if (!sources.length) {
    return `
      <section class="person-ledger">
        <div class="panel-heading">
          <div>
            <h2>${person.name}披露交易</h2>
            <p>当前人物暂无可接入的 OGE/政府披露交易源，先保留发声影响和政策关联。</p>
          </div>
        </div>
        <div class="empty-state">暂无披露交易源。</div>
      </section>
    `;
  }

  return `
    <section class="person-ledger disclosure-panel" aria-label="${person.name}披露交易源">
      <div class="panel-heading">
        <div>
          <h2>${person.name}披露交易</h2>
          <p>先接入权威披露源和聚合站，交易明细通过审核后再进入正式表格。</p>
        </div>
      </div>
      <div class="disclosure-grid">
        ${sources
          .map(
            (source) => `
              <article class="disclosure-card">
                <div>
                  <span class="source-status">${source.status}</span>
                  <h3>${source.name}</h3>
                  <p>${source.scope}</p>
                </div>
                <strong>${source.coverage}</strong>
                <small>${source.cadence}</small>
                <div class="field-list">
                  ${source.fields.map((field) => `<span>${field}</span>`).join("")}
                </div>
                <a class="source-link" href="${source.url}" target="_blank" rel="noreferrer">查看来源</a>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderPolicyView(person) {
  const links = getPersonPolicyLinks(person.id);
  if (!links.length) {
    return `
      <section class="person-ledger">
        <div class="panel-heading">
          <div>
            <h2>${person.name}政策关联</h2>
            <p>暂无已核验政策关联。</p>
          </div>
        </div>
        <div class="empty-state">暂无政策关联。</div>
      </section>
    `;
  }

  return `
    <section class="person-ledger policy-panel" aria-label="${person.name}政策关联">
      <div class="panel-heading">
        <div>
          <h2>${person.name}政策关联</h2>
          <p>把发声、披露和政策主题合并观察，定位可能反复出现的公司线索。</p>
        </div>
      </div>
      <div class="policy-grid">
        ${links
          .map(
            (link) => `
              <article class="policy-card">
                <div>
                  <span>${link.status}</span>
                  <h3>${link.theme}</h3>
                </div>
                <p>${link.evidence}</p>
                <strong>${link.relation}</strong>
                <div class="ticker-list">
                  ${link.tickers.map((ticker) => `<b>${ticker}</b>`).join("")}
                </div>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderPersonActiveView(person) {
  if (state.personView === "disclosure") return renderDisclosureView(person);
  if (state.personView === "policy") return renderPolicyView(person);
  return renderPersonLedger(person);
}

function handlePersonImageError(event) {
  const image = event.target;
  const fallbackSrc = image.dataset.personFallbackSrc;
  if (fallbackSrc && image.dataset.fallbackTried !== "true") {
    image.dataset.fallbackTried = "true";
    trackEvent("person_image_fallback", {
      person_id: image.dataset.personImageId || state.personId,
      image_src: image.getAttribute("src"),
      fallback_src: fallbackSrc,
    });
    image.src = fallbackSrc;
    return;
  }
  const card = event.target.closest(".person-photo-card");
  if (!card) return;
  card.classList.remove("image-loading", "image-ready");
  card.classList.add("image-failed");
  trackEvent("person_image_failed", {
    person_id: image.dataset.personImageId || state.personId,
    image_src: image.currentSrc || image.src,
  });
}

function handlePersonImageLoad(event) {
  const card = event.target.closest(".person-photo-card");
  if (!card) return;
  card.classList.remove("image-loading", "image-failed");
  card.classList.add("image-ready");
  const personId = event.target.dataset.personImageId || state.personId;
  const imageSrc = event.target.currentSrc || event.target.src;
  const analyticsKey = `${personId}:${imageSrc}`;
  if (trackedPersonImageLoads.has(analyticsKey)) return;
  trackedPersonImageLoads.add(analyticsKey);
  trackEvent("person_image_loaded", {
    person_id: personId,
    image_src: imageSrc,
    fallback_used: event.target.dataset.fallbackTried === "true",
  });
}

function renderPeopleSection() {
  const section = $(".people-section");
  if (!section) return;
  const person = getSelectedPerson();
  section.innerHTML = `
    <div class="people-intro">
      <h2>从影响力人物发声中发现市场信号</h2>
      <p>从人物进入，查看他的公开发声、披露交易、政策关联、信息来源与市场表现。</p>
    </div>
    ${renderPersonTabs()}
    ${renderPersonHero(person)}
    ${renderEvidenceChain()}
    ${renderPersonViewTabs(person)}
    ${renderPersonActiveView(person)}
    <p class="people-disclaimer">
      本页面仅记录公开信息与市场反应，不构成投资建议。发声影响按日线收盘价计算；披露交易源进入审核后再入正式明细。
    </p>
  `;
  bindPeopleEvents();
}

function bindPeopleEvents() {
  document.querySelectorAll("[data-person-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.personId = button.dataset.personId;
      trackEvent("person_tab_change", {
        person_id: state.personId,
      });
      trackSectionView("person_tab_change");
      renderPeopleSection();
    });
  });

  document.querySelectorAll("[data-person-view]").forEach((button) => {
    button.addEventListener("click", () => {
      state.personView = button.dataset.personView;
      trackEvent("person_view_change", {
        person_id: state.personId,
        person_view: state.personView,
      });
      trackSectionView("person_view_change");
      renderPeopleSection();
    });
  });

  document.querySelectorAll("[data-person-image]").forEach((image) => {
    if (image.complete && !image.naturalWidth) {
      handlePersonImageError({ target: image });
      return;
    }
    if (image.complete && image.naturalWidth) {
      handlePersonImageLoad({ target: image });
    }
    image.addEventListener("error", handlePersonImageError);
    image.addEventListener("load", handlePersonImageLoad);
  });
}

function renderPageTabs() {
  document.querySelectorAll("[data-page-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.pageTab === state.pageTab);
  });
  document.querySelectorAll("[data-page-panel]").forEach((panel) => {
    panel.classList.toggle("hidden", panel.dataset.pagePanel !== state.pageTab);
  });
}

function renderWorkspaceState() {
  const workspace = $(".workspace");
  if (!workspace) return;
  workspace.classList.toggle("list-collapsed", state.listCollapsed);
  workspace.classList.toggle("detail-collapsed", state.detailCollapsed);

  document.querySelectorAll("[data-collapse-panel='list']").forEach((button) => {
    const label = state.listCollapsed ? "显示榜单" : "隐藏榜单";
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
    button.dataset.tooltip = label;
  });

  document.querySelectorAll("[data-collapse-panel='detail']").forEach((button) => {
    const label = state.detailCollapsed ? "显示详情" : "隐藏详情";
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
    button.dataset.tooltip = label;
  });
}

function renderEmpty() {
  $("#theme-list").innerHTML = `<div class="empty-state">没有匹配主题，换个关键词试试。</div>`;
  $("#detail-view").innerHTML = `<div class="empty-state">暂无可展示映射。</div>`;
  $("#cn-etf-table").innerHTML = "";
}

function render() {
  const themes = getFilteredThemes();
  $("#update-time").textContent = `更新 ${data.updatedAt.replace("T", " ").slice(0, 16)}`;
  renderSummary(themes);
  renderPeopleSection();
  renderPageTabs();
  renderWorkspaceState();

  if (!themes.length) {
    renderEmpty();
    return;
  }

  renderThemeList(themes);
  const selected = getSelectedTheme(themes);
  renderDetail(selected);
  renderCnTable(selected);
}

function bindEvents() {
  document.querySelectorAll("[data-page-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.pageTab = button.dataset.pageTab;
      trackEvent("page_tab_change", {
        page_tab: state.pageTab,
      });
      renderPageTabs();
      trackSectionView("page_tab_change");
    });
  });

  document.querySelectorAll("[data-horizon]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-horizon]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      state.horizon = button.dataset.horizon;
      trackEvent("horizon_change", {
        horizon: state.horizon,
      });
      render();
    });
  });

  document.querySelectorAll("[data-signal]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-signal]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      state.signal = button.dataset.signal;
      trackEvent("signal_filter", {
        signal: state.signal,
      });
      render();
    });
  });

  $("#theme-search").addEventListener("input", (event) => {
    state.query = event.target.value;
    render();
    window.clearTimeout(searchTrackTimer);
    const searchTerm = state.query.trim();
    if (!searchTerm) return;
    searchTrackTimer = window.setTimeout(() => {
      trackEvent("search", {
        search_term: searchTerm,
        result_count: getFilteredThemes().length,
      });
    }, 700);
  });

  $("#reset-view").addEventListener("click", () => {
    state.horizon = "short";
    state.signal = "all";
    state.query = "";
    state.sortKey = "strength";
    state.sortDir = "desc";
    state.selectedId = data.themes[0].id;
    $("#theme-search").value = "";
    document.querySelectorAll("[data-horizon]").forEach((item) => {
      item.classList.toggle("active", item.dataset.horizon === "short");
    });
    document.querySelectorAll("[data-signal]").forEach((item) => {
      item.classList.toggle("active", item.dataset.signal === "all");
    });
    trackEvent("reset_view", {
      horizon: state.horizon,
      signal: state.signal,
    });
    render();
  });

  document.querySelectorAll("[data-collapse-panel]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.collapsePanel;
      if (target === "list") {
        state.listCollapsed = !state.listCollapsed;
        if (state.listCollapsed && state.detailCollapsed) state.detailCollapsed = false;
      }
      if (target === "detail") {
        state.detailCollapsed = !state.detailCollapsed;
        if (state.detailCollapsed && state.listCollapsed) state.listCollapsed = false;
      }
      trackEvent("panel_toggle", {
        panel: target,
        list_collapsed: state.listCollapsed,
        detail_collapsed: state.detailCollapsed,
      });
      renderWorkspaceState();
    });
  });

  document.addEventListener("click", (event) => {
    const sourceAnchor = event.target.closest("a.event-link, a.source-link");
    if (sourceAnchor) {
      const person = getSelectedPerson();
      trackEvent("source_click", {
        section: state.pageTab,
        person_id: person?.id || "",
        person_name: person?.name || "",
        person_view: state.personView,
        link_type: sourceAnchor.classList.contains("event-link") ? "event" : "source",
        link_text: sourceAnchor.textContent.trim(),
        link_url: sourceAnchor.href,
      });
    }

    const helpButton = event.target.closest(".help-dot");
    const existing = $(".help-popover");

    if (helpButton) {
      event.stopPropagation();
      if (existing && existing.dataset.owner === helpButton.dataset.help) {
        existing.remove();
        return;
      }
      existing?.remove();
      const popover = document.createElement("div");
      const rect = helpButton.getBoundingClientRect();
      popover.className = "help-popover";
      popover.dataset.owner = helpButton.dataset.help;
      popover.textContent = helpButton.dataset.help || helpButton.title || "暂无说明。";
      document.body.appendChild(popover);
      const left = Math.min(rect.left + window.scrollX, window.scrollX + window.innerWidth - popover.offsetWidth - 14);
      popover.style.left = `${Math.max(14, left)}px`;
      popover.style.top = `${rect.bottom + window.scrollY + 8}px`;
      return;
    }

    existing?.remove();
  });
}

async function loadLatestData() {
  try {
    const response = await fetch("./data/latest.json", { cache: "no-store" });
    if (!response.ok) return;
    const latest = await response.json();
    if (latest?.themes?.length) {
      data = latest;
      state.selectedId = latest.themes[0].id;
    }
  } catch {
    data = sampleData;
  }
}

function isValidPeopleSnapshot(snapshot) {
  if (!snapshot?.people?.length || !snapshot?.events?.length) return false;
  const peopleIds = new Set(snapshot.people.map((person) => person.id));
  return snapshot.events.every((event) => {
    return (
      peopleIds.has(event.personId) &&
      event.company &&
      event.ticker &&
      /^https?:\/\//.test(event.sourceUrl || "") &&
      typeof event.returnSinceMention === "number" &&
      typeof event.firstDayReturn === "number" &&
      event.priceBasis?.basisDate &&
      typeof event.priceBasis.basisClose === "number" &&
      event.priceBasis.latestDate &&
      typeof event.priceBasis.latestClose === "number"
    );
  });
}

async function loadLatestPeopleData() {
  try {
    const response = await fetch("./data/people-latest.json", { cache: "no-store" });
    if (!response.ok) return;
    const latest = await response.json();
    if (isValidPeopleSnapshot(latest)) {
      peopleSnapshot = latest;
      if (!peopleSnapshot.people.some((person) => person.id === state.personId)) {
        state.personId = peopleSnapshot.people[0].id;
      }
    }
  } catch {
    peopleSnapshot = peopleData;
  }
}

bindEvents();
applyInitialRoute();
await loadLatestData();
await loadLatestPeopleData();
render();
trackSectionView("initial_load");
