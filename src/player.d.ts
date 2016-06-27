declare namespace PlayerExternal {
    class PlayerApi {
        mediaFinished(playId: number): void;
        mediaError(playId: number, message: string);
        mediaReady(playId: number, started: boolean);
    }

}

interface Window { Player: PlayerExternal.PlayerApi; }
