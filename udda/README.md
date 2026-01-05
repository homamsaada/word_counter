# عُدّة | Udda

<div align="center">

🔧 **أدوات مجانية للجميع | Free Tools for Everyone**

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Languages](https://img.shields.io/badge/languages-AR%20%7C%20EN-orange)

</div>

---

## 📖 عن المشروع

**عُدّة** موقع أدوات مجانية متعدد اللغات (عربي/إنجليزي) يقدم مجموعة من الأدوات المفيدة للجميع:
- 🧮 حاسبات (نسبة مئوية، خصومات، BMI...)
- 🔄 محوّلات (وحدات، عملات، تواريخ...)
- 📝 أدوات نصية (عداد كلمات، تنسيق...)
- ⚡ مولّدات (QR، كلمات سر...)
- والمزيد!

---

## 🚀 البدء السريع

### التشغيل المحلي

```bash
# 1. انتقل لمجلد المشروع
cd udda

# 2. ابني الموقع
node build.js

# 3. شغّل سيرفر محلي
npx serve dist -p 3000

# 4. افتح المتصفح على http://localhost:3000
```

### البناء للإنتاج

```bash
node build.js
# الملفات الجاهزة في مجلد dist/
```

---

## 📁 هيكل المشروع

```
udda/
├── src/                      # ملفات المصدر
│   ├── assets/
│   │   ├── css/main.css      # الأنماط الرئيسية
│   │   └── js/app.js         # JavaScript الرئيسي
│   ├── data/
│   │   ├── i18n.json         # الترجمات
│   │   └── tools.json        # قائمة الأدوات
│   ├── layouts/
│   │   └── base.html         # القالب الأساسي
│   └── tools/
│       └── percentage.html   # قالب كل أداة
│
├── dist/                     # الملفات المُنتجة (للنشر)
│   ├── ar/                   # النسخة العربية
│   ├── en/                   # النسخة الإنجليزية
│   ├── assets/
│   ├── sitemap.xml
│   └── robots.txt
│
├── build.js                  # سكريبت البناء
├── package.json
└── README.md
```

---

## ➕ إضافة أداة جديدة

### 1. أضف الترجمات في `src/data/i18n.json`:

```json
{
  "tools": {
    "my-tool": {
      "ar": {
        "name": "اسم الأداة",
        "title": "عنوان الصفحة | عُدّة",
        "metaDescription": "وصف للـ SEO",
        "keywords": "كلمات، مفتاحية",
        "description": "وصف قصير"
      },
      "en": {
        "name": "Tool Name",
        "title": "Page Title | Udda",
        "metaDescription": "SEO description",
        "keywords": "keywords, here",
        "description": "Short description"
      }
    }
  }
}
```

### 2. أضف الأداة في `src/data/tools.json`:

```json
{
  "tools": [
    {
      "id": "my-tool",
      "category": "calculators",
      "icon": "🔢",
      "popular": true
    }
  ]
}
```

### 3. أنشئ قالب الأداة `src/tools/my-tool.html`:

```html
<div class="tool-card">
  <div class="tool-header">
    <div class="tool-icon">🔢</div>
    <div>
      <h1 class="tool-title">{{tool.name}}</h1>
      <p class="tool-description">{{tool.description}}</p>
    </div>
  </div>
  
  <!-- محتوى الأداة -->
</div>

<script>
// كود الأداة
</script>
```

### 4. ابني المشروع:

```bash
node build.js
```

---

## 🎨 المميزات

- ✅ **ثنائي اللغة**: عربي وإنجليزي مع RTL كامل
- ✅ **SEO محسّن**: Open Graph, Twitter Cards, Schema.org
- ✅ **وضع داكن/فاتح**: مع خيار تلقائي
- ✅ **تصميم متجاوب**: يعمل على جميع الأجهزة
- ✅ **سريع**: ملفات HTML ثابتة بدون سيرفر
- ✅ **سهل النشر**: GitHub Pages, Netlify, Vercel...

---

## 🌐 النشر

### GitHub Pages

```bash
# في مجلد dist
git init
git add .
git commit -m "Deploy"
git remote add origin YOUR_REPO
git push -u origin main
```

### Netlify / Vercel

1. ارفع المشروع كاملاً
2. Build command: `node build.js`
3. Publish directory: `dist`

---

## 📝 الرخصة

MIT License - استخدم المشروع كما تشاء!

---

<div align="center">

صُنع بـ ❤️

</div>
