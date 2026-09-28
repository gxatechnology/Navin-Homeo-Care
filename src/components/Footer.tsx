import React from 'react';
import { CLINIC_CONFIG } from '../config/clinicData';
import { Link } from '../context/RouterContext';
import { ClinicLogoSymbol } from './Header';
import {
  MapPin,
  Phone,
  Clock,
  Compass,
  ChevronRight,
  MessageCircle,
  Calendar,
  ShieldAlert,
  Package,
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#001428] text-slate-300 pt-16 pb-24 lg:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-12 border-b border-slate-800">
          {/* COLUMN 1: Logo & Clinic Description */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="inline-flex items-center group">
              <div className="bg-white px-3.5 py-2 rounded-xl shadow-xs border border-white/10 group-hover:scale-[1.02] transition-transform">
                <img
                  src="/logo.png"
                  alt="Navin Homeo Care"
                  className="h-10 sm:h-11 w-auto max-w-[190px] object-contain"
                />
              </div>
            </Link>
            <p className="text-sm text-slate-300 leading-relaxed">
              Dr. Navin Maurya provides personalized homeopathic consultations with careful case assessment and patient-focused supportive care in Alambagh, Lucknow.
            </p>
            <div className="text-xs text-slate-400 mt-1">
              Consulting Physician: <span className="text-white font-semibold">Dr. Navin Maurya</span>
            </div>
          </div>

          {/* COLUMN 2: Quick Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
              Quick Links
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm text-slate-300">
              {[
                { label: 'Home', path: '/' },
                { label: 'About Doctor', path: '/about' },
                { label: 'Treatments', path: '/treatments' },
                { label: 'Shop', path: '/shop' },
                { label: 'Gallery', path: '/gallery' },
                { label: 'Reviews', path: '/reviews' },
                { label: 'FAQs', path: '/faq' },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="inline-flex items-center gap-1.5 hover:text-white hover:translate-x-0.5 transition-all text-slate-300"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3: Patient Support */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
              Patient Support
            </h3>
            <ul className="flex flex-col gap-3 text-sm text-slate-300">
              <li>
                <Link
                  to="/appointment"
                  className="inline-flex items-center gap-2 hover:text-white text-slate-300 transition-colors"
                >
                  <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Book Appointment</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/track-order"
                  className="inline-flex items-center gap-2 hover:text-white text-slate-300 transition-colors"
                >
                  <Package className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Track Order</span>
                </Link>
              </li>
              <li>
                <a
                  href={CLINIC_CONFIG.telLink}
                  className="inline-flex items-center gap-2 hover:text-white text-slate-300 transition-colors"
                >
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Call Clinic: {CLINIC_CONFIG.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={CLINIC_CONFIG.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-white text-slate-300 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>WhatsApp Enquiry</span>
                </a>
              </li>
              <li>
                <a
                  href={CLINIC_CONFIG.googleDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-white text-slate-300 transition-colors"
                >
                  <Compass className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Get Directions in Maps</span>
                </a>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 hover:text-white text-slate-300 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Contact &amp; Location Page</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: Clinic Information */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
              Clinic Information
            </h3>
            <div className="flex flex-col gap-3 text-sm text-slate-300">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <a href={CLINIC_CONFIG.telLink} className="hover:text-white font-semibold text-white">
                  {CLINIC_CONFIG.phone}
                </a>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-xs leading-relaxed text-slate-300">
                  {CLINIC_CONFIG.address.fullFormatted}
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300">
                  <div className="font-semibold text-white">OPD Timings:</div>
                  <div>Mon – Thu: 10:00 AM – 8:00 PM</div>
                  <div>Fri – Sat: Closed / Off</div>
                  <div>Sun: 10:00 AM – 2:00 PM</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Short Medical Disclaimer (Per Section K) */}
        <div className="py-4 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-slate-800/80">
          <p className="text-center sm:text-left">
            Website information is for general informational purposes and does not replace professional medical advice.
          </p>
          <Link
            to="/medical-disclaimer"
            className="text-emerald-400 hover:text-emerald-300 hover:underline shrink-0 text-xs font-semibold"
          >
            Read Full Medical Disclaimer &rarr;
          </Link>
        </div>

        {/* Slim Bottom Bar */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          {/* Policy Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms &amp; Conditions
            </Link>
            <span>•</span>
            <Link to="/medical-disclaimer" className="hover:text-white transition-colors">
              Medical Disclaimer
            </Link>
            <span>•</span>
            <Link to="/shipping-policy" className="hover:text-white transition-colors">
              Shipping Policy
            </Link>
            <span>•</span>
            <Link to="/refund-policy" className="hover:text-white transition-colors">
              Return / Refund Policy
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-center md:text-right">
            © 2026 Navin Homeo Care. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
