export interface IPlayer {
    mediaFinished(playId: number): void;
    mediaError(playId: number, message: string): void;
    mediaReady(playId: number, started: boolean): void;
    getParameter(key: string): string;
    openMediaInZone(playId: number, mediaId: string, zoneId: number): void;
    executeCommand(playId: number, commandName: string, commandParamsJson: string): void;
    addPlaybackListener(playId: number, callbackFunction: string): void;
}
