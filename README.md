Usage:

Include the template-loader.js in your html file. It will connect to window.onload and send a http request to the path in `current url?data=path` (defaults to mframe.json).

```javascript
var templateLoader = new window.Loader();
templateLoader.getComponents(function(data) {
    console.log('You can use this callback to get the data.');
    console.log(data);
}).then(function(data) {
    console.log('Or you can use this promise to get the data');
    console.log(data);
}).catch(
    function(reason) {
        console.log(reason);
    }
);
```

The code will basically try to get the mframe.json. When that is done, it will call the latest callback from getComponents. If the request is already complete, it just callsback immediatly.
In case of error display an error message or report the error back to the player by calling:
```javascript
templateLoader.error(reason);
```
