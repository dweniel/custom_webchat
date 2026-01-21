import type { CarouselProduct } from '../types';

/**
 * Detecta se o texto contém um carousel de produtos em formato XML
 */
export function isCarouselMessage(text: string): boolean {
  if (!text) return false;
  return text.includes('<carousel-item>') || text.includes('&lt;carousel-item&gt;');
}

/**
 * Extrai a URL de imagem do formato markdown ![alt](url)
 */
function extractImageUrl(imageText: string): string {
  // Formato: ![filename](url)
  const match = imageText.match(/!\[.*?\]\((.*?)\)/);
  if (match) {
    return match[1];
  }
  // Se já for uma URL direta
  if (imageText.startsWith('http')) {
    return imageText;
  }
  return '';
}

/**
 * Extrai preço original e preço com desconto
 * Formato: "R$ 318,90 (de R$ 399,00)" ou "R$ 259,00"
 */
function parsePrice(priceText: string): { price: string; originalPrice?: string; discountPercentage?: number } {
  const deMatch = priceText.match(/R\$\s*([\d.,]+)\s*\(de\s*R\$\s*([\d.,]+)\)/);
  
  if (deMatch) {
    const currentPrice = parseFloat(deMatch[1].replace('.', '').replace(',', '.'));
    const originalPrice = parseFloat(deMatch[2].replace('.', '').replace(',', '.'));
    const discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    
    return {
      price: `R$ ${deMatch[1]}`,
      originalPrice: `R$ ${deMatch[2]}`,
      discountPercentage: discount
    };
  }
  
  return { price: priceText.trim() };
}

/**
 * Decodifica entidades HTML
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * Parseia o XML do carousel e retorna um array de produtos
 */
export function parseCarouselXml(text: string): CarouselProduct[] {
  const products: CarouselProduct[] = [];
  
  // Decodifica entidades HTML se necessário
  let xmlText = decodeHtmlEntities(text);
  
  // Remove o cabeçalho XML se presente
  xmlText = xmlText.replace(/<\?xml[^?]*\?>/g, '');
  
  // Regex para extrair cada carousel-item
  const itemRegex = /<carousel-item>([\s\S]*?)<\/carousel-item>/g;
  let match;
  let index = 0;
  
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemContent = match[1];
    
    // Extrair campos
    const nameMatch = itemContent.match(/<name>([\s\S]*?)<\/name>/);
    const priceMatch = itemContent.match(/<price>([\s\S]*?)<\/price>/);
    const descMatch = itemContent.match(/<description>([\s\S]*?)<\/description>/);
    const linkMatch = itemContent.match(/<product_link>([\s\S]*?)<\/product_link>/);
    const imageMatch = itemContent.match(/<image>([\s\S]*?)<\/image>/);
    
    if (nameMatch && priceMatch && linkMatch && imageMatch) {
      const priceInfo = parsePrice(priceMatch[1].trim());
      
      products.push({
        id: `product-${index}`,
        name: nameMatch[1].trim(),
        description: descMatch ? descMatch[1].trim() : undefined,
        price: priceInfo.price,
        originalPrice: priceInfo.originalPrice,
        discountPercentage: priceInfo.discountPercentage,
        imageUrl: extractImageUrl(imageMatch[1].trim()),
        productLink: decodeHtmlEntities(linkMatch[1].trim())
      });
      
      index++;
    }
  }
  
  return products;
}

/**
 * Extrai texto não-XML da mensagem (se houver texto antes/depois do carousel)
 */
export function extractTextFromCarouselMessage(text: string): string {
  // Remove o XML do carousel
  let cleanText = text
    .replace(/<\?xml[^?]*\?>/g, '')
    .replace(/<carousel-item>[\s\S]*?<\/carousel-item>/g, '')
    .trim();
  
  return cleanText;
}
