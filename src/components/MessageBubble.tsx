import React from 'react';
import { motion } from 'framer-motion';
import { CheckCheck, FileText, ExternalLink } from 'lucide-react';
import { useChatContext } from '../context/ChatContext';
import { ProductCarousel } from './ProductCarousel';
import type { Message, CarouselItem } from '../types';

interface MessageBubbleProps {
  message: Message;
  isLast: boolean;
}

export function MessageBubble({ message, isLast }: MessageBubbleProps) {
  const isUser = message.sender === 'user';
  const time = message.timestamp.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const isCarousel = message.type === 'carousel' && message.metadata?.products;

  return (
    <motion.div
      className={`message-container ${isUser ? 'message-container--user' : 'message-container--bot'} ${isCarousel ? 'message-container--carousel' : ''}`}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      layout
    >
      <div className={`message-bubble ${isUser ? 'message-bubble--user' : 'message-bubble--bot'} ${isCarousel ? 'message-bubble--carousel' : ''}`}>
        {/* Conteúdo baseado no tipo */}
        {message.type === 'text' && (
          <p className="message-text">{message.text}</p>
        )}

        {message.type === 'image' && message.metadata?.imageUrl && (
          <div className="message-image-container">
            <img 
              src={message.metadata.imageUrl} 
              alt="Imagem enviada"
              className="message-image"
              loading="lazy"
            />
            {message.text && <p className="message-text">{message.text}</p>}
          </div>
        )}

        {message.type === 'file' && message.metadata?.fileUrl && (
          <a 
            href={message.metadata.fileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="message-file"
          >
            <FileText size={20} />
            <span>{message.metadata.fileName || 'Arquivo'}</span>
            <ExternalLink size={14} />
          </a>
        )}

        {message.type === 'carousel' && message.metadata?.products && (
          <ProductCarousel products={message.metadata.products} />
        )}

        {message.type === 'carousel' && message.metadata?.carousel && !message.metadata?.products && (
          <div className="message-carousel">
            {message.metadata.carousel.map((item, index) => (
              <CarouselCard key={index} item={item} />
            ))}
          </div>
        )}

        {/* Horário e status */}
        <div className="message-meta">
          <span className="message-time">{time}</span>
          {isUser && (
            <span className="message-status">
              <CheckCheck size={14} />
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function CarouselCard({ item }: { item: CarouselItem }) {
  return (
    <div className="carousel-card">
      {item.imageUrl && (
        <div className="carousel-card-image">
          <img src={item.imageUrl} alt={item.title} loading="lazy" />
        </div>
      )}
      <div className="carousel-card-content">
        <h4 className="carousel-card-title">{item.title}</h4>
        {item.subtitle && (
          <p className="carousel-card-subtitle">{item.subtitle}</p>
        )}
        {item.buttons && item.buttons.length > 0 && (
          <div className="carousel-card-buttons">
            {item.buttons.map((btn, idx) => (
              <CarouselButton key={idx} button={btn} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CarouselButton({ button }: { button: NonNullable<CarouselItem['buttons']>[0] }) {
  const { sendQuickReply } = useChatContext();

  if (button.type === 'web_url' && button.url) {
    return (
      <a 
        href={button.url}
        target="_blank"
        rel="noopener noreferrer"
        className="carousel-btn carousel-btn--link"
      >
        {button.title}
        <ExternalLink size={12} />
      </a>
    );
  }

  return (
    <button 
      className="carousel-btn"
      onClick={() => button.payload && sendQuickReply(button.payload, button.title)}
    >
      {button.title}
    </button>
  );
}
