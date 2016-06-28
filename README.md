Usage:

Include the template-loader.js in your html file. It will connect to window.onload and send a http request to the path in `current url?data=path` (defaults to mframe.json).

```javascript
// to load components data use this:
window.Loader.getComponents().then(function(data) {
    console.log('Or you can use this promise to get the data');
    console.log(data);
});

// to notify player that the template is ready call this:
window.Loader.ready();

// to wait for template start (autoPlay is true or player issues play command) use this:
window.Loader.isStarted().then(function() {

});
```
