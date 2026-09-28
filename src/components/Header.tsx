import React, { useState } from 'react';
import { CLINIC_CONFIG } from '../config/clinicData';
import { Link, useRouter } from '../context/RouterContext';
import { useCart } from '../context/CartContext';
import {
  Phone,
  MapPin,
  Clock,
  Star,
  Calendar,
  Menu,
  X,
  ShoppingCart,
  ChevronRight,
  Package,
} from 'lucide-react';

// ====================================================
// CLINIC LOGO
// ====================================================
export const ClinicLogoSymbol: React.FC<{ className?: string }> = ({ className = 'h-11 w-auto' }) => {
  return (
    <img
      src="/logo.png"
      alt="Navin Homeo Care"
      className={`${className} object-contain`}
    />
  );
};

export const Header: React.FC = () => {
  const { currentPath, navigate } = useRouter();
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About Doctor', path: '/about' },
    { label: 'Treatments', path: '/treatments' },
    { label: 'Shop', path: '/shop' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Reviews', path: '/reviews' },
    { label: 'FAQs', path: '/faq' },
    { label: 'Contact', path: '/contact' },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-xs border-b border-slate-200/80 transition-all">
      {/* ====================================================
          TOP INFORMATION BAR (Desktop & Tablet) - Slim & Elegant
         ==================================================== */}
      <div className="hidden lg:block bg-[#001428] text-white py-1.5 px-4 text-xs font-medium border-b border-blue-900/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-5">
            <a
              href={CLINIC_CONFIG.telLink}
              className="flex items-center gap-1.5 text-slate-200 hover:text-emerald-400 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Call: {CLINIC_CONFIG.phone}</span>
            </a>
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Alambagh, Lucknow</span>
            </div>
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mon – Thu: 10:00 AM – 8:00 PM | Sun: 10:00 AM – 2:00 PM</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/track-order"
              className="flex items-center gap-1.5 text-slate-300 hover:text-emerald-400 transition-colors text-[11px] font-semibold"
            >
              <Package className="w-3.5 h-3.5 text-emerald-400" />
              <span>Track Order</span>
            </Link>

            <div className="flex items-center gap-2 bg-white/10 px-3 py-0.5 rounded-full text-white text-[11px]">
              <div className="flex text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
              </div>
              <span className="font-bold text-emerald-400">4.9 / 5.0</span>
              <span className="text-slate-300">({CLINIC_CONFIG.reviewsCount} Google Reviews)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================
          MAIN NAVIGATION (Desktop & Tablet)
         ==================================================== */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Left: Clinic Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group select-none py-1">
            <img
              src="/logo.png"
              alt="Navin Homeo Care"
              className="h-12 xl:h-13.5 w-auto max-w-[210px] xl:max-w-[230px] object-contain group-hover:opacity-95 transition-opacity"
            />
          </Link>

          {/* Center Navigation Links */}
          <nav className="flex items-center gap-1 xl:gap-1.5">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <button
                  key={link.path}
                  onClick={() => handleNavClick(link.path)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    active
                      ? 'text-[#006e2d] bg-emerald-50/80 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-[#001428] hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons: Phone, Book Appointment & Cart */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Phone link */}
            <a
              href={CLINIC_CONFIG.telLink}
              className="p-2.5 rounded-xl text-slate-700 hover:text-[#006e2d] hover:bg-emerald-50 transition-colors border border-transparent hover:border-emerald-200/60"
              title={`Call ${CLINIC_CONFIG.phone}`}
            >
              <Phone className="w-5 h-5 text-[#006e2d]" />
            </a>

            {/* Cart Icon with live badge */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl text-slate-700 hover:text-[#001428] hover:bg-slate-100 transition-colors border border-slate-200/60 shadow-2xs"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5 text-slate-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#006e2d] text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Book Appointment CTA */}
            <Link
              to="/appointment"
              className="inline-flex items-center gap-2 bg-[#006e2d] hover:bg-[#005320] text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-xs hover:shadow transition-all whitespace-nowrap"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-300" />
              <span>Book Appointment</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ====================================================
          MOBILE & TABLET HEADER (Clean, Compact, No Broken Wrapping)
         ==================================================== */}
      <div className="lg:hidden px-3 xs:px-4 h-16 flex items-center justify-between gap-2">
        {/* Left: Small clinic logo */}
        <Link to="/" className="flex items-center min-w-0 shrink-0 group select-none py-1">
          <img
            src="/logo.png"
            alt="Navin Homeo Care"
            className="h-9 xs:h-10 sm:h-11 w-auto max-w-[170px] sm:max-w-[200px] object-contain group-hover:opacity-95 transition-opacity"
          />
        </Link>

        {/* Right Action Icons: Cart, Book button/icon, Hamburger */}
        <div className="flex items-center gap-1.5">
          {/* Cart Icon */}
          <Link
            to="/cart"
            className="relative min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="View Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-[#006e2d] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Quick Book Button */}
          <Link
            to="/appointment"
            className="min-h-[40px] px-3 inline-flex items-center gap-1.5 bg-[#006e2d] text-white text-xs font-bold rounded-lg shadow-2xs"
            aria-label="Book Appointment"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-300" />
            <span className="hidden xs:inline">Book</span>
          </Link>

          {/* Hamburger Menu Toggle (min 44px tap target) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-800 hover:bg-slate-100 cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ====================================================
          MOBILE SLIDE-OUT DRAWER MENU
         ==================================================== */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200/80 px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2 duration-200 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {/* Main Links */}
          <div className="flex flex-col gap-1 mb-4">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <button
                  key={link.path}
                  onClick={() => handleNavClick(link.path)}
                  className={`min-h-[44px] flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold text-left transition-colors cursor-pointer ${
                    active
                      ? 'text-[#006e2d] bg-emerald-50 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              );
            })}

            {/* Cart link in drawer */}
            <button
              onClick={() => handleNavClick('/cart')}
              className={`min-h-[44px] flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold text-left transition-colors cursor-pointer ${
                isActive('/cart') ? 'text-[#006e2d] bg-emerald-50 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-[#006e2d]" />
                <span>Shopping Cart</span>
              </div>
              {cartCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-[#006e2d] text-white text-xs font-bold">
                  {cartCount} items
                </span>
              ) : (
                <span className="text-xs text-slate-400">Empty</span>
              )}
            </button>

            {/* Track Order link in drawer */}
            <button
              onClick={() => handleNavClick('/track-order')}
              className={`min-h-[44px] flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold text-left transition-colors cursor-pointer ${
                isActive('/track-order') ? 'text-[#006e2d] bg-emerald-50 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#006e2d]" />
                <span>Track Order</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Quick Actions in Menu */}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
            <Link
              to="/appointment"
              onClick={() => setMobileMenuOpen(false)}
              className="min-h-[44px] flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#006e2d] text-white text-sm font-bold shadow-xs"
            >
              <Calendar className="w-4 h-4 text-emerald-300" />
              <span>Book In-Person Appointment</span>
            </Link>

            <a
              href={CLINIC_CONFIG.telLink}
              className="min-h-[44px] flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm font-semibold"
            >
              <Phone className="w-4 h-4 text-[#006e2d]" />
              <span>Call Clinic: {CLINIC_CONFIG.phone}</span>
            </a>

            <div className="text-[11px] text-slate-500 text-center pt-2">
              Pakri Ka Pul (500m), Azad Nagar Road, Alambagh, Lucknow
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
