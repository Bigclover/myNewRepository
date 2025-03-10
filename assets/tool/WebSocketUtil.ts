import { director } from "cc";

/**
 * WebSocket网络工具类
 * 功能：支持自动重连、心跳检测、消息分发
 */
export class WebSocketUtil {
    private static instance: WebSocketUtil;
    private ws: WebSocket | null = null;
    private reconnectCount: number = 0;
    private maxReconnect: number = 3;
    private reconnectInterval: number = 3000;
    private heartbeatInterval: number = 5000;
    private heartbeatTimer: any = null;

    // 事件枚举
    static EventType = {
        OPEN: 'ws_open',
        MESSAGE: 'ws_message',
        CLOSE: 'ws_close',
        ERROR: 'ws_error'
    };

    public static getInstance(): WebSocketUtil {
        if (!this.instance) {
            this.instance = new WebSocketUtil();
        }
        return this.instance;
    }

    /**
     * 连接WebSocket服务器
     * @param url WebSocket服务器地址
     */
    public connect(url: string): void {
        if (this.ws && (this.ws.readyState === WebSocket.OPEN || 
            this.ws.readyState === WebSocket.CONNECTING)) {
            return;
        }

        this.ws = new WebSocket(url);
        this.bindEvents();
    }

    private bindEvents(): void {
        if (!this.ws) return;

        this.ws.onopen = (event: Event) => {
            this.reconnectCount = 0;
            this.startHeartbeat();
            director.getScene().emit(WebSocketUtil.EventType.OPEN, event);
        };

        this.ws.onmessage = (event: MessageEvent) => {
            this.handleMessage(event.data);
            director.getScene().emit(WebSocketUtil.EventType.MESSAGE, event.data);
        };

        this.ws.onclose = (event: CloseEvent) => {
            this.clearHeartbeat();
            director.getScene().emit(WebSocketUtil.EventType.CLOSE, event);
            this.handleReconnect();
        };

        this.ws.onerror = (event: Event) => {
            director.getScene().emit(WebSocketUtil.EventType.ERROR, event);
            this.handleReconnect();
        };
    }

    /**
     * 发送消息
     * @param data 消息内容(支持字符串/ArrayBuffer)
     */
    public send(data: string | ArrayBuffer): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(data);
        }
    }

    /**
     * 关闭连接
     */
    public close(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    private handleReconnect(): void {
        if (this.reconnectCount < this.maxReconnect) {
            setTimeout(() => {
                this.reconnectCount++;
                this.connect(this.ws?.url || '');
            }, this.reconnectInterval);
        }
    }

    private startHeartbeat(): void {
        this.heartbeatTimer = setInterval(() => {
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.send('ping');
                // this.send(new ArrayBuffer(0)); // 心跳包优化
            }
        }, this.heartbeatInterval);
    }

    private clearHeartbeat(): void {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    private handleMessage(data: string | ArrayBuffer): void {
        // 处理二进制数据（如Protobuf）
        if (data instanceof ArrayBuffer) {
            const view = new DataView(data);
            // 解析二进制数据逻辑...
        }
        // 处理文本数据
        else {
            try {
                const json = JSON.parse(data);
                // 处理JSON数据逻辑...
            } catch (e) {
                console.log('Received plain text:', data);
            }
        }
    }
}
