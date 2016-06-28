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

    export class Component {
        constructor(public type, public value) {
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
                window.Player = {
                    mediaFinished: function(playId: number) {
                        console.log("mediaFinished: playId=" + playId);
                    },
                    mediaError: function(playId: number, message: string) {
                        console.log("mediaError: playId=" + playId + ", message=" + message);
                    },
                    mediaReady: function(playId: number, started: boolean) {
                        console.log("mediaReady: playId=" + playId + ", started=" + started);
                    }
                };
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
                mframeUrl = 'mframe.json?timestamp=' + new Date().getMilliseconds();
            }

            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = () => {
                if (xhttp.readyState === 4 && xhttp.status === 200) {
                    var components: Component[];
                    try {
                        var dataJson = JSON.parse(xhttp.responseText);
                        components = [];
                        dataJson.components.forEach(c => {
                            components.push(new Component(c.type, c.params.value));
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
