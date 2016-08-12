declare namespace PlayerExternal {
    interface PlayerApi {
        mediaFinished(playId: number): void;
        mediaError(playId: number, message: string);
        mediaReady(playId: number, started: boolean);
        getParameter(key: string):string;
    }
}

interface Window { Player: PlayerExternal.PlayerApi; }
