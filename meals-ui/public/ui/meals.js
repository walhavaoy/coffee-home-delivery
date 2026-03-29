(function () {
  "use strict";

  var container = null;
  var ctx = null;
  var listEl = null;
  var refreshTimer = null;
  var meals = [];
  var editingId = null; // id of meal being edited, null = not editing
  var modalOpen = false;

  /* Listener refs for cleanup */
  var _onContainerClick = null;
  var _onContainerKeydown = null;

  function escapeAttr(str) {
    return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  var CSS = [
    ".meals-wrap { display:flex; flex-direction:column; height:100%; padding:1rem; box-sizing:border-box; font-family:var(--font-family, monospace); color:var(--text, #c5c8c6); }",
    ".meals-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem; }",
    ".meals-title { font-size:1.25rem; font-weight:600; color:var(--text, #c5c8c6); }",
    ".meals-btn { padding:0.5rem 1rem; border-radius:0.375rem; border:1px solid var(--border, #373b41); background:var(--accent, #81a2be); color:var(--bg, #1d1f21); font-size:0.875rem; font-family:inherit; cursor:pointer; font-weight:600; }",
    ".meals-btn:hover { filter:brightness(0.9); }",
    ".meals-btn-secondary { background:var(--bg-card, #1d1f21); color:var(--text, #c5c8c6); }",
    ".meals-btn-secondary:hover { background:var(--bg-hover, #282a2e); }",
    ".meals-btn-danger { background:none; border-color:var(--danger, #cc6666); color:var(--danger, #cc6666); }",
    ".meals-btn-danger:hover { background:var(--danger, #cc6666); color:var(--bg, #1d1f21); }",
    ".meals-btn-sm { padding:0.25rem 0.625rem; font-size:0.75rem; }",
    ".meals-empty { color:var(--text-dim, #707880); font-size:0.875rem; padding:2rem 0; text-align:center; }",
    ".meals-list { display:flex; flex-direction:column; gap:0.5rem; }",
    ".meals-card { padding:0.75rem 1rem; background:var(--bg-card, #1d1f21); border:1px solid var(--border, #373b41); border-radius:0.5rem; display:flex; align-items:center; gap:0.75rem; }",
    ".meals-card-body { flex:1; min-width:0; }",
    ".meals-card-name { font-size:0.9375rem; font-weight:600; color:var(--text, #c5c8c6); margin-bottom:0.25rem; }",
    ".meals-card-foods { font-size:0.8125rem; color:var(--text-dim, #707880); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }",
    ".meals-card-time { font-size:0.6875rem; color:var(--text-dim, #707880); margin-top:0.25rem; }",
    ".meals-card-actions { display:flex; gap:0.375rem; flex-shrink:0; }",
    ".meals-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000; }",
    ".meals-modal { background:var(--bg-secondary, #282a2e); border:1px solid var(--border, #373b41); border-radius:0.5rem; padding:1.5rem; min-width:20rem; max-width:90vw; }",
    ".meals-modal-title { font-size:1.125rem; font-weight:600; margin-bottom:1rem; color:var(--text, #c5c8c6); }",
    ".meals-form-group { margin-bottom:1rem; }",
    ".meals-form-label { display:block; font-size:0.8125rem; color:var(--text-dim, #707880); margin-bottom:0.25rem; }",
    ".meals-form-input { width:100%; padding:0.5rem 0.625rem; border:1px solid var(--border, #373b41); border-radius:0.375rem; background:var(--bg-card, #1d1f21); color:var(--text, #c5c8c6); font-size:0.875rem; font-family:inherit; box-sizing:border-box; }",
    ".meals-form-input:focus { border-color:var(--accent, #81a2be); outline:none; box-shadow:0 0 0 2px color-mix(in srgb, var(--accent, #81a2be) 25%, transparent); }",
    ".meals-form-hint { font-size:0.75rem; color:var(--text-dim, #707880); margin-top:0.25rem; }",
    ".meals-modal-actions { display:flex; gap:0.5rem; justify-content:flex-end; margin-top:1rem; }",
    ".meals-status { font-size:0.8125rem; padding:0.5rem 0; font-family:inherit; }",
    ".meals-status-ok { color:var(--accent, #81a2be); }",
    ".meals-status-err { color:var(--danger, #cc6666); }",
    ".meals-confirm-text { font-size:0.9375rem; color:var(--text, #c5c8c6); margin-bottom:1rem; }",
  ].join("\n");

  // ── Render helpers ──────────────────────────────────────────────────────────

  function renderMealCard(meal) {
    var foods = (meal.foods || []).map(function (f) { return ctx.escapeHtml(f); }).join(", ");
    var timeStr = meal.updatedAt ? ctx.escapeHtml(ctx.timeAgo(meal.updatedAt)) : "";
    return '<div class="meals-card" data-testid="meals-card-' + escapeAttr(meal.id) + '">' +
      '<div class="meals-card-body">' +
        '<div class="meals-card-name">' + ctx.escapeHtml(meal.name) + '</div>' +
        '<div class="meals-card-foods">' + (foods || '<em>No foods</em>') + '</div>' +
        '<div class="meals-card-time">' + timeStr + '</div>' +
      '</div>' +
      '<div class="meals-card-actions">' +
        '<button class="meals-btn meals-btn-secondary meals-btn-sm" ' +
          'data-action="edit" data-meal-id="' + escapeAttr(meal.id) + '" ' +
          'data-testid="meals-btn-edit-' + escapeAttr(meal.id) + '" ' +
          'tabindex="0" role="button" aria-label="Edit ' + escapeAttr(meal.name) + '">Edit</button>' +
        '<button class="meals-btn meals-btn-danger meals-btn-sm" ' +
          'data-action="delete" data-meal-id="' + escapeAttr(meal.id) + '" ' +
          'data-testid="meals-btn-delete-' + escapeAttr(meal.id) + '" ' +
          'tabindex="0" role="button" aria-label="Delete ' + escapeAttr(meal.name) + '">Delete</button>' +
      '</div>' +
    '</div>';
  }

  function renderList() {
    if (!meals.length) {
      return '<div class="meals-empty" data-testid="meals-text-empty">No meals yet. Click &quot;New Meal&quot; to create one.</div>';
    }
    var html = '<div class="meals-list" data-testid="meals-list">';
    for (var i = 0; i < meals.length; i++) {
      html += renderMealCard(meals[i]);
    }
    html += '</div>';
    return html;
  }

  function renderModal(title, meal) {
    var name = meal ? meal.name : "";
    var foods = meal ? (meal.foods || []).join(", ") : "";
    var isEdit = !!meal;
    return '<div class="meals-modal-overlay" data-action="modal-close" data-testid="meals-modal-overlay">' +
      '<div class="meals-modal" data-testid="meals-modal" role="dialog" aria-modal="true" aria-label="' + escapeAttr(title) + '">' +
        '<div class="meals-modal-title" data-testid="meals-modal-title">' + ctx.escapeHtml(title) + '</div>' +
        '<div class="meals-form-group">' +
          '<label class="meals-form-label" for="meals-input-name">Meal Name</label>' +
          '<input id="meals-input-name" class="meals-form-input" type="text" ' +
            'data-testid="meals-input-name" ' +
            'value="' + escapeAttr(name) + '" ' +
            'placeholder="e.g. Chicken & Rice" aria-label="Meal name" />' +
        '</div>' +
        '<div class="meals-form-group">' +
          '<label class="meals-form-label" for="meals-input-foods">Foods (comma-separated)</label>' +
          '<input id="meals-input-foods" class="meals-form-input" type="text" ' +
            'data-testid="meals-input-foods" ' +
            'value="' + escapeAttr(foods) + '" ' +
            'placeholder="e.g. chicken breast, brown rice, broccoli" aria-label="Foods list" />' +
          '<div class="meals-form-hint">Enter food names separated by commas</div>' +
        '</div>' +
        '<div id="meals-modal-status"></div>' +
        '<div class="meals-modal-actions">' +
          '<button class="meals-btn meals-btn-secondary" data-action="modal-close" ' +
            'data-testid="meals-btn-cancel" tabindex="0" role="button" aria-label="Cancel">Cancel</button>' +
          '<button class="meals-btn" data-action="modal-save" ' +
            'data-testid="meals-btn-save" tabindex="0" role="button" aria-label="Save meal">' +
            (isEdit ? "Update" : "Create") + '</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function renderDeleteConfirm(meal) {
    return '<div class="meals-modal-overlay" data-action="modal-close" data-testid="meals-modal-overlay">' +
      '<div class="meals-modal" data-testid="meals-modal-delete" role="alertdialog" aria-modal="true" aria-label="Confirm delete">' +
        '<div class="meals-modal-title">Delete Meal</div>' +
        '<div class="meals-confirm-text">Are you sure you want to delete <strong>' + ctx.escapeHtml(meal.name) + '</strong>?</div>' +
        '<div id="meals-modal-status"></div>' +
        '<div class="meals-modal-actions">' +
          '<button class="meals-btn meals-btn-secondary" data-action="modal-close" ' +
            'data-testid="meals-btn-cancel-delete" tabindex="0" role="button" aria-label="Cancel">Cancel</button>' +
          '<button class="meals-btn meals-btn-danger" data-action="confirm-delete" data-meal-id="' + escapeAttr(meal.id) + '" ' +
            'data-testid="meals-btn-confirm-delete" tabindex="0" role="button" aria-label="Confirm delete">Delete</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  // ── Status helpers ──────────────────────────────────────────────────────────

  function showModalStatus(msg, isError) {
    var el = container.querySelector("#meals-modal-status");
    if (!el) return;
    ctx.patchHtml(el, '<div class="meals-status ' + (isError ? "meals-status-err" : "meals-status-ok") + '" data-testid="meals-text-status">' +
      ctx.escapeHtml(msg) + '</div>');
  }

  // ── Data fetch ──────────────────────────────────────────────────────────────

  function fetchMeals() {
    if (modalOpen) return; // don't refresh while modal is open
    fetch("/api/meals-ui/meals")
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        if (modalOpen) return;
        var newMeals = data.meals || [];
        var hash = JSON.stringify(newMeals);
        if (!ctx.dataChanged("meals-list", hash)) return;
        meals = newMeals;
        ctx.patchHtml(listEl, renderList());
      })
      .catch(function (err) {
        if (modalOpen) return;
        ctx.patchHtml(listEl, '<div class="meals-status meals-status-err" data-testid="meals-text-error">Failed to load meals: ' +
          ctx.escapeHtml(err.message) + '</div>');
      });
  }

  // ── Modal management ────────────────────────────────────────────────────────

  function openModal(html) {
    modalOpen = true;
    var existing = container.querySelector(".meals-modal-overlay");
    if (existing) existing.remove();
    var div = document.createElement("div");
    ctx.patchHtml(div, html);
    container.appendChild(div.firstChild);
    // Focus first input
    var firstInput = container.querySelector(".meals-modal .meals-form-input");
    if (firstInput) firstInput.focus();
  }

  function closeModal() {
    modalOpen = false;
    editingId = null;
    var overlay = container.querySelector(".meals-modal-overlay");
    if (overlay) overlay.remove();
  }

  function getFormData() {
    var nameInput = container.querySelector("#meals-input-name");
    var foodsInput = container.querySelector("#meals-input-foods");
    if (!nameInput || !foodsInput) return null;
    var name = nameInput.value.trim();
    var foodsStr = foodsInput.value.trim();
    var foods = foodsStr ? foodsStr.split(",").map(function (s) { return s.trim(); }).filter(Boolean) : [];
    return { name: name, foods: foods };
  }

  // ── API calls ───────────────────────────────────────────────────────────────

  function saveMeal() {
    var data = getFormData();
    if (!data) return;
    if (!data.name) { showModalStatus("Meal name is required", true); return; }
    if (!data.foods.length) { showModalStatus("At least one food is required", true); return; }

    var url = editingId ? "/api/meals-ui/meals/" + encodeURIComponent(editingId) : "/api/meals-ui/meals";
    var method = editingId ? "PUT" : "POST";

    fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then(function (res) {
        if (!res.ok) return res.json().then(function (d) { throw new Error(d.error || "Save failed"); });
        return res.json();
      })
      .then(function () {
        closeModal();
        ctx.dataChanged("meals-list", null); // force refresh
        fetchMeals();
      })
      .catch(function (err) {
        showModalStatus(err.message || "Save failed", true);
      });
  }

  function deleteMeal(id) {
    fetch("/api/meals-ui/meals/" + encodeURIComponent(id), { method: "DELETE" })
      .then(function (res) {
        if (!res.ok) return res.json().then(function (d) { throw new Error(d.error || "Delete failed"); });
        return res.json();
      })
      .then(function () {
        closeModal();
        ctx.dataChanged("meals-list", null);
        fetchMeals();
      })
      .catch(function (err) {
        showModalStatus(err.message || "Delete failed", true);
      });
  }

  // ── Registration ────────────────────────────────────────────────────────────

  window.tmpclaw.register({
    name: "meals",
    label: "Meals",
    order: 26,
    mode: "tab",

    init: function (el, context) {
      container = el;
      ctx = context;

      var style = document.createElement("style");
      style.textContent = CSS;
      el.appendChild(style);

      var wrap = document.createElement("div");
      wrap.className = "meals-wrap";
      wrap.setAttribute("data-testid", "meals-container-main");

      var header = document.createElement("div");
      header.className = "meals-header";
      ctx.patchHtml(header, '<div class="meals-title" data-testid="meals-text-title">Meals</div>' +
        '<button class="meals-btn" data-action="new" data-testid="meals-btn-new" ' +
        'tabindex="0" role="button" aria-label="Create new meal">New Meal</button>');
      wrap.appendChild(header);

      listEl = document.createElement("div");
      listEl.setAttribute("data-testid", "meals-container-list");
      ctx.patchHtml(listEl, '<div class="meals-empty">Loading...</div>');
      wrap.appendChild(listEl);

      el.appendChild(wrap);

      // Event delegation
      _onContainerClick = function (e) {
        var target = e.target;
        while (target && target !== el) {
          var action = target.getAttribute("data-action");

          if (action === "new") {
            editingId = null;
            openModal(renderModal("New Meal", null));
            return;
          }

          if (action === "edit") {
            var mealId = target.getAttribute("data-meal-id");
            var meal = meals.find(function (m) { return m.id === mealId; });
            if (meal) {
              editingId = meal.id;
              openModal(renderModal("Edit Meal", meal));
            }
            return;
          }

          if (action === "delete") {
            var delId = target.getAttribute("data-meal-id");
            var delMeal = meals.find(function (m) { return m.id === delId; });
            if (delMeal) {
              openModal(renderDeleteConfirm(delMeal));
            }
            return;
          }

          if (action === "confirm-delete") {
            var confirmId = target.getAttribute("data-meal-id");
            if (confirmId) deleteMeal(confirmId);
            return;
          }

          if (action === "modal-save") {
            saveMeal();
            return;
          }

          if (action === "modal-close") {
            // Only close if clicking overlay itself, not the modal content
            if (target.classList.contains("meals-modal-overlay") || target.hasAttribute("data-action")) {
              closeModal();
            }
            return;
          }

          target = target.parentElement;
        }
      };

      _onContainerKeydown = function (e) {
        if (e.key === "Escape" && modalOpen) {
          closeModal();
          return;
        }
        // Enter on save button
        if (e.key === "Enter") {
          var target = e.target;
          if (target.getAttribute("data-action") === "modal-save") {
            e.preventDefault();
            saveMeal();
          } else if (target.getAttribute("data-action") === "confirm-delete") {
            e.preventDefault();
            var confirmId = target.getAttribute("data-meal-id");
            if (confirmId) deleteMeal(confirmId);
          } else if (target.classList && target.classList.contains("meals-form-input")) {
            // Enter in form input triggers save
            e.preventDefault();
            saveMeal();
          }
        }
        if (e.key === " ") {
          var spaceTarget = e.target;
          var spaceAction = spaceTarget.getAttribute("data-action");
          if (spaceAction === "new" || spaceAction === "edit" || spaceAction === "delete" ||
              spaceAction === "modal-save" || spaceAction === "modal-close" || spaceAction === "confirm-delete") {
            e.preventDefault();
            spaceTarget.click();
          }
        }
      };

      el.addEventListener("click", _onContainerClick);
      el.addEventListener("keydown", _onContainerKeydown);
    },

    activate: function () {
      fetchMeals();
      refreshTimer = setInterval(fetchMeals, 15000);
    },

    deactivate: function () {
      if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null; }
      if (modalOpen) closeModal();
      if (container) {
        container.removeEventListener("click", _onContainerClick);
        container.removeEventListener("keydown", _onContainerKeydown);
      }
      _onContainerClick = null;
      _onContainerKeydown = null;
    }
  });
})();
