declare namespace PlayerExternal {
    interface PlayerApi {
        mediaFinished(playId: number): void;
        mediaError(playId: number, message: string): void;
        mediaReady(playId: number, started: boolean): void;
        getParameter(key: string): string;
        openMediaInZone(playId: number, mediaId: string, zoneId: number): void;
        executeCommand(playId: number, commandName: string, commandParamsJson: string): void;
        addPlaybackListener(playId: number, callbackFunction: string): void;
    }
}

interface Window { Player: PlayerExternal.PlayerApi; }
