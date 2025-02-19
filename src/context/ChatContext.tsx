import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface Chat {
  id: string;
  customerId: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface ChatContextType {
  chats: Chat[];
  messages: Message[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  deleteChat: (chatId: string) => void;
  createChat: (customerId: string) => string;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  markAsRead: (chatId: string) => void;
  getUnreadCount: (userId: string) => number;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CHATS: 'divine_algo_chats',
  MESSAGES: 'divine_algo_messages'
};

const getInitialData = () => {
  // Try to get data from localStorage first
  const storedChats = localStorage.getItem(STORAGE_KEYS.CHATS);
  const storedMessages = localStorage.getItem(STORAGE_KEYS.MESSAGES);

  if (storedChats && storedMessages) {
    return {
      chats: JSON.parse(storedChats),
      messages: JSON.parse(storedMessages)
    };
  }

  // Fallback to sample data if nothing in localStorage
  const chats: Chat[] = [
    {
      id: '1',
      customerId: 'USER123',
      lastMessage: 'Hello, I need help with my account',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 2,
    },
    {
      id: '2',
      customerId: 'USER456',
      lastMessage: 'When will my account be approved?',
      lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
      unreadCount: 1,
    },
  ];

  const messages: Message[] = [
    {
      id: '1',
      senderId: 'USER123',
      receiverId: 'admin',
      content: 'Hello, I need help with my account',
      timestamp: new Date().toISOString(),
      read: false,
    },
    {
      id: '2',
      senderId: 'admin',
      receiverId: 'USER123',
      content: 'Hi, how can I help you today?',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      read: true,
    },
  ];

  return { chats, messages };
};

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>(getInitialData().chats);
  const [messages, setMessages] = useState<Message[]>(getInitialData().messages);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }, [messages]);

  const addMessage = (messageData: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...messageData,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, newMessage]);

    // Update or create chat
    const existingChatIndex = chats.findIndex(
      chat => chat.customerId === (messageData.senderId === 'admin' ? messageData.receiverId : messageData.senderId)
    );

    if (existingChatIndex >= 0) {
      setChats(prev => prev.map((chat, index) =>
        index === existingChatIndex
          ? {
              ...chat,
              lastMessage: messageData.content,
              lastMessageTime: newMessage.timestamp,
              unreadCount: chat.unreadCount + (messageData.read ? 0 : 1),
            }
          : chat
      ));
    } else {
      setChats(prev => [...prev, {
        id: Date.now().toString(),
        customerId: messageData.senderId === 'admin' ? messageData.receiverId : messageData.senderId,
        lastMessage: messageData.content,
        lastMessageTime: newMessage.timestamp,
        unreadCount: messageData.read ? 0 : 1,
      }]);
    }
  };

  const createChat = (customerId: string) => {
    // Check if chat already exists
    const existingChat = chats.find(chat => chat.customerId === customerId);
    return existingChat ? existingChat.id : (() => {
      // Create new chat only if it doesn't exist
      const newChat: Chat = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        customerId,
        lastMessage: '',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0
      };
      setChats(prev => [...prev, newChat]);
      return newChat.id;
    })();
  };

  const markAsRead = (chatId: string) => {
    setChats(prev => prev.map(chat =>
      chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
    ));

    const customerId = chats.find(chat => chat.id === chatId)?.customerId;
    if (customerId) {
      setMessages(prev => prev.map(message =>
        (message.senderId === customerId || message.receiverId === customerId)
          ? { ...message, read: true }
          : message
      ));
    }
  };

  const deleteChat = (chatId: string) => {
    // Delete all messages associated with this chat
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setMessages(prev => prev.filter(msg => 
        !(msg.senderId === chat.customerId || msg.receiverId === chat.customerId)
      ));
      // Delete the chat
      setChats(prev => prev.filter(c => c.id !== chatId));
    }
  };

  const getUnreadCount = (userId: string) => {
    const count = chats.reduce((total, chat) => {
      if (userId === 'admin') {
        return total + chat.unreadCount;
      }
      return chat.customerId === userId ? chat.unreadCount : total;
    }, 0);
    return count > 0 ? count : 0;
  };

  return (
    <ChatContext.Provider value={{
      chats,
      messages,
      setChats,
      setMessages,
      createChat,
      deleteChat,
      addMessage,
      markAsRead,
      getUnreadCount,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}