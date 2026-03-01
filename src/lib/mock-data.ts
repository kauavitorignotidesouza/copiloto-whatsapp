// Mock data for development - realistic Brazilian WhatsApp conversations

export interface MockContact {
  id: string;
  name: string;
  waId: string;
  email?: string;
  company?: string;
  funnelStage: string;
  tags: string[];
  avatarInitials: string;
}

export interface MockConversation {
  id: string;
  contactId: string;
  contactName: string;
  contactPhone: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
  status: "open" | "waiting" | "closed";
  assignedTo?: string;
  windowExpiresAt: Date;
  avatarInitials: string;
}

export interface MockMessage {
  id: string;
  conversationId: string;
  direction: "inbound" | "outbound";
  type: "text" | "image" | "template";
  content: string;
  status: "pending" | "sent" | "delivered" | "read" | "failed";
  createdAt: Date;
  isAiGenerated?: boolean;
}

const now = new Date();
const h = (hours: number) => new Date(now.getTime() - hours * 3600000);
const m = (minutes: number) => new Date(now.getTime() - minutes * 60000);

export const mockContacts: MockContact[] = [
  { id: "c1", name: "Maria Silva", waId: "+5511999887766", email: "maria@email.com", company: "Boutique Maria", funnelStage: "proposta", tags: ["VIP", "Recorrente"], avatarInitials: "MS" },
  { id: "c2", name: "João Santos", waId: "+5521988776655", email: "joao@email.com", funnelStage: "qualificacao", tags: ["Novo"], avatarInitials: "JS" },
  { id: "c3", name: "Ana Oliveira", waId: "+5531977665544", email: "ana@email.com", company: "Ana Cosméticos", funnelStage: "pagamento", tags: ["VIP"], avatarInitials: "AO" },
  { id: "c4", name: "Pedro Costa", waId: "+5541966554433", funnelStage: "novo_lead", tags: [], avatarInitials: "PC" },
  { id: "c5", name: "Camila Ferreira", waId: "+5511955443322", email: "camila@email.com", funnelStage: "proposta", tags: ["Instagram"], avatarInitials: "CF" },
  { id: "c6", name: "Lucas Mendes", waId: "+5521944332211", funnelStage: "pos_venda", tags: ["Recorrente"], avatarInitials: "LM" },
  { id: "c7", name: "Fernanda Lima", waId: "+5531933221100", email: "fernanda@email.com", company: "Studio F", funnelStage: "qualificacao", tags: ["Click-to-WA"], avatarInitials: "FL" },
  { id: "c8", name: "Roberto Alves", waId: "+5541922110099", funnelStage: "novo_lead", tags: [], avatarInitials: "RA" },
];

export const mockConversations: MockConversation[] = [
  { id: "conv1", contactId: "c1", contactName: "Maria Silva", contactPhone: "+5511999887766", lastMessage: "Oi, vocês têm o vestido floral em M?", lastMessageAt: m(3), unreadCount: 2, status: "open", assignedTo: "Você", windowExpiresAt: new Date(now.getTime() + 20 * 3600000), avatarInitials: "MS" },
  { id: "conv2", contactId: "c2", contactName: "João Santos", contactPhone: "+5521988776655", lastMessage: "Qual o prazo de entrega pro RJ?", lastMessageAt: m(15), unreadCount: 1, status: "open", windowExpiresAt: new Date(now.getTime() + 18 * 3600000), avatarInitials: "JS" },
  { id: "conv3", contactId: "c3", contactName: "Ana Oliveira", contactPhone: "+5531977665544", lastMessage: "Pix enviado! Segue comprovante", lastMessageAt: m(45), unreadCount: 0, status: "waiting", assignedTo: "Você", windowExpiresAt: new Date(now.getTime() + 12 * 3600000), avatarInitials: "AO" },
  { id: "conv4", contactId: "c4", contactName: "Pedro Costa", contactPhone: "+5541966554433", lastMessage: "Bom dia, vi o anúncio no Instagram", lastMessageAt: h(2), unreadCount: 1, status: "open", windowExpiresAt: new Date(now.getTime() + 22 * 3600000), avatarInitials: "PC" },
  { id: "conv5", contactId: "c5", contactName: "Camila Ferreira", contactPhone: "+5511955443322", lastMessage: "Tem desconto pra compra acima de 3?", lastMessageAt: h(4), unreadCount: 0, status: "open", assignedTo: "Carlos", windowExpiresAt: new Date(now.getTime() + 8 * 3600000), avatarInitials: "CF" },
  { id: "conv6", contactId: "c6", contactName: "Lucas Mendes", contactPhone: "+5521944332211", lastMessage: "Obrigado, chegou certinho!", lastMessageAt: h(8), unreadCount: 0, status: "closed", windowExpiresAt: new Date(now.getTime() - 2 * 3600000), avatarInitials: "LM" },
  { id: "conv7", contactId: "c7", contactName: "Fernanda Lima", contactPhone: "+5531933221100", lastMessage: "Conseguem entregar até sexta?", lastMessageAt: h(12), unreadCount: 3, status: "open", windowExpiresAt: new Date(now.getTime() + 3 * 3600000), avatarInitials: "FL" },
  { id: "conv8", contactId: "c8", contactName: "Roberto Alves", contactPhone: "+5541922110099", lastMessage: "Quanto tá o tênis Nike Air?", lastMessageAt: h(20), unreadCount: 1, status: "open", windowExpiresAt: new Date(now.getTime() + 1 * 3600000), avatarInitials: "RA" },
];

export const mockMessages: Record<string, MockMessage[]> = {
  conv1: [
    { id: "m1", conversationId: "conv1", direction: "inbound", type: "text", content: "Oi, boa tarde! 😊", status: "read", createdAt: m(60) },
    { id: "m2", conversationId: "conv1", direction: "outbound", type: "text", content: "Olá Maria! Boa tarde! Como posso te ajudar?", status: "read", createdAt: m(58) },
    { id: "m3", conversationId: "conv1", direction: "inbound", type: "text", content: "Estou procurando um vestido pra um casamento", status: "read", createdAt: m(55) },
    { id: "m4", conversationId: "conv1", direction: "outbound", type: "text", content: "Temos várias opções lindas! Qual seu tamanho e preferência de cor?", status: "read", createdAt: m(52), isAiGenerated: true },
    { id: "m5", conversationId: "conv1", direction: "inbound", type: "text", content: "Uso M, prefiro algo floral ou em tons pastel", status: "read", createdAt: m(48) },
    { id: "m6", conversationId: "conv1", direction: "outbound", type: "text", content: "Perfeito! Temos o Vestido Floral Primavera (R$ 189,90) e o Vestido Rosa Blush (R$ 229,90). Ambos disponíveis em M. Quer que eu envie fotos?", status: "read", createdAt: m(45), isAiGenerated: true },
    { id: "m7", conversationId: "conv1", direction: "inbound", type: "text", content: "Sim, por favor! O floral parece lindo", status: "read", createdAt: m(10) },
    { id: "m8", conversationId: "conv1", direction: "inbound", type: "text", content: "Oi, vocês têm o vestido floral em M?", status: "read", createdAt: m(3) },
  ],
  conv2: [
    { id: "m10", conversationId: "conv2", direction: "inbound", type: "text", content: "Boa tarde! Vi o tênis de corrida no site", status: "read", createdAt: m(30) },
    { id: "m11", conversationId: "conv2", direction: "outbound", type: "text", content: "Olá João! Qual modelo te interessou?", status: "read", createdAt: m(28) },
    { id: "m12", conversationId: "conv2", direction: "inbound", type: "text", content: "O Nike Air Max, tamanho 42. Tem em preto?", status: "read", createdAt: m(25) },
    { id: "m13", conversationId: "conv2", direction: "outbound", type: "text", content: "Temos sim! O Nike Air Max 90 preto está R$ 599,90 e temos em estoque no 42.", status: "delivered", createdAt: m(20), isAiGenerated: true },
    { id: "m14", conversationId: "conv2", direction: "inbound", type: "text", content: "Qual o prazo de entrega pro RJ?", status: "read", createdAt: m(15) },
  ],
  conv3: [
    { id: "m20", conversationId: "conv3", direction: "inbound", type: "text", content: "Oi! Quero fechar o pedido do kit skincare", status: "read", createdAt: h(2) },
    { id: "m21", conversationId: "conv3", direction: "outbound", type: "text", content: "Ótimo Ana! O Kit Skincare Premium fica R$ 349,90. Aceita Pix?", status: "read", createdAt: h(1.9) },
    { id: "m22", conversationId: "conv3", direction: "inbound", type: "text", content: "Sim! Me manda a chave", status: "read", createdAt: h(1.8) },
    { id: "m23", conversationId: "conv3", direction: "outbound", type: "text", content: "Chave Pix: 12.345.678/0001-90\nValor: R$ 349,90\nFavor enviar o comprovante aqui 😊", status: "read", createdAt: h(1.7) },
    { id: "m24", conversationId: "conv3", direction: "inbound", type: "text", content: "Pix enviado! Segue comprovante", status: "read", createdAt: m(45) },
  ],
  conv4: [
    { id: "m30", conversationId: "conv4", direction: "inbound", type: "text", content: "Bom dia, vi o anúncio no Instagram", status: "read", createdAt: h(2) },
  ],
  conv5: [
    { id: "m40", conversationId: "conv5", direction: "inbound", type: "text", content: "Oi! Quero 3 camisetas", status: "read", createdAt: h(5) },
    { id: "m41", conversationId: "conv5", direction: "outbound", type: "text", content: "Olá Camila! Quais modelos e tamanhos?", status: "read", createdAt: h(4.8) },
    { id: "m42", conversationId: "conv5", direction: "inbound", type: "text", content: "Tem desconto pra compra acima de 3?", status: "read", createdAt: h(4) },
  ],
};

export interface MockProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stockQuantity: number;
  imageUrl?: string;
  isActive: boolean;
}

export const mockProducts: MockProduct[] = [
  { id: "p1", name: "Vestido Floral Primavera", description: "Vestido midi estampado floral, tecido viscose", price: 189.90, category: "Vestidos", stockQuantity: 12, isActive: true },
  { id: "p2", name: "Vestido Rosa Blush", description: "Vestido longo em crepe, tom rosa blush", price: 229.90, category: "Vestidos", stockQuantity: 8, isActive: true },
  { id: "p3", name: "Nike Air Max 90", description: "Tênis de corrida Nike Air Max 90, preto", price: 599.90, category: "Calçados", stockQuantity: 15, isActive: true },
  { id: "p4", name: "Kit Skincare Premium", description: "Kit completo com sérum, hidratante e protetor solar", price: 349.90, category: "Cosméticos", stockQuantity: 6, isActive: true },
  { id: "p5", name: "Camiseta Básica Algodão", description: "Camiseta unissex 100% algodão, várias cores", price: 49.90, category: "Camisetas", stockQuantity: 45, isActive: true },
  { id: "p6", name: "Calça Jeans Slim", description: "Calça jeans slim fit, lavagem escura", price: 159.90, category: "Calças", stockQuantity: 20, isActive: true },
  { id: "p7", name: "Bolsa Couro Caramelo", description: "Bolsa de couro legítimo, cor caramelo", price: 299.90, category: "Acessórios", stockQuantity: 3, isActive: true },
  { id: "p8", name: "Óculos Sol Aviador", description: "Óculos de sol modelo aviador, proteção UV400", price: 129.90, category: "Acessórios", stockQuantity: 0, isActive: false },
];

export interface MockDeal {
  id: string;
  contactName: string;
  product: string;
  value: number;
  funnelStage: string;
  daysInStage: number;
  avatarInitials: string;
}

export const mockDeals: MockDeal[] = [
  { id: "d1", contactName: "Pedro Costa", product: "Nike Air Max 90", value: 599.90, funnelStage: "novo_lead", daysInStage: 1, avatarInitials: "PC" },
  { id: "d2", contactName: "Roberto Alves", product: "Kit Skincare", value: 349.90, funnelStage: "novo_lead", daysInStage: 0, avatarInitials: "RA" },
  { id: "d3", contactName: "Mariana Souza", product: "2x Vestido Floral", value: 379.80, funnelStage: "novo_lead", daysInStage: 2, avatarInitials: "MS" },
  { id: "d4", contactName: "João Santos", product: "Nike Air Max 90", value: 599.90, funnelStage: "qualificacao", daysInStage: 3, avatarInitials: "JS" },
  { id: "d5", contactName: "Fernanda Lima", product: "3x Camiseta + Calça", value: 309.60, funnelStage: "qualificacao", daysInStage: 5, avatarInitials: "FL" },
  { id: "d6", contactName: "Maria Silva", product: "Vestido + Bolsa", value: 489.80, funnelStage: "proposta", daysInStage: 2, avatarInitials: "MS" },
  { id: "d7", contactName: "Camila Ferreira", product: "3x Camiseta Básica", value: 149.70, funnelStage: "proposta", daysInStage: 1, avatarInitials: "CF" },
  { id: "d8", contactName: "Thiago Rocha", product: "Calça Jeans + Camiseta", value: 209.80, funnelStage: "proposta", daysInStage: 4, avatarInitials: "TR" },
  { id: "d9", contactName: "Ana Oliveira", product: "Kit Skincare Premium", value: 349.90, funnelStage: "pagamento", daysInStage: 0, avatarInitials: "AO" },
  { id: "d10", contactName: "Juliana Pires", product: "Bolsa Couro", value: 299.90, funnelStage: "pagamento", daysInStage: 1, avatarInitials: "JP" },
  { id: "d11", contactName: "Lucas Mendes", product: "Nike Air Max 90", value: 599.90, funnelStage: "pos_venda", daysInStage: 7, avatarInitials: "LM" },
  { id: "d12", contactName: "Bianca Martins", product: "2x Kit Skincare", value: 699.80, funnelStage: "pos_venda", daysInStage: 14, avatarInitials: "BM" },
];

export const mockAiSuggestions = [
  {
    id: "s1",
    text: "Temos sim o vestido floral em M! Está R$ 189,90 e podemos enviar hoje. Quer que eu separe pra você? 😊",
    tone: "friendly" as const,
    confidence: 0.92,
  },
  {
    id: "s2",
    text: "O vestido floral Primavera está disponível no tamanho M. Valor: R$ 189,90. Posso enviar fotos adicionais se desejar.",
    tone: "neutral" as const,
    confidence: 0.87,
  },
  {
    id: "s3",
    text: "Disponível em M! R$ 189,90 com frete grátis acima de R$ 200. Se levar com a bolsa caramelo, damos 10% de desconto no total!",
    tone: "friendly" as const,
    confidence: 0.78,
  },
];
