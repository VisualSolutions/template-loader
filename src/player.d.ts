declare namespace PlayerExternal {
    interface PlayerApi {
        mediaFinished(playId: number): void;
        mediaError(playId: number, message: string): void;
        mediaReady(playId: number, started: boolean): void;
        getParameter(key: string): string;
        openUrlInZone(playId: number, url: string, zoneId: number): void;
    }
}

interface Window { Player: PlayerExternal.PlayerApi; }
