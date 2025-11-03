import { useRef, useEffect, useMemo } from "react";
import Markdown from "react-markdown";
import styles from "./Chat.module.css";
import PropTypes from "prop-types";
import { Copy, ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

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

const MessageReactions = ({ assistantMessageContent, userMessageContentForRetry, onCopy, onGoodResponse, onBadResponse, onRetry }) => {
  return (
    <div className={styles.messageActions}>
      <button
        className={styles.actionButton}
        title="Copy message"
        onClick={() => onCopy(assistantMessageContent)}
      >
        <Copy size={16} />
      </button>
      <button
        className={styles.actionButton}
        title="Good response"
        onClick={() => onGoodResponse(assistantMessageContent)}
      >
        <ThumbsUp size={16} />
      </button>
      <button
        className={styles.actionButton}
        title="Bad response"
        onClick={() => onBadResponse(assistantMessageContent)}
      >
        <ThumbsDown size={16} />
      </button>
      <button
        className={styles.actionButton}
        title="Retry response"
        onClick={() => onRetry(userMessageContentForRetry)}
        disabled={!userMessageContentForRetry}
      >
        <RotateCcw size={16} />
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

export function Chat({ messages, isTyping, isStreaming, setContent, onRetryLastMessage }) {
  const messagesEndRef = useRef(null);

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

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Message copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast.error("Failed to copy message.");
    }
  };

  const handleGoodResponse = (content) => {
    console.log(`Feedback: Good response for content: "${content.substring(0, 50)}..."`);
    toast.success("Thanks for the positive feedback!");
  };

  const handleBadResponse = (content) => {
    console.log(`Feedback: Bad response for content: "${content.substring(0, 50)}..."`);
    toast.error("Thanks for the feedback. We'll try to improve!");
  };

  const handleQuickAction = (message) => {
    if (setContent) {
      setContent(message);
    }
  };

  // Determine the last assistant message and the user message that preceded it
  const lastAssistantMessage = messages.slice().reverse().find(msg => msg.role === 'assistant');
  const lastAssistantMessageIndex = messages.indexOf(lastAssistantMessage);
  const lastUserMessageContentForRetry = lastAssistantMessageIndex > 0 
    ? messages[lastAssistantMessageIndex - 1]?.content 
    : null;

  const renderMessage = (message, index, isLastAssistant = false, prevUserMessage = null) => {
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
            {!isUser && isLastAssistant && !isStreaming && !isTyping && (
              <MessageReactions
                assistantMessageContent={content}
                userMessageContentForRetry={prevUserMessage}
                onCopy={handleCopy}
                onGoodResponse={handleGoodResponse}
                onBadResponse={handleBadResponse}
                onRetry={onRetryLastMessage}
              />
            )}
          </div>

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
            renderMessage(message, index, false, null)
          )}

          <div className={styles.quickActions}>
            <div className={styles.quickActionTitle}>Quick Start:</div>
            <div className={styles.actionButtons}>
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  className={styles.quickActionBtn}
                  onClick={() => handleQuickAction(action.message)}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {messagesGroups.map((groupMessages, groupIndex) => (
        <div key={groupIndex} className={styles.Group}>
          {groupMessages.map((message, msgIndex) => {
            const isLastAssistant = message.role === 'assistant' && 
                                   message.id === lastAssistantMessage?.id;
            const prevUserMessage = isLastAssistant ? lastUserMessageContentForRetry : null;
            return renderMessage(message, msgIndex, isLastAssistant, prevUserMessage);
          })}
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
  onRetryLastMessage: PropTypes.func,
};

BotAvatar.propTypes = {
  isTyping: PropTypes.bool,
};

MessageReactions.propTypes = {
  assistantMessageContent: PropTypes.string.isRequired,
  userMessageContentForRetry: PropTypes.string,
  onCopy: PropTypes.func.isRequired,
  onGoodResponse: PropTypes.func.isRequired,
  onBadResponse: PropTypes.func.isRequired,
  onRetry: PropTypes.func.isRequired,
};