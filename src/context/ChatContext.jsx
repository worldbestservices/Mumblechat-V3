import {
  createContext, useReducer, useContext, ReactNode, useEffect, useCallback
} from 'react';

import { useXmtpClient } from '../hooks/useXmtpClient';
import { StreamManager } from '../utils/streamManager';
import { useAppKitAccount } from '@reown/appkit/react';
// import { DecodedMessage } from '@xmtp/xmtp-js';

const initialState = {
  channels: [],
  currentChannelId: null,
  messages: {},
  users: {},
  unreadCount: {},  // ✅ Added unreadCount to state
  loading: { channels: false, messages: false, users: false },
  error: null,
};


const chatReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CHANNELS':
      return { ...state, channels: action.payload };
    case 'SET_CURRENT_CHANNEL':
      return { ...state, currentChannelId: action.payload };
    case 'SET_MESSAGES':
      return { ...state, messages: { ...state.messages, [action.payload.channelId]: action.payload.messages } };
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.channelId]: [
            ...(state.messages[action.payload.channelId] || []),
            action.payload.message
          ]
        },
        channels: state.channels
          .map(channel =>
            channel.id === action.payload.channelId
              ? { ...channel, lastMessageAt: action.payload.message.timestamp }
              : channel
          )
          .sort((a, b) => b.lastMessageAt - a.lastMessageAt),  // ✅ always sort by last message
        unreadCount: {
          ...state.unreadCount,
          [action.payload.channelId]:
            state.currentChannelId === action.payload.channelId
              ? 0
              : (state.unreadCount[action.payload.channelId] || 0) + 1,
        }
      };
    case 'CREATE_CHANNEL':
      return { ...state, channels: [...state.channels, action.payload] };
    case 'RESET_UNREAD':
      return {
        ...state,
        unreadCount: {
          ...state.unreadCount,
          [action.payload]: 0
        }
      };
    default:
      return state;
  }
};

const ChatContext = createContext(undefined);

export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);


  const { address, isConnected } = useAppKitAccount()
  const connected = isConnected;
  const { xmtpClient } = useXmtpClient();

  const loadConversations = useCallback(async () => {
    if (!xmtpClient || !address) return;

    const convos = await xmtpClient.conversations.list();

    const channels = await Promise.all(
      convos.map(async (convo) => {
        const messages = await convo.messages({ limit: 1 });
        const lastMessage = messages[0];

        return {
          id: convo.peerAddress,
          name: convo.peerAddress,
          description: 'Direct Chat',
          isPrivate: true,
          createdBy: address,
          participants: [address, convo.peerAddress],
          lastMessageAt: lastMessage ? lastMessage.sent.getTime() : 0
        };
      })
    );

    dispatch({ type: 'SET_CHANNELS', payload: channels });
  }, [xmtpClient, address]);

  const fetchMessages = useCallback(async (channelId) => {
    if (!xmtpClient) return;

    const convo = await xmtpClient.conversations.newConversation(channelId);
    const msgs = await convo.messages({ limit: 100 });

    const messages = msgs.map(msg => ({
      id: msg.id,
      sender: msg.senderAddress,
      content: msg.content,
      timestamp: msg.sent.getTime(),
      encrypted: true,
    }));

    dispatch({ type: 'SET_MESSAGES', payload: { channelId, messages } });
  }, [xmtpClient]);

  const sendMessage = async (channelId, content) => {
    if (!xmtpClient || !address) return;

    const convo = await xmtpClient.conversations.newConversation(channelId);
    const sentMsg = await convo.send(content);

    const message = {
      id: sentMsg.id,
      sender: sentMsg.senderAddress,
      content: sentMsg.content,
      timestamp: sentMsg.sent.getTime(),
      encrypted: true
    };

    dispatch({ type: 'ADD_MESSAGE', payload: { channelId, message } });
  };

  const createChannel = async (id, description, isPrivate) => {
    if (!xmtpClient || !address) return;

    const channelExists = state.channels.some(c => c.id === id);
    if (channelExists) return;

    const newChannel = {
      id,
      name: id,
      description: description || 'Direct Chat',
      isPrivate,
      createdBy: address,
      participants: [address, id],
      lastMessageAt: Date.now()
    };

    dispatch({ type: 'CREATE_CHANNEL', payload: newChannel });
  };

  useEffect(() => {
    if (!xmtpClient || !address) return;

    const handleNewMessage = (msg) => {
      const peer = msg.conversation.peerAddress;

      const channelExists = state.channels.some(c => c.id === peer);
      if (!channelExists) {
        dispatch({
          type: 'CREATE_CHANNEL',
          payload: {
            id: peer,
            name: peer,
            description: 'Direct Chat',
            isPrivate: true,
            createdBy: address,
            participants: [address, peer],
            lastMessageAt: msg.sent.getTime(),
          }
        });
      }

      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          channelId: peer,
          message: {
            id: msg.id,
            sender: msg.senderAddress,
            content: msg.content,
            timestamp: msg.sent.getTime(),
            encrypted: true
          }
        }
      });
    };

    const streamManager = new StreamManager(xmtpClient, handleNewMessage);
    streamManager.startStream();

    return () => streamManager.stopStream();
  }, [xmtpClient, address, state.channels]);

  useEffect(() => {
    if (connected) {
      loadConversations();
    }
  }, [connected, loadConversations]);

  const setCurrentChannel = (channelId) => {
    dispatch({ type: 'SET_CURRENT_CHANNEL', payload: channelId });
    dispatch({ type: 'RESET_UNREAD', payload: channelId || '' });
    if (channelId) fetchMessages(channelId);
  };

  return (
    <ChatContext.Provider
      value={{
        ...state,
        sendMessage,
        createChannel,
        joinChannel: async () => { },
        leaveChannel: async () => { },
        setCurrentChannel,
        fetchMessages,
        updateUserProfile: async () => { }
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChatContext must be used within a ChatProvider');
  return context;
};
