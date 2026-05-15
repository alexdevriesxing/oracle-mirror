# Adsterra Ad Units

This file is the single source of truth for the live Adsterra snippets used by Oracle Mirror.
Every unit listed here is loaded on the initial page parse. The site reserves ad-slot space while
units load instead of removing slow-loading placements.

## Global Scripts

### Popunder

```html
<script src="https://pl29455179.profitablecpmratenetwork.com/5f/1c/43/5f1c43e3ab2d72f28ca1887f8f142e22.js"></script>
```

### Social Bar

```html
<script src="https://pl29455188.profitablecpmratenetwork.com/bd/bf/f7/bdbff70e3f43e0bd0e569d51b2ab34ad.js"></script>
```

## Native Banner

```html
<script async="async" data-cfasync="false" src="https://pl29455180.profitablecpmratenetwork.com/2f5bd5c1659e9f80b6e17a79b9fb2476/invoke.js"></script>
<div id="container-2f5bd5c1659e9f80b6e17a79b9fb2476"></div>
```

## Display Banners

### 728x90

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

### 468x60

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

### 300x250

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

### 160x300

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

### 160x600

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

### 320x50

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

## Placement Map

| Unit | Placement | Viewport |
| --- | --- | --- |
| Popunder | Global head script | All |
| Social Bar | Global body-end script | All |
| Native Banner | Home page below realm cards | All |
| 728x90 | Leaderboard below hero | Desktop |
| 468x60 | Mid-content above footer | Desktop and tablet |
| 300x250 | Home rectangle and crystal-ball chat rectangle | All |
| 160x600 | Fixed left rail | Very wide desktop |
| 160x300 | Fixed right rail | Very wide desktop |
| 320x50 | Mobile top banner and mobile sticky footer banner | Mobile |

## Loading Policy

- All supplied units are present in the live HTML and load on the first page parse.
- Display slots keep their configured dimensions while content loads; they are not removed for slow loading.
- Width-specific visibility is handled with CSS placement rules, while the scripts still load consistently.
