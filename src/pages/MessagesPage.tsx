import { useState, useRef, useEffect } from 'react';
import { Send, Search, Phone, Video, Info, ArrowLeft, MessageSquare, Home, Calendar } from 'lucide-react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';
import AuthGate from '../components/common/AuthGate';

interface ChatMessage {
  id: string;
  sender: 'me' | 'other';
  text: string;
  time: string;
  read: boolean;
}

interface Conversation {
  id: string;
  participantName: string;
  participantAvatar: string;
  participantInitials: string;
  listingTitle: string;
  listingImage: string;
  listingId: string;
  checkIn?: string;
  checkOut?: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  messages: ChatMessage[];
}

export default function MessagesPage() {
  const { user, reservations, myListings } = useStore();

  if (!user) return <AuthGate title="Sign in to see your messages" subtitle="Log in to chat with hosts and guests about your stays." />;
  const bottomRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQ, setSearchQ] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);

  // Build real conversations from store data on mount
  const buildConversations = (): Conversation[] => {
    const convos: Conversation[] = [];

    // From guest reservations — guest talking to host
    reservations.forEach((res) => {
      convos.push({
        id: `res-${res.id}`,
        participantName: `${res.listing.owner.firstName} ${res.listing.owner.lastName}`,
        participantAvatar: res.listing.owner.profileImage,
        participantInitials: `${res.listing.owner.firstName[0]}${res.listing.owner.lastName[0]}`,
        listingTitle: res.listing.title,
        listingImage: res.listing.images[0],
        listingId: res.listingId,
        checkIn: res.checkIn,
        checkOut: res.checkOut,
        lastMessage: `Your booking is ${res.status}. Check-in: ${res.checkIn}`,
        lastTime: res.createdAt,
        unread: res.status === 'pending' ? 1 : 0,
        messages: [
          {
            id: '1',
            sender: 'other',
            text: `Hi! Thanks for booking ${res.listing.title}. I'm excited to host you!`,
            time: res.createdAt,
            read: true,
          },
          {
            id: '2',
            sender: 'me',
            text: 'Thank you! We are looking forward to our stay.',
            time: res.createdAt,
            read: true,
          },
          {
            id: '3',
            sender: 'other',
            text: `Your booking is ${res.status}. Check-in is ${res.checkIn} and check-out is ${res.checkOut}. Let me know if you have any questions!`,
            time: res.createdAt,
            read: res.status !== 'pending',
          },
        ],
      });
    });

    // From host listings — host talking to enquirers
    myListings.forEach((listing) => {
      convos.push({
        id: `listing-${listing.id}`,
        participantName: 'Guest Enquiry',
        participantAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest123',
        participantInitials: 'GE',
        listingTitle: listing.title,
        listingImage: listing.images[0],
        listingId: listing.id,
        lastMessage: `Someone enquired about ${listing.title}`,
        lastTime: new Date().toISOString(),
        unread: 0,
        messages: [
          {
            id: '1',
            sender: 'other',
            text: `Hi! I am interested in ${listing.title}. Is it available next weekend?`,
            time: new Date().toISOString(),
            read: true,
          },
          {
            id: '2',
            sender: 'me',
            text: `Hello! Yes, the property is available. Feel free to book directly through the listing page. Let me know if you have any questions!`,
            time: new Date().toISOString(),
            read: true,
          },
        ],
      });
    });

    return convos;
  };

  const [conversations, setConversations] = useState<Conversation[]>(buildConversations);
  const [selectedId, setSelectedId] = useState<string | null>(
    () => {
      const initial = buildConversations();
      return initial.length > 0 ? initial[0].id : null;
    }
  );

  const selected = conversations.find(c => c.id === selectedId) || null;

  const filteredConvos = conversations.filter(c =>
    c.participantName.toLowerCase().includes(searchQ.toLowerCase()) ||
    c.listingTitle.toLowerCase().includes(searchQ.toLowerCase())
  );

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selected?.messages.length]);

  const getAutoReply = (msg: string): string => {
    const lower = msg.toLowerCase();
    if (lower.includes('check') || lower.includes('time')) return 'Check-in is at 3 PM and check-out is at 11 AM. Self check-in is available — I will send the lockbox code before your arrival.';
    if (lower.includes('parking') || lower.includes('car')) return 'Yes, free parking is available on the premises for all guests.';
    if (lower.includes('wifi') || lower.includes('internet')) return 'We have high-speed WiFi (100 Mbps) available. I will share the password upon check-in.';
    if (lower.includes('pet') || lower.includes('dog') || lower.includes('cat')) return 'Thank you for asking! Unfortunately pets are not allowed at this property.';
    if (lower.includes('cancel')) return 'Our cancellation policy is moderate — full refund if cancelled 5+ days before check-in.';
    if (lower.includes('pool') || lower.includes('swim')) return 'The pool is available 24/7 exclusively for guests. Pool towels are provided.';
    if (lower.includes('thank')) return 'You\'re welcome! Looking forward to hosting you. Reach out anytime before your stay.';
    return 'Thanks for your message! Is there anything specific you\'d like to know about the property?';
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedId) return;
    const now = new Date().toISOString();
    const msg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'me',
      text: newMessage.trim(),
      time: now,
      read: true,
    };
    setConversations(prev =>
      prev.map(c =>
        c.id === selectedId
          ? { ...c, messages: [...c.messages, msg], lastMessage: newMessage.trim(), lastTime: now, unread: 0 }
          : c
      )
    );
    setNewMessage('');

    // Simulate auto-reply
    setTimeout(() => {
      const reply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'other',
        text: getAutoReply(newMessage.trim()),
        time: new Date().toISOString(),
        read: false,
      };
      setConversations(prev =>
        prev.map(c =>
          c.id === selectedId
            ? { ...c, messages: [...c.messages, reply], lastMessage: reply.text, lastTime: reply.time }
            : c
        )
      );
    }, 1200);
  };

  const formatTime = (iso: string) => {
    try { return format(new Date(iso), 'h:mm a'); } catch { return ''; }
  };

  const formatConvoTime = (iso: string) => {
    try {
      const d = new Date(iso);
      const diffDays = Math.floor((Date.now() - d.getTime()) / 86400000);
      if (diffDays === 0) return format(d, 'h:mm a');
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return format(d, 'EEE');
      return format(d, 'MMM d');
    } catch { return ''; }
  };

  const selectConversation = (id: string) => {
    setSelectedId(id);
    setShowMobileChat(true);
    setConversations(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
  };

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

  // ── Empty state ──
  if (conversations.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center transition-colors duration-300">
        <div className="text-center px-4 max-w-sm">
          <div className="w-20 h-20 bg-rose-50 dark:bg-rose-950/40 rounded-full flex items-center justify-center mx-auto mb-5">
            <MessageSquare className="w-10 h-10 text-rose-400 dark:text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">No messages yet</h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">
            When you book a property or receive a booking request on your listing, your conversations with hosts and guests will appear here.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-3 text-center">
              <Home className="w-5 h-5 text-gray-400 dark:text-slate-500 mx-auto mb-1" />
              <p className="text-gray-600 dark:text-slate-300 font-medium">Book a stay</p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Chat with your host</p>
            </div>
            <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-3 text-center">
              <Calendar className="w-5 h-5 text-gray-400 dark:text-slate-500 mx-auto mb-1" />
              <p className="text-gray-600 dark:text-slate-300 font-medium">Host a listing</p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Chat with guests</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Messages</h1>
            <p className="text-gray-500 dark:text-slate-400 mt-1 text-sm">
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
              {totalUnread > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400">
                  {totalUnread} unread
                </span>
              )}
            </p>
          </div>
        </div>

        <div
          className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm"
          style={{ height: 'calc(100vh - 230px)', minHeight: 520 }}
        >
          <div className="flex h-full">

            {/* ── Sidebar ── */}
            <div className={`${showMobileChat ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r border-gray-100 dark:border-slate-800 flex-col flex-shrink-0`}>
              {/* Search */}
              <div className="p-4 border-b border-gray-100 dark:border-slate-800">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                  <input
                    type="text"
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-800 border border-gray-100 dark:border-slate-700 transition"
                  />
                </div>
              </div>

              {/* Conversation List */}
              <div className="flex-1 overflow-y-auto">
                {filteredConvos.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-400 dark:text-slate-500">No conversations found</div>
                ) : (
                  filteredConvos.map((convo) => (
                    <button
                      key={convo.id}
                      onClick={() => selectConversation(convo.id)}
                      className={`w-full p-4 text-left transition border-b border-gray-50 dark:border-slate-800/60
                        ${selectedId === convo.id
                          ? 'bg-rose-50 dark:bg-rose-950/30 border-l-2 border-l-rose-500'
                          : 'hover:bg-gray-50 dark:hover:bg-slate-800'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white text-sm font-bold">
                            {convo.participantInitials}
                          </div>
                          {convo.unread > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-sm">
                              {convo.unread}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <p className={`text-sm truncate ${convo.unread > 0 ? 'font-bold text-gray-900 dark:text-slate-100' : 'font-semibold text-gray-800 dark:text-slate-200'}`}>
                              {convo.participantName}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-slate-500 flex-shrink-0">
                              {formatConvoTime(convo.lastTime)}
                            </p>
                          </div>
                          <p className="text-xs text-rose-500 dark:text-rose-400 truncate mb-0.5 font-medium">
                            {convo.listingTitle.length > 32 ? convo.listingTitle.slice(0, 32) + '…' : convo.listingTitle}
                          </p>
                          <p className={`text-xs truncate ${convo.unread > 0 ? 'font-semibold text-gray-700 dark:text-slate-300' : 'text-gray-400 dark:text-slate-500'}`}>
                            {convo.lastMessage}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* ── Chat Panel ── */}
            {selected ? (
              <div className={`${!showMobileChat ? 'hidden md:flex' : 'flex'} flex-1 flex-col min-w-0`}>

                {/* Chat Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowMobileChat(false)}
                      className="md:hidden p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition text-gray-500 dark:text-slate-400"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {selected.participantInitials}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-slate-100">{selected.participantName}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 truncate max-w-xs">
                        {selected.listingTitle.length > 42 ? selected.listingTitle.slice(0, 42) + '…' : selected.listingTitle}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition text-gray-500 dark:text-slate-400" title="Voice call">
                      <Phone className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition text-gray-500 dark:text-slate-400" title="Video call">
                      <Video className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition text-gray-500 dark:text-slate-400" title="Listing info">
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Booking context banner */}
                {(selected.checkIn || selected.checkOut) && (
                  <div className="mx-4 mt-3 flex items-center gap-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-xl px-4 py-2.5">
                    <img
                      src={selected.listingImage}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover bg-gray-100 dark:bg-slate-700 flex-shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 truncate">{selected.listingTitle}</p>
                      {selected.checkIn && selected.checkOut && (
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          📅 {selected.checkIn} → {selected.checkOut}
                        </p>
                      )}
                    </div>
                    <Calendar className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50 dark:bg-slate-950/30">
                  {selected.messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                      {msg.sender !== 'me' && (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mb-1">
                          {selected.participantInitials}
                        </div>
                      )}
                      <div className={`max-w-[72%] flex flex-col gap-1 ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                          msg.sender === 'me'
                            ? 'bg-rose-500 text-white rounded-br-sm'
                            : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 rounded-bl-sm shadow-sm border border-gray-100 dark:border-slate-700'
                        }`}>
                          {msg.text}
                        </div>
                        <span className="text-xs text-gray-400 dark:text-slate-500 px-1">
                          {formatTime(msg.time)}
                          {msg.sender === 'me' && <span className="ml-1 text-xs">{msg.read ? '✓✓' : '✓'}</span>}
                        </span>
                      </div>
                      {msg.sender === 'me' && user && (
                        <img
                          src={user.profileImage}
                          alt=""
                          className="w-7 h-7 rounded-full bg-gray-100 dark:bg-slate-700 object-cover flex-shrink-0 mb-1"
                        />
                      )}
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  {/* Quick replies */}
                  <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
                    {['What time is check-in?', 'Is parking available?', 'Is WiFi included?', 'Are pets allowed?'].map((quick) => (
                      <button
                        key={quick}
                        onClick={() => setNewMessage(quick)}
                        className="flex-shrink-0 text-xs px-3 py-1.5 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 rounded-full transition border border-gray-200 dark:border-slate-700"
                      >
                        {quick}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-end gap-3">
                    <div className="flex-1 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 px-4 py-2.5 focus-within:ring-2 focus-within:ring-rose-200 dark:focus-within:ring-rose-800 transition">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                        }}
                        placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
                        rows={1}
                        className="w-full bg-transparent text-sm outline-none text-gray-800 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 resize-none leading-relaxed"
                        style={{ maxHeight: '120px', overflowY: 'auto' }}
                      />
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="w-10 h-10 bg-rose-500 text-white rounded-xl flex items-center justify-center hover:bg-rose-600 transition disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 shadow-sm"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex flex-1 items-center justify-center flex-col gap-4 text-center p-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-gray-400 dark:text-slate-500" />
                </div>
                <p className="font-semibold text-gray-700 dark:text-slate-300">Select a conversation</p>
                <p className="text-sm text-gray-400 dark:text-slate-500">Choose from the list to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
