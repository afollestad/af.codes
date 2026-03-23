Every file in `scripts/` must be wrapped in an IIFE to avoid polluting the global scope:

```javascript
(function () {
    // all code indented inside
})();
```

Since the project uses plain `<script>` tags (no ES modules), the IIFE is the only scope boundary. All top-level variables and functions must live inside it.
