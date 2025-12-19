'use client';

import { useState, useEffect, useRef } from 'react';
import apiClient from '@/lib/api-client';

interface GroupChatMessage {
  _id: string;
  senderId: { _id: string; fullName: string; age: number };
  content: string;
  isFlagged: boolean;
  flaggedReason?: string;
  createdAt: string;
}

interface GroupChatProps {
  currentChildId: string;
  currentChildName: string;
  onClose: () => void;
}

export function GroupChat({ currentChildId, currentChildName, onClose }: GroupChatProps) {
  const [messages, setMessages] = useState<GroupChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchMessages();

    // Auto-refresh messages every 3 seconds
    const interval = setInterval(() => {
      if (autoRefresh) {
        fetchMessages();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const response = await apiClient.get('/api/chat/group/messages?limit=100');
      setMessages(response.data.reverse());
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await apiClient.post('/api/chat/group/send', {
        content: newMessage.trim(),
      });

      // Add message to UI
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error: any) {
      console.error('Failed to send message:', error);
      alert(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="text-6xl mb-4 animate-bounce">💬</div>
          <p className="text-amber-900 font-bold">Loading group chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[600px] flex flex-col overflow-hidden border-4 border-amber-500">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 border-b-2 border-amber-600">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                💬 Kids Group Chat
              </h2>
              <p className="text-sm text-amber-100">
                {messages.length} messages • Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  autoRefresh
                    ? 'bg-green-500 text-white'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {autoRefresh ? '🔄 Auto' : '⏸️ Paused'}
              </button>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center font-bold text-xl"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-amber-50 to-orange-50">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-9xl mb-4">👥</div>
              <p className="text-2xl font-bold text-amber-900 mb-2">Welcome to the Group Chat!</p>
              <p className="text-amber-700">Be the first to say hello to everyone!</p>
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
                    className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                      isSender
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                        : 'bg-white text-amber-900 border-2 border-amber-300'
                    }`}
                  >
                    {!isSender && (
                      <p className={`text-xs font-bold mb-1 ${isSender ? 'text-amber-100' : 'text-amber-600'}`}>
                        {msg.senderId.fullName} (Age {msg.senderId.age})
                      </p>
                    )}
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
              placeholder="Type a friendly message to everyone..."
              className="flex-1 px-4 py-3 border-2 border-amber-300 rounded-xl focus:outline-none focus:border-amber-500 text-amber-900"
              disabled={sending}
              maxLength={500}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-6 py-3 rounded-xl hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-2xl"
            >
              {sending ? '...' : '📤'}
            </button>
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-amber-600">
              💡 Be kind and respectful! Messages are monitored for safety.
            </p>
            <p className="text-xs text-amber-500">
              {newMessage.length}/500
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
