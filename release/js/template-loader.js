///</// <reference path="player.d.ts" />
var Mvision;
(function (Mvision) {
    var Templates;
    (function (Templates) {
        var QueryStrings = (function () {
            function QueryStrings() {
            }
            QueryStrings.Data = 'data';
            QueryStrings.PlatformType = 'platformType';
            QueryStrings.AutoPlay = 'autoPlay';
            return QueryStrings;
        }());
        var Component = (function () {
            function Component(type, value) {
                this.type = type;
                this.value = value;
            }
            return Component;
        }());
        Templates.Component = Component;
        var Loader = (function () {
            function Loader(callback) {
                this.callback = callback;
                this.components = [];
                this.dataJson = this.getParameterByName(QueryStrings.Data);
                this.platformType = this.getParameterByName(QueryStrings.PlatformType);
                this.autoPlay =
                    String(this.getParameterByName(QueryStrings.AutoPlay))
                        .toLowerCase()
                        !== 'false';
                this.getDataJson();
            }
            Loader.prototype.getComponents = function (callback) {
                if (this.components) {
                    callback(this.components);
                }
                else {
                    this.callback = callback;
                }
            };
            Loader.prototype.ready = function () {
                window.player.mediaReady(this.autoPlay);
            };
            Loader.prototype.error = function (message) {
                window.player.mediaError(message);
            };
            Loader.prototype.finished = function () {
                window.player.mediaFinished();
            };
            Loader.prototype.getParameterByName = function (name, url) {
                if (url === void 0) { url = window.location.href; }
                if (!url)
                    url = window.location.href;
                name = name.replace(/[\[\]]/g, "\\$&");
                var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(url);
                if (!results)
                    return null;
                if (!results[2])
                    return '';
                return decodeURIComponent(results[2].replace(/\+/g, " "));
            };
            Loader.prototype.getDataJson = function () {
                var _this = this;
                var mframeUrl = this.dataJson;
                if (!mframeUrl) {
                    mframeUrl = 'mframe.json';
                }
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (xhttp.readyState === 4 && xhttp.status === 200) {
                        _this.dataJsonCallback(JSON.parse(xhttp.responseText));
                    }
                };
                xhttp.open('GET', mframeUrl);
                xhttp.send();
            };
            Loader.prototype.dataJsonCallback = function (data) {
                var _this = this;
                this.components = [];
                data.components.forEach(function (c) {
                    _this.components.push(new Component(c.type, c.params.value));
                });
                if (this.callback != null) {
                    this.callback(this.components);
                }
            };
            return Loader;
        }());
        Templates.Loader = Loader;
        window['Loader'] = window['Loader'] || Loader;
    })(Templates = Mvision.Templates || (Mvision.Templates = {}));
})(Mvision || (Mvision = {}));
