///</// <reference path="player.d.ts" />


module Mvision.Templates {

    class QueryStrings {
        public static Data = 'data';
        public static PlayId = 'playId';
        public static PlatformType = 'platformType';
        public static AutoPlay = 'autoPlay';
        public static Duration = 'duration';
    }

    class PlaybackConstants {
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
        private autoPlay: boolean;
        private duration: number;
        private components: Component[];
        private promise: Promise<Component[]>;
        private resolve: (data: Component[]) => void;
        private reject: (reason: any) => void;

        constructor(private callback: (c: Component[]) => void) {
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
            this.components = null;
            this.dataJson = this.getParameterByName(QueryStrings.Data);
            this.playId = parseInt(this.getParameterByName(QueryStrings.PlayId));
            this.platformType = this.getParameterByName(QueryStrings.PlatformType);
            this.autoPlay =
                String(this.getParameterByName(QueryStrings.AutoPlay))
                .toLowerCase()
                !== 'false';
            this.duration = parseInt(this.getParameterByName(QueryStrings.Duration));
            if (isNaN(this.duration)) {
                this.duration = PlaybackConstants.DurationAuto;
            }

            this.promise = new Promise<Component[]>((resolve, reject) => {
                this.resolve = resolve;
                this.reject = reject;
            });
            this.getDataJson();
        }

        public getComponents(callback: (c: Component[]) => void): Promise<Component[]> {
            if (this.components && callback) {
                callback(this.components);
            } else {
                this.callback = callback;
            }
            return this.promise;
        }

        public isAutoPlay() {
            return this.autoPlay;
        }

        public getPlatformType() {
            return this.platformType;
        }

        public getDuration() {
            return this.duration;
        }

        public ready() {
            window.Player.mediaReady(this.playId, this.autoPlay);
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
                mframeUrl = 'mframe.json';
            }

            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = () => {
                if (xhttp.readyState === 4 && xhttp.status === 200) {
                    try {
                        this.dataJsonCallback(JSON.parse(xhttp.responseText));
                    } catch (err) {
                        this.error("Error parsing " + mframeUrl + ": " + err.toString());
                    }
                } else if (xhttp.readyState === 4) {
                    this.reject("Error loading " + mframeUrl + ", httpStatus=" + xhttp.status);
                }
            };

            xhttp.open('GET', mframeUrl);
            xhttp.send();
        }

        private dataJsonCallback(data: any) {
            this.components = [];
            data.components.forEach(c => {
                this.components.push(new Component(c.type, c.params.value));
            });
            if (this.callback != null) {
                this.callback(this.components);
            }
            this.resolve(this.components);
        }
    }

    window['Loader'] = window['Loader'] || Loader;
    var x = new Loader(null);
}
