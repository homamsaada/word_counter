/**
 * عُدّة | Udda - Build Script v2
 * بناء مبسط وفعّال
 */

const fs = require('fs');
const path = require('path');

// ========================================
// Configuration
// ========================================
const config = {
  srcDir: path.join(__dirname, 'src'),
  distDir: path.join(__dirname, 'dist'),
  languages: ['ar', 'en'],
  baseUrl: 'https://udda.tools',
  year: new Date().getFullYear()
};

// ========================================
// Load Data
// ========================================
const i18n = JSON.parse(fs.readFileSync(path.join(config.srcDir, 'data/i18n.json'), 'utf8'));
const toolsData = JSON.parse(fs.readFileSync(path.join(config.srcDir, 'data/tools.json'), 'utf8'));

// ========================================
// Helpers
// ========================================
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyDirRecursive(src, dest) {
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// ========================================
// Build Sidebar HTML
// ========================================
function buildSidebarHTML(lang, activeToolId = null) {
  const categories = i18n.categories[lang];
  const tools = toolsData.tools;
  const ui = i18n.ui[lang];
  
  let html = `
        <a href="/${lang}/" class="nav-item ${!activeToolId ? 'active' : ''}">
          <span class="nav-item-icon">🏠</span>
          <span class="sidebar-text">${ui.home}</span>
        </a>`;
  
  toolsData.categoryOrder.forEach(catId => {
    const cat = categories[catId];
    if (!cat) return;
    
    const catTools = tools.filter(t => t.category === catId);
    const hasActiveTool = catTools.some(t => t.id === activeToolId);
    
    html += `
        <div class="nav-section ${hasActiveTool ? 'open' : ''}">
          <div class="nav-section-title">
            <span>
              <span class="nav-section-icon">${cat.icon}</span>
              <span class="sidebar-text">${cat.name}</span>
            </span>
            <svg class="nav-section-arrow sidebar-text" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="m6 9 6 6 6-6"></path>
            </svg>
          </div>
          <div class="nav-section-items">`;
    
    catTools.forEach(tool => {
      const toolName = i18n.tools[tool.id]?.[lang]?.name || tool.id;
      const isActive = tool.id === activeToolId;
      html += `
            <a href="/${lang}/tools/${tool.id}.html" class="nav-item ${isActive ? 'active' : ''}">
              <span class="nav-item-icon">${tool.icon}</span>
              <span class="sidebar-text">${toolName}</span>
            </a>`;
    });
    
    html += `
          </div>
        </div>`;
  });
  
  return html;
}

// ========================================
// Build Full Page HTML
// ========================================
function buildPageHTML(lang, options) {
  const {
    title,
    metaDescription,
    keywords,
    canonicalPath,
    toolId,
    toolName,
    categoryName,
    content,
    isHome
  } = options;
  
  const isArabic = lang === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';
  const meta = i18n.meta[lang];
  const ui = i18n.ui[lang];
  
  const sidebarHTML = buildSidebarHTML(lang, toolId);
  
  // Breadcrumb
  let breadcrumbHTML = `<a href="/${lang}/" class="breadcrumb-link">${ui.home}</a>`;
  if (categoryName) {
    breadcrumbHTML += `
          <span class="breadcrumb-separator">›</span>
          <span class="breadcrumb-link">${categoryName}</span>`;
  }
  if (toolName && !isHome) {
    breadcrumbHTML += `
          <span class="breadcrumb-separator">›</span>
          <span class="breadcrumb-current">${toolName}</span>`;
  }

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <title>${title}</title>
  <meta name="description" content="${metaDescription}">
  <meta name="keywords" content="${keywords}">
  <meta name="author" content="Udda">
  <meta name="robots" content="index, follow">
  
  <meta property="og:type" content="website">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${metaDescription}">
  <meta property="og:url" content="${config.baseUrl}/${lang}${canonicalPath}">
  <meta property="og:site_name" content="${meta.siteName}">
  <meta property="og:locale" content="${meta.locale}">
  
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${metaDescription}">
  
  <link rel="alternate" hreflang="ar" href="${config.baseUrl}/ar${canonicalPath}">
  <link rel="alternate" hreflang="en" href="${config.baseUrl}/en${canonicalPath}">
  <link rel="alternate" hreflang="x-default" href="${config.baseUrl}/ar${canonicalPath}">
  <link rel="canonical" href="${config.baseUrl}/${lang}${canonicalPath}">
  
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/main.css">
  
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "${toolName || meta.siteName}",
    "description": "${metaDescription}",
    "url": "${config.baseUrl}/${lang}${canonicalPath}",
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "Any",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "inLanguage": ["ar", "en"],
    "isAccessibleForFree": true
  }
  </script>
</head>
<body data-tool-id="${toolId || ''}">
  <div class="app-container">
    <div class="sidebar-overlay"></div>
    
    <aside class="sidebar">
      <div class="sidebar-header">
        <a href="/${lang}/" class="logo">
          <div class="logo-icon">🔧</div>
          <span class="logo-text sidebar-text">${meta.siteName}</span>
        </a>
      </div>
      
      <div class="sidebar-search">
        <div class="search-input-wrapper">
          <input type="text" class="search-input" placeholder="${ui.search}" aria-label="${ui.search}">
          <svg class="search-icon" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </div>
      </div>
      
      <nav class="sidebar-nav">
        ${sidebarHTML}
      </nav>
      
      <div class="sidebar-footer">
        <button class="sidebar-toggle" aria-label="Toggle sidebar">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
          </svg>
          <span class="sidebar-text">${ui.sidebar}</span>
        </button>
      </div>
    </aside>
    
    <div class="main-content">
      <header class="main-header">
        <button class="header-btn mobile-menu-btn" aria-label="Menu">
          <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        
        <nav class="header-breadcrumb">
          ${breadcrumbHTML}
        </nav>
        
        <div class="header-actions">
          <button class="header-btn" data-favorite-btn aria-label="${ui.addFavorite}">☆</button>
          <button class="header-btn" onclick="App.shareUrl('${toolName || meta.siteName}')" aria-label="${ui.share}">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
              <polyline points="16 6 12 2 8 6"></polyline>
              <line x1="12" y1="2" x2="12" y2="15"></line>
            </svg>
          </button>
          <button class="header-btn" data-open-settings aria-label="${ui.settings}">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>
      </header>
      
      <main class="page-content">
        ${content}
      </main>
      
      <footer class="main-footer">
        <p>${ui.madeWith} | ${ui.copyright} © ${config.year} ${meta.siteName}</p>
      </footer>
    </div>
  </div>
  
  <!-- Settings Panel -->
  <div class="settings-overlay"></div>
  <div class="settings-panel">
    <div class="settings-header">
      <h2 class="settings-title">${ui.settings}</h2>
      <button class="settings-close" aria-label="Close">✕</button>
    </div>
    <div class="settings-content">
      <div class="settings-section">
        <div class="settings-section-title">${ui.language}</div>
        <div class="settings-option">
          <button class="settings-btn ${isArabic ? 'active' : ''}" data-lang-btn="ar">العربية</button>
          <button class="settings-btn ${!isArabic ? 'active' : ''}" data-lang-btn="en">English</button>
        </div>
      </div>
      <div class="settings-section">
        <div class="settings-section-title">${ui.theme}</div>
        <div class="settings-option">
          <button class="settings-btn" data-theme-btn="light">☀️ ${ui.themeLight}</button>
          <button class="settings-btn" data-theme-btn="dark">🌙 ${ui.themeDark}</button>
          <button class="settings-btn active" data-theme-btn="auto">💻 ${ui.themeAuto}</button>
        </div>
      </div>
      <div class="settings-section">
        <button class="settings-btn" data-clear-data style="width:100%;justify-content:center;color:var(--error);">
          🗑️ ${ui.clearData}
        </button>
      </div>
    </div>
  </div>
  
  <div class="toast"></div>
  <script src="/assets/js/app.js"></script>
</body>
</html>`;
}

// ========================================
// Build Homepage
// ========================================
function buildHomepage(lang) {
  const isArabic = lang === 'ar';
  const meta = i18n.meta[lang];
  const ui = i18n.ui[lang];
  const categories = i18n.categories[lang];
  
  // Popular tools
  const popularTools = toolsData.tools
    .filter(t => t.popular)
    .map(t => ({
      ...t,
      name: i18n.tools[t.id]?.[lang]?.name || t.id,
      description: i18n.tools[t.id]?.[lang]?.description || ''
    }));
  
  const content = `
    <div class="hero">
      <h1 class="hero-title">${meta.siteName}</h1>
      <p class="hero-subtitle">${meta.siteSlogan}</p>
      <div class="hero-search">
        <div class="search-input-wrapper">
          <input type="text" class="search-input" placeholder="${ui.search}" style="padding:16px 52px 16px 20px;font-size:1.1rem;border-radius:16px;">
          <svg class="search-icon" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </div>
      </div>
    </div>
    
    <section class="tools-section">
      <div class="section-header">
        <h2 class="section-title">⭐ ${isArabic ? 'الأكثر استخداماً' : 'Most Popular'}</h2>
      </div>
      <div class="tools-grid">
        ${popularTools.map(tool => `
          <a href="/${lang}/tools/${tool.id}.html" class="tool-grid-card">
            <div class="tool-grid-icon">${tool.icon}</div>
            <div class="tool-grid-info">
              <h3>${tool.name}</h3>
              <p>${tool.description}</p>
            </div>
          </a>
        `).join('')}
      </div>
    </section>
    
    <section class="tools-section">
      <div class="section-header">
        <h2 class="section-title">📂 ${isArabic ? 'التصنيفات' : 'Categories'}</h2>
      </div>
      <div class="categories-grid">
        ${toolsData.categoryOrder.map(catId => {
          const cat = categories[catId];
          if (!cat) return '';
          const count = toolsData.tools.filter(t => t.category === catId).length;
          return `
          <div class="category-card">
            <div class="category-icon">${cat.icon}</div>
            <div class="category-name">${cat.name}</div>
            <div class="category-count">${count} ${ui.toolCount}</div>
          </div>`;
        }).join('')}
      </div>
    </section>
  `;
  
  return buildPageHTML(lang, {
    title: `${meta.siteName} - ${meta.siteSlogan}`,
    metaDescription: meta.siteDescription,
    keywords: isArabic ? 'أدوات مجانية، حاسبات، محولات، أدوات أونلاين' : 'free tools, calculators, converters, online tools',
    canonicalPath: '/',
    toolId: null,
    toolName: null,
    categoryName: null,
    content,
    isHome: true
  });
}

// ========================================
// Build Tool Page
// ========================================
function buildToolPage(toolId, lang) {
  const tool = toolsData.tools.find(t => t.id === toolId);
  const toolI18n = i18n.tools[toolId]?.[lang];
  const categories = i18n.categories[lang];
  const ui = i18n.ui[lang];
  const isArabic = lang === 'ar';
  
  if (!tool || !toolI18n) {
    console.warn(`  ⚠ Tool translations not found: ${toolId}`);
    return null;
  }
  
  // Load tool template
  const toolTemplatePath = path.join(config.srcDir, `tools/${toolId}.html`);
  if (!fs.existsSync(toolTemplatePath)) {
    console.warn(`  ⚠ Tool template not found: ${toolId}`);
    return null;
  }
  
  let toolContent = fs.readFileSync(toolTemplatePath, 'utf8');
  
  // Replace all placeholders
  const replacements = {
    'tool.name': toolI18n.name,
    'tool.description': toolI18n.description,
    'tool.whatIsPercent': toolI18n.whatIsPercent,
    'tool.of': toolI18n.of,
    'tool.percentOf': toolI18n.percentOf,
    'tool.isWhat': toolI18n.isWhat,
    'tool.isWhatPercent': toolI18n.isWhatPercent,
    'tool.percentChange': toolI18n.percentChange,
    'tool.from': toolI18n.from,
    'tool.to': toolI18n.to,
    'tool.increase': toolI18n.increase,
    'tool.decrease': toolI18n.decrease,
    'tool.originalPrice': toolI18n.originalPrice,
    'tool.discount': toolI18n.discount,
    'tool.finalPrice': toolI18n.finalPrice,
    'tool.youSave': toolI18n.youSave,
    'tool.howToUseText': toolI18n.howToUseText,
    'ui.calculate': ui.calculate,
    'ui.result': ui.result,
    'ui.howToUse': ui.howToUse,
    'validationMsg': isArabic ? 'أدخل أرقاماً صحيحة' : 'Enter valid numbers'
  };
  
  Object.entries(replacements).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key.replace('.', '\\.')}\\}\\}`, 'g');
    toolContent = toolContent.replace(regex, value || '');
  });
  
  return buildPageHTML(lang, {
    title: toolI18n.title,
    metaDescription: toolI18n.metaDescription,
    keywords: toolI18n.keywords,
    canonicalPath: `/tools/${toolId}.html`,
    toolId,
    toolName: toolI18n.name,
    categoryName: categories[tool.category]?.name,
    content: toolContent,
    isHome: false
  });
}

// ========================================
// Build Sitemap
// ========================================
function buildSitemap() {
  let urls = [];
  
  config.languages.forEach(lang => {
    urls.push(`${config.baseUrl}/${lang}/`);
    toolsData.tools.forEach(tool => {
      urls.push(`${config.baseUrl}/${lang}/tools/${tool.id}.html`);
    });
  });
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url><loc>${url}</loc></url>`).join('\n')}
</urlset>`;
}

// ========================================
// Main Build
// ========================================
function build() {
  console.log('🔨 Building Udda...\n');
  
  // Clean
  if (fs.existsSync(config.distDir)) {
    fs.rmSync(config.distDir, { recursive: true });
  }
  
  // Copy assets
  copyDirRecursive(path.join(config.srcDir, 'assets'), path.join(config.distDir, 'assets'));
  console.log('✓ Assets copied');
  
  // Build for each language
  config.languages.forEach(lang => {
    console.log(`\n📦 Building ${lang.toUpperCase()}...`);
    
    const langDir = path.join(config.distDir, lang);
    const toolsDir = path.join(langDir, 'tools');
    ensureDir(toolsDir);
    
    // Homepage
    fs.writeFileSync(path.join(langDir, 'index.html'), buildHomepage(lang));
    console.log(`  ✓ Homepage`);
    
    // Tools
    toolsData.tools.forEach(tool => {
      const html = buildToolPage(tool.id, lang);
      if (html) {
        fs.writeFileSync(path.join(toolsDir, `${tool.id}.html`), html);
        console.log(`  ✓ ${tool.id}`);
      }
    });
  });
  
  // Sitemap & robots
  fs.writeFileSync(path.join(config.distDir, 'sitemap.xml'), buildSitemap());
  fs.writeFileSync(path.join(config.distDir, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${config.baseUrl}/sitemap.xml`);
  
  // Redirect index
  fs.writeFileSync(path.join(config.distDir, 'index.html'), `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<script>window.location.href='/'+(navigator.language?.startsWith('en')?'en':'ar')+'/';</script>
<meta http-equiv="refresh" content="0;url=/ar/">
</head><body><a href="/ar/">العربية</a> | <a href="/en/">English</a></body></html>`);
  
  console.log('\n✓ Sitemap generated');
  console.log('✓ robots.txt generated');
  console.log('✓ Redirect index generated');
  console.log('\n✅ Build complete!');
  console.log(`📁 Output: ${config.distDir}`);
}

build();
