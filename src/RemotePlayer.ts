import { IPlayer } from "./IPlayer";

export class RemotePlayer implements IPlayer {
    
    private sendMessageFunction: (message: object) => void;
    
    constructor(sendMessageFunction: (message: object) => void) {
        this.sendMessageFunction = sendMessageFunction;
    }
    
    private executeCommandImpl(playId: number, commandName: string, commandParams: any): void {
        let convertedCommandParams;
        if ((typeof commandParams) === "string") {
            try {
                convertedCommandParams = JSON.parse(commandParams);
            } catch (error) {
                convertedCommandParams = commandParams;
            }
        } else {
            convertedCommandParams = commandParams;
        }
        
        this.sendMessageFunction({
            playId: playId,
            type: commandName,
            params: convertedCommandParams,
        });
    }
    
    public getParameter(key: string):string {
        return null;
    }
    
    public mediaFinished(playId: number): void {
        this.executeCommandImpl(
            playId,
            "PLAYBACK_STATE",
            {
                type: "MEDIA_FINISHED",
            }
        );
    }
    
    public mediaError(playId: number, message: string): void {
        this.executeCommandImpl(
            playId,
            "PLAYBACK_STATE",
            {
                type: "MEDIA_ERROR",
                message: message,
            }
        );
    }
    
    public mediaReady(playId: number, started: boolean): void {
        this.executeCommandImpl(
            playId,
            "PLAYBACK_STATE",
            {
                type: "MEDIA_READY",
            }
        );
    }
    
    public openMediaInZone(playId: number, mediaId: string, zoneId: number): void {
        this.executeCommandImpl(
            playId,
            "MEDIA_PLAY",
            {
                mediaId: mediaId, 
                zoneId: zoneId, 
            }
        );
    }
    
    public executeCommand(playId: number, commandName: string, commandParams: string): void {
        this.executeCommandImpl(playId, commandName, commandParams);
    }
    
    public addPlaybackListener(playId: number, callbackMethod: string): void {
        this.executeCommandImpl(
            playId,
            "NOTIFICATIONS_REGISTRATION",
            {
                notificationType: "MEDIA_PLAYBACK", 
                callbackMethod: callbackMethod, 
            }
        );
    }
}