import { create } from 'zustand';


const getLocalStorage = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.log(error)
  }
};


export const Store = create((set, get) => ({
  // Initial state
  pinnedMessages: getLocalStorage('pinnedMessages', {}),
  replyMessages: {},
  forwardMessages: {},
  scrollToMessageId: null,
  blockedAddresses: getLocalStorage('blockedAddresses', []),

  // Pin handlers
  pinMessage: (channelId, msg) => {
    const updated = {
      ...get().pinnedMessages,
      [channelId]: msg,
    };
    setLocalStorage('pinnedMessages', updated);
    set({ pinnedMessages: updated });
  },

  unpinMessage: (channelId) => {
    const updated = { ...get().pinnedMessages };
    delete updated[channelId];
    setLocalStorage('pinnedMessages', updated);
    set({ pinnedMessages: updated });
  },

  // Reply handlers
  setReplyMessage: (channelId, msg) =>
    set((state) => ({
      replyMessages: {
        ...state.replyMessages,
        [channelId]: msg,
      },
    })),

  clearReplyMessage: (channelId) =>
    set((state) => {
      const updated = { ...state.replyMessages };
      delete updated[channelId];
      return { replyMessages: updated };
    }),

  // Forward handlers
  setForwardMessage: (channelId, msg) =>
    set((state) => ({
      forwardMessages: {
        ...state.forwardMessages,
        [channelId]: msg,
      },
    })),

  clearForwardMessage: (channelId) =>
    set((state) => {
      const updated = { ...state.forwardMessages };
      delete updated[channelId];
      return { forwardMessages: updated };
    }),

  // Scroll handler
  setScrollToMessageId: (id) => set({ scrollToMessageId: id }),


  // Block handlers
  blockAddress: (address) => {
    const lower = address.toLowerCase();
    const updated = Array.from(new Set([...get().blockedAddresses, lower]));
    setLocalStorage('blockedAddresses', updated);
    set({ blockedAddresses: updated });
  },

  unblockAddress: (address) => {
    const lower = address.toLowerCase();
    const updated = get().blockedAddresses.filter((a) => a !== lower);
    setLocalStorage('blockedAddresses', updated);
    set({ blockedAddresses: updated });
  },

  isBlocked: (address) => {
    const lower = address.toLowerCase();
    return get().blockedAddresses.includes(lower);
  },



}));
