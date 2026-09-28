import { CartItem } from '../context/CartContext';
import { CLINIC_CONFIG } from '../config/clinicData';

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderCustomer {
  fullName: string;
  phone: string;
  email?: string;
}

export interface OrderAddress {
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}

export type OrderSource = 'Website Shop' | 'Admin-created Order' | 'Phone' | 'WhatsApp' | 'Walk-in' | string;

export interface Order {
  id: string;
  createdAt: string;
  items: CartItem[];
  customer: OrderCustomer;
  address: OrderAddress;
  notes?: string;
  paymentMethod: 'cod' | 'online_pending' | 'cash' | 'upi';
  paymentStatus: 'pending_on_delivery' | 'paid';
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  estimatedDelivery: string;
  source?: OrderSource;
  refundAmount?: number;
  courierName?: string;
  trackingNumber?: string;
}

const ORDERS_STORAGE_KEY = 'navin_homeo_orders_v1';

export const ORDER_STATUS_LABELS: Record<
  OrderStatus,
  { label: string; desc: string; step: number; color: string }
> = {
  placed: {
    label: 'Order Placed',
    desc: 'Order received and logged in Navin Homeo Care store system.',
    step: 1,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  confirmed: {
    label: 'Order Confirmed',
    desc: 'Order confirmed and verified for secure packaging.',
    step: 1,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  processing: {
    label: 'Preparing Order',
    desc: 'Packaging your items safely with verification.',
    step: 2,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  packed: {
    label: 'Packed & Quality Checked',
    desc: 'Items securely packed with product invoice.',
    step: 2,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  shipped: {
    label: 'Dispatched with Courier',
    desc: 'Package handed over for local Lucknow or regional courier transit.',
    step: 3,
    color: 'text-purple-600 bg-purple-50 border-purple-200',
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    desc: 'Courier executive is delivering the package to your destination address.',
    step: 4,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  delivered: {
    label: 'Delivered',
    desc: 'Package successfully delivered and received at your address.',
    step: 5,
    color: 'text-[#006e2d] bg-emerald-50 border-emerald-200',
  },
  cancelled: {
    label: 'Cancelled',
    desc: 'Order was cancelled.',
    step: 0,
    color: 'text-red-600 bg-red-50 border-red-200',
  },
  refunded: {
    label: 'Refunded',
    desc: 'Payment or COD order reversed.',
    step: 0,
    color: 'text-slate-600 bg-slate-50 border-slate-200',
  },
};

const SEED_ORDERS: Order[] = [
  {
    id: 'NHC-ORD-9281',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    items: [
      {
        id: 'prod-01',
        name: 'Natural Calendula Soothing Skin Cream',
        slug: 'natural-calendula-soothing-cream',
        category: 'Hair & Skin Care',
        price: 280,
        mrp: 320,
        image:
          'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
        quantity: 2,
        stockQuantity: 24,
      },
    ],
    customer: {
      fullName: 'Anoop Verma',
      phone: '07318306699',
      email: 'anoop.verma@example.com',
    },
    address: {
      addressLine1: 'B-14, Sector C, Near Phoenix Mall',
      addressLine2: 'Alambagh',
      landmark: 'Near Metro Pillar 42',
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      pincode: '226005',
    },
    notes: 'Please call before delivery.',
    paymentMethod: 'cod',
    paymentStatus: 'pending_on_delivery',
    subtotal: 560,
    shippingFee: 0,
    discount: 80,
    total: 560,
    status: 'shipped',
    estimatedDelivery: 'Tomorrow, by 5:00 PM',
  },
];

export const getStoredOrders = (): Order[] => {
  if (typeof window === 'undefined') return SEED_ORDERS;
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(SEED_ORDERS));
      return SEED_ORDERS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading orders from localStorage', err);
    return SEED_ORDERS;
  }
};

export const saveOrder = (newOrder: Order): void => {
  if (typeof window === 'undefined') return;
  try {
    const current = getStoredOrders();
    const updated = [newOrder, ...current.filter((o) => o.id !== newOrder.id)];
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save order', err);
  }
};

export const generateOrderId = (): string => {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `NHC-ORD-${randomSuffix}`;
};

export const findOrder = (
  orderId: string,
  phone?: string
): Order | null => {
  const orders = getStoredOrders();
  const cleanId = orderId.trim().toUpperCase();
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';

  return (
    orders.find((order) => {
      const idMatches = order.id.toUpperCase() === cleanId;
      if (!phone || cleanPhone === '') return idMatches;
      const orderCleanPhone = order.customer.phone.replace(/[^0-9]/g, '');
      return (
        idMatches &&
        (orderCleanPhone.endsWith(cleanPhone) || cleanPhone.endsWith(orderCleanPhone))
      );
    }) || null
  );
};

export const getWhatsAppOrderLink = (order: Order): string => {
  const text = `Hello Navin Homeo Care, I have an inquiry about my Order ${order.id} (Total: ₹${order.total}). Name: ${order.customer.fullName}.`;
  return `https://wa.me/91${CLINIC_CONFIG.phoneClean.replace(/^0/, '')}?text=${encodeURIComponent(text)}`;
};
