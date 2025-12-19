'use client';

import { useState, useEffect, useRef } from 'react';
import apiClient from '@/lib/api-client';

interface ChatMessage {
  _id: string;
  senderId: { _id: string; fullName: string };
  receiverId: { _id: string; fullName: string };
  content: string;
  isRead: boolean;
  isFlagged: boolean;
  flaggedReason?: string;
  createdAt: string;
}

interface ChatPartner {
  id: string;
  fullName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isFlagged: boolean;
}

interface Child {
  _id: string;
  fullName: string;
  age: number;
  totalPoints: number;
}

interface ChatProps {
  currentChildId: string;
  currentChildName: string;
  onClose: () => void;
}

export function Chat({ currentChildId, currentChildName, onClose }: ChatProps) {
  const [chatList, setChatList] = useState<ChatPartner[]>([]);
  const [availableChildren, setAvailableChildren] = useState<Child[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<ChatPartner | Child | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper function to get ID from partner or child
  const getPartnerId = (partner: ChatPartner | Child | null): string => {
    if (!partner) return '';
    return 'id' in partner ? partner.id : partner._id;
  };

  useEffect(() => {
    fetchChatList();
    fetchAvailableChildren();
  }, []);

  useEffect(() => {
    if (selectedPartner) {
      const partnerId = getPartnerId(selectedPartner);
      fetchConversation(partnerId);
      // Mark messages as read
      markAsRead(partnerId);
    }
  }, [selectedPartner]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatList = async () => {
    try {
      const response = await apiClient.get('/api/chat/list');
      setChatList(response.data);
    } catch (error) {
      console.error('Failed to fetch chat list:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableChildren = async () => {
    try {
      const response = await apiClient.get('/api/chat/available-children');
      setAvailableChildren(response.data);
    } catch (error) {
      console.error('Failed to fetch available children:', error);
    }
  };

  const fetchConversation = async (partnerId: string) => {
    try {
      const response = await apiClient.get(`/api/chat/conversation/${partnerId}`);
      setMessages(response.data.reverse());
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
    }
  };

  const markAsRead = async (senderId: string) => {
    try {
      await apiClient.post(`/api/chat/mark-read/${senderId}`);
      fetchChatList(); // Refresh to update unread counts
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedPartner || sending) return;

    setSending(true);
    try {
      const partnerId = getPartnerId(selectedPartner);
      const response = await apiClient.post('/api/chat/send', {
        receiverId: partnerId,
        content: newMessage.trim(),
      });

      // Add message to UI
      setMessages([...messages, response.data]);
      setNewMessage('');
      fetchChatList(); // Refresh chat list
    } catch (error: any) {
      console.error('Failed to send message:', error);
      alert(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const startNewChat = (child: Child) => {
    setSelectedPartner(child);
    setShowNewChat(false);
    setMessages([]);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="text-6xl mb-4 animate-bounce">💬</div>
          <p className="text-amber-900 font-bold">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full h-[600px] flex overflow-hidden border-4 border-amber-500">
        {/* Sidebar - Chat List */}
        <div className="w-1/3 bg-gradient-to-b from-amber-50 to-orange-50 border-r-2 border-amber-200 flex flex-col">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 border-b-2 border-amber-600">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold text-white">💬 My Chats</h2>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>
            <button
              onClick={() => setShowNewChat(!showNewChat)}
              className="w-full bg-white text-amber-700 font-bold py-2 px-4 rounded-xl hover:bg-amber-50 transition-all"
            >
              ➕ New Chat
            </button>
          </div>

          {/* New Chat List */}
          {showNewChat && (
            <div className="p-3 bg-amber-100 border-b-2 border-amber-300 max-h-48 overflow-y-auto">
              <p className="text-xs text-amber-700 font-bold mb-2">Start a new chat:</p>
              {availableChildren.map((child) => (
                <button
                  key={child._id}
                  onClick={() => startNewChat(child)}
                  className="w-full text-left p-2 hover:bg-amber-200 rounded-lg mb-1 transition-all"
                >
                  <p className="font-semibold text-amber-900 text-sm">{child.fullName}</p>
                  <p className="text-xs text-amber-600">Age {child.age} • ⭐ {child.totalPoints} pts</p>
                </button>
              ))}
            </div>
          )}

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto p-2">
            {chatList.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-3">🏺</div>
                <p className="text-amber-700 text-sm font-semibold">No chats yet!</p>
                <p className="text-amber-600 text-xs mt-1">Click "New Chat" to start</p>
              </div>
            ) : (
              chatList.map((partner) => {
                const isSelected = getPartnerId(selectedPartner) === partner.id;
                return (
                  <button
                    key={partner.id}
                    onClick={() => setSelectedPartner(partner)}
                    className={`w-full text-left p-3 rounded-xl mb-2 transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white'
                        : 'bg-white hover:bg-amber-100 border-2 border-amber-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-amber-900'}`}>
                        {partner.fullName}
                      </p>
                      {partner.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                          {partner.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs truncate ${isSelected ? 'text-amber-50' : 'text-amber-600'}`}>
                      {partner.isFlagged ? '⚠️ ' : ''}{partner.lastMessage}
                    </p>
                    <p className={`text-xs mt-1 ${isSelected ? 'text-amber-100' : 'text-amber-500'}`}>
                      {formatTime(partner.lastMessageTime)}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedPartner ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 border-b-2 border-amber-600">
                <h3 className="text-xl font-bold text-white">{selectedPartner.fullName}</h3>
                <p className="text-sm text-amber-100">Egyptian Friend</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-amber-50 to-orange-50">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-8xl mb-4">👋</div>
                    <p className="text-amber-900 font-bold text-lg">Say hello to {selectedPartner.fullName}!</p>
                    <p className="text-amber-600 text-sm mt-2">Start a friendly conversation</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isSender = msg.senderId._id === currentChildId;
                    return (
                      <div
                        key={msg._id}
                        className={`mb-4 flex ${isSender ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                            isSender
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                              : 'bg-white text-amber-900 border-2 border-amber-300'
                          }`}
                        >
                          <p className="text-sm break-words">{msg.content}</p>
                          {msg.isFlagged && (
                            <p className="text-xs mt-1 text-red-200 font-semibold">⚠️ Flagged by safety filter</p>
                          )}
                          <p className={`text-xs mt-1 ${isSender ? 'text-amber-100' : 'text-amber-500'}`}>
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={sendMessage} className="p-4 bg-white border-t-2 border-amber-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a friendly message..."
                    className="flex-1 px-4 py-3 border-2 border-amber-300 rounded-xl focus:outline-none focus:border-amber-500 text-amber-900"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-6 py-3 rounded-xl hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {sending ? '...' : '📤'}
                  </button>
                </div>
                <p className="text-xs text-amber-600 mt-2">
                  💡 Be kind and respectful! Messages are monitored for safety.
                </p>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-amber-50 to-orange-50">
              <div className="text-center">
                <div className="text-9xl mb-4">💬</div>
                <p className="text-2xl font-bold text-amber-900 mb-2">Welcome to Chat!</p>
                <p className="text-amber-700">Select a chat or start a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
