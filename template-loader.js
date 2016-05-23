(function () {

    function getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    function getMframeContent() {
        var mframeUrl = getParameterByName('data');
        if (!mframeUrl) {
            mframeUrl = 'mframe.json';
        }

        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (xhttp.readyState === 4 && xhttp.status === 200) {
                handleMframeJson(JSON.parse(xhttp.responseText));
            }
        };

        xhttp.open('GET', mframeUrl);
        xhttp.send();
    }

    var components = [];
    var callback = null;

    function handleMframeJson(data) {
        components = [];
        data.forEach(c => {
            components.push(new Component(c.type, c.params.value));
        });
        if (callback) {
            callback(components);
        }
    }

    class Component {
        constructor(type, value) {
            this.type = type;
            this.value = value;
        }

        getValue() {
            return this.valuel;
        }

        getType() {
            return this.type;
        }
    }

    window.getComponents = function (cb) {
        if (components) {
            cb(components);
        } else {
            cb = callback;
        }
    };

    window.onload = getMframeContent();

})();