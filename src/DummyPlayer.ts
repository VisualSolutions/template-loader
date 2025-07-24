import { IPlayer } from "./IPlayer";

export class DummyPlayer implements IPlayer {
    mediaFinished(playId: number): void {
        console.log(`Media finished for playId: ${playId}`);
    }

    mediaError(playId: number, message: string): void {
        console.log(`Media error for playId: ${playId}, message: ${message}`);
    }

    mediaReady(playId: number, started: boolean): void {
        console.log(`Media ready for playId: ${playId}, started: ${started}`);
    }

    getParameter(key: string): string {
        return null;
    }

    openMediaInZone(playId: number, mediaId: string, zoneId: number): void {
        console.log(`Opening media ${mediaId} in zone ${zoneId} for playId: ${playId}`);
    }

    executeCommand(playId: number, commandName: string, commandParamsJson: string): void {
        console.log(`Executing command ${commandName} with params ${commandParamsJson} for playId: ${playId}`);
    }

    addPlaybackListener(playId: number, callbackFunction: string): void {
        console.log(`Adding playback listener with function ${callbackFunction} for playId: ${playId}`);
    }
}