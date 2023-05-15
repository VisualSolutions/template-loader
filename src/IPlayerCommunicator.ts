export class Message {
    id: number;
    messageType: string;
    payload: any;
    replyPassThroughData: any

    constructor(id: number, messageType: string, payload: any) {
        this.id = id;
        this.messageType = messageType;
        this.payload = payload;
        this.replyPassThroughData = {};
    }
}

export interface Subscription {
    unsubscribe(): void;
}

export interface IPlayerCommunicator {
    sendMessage(requestName: string, payload: any): Promise<any>;
    subscribe(messageType: string, onMessage: (message: Message) => void): Subscription;
}
