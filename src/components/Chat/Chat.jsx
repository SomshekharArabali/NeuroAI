import { useRef, useEffect, useMemo, useState } from "react";
import Markdown from "react-markdown";
import styles from "./Chat.module.css";
import PropTypes from "prop-types";
import toast from "react-hot-toast";

const UserAvatar = () => (
  <div className={styles.userAvatar}>
    <div className={styles.avatarBorder}>
      <img
        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
        alt="User"
      />
    </div>
  </div>
);

const BotAvatar = ({ isTyping }) => (
  <div className={`${styles.botAvatar} ${isTyping ? styles.typing : ""}`}>
    <div className={styles.avatarBorder}>
      <img src="/logo.png" alt="NeuroAI" />
    </div>
  </div>
);

const TypingIndicator = () => (
  <div className={styles.typingIndicator}>
    <div className={styles.typingDots}>
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
);

const MessageActions = ({
  messageId,
  messageContent,
  copyToClipboard,
  onGoodResponse,
  onBadResponse,
  onRetry,
  feedbackGiven,
}) => {
  return (
    <div className={styles.messageActionsBottom}>
      <button
        className={styles.actionBtn}
        title="Copy"
        onClick={() => copyToClipboard(messageContent)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      </button>
      <button
        className={`${styles.actionBtn} ${feedbackGiven === "good" ? styles.active : ""}`}
        title="Good response"
        onClick={() => onGoodResponse(messageId)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
        </svg>
      </button>
      <button
        className={`${styles.actionBtn} ${feedbackGiven === "bad" ? styles.active : ""}`}
        title="Bad response"
        onClick={() => onBadResponse(messageId)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
        </svg>
      </button>
      <button
        className={styles.actionBtn}
        title="Retry"
        onClick={() => onRetry(messageId)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"></path>
        </svg>
      </button>
    </div>
  );
};

const WELCOME_MESSAGES = [
  {
    role: "assistant",
    content:
      "# Welcome to NeuroAI! 🌟\n\nI'm your AI companion, here to help you with conversations, questions, and support. I'm designed to:\n\n✨ **Listen** - Share your thoughts and feelings\n🧠 **Analyze** - Help you work through complex problems\n💡 **Suggest** - Provide insights and recommendations\n🎯 **Focus** - Keep conversations productive and meaningful\n\nHow can I assist you today?",
  },
];

// Quick action button configurations
const QUICK_ACTIONS = [
  {
    id: 1,
    label: "💬 Start a conversation",
    message: "Hi! I'd like to start a conversation. What's on your mind today?"
  },
  {
    id: 2,
    label: "🤔 Ask a question",
    message: "I have a question I'd like to ask. Can you help me with that?"
  },
  {
    id: 3,
    label: "📚 Get help with something",
    message: "I need some help with a task or problem. Can you assist me?"
  },
  {
    id: 4,
    label: "🎯 Set a goal",
    message: "I'd like to set some goals and work on personal development."
  }
];

export function Chat({ messages, isTyping, isStreaming, setContent, onRetryMessage }) {
  const messagesEndRef = useRef(null);
  const [feedbackGiven, setFeedbackGiven] = useState({});

  const messagesGroups = useMemo(
    () =>
      messages.reduce((groups, message, index) => {
        if (message.role === "user") groups.push([]);
        const currentGroup = groups[groups.length - 1] || [];
        currentGroup.push({ ...message, id: index });
        return groups;
      }, []),
    [messages]
  );

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "user" || isStreaming) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isStreaming]);

  const handleGoodResponse = (messageId) => {
    setFeedbackGiven((prev) => ({
      ...prev,
      [messageId]: prev[messageId] === "good" ? null : "good",
    }));
    toast.success("Thanks for your feedback!", { duration: 2000 });
  };

  const handleBadResponse = (messageId) => {
    setFeedbackGiven((prev) => ({
      ...prev,
      [messageId]: prev[messageId] === "bad" ? null : "bad",
    }));
    toast.error("Feedback noted. We'll try to improve!", { duration: 2000 });
  };

  const handleRetry = (messageId) => {
    // Find the user message that prompted this response
    // The bot message is at messageId, so we need to look backwards for the last user message
    let userMessageIndex = -1;
    for (let i = messageId - 1; i >= 0; i--) {
      if (messages[i] && messages[i].role === "user") {
        userMessageIndex = i;
        break;
      }
    }
    
    if (userMessageIndex !== -1 && onRetryMessage) {
      const userMessage = messages[userMessageIndex];
      onRetryMessage(userMessage.content, messageId);
      toast.success("Retrying message...", { duration: 2000 });
    } else {
      toast.error("No user message found to retry.", { duration: 2000 });
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!", { duration: 2000 });
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast.error("Failed to copy", { duration: 2000 });
    }
  };

  // Handle quick action button clicks
  const handleQuickAction = (message) => {
    if (setContent) {
      setContent(message);
    }
  };

  const renderMessage = (message, index) => {
    const { role, content, id } = message;
    const isUser = role === "user";
    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <div
        key={id || index}
        className={`${styles.MessageContainer} ${
          isUser ? styles.userMessage : styles.botMessage
        }`}
      >
        {!isUser && (
          <BotAvatar isTyping={isTyping && index === messages.length - 1} />
        )}

        <div className={styles.messageWrapper}>
          <div
            className={`${styles.Message} ${
              isUser ? styles.userBubble : styles.botBubble
            }`}
          >
            <div className={styles.messageContent}>
              <Markdown
                components={{
                  h1: ({ children }) => (
                    <h1 className={styles.messageHeading}>{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className={styles.messageHeading}>{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className={styles.messageHeading}>{children}</h3>
                  ),
                  code: ({ inline, children }) =>
                    inline ? (
                      <code className={styles.inlineCode}>{children}</code>
                    ) : (
                      <pre className={styles.codeBlock}>
                        <code>{children}</code>
                      </pre>
                    ),
                  blockquote: ({ children }) => (
                    <blockquote className={styles.blockquote}>
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {content}
              </Markdown>
            </div>
          </div>

          {!isUser && typeof id === "number" && (
            <MessageActions
              messageId={id}
              messageContent={content}
              copyToClipboard={copyToClipboard}
              onGoodResponse={handleGoodResponse}
              onBadResponse={handleBadResponse}
              onRetry={handleRetry}
              feedbackGiven={feedbackGiven[id]}
            />
          )}

          <div className={styles.messageTime}>{timestamp}</div>
        </div>

        {isUser && <UserAvatar />}
      </div>
    );
  };

  const showWelcome = messages.length === 0;

  return (
    <div className={styles.Chat}>
      <div className={styles.chatBackground}></div>

      {showWelcome && (
        <div className={styles.welcomeSection}>
          {WELCOME_MESSAGES.map((message, index) =>
            renderMessage(message, index)
          )}

          <div className={styles.quickActions}>
            <div className={styles.quickActionTitle}>Quick Start:</div>
            <div className={styles.actionButtons}>
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  className={styles.actionButton}
                  onClick={() => handleQuickAction(action.message)}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {messagesGroups.map((messages, groupIndex) => (
        <div key={groupIndex} className={styles.Group}>
          {messages.map(renderMessage)}
        </div>
      ))}

      {isTyping && (
        <div className={`${styles.MessageContainer} ${styles.botMessage}`}>
          <BotAvatar isTyping={true} />
          <div className={styles.messageWrapper}>
            <div className={`${styles.Message} ${styles.botBubble}`}>
              <TypingIndicator />
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}

Chat.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      role: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
      id: PropTypes.number,
    })
  ).isRequired,
  isTyping: PropTypes.bool,
  isStreaming: PropTypes.bool,
  setContent: PropTypes.func.isRequired,
  onRetryMessage: PropTypes.func,
};

BotAvatar.propTypes = {
  isTyping: PropTypes.bool,
};

MessageActions.propTypes = {
  messageId: PropTypes.number.isRequired,
  messageContent: PropTypes.string.isRequired,
  copyToClipboard: PropTypes.func.isRequired,
  onGoodResponse: PropTypes.func.isRequired,
  onBadResponse: PropTypes.func.isRequired,
  onRetry: PropTypes.func.isRequired,
  feedbackGiven: PropTypes.string,
};