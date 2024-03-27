interface IEventData {
    func: Function;
    target: any;
}

interface IEvent {
    [eventName: string]: IEventData[];
}

class ListenerManagerClass {
    private static _instance: ListenerManagerClass = null;
    private handle: IEvent = {};

    public static getInstance(): ListenerManagerClass {
        if (null === this._instance) {
            this._instance = new ListenerManagerClass();
        }
        return this._instance;
    }

    public on(eventName: string, cb: Function, target: any) {
        if (this.hasEvent(eventName, cb, target)) {
            return;
        }

        if (!this.handle[eventName]) {
            this.handle[eventName] = [];
        }
        const data: IEventData = { func: cb, target };
        this.handle[eventName].push(data);
    }

    public off(eventName: string, cb: Function, target?: any) {
        const list = this.handle[eventName];
        if (!list || list.length <= 0) {
            return;
        }
        for (let i = 0; i < list.length; i++) {
            const event = list[i];
            if (cb == event.func && (!target || target == event.target)) {
                list.splice(i, 1);
                break;
            }
        }
    }

    public dispatch(eventName: string, ...args: any) {
        const list = this.handle[eventName];
        if (!list || list.length <= 0) {
            return;
        }
        for (let i = 0; i < list.length; i++) {
            const event = list[i];
            event.func.apply(event.target, args);
        }
    }

    public removeAll(target?: any) {
        if (target) {
            for (let key in this.handle) {
                let list = this.handle[key];
                for (let i = 0, l = list.length; i < l; i++) {
                    let event = list[i];
                    if (event.target == target) {
                        list.splice(i, 1);
                        if (l > 0) {
                            l--;
                        }
                        i--;
                    }
                }
            }
        } else {
            for (let key in this.handle) {
                const list = this.handle[key];
                while (list.length > 0) {
                    list.pop();
                }
            }
        }
    }

    public hasEvent(eventName: string, cb: Function, target?: any): boolean {
        const list = this.handle[eventName];
        if (!list || list.length <= 0) {
            return false;
        }
        for (let i = 0; i < list.length; i++) {
            const event = list[i];
            if (cb == event.func && (!target || target == event.target)) {
                return true;
            }
        }
        return false;
    }
}

export const ListenerManager = ListenerManagerClass.getInstance();
