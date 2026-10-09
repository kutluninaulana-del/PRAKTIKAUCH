
document.addEventListener('DOMContentLoaded', function() {

  // ===== 1. ПЕРЕМЕННЫЕ =====
  var propertiesContainer = document.querySelector('#properties-list');
  var buildingsContainer = document.querySelector('#buildings-list');
  var apartmentsBody = document.querySelector('#apartments-body');
  var modalOverlay = document.querySelector('#modal-overlay');
  var modalTitle = document.querySelector('#modal-title');
  var modalBody = document.querySelector('#modal-body');
  var modalCloseBtns = document.querySelectorAll('.modal-close, .modal-close-btn');

  // ===== 2. СКЕЛЕТОН + РЕНДЕР (Часть 5.4) =====
  function renderAll() {
    propertiesContainer.innerHTML = '';
    buildingsContainer.innerHTML = '';
    apartmentsBody.innerHTML = '';

    properties.forEach(function(item) {
      propertiesContainer.appendChild(renderProperty(item));
    });
    buildings.forEach(function(item) {
      buildingsContainer.appendChild(renderBuilding(item));
    });
    apartments.forEach(function(item) {
      apartmentsBody.appendChild(renderApartmentRow(item));
    });
  }

  // Сначала скелетоны
  propertiesContainer.innerHTML = '';
  for (var s = 0; s < 3; s++) {
    var skel = document.createElement('div');
    skel.className = 'skeleton';
    propertiesContainer.appendChild(skel);
  }
  // Через 1 сек показываем данные
  setTimeout(function() {
    renderAll();
  }, 1000);

  // ===== 3. ФИЛЬТРЫ (с пустым состоянием) =====
  var searchInput = document.querySelector('#search-input');
  var statusSelect = document.querySelector('#status-select');
  var priorityCheckboxes = document.querySelectorAll('.priority-filter');
  var filtersForm = document.querySelector('#filters-form');

  function applyFilters() {
    var searchText = searchInput.value.toLowerCase();
    var statusValue = statusSelect.value;
    var selectedPriorities = Array.from(priorityCheckboxes)
      .filter(function(cb) { return cb.checked; })
      .map(function(cb) { return cb.value; });

    var filteredProps = properties.filter(function(item) {
      var matchSearch = item.name.toLowerCase().includes(searchText);
      var matchStatus = statusValue === 'all' || item.status === statusValue;
      var matchPriority = selectedPriorities.length === 0 || selectedPriorities.includes(item.priority);
      return matchSearch && matchStatus && matchPriority;
    });

    propertiesContainer.innerHTML = '';
    if (filteredProps.length === 0) {
      var empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = '😕 Ничего не найдено. Попробуйте изменить фильтры.';
      propertiesContainer.appendChild(empty);
    } else {
      filteredProps.forEach(function(item) {
        propertiesContainer.appendChild(renderProperty(item));
      });
    }
  }

  searchInput.addEventListener('input', applyFilters);
  statusSelect.addEventListener('change', applyFilters);
  priorityCheckboxes.forEach(function(cb) {
    cb.addEventListener('change', applyFilters);
  });
  filtersForm.addEventListener('reset', function() {
    setTimeout(applyFilters, 0);
  });

  // ===== 4. СОРТИРОВКА =====
  var tableHeaders = document.querySelectorAll('#apartments-table th[data-sort]');
  tableHeaders.forEach(function(th) {
    th.addEventListener('click', function() {
      var key = th.dataset.sort;
      var isAsc = th.classList.contains('asc');

      tableHeaders.forEach(function(h) { h.classList.remove('asc', 'desc'); });
      th.classList.add(isAsc ? 'desc' : 'asc');

      var sorted = apartments.slice().sort(function(a, b) {
        if (key === 'number') return isAsc ? b.number.localeCompare(a.number) : a.number.localeCompare(b.number);
        if (key === 'area') return isAsc ? b.area - a.area : a.area - b.area;
        if (key === 'price') return isAsc ? b.price - a.price : a.price - b.price;
      });

      apartmentsBody.innerHTML = '';
      sorted.forEach(function(item) {
        apartmentsBody.appendChild(renderApartmentRow(item));
      });
    });
  });
  // ===== 5. МОДАЛЬНОЕ ОКНО =====
  function openModal(title, contentHTML) {
    modalTitle.textContent = title;
    modalBody.innerHTML = contentHTML;
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    var focusable = modalOverlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length) focusable[0].focus();
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  modalCloseBtns.forEach(function(btn) {
    btn.addEventListener('click', closeModal);
  });

  modalOverlay.addEventListener('click', function(e) {
    if (e.target === modalOverlay) closeModal();
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      closeModal();
    }
    if (e.key === 'Tab' && modalOverlay.classList.contains('active')) {
      var focusable = modalOverlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable.length === 0) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) { last.focus(); e.preventDefault(); }
      } else {
        if (document.activeElement === last) { first.focus(); e.preventDefault(); }
      }
    }
  });

  propertiesContainer.addEventListener('click', function(e) {
    var card = e.target.closest('.card');
    if (card) {
      var id = card.dataset.id;
      var item = properties.find(function(p) { return p.id === id; });
      if (item) {
        var content = '<p><strong>ID:</strong> ' + item.id + '</p>' +
                      '<p><strong>Описание:</strong> ' + item.description + '</p>' +
                      '<p><strong>Адрес:</strong> ' + item.address + '</p>' +
                      '<p><strong>Ответственный:</strong> ' + item.responsible + '</p>';
        openModal(item.name, content);
      }
    }
  });

  // ===== 6. МОБИЛЬНОЕ МЕНЮ =====
  var burgerBtn = document.querySelector('.burger-btn');
  var sidebar = document.querySelector('.sidebar');
  var overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  document.body.appendChild(overlay);

  function toggleMenu() {
    sidebar.classList.toggle('open');
    burgerBtn.classList.toggle('active');
    overlay.classList.toggle('active');

    if (sidebar.classList.contains('open')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  burgerBtn.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', toggleMenu);

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) {
      toggleMenu();
    }
  });

  // ===== 7. ПЕРЕКЛЮЧАТЕЛЬ ВИДА =====
  var viewRadios = document.querySelectorAll('input[name="view"]');

  viewRadios.forEach(function(radio) {
    radio.addEventListener('change', function() {
      if (this.value === 'list') {
        propertiesContainer.classList.remove('grid-list');
        propertiesContainer.classList.add('list-view');
      } else {
        propertiesContainer.classList.remove('list-view');
        propertiesContainer.classList.add('grid-list');
      }
    });
  });

  // ===== 8. ТЕМА (Часть 4.2) =====
  var themeSelect = document.querySelector('#theme-select');
  var currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  themeSelect.value = currentTheme;

  themeSelect.addEventListener('change', function() {
    document.documentElement.setAttribute('data-theme', this.value);
    localStorage.setItem('theme', this.value);
    if (typeof showToast === 'function') {
      showToast('Тема изменена на "' + this.options[this.selectedIndex].text + '"', 'success');
    }
  });

  // ===== 9. АКЦЕНТНЫЙ ЦВЕТ (Часть 4.3) =====
  var accentPicker = document.querySelector('#accent-picker');
  function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return null;
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    };
  }

  var savedAccent = localStorage.getItem('accent');
  if (savedAccent) {
    accentPicker.value = savedAccent;
    document.documentElement.style.setProperty('--accent', savedAccent);
    var rgbInit = hexToRgb(savedAccent);
    if (rgbInit) {
      document.documentElement.style.setProperty('--accent-rgb', rgbInit.r + ', ' + rgbInit.g + ', ' + rgbInit.b);
    }
  }

  accentPicker.addEventListener('input', function() {
    var hex = this.value;
    var rgb = hexToRgb(hex);
    document.documentElement.style.setProperty('--accent', hex);
    if (rgb) {
      document.documentElement.style.setProperty('--accent-rgb', rgb.r + ', ' + rgb.g + ', ' + rgb.b);
    }
    localStorage.setItem('accent', hex);
  });

  // ===== 10. СИСТЕМНАЯ ТЕМА (Часть 4.4) =====
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
    if (!localStorage.getItem('theme')) {
      var newTheme = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      themeSelect.value = newTheme;
    }
  });

  // ===== 11. TOAST-УВЕДОМЛЕНИЯ (Часть 5.1) =====
  function showToast(message, type) {
    var container = document.querySelector('#toast-container');
    var toast = document.createElement('div');
    toast.className = 'toast ' + (type || '');
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(function() {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(function() { toast.remove(); }, 300);
    }, 3000);
  }

  accentPicker.addEventListener('change', function() {
    showToast('Акцентный цвет обновлён', 'success');
  });

  // ===== 12. ТАБЫ (Часть 5.1) =====
  var tabs = document.querySelectorAll('.tab');
  var tabPanels = document.querySelectorAll('.tab-panel');

  tabs.forEach(function(tab, index) {
    tab.addEventListener('click', function() {
      tabs.forEach(function(t) { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tabPanels.forEach(function(p) { p.classList.remove('active'); p.hidden = true; });

      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');
      tabPanels[index].classList.add('active');
      tabPanels[index].hidden = false;
    });
    tab.addEventListener('keydown', function(e) {
      var idx = Array.from(tabs).indexOf(this);
      if (e.key === 'ArrowRight') { tabs[(idx + 1) % tabs.length].focus(); }
      if (e.key === 'ArrowLeft') { tabs[(idx - 1 + tabs.length) % tabs.length].focus(); }
    });
  });

  // ===== 13. АККОРДЕОН (Часть 5.1) =====
  var accordionHeaders = document.querySelectorAll('.accordion-header');
  accordionHeaders.forEach(function(header) {
    header.addEventListener('click', function() {
      var content = this.nextElementSibling;
      var isExpanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !isExpanded);
      content.hidden = isExpanded;
    });
  });

}); 