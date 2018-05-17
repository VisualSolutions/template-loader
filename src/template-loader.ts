///</// <reference path="player.d.ts" />


module Mvision.Templates {

    class QueryStrings {
        public static Data = 'data';
        public static PlayId = 'playId';
        public static PlatformType = 'platformType';
        public static AutoPlay = 'autoPlay';
        public static Duration = 'duration';
    }

    export class PlaybackConstants {
        public static DurationAuto = -1;
    }

    class PlaybackCommands {
        public static OpenMediaInZone = 'openMediaInZone';
        public static PlaybackActionInZone = 'playbackActionInZone';
        public static PlaylistDataRequest = 'playlistDataRequest';
        public static VotingPlaylistRequest = 'votingPlaylistRequest';
        public static RegisterNotifications = 'registerNotifications';
        public static CreateCustomZone = 'createCustomZone';
        public static DeleteCustomZone = 'deleteCustomZone';
        public static ClosePlaybackApp = 'closePlaybackApp';
        public static OpenHomeApp = 'openHomeApp';
        public static OpenVodApp = 'openVodApp';
        public static OpenDiagnosticsApp = 'openDiagnosticsApp';
        public static OpenSettingsApp = 'openSettingsApp';
        public static OpenApp = 'openApp';
        public static SendChannelMessage = 'sendChannelMessage';
        public static JoinChannel = 'joinChannel';
        public static SendSerialMessage = 'sendSerialMessage';
    }

    export class Param {
        constructor(public name: string, public type: string, public value: any) {
        }
    }

    export class Component {
        static CreateTypelessComponent(name: string, params: Param[]) {
            return new this(name, null, params);
        }
        constructor(public name: string, public type: string, public params: Param[]) {
        }
    }

    export class ComponentV1 {
        constructor(public type, public value) {
        }
    }

    export class PreviewPlayer implements PlayerExternal.PlayerApi {
        mediaFinished(playId: number): void {
            if (window.frameElement) {
                window.parent.postMessage( {
                    id: window.frameElement.id,
                    action: 'mediaFinished',
                    playId: playId
                }, "*");
            }
        }

        mediaError(playId: number, message: string): void {
            if (window.frameElement) {
                window.parent.postMessage( {
                    id: window.frameElement.id,
                    action: 'mediaError',
                    playId: playId,
                    message: message
                }, "*");
            }
        }

        mediaReady(playId: number, started: boolean): void {
            if(window.frameElement) {
                window.parent.postMessage( {
                    id: window.frameElement.id,
                    action: 'mediaReady',
                    playId: playId,
                    started: started
                }, "*");
            }
        }

        getParameter(key: string): string {
            return null;
        }

        openMediaInZone(playId: number, mediaId: string, zoneId: number): void {

        }

        executeCommand(playId: number, commandName: string, commandParamsJson: string): void {

        }

        addPlaybackListener(playId: number, callbackFunction: string): void {

        }
    }


    export class Loader {
        private dataJson: string;
        private playId: number;
        private platformType: string;
        private duration: number;
        private started: boolean;
        private componentsPromise: Promise<Component[]>;
        private componentsPromiseResolve: (data: Component[]) => void;
        private startPromise: Promise<void>;
        private startPromiseResolve: () => void;

        private globalCallbackMethodNameCounter: number;

        constructor() {
            this.globalCallbackMethodNameCounter = 0;

            if (!window.Player) {
                window.Player = new PreviewPlayer();
                window.addEventListener('message', (event) => {
                    if (event && event.data && event.data.action && event.data.action === 'play') {
                        this.play();
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

            this.startPromise = new Promise<void>((resolve, reject) => {
                this.startPromiseResolve = resolve;
            });
            if (this.started) {
                this.startPromiseResolve();
            }

            this.componentsPromise = new Promise<Component[]>((resolve, reject) => {
                this.componentsPromiseResolve = resolve;
            });
            this.getDataJson();
        }

        private getNextGlobalCallbackMethodName(): string {
            this.globalCallbackMethodNameCounter = this.globalCallbackMethodNameCounter + 1;
            return "mvisionGlobalCallbackMethodName" + this.globalCallbackMethodNameCounter;
        }

        public setComponents(components:any): void {
            this.componentsPromise = new Promise<Component[]>((resolve, reject) => {
                this.componentsPromiseResolve = resolve;
                this.componentsPromiseResolve(components);
            });
        }

        public getComponents(): Promise<Component[]> {
            return this.componentsPromise;
        }

        public isStarted(): Promise<void> {
            return this.startPromise;
        }

        public getPlatformType():string {
            return this.platformType;
        }

        public getDuration():number {
            return this.duration;
        }

        public ifDurationNotSetEndIn(templateDurationInSeconds:number) {
            if (this.duration == PlaybackConstants.DurationAuto) {
                setTimeout(this.finished, templateDurationInSeconds * 1000);
            }
        }

        public ready(): void {
            window.Player.mediaReady(this.playId, this.started);
        }

        public error(message: string): void {
            if (!message) {
                message = "Unspecified error.";
            }
            window.Player.mediaError(this.playId, message);
        }

        public finished(): void {
            window.Player.mediaFinished(this.playId);
        }

        public getPlayerParameter(key: string): string {
            try {
                return window.Player.getParameter(key);
            } catch (err) {
                // method not implemented
            }
            return null;
        }

        public openMediaInZone(mediaId: string, zoneId: number, loop: boolean = false, startMode: string = null): void {
            try {
                if (!loop && !startMode) {
                    // legacy method, for android players with version 5.4.2-190102
                    // should delete this conditional in the future
                    window.Player.openMediaInZone(this.playId, mediaId, zoneId);
                } else {
                    this.executeCommand(PlaybackCommands.OpenMediaInZone,
                            {mediaId:mediaId, zoneId:zoneId, loop:loop, startMode: startMode});
                }
            } catch (err) {
                // method not implemented
            }
        }

        public stopPlaybackInZone(zoneId: number): void {
            this.executeCommand(PlaybackCommands.PlaybackActionInZone, {type:"STOP", zoneId:zoneId});
        }

        public resumeLoopPlaybackInZone(zoneId: number): void {
            this.executeCommand(PlaybackCommands.PlaybackActionInZone, {type:"RESUME_LOOP_PLAYBACK", zoneId:zoneId});
        }

        public clearPendingEventsInZone(zoneId: number): void {
            this.executeCommand(PlaybackCommands.PlaybackActionInZone, {type:"CLEAR_PENDING_EVENTS", zoneId:zoneId});
        }

        public createCustomZone(zoneName: string, left: number, top: number, width: number, height: number, persistent: boolean, behind: boolean = false): void {
            this.executeCommand(PlaybackCommands.CreateCustomZone, {zoneName:zoneName, behind:behind, persistent:persistent, coordinates:{left:left, top:top, width:width, height:height}});
        }

        public deleteCustomZone(zoneName: string): void {
            this.executeCommand(PlaybackCommands.DeleteCustomZone, {zoneName:zoneName});
        }

        public openMediaInCustomZone(mediaId: string, zoneName: string, loop: boolean = false, startMode: string = null): void {
            this.executeCommand(PlaybackCommands.OpenMediaInZone,
                    {mediaId:mediaId, zoneName:zoneName, loop:loop, startMode: startMode});
        }

        public stopPlaybackInCustomZone(zoneName: string): void {
            this.executeCommand(PlaybackCommands.PlaybackActionInZone, {type:"STOP", zoneName:zoneName});
        }

        public resumeLoopPlaybackInCustomZone(zoneName: string): void {
            this.executeCommand(PlaybackCommands.PlaybackActionInZone, {type:"RESUME_LOOP_PLAYBACK", zoneName:zoneName});
        }

        public clearPendingEventsInCustomZone(zoneName: string): void {
            this.executeCommand(PlaybackCommands.PlaybackActionInZone, {type:"CLEAR_PENDING_EVENTS", zoneName:zoneName});
        }

        public closePlaybackApp(): void {
            this.executeCommand(PlaybackCommands.ClosePlaybackApp, {});
        }

        public openHomeApp(): void {
            this.executeCommand(PlaybackCommands.OpenHomeApp, {});
        }

        public openVodApp(): void {
            this.executeCommand(PlaybackCommands.OpenVodApp, {});
        }

        public openDiagnosticsApp(): void {
            this.executeCommand(PlaybackCommands.OpenDiagnosticsApp, {});
        }

        public openSettingsApp(): void {
            this.executeCommand(PlaybackCommands.OpenSettingsApp, {});
        }

        public openApp(appId:String): void {
            this.executeCommand(PlaybackCommands.OpenApp, {appId:appId});
        }

        public getMusicStreamTracks(callbackFunction): void {
            this.executeCommand(PlaybackCommands.PlaylistDataRequest,
                {dataType: "MUSIC_TRACKS_LIST", responseCallbackMethod: callbackFunction.name});
        }

        public getPlaylistContainerItems(playlistId: number, callbackFunction): void {
            this.executeCommand(PlaybackCommands.PlaylistDataRequest,
                {dataType: "PLAYLIST_CONTAINER_ITEMS", referenceItem: playlistId, responseCallbackMethod: callbackFunction.name});
        }

        public voteMusicTrack(id: number): void {
            this.executeCommand(PlaybackCommands.VotingPlaylistRequest,
                {action: "VOTE", referenceItem: id});
        }

        public getVotedTracks(callbackFunction): void {
            this.executeCommand(PlaybackCommands.VotingPlaylistRequest,
                {action: "GET_VOTED_ITEMS", responseCallbackMethod: callbackFunction.name});
        }

        public addPlaybackListener(callbackFunction): void {
            try {
                window.Player.addPlaybackListener(this.playId, callbackFunction.name);
            } catch (err) {
                console.log("Error while calling Player method: " + err);
            }
        }

        public addPlaylistUpdateListener(callbackFunction): void {
            this.executeCommand(PlaybackCommands.RegisterNotifications,
                    {notificationType:"PLAYBACK_STREAM_UPDATED", callbackMethod:callbackFunction.name});
        }
        
        public sendChannelMessage(clientId: string, channelName: string, payload: string): void {
            this.executeCommand(PlaybackCommands.SendChannelMessage,
                {clientId:clientId, channelName:channelName, payload:payload});
        }

        public joinChannel(clientId: string, channelName: string, callbackFunction): void {
            this.executeCommand(PlaybackCommands.JoinChannel,
                {clientId:clientId, channelName:channelName, callbackMethod:callbackFunction.name});
        }

        public sendSerialMessageToConnectedDevice(baudRate: number, dataType: string, data: string): Promise<string> {
            return this.sendSerialMessageToTargetDevice(null, baudRate, dataType, data);
        }

        public sendSerialMessageToTargetDevice(targetProductId: string, baudRate: number, dataType: string, data: string): Promise<string> {
            return this.executeCommandReturnPromise(
                PlaybackCommands.SendSerialMessage,
                {
                    serialMessageRequest: {
                        targetProductId:targetProductId,
                        baudRate:baudRate, 
                        dataType:dataType, 
                        data:data
                    }
                }
            );
        }

        public executeCommand(commandName: string, commandParams: Object): void {
            try {
                window.Player.executeCommand(this.playId, commandName, JSON.stringify(commandParams));
            } catch (err) {
                console.log("Error while calling Player method: " + err);
            }
        }

        public executeCommandReturnPromise(commandName: string, commandParams: Object): Promise<string> {
            const successMethodName = this.getNextGlobalCallbackMethodName();
            const errorMethodName = this.getNextGlobalCallbackMethodName();
            const finalPlayId = this.playId;
            return new Promise<string>(function(resolve, reject) {
                const clearData = function() {
                    delete window[successMethodName];
                    delete window[errorMethodName];
                }

                window[successMethodName] = function(response) {
                    clearData();
                    resolve(response);
                };
                
                window[errorMethodName] = function(errorMessage) {
                    clearData();
                    reject(new Error(errorMessage));
                };

                commandParams["responseCallbackMethod"] = successMethodName;
                commandParams["errorCallbackMethod"] = errorMethodName;

                try {
                    window.Player.executeCommand(finalPlayId, commandName, JSON.stringify(commandParams));
                } catch (err) {
                    clearData();
                    reject(err);
                }
            });
        }

        public play() {
            if (!this.started) {
                this.started = true;
                this.startPromiseResolve();
            }
        }

        private getParameterByName(name, url = window.location.href) {
            if (!url) url = window.location.href;
            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        }

        private getDataJson() {
            var mframeUrl = this.dataJson;
            if (!mframeUrl) {
                mframeUrl = 'mframe.json?timestamp=' + new Date().getTime();
            }

            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = () => {
                if (this.platformType === "tizen") {
                    if (xhttp.readyState === 4) {
                        if (xhttp.status === 200 || xhttp.status === 0) {
                            if (xhttp.responseText !== null) {
                                try {
                                    var dataJson = JSON.parse(xhttp.responseText);
                                    components = [];
                                    dataJson.components.forEach(c => {
                                        if (typeof c.type === 'number' && c.params) {
                                            // Hack to allow old/deprecated components.
                                            components.push(<any>new ComponentV1(c.type, c.params.value));
                                        }
                                        if (typeof c.type === 'string') {
                                            components.push(new Component(c.name, c.type, c.params.map(p => new Param(p.name, p.type, p.value))));
                                        }
                                        else {
                                            components.push(Component.CreateTypelessComponent(c.name, c.params.map(p => new Param(p.name, p.type, p.value))));
                                        }
                                    });
                                } catch (err) {
                                    this.error("Error parsing " + mframeUrl + ": " + err.toString());
                                    return;
                                }

                                this.componentsPromiseResolve(components);
                            } else {
                                xhttp.open('GET', mframeUrl);
                                xhttp.send();
                            }
                        }
                    }

                } else {
                    if (xhttp.readyState === 4 && xhttp.status === 200) {
                        var components: Component[];
                        try {
                            var dataJson = JSON.parse(xhttp.responseText);
                            components = [];
                            dataJson.components.forEach(c => {
                                if (typeof c.type === 'number' && c.params) {
                                    // Hack to allow old/deprecated components.
                                    components.push(<any>new ComponentV1(c.type, c.params.value));
                                }
                                if (typeof c.type === 'string') {
                                    components.push(new Component(c.name, c.type, c.params.map(p => new Param(p.name, p.type, p.value))));
                                }
                                else {
                                    components.push(Component.CreateTypelessComponent(c.name, c.params.map(p => new Param(p.name, p.type, p.value))));
                                }
                            });
                        } catch (err) {
                            this.error("Error parsing " + mframeUrl + ": " + err.toString());
                            return;
                        }

                        this.componentsPromiseResolve(components);
                    } else if (xhttp.readyState === 4) {
                        this.error("Error loading " + mframeUrl + ", httpStatus=" + xhttp.status);
                    }
                };
            }

            xhttp.open('GET', mframeUrl);
            xhttp.send();
        }
    }

    window['Loader'] = window['Loader'] || new Loader();
}
