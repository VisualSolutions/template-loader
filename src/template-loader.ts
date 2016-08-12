///</// <reference path="player.d.ts" />


module Mvision.Templates {

    class QueryStrings {
        public static Data = 'data';
        public static PlayId = 'playId';
        public static PlatformType = 'platformType';
        public static AutoPlay = 'autoPlay';
        public static Duration = 'duration';
    }

    export class PlaybackConstants {
        public static DurationAuto = -1;
    }

    export class Param {
        constructor(public name: string, public type: string, public value: any) {
        }
    }

    export class Component {
        constructor(public name: string, public params: Param[]) {
        }
    }

    export class ComponentV1 {
        constructor(public type, public value) {
        }
    }

    export class PreviewPlayer implements PlayerExternal.PlayerApi {
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

        getParameter(key: string):string {
            return null;
        }
    }


    export class Loader {
        private dataJson: string;
        private playId: number;
        private platformType: string;
        private duration: number;
        private started: boolean;
        private componentsPromise: Promise<Component[]>;
        private componentsPromiseResolve: (data: Component[]) => void;
        private startPromise: Promise;
        private startPromiseResolve: () => void;

        constructor() {
            if (!window.Player) {
                window.Player = new PreviewPlayer();
                window.addEventListener('message', (event) => {
                    if (event && event.data && event.data.action && event.data.action === 'play') {
                        this.play();
                    }
                });
            }
            this.dataJson = this.getParameterByName(QueryStrings.Data);
            this.playId = parseInt(this.getParameterByName(QueryStrings.PlayId));
            this.platformType = this.getParameterByName(QueryStrings.PlatformType);
            this.duration = parseInt(this.getParameterByName(QueryStrings.Duration));
            if (isNaN(this.duration)) {
                this.duration = PlaybackConstants.DurationAuto;
            }
            this.started =
                String(this.getParameterByName(QueryStrings.AutoPlay))
                .toLowerCase()
                !== 'false';

            this.startPromise = new Promise<Component[]>((resolve, reject) => {
                this.startPromiseResolve = resolve;
            });
            if (this.started) {
                this.startPromiseResolve();
            }

            this.componentsPromise = new Promise<Component[]>((resolve, reject) => {
                this.componentsPromiseResolve = resolve;
            });
            this.getDataJson();
        }

        public getComponents(): Promise<Component[]> {
            return this.componentsPromise;
        }

        public isStarted(): Promise {
            return this.startPromise;
        }

        public getPlatformType():string {
            return this.platformType;
        }

        public getDuration():number {
            return this.duration;
        }

        public ifDurationNotSetEndIn(templateDurationInSeconds:number) {
            if (this.duration == PlaybackConstants.DurationAuto) {
                setTimeout(this.finished, templateDurationInSeconds * 1000);
            }
        }

        public ready() {
            window.Player.mediaReady(this.playId, this.started);
        }

        public error(message: string) {
            if (!message) {
                message = "Unspecified error.";
            }
            window.Player.mediaError(this.playId, message);
        }

        public finished() {
            window.Player.mediaFinished(this.playId);
        }

        public getPlayerParameter(key: string):string {
            try {
                return window.Player.getParameter(key);
            } catch (err) {
                // method not implemented
            }
            return null;
        }

        public play() {
            if (!this.started) {
                this.started = true;
                this.startPromiseResolve();
            }
        }

        private getParameterByName(name, url = window.location.href) {
            if (!url) url = window.location.href;
            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        }

        private getDataJson() {
            var mframeUrl = this.dataJson;
            if (!mframeUrl) {
                mframeUrl = 'mframe.json?timestamp=' + new Date().getTime();
            }

            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = () => {
                if (xhttp.readyState === 4 && xhttp.status === 200) {
                    var components: Component[];
                    try {
                        var dataJson = JSON.parse(xhttp.responseText);
                        components = [];
                        dataJson.components.forEach(c => {
                            if (typeof c.type === 'number' && c.params) {
                                // Hack to allow old/deprecated components.
                                components.push(<any>new ComponentV1(c.type, c.params.value));
                            } else {
                            components.push(new Component(c.name, c.params.map(p => new Param(p.name, p.type, p.value))));
                            }
                        });
                    } catch (err) {
                        this.error("Error parsing " + mframeUrl + ": " + err.toString());
                        return;
                    }

                    this.componentsPromiseResolve(components);
                } else if (xhttp.readyState === 4) {
                    this.error("Error loading " + mframeUrl + ", httpStatus=" + xhttp.status);
                }
            };

            xhttp.open('GET', mframeUrl);
            xhttp.send();
        }
    }

    window['Loader'] = window['Loader'] || new Loader();
}
