import React from 'react';
import { CLINIC_CONFIG } from '../config/clinicData';
import { useRouter } from '../context/RouterContext';
import { useCart } from '../context/CartContext';
import { Phone, MessageCircle, Navigation, Calendar, ShoppingCart } from 'lucide-react';

export const MobileStickyBar: React.FC = () => {
  const { navigate } = useRouter();
  const { cartCount } = useCart();

  return (
    <div
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-2 py-1 flex items-center justify-around"
      style={{ height: '60px' }}
      role="navigation"
      aria-label="Mobile quick actions"
    >
      {/* 1. Call Button - min 44px target */}
      <a
        href={CLINIC_CONFIG.telLink}
        className="min-w-[54px] min-h-[44px] flex flex-col items-center justify-center py-1 px-1.5 text-[#001428] hover:text-[#006e2d] transition-colors"
        aria-label="Call clinic directly"
      >
        <Phone className="w-5 h-5 text-[#006e2d]" />
        <span className="text-[11px] font-bold mt-0.5">Call</span>
      </a>

      {/* 2. WhatsApp Button - min 44px target */}
      <a
        href={CLINIC_CONFIG.whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="min-w-[54px] min-h-[44px] flex flex-col items-center justify-center py-1 px-1.5 text-[#006e2d] hover:text-[#005320] transition-colors"
        aria-label="Message clinic on WhatsApp"
      >
        <MessageCircle className="w-5 h-5 text-[#006e2d]" />
        <span className="text-[11px] font-bold mt-0.5">WhatsApp</span>
      </a>

      {/* 3. Directions Button - min 44px target */}
      <a
        href={CLINIC_CONFIG.googleDirectionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="min-w-[54px] min-h-[44px] flex flex-col items-center justify-center py-1 px-1.5 text-slate-700 hover:text-[#001428] transition-colors"
        aria-label="Get Google Maps directions"
      >
        <Navigation className="w-5 h-5 text-blue-700" />
        <span className="text-[11px] font-bold mt-0.5">Directions</span>
      </a>

      {/* Optional Cart Button if cart has items */}
      {cartCount > 0 && (
        <button
          onClick={() => navigate('/cart')}
          className="relative min-w-[48px] min-h-[44px] flex flex-col items-center justify-center py-1 px-1 text-slate-700 cursor-pointer"
          aria-label="View Cart"
        >
          <ShoppingCart className="w-5 h-5 text-slate-800" />
          <span className="text-[11px] font-bold mt-0.5">Cart</span>
          <span className="absolute top-1 right-2 bg-[#006e2d] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
            {cartCount}
          </span>
        </button>
      )}

      {/* 4. Book Button - min 44px target */}
      <button
        onClick={() => navigate('/appointment')}
        className="min-h-[44px] inline-flex items-center gap-1.5 bg-[#006e2d] active:bg-[#005320] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer whitespace-nowrap"
        aria-label="Book an appointment"
      >
        <Calendar className="w-4 h-4 text-emerald-300" />
        <span>Appointment</span>
      </button>
    </div>
  );
};
