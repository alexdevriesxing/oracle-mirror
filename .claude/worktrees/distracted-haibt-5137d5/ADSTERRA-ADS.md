# Adsterra Ad Units — Single Source of Truth

All ad scripts for Oracle Mirror. Every unit listed here MUST be loaded on every page load.
Ad loading tolerance is set to generous timeouts — never remove an ad unit for slow loading.

---

## Global Scripts (load on every page)

### Popunder
```html
<script src="https://pl29455179.profitablecpmratenetwork.com/5f/1c/43/5f1c43e3ab2d72f28ca1887f8f142e22.js"></script>
```

### Social Bar
```html
<script src="https://pl29455188.profitablecpmratenetwork.com/bd/bf/f7/bdbff70e3f43e0bd0e569d51b2ab34ad.js"></script>
```

---

## Native Banner
```html
<script async="async" data-cfasync="false" src="https://pl29455180.profitablecpmratenetwork.com/2f5bd5c1659e9f80b6e17a79b9fb2476/invoke.js"></script>
<div id="container-2f5bd5c1659e9f80b6e17a79b9fb2476"></div>
```

---

## Display Banners

### Banner 728x90 (Leaderboard)
```html
<script>
  atOptions = {
    'key' : 'f0208b6d934dc944840dde3fd783cf5a',
    'format' : 'iframe',
    'height' : 90,
    'width' : 728,
    'params' : {}
  };
</script>
<script src="https://www.highperformanceformat.com/f0208b6d934dc944840dde3fd783cf5a/invoke.js"></script>
```

### Banner 468x60
```html
<script>
  atOptions = {
    'key' : 'b9dbdafd6e7fd928da788a4a32fbf6f2',
    'format' : 'iframe',
    'height' : 60,
    'width' : 468,
    'params' : {}
  };
</script>
<script src="https://www.highperformanceformat.com/b9dbdafd6e7fd928da788a4a32fbf6f2/invoke.js"></script>
```

### Banner 300x250 (Medium Rectangle)
```html
<script>
  atOptions = {
    'key' : 'da8fed9ff45b2fceee399c80dd205612',
    'format' : 'iframe',
    'height' : 250,
    'width' : 300,
    'params' : {}
  };
</script>
<script src="https://www.highperformanceformat.com/da8fed9ff45b2fceee399c80dd205612/invoke.js"></script>
```

### Banner 160x300
```html
<script>
  atOptions = {
    'key' : '34c93ad89c137d3db842d03761b28c1d',
    'format' : 'iframe',
    'height' : 300,
    'width' : 160,
    'params' : {}
  };
</script>
<script src="https://www.highperformanceformat.com/34c93ad89c137d3db842d03761b28c1d/invoke.js"></script>
```

### Banner 160x600 (Wide Skyscraper)
```html
<script>
  atOptions = {
    'key' : '40e53406956a3bf9933260962aa9e7c9',
    'format' : 'iframe',
    'height' : 600,
    'width' : 160,
    'params' : {}
  };
</script>
<script src="https://www.highperformanceformat.com/40e53406956a3bf9933260962aa9e7c9/invoke.js"></script>
```

### Banner 320x50 (Mobile Banner)
```html
<script>
  atOptions = {
    'key' : 'b3933facb55251c061a56fd12724bb74',
    'format' : 'iframe',
    'height' : 50,
    'width' : 320,
    'params' : {}
  };
</script>
<script src="https://www.highperformanceformat.com/b3933facb55251c061a56fd12724bb74/invoke.js"></script>
```

---

## Placement Map

| Unit | Placement | Viewport |
|------|-----------|----------|
| Popunder | Global (head) | All |
| Social Bar | Global (before body close) | All |
| Native Banner | Home page — after realm cards | All |
| 728x90 | Leaderboard — below hero | Desktop |
| 468x60 | Mid-content — above footer | Desktop/Tablet |
| 300x250 | Home native area + chat bottom | All |
| 160x600 | Left floating sidebar | Desktop (>1400px) |
| 160x300 | Right floating sidebar | Desktop (>1400px) |
| 320x50 | Mobile sticky bottom | Mobile (<768px) |

---

## Loading Policy

- All scripts use `async` loading where supported
- No ad unit should be removed for slow loading — increase tolerance instead
- Popunder and Social Bar are non-blocking global scripts
- Display banners load in their containers via Adsterra's invoke.js
- If an ad container is empty after loading, it collapses gracefully (min-height: 0)
