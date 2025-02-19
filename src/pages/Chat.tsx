import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { useUsers } from '../context/UserContext';
import { format } from 'date-fns';
import { Send, Search, Plus, X } from 'lucide-react';

interface NewChatFormData {
  userId: string;
  message: string;
}

const Chat = () => {
  const { chats, messages, addMessage, markAsRead, deleteChat, createChat } = useChat();
  const { users } = useUsers();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatFormData, setNewChatFormData] = useState<NewChatFormData>({
    userId: '',
    message: ''
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedChat) {
      markAsRead(selectedChat);
    }
  }, [selectedChat]);

  const handleStartNewChat = () => {
    if (!newChatFormData.userId || !newChatFormData.message.trim()) return;
    
    // Check if chat already exists
    const existingChat = chats.find(chat => chat.customerId === newChatFormData.userId);
    if (existingChat) {
      setSelectedChat(existingChat.id);
      addMessage({
        senderId: 'admin',
        receiverId: newChatFormData.userId,
        content: newChatFormData.message.trim(),
        read: false,
      });
      setShowNewChatModal(false);
      setNewChatFormData({ userId: '', message: '' });
      return;
    }
    
    // Create chat and get chat ID
    const chatId = createChat(newChatFormData.userId);
    
    // Send initial message
    addMessage({
      senderId: 'admin',
      receiverId: newChatFormData.userId,
      content: newChatFormData.message.trim(),
      read: false,
    });

    // Set selected chat and reset form
    setSelectedChat(chatId);
    setShowNewChatModal(false);
    setNewChatFormData({ userId: '', message: '' });
  };

  const handleDeleteChat = (chatId: string) => {
    if (window.confirm('Are you sure you want to delete this chat?')) {
      deleteChat(chatId);
      if (selectedChat === chatId) {
        setSelectedChat(null);
      }
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    const chat = chats.find(c => c.id === selectedChat);
    if (!chat) return;

    addMessage({
      senderId: 'admin',
      receiverId: chat.customerId,
      content: newMessage.trim(),
      read: false,
    });

    setNewMessage('');
  };

  const filteredChats = chats.filter(chat => {
    const user = users.find(u => u.uniqueId === chat.customerId);
    return user?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (chat.lastMessage && chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div className="h-[calc(100vh-theme(spacing.32))] flex flex-col md:flex-row bg-background rounded-lg shadow-lg overflow-hidden">
      {/* Chat List */}
      <div className={`${
        selectedChat ? 'hidden md:block' : 'block'
      } w-full md:w-80 border-r border-border bg-card flex-shrink-0`}>
        <div className="p-4 border-b border-border bg-background">
          <button
            onClick={() => setShowNewChatModal(true)}
            className="w-full mb-4 btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </button>
          <div className="relative">
            <input
              type="text"
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 input-field"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          </div>
        </div>
        <div className="overflow-y-auto h-[calc(100%-theme(spacing.20))] divide-y divide-border">
          {filteredChats.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()).map(chat => {
            const user = users.find(u => u.uniqueId === chat.customerId);
            const isSelected = selectedChat === chat.id;
            
            return (
              <div
                key={chat.id}
                className={`w-full p-4 text-left hover:bg-muted cursor-pointer transition-colors ${
                  isSelected ? 'bg-muted' : ''
                } ${chat.unreadCount > 0 ? 'bg-primary/5' : ''} relative group`}
                onClick={() => setSelectedChat(chat.id)}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-foreground">
                    {user?.username || 'Unknown User'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(chat.lastMessageTime), 'MMM d, h:mm a')}
                  </span>
                </div>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteChat(chat.id);
                  }}
                  className="absolute right-2 top-2 p-1 rounded-full bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20"
                  title="Delete chat"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleDeleteChat(chat.id);
                    }
                  }}
                >
                  <X className="h-4 w-4" />
                </div>

                <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                {chat.unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-destructive-foreground bg-destructive rounded-full mt-2">
                    {chat.unreadCount}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Messages */}
      <div className={`${
        selectedChat ? 'block' : 'hidden md:block'
      } flex-1 flex flex-col bg-background`}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card flex items-center justify-between">
              <button
                onClick={() => setSelectedChat(null)}
                className="md:hidden text-muted-foreground hover:text-foreground mr-2"
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-semibold text-foreground">
                {users.find(u => u.uniqueId === chats.find(c => c.id === selectedChat)?.customerId)?.username || 'Unknown User'}
              </h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
              {messages
                .filter(msg => {
                  const chat = chats.find(c => c.id === selectedChat);
                  return chat && (msg.senderId === chat.customerId || msg.receiverId === chat.customerId);
                })
                .map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === 'admin' ? 'justify-end' : 'justify-start'}`}
                  > 
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        message.senderId === 'admin'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card text-card-foreground'
                      } break-words`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs mt-1 text-muted-foreground/75">
                        {format(new Date(message.timestamp), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-card">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 input-field"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a chat to start messaging
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Chat</h2>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Select User
                </label>
                <select
                  value={newChatFormData.userId}
                  onChange={(e) => setNewChatFormData(prev => ({ ...prev, userId: e.target.value }))}
                  className="input-field"
                >
                  <option value="">Choose a user...</option>
                  {users
                    .filter(user => user.status === 'Active')
                    .map(user => (
                      <option key={user.uniqueId} value={user.uniqueId}>
                        {user.username} ({user.uniqueId})
                      </option>
                    ))
                  }
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Initial Message
                </label>
                <textarea
                  value={newChatFormData.message}
                  onChange={(e) => setNewChatFormData(prev => ({ ...prev, message: e.target.value }))}
                  className="input-field min-h-[100px] resize-none"
                  rows={4}
                  placeholder="Type your message..."
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowNewChatModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartNewChat}
                  disabled={!newChatFormData.userId || !newChatFormData.message.trim()}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;