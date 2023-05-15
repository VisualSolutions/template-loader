import { IPlayer } from "./IPlayer";

export class PreviewPlayer implements IPlayer {
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