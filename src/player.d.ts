declare namespace PlayerExternal {
    class PlayerApi {
        mediaFinished(): void;
        mediaError(message: string);
        mediaReady(started: boolean);
    }

}

interface Window { player: PlayerExternal.PlayerApi; }