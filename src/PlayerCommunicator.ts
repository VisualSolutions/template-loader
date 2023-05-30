import { IPlayerCommunicator, Subscription, Message } from "./IPlayerCommunicator";

class PromiseResolver {

    readonly resolve: (value?: any) => void;
    readonly reject: (reason?: any) => void;
    readonly timeoutId: any;

    constructor(resolve: (value?: any) => void, reject: (reason?: any) => void, timeoutId: any) {
        this.resolve = resolve;
        this.reject = reject;
        this.timeoutId = timeoutId;
    }
}

class Subscriber {
    readonly messageType: string;
    readonly onMessage: (message: Message) => void;

    constructor(messageType: string, onMessage: (message: Message) => void) {
        this.messageType = messageType;
        this.onMessage = onMessage;
    }
}

export class PlayerCommunicator implements IPlayerCommunicator {

    private readonly messageSender: (message: Message) => void;

    private readonly pendingPromises: Map<number, PromiseResolver>;
    private readonly subscribers: Array<Subscriber>;
    private messageIdGenerator: number;

    constructor(messageSender: (message: Message) => void) {
        this.messageSender = messageSender;

        this.pendingPromises = new Map();
        this.subscribers = new Array();
        this.messageIdGenerator = 1;
    }

    sendMessage(messageType: string, payload: any): Promise<any> {
        const messageId = this.messageIdGenerator ++;
        if (messageType === "REQUEST_ACKNOWLEDGE" || messageType === "REQUEST_RESPONSE") {
            return Promise.resolve();
        }
        return new Promise<any>((resolve, reject) => {
            const timeoutId = setTimeout(() => this.processPendingPromise(messageId, null, "Request timeout"), 5000);
            this.pendingPromises.set(
                messageId,
                new PromiseResolver(resolve, reject, timeoutId)
            );
            this.messageSender(new Message(messageId, messageType, payload));
        });
    }

    subscribe(messageType: string, onMessage: (message: Message) => void): Subscription {
        const subscriber = new Subscriber(messageType, onMessage);
        this.subscribers.push(subscriber);
        
        return {
            unsubscribe: (): void => {
                const index = this.subscribers.indexOf(subscriber);
                if (index !== -1) {
                    this.subscribers.splice(index, 1);
                }
            }
        };
    }

    onMessageReceived(message: Message): void {
        if (message.messageType === "REQUEST_ACKNOWLEDGE") {
            return;
        }

        if (message.messageType === "REQUEST_RESPONSE") {
            this.processPendingPromise(message.payload.requestMessageId, message.payload.response, message.payload.error);
            return;
        }

        this.sendMessage(
            "REQUEST_ACKNOWLEDGE",
            {requestMessageId: message.id}
        );

        this.subscribers
            .filter(subscriber => subscriber.messageType === message.messageType)
            .forEach(subscriber => {
                subscriber.onMessage(message);
            });
    }

    private processPendingPromise(messageId: number, result: any, error: any): void {
        const pendingPromise: PromiseResolver = this.pendingPromises.get(messageId);
        if (pendingPromise) {
            this.pendingPromises.delete(messageId);
            clearTimeout(pendingPromise.timeoutId);
            if (error) {
                pendingPromise.reject(error);
            } else {
                pendingPromise.resolve(result);
            }
        }
    }
}