(function () {
  'use strict';

  var allProjects = [];
  var selectedProjectId = null;
  var editingUrls = false;
  var savingUrls = false;
  var urlValidationErrors = {};

  var projectListEl = document.getElementById('projectList');
  var detailPanel = document.getElementById('detailPanel');
  var detailBody = document.getElementById('detailBody');
  var errorBanner = document.getElementById('errorBanner');
  var lastUpdatedEl = document.getElementById('lastUpdated');

  var URL_FIELDS = [
    { key: 'domain', label: 'Domain' },
    { key: 'portal_url', label: 'Portal URL' },
    { key: 'shell_url', label: 'Shell URL' },
    { key: 'repo_url', label: 'Repository URL' }
  ];

  // --- Helpers ---

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }

  function isValidUrl(value) {
    if (!value || value.trim() === '') return true;
    try {
      new URL(value);
      return true;
    } catch (e) {
      return false;
    }
  }

  function formatTime(iso) {
    try {
      var d = new Date(iso);
      return d.toLocaleString(undefined, {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) {
      return escapeHtml(iso);
    }
  }

  function showError(msg) {
    errorBanner.textContent = msg;
    errorBanner.classList.add('visible');
  }

  function hideError() {
    errorBanner.classList.remove('visible');
  }

  function getSelectedProject() {
    if (!selectedProjectId) return null;
    for (var i = 0; i < allProjects.length; i++) {
      if (allProjects[i].id === selectedProjectId) return allProjects[i];
    }
    return null;
  }

  // --- Render: Project List ---

  function renderProjectList() {
    if (allProjects.length === 0) {
      projectListEl.innerHTML = '<div class="empty-state" data-testid="projects-text-emptyList">No projects found.</div>';
      return;
    }

    var html = '';
    for (var i = 0; i < allProjects.length; i++) {
      var p = allProjects[i];
      var isSelected = p.id === selectedProjectId;
      html += '<div class="project-item' + (isSelected ? ' selected' : '') + '" '
        + 'data-action="select-project" data-project-id="' + escapeHtml(p.id) + '" '
        + 'data-testid="projects-item-project-' + escapeHtml(p.id.slice(0, 8)) + '" '
        + 'tabindex="0" role="button" aria-label="View project ' + escapeHtml(p.name) + '">'
        + '<div class="project-item-name">' + escapeHtml(p.name) + '</div>'
        + '<div class="project-item-desc">' + escapeHtml(p.description || 'No description') + '</div>'
        + '<span class="project-status project-status-' + escapeHtml(p.status) + '">' + escapeHtml(p.status) + '</span>'
        + '</div>';
    }
    projectListEl.innerHTML = html;
  }

  // --- Render: Detail Panel ---

  function renderDetailPanel() {
    var project = getSelectedProject();

    if (!project) {
      detailPanel.classList.remove('visible');
      detailBody.innerHTML = '';
      return;
    }

    detailPanel.classList.add('visible');

    var html = '<div class="detail-header">'
      + '<h2 class="detail-title" data-testid="projects-heading-detailTitle">' + escapeHtml(project.name) + '</h2>'
      + '<span class="project-status project-status-' + escapeHtml(project.status) + '">' + escapeHtml(project.status) + '</span>'
      + '</div>';

    if (project.description) {
      html += '<p class="detail-description" data-testid="projects-text-detailDescription">' + escapeHtml(project.description) + '</p>';
    }

    html += '<div class="detail-meta">'
      + '<div class="detail-row"><span class="detail-label">Created</span><span class="detail-value" data-testid="projects-text-detailCreated">' + formatTime(project.createdAt) + '</span></div>'
      + '<div class="detail-row"><span class="detail-label">Updated</span><span class="detail-value" data-testid="projects-text-detailUpdated">' + formatTime(project.updatedAt) + '</span></div>'
      + '</div>';

    // URL fields section
    html += '<div class="url-section" data-testid="projects-container-urlSection">';
    html += '<div class="url-section-header">'
      + '<h3 class="url-section-title">URLs</h3>';

    if (!editingUrls) {
      html += '<button class="btn btn-secondary" data-action="edit-urls" '
        + 'data-testid="projects-button-editUrls" tabindex="0" aria-label="Edit URL fields">Edit</button>';
    }
    html += '</div>';

    if (editingUrls) {
      html += renderUrlEditMode(project);
    } else {
      html += renderUrlDisplayMode(project);
    }

    html += '</div>';

    detailBody.innerHTML = html;

    if (editingUrls) {
      var firstInput = detailBody.querySelector('input[data-field]');
      if (firstInput) firstInput.focus();
    }
  }

  function renderUrlDisplayMode(project) {
    var html = '';
    for (var i = 0; i < URL_FIELDS.length; i++) {
      var field = URL_FIELDS[i];
      var value = project[field.key] || '';
      var displayValue;

      if (value) {
        displayValue = '<a class="url-link" href="' + escapeHtml(value) + '" '
          + 'target="_blank" rel="noopener noreferrer" '
          + 'data-testid="projects-link-' + escapeHtml(field.key) + '">'
          + escapeHtml(value) + '</a>';
      } else {
        displayValue = '<span class="url-empty" data-testid="projects-text-' + escapeHtml(field.key) + '-empty">Not set</span>';
      }

      html += '<div class="detail-row" data-testid="projects-row-' + escapeHtml(field.key) + '">'
        + '<span class="detail-label">' + escapeHtml(field.label) + '</span>'
        + '<span class="detail-value">' + displayValue + '</span>'
        + '</div>';
    }
    return html;
  }

  function renderUrlEditMode(project) {
    var html = '<div class="url-edit-form" data-testid="projects-form-urlEdit">';

    for (var i = 0; i < URL_FIELDS.length; i++) {
      var field = URL_FIELDS[i];
      var value = project[field.key] || '';
      var error = urlValidationErrors[field.key] || '';
      var hasError = error !== '';

      html += '<div class="form-group' + (hasError ? ' invalid' : '') + '" data-testid="projects-group-' + escapeHtml(field.key) + '">'
        + '<label class="form-label" for="url-input-' + escapeHtml(field.key) + '">' + escapeHtml(field.label) + '</label>'
        + '<input type="url" class="form-input" '
        + 'id="url-input-' + escapeHtml(field.key) + '" '
        + 'data-field="' + escapeHtml(field.key) + '" '
        + 'data-testid="projects-input-' + escapeHtml(field.key) + '" '
        + 'value="' + escapeHtml(value) + '" '
        + 'placeholder="https://example.com" '
        + 'aria-label="' + escapeHtml(field.label) + '">';

      if (hasError) {
        html += '<div class="form-error" data-testid="projects-error-' + escapeHtml(field.key) + '">' + escapeHtml(error) + '</div>';
      }

      html += '</div>';
    }

    html += '<div class="url-edit-actions">';

    if (savingUrls) {
      html += '<button class="btn btn-primary" disabled data-testid="projects-button-saveUrls">Saving...</button>';
    } else {
      html += '<button class="btn btn-primary" data-action="save-urls" '
        + 'data-testid="projects-button-saveUrls" tabindex="0" aria-label="Save URL changes">Save</button>';
    }

    html += '<button class="btn btn-secondary" data-action="cancel-urls" '
      + 'data-testid="projects-button-cancelUrls" tabindex="0" aria-label="Cancel URL editing"'
      + (savingUrls ? ' disabled' : '') + '>Cancel</button>'
      + '</div></div>';

    return html;
  }

  // --- URL Validation ---

  function validateUrlFields() {
    var errors = {};
    var hasErrors = false;

    for (var i = 0; i < URL_FIELDS.length; i++) {
      var field = URL_FIELDS[i];
      var input = document.querySelector('input[data-field="' + field.key + '"]');
      if (!input) continue;

      var value = input.value.trim();
      if (value !== '' && !isValidUrl(value)) {
        errors[field.key] = 'Please enter a valid URL (e.g. https://example.com)';
        hasErrors = true;
      }
    }

    urlValidationErrors = errors;
    return !hasErrors;
  }

  // --- API Calls ---

  function loadProjects() {
    fetch('/api/projects').then(function (resp) {
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      return resp.json();
    }).then(function (data) {
      allProjects = Array.isArray(data) ? data : (data.projects || []);
      renderProjectList();
      if (!editingUrls) {
        renderDetailPanel();
      }
      hideError();
      lastUpdatedEl.textContent = 'Updated ' + new Date().toLocaleTimeString(undefined, {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
    }).catch(function (err) {
      showError('Failed to load projects: ' + err.message);
    });
  }

  function saveUrls() {
    if (!selectedProjectId) return;

    if (!validateUrlFields()) {
      renderDetailPanel();
      return;
    }

    var payload = {};
    for (var i = 0; i < URL_FIELDS.length; i++) {
      var field = URL_FIELDS[i];
      var input = document.querySelector('input[data-field="' + field.key + '"]');
      if (input) {
        payload[field.key] = input.value.trim();
      }
    }

    savingUrls = true;
    renderDetailPanel();

    fetch('/api/projects/' + encodeURIComponent(selectedProjectId), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (resp) {
      if (!resp.ok) {
        return resp.json().then(function (b) {
          throw new Error(b.error || 'Update failed');
        });
      }
      return resp.json();
    }).then(function (data) {
      // Update local state with server response
      for (var j = 0; j < allProjects.length; j++) {
        if (allProjects[j].id === selectedProjectId) {
          allProjects[j] = data.project;
          break;
        }
      }
      editingUrls = false;
      savingUrls = false;
      urlValidationErrors = {};
      renderDetailPanel();
      renderProjectList();
      showSuccess('URLs updated successfully');
    }).catch(function (err) {
      savingUrls = false;
      showError('Failed to save URLs: ' + err.message);
      renderDetailPanel();
    });
  }

  function showSuccess(msg) {
    var banner = document.getElementById('successBanner');
    banner.textContent = msg;
    banner.classList.add('visible');
    setTimeout(function () {
      banner.classList.remove('visible');
    }, 3000);
  }

  // --- Event Delegation ---

  document.addEventListener('click', function (e) {
    var target = e.target;
    if (!(target instanceof HTMLElement)) return;
    var actionEl = target.closest('[data-action]');
    if (!actionEl) return;

    var action = actionEl.getAttribute('data-action');

    if (action === 'select-project') {
      var projectId = actionEl.getAttribute('data-project-id');
      if (projectId && projectId !== selectedProjectId) {
        selectedProjectId = projectId;
        editingUrls = false;
        urlValidationErrors = {};
        renderProjectList();
        renderDetailPanel();
      }
      return;
    }

    if (action === 'edit-urls') {
      editingUrls = true;
      urlValidationErrors = {};
      renderDetailPanel();
      return;
    }

    if (action === 'save-urls') {
      saveUrls();
      return;
    }

    if (action === 'cancel-urls') {
      editingUrls = false;
      urlValidationErrors = {};
      renderDetailPanel();
      return;
    }

    if (action === 'refresh') {
      loadProjects();
      return;
    }

    if (action === 'dismiss-error') {
      hideError();
      return;
    }
  });

  // Keyboard support for interactive elements
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && editingUrls) {
      editingUrls = false;
      urlValidationErrors = {};
      renderDetailPanel();
      return;
    }

    var target = e.target;
    if (!(target instanceof HTMLElement)) return;

    if (e.key === 'Enter' || e.key === ' ') {
      var actionEl = target.closest('[data-action="select-project"]');
      if (actionEl && target.tagName !== 'BUTTON' && target.tagName !== 'INPUT') {
        e.preventDefault();
        actionEl.click();
      }
    }

    // Enter in URL input triggers save
    if (e.key === 'Enter' && target.matches('input[data-field]')) {
      e.preventDefault();
      saveUrls();
    }
  });

  // --- Init ---
  loadProjects();
  setInterval(loadProjects, 10000);
})();
