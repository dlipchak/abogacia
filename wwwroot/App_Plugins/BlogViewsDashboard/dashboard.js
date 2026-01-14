import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { LitElement, html, css } from "@umbraco-cms/backoffice/external/lit";

export default class BlogViewsDashboard extends UmbElementMixin(LitElement) {
  static properties = {
    loading: { type: Boolean },
    error: { type: String },
    entries: { type: Array },
    sortedEntries: { type: Array },
    totalEntries: { type: Number },
    totalViews: { type: Number },
    averageViews: { type: Number },
    categoryStats: { type: Array },
    sortColumn: { type: String },
    sortDirection: { type: String },
    expandedRows: { type: Object },
  };

  static styles = css`
    :host {
      display: block;
      padding: 20px;
    }

    .dashboard-header {
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--uui-color-border);
    }

    .dashboard-header h1 {
      margin: 0 0 10px 0;
      font-size: 24px;
      font-weight: 600;
    }

    .dashboard-description {
      color: var(--uui-color-text-alt);
      margin: 0;
    }

    .loading-container {
      text-align: center;
      padding: 40px;
    }

    .dashboard-stats {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
    }

    .stat-box {
      flex: 1;
      background: var(--uui-color-surface-alt);
      border: 1px solid var(--uui-color-border);
      border-radius: 6px;
      padding: 20px;
      text-align: center;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 600;
      color: var(--uui-color-interactive);
      margin-bottom: 5px;
    }

    .stat-label {
      color: var(--uui-color-text-alt);
      font-size: 14px;
    }

    /* Category stats section */
    .category-stats-section {
      margin-bottom: 30px;
    }

    .category-stats-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--uui-color-text-alt);
      margin-bottom: 12px;
    }

    .category-stats-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .category-stat-item {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--uui-color-surface);
      border: 1px solid var(--uui-color-border);
      border-radius: 6px;
      padding: 10px 15px;
      min-width: 200px;
    }

    .category-stat-name {
      color: white;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .category-stat-name.cat-0 {
      background: #3b82f6;
    }
    .category-stat-name.cat-1 {
      background: #8b5cf6;
    }
    .category-stat-name.cat-2 {
      background: #ec4899;
    }
    .category-stat-name.cat-3 {
      background: #f97316;
    }
    .category-stat-name.cat-4 {
      background: #14b8a6;
    }
    .category-stat-name.cat-5 {
      background: #6366f1;
    }
    .category-stat-name.cat-6 {
      background: #84cc16;
    }
    .category-stat-name.cat-7 {
      background: #f43f5e;
    }

    .category-stat-values {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .category-stat-avg {
      font-weight: 600;
      color: var(--uui-color-interactive);
      font-size: 16px;
    }

    .category-stat-count {
      font-size: 11px;
      color: var(--uui-color-text-alt);
    }

    .table-container {
      background: var(--uui-color-surface);
      border: 1px solid var(--uui-color-border);
      border-radius: 6px;
      overflow-x: auto;
      overflow-y: visible;
    }

    table {
      width: 100%;
      min-width: 900px;
      border-collapse: collapse;
      table-layout: fixed;
    }

    thead {
      background: var(--uui-color-surface-alt);
    }

    th {
      padding: 12px 15px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid var(--uui-color-border);
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
      position: relative;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    th:hover {
      background: var(--uui-color-surface-emphasis);
    }

    th.sortable {
      position: relative;
      padding-right: 25px;
    }

    th .sort-icon {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      opacity: 0.3;
      font-size: 12px;
    }

    /* Column resizer */
    th .resizer {
      position: absolute;
      right: 0;
      top: 0;
      height: 100%;
      width: 5px;
      background: transparent;
      cursor: col-resize;
      user-select: none;
      touch-action: none;
    }

    th .resizer:hover,
    th .resizer.resizing {
      background: var(--uui-color-interactive);
    }

    td {
      overflow: hidden;
      text-overflow: ellipsis;
    }

    th.sorted .sort-icon {
      opacity: 1;
    }

    th.sorted-asc .sort-icon::after {
      content: "▲";
    }

    th.sorted-desc .sort-icon::after {
      content: "▼";
    }

    th:not(.sorted) .sort-icon::after {
      content: "⇅";
    }

    th.no-sort {
      cursor: default;
    }

    th.no-sort:hover {
      background: var(--uui-color-surface-alt);
    }

    td {
      padding: 12px 15px;
      border-bottom: 1px solid var(--uui-color-border);
    }

    tbody tr.article-row {
      cursor: pointer;
      transition: background 0.15s;
    }

    tbody tr.article-row:hover {
      background: var(--uui-color-surface-alt);
    }

    tbody tr.article-row.expanded {
      background: var(--uui-color-surface-emphasis);
    }

    .view-count-badge {
      display: inline-block;
      background: var(--uui-color-interactive);
      color: var(--uui-color-surface);
      padding: 4px 12px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 13px;
    }

    .category-badge {
      display: inline-block;
      color: white;
      padding: 3px 10px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .category-badge.cat-0 {
      background: #3b82f6;
    }
    .category-badge.cat-1 {
      background: #8b5cf6;
    }
    .category-badge.cat-2 {
      background: #ec4899;
    }
    .category-badge.cat-3 {
      background: #f97316;
    }
    .category-badge.cat-4 {
      background: #14b8a6;
    }
    .category-badge.cat-5 {
      background: #6366f1;
    }
    .category-badge.cat-6 {
      background: #84cc16;
    }
    .category-badge.cat-7 {
      background: #f43f5e;
    }

    .comment-count-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: var(--uui-color-surface-alt);
      border: 1px solid var(--uui-color-border);
      color: var(--uui-color-text);
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 12px;
    }

    .comment-count-badge.has-comments {
      background: #3b82f6;
      border-color: #3b82f6;
      color: white;
    }

    .text-center {
      text-align: center;
    }

    .error-message {
      padding: 20px;
      background: var(--uui-color-danger);
      color: white;
      border-radius: 6px;
      margin-bottom: 20px;
    }

    .no-data {
      padding: 40px;
      text-align: center;
      color: var(--uui-color-text-alt);
    }

    .sort-hint {
      font-size: 12px;
      color: var(--uui-color-text-alt);
      margin-bottom: 10px;
    }

    .expand-icon {
      display: inline-block;
      width: 20px;
      transition: transform 0.2s;
    }

    .expand-icon.expanded {
      transform: rotate(90deg);
    }

    /* Article title with edit link */
    .article-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .article-title strong {
      flex: 1;
    }

    .action-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      text-decoration: none;
      font-size: 16px;
      opacity: 0.6;
      transition: opacity 0.15s, transform 0.15s;
    }

    .action-link:hover {
      opacity: 1;
      transform: scale(1.2);
    }

    /* Comments sub-rows */
    tr.comments-row {
      background: var(--uui-color-surface-alt);
    }

    tr.comments-row td {
      padding: 0;
      border-bottom: 2px solid var(--uui-color-border);
    }

    .comments-container {
      padding: 15px 15px 15px 50px;
    }

    .comments-header {
      font-weight: 600;
      margin-bottom: 10px;
      color: var(--uui-color-text-alt);
      font-size: 13px;
    }

    .comment-item {
      background: var(--uui-color-surface);
      border: 1px solid var(--uui-color-border);
      border-radius: 6px;
      padding: 12px 15px;
      margin-bottom: 10px;
    }

    .comment-item:last-child {
      margin-bottom: 0;
    }

    .comment-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
      flex-wrap: wrap;
      gap: 8px;
    }

    .comment-author-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .comment-author {
      font-weight: 600;
      color: var(--uui-color-interactive);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .comment-email {
      font-size: 12px;
      color: var(--uui-color-text-alt);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .comment-email a {
      color: var(--uui-color-interactive);
      text-decoration: none;
    }

    .comment-email a:hover {
      text-decoration: underline;
    }

    .comment-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }

    .comment-date {
      font-size: 12px;
      color: var(--uui-color-text-alt);
    }

    .comment-id {
      font-size: 10px;
      color: var(--uui-color-text-alt);
      font-family: monospace;
    }

    .comment-edit-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: var(--uui-color-interactive);
      text-decoration: none;
      padding: 2px 8px;
      background: var(--uui-color-surface-alt);
      border-radius: 4px;
    }

    .comment-edit-link:hover {
      background: var(--uui-color-interactive);
      color: white;
    }

    .comment-text {
      color: var(--uui-color-text);
      line-height: 1.5;
      padding: 10px;
      background: var(--uui-color-surface-alt);
      border-radius: 4px;
      white-space: pre-wrap;
    }

    .no-comments {
      color: var(--uui-color-text-alt);
      font-style: italic;
      padding: 10px 0;
    }

    .published-badge {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 3px;
      background: #22c55e;
      color: white;
    }

    .unpublished-badge {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 3px;
      background: #ef4444;
      color: white;
    }

    .comment-item.unpublished {
      border-color: #ef4444;
      background: #fef2f2;
    }
  `;

  constructor() {
    super();
    this.loading = true;
    this.error = null;
    this.entries = [];
    this.sortedEntries = [];
    this.totalEntries = 0;
    this.totalViews = 0;
    this.averageViews = 0;
    this.categoryStats = [];
    this.sortColumn = "viewCount";
    this.sortDirection = "desc";
    this.expandedRows = {};
  }

  connectedCallback() {
    super.connectedCallback();
    this.loadData();
  }

  async loadData() {
    this.loading = true;
    this.error = null;

    try {
      const response = await fetch(
        "/umbraco/api/BlogViewsReport/GetBlogEntries"
      );
      const data = await response.json();

      if (data.success) {
        this.entries = data.data || [];
        this.totalEntries = this.entries.length;
        this.totalViews = this.entries.reduce(
          (sum, entry) => sum + (entry.viewCount || 0),
          0
        );
        this.averageViews =
          this.totalEntries > 0 ? this.totalViews / this.totalEntries : 0;
        this.calculateCategoryStats();
        this.sortEntries();
      } else {
        this.error = data.message || "Error al cargar los datos";
      }
    } catch (err) {
      this.error = err.message || "Error al cargar los datos";
      console.error("Error loading blog entries:", err);
    } finally {
      this.loading = false;
    }
  }

  calculateCategoryStats() {
    const categoryMap = {};

    this.entries.forEach((entry) => {
      const category = entry.category || "Sin categoría";
      if (!categoryMap[category]) {
        categoryMap[category] = {
          name: category,
          totalViews: 0,
          count: 0,
        };
      }
      categoryMap[category].totalViews += entry.viewCount || 0;
      categoryMap[category].count += 1;
    });

    this.categoryStats = Object.values(categoryMap)
      .map((cat) => ({
        name: cat.name,
        averageViews: cat.count > 0 ? cat.totalViews / cat.count : 0,
        totalViews: cat.totalViews,
        count: cat.count,
      }))
      .sort((a, b) => b.averageViews - a.averageViews);
  }

  sortEntries() {
    const sorted = [...this.entries].sort((a, b) => {
      let valA = a[this.sortColumn];
      let valB = b[this.sortColumn];

      if (valA == null) valA = "";
      if (valB == null) valB = "";

      if (
        this.sortColumn === "createDate" ||
        this.sortColumn === "updateDate"
      ) {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      let comparison = 0;
      if (valA < valB) comparison = -1;
      else if (valA > valB) comparison = 1;

      return this.sortDirection === "asc" ? comparison : -comparison;
    });

    this.sortedEntries = sorted;
  }

  handleSort(column) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
    } else {
      this.sortColumn = column;
      this.sortDirection =
        column === "viewCount" ||
        column === "commentCount" ||
        column === "createDate" ||
        column === "updateDate"
          ? "desc"
          : "asc";
    }
    this.sortEntries();
  }

  handleHeaderClick(e, column) {
    // Don't sort if clicking on resizer
    if (e.target.classList.contains("resizer")) return;
    this.handleSort(column);
  }

  initResize(e) {
    e.stopPropagation();
    const th = e.target.parentElement;
    const startX = e.pageX;
    const startWidth = th.offsetWidth;

    const resizer = e.target;
    resizer.classList.add("resizing");

    const doResize = (e) => {
      const width = startWidth + (e.pageX - startX);
      if (width >= 50) {
        th.style.width = width + "px";
      }
    };

    const stopResize = () => {
      resizer.classList.remove("resizing");
      document.removeEventListener("mousemove", doResize);
      document.removeEventListener("mouseup", stopResize);
    };

    document.addEventListener("mousemove", doResize);
    document.addEventListener("mouseup", stopResize);
  }

  toggleRow(id, event) {
    // Don't toggle if clicking on the edit link
    if (event.target.closest(".edit-link")) return;

    this.expandedRows = {
      ...this.expandedRows,
      [id]: !this.expandedRows[id],
    };
  }

  getSortClass(column) {
    if (this.sortColumn !== column) return "sortable";
    return `sortable sorted sorted-${this.sortDirection}`;
  }

  formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  getEditUrl(key) {
    return `/umbraco/section/content/workspace/document/edit/${key}/invariant/view/content`;
  }

  getCategoryColorClass(category) {
    if (!category) return "cat-0";
    // Create a simple hash from category name to get consistent color
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = (hash << 5) - hash + category.charCodeAt(i);
      hash = hash & hash;
    }
    return `cat-${Math.abs(hash) % 8}`;
  }

  renderCommentRow(entry) {
    if (!this.expandedRows[entry.id]) return null;

    return html`
      <tr class="comments-row">
        <td colspan="7">
          <div class="comments-container">
            <div class="comments-header">
              💬 Comentarios (${entry.commentCount})
            </div>
            ${entry.comments && entry.comments.length > 0
              ? entry.comments.map(
                  (comment) => html`
                    <div
                      class="comment-item ${comment.isPublished
                        ? ""
                        : "unpublished"}"
                    >
                      <div class="comment-header">
                        <div class="comment-author-info">
                          <span class="comment-author">
                            👤 ${comment.userName}
                            ${comment.isPublished
                              ? html`
                                  <span class="published-badge"
                                    >✓ Publicado</span
                                  >
                                `
                              : html`
                                  <span class="unpublished-badge"
                                    >📝 No publicado</span
                                  >
                                `}
                          </span>
                          <span class="comment-email">
                            ✉️
                            <a href="mailto:${comment.email}"
                              >${comment.email || "Sin email"}</a
                            >
                          </span>
                        </div>
                        <div class="comment-meta">
                          <span class="comment-date"
                            >📅 ${this.formatDate(comment.createDate)}</span
                          >
                          <span class="comment-id">ID: ${comment.id}</span>
                          <a
                            href="${this.getEditUrl(comment.key)}"
                            class="comment-edit-link"
                            @click="${(e) => e.stopPropagation()}"
                          >
                            ✏️ Editar
                          </a>
                        </div>
                      </div>
                      <div class="comment-text">${comment.userComment}</div>
                    </div>
                  `
                )
              : html`
                  <div class="no-comments">
                    Este artículo no tiene comentarios.
                  </div>
                `}
          </div>
        </td>
      </tr>
    `;
  }

  renderCategoryStats() {
    if (this.categoryStats.length === 0) return null;

    return html`
      <div class="category-stats-section">
        <div class="category-stats-title">
          📈 Promedio de Vistas por Categoría
        </div>
        <div class="category-stats-grid">
          ${this.categoryStats.map(
            (cat) => html`
              <div class="category-stat-item">
                <span
                  class="category-stat-name ${this.getCategoryColorClass(
                    cat.name
                  )}"
                  >${cat.name}</span
                >
                <div class="category-stat-values">
                  <span class="category-stat-avg"
                    >${cat.averageViews.toFixed(1)} vistas</span
                  >
                  <span class="category-stat-count"
                    >${cat.count} artículo${cat.count !== 1 ? "s" : ""} •
                    ${cat.totalViews} total</span
                  >
                </div>
              </div>
            `
          )}
        </div>
      </div>
    `;
  }

  render() {
    return html`
      <div class="dashboard-header">
        <h1>📊 Reporte de Vistas de Artículos</h1>
        <p class="dashboard-description">
          Lista de todos los artículos del blog ordenados por número de vistas.
          Haz clic en una fila para ver los comentarios.
        </p>
      </div>

      ${this.loading
        ? html`
            <div class="loading-container">
              <uui-loader></uui-loader>
              <p>Cargando datos...</p>
            </div>
          `
        : this.error
        ? html`
            <div class="error-message">
              <strong>Error:</strong> ${this.error}
            </div>
          `
        : this.entries.length === 0
        ? html`
            <div class="no-data">No se encontraron artículos.</div>
          `
        : html`
            <div class="dashboard-stats">
              <div class="stat-box">
                <div class="stat-value">${this.totalEntries}</div>
                <div class="stat-label">Total de Artículos</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${this.totalViews}</div>
                <div class="stat-label">Total de Vistas</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${this.averageViews.toFixed(1)}</div>
                <div class="stat-label">Promedio de Vistas</div>
              </div>
            </div>

            ${this.renderCategoryStats()}

            <p class="sort-hint">
              💡 Haz clic en los encabezados para ordenar • Haz clic en una fila
              para ver comentarios • 🔗 ver en sitio • ✏️ editar
            </p>

            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th
                      class="no-sort"
                      style="width: 40px; min-width: 40px;"
                    ></th>
                    <th
                      class="${this.getSortClass("name")}"
                      style="width: 250px;"
                      @click="${(e) => this.handleHeaderClick(e, "name")}"
                    >
                      Título <span class="sort-icon"></span>
                      <div
                        class="resizer"
                        @mousedown="${(e) => this.initResize(e)}"
                      ></div>
                    </th>
                    <th
                      class="${this.getSortClass("category")}"
                      style="width: 150px;"
                      @click="${(e) => this.handleHeaderClick(e, "category")}"
                    >
                      Categoría <span class="sort-icon"></span>
                      <div
                        class="resizer"
                        @mousedown="${(e) => this.initResize(e)}"
                      ></div>
                    </th>
                    <th
                      class="${this.getSortClass("viewCount")} text-center"
                      style="width: 100px;"
                      @click="${(e) => this.handleHeaderClick(e, "viewCount")}"
                    >
                      Vistas <span class="sort-icon"></span>
                      <div
                        class="resizer"
                        @mousedown="${(e) => this.initResize(e)}"
                      ></div>
                    </th>
                    <th
                      class="${this.getSortClass("commentCount")} text-center"
                      style="width: 120px;"
                      @click="${(e) =>
                        this.handleHeaderClick(e, "commentCount")}"
                    >
                      Comentarios <span class="sort-icon"></span>
                      <div
                        class="resizer"
                        @mousedown="${(e) => this.initResize(e)}"
                      ></div>
                    </th>
                    <th
                      class="${this.getSortClass("createDate")}"
                      style="width: 160px;"
                      @click="${(e) => this.handleHeaderClick(e, "createDate")}"
                    >
                      Creación <span class="sort-icon"></span>
                      <div
                        class="resizer"
                        @mousedown="${(e) => this.initResize(e)}"
                      ></div>
                    </th>
                    <th
                      class="${this.getSortClass("updateDate")}"
                      style="width: 160px;"
                      @click="${(e) => this.handleHeaderClick(e, "updateDate")}"
                    >
                      Actualización <span class="sort-icon"></span>
                      <div
                        class="resizer"
                        @mousedown="${(e) => this.initResize(e)}"
                      ></div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  ${this.sortedEntries.map(
                    (entry) => html`
                      <tr
                        class="article-row ${this.expandedRows[entry.id]
                          ? "expanded"
                          : ""}"
                        @click="${(e) => this.toggleRow(entry.id, e)}"
                      >
                        <td>
                          <span
                            class="expand-icon ${this.expandedRows[entry.id]
                              ? "expanded"
                              : ""}"
                            >▶</span
                          >
                        </td>
                        <td>
                          <div class="article-title">
                            <strong>${entry.name}</strong>
                            ${entry.url
                              ? html`
                                  <a
                                    href="${entry.url}"
                                    class="action-link"
                                    title="Ver en el sitio"
                                    target="_blank"
                                    @click="${(e) => e.stopPropagation()}"
                                    >🔗</a
                                  >
                                `
                              : ""}
                            <a
                              href="${this.getEditUrl(entry.key)}"
                              class="action-link"
                              title="Editar artículo"
                              @click="${(e) => e.stopPropagation()}"
                              >✏️</a
                            >
                          </div>
                        </td>
                        <td>
                          ${entry.category
                            ? html`
                                <span
                                  class="category-badge ${this.getCategoryColorClass(
                                    entry.category
                                  )}"
                                  >${entry.category}</span
                                >
                              `
                            : "-"}
                        </td>
                        <td class="text-center">
                          <span class="view-count-badge"
                            >${entry.viewCount}</span
                          >
                        </td>
                        <td class="text-center">
                          <span
                            class="comment-count-badge ${entry.commentCount > 0
                              ? "has-comments"
                              : ""}"
                          >
                            💬 ${entry.commentCount}
                          </span>
                        </td>
                        <td>${this.formatDate(entry.createDate)}</td>
                        <td>${this.formatDate(entry.updateDate)}</td>
                      </tr>
                      ${this.renderCommentRow(entry)}
                    `
                  )}
                </tbody>
              </table>
            </div>
          `}
    `;
  }
}

customElements.define("blog-views-dashboard", BlogViewsDashboard);
