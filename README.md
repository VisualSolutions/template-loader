Usage:

Include the template-loader.js in your html file. It will connect to window.onload and send a http request to the path in `current url?data=path` (defaults to mframe.json).

```javascript
window.getComponents(function(components) {
    components.forEach(c => {
        console.log(c.getValue());
    });
});
```

The code will basically try to get the mframe.json. When that is done, it will call the latest callback from getComponents. If the request is already complete, it just callsback immediatly.