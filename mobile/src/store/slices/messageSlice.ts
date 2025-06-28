import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';

// Types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  attachments?: MessageAttachment[];
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'file';
  url: string;
  name: string;
  size: number;
  mimeType: string;
}

export interface Conversation {
  id: string;
  participants: ConversationParticipant[];
  lastMessage?: Message;
  unreadCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    productId?: string;
    orderId?: string;
    subject?: string;
  };
}

export interface ConversationParticipant {
  id: string;
  name: string;
  avatar?: string;
  role: 'buyer' | 'seller' | 'admin';
  isOnline: boolean;
  lastSeen?: string;
}

interface MessageState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Record<string, Message[]>; // conversationId -> messages
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  typingUsers: Record<string, string[]>; // conversationId -> userIds
}

// Initial state
const initialState: MessageState = {
  conversations: [],
  currentConversation: null,
  messages: {},
  isLoading: false,
  error: null,
  isConnected: false,
  typingUsers: {},
};

// Message slice
const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    setConversations: (state, action: PayloadAction<Conversation[]>) => {
      state.conversations = action.payload.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    },
    addConversation: (state, action: PayloadAction<Conversation>) => {
      const existingIndex = state.conversations.findIndex(c => c.id === action.payload.id);
      if (existingIndex !== -1) {
        state.conversations[existingIndex] = action.payload;
      } else {
        state.conversations.unshift(action.payload);
      }
      // Re-sort conversations
      state.conversations.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    },
    updateConversation: (state, action: PayloadAction<Conversation>) => {
      const index = state.conversations.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.conversations[index] = action.payload;
        // Re-sort conversations
        state.conversations.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      }
      if (state.currentConversation?.id === action.payload.id) {
        state.currentConversation = action.payload;
      }
    },
    setCurrentConversation: (state, action: PayloadAction<Conversation | null>) => {
      state.currentConversation = action.payload;
    },
    setMessages: (state, action: PayloadAction<{ conversationId: string; messages: Message[] }>) => {
      const { conversationId, messages } = action.payload;
      state.messages[conversationId] = messages.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      const message = action.payload;
      const conversationId = message.conversationId;
      
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      
      // Check if message already exists
      const existingIndex = state.messages[conversationId].findIndex(m => m.id === message.id);
      if (existingIndex !== -1) {
        state.messages[conversationId][existingIndex] = message;
      } else {
        state.messages[conversationId].push(message);
        // Keep messages sorted by creation time
        state.messages[conversationId].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
      
      // Update conversation's last message and timestamp
      const conversation = state.conversations.find(c => c.id === conversationId);
      if (conversation) {
        conversation.lastMessage = message;
        conversation.updatedAt = message.createdAt;
        
        // Increment unread count if message is from another user
        // This would typically be determined by comparing with current user ID
        // For now, we'll assume messages from others increment the count
        if (!message.isRead) {
          conversation.unreadCount += 1;
        }
        
        // Re-sort conversations
        state.conversations.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      }
    },
    updateMessage: (state, action: PayloadAction<Message>) => {
      const message = action.payload;
      const conversationId = message.conversationId;
      
      if (state.messages[conversationId]) {
        const index = state.messages[conversationId].findIndex(m => m.id === message.id);
        if (index !== -1) {
          state.messages[conversationId][index] = message;
        }
      }
    },
    markMessagesAsRead: (state, action: PayloadAction<{ conversationId: string; messageIds?: string[] }>) => {
      const { conversationId, messageIds } = action.payload;
      
      if (state.messages[conversationId]) {
        state.messages[conversationId].forEach(message => {
          if (!messageIds || messageIds.includes(message.id)) {
            message.isRead = true;
          }
        });
      }
      
      // Reset unread count for conversation
      const conversation = state.conversations.find(c => c.id === conversationId);
      if (conversation) {
        conversation.unreadCount = 0;
      }
    },
    setTypingUsers: (state, action: PayloadAction<{ conversationId: string; userIds: string[] }>) => {
      const { conversationId, userIds } = action.payload;
      state.typingUsers[conversationId] = userIds;
    },
    addTypingUser: (state, action: PayloadAction<{ conversationId: string; userId: string }>) => {
      const { conversationId, userId } = action.payload;
      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = [];
      }
      if (!state.typingUsers[conversationId].includes(userId)) {
        state.typingUsers[conversationId].push(userId);
      }
    },
    removeTypingUser: (state, action: PayloadAction<{ conversationId: string; userId: string }>) => {
      const { conversationId, userId } = action.payload;
      if (state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = state.typingUsers[conversationId].filter(id => id !== userId);
      }
    },
    updateParticipantStatus: (state, action: PayloadAction<{ userId: string; isOnline: boolean; lastSeen?: string }>) => {
      const { userId, isOnline, lastSeen } = action.payload;
      
      state.conversations.forEach(conversation => {
        const participant = conversation.participants.find(p => p.id === userId);
        if (participant) {
          participant.isOnline = isOnline;
          if (lastSeen) {
            participant.lastSeen = lastSeen;
          }
        }
      });
    },
    clearMessages: (state, action: PayloadAction<string>) => {
      const conversationId = action.payload;
      delete state.messages[conversationId];
      delete state.typingUsers[conversationId];
    },
    clearAllMessages: (state) => {
      state.conversations = [];
      state.currentConversation = null;
      state.messages = {};
      state.typingUsers = {};
    },
  },
});

// Actions
export const {
  setLoading,
  setError,
  clearError,
  setConnected,
  setConversations,
  addConversation,
  updateConversation,
  setCurrentConversation,
  setMessages,
  addMessage,
  updateMessage,
  markMessagesAsRead,
  setTypingUsers,
  addTypingUser,
  removeTypingUser,
  updateParticipantStatus,
  clearMessages,
  clearAllMessages,
} = messageSlice.actions;

// Selectors
export const selectMessages = (state: RootState) => state.messages;
export const selectConversations = (state: RootState) => state.messages.conversations;
export const selectCurrentConversation = (state: RootState) => state.messages.currentConversation;
export const selectMessagesLoading = (state: RootState) => state.messages.isLoading;
export const selectMessagesError = (state: RootState) => state.messages.error;
export const selectMessagesConnected = (state: RootState) => state.messages.isConnected;

// Computed selectors
export const selectConversationById = (state: RootState, conversationId: string) =>
  state.messages.conversations.find(c => c.id === conversationId);

export const selectMessagesByConversation = (state: RootState, conversationId: string) =>
  state.messages.messages[conversationId] || [];

export const selectTypingUsers = (state: RootState, conversationId: string) =>
  state.messages.typingUsers[conversationId] || [];

export const selectUnreadConversationsCount = (state: RootState) =>
  state.messages.conversations.reduce((count, conversation) => count + (conversation.unreadCount > 0 ? 1 : 0), 0);

export const selectTotalUnreadCount = (state: RootState) =>
  state.messages.conversations.reduce((count, conversation) => count + conversation.unreadCount, 0);

export const selectConversationParticipant = (state: RootState, conversationId: string, userId: string) => {
  const conversation = state.messages.conversations.find(c => c.id === conversationId);
  return conversation?.participants.find(p => p.id === userId);
};

export const selectActiveConversations = (state: RootState) =>
  state.messages.conversations.filter(c => c.isActive);

export default messageSlice.reducer;

