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
// MEDICAL CADUCEUS & NATURAL CARE EMBLEM
// Vector icon reproducing the final logo emblem
// ====================================================
export const ClinicLogoSymbol: React.FC<{ className?: string }> = ({ className = 'h-11 w-11' }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Navin Homeo Care Medical Emblem"
    >
      <defs>
        {/* Metallic Gold Gradients */}
        <linearGradient id="nhcGoldStaff" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="35%" stopColor="#D4AF37" />
          <stop offset="70%" stopColor="#A17410" />
          <stop offset="100%" stopColor="#D4AF37" />
        </linearGradient>
        <linearGradient id="nhcGoldWings" x1="0%" y1="0%" x2="100%" y2="60%">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="35%" stopColor="#D4AF37" />
          <stop offset="75%" stopColor="#A17410" />
          <stop offset="100%" stopColor="#784C05" />
        </linearGradient>
        <linearGradient id="nhcGoldBase" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#854D0E" />
        </linearGradient>

        {/* Botanical Green Gradients */}
        <linearGradient id="nhcLeafLeft" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22C55E" />
          <stop offset="45%" stopColor="#15803D" />
          <stop offset="100%" stopColor="#0B4619" />
        </linearGradient>
        <linearGradient id="nhcLeafRight" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4ADE80" />
          <stop offset="50%" stopColor="#16A34A" />
          <stop offset="100%" stopColor="#0F5132" />
        </linearGradient>

        {/* Homeopathic Pearl Globule Gradients */}
        <radialGradient id="nhcPearl" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#F1F5F9" />
          <stop offset="100%" stopColor="#94A3B8" />
        </radialGradient>
      </defs>

      {/* Golden Base Arc */}
      <path
        d="M12 58 C 15 84, 45 92, 50 92 C 55 92, 85 84, 88 58"
        stroke="url(#nhcGoldBase)"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Left Medicinal Leaf */}
      <path
        d="M48 76 C 36 76, 12 70, 15 42 C 22 28, 38 46, 48 76 Z"
        fill="url(#nhcLeafLeft)"
      />
      <path
        d="M20 48 C 28 58, 36 68, 48 74"
        stroke="#86EFAC"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Right Branch & Leaves */}
      <path
        d="M52 74 C 62 66, 85 55, 82 38 C 72 32, 60 48, 52 74 Z"
        fill="url(#nhcLeafRight)"
      />
      <path
        d="M52 74 C 66 60, 74 46, 78 40"
        stroke="#BBF7D0"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.75"
      />

      {/* Winged Caduceus: Left Wing */}
      <path
        d="M48 28 C 42 22, 26 18, 8 23 C 14 30, 26 35, 42 34 C 44 34, 46 32, 48 28 Z"
        fill="url(#nhcGoldWings)"
      />
      <path
        d="M14 26 C 24 31, 34 33, 46 32"
        stroke="#FDF0CD"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M18 31 C 28 35, 38 36, 46 34"
        stroke="#784C05"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.75"
      />

      {/* Winged Caduceus: Right Wing */}
      <path
        d="M52 28 C 58 22, 74 18, 92 23 C 86 30, 74 35, 58 34 C 56 34, 54 32, 52 28 Z"
        fill="url(#nhcGoldWings)"
      />
      <path
        d="M86 26 C 76 31, 66 33, 54 32"
        stroke="#FDF0CD"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M82 31 C 72 35, 62 36, 54 34"
        stroke="#784C05"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.75"
      />

      {/* Central Staff (Golden Rod) */}
      <rect x="48" y="18" width="4" height="60" rx="2" fill="url(#nhcGoldStaff)" />
      {/* Top Finial Sphere */}
      <circle cx="50" cy="15" r="5.5" fill="url(#nhcGoldStaff)" stroke="#FDF0CD" strokeWidth="0.8" />

      {/* Coiled Serpent */}
      <path
        d="M48 38 C 40 37, 40 44, 50 46 C 60 48, 60 55, 50 57 C 42 59, 42 66, 50 68"
        stroke="url(#nhcGoldStaff)"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Serpent Head looking toward staff */}
      <path
        d="M48 37 C 49 35, 52 35, 53 37"
        stroke="#FDE68A"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Homeopathic White Pearls / Globules at Base */}
      <circle cx="43" cy="74" r="5" fill="url(#nhcPearl)" stroke="#CBD5E1" strokeWidth="0.6" />
      <circle cx="50" cy="77" r="5.5" fill="url(#nhcPearl)" stroke="#CBD5E1" strokeWidth="0.6" />
      <circle cx="57" cy="73" r="5" fill="url(#nhcPearl)" stroke="#CBD5E1" strokeWidth="0.6" />
      <circle cx="47" cy="69" r="4.2" fill="url(#nhcPearl)" stroke="#CBD5E1" strokeWidth="0.6" />
      <circle cx="54" cy="68" r="4.2" fill="url(#nhcPearl)" stroke="#CBD5E1" strokeWidth="0.6" />
      <circle cx="38" cy="77" r="3.2" fill="url(#nhcPearl)" stroke="#CBD5E1" strokeWidth="0.5" />
      <circle cx="62" cy="76" r="3.2" fill="url(#nhcPearl)" stroke="#CBD5E1" strokeWidth="0.5" />
    </svg>
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
              <span>Mon – Sat: 10:00 AM – 8:00 PM | Sun: 10:00 AM – 2:00 PM</span>
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
          {/* Left: Clinic Logo & Name (matching final logo style) */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group select-none">
            <div className="relative shrink-0 flex items-center justify-center">
              <ClinicLogoSymbol className="h-11 w-11 xl:h-12 xl:w-12 object-contain group-hover:scale-105 transition-transform" />
            </div>
            <div className="flex flex-col justify-center">
              {/* Line 1: NAVIN - large / dominant, deep navy blue, elegant serif */}
              <span
                className="text-[21px] xl:text-[23px] font-bold text-[#0A1E3F] tracking-tight leading-none"
                style={{ fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif" }}
              >
                NAVIN
              </span>

              {/* Line 2: HOMEO CARE - green, elegant serif, slightly smaller than NAVIN */}
              <span
                className="text-[12.5px] xl:text-[13.5px] font-bold text-[#0F5132] tracking-[0.03em] leading-tight mt-0.5"
                style={{ fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif" }}
              >
                HOMEO CARE
              </span>

              {/* Line 3: & RESEARCH CENTER - deep navy blue, small uppercase, increased letter spacing, subtle gold accent */}
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-[1px] w-2 bg-[#C59B27]/60"></span>
                <span
                  className="text-[8.5px] xl:text-[9px] font-bold text-[#0A1E3F] tracking-[0.2em] uppercase leading-none"
                  style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
                >
                  &amp; RESEARCH CENTER
                </span>
                <span className="h-[1px] w-2 bg-[#C59B27]/60"></span>
              </div>
            </div>
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
        {/* Left: Small clinic logo & styled brand name */}
        <Link to="/" className="flex items-center gap-2 xs:gap-2.5 min-w-0 shrink-0 group select-none">
          <div className="relative shrink-0 flex items-center justify-center">
            <ClinicLogoSymbol className="h-9 w-9 sm:h-10 sm:w-10 object-contain group-hover:scale-105 transition-transform" />
          </div>

          {/* Mobile (<640px): simplified "Navin" in navy, "Homeo Care" in green */}
          <div className="sm:hidden flex items-baseline gap-1 text-[15px] xs:text-[16px] tracking-tight truncate leading-tight">
            <span
              className="font-bold text-[#0A1E3F]"
              style={{ fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif" }}
            >
              Navin
            </span>
            <span
              className="font-bold text-[#0F5132]"
              style={{ fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif" }}
            >
              Homeo Care
            </span>
          </div>

          {/* Tablet (640px to 1023px, e.g. 768px): scaled 3-line branding */}
          <div className="hidden sm:flex flex-col justify-center">
            <span
              className="text-[17px] font-bold text-[#0A1E3F] tracking-tight leading-none"
              style={{ fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif" }}
            >
              NAVIN
            </span>
            <span
              className="text-[11px] font-bold text-[#0F5132] tracking-[0.03em] leading-tight mt-0.5"
              style={{ fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif" }}
            >
              HOMEO CARE
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="h-[0.5px] w-1.5 bg-[#C59B27]/60"></span>
              <span
                className="text-[7.5px] font-bold text-[#0A1E3F] tracking-[0.16em] uppercase leading-none"
                style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
              >
                &amp; RESEARCH CENTER
              </span>
              <span className="h-[0.5px] w-1.5 bg-[#C59B27]/60"></span>
            </div>
          </div>
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
