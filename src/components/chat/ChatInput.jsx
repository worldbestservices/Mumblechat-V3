
import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, Lock, Smile } from 'lucide-react';
// import { Conversation } from '@xmtp/xmtp-js';
import EmojiPicker from 'emoji-picker-react';


const ChatInput = ({ conversation }) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messageCount, setMessageCount] = useState(0); // New state for textarea key
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiRef = useRef(null);

  // Resize logic
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [message]);


  // 👇 Close emoji picker on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        emojiRef.current &&
        !emojiRef.current.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);



  const sendTypingIndicator = () => {
    if (!isTyping) setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 3000);
  };

  const handleSendMessage = async () => {
    const trimmed = message.trim();
    if (!trimmed || isSending || trimmed.length > 1024) return;

    setIsSending(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      setIsTyping(false);
    }

    try {
      await conversation.send(trimmed);

      // Clear the message and increment counter
      setMessage('');
      setMessageCount(c => c + 1);

      // Reset textarea DOM
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
      setMessage('');
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else {
      sendTypingIndicator();
    }
  };


  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const newMessage = message.slice(0, start) + emoji + message.slice(end);
    setMessage(newMessage);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  return (
    <div className="border-t-2 border-white/15 bg-input py-3 px-4">
      <div className="flex items-end gap-2 justify-center">

        <div className="relative" ref={emojiRef}>
          <button
            onClick={() => setShowEmojiPicker(prev => !prev)}
            className="text-gray-500 hover:text-primary transition"
          >
            <Smile size={20} />
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-12 left-0 z-50">
              <EmojiPicker onEmojiClick={handleEmojiClick} lazyLoadEmojis />
            </div>
          )}
        </div>


        <div className="flex-1 relative">
          <textarea
            key={`textarea-${messageCount}`} // Force reset on send
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a message..."
            className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 max-h-32"
            disabled={isSending}
            rows={1}
          />
        </div>

        <button
          onClick={handleSendMessage}
          type="button"
          className="flex-shrink-0 h-10 w-10 rounded-md bg-primary text-white flex items-center justify-center hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          disabled={!message.trim() || isSending}
        >
          {isSending ? (
            <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
          ) : (
            <Send size={18} className="hover:text-[#0fff]" />
          )}
        </button>
      </div>

      <div className="flex justify-between mt-1 text-xs text-muted-foreground px-1">
        <div className="flex items-center gap-1">
          <Lock size={12} />
          <span>End-to-end encrypted</span>
        </div>
        <div>
          {message.length > 1024 ? (
            <span className="text-red-500">
              ⚠️ Message exceeds maximum length of 1024 characters
            </span>
          ) : (
            <span>{1024 - message.length} characters remaining</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInput;