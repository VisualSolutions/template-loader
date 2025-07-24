import { IPlayer } from "./IPlayer";
import { RemotePlayer } from "./RemotePlayer";
import { PlayerCommunicator } from "./PlayerCommunicator";
import { IPlayerCommunicator, Message } from "./IPlayerCommunicator";
import { callMethod } from "./utils";
import { DummyPlayer } from "./DummyPlayer";

type StartupParameters = {
    playId: number;
    platformType: string;
    platformTypeHeadless: boolean;
    duration: number;
    mframeUrl: string;
    mframeData: string | null;
    autoPlay: boolean;
}

declare global {
    interface Window {
        LoaderStartupParameters: StartupParameters;
        Player: IPlayer;
        Loader: Loader;
    }
}

export class PlaybackConstants {
    public static DurationAuto = -1;
}

class LegacyPlaybackCommandsAliases {
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
    public static ReceiveSerialMessages = 'receiveSerialMessages';
    public static GetNewAnalyticsSessionId = 'getNewAnalyticsSessionId';
    public static CreateAnalyticsLog = 'createAnalyticsLog';
    public static IsMediaFileAvailable = 'isMediaFileAvailable';
}

export class Loader {
    
    private readonly startupParameters: StartupParameters;
    private readonly communicator: IPlayerCommunicator;

    private started: boolean;
    private componentsPromise: Promise<any>;
    private componentsPromiseResolve: (data: any) => void;
    private startPromise: Promise<void>;
    private startPromiseResolve: () => void;

    private globalCallbackMethodNameCounter: number;

    constructor() {
        this.startupParameters = Loader.readStartupParameters();
        this.communicator = Loader.initializeCommunicator(message => this.executeCommand("COMMUNICATOR_MESSAGE", message));

        this.globalCallbackMethodNameCounter = 0;
        this.started = this.startupParameters.autoPlay;

        if (!window.Player) {
            if (window.self !== window.top) {
                window.Player = Loader.createIframePlayer();
            } else {
                window.Player = new DummyPlayer();
            }
        }

        this.startPromise = new Promise<void>((resolve, reject) => {
            this.startPromiseResolve = resolve;
        });

        if (this.started) {
            this.startPromiseResolve();
        }

        this.componentsPromise = new Promise<any>((resolve, reject) => {
            this.componentsPromiseResolve = resolve;
        });
    }

    private static createIframePlayer(): IPlayer {
        window.addEventListener('message', function(message) {
            if (!message 
                || !message.data 
                || !message.data.payload
                || "MvisionPlayerApi" != message.data.channel) {
                return;
            }

            if (message.data.payload.type === "ExecuteJavaScript") {
                callMethod(window, message.data.payload.method, message.data.payload.params);
            }
        });

        return new RemotePlayer(function(message) {
            window.parent.postMessage(
                {
                    channel: "MvisionPlayerApi",
                    payload: message
                },
                "*"
            );
        })
    }

    private static readStartupParameters(): StartupParameters {
        if (window.LoaderStartupParameters) {
            return window.LoaderStartupParameters;
        }

        const urlSearchParams = new URLSearchParams(window.location.search);
        return {
            mframeUrl: urlSearchParams.get("data") || "./mframe.json?timestamp=" + Date.now(),
            mframeData: null,
            playId: parseInt(urlSearchParams.get("playId") || "0"),
            duration: parseInt(urlSearchParams.get("duration") || PlaybackConstants.DurationAuto.toString()),
            autoPlay: (urlSearchParams.get("autoPlay") || "true").toLowerCase() !== "false",
            platformType: urlSearchParams.get("platformType") || "unknown",
            platformTypeHeadless: false,
        };
    }

    private static initializeCommunicator(messageSender: (message: Message) => void): IPlayerCommunicator {
        const communicator: PlayerCommunicator = new PlayerCommunicator(messageSender);
        window["messageFromPlayer"] = (message: Message) => {
            communicator.onMessageReceived(message);
        };
        return communicator;
    }

    private getNextGlobalCallbackMethodName(): string {
        this.globalCallbackMethodNameCounter = this.globalCallbackMethodNameCounter + 1;
        return "mvisionGlobalCallbackMethodName" + this.globalCallbackMethodNameCounter;
    }

    public getComponents(): Promise<any> {
        return this.componentsPromise;
    }

    public getCommunicator(): IPlayerCommunicator {
        return this.communicator;
    }

    public isStarted(): Promise<void> {
        return this.startPromise;
    }

    public getPlatformType():string {
        return this.startupParameters.platformType;
    }

    public isHeadlessPlatform():boolean {
        return this.startupParameters.platformTypeHeadless;
    }

    public getDuration():number {
        return this.startupParameters.duration;
    }

    public ifDurationNotSetEndIn(templateDurationInSeconds:number) {
        if (this.startupParameters.duration == PlaybackConstants.DurationAuto) {
            setTimeout(this.finished, templateDurationInSeconds * 1000);
        }
    }

    public ready(): void {
        window.Player.mediaReady(this.startupParameters.playId, this.started);
    }

    public error(message: string): void {
        if (!message) {
            message = "Unspecified error.";
        }
        window.Player.mediaError(this.startupParameters.playId, message);
    }

    public finished(): void {
        window.Player.mediaFinished(this.startupParameters.playId);
    }

    public getPlayerParameter(key: string): string {
        try {
            return window.Player.getParameter(key);
        } catch (err) {
            // method not implemented
        }
        return null;
    }

    public getPlayerParameters(keys: string[]): Promise<string[]> {
        return this.executeCommandReturnPromise(
            "GET_SITE_PARAMETERS",
            {
                keys: keys
            }
        );
    }

    public openMediaInZone(mediaId: string, zoneId: number, loop: boolean = false, startMode: string = null): void {
        this.executeCommand(LegacyPlaybackCommandsAliases.OpenMediaInZone, {mediaId:mediaId, zoneId:zoneId, loop:loop, startMode: startMode});
    }

    public stopPlaybackInZone(zoneId: number): void {
        this.executeCommand(LegacyPlaybackCommandsAliases.PlaybackActionInZone, {type:"STOP", zoneId:zoneId});
    }

    public resumeLoopPlaybackInZone(zoneId: number): void {
        this.executeCommand(LegacyPlaybackCommandsAliases.PlaybackActionInZone, {type:"RESUME_LOOP_PLAYBACK", zoneId:zoneId});
    }

    public clearPendingEventsInZone(zoneId: number): void {
        this.executeCommand(LegacyPlaybackCommandsAliases.PlaybackActionInZone, {type:"CLEAR_PENDING_EVENTS", zoneId:zoneId});
    }

    public playNextInZone(zoneId: number): void {
        this.executeCommand(LegacyPlaybackCommandsAliases.PlaybackActionInZone, {type:"PLAY_NEXT", zoneId:zoneId});
    }

    public createCustomZone(zoneName: string, left: number, top: number, width: number, height: number, persistent: boolean, behind: boolean = false, loopingMediaId: string = null): void {
        this.executeCommand(LegacyPlaybackCommandsAliases.CreateCustomZone, {
            zoneName:zoneName, 
            coordinates:{left:left, top:top, width:width, height:height},
            behind:behind, 
            persistent:persistent,
            loopingPlaylistItemId:loopingMediaId
        });
    }

    public deleteCustomZone(zoneName: string): void {
        this.executeCommand(LegacyPlaybackCommandsAliases.DeleteCustomZone, {zoneName:zoneName});
    }

    public openMediaInCustomZone(mediaId: string, zoneName: string, loop: boolean = false, startMode: string = null): void {
        this.executeCommand(LegacyPlaybackCommandsAliases.OpenMediaInZone,
                {mediaId:mediaId, zoneName:zoneName, loop:loop, startMode: startMode});
    }

    public stopPlaybackInCustomZone(zoneName: string): void {
        this.executeCommand(LegacyPlaybackCommandsAliases.PlaybackActionInZone, {type:"STOP", zoneName:zoneName});
    }

    public resumeLoopPlaybackInCustomZone(zoneName: string): void {
        this.executeCommand(LegacyPlaybackCommandsAliases.PlaybackActionInZone, {type:"RESUME_LOOP_PLAYBACK", zoneName:zoneName});
    }

    public clearPendingEventsInCustomZone(zoneName: string): void {
        this.executeCommand(LegacyPlaybackCommandsAliases.PlaybackActionInZone, {type:"CLEAR_PENDING_EVENTS", zoneName:zoneName});
    }

    public playNextInCustomZone(zoneName: string): void {
        this.executeCommand(LegacyPlaybackCommandsAliases.PlaybackActionInZone, {type:"PLAY_NEXT", zoneName:zoneName});
    }

    public closePlaybackApp(): void {
        this.executeCommand(LegacyPlaybackCommandsAliases.ClosePlaybackApp, {});
    }

    public openHomeApp(): void {
        this.executeCommand(LegacyPlaybackCommandsAliases.OpenHomeApp, {});
    }

    public openVodApp(initialFolderIdentifier: string = null, allowUpNavigationFromInitialFolder: boolean = false): void {
        this.executeCommand(
            LegacyPlaybackCommandsAliases.OpenVodApp, 
            {
                initialFolderIdentifier: initialFolderIdentifier,
                allowUpNavigationFromInitialFolder: allowUpNavigationFromInitialFolder
            }
        );
    }

    public openDiagnosticsApp(): void {
        this.executeCommand(LegacyPlaybackCommandsAliases.OpenDiagnosticsApp, {});
    }

    public openSettingsApp(params: object = {}): void {
        this.executeCommand(LegacyPlaybackCommandsAliases.OpenSettingsApp, params);
    }

    public openApp(appId:string): void {
        this.executeCommand(LegacyPlaybackCommandsAliases.OpenApp, {appId:appId});
    }

    public getMusicStreamTracks(callbackFunction): void {
        this.executeCommand(LegacyPlaybackCommandsAliases.PlaylistDataRequest,
            {dataType: "MUSIC_TRACKS_LIST", responseCallbackMethod: callbackFunction.name});
    }

    public getActiveMusicPlaylistDataAndTracks(callbackFunction): void {
        this.executeCommand(LegacyPlaybackCommandsAliases.PlaylistDataRequest,
            {dataType: "ACTIVE_MUSIC_PLAYLIST_DATA_AND_TRACKS", responseCallbackMethod: callbackFunction.name});
    }

    public getActiveMusicPlaylistData(callbackFunction): void {
        this.executeCommand(LegacyPlaybackCommandsAliases.PlaylistDataRequest,
            {dataType: "ACTIVE_MUSIC_PLAYLIST_DATA", responseCallbackMethod: callbackFunction.name});
    }

    public getPlaylistContainerItems(playlistId: number, callbackFunction): void {
        this.executeCommand(LegacyPlaybackCommandsAliases.PlaylistDataRequest,
            {dataType: "PLAYLIST_CONTAINER_ITEMS", referenceItem: playlistId, responseCallbackMethod: callbackFunction.name});
    }

    public voteMusicTrack(id: number): void {
        this.executeCommand(LegacyPlaybackCommandsAliases.VotingPlaylistRequest,
            {action: "VOTE", referenceItem: id});
    }

    public getVotedTracks(callbackFunction): void {
        this.executeCommand(LegacyPlaybackCommandsAliases.VotingPlaylistRequest,
            {action: "GET_VOTED_ITEMS", responseCallbackMethod: callbackFunction.name});
    }

    public addPlaybackListener(callbackFunction): void {
        try {
            window.Player.addPlaybackListener(this.startupParameters.playId, callbackFunction.name);
        } catch (err) {
            console.log("Error while calling Player method: " + err);
        }
    }

    public addPlaylistUpdateListener(callbackFunction): void {
        this.executeCommand(LegacyPlaybackCommandsAliases.RegisterNotifications,
                {notificationType:"PLAYBACK_STREAM_UPDATED", callbackMethod:callbackFunction.name});
    }

    public addActiveMusicPlaylistChangeListener(callbackFunction): void {
        this.executeCommand(LegacyPlaybackCommandsAliases.RegisterNotifications,
                {notificationType:"ACTIVE_MUSIC_PLAYLIST_CHANGED", callbackMethod:callbackFunction.name});
    }
    
    public sendChannelMessage(clientId: string, channelName: string, payload: string): void {
        this.executeCommand(LegacyPlaybackCommandsAliases.SendChannelMessage,
            {clientId:clientId, channelName:channelName, payload:payload});
    }

    public joinChannel(clientId: string, channelName: string, callbackFunction): void {
        this.executeCommand(LegacyPlaybackCommandsAliases.JoinChannel,
            {clientId:clientId, channelName:channelName, callbackMethod:callbackFunction.name});
    }

    public sendSerialMessageToConnectedDevice(baudRate: number, dataType: string, data: string, ignoreResponse: boolean = false): Promise<string> {
        return this.sendSerialMessageToTargetDevice(null, baudRate, dataType, data, ignoreResponse);
    }

    public sendSerialMessageToTargetDevice(targetProductId: string, baudRate: number, dataType: string, data: string, ignoreResponse: boolean = false): Promise<string> {
        return this.executeCommandReturnPromise(
            LegacyPlaybackCommandsAliases.SendSerialMessage,
            {
                serialMessageRequest: {
                    targetProductId:targetProductId,
                    baudRate:baudRate, 
                    dataType:dataType, 
                    data:data,
                    ignoreResponse:ignoreResponse
                }
            }
        );
    }

    public receiveSerialMessagesFromConnectedDevice(baudRate: number, dataType: string, retryOnError: boolean, callbackFunction, errorCallbackFunction): void {
        this.receiveSerialMessagesFromTargetDevice(null, baudRate, dataType, retryOnError, callbackFunction, errorCallbackFunction);
    }

    public receiveSerialMessagesFromTargetDevice(targetProductId: string, baudRate: number, dataType: string, retryOnError: boolean, callbackFunction, errorCallbackFunction): void {
        this.executeCommand(
            LegacyPlaybackCommandsAliases.ReceiveSerialMessages,
            {
                serialMessageRequest: {
                    targetProductId:targetProductId,
                    baudRate:baudRate, 
                    dataType:dataType
                },
                retryOnError:retryOnError,
                callbackMethod:callbackFunction.name,
                errorCallbackMethod:errorCallbackFunction.name
            }
        );
    }
    
    public getNewAnalyticsSessionId(): string {
        return this.executeCommand(LegacyPlaybackCommandsAliases.GetNewAnalyticsSessionId, null);
    }

    public getNewAnalyticsSessionIdPromise(): Promise<string> {
        return this.executeCommandReturnPromise(
            "GET_NEW_ANALYTICS_SESSION_ID_PROMISE",
            {}
        );
    }

    public createAnalyticsEvent(userTriggered: boolean, sessionId: string, customParameters: object): void {
        this.executeCommand(LegacyPlaybackCommandsAliases.CreateAnalyticsLog, {
            userTriggered: userTriggered,
            sessionId: sessionId,
            customParameters: customParameters
        });
    }

    public isMediaFileAvailable(mediaId: number): boolean {
        return this.executeCommand(LegacyPlaybackCommandsAliases.IsMediaFileAvailable, mediaId) == "true";
    }

    public areMediaFilesAvailable(mediaIds: number[]): Promise<boolean[]> {
        return this.executeCommandReturnPromise(
            "ARE_MEDIA_FILES_AVAILABLE",
            {
                mediaIds: mediaIds
            }
        );
    }

    public sendDatagramMessage(targetAddress: string, port: number, dataType: string, message: string): Promise<string> {
        return this.executeCommandReturnPromise(
            "DATAGRAM_SEND",
            {
                targetAddress:targetAddress,
                port:port, 
                dataType:dataType,
                message:message
            }
        );
    }

    public receiveDatagramMessages(multicastAddress: string, port: number, dataType: string, callbackFunction, errorCallbackFunction): void {
        this.executeCommand(
            "DATAGRAM_RECEIVE",
            {
                multicastAddress:multicastAddress,
                port:port, 
                dataType:dataType,
                callbackMethod:callbackFunction.name,
                errorCallbackMethod:errorCallbackFunction.name
            }
        );
    }

    public setPlaylistItemsSchedules(schedules: Array<object>): void {
        this.executeCommand(
            "SET_PLAYLIST_ITEMS_SCHEDULES",
            schedules
        );
    }

    public executeCommand(commandName: string, commandParams: any): any {
        try {
            return window.Player.executeCommand(this.startupParameters.playId, commandName, JSON.stringify(commandParams));
        } catch (err) {
            console.log("Error while calling Player method: " + err);
            return null;
        }
    }

    public executeCommandReturnPromise(commandName: string, commandParams: any): Promise<any> {
        const successMethodName = this.getNextGlobalCallbackMethodName();
        const errorMethodName = this.getNextGlobalCallbackMethodName();
        const finalPlayId = this.startupParameters.playId
        return new Promise<any>(function(resolve, reject) {
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

            commandParams["callbackMethod"] = successMethodName;
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

    public loadDataJson() {
        if (this.startupParameters.mframeData) {
            try {
                this.componentsPromiseResolve(JSON.parse(this.startupParameters.mframeData).components);
            } catch (err) {
                this.error("Error loading mframe.json: " + err);
            }
            return;
        }

        const httpRequest = new XMLHttpRequest();

        httpRequest.onload = () => {
            try {
                if (httpRequest.status !== 200) {
                    throw new Error("HTTP error statusCode=" + httpRequest.status);
                }
                this.componentsPromiseResolve(JSON.parse(httpRequest.responseText).components);
            } catch (err) {
                this.error("Error loading mframe.json: " + err);
            }
        };

        httpRequest.onerror = () => {
            this.error("Error loading mframe.json: HTTP error statusCode=" + httpRequest.status);
        }

        httpRequest.open('GET', this.startupParameters.mframeUrl, true);
        httpRequest.send();
    }
}

if (!window.Loader) {
    window.Loader = new Loader();
    window.Loader.loadDataJson();
}
