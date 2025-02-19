import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { Send, MessageSquare } from 'lucide-react';

const CustomerChat = () => {
  const { messages, addMessage } = useChat();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    addMessage({
      senderId: user.id,
      receiverId: 'admin',
      content: newMessage.trim(),
      read: false,
    });

    setNewMessage('');
  };

  const userMessages = messages.filter(
    msg => msg.senderId === user?.id || msg.receiverId === user?.id
  );

  return (
    <div className="h-[calc(100vh-theme(spacing.32))] flex flex-col bg-background rounded-lg shadow-lg overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-border bg-card flex items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Support Chat</h2>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
        {userMessages.length === 0 ? (
          <div className="text-center text-muted-foreground mt-4">
            <p>No messages yet. Start a conversation with our support team!</p>
          </div>
        ) : (
          userMessages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  message.senderId === user?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-card-foreground'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs mt-1 text-muted-foreground/75">
                  {format(new Date(message.timestamp), 'h:mm a')}
                </p>
              </div>
            </div>
          ))
        )}
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
    </div>
  );
};

export default CustomerChat;