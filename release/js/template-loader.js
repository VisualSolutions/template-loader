///</// <reference path="player.d.ts" />
var Mvision;
(function (Mvision) {
    var Templates;
    (function (Templates) {
        var QueryStrings = /** @class */ (function () {
            function QueryStrings() {
            }
            QueryStrings.Data = 'data';
            QueryStrings.PlayId = 'playId';
            QueryStrings.PlatformType = 'platformType';
            QueryStrings.AutoPlay = 'autoPlay';
            QueryStrings.Duration = 'duration';
            return QueryStrings;
        }());
        var PlaybackConstants = /** @class */ (function () {
            function PlaybackConstants() {
            }
            PlaybackConstants.DurationAuto = -1;
            return PlaybackConstants;
        }());
        Templates.PlaybackConstants = PlaybackConstants;
        var PlaybackCommands = /** @class */ (function () {
            function PlaybackCommands() {
            }
            PlaybackCommands.OpenMediaInZone = 'openMediaInZone';
            PlaybackCommands.PlaybackActionInZone = 'playbackActionInZone';
            PlaybackCommands.PlaylistDataRequest = 'playlistDataRequest';
            PlaybackCommands.VotingPlaylistRequest = 'votingPlaylistRequest';
            PlaybackCommands.RegisterNotifications = 'registerNotifications';
            PlaybackCommands.CreateCustomZone = 'createCustomZone';
            PlaybackCommands.DeleteCustomZone = 'deleteCustomZone';
            PlaybackCommands.ClosePlaybackApp = 'closePlaybackApp';
            PlaybackCommands.OpenHomeApp = 'openHomeApp';
            PlaybackCommands.OpenVodApp = 'openVodApp';
            PlaybackCommands.OpenDiagnosticsApp = 'openDiagnosticsApp';
            PlaybackCommands.OpenSettingsApp = 'openSettingsApp';
            PlaybackCommands.OpenApp = 'openApp';
            PlaybackCommands.SendChannelMessage = 'sendChannelMessage';
            PlaybackCommands.JoinChannel = 'joinChannel';
            PlaybackCommands.SendSerialMessage = 'sendSerialMessage';
            PlaybackCommands.ReceiveSerialMessages = 'receiveSerialMessages';
            PlaybackCommands.GetNewAnalyticsSessionId = 'getNewAnalyticsSessionId';
            PlaybackCommands.CreateAnalyticsLog = 'createAnalyticsLog';
            PlaybackCommands.IsMediaFileAvailable = 'isMediaFileAvailable';
            return PlaybackCommands;
        }());
        var Param = /** @class */ (function () {
            function Param(name, type, value) {
                this.name = name;
                this.type = type;
                this.value = value;
            }
            return Param;
        }());
        Templates.Param = Param;
        var Component = /** @class */ (function () {
            function Component(name, type, params) {
                this.name = name;
                this.type = type;
                this.params = params;
            }
            Component.CreateTypelessComponent = function (name, params) {
                return new this(name, null, params);
            };
            return Component;
        }());
        Templates.Component = Component;
        var ComponentV1 = /** @class */ (function () {
            function ComponentV1(type, value) {
                this.type = type;
                this.value = value;
            }
            return ComponentV1;
        }());
        Templates.ComponentV1 = ComponentV1;
        var PreviewPlayer = /** @class */ (function () {
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
            PreviewPlayer.prototype.getParameter = function (key) {
                return null;
            };
            PreviewPlayer.prototype.openMediaInZone = function (playId, mediaId, zoneId) {
            };
            PreviewPlayer.prototype.executeCommand = function (playId, commandName, commandParamsJson) {
            };
            PreviewPlayer.prototype.addPlaybackListener = function (playId, callbackFunction) {
            };
            return PreviewPlayer;
        }());
        Templates.PreviewPlayer = PreviewPlayer;
        var Loader = /** @class */ (function () {
            function Loader() {
                var _this = this;
                this.globalCallbackMethodNameCounter = 0;
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
            Loader.prototype.getNextGlobalCallbackMethodName = function () {
                this.globalCallbackMethodNameCounter = this.globalCallbackMethodNameCounter + 1;
                return "mvisionGlobalCallbackMethodName" + this.globalCallbackMethodNameCounter;
            };
            Loader.prototype.setComponents = function (components) {
                var _this = this;
                this.componentsPromise = new Promise(function (resolve, reject) {
                    _this.componentsPromiseResolve = resolve;
                    _this.componentsPromiseResolve(components);
                });
            };
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
            Loader.prototype.getPlayerParameter = function (key) {
                try {
                    return window.Player.getParameter(key);
                }
                catch (err) {
                    // method not implemented
                }
                return null;
            };
            Loader.prototype.openMediaInZone = function (mediaId, zoneId, loop, startMode) {
                if (loop === void 0) { loop = false; }
                if (startMode === void 0) { startMode = null; }
                try {
                    if (!loop && !startMode) {
                        // legacy method, for android players with version 5.4.2-190102
                        // should delete this conditional in the future
                        window.Player.openMediaInZone(this.playId, mediaId, zoneId);
                    }
                    else {
                        this.executeCommand(PlaybackCommands.OpenMediaInZone, { mediaId: mediaId, zoneId: zoneId, loop: loop, startMode: startMode });
                    }
                }
                catch (err) {
                    // method not implemented
                }
            };
            Loader.prototype.stopPlaybackInZone = function (zoneId) {
                this.executeCommand(PlaybackCommands.PlaybackActionInZone, { type: "STOP", zoneId: zoneId });
            };
            Loader.prototype.resumeLoopPlaybackInZone = function (zoneId) {
                this.executeCommand(PlaybackCommands.PlaybackActionInZone, { type: "RESUME_LOOP_PLAYBACK", zoneId: zoneId });
            };
            Loader.prototype.clearPendingEventsInZone = function (zoneId) {
                this.executeCommand(PlaybackCommands.PlaybackActionInZone, { type: "CLEAR_PENDING_EVENTS", zoneId: zoneId });
            };
            Loader.prototype.createCustomZone = function (zoneName, left, top, width, height, persistent, behind, loopingMediaId) {
                if (behind === void 0) { behind = false; }
                if (loopingMediaId === void 0) { loopingMediaId = null; }
                this.executeCommand(PlaybackCommands.CreateCustomZone, {
                    zoneName: zoneName,
                    coordinates: { left: left, top: top, width: width, height: height },
                    behind: behind,
                    persistent: persistent,
                    loopingPlaylistItemId: loopingMediaId
                });
            };
            Loader.prototype.deleteCustomZone = function (zoneName) {
                this.executeCommand(PlaybackCommands.DeleteCustomZone, { zoneName: zoneName });
            };
            Loader.prototype.openMediaInCustomZone = function (mediaId, zoneName, loop, startMode) {
                if (loop === void 0) { loop = false; }
                if (startMode === void 0) { startMode = null; }
                this.executeCommand(PlaybackCommands.OpenMediaInZone, { mediaId: mediaId, zoneName: zoneName, loop: loop, startMode: startMode });
            };
            Loader.prototype.stopPlaybackInCustomZone = function (zoneName) {
                this.executeCommand(PlaybackCommands.PlaybackActionInZone, { type: "STOP", zoneName: zoneName });
            };
            Loader.prototype.resumeLoopPlaybackInCustomZone = function (zoneName) {
                this.executeCommand(PlaybackCommands.PlaybackActionInZone, { type: "RESUME_LOOP_PLAYBACK", zoneName: zoneName });
            };
            Loader.prototype.clearPendingEventsInCustomZone = function (zoneName) {
                this.executeCommand(PlaybackCommands.PlaybackActionInZone, { type: "CLEAR_PENDING_EVENTS", zoneName: zoneName });
            };
            Loader.prototype.closePlaybackApp = function () {
                this.executeCommand(PlaybackCommands.ClosePlaybackApp, {});
            };
            Loader.prototype.openHomeApp = function () {
                this.executeCommand(PlaybackCommands.OpenHomeApp, {});
            };
            Loader.prototype.openVodApp = function () {
                this.executeCommand(PlaybackCommands.OpenVodApp, {});
            };
            Loader.prototype.openDiagnosticsApp = function () {
                this.executeCommand(PlaybackCommands.OpenDiagnosticsApp, {});
            };
            Loader.prototype.openSettingsApp = function (params) {
                if (params === void 0) { params = {}; }
                this.executeCommand(PlaybackCommands.OpenSettingsApp, params);
            };
            Loader.prototype.openApp = function (appId) {
                this.executeCommand(PlaybackCommands.OpenApp, { appId: appId });
            };
            Loader.prototype.getMusicStreamTracks = function (callbackFunction) {
                this.executeCommand(PlaybackCommands.PlaylistDataRequest, { dataType: "MUSIC_TRACKS_LIST", responseCallbackMethod: callbackFunction.name });
            };
            Loader.prototype.getPlaylistContainerItems = function (playlistId, callbackFunction) {
                this.executeCommand(PlaybackCommands.PlaylistDataRequest, { dataType: "PLAYLIST_CONTAINER_ITEMS", referenceItem: playlistId, responseCallbackMethod: callbackFunction.name });
            };
            Loader.prototype.voteMusicTrack = function (id) {
                this.executeCommand(PlaybackCommands.VotingPlaylistRequest, { action: "VOTE", referenceItem: id });
            };
            Loader.prototype.getVotedTracks = function (callbackFunction) {
                this.executeCommand(PlaybackCommands.VotingPlaylistRequest, { action: "GET_VOTED_ITEMS", responseCallbackMethod: callbackFunction.name });
            };
            Loader.prototype.addPlaybackListener = function (callbackFunction) {
                try {
                    window.Player.addPlaybackListener(this.playId, callbackFunction.name);
                }
                catch (err) {
                    console.log("Error while calling Player method: " + err);
                }
            };
            Loader.prototype.addPlaylistUpdateListener = function (callbackFunction) {
                this.executeCommand(PlaybackCommands.RegisterNotifications, { notificationType: "PLAYBACK_STREAM_UPDATED", callbackMethod: callbackFunction.name });
            };
            Loader.prototype.addActiveMusicPlaylistChangeListener = function (callbackFunction) {
                this.executeCommand(PlaybackCommands.RegisterNotifications, { notificationType: "ACTIVE_MUSIC_PLAYLIST_CHANGED", callbackMethod: callbackFunction.name });
            };
            Loader.prototype.sendChannelMessage = function (clientId, channelName, payload) {
                this.executeCommand(PlaybackCommands.SendChannelMessage, { clientId: clientId, channelName: channelName, payload: payload });
            };
            Loader.prototype.joinChannel = function (clientId, channelName, callbackFunction) {
                this.executeCommand(PlaybackCommands.JoinChannel, { clientId: clientId, channelName: channelName, callbackMethod: callbackFunction.name });
            };
            Loader.prototype.sendSerialMessageToConnectedDevice = function (baudRate, dataType, data, ignoreResponse) {
                if (ignoreResponse === void 0) { ignoreResponse = false; }
                return this.sendSerialMessageToTargetDevice(null, baudRate, dataType, data, ignoreResponse);
            };
            Loader.prototype.sendSerialMessageToTargetDevice = function (targetProductId, baudRate, dataType, data, ignoreResponse) {
                if (ignoreResponse === void 0) { ignoreResponse = false; }
                return this.executeCommandReturnPromise(PlaybackCommands.SendSerialMessage, {
                    serialMessageRequest: {
                        targetProductId: targetProductId,
                        baudRate: baudRate,
                        dataType: dataType,
                        data: data,
                        ignoreResponse: ignoreResponse
                    }
                });
            };
            Loader.prototype.receiveSerialMessagesFromConnectedDevice = function (baudRate, dataType, retryOnError, callbackFunction, errorCallbackFunction) {
                this.receiveSerialMessagesFromTargetDevice(null, baudRate, dataType, retryOnError, callbackFunction, errorCallbackFunction);
            };
            Loader.prototype.receiveSerialMessagesFromTargetDevice = function (targetProductId, baudRate, dataType, retryOnError, callbackFunction, errorCallbackFunction) {
                this.executeCommand(PlaybackCommands.ReceiveSerialMessages, {
                    serialMessageRequest: {
                        targetProductId: targetProductId,
                        baudRate: baudRate,
                        dataType: dataType
                    },
                    retryOnError: retryOnError,
                    callbackMethod: callbackFunction.name,
                    errorCallbackMethod: errorCallbackFunction.name
                });
            };
            Loader.prototype.getNewAnalyticsSessionId = function () {
                return this.executeCommand(PlaybackCommands.GetNewAnalyticsSessionId, null);
            };
            Loader.prototype.createAnalyticsEvent = function (userTriggered, sessionId, customParameters) {
                this.executeCommand(PlaybackCommands.CreateAnalyticsLog, {
                    userTriggered: userTriggered,
                    sessionId: sessionId,
                    customParameters: customParameters
                });
            };
            Loader.prototype.isMediaFileAvailable = function (mediaId) {
                var resultString = this.executeCommand(PlaybackCommands.IsMediaFileAvailable, mediaId);
                return resultString == "true";
            };
            Loader.prototype.sendDatagramMessage = function (targetAddress, port, dataType, message) {
                return this.executeCommandReturnPromise("DATAGRAM_SEND", {
                    targetAddress: targetAddress,
                    port: port,
                    dataType: dataType,
                    message: message
                });
            };
            Loader.prototype.receiveDatagramMessages = function (multicastAddress, port, dataType, callbackFunction, errorCallbackFunction) {
                this.executeCommand("DATAGRAM_RECEIVE", {
                    multicastAddress: multicastAddress,
                    port: port,
                    dataType: dataType,
                    callbackMethod: callbackFunction.name,
                    errorCallbackMethod: errorCallbackFunction.name
                });
            };
            Loader.prototype.executeCommand = function (commandName, commandParams) {
                try {
                    return window.Player.executeCommand(this.playId, commandName, JSON.stringify(commandParams));
                }
                catch (err) {
                    console.log("Error while calling Player method: " + err);
                    return null;
                }
            };
            Loader.prototype.executeCommandReturnPromise = function (commandName, commandParams) {
                var successMethodName = this.getNextGlobalCallbackMethodName();
                var errorMethodName = this.getNextGlobalCallbackMethodName();
                var finalPlayId = this.playId;
                return new Promise(function (resolve, reject) {
                    var clearData = function () {
                        delete window[successMethodName];
                        delete window[errorMethodName];
                    };
                    window[successMethodName] = function (response) {
                        clearData();
                        resolve(response);
                    };
                    window[errorMethodName] = function (errorMessage) {
                        clearData();
                        reject(new Error(errorMessage));
                    };
                    /**
                     * "responseCallbackMethod" is deprecated on the player side replace with "callbackMethod" in a future version when most players would have upgraded
                     */
                    commandParams["responseCallbackMethod"] = successMethodName;
                    commandParams["errorCallbackMethod"] = errorMethodName;
                    try {
                        window.Player.executeCommand(finalPlayId, commandName, JSON.stringify(commandParams));
                    }
                    catch (err) {
                        clearData();
                        reject(err);
                    }
                });
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
                    if (_this.platformType === "tizen") {
                        if (xhttp.readyState === 4) {
                            if (xhttp.status === 200 || xhttp.status === 0) {
                                if (xhttp.responseText !== null) {
                                    try {
                                        var dataJson = JSON.parse(xhttp.responseText);
                                        components = [];
                                        dataJson.components.forEach(function (c) {
                                            if (typeof c.type === 'number' && c.params) {
                                                // Hack to allow old/deprecated components.
                                                components.push(new ComponentV1(c.type, c.params.value));
                                            }
                                            if (typeof c.type === 'string') {
                                                components.push(new Component(c.name, c.type, c.params.map(function (p) { return new Param(p.name, p.type, p.value); })));
                                            }
                                            else {
                                                components.push(Component.CreateTypelessComponent(c.name, c.params.map(function (p) { return new Param(p.name, p.type, p.value); })));
                                            }
                                        });
                                    }
                                    catch (err) {
                                        _this.error("Error parsing " + mframeUrl + ": " + err.toString());
                                        return;
                                    }
                                    _this.componentsPromiseResolve(components);
                                }
                                else {
                                    xhttp.open('GET', mframeUrl);
                                    xhttp.send();
                                }
                            }
                        }
                    }
                    else {
                        if (xhttp.readyState === 4 && xhttp.status === 200) {
                            var components;
                            try {
                                var dataJson = JSON.parse(xhttp.responseText);
                                components = [];
                                dataJson.components.forEach(function (c) {
                                    if (typeof c.type === 'number' && c.params) {
                                        // Hack to allow old/deprecated components.
                                        components.push(new ComponentV1(c.type, c.params.value));
                                    }
                                    if (typeof c.type === 'string') {
                                        components.push(new Component(c.name, c.type, c.params.map(function (p) { return new Param(p.name, p.type, p.value); })));
                                    }
                                    else {
                                        components.push(Component.CreateTypelessComponent(c.name, c.params.map(function (p) { return new Param(p.name, p.type, p.value); })));
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
                    }
                    ;
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
