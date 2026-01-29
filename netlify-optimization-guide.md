# Netlify CDN Optimization Guide

## Overview
Netlify automatically provides a global CDN for all static assets. This guide helps you optimize it for maximum performance.

---

## 1. Automatic CDN Features

Netlify automatically:
- ✅ Serves all static assets from CDN
- ✅ Provides global edge locations
- ✅ Enables HTTP/2 and HTTP/3
- ✅ Compresses assets (gzip/brotli)
- ✅ Provides SSL/TLS certificates

---

## 2. Cache Headers Configuration

Create or update `netlify.toml` in your project root:

```toml
[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/images/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/fonts/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# API responses - shorter cache
[[headers]]
  for = "/api/*"
  [headers.values]
    Cache-Control = "public, max-age=300, s-maxage=300"
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
```

---

## 3. Build Optimization

### 3.1 Enable Build Caching
In `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "build"
  
[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--prefer-offline --no-audit"
  
# Cache node_modules
[[plugins]]
  package = "@netlify/plugin-cache"
```

### 3.2 Optimize Bundle Size
In `package.json`, add:

```json
{
  "scripts": {
    "build": "react-scripts build",
    "analyze": "npm run build && npx source-map-explorer 'build/static/js/*.js'"
  }
}
```

---

## 4. Image Optimization

### 4.1 Use Netlify Image CDN
Update image references to use Netlify's image CDN:

```jsx
// Instead of:
<img src="/images/logo.png" />

// Use:
<img src="https://your-site.netlify.app/.netlify/images?url=/images/logo.png&w=400&q=75" />
```

### 4.2 Configure Image Transformations
In `netlify.toml`:

```toml
[[plugins]]
  package = "@netlify/plugin-image-optim"
  
[build.processing]
  skip_processing = false
  
[build.processing.css]
  bundle = true
  minify = true
  
[build.processing.js]
  bundle = true
  minify = true
  
[build.processing.html]
  pretty_urls = true
```

---

## 5. Asset Versioning

### 5.1 Enable Asset Hashing
React already does this, but ensure your build process includes:

```javascript
// In your build script
process.env.GENERATE_SOURCEMAP = false; // Reduces build size
```

### 5.2 Preload Critical Assets
In `public/index.html`:

```html
<link rel="preload" href="/static/css/main.css" as="style">
<link rel="preload" href="/static/js/main.js" as="script">
```

---

## 6. API Caching Strategy

### 6.1 Cache API Responses (Frontend)
Create a caching service:

```javascript
// src/utils/apiCache.js
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const getCached = async (key, fetcher) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await fetcher();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
};

// Usage:
const courses = await getCached('courses', () => 
  axios.get('/api/courses')
);
```

### 6.2 Cache-Control Headers (Backend)
Ensure your backend sets proper cache headers:

```java
@GetMapping("/api/courses")
public ResponseEntity<List<CourseDTO>> getAllCourses() {
    HttpHeaders headers = new HttpHeaders();
    headers.setCacheControl("public, max-age=300"); // 5 minutes
    return ResponseEntity.ok()
        .headers(headers)
        .body(courses);
}
```

---

## 7. Performance Monitoring

### 7.1 Enable Netlify Analytics
1. Go to Netlify Dashboard
2. Site Settings → Analytics
3. Enable "Analytics" (Pro plan required)

### 7.2 Monitor CDN Performance
- Check "Bandwidth" in Netlify dashboard
- Monitor "Build times"
- Track "Deploy frequency"

---

## 8. Redirects and Rewrites

Optimize redirects in `netlify.toml`:

```toml
[[redirects]]
  from = "/api/*"
  to = "https://your-backend.com/api/:splat"
  status = 200
  force = true
  headers = {X-From = "Netlify"}

# SPA fallback
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 9. Environment Variables

Set in Netlify Dashboard → Site Settings → Environment Variables:

```
REACT_APP_API_URL=https://your-backend.com
REACT_APP_ENV=production
```

---

## 10. Build Optimization Checklist

- [ ] Enable build caching
- [ ] Configure cache headers
- [ ] Optimize images (use WebP)
- [ ] Enable asset minification
- [ ] Use code splitting
- [ ] Lazy load routes
- [ ] Enable compression (gzip/brotli)
- [ ] Set proper cache-control headers
- [ ] Monitor bundle size
- [ ] Enable Netlify Analytics

---

## 11. Expected Performance Improvements

After optimization:
- ✅ **First Contentful Paint**: <1.5s
- ✅ **Time to Interactive**: <3s
- ✅ **Largest Contentful Paint**: <2.5s
- ✅ **CDN Hit Rate**: >90%
- ✅ **Bandwidth Savings**: 60-80%

---

## 12. Free Tier Limits

**Free Tier:**
- 100 GB bandwidth/month
- 300 build minutes/month
- 1 concurrent build

**For 30K+ users, upgrade to Pro ($19/month):**
- 400 GB bandwidth/month
- 1,000 build minutes/month
- 3 concurrent builds

---

## Quick Start

1. Create `netlify.toml` in project root with cache headers
2. Enable build caching plugin
3. Optimize images (convert to WebP)
4. Set environment variables
5. Deploy and monitor

---

## Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Netlify Image CDN](https://docs.netlify.com/image-processing/overview/)
- [Netlify Headers](https://docs.netlify.com/routing/headers/)

