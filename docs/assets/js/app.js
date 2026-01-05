/**
 * عُدّة | Udda - Main Application JavaScript
 */

// ========================================
// App State
// ========================================
const App = {
  state: {
    theme: localStorage.getItem('udda-theme') || 'auto',
    sidebarOpen: window.innerWidth > 1024,
    sidebarCollapsed: localStorage.getItem('udda-sidebar-collapsed') === 'true',
    settingsOpen: false,
    favorites: JSON.parse(localStorage.getItem('udda-favorites') || '[]'),
    recent: JSON.parse(localStorage.getItem('udda-recent') || '[]'),
    lang: document.documentElement.lang || 'ar'
  },

  init() {
    this.initTheme();
    this.initSidebar();
    this.initSettings();
    this.initSearch();
    this.trackToolUsage();
    this.initKeyboardShortcuts();
    console.log('عُدّة initialized ✓');
  },

  // ========================================
  // Theme Management
  // ========================================
  initTheme() {
    this.applyTheme(this.state.theme);
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (this.state.theme === 'auto') {
        this.applyTheme('auto');
      }
    });
  },

  applyTheme(theme) {
    this.state.theme = theme;
    localStorage.setItem('udda-theme', theme);
    
    let actualTheme = theme;
    if (theme === 'auto') {
      actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    document.documentElement.setAttribute('data-theme', actualTheme);
    
    // Update active button
    document.querySelectorAll('[data-theme-btn]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.themeBtn === theme);
    });
  },

  // ========================================
  // Sidebar Management
  // ========================================
  initSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    // Apply saved state
    if (this.state.sidebarCollapsed && window.innerWidth > 1024) {
      sidebar.classList.add('collapsed');
    }

    // Toggle sections
    document.querySelectorAll('.nav-section-title').forEach(title => {
      title.addEventListener('click', () => {
        const section = title.closest('.nav-section');
        section.classList.toggle('open');
      });
    });

    // Open active section
    const activeItem = sidebar.querySelector('.nav-item.active');
    if (activeItem) {
      activeItem.closest('.nav-section')?.classList.add('open');
    }

    // Mobile menu toggle
    document.querySelector('.mobile-menu-btn')?.addEventListener('click', () => {
      this.toggleSidebar();
    });

    // Sidebar collapse toggle
    document.querySelector('.sidebar-toggle')?.addEventListener('click', () => {
      this.toggleSidebarCollapse();
    });

    // Close sidebar on overlay click (mobile)
    document.querySelector('.sidebar-overlay')?.addEventListener('click', () => {
      this.closeSidebar();
    });

    // Handle resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024) {
        document.querySelector('.sidebar-overlay')?.classList.remove('active');
      }
    });
  },

  toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    sidebar.classList.toggle('open');
    overlay?.classList.toggle('active');
    document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
  },

  closeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    sidebar.classList.remove('open');
    overlay?.classList.remove('active');
    document.body.style.overflow = '';
  },

  toggleSidebarCollapse() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('collapsed');
    this.state.sidebarCollapsed = sidebar.classList.contains('collapsed');
    localStorage.setItem('udda-sidebar-collapsed', this.state.sidebarCollapsed);
  },

  // ========================================
  // Settings Panel
  // ========================================
  initSettings() {
    // Open settings
    document.querySelector('.settings-btn, [data-open-settings]')?.addEventListener('click', () => {
      this.openSettings();
    });

    // Close settings
    document.querySelector('.settings-close')?.addEventListener('click', () => {
      this.closeSettings();
    });

    document.querySelector('.settings-overlay')?.addEventListener('click', () => {
      this.closeSettings();
    });

    // Theme buttons
    document.querySelectorAll('[data-theme-btn]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.applyTheme(btn.dataset.themeBtn);
      });
    });

    // Language buttons
    document.querySelectorAll('[data-lang-btn]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.changeLanguage(btn.dataset.langBtn);
      });
    });

    // Favorite button
    document.querySelector('[data-favorite-btn]')?.addEventListener('click', () => {
      const toolId = document.body.dataset.toolId;
      if (toolId) {
        this.toggleFavorite(toolId);
      }
    });

    // Clear data button
    document.querySelector('[data-clear-data]')?.addEventListener('click', () => {
      this.clearAllData();
    });
  },

  openSettings() {
    document.querySelector('.settings-overlay')?.classList.add('active');
    document.querySelector('.settings-panel')?.classList.add('active');
    this.state.settingsOpen = true;
  },

  closeSettings() {
    document.querySelector('.settings-overlay')?.classList.remove('active');
    document.querySelector('.settings-panel')?.classList.remove('active');
    this.state.settingsOpen = false;
  },

  changeLanguage(lang) {
    // Get current path and switch language
    const currentPath = window.location.pathname;
    
    // Replace language in path
    let newPath = currentPath
      .replace('/ar/', `/${lang}/`)
      .replace('/en/', `/${lang}/`);
    
    // If no change happened, redirect to home
    if (newPath === currentPath) {
      newPath = '/udda/' + lang + '/';
    }
    
    window.location.href = newPath;
  },

  clearAllData() {
    const confirmMsg = this.state.lang === 'ar' 
      ? 'هل أنت متأكد من مسح جميع البيانات المحفوظة؟'
      : 'Are you sure you want to clear all saved data?';
    
    if (confirm(confirmMsg)) {
      localStorage.removeItem('udda-favorites');
      localStorage.removeItem('udda-recent');
      this.state.favorites = [];
      this.state.recent = [];
      this.showToast(this.state.lang === 'ar' ? 'تم مسح البيانات' : 'Data cleared');
      this.updateFavoritesUI();
      this.updateRecentUI();
    }
  },

  // ========================================
  // Search
  // ========================================
  initSearch() {
    const searchInputs = document.querySelectorAll('.search-input');
    
    searchInputs.forEach(input => {
      let debounceTimer;
      
      input.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.handleSearch(e.target.value);
        }, 300);
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.handleSearch(e.target.value, true);
        }
        if (e.key === 'Escape') {
          e.target.value = '';
          this.hideSearchResults();
        }
      });
    });
  },

  handleSearch(query, navigate = false) {
    query = query.trim().toLowerCase();
    
    if (!query) {
      this.hideSearchResults();
      return;
    }

    // Get tools data from page
    const toolsData = window.toolsData || [];
    const results = toolsData.filter(tool => {
      const name = (tool.name || '').toLowerCase();
      const keywords = (tool.keywords || '').toLowerCase();
      return name.includes(query) || keywords.includes(query);
    });

    if (navigate && results.length > 0) {
      window.location.href = results[0].url;
    } else {
      this.showSearchResults(results);
    }
  },

  showSearchResults(results) {
    let dropdown = document.querySelector('.search-results');
    
    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.className = 'search-results';
      document.querySelector('.search-input-wrapper')?.appendChild(dropdown);
    }

    if (results.length === 0) {
      const noResultsText = this.state.lang === 'ar' ? 'لا توجد نتائج' : 'No results found';
      dropdown.innerHTML = `<div class="search-no-results">${noResultsText}</div>`;
    } else {
      dropdown.innerHTML = results.slice(0, 6).map(tool => `
        <a href="${tool.url}" class="search-result-item">
          <span class="search-result-icon">${tool.icon || '🔧'}</span>
          <span class="search-result-name">${tool.name}</span>
        </a>
      `).join('');
    }

    dropdown.classList.add('active');
  },

  hideSearchResults() {
    document.querySelector('.search-results')?.classList.remove('active');
  },

  // ========================================
  // Favorites & Recent
  // ========================================
  toggleFavorite(toolId) {
    const index = this.state.favorites.indexOf(toolId);
    
    if (index > -1) {
      this.state.favorites.splice(index, 1);
      this.showToast(this.state.lang === 'ar' ? 'تمت الإزالة من المفضلة' : 'Removed from favorites');
    } else {
      this.state.favorites.unshift(toolId);
      this.showToast(this.state.lang === 'ar' ? 'تمت الإضافة للمفضلة' : 'Added to favorites');
    }
    
    localStorage.setItem('udda-favorites', JSON.stringify(this.state.favorites));
    this.updateFavoritesUI();
  },

  isFavorite(toolId) {
    return this.state.favorites.includes(toolId);
  },

  trackToolUsage() {
    const toolId = document.body.dataset.toolId;
    if (!toolId) return;

    // Remove if already in recent
    const index = this.state.recent.indexOf(toolId);
    if (index > -1) {
      this.state.recent.splice(index, 1);
    }

    // Add to beginning
    this.state.recent.unshift(toolId);
    
    // Keep only last 10
    this.state.recent = this.state.recent.slice(0, 10);
    
    localStorage.setItem('udda-recent', JSON.stringify(this.state.recent));
  },

  updateFavoritesUI() {
    const btn = document.querySelector('[data-favorite-btn]');
    if (btn) {
      const toolId = document.body.dataset.toolId;
      const isFav = this.isFavorite(toolId);
      btn.innerHTML = isFav ? '★' : '☆';
      btn.classList.toggle('active', isFav);
    }
  },

  updateRecentUI() {
    // Update recent tools list in settings or sidebar
    const recentList = document.querySelector('.recent-tools-list');
    if (recentList && window.toolsData) {
      const recentTools = this.state.recent
        .map(id => window.toolsData.find(t => t.id === id))
        .filter(Boolean)
        .slice(0, 5);
      
      recentList.innerHTML = recentTools.map(tool => `
        <a href="${tool.url}" class="recent-tool-item">
          <span>${tool.icon}</span>
          <span>${tool.name}</span>
        </a>
      `).join('') || `<p class="text-muted">${this.state.lang === 'ar' ? 'لا توجد أدوات حديثة' : 'No recent tools'}</p>`;
    }
  },

  // ========================================
  // Keyboard Shortcuts
  // ========================================
  initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K: Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('.search-input')?.focus();
      }
      
      // Escape: Close modals
      if (e.key === 'Escape') {
        if (this.state.settingsOpen) {
          this.closeSettings();
        }
        if (window.innerWidth <= 1024) {
          this.closeSidebar();
        }
      }
    });
  },

  // ========================================
  // Toast Notifications
  // ========================================
  showToast(message, duration = 2000) {
    let toast = document.querySelector('.toast');
    
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  },

  // ========================================
  // Utility Functions
  // ========================================
  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      this.showToast(this.state.lang === 'ar' ? 'تم النسخ!' : 'Copied!');
    });
  },

  formatNumber(num, decimals = 2) {
    if (isNaN(num)) return '0';
    return Number(num).toLocaleString(this.state.lang === 'ar' ? 'ar-SA' : 'en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
    });
  },

  shareUrl(title, url) {
    const shareUrl = url || window.location.href;
    const shareTitle = title || document.title;
    
    if (navigator.share) {
      navigator.share({ 
        title: shareTitle, 
        url: shareUrl 
      }).catch(() => {
        // User cancelled or error - fallback to copy
        this.copyToClipboard(shareUrl);
      });
    } else {
      this.copyToClipboard(shareUrl);
    }
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => App.init());

// Export for global access
window.App = App;
