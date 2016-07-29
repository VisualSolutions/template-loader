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
        Templates.PlaybackConstants = PlaybackConstants;
        var Param = (function () {
            function Param(name, type, value) {
                this.name = name;
                this.type = type;
                this.value = value;
            }
            return Param;
        }());
        Templates.Param = Param;
        var Component = (function () {
            function Component(name, params) {
                this.name = name;
                this.params = params;
            }
            return Component;
        }());
        Templates.Component = Component;
        var ComponentV1 = (function () {
            function ComponentV1(type, value) {
                this.type = type;
                this.value = value;
            }
            return ComponentV1;
        }());
        Templates.ComponentV1 = ComponentV1;
        var PreviewPlayer = (function () {
            function PreviewPlayer() {
            }
            PreviewPlayer.prototype.mediaFinished = function (playId) {
                if (window.frameElement) {
                    window.parent.postMessage({
                        id: window.frameElement.id,
                        action: 'mediaFinished',
                        playId: playId
                    }, "*");
                }
            };
            PreviewPlayer.prototype.mediaError = function (playId, message) {
                if (window.frameElement) {
                    window.parent.postMessage({
                        id: window.frameElement.id,
                        action: 'mediaError',
                        playId: playId,
                        message: message
                    }, "*");
                }
            };
            PreviewPlayer.prototype.mediaReady = function (playId, started) {
                if (window.frameElement) {
                    window.parent.postMessage({
                        id: window.frameElement.id,
                        action: 'mediaReady',
                        playId: playId,
                        started: started
                    }, "*");
                }
            };
            return PreviewPlayer;
        }());
        Templates.PreviewPlayer = PreviewPlayer;
        var Loader = (function () {
            function Loader() {
                var _this = this;
                if (!window.Player) {
                    window.Player = new PreviewPlayer();
                    window.addEventListener('message', function (event) {
                        if (event && event.data && event.data.action && event.data.action === 'play') {
                            _this.play();
                        }
                    });
                }
                this.dataJson = this.getParameterByName(QueryStrings.Data);
                this.playId = parseInt(this.getParameterByName(QueryStrings.PlayId));
                this.platformType = this.getParameterByName(QueryStrings.PlatformType);
                this.duration = parseInt(this.getParameterByName(QueryStrings.Duration));
                if (isNaN(this.duration)) {
                    this.duration = PlaybackConstants.DurationAuto;
                }
                this.started =
                    String(this.getParameterByName(QueryStrings.AutoPlay))
                        .toLowerCase()
                        !== 'false';
                this.startPromise = new Promise(function (resolve, reject) {
                    _this.startPromiseResolve = resolve;
                });
                if (this.started) {
                    this.startPromiseResolve();
                }
                this.componentsPromise = new Promise(function (resolve, reject) {
                    _this.componentsPromiseResolve = resolve;
                });
                this.getDataJson();
            }
            Loader.prototype.getComponents = function () {
                return this.componentsPromise;
            };
            Loader.prototype.isStarted = function () {
                return this.startPromise;
            };
            Loader.prototype.getPlatformType = function () {
                return this.platformType;
            };
            Loader.prototype.getDuration = function () {
                return this.duration;
            };
            Loader.prototype.ifDurationNotSetEndIn = function (templateDurationInSeconds) {
                if (this.duration == PlaybackConstants.DurationAuto) {
                    setTimeout(this.finished, templateDurationInSeconds * 1000);
                }
            };
            Loader.prototype.ready = function () {
                window.Player.mediaReady(this.playId, this.started);
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
            Loader.prototype.play = function () {
                if (!this.started) {
                    this.started = true;
                    this.startPromiseResolve();
                }
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
                    mframeUrl = 'mframe.json?timestamp=' + new Date().getTime();
                }
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (xhttp.readyState === 4 && xhttp.status === 200) {
                        var components;
                        try {
                            var dataJson = JSON.parse(xhttp.responseText);
                            components = [];
                            dataJson.components.forEach(function (c) {
                                if (typeof c.type !== 'undefined' && c.params) {
                                    // Hack to allow old/deprecated components.
                                    components.push(new ComponentV1(c.type, c.params.value));
                                }
                                else {
                                    components.push(new Component(c.name, c.params.map(function (p) { return new Param(p.name, p.type, p.value); })));
                                }
                            });
                        }
                        catch (err) {
                            _this.error("Error parsing " + mframeUrl + ": " + err.toString());
                            return;
                        }
                        _this.componentsPromiseResolve(components);
                    }
                    else if (xhttp.readyState === 4) {
                        _this.error("Error loading " + mframeUrl + ", httpStatus=" + xhttp.status);
                    }
                };
                xhttp.open('GET', mframeUrl);
                xhttp.send();
            };
            return Loader;
        }());
        Templates.Loader = Loader;
        window['Loader'] = window['Loader'] || new Loader();
    })(Templates = Mvision.Templates || (Mvision.Templates = {}));
})(Mvision || (Mvision = {}));
