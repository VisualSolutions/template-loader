///</// <reference path="player.d.ts" />


module Mvision.Templates {

    class QueryStrings {
        public static Data = 'data';
        public static PlatformType = 'platformType';
        public static AutoPlay = 'autoPlay';
    }

    export class Component {
        constructor(public type, public value) {
        }
    }

    export class Loader {
        private dataJson: string;
        private platformType: string;
        private autoPlay: boolean;
        private components: Component[];
        private promise: Promise<Component[]>;
        private resolve: (data: Component[]) => void;
        private reject: (reason: any) => void;

        constructor(private callback: (c: Component[]) => void) {
            if (!window.Player) {
                window.Player = {
                    mediaFinished: function() {},
                    mediaError: function(s) {},
                    mediaReady: function(s) {}
                };
            }
            this.components = null;
            this.dataJson = this.getParameterByName(QueryStrings.Data);
            this.platformType = this.getParameterByName(QueryStrings.PlatformType);
            this.autoPlay =
                String(this.getParameterByName(QueryStrings.AutoPlay))
                .toLowerCase()
                !== 'false';

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

        public ready() {
            window.Player.mediaReady(this.autoPlay);
        }

        public error(message: string) {
            if (!message) {
              message = "Unspecified error.";
            }
            window.Player.mediaError(message);
        }

        public finished() {
            window.Player.mediaFinished();
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
                    this.dataJsonCallback(JSON.parse(xhttp.responseText));
                } else if(xhttp.readyState === 4) {
                    this.reject(xhttp.statusText);
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
