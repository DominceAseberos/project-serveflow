// BroadcastChannel API for sub-millisecond cross-window and cross-tab communication
// Synchronizes POS Cashier, Kitchen KDS, and TV Customer Board without network delay

const CHANNEL_NAME = 'serveflow_tv_channel';

export interface TvBroadcastMessage {
  type: 'ORDER_READY' | 'ORDER_PREPARING' | 'REFRESH_ALL';
  orderId?: string;
  orderNumber?: string;
  customerName?: string;
  timestamp: number;
}

export const tvBroadcast = {
  broadcastOrderReady(orderNumber: string, customerName?: string, orderId?: string) {
    try {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      const msg: TvBroadcastMessage = {
        type: 'ORDER_READY',
        orderId,
        orderNumber,
        customerName,
        timestamp: Date.now(),
      };
      channel.postMessage(msg);
      channel.close();
    } catch (_) {}
  },

  broadcastOrderUpdate() {
    try {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      const msg: TvBroadcastMessage = {
        type: 'REFRESH_ALL',
        timestamp: Date.now(),
      };
      channel.postMessage(msg);
      channel.close();
    } catch (_) {}
  },

  subscribe(listener: (msg: TvBroadcastMessage) => void): () => void {
    try {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (event) => {
        listener(event.data);
      };
      return () => {
        channel.close();
      };
    } catch (_) {
      return () => {};
    }
  },
};
