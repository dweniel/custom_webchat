import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingBag, ExternalLink } from 'lucide-react';
import type { CarouselProduct } from '../types';
import './ProductCarousel.css';

interface ProductCarouselProps {
  products: CarouselProduct[];
  onProductClick?: (product: CarouselProduct) => void;
}

export function ProductCarousel({ products, onProductClick }: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(2);
  const containerRef = useRef<HTMLDivElement>(null);

  // Ajusta quantidade de cards visíveis baseado na largura
  useEffect(() => {
    const updateVisibleCards = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        if (width < 300) {
          setVisibleCards(1);
        } else if (width < 500) {
          setVisibleCards(2);
        } else {
          setVisibleCards(3);
        }
      }
    };

    updateVisibleCards();
    window.addEventListener('resize', updateVisibleCards);
    return () => window.removeEventListener('resize', updateVisibleCards);
  }, []);

  const maxIndex = Math.max(0, products.length - visibleCards);
  
  const goNext = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  };

  const goPrev = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  const handleProductClick = (product: CarouselProduct) => {
    if (onProductClick) {
      onProductClick(product);
    } else {
      window.open(product.productLink, '_blank', 'noopener,noreferrer');
    }
  };

  const totalPages = Math.ceil(products.length / visibleCards);
  const currentPage = Math.floor(currentIndex / visibleCards);

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="product-carousel" ref={containerRef}>
      <div className="carousel-container">
        <motion.div 
          className="carousel-track"
          animate={{ x: `calc(-${currentIndex * (100 / visibleCards)}%)` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              className="carousel-card"
              style={{ width: `calc(${100 / visibleCards}% - 12px)` }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="card-inner">
                {/* Badge de desconto */}
                {product.discountPercentage && product.discountPercentage > 0 && (
                  <div className="discount-badge">
                    {product.discountPercentage}%
                  </div>
                )}
                
                {/* Imagem do produto */}
                <div className="product-image-container">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="product-image"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="%23f0f0f0" width="200" height="200"/><text fill="%23999" font-family="sans-serif" font-size="14" x="50%" y="50%" text-anchor="middle" dy=".3em">Sem imagem</text></svg>';
                    }}
                  />
                </div>

                {/* Informações do produto */}
                <div className="product-info">
                  <h4 className="product-name" title={product.name}>
                    {product.name}
                  </h4>
                  
                  <div className="product-pricing">
                    {product.originalPrice && (
                      <span className="original-price">{product.originalPrice}</span>
                    )}
                    <span className="current-price">{product.price}</span>
                  </div>
                </div>

                {/* Botão de ação */}
                <button
                  className="product-action-btn"
                  onClick={() => handleProductClick(product)}
                  aria-label={`Ver ${product.name}`}
                >
                  <ShoppingBag size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Navegação */}
      <div className="carousel-navigation">
        <button
          className="nav-button"
          onClick={goPrev}
          disabled={currentIndex === 0}
          aria-label="Anterior"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="carousel-dots">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              className={`dot ${currentPage === index ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index * visibleCards)}
              aria-label={`Página ${index + 1}`}
            />
          ))}
        </div>

        <button
          className="nav-button"
          onClick={goNext}
          disabled={currentIndex >= maxIndex}
          aria-label="Próximo"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
