///</// <reference path="player.d.ts" />
var Mvision;
(function (Mvision) {
    var Templates;
    (function (Templates) {
        var QueryStrings = (function () {
            function QueryStrings() {
            }
            QueryStrings.Data = 'data';
            QueryStrings.PlayId = 'playId';
            QueryStrings.PlatformType = 'platformType';
            QueryStrings.AutoPlay = 'autoPlay';
            QueryStrings.Duration = 'duration';
            return QueryStrings;
        }());
        var PlaybackConstants = (function () {
            function PlaybackConstants() {
            }
            PlaybackConstants.DurationAuto = -1;
            return PlaybackConstants;
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
                var _this = this;
                this.callback = callback;
                if (!window.Player) {
                    window.Player = {
                        mediaFinished: function (playId) {
                            console.log("mediaFinished: playId=" + playId);
                        },
                        mediaError: function (playId, message) {
                            console.log("mediaError: playId=" + playId + ", message=" + message);
                        },
                        mediaReady: function (playId, started) {
                            console.log("mediaReady: playId=" + playId + ", started=" + started);
                        }
                    };
                }
                this.components = null;
                this.dataJson = this.getParameterByName(QueryStrings.Data);
                this.playId = parseInt(this.getParameterByName(QueryStrings.PlayId));
                this.platformType = this.getParameterByName(QueryStrings.PlatformType);
                this.autoPlay =
                    String(this.getParameterByName(QueryStrings.AutoPlay))
                        .toLowerCase()
                        !== 'false';
                this.duration = parseInt(this.getParameterByName(QueryStrings.Duration));
                if (isNaN(this.duration)) {
                    this.duration = PlaybackConstants.DurationAuto;
                }
                this.promise = new Promise(function (resolve, reject) {
                    _this.resolve = resolve;
                    _this.reject = reject;
                });
                this.getDataJson();
            }
            Loader.prototype.getComponents = function (callback) {
                if (this.components && callback) {
                    callback(this.components);
                }
                else {
                    this.callback = callback;
                }
                return this.promise;
            };
            Loader.prototype.isAutoPlay = function () {
                return this.autoPlay;
            };
            Loader.prototype.getPlatformType = function () {
                return this.platformType;
            };
            Loader.prototype.getDuration = function () {
                return this.duration;
            };
            Loader.prototype.ready = function () {
                window.Player.mediaReady(this.playId, this.autoPlay);
            };
            Loader.prototype.error = function (message) {
                if (!message) {
                    message = "Unspecified error.";
                }
                window.Player.mediaError(this.playId, message);
            };
            Loader.prototype.finished = function () {
                window.Player.mediaFinished(this.playId);
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
                        try {
                            _this.dataJsonCallback(JSON.parse(xhttp.responseText));
                        }
                        catch (err) {
                            _this.error("Error parsing " + mframeUrl + ": " + err.toString());
                        }
                    }
                    else if (xhttp.readyState === 4) {
                        _this.reject("Error loading " + mframeUrl + ", httpStatus=" + xhttp.status);
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
                this.resolve(this.components);
            };
            return Loader;
        }());
        Templates.Loader = Loader;
        window['Loader'] = window['Loader'] || Loader;
        var x = new Loader(null);
    })(Templates = Mvision.Templates || (Mvision.Templates = {}));
})(Mvision || (Mvision = {}));
