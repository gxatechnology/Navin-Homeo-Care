import React from 'react';
import { CLINIC_CONFIG } from '../config/clinicData';
import { Link } from '../context/RouterContext';
import { Truck, RotateCcw, ArrowLeft, ShieldCheck } from 'lucide-react';

export const ShippingPolicyPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-2xs">
        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#006e2d] hover:text-[#005320] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#006e2d] flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#006e2d]">Shop Dispatch</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#001428]">Shipping &amp; Delivery Policy</h1>
          </div>
        </div>

        <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-600 space-y-5 leading-relaxed">
          <p>
            At <strong className="text-slate-900">Navin Homeo Care</strong>, products ordered through our online shop are dispatched securely from our clinic shop in Alambagh, Lucknow.
          </p>

          <h2 className="text-base font-bold text-slate-900 pt-2">1. Processing &amp; Dispatch Timeline</h2>
          <p>
            Orders are reviewed and prepared within 24 to 48 business hours of order placement (excluding clinic holidays and off days). You will receive telephone or WhatsApp confirmation before dispatch.
          </p>

          <h2 className="text-base font-bold text-slate-900 pt-2">2. Local &amp; Regional Delivery Areas</h2>
          <p>
            • <strong>Lucknow Local Area:</strong> Delivered within 1 to 2 business days via trusted local courier or available for in-clinic pickup at our Alambagh counter.<br />
            • <strong>Other Districts in Uttar Pradesh:</strong> Dispatched via standard courier service arriving in 3 to 5 business days.<br />
            • <strong>Rest of India:</strong> Typically delivered within 4 to 7 business days depending on pincode coverage.
          </p>

          <h2 className="text-base font-bold text-slate-900 pt-2">3. Shipping Charges</h2>
          <p>
            Standard shipping is ₹50 per order. Orders exceeding ₹500 qualify for free standard shipping. Specific remote locations may incur additional carrier costs, communicated beforehand.
          </p>

          <h2 className="text-base font-bold text-slate-900 pt-2">4. Packaging &amp; Product Safety</h2>
          <p>
            All botanical oils, creams, and glass dropper bottles are packaged with protective wrap to prevent leakage or transit damage.
          </p>

          <div className="pt-6 border-t border-slate-100 text-xs text-slate-500">
            For delivery inquiries, please call our clinic reception at <a href={CLINIC_CONFIG.telLink} className="text-[#006e2d] font-bold hover:underline">{CLINIC_CONFIG.phone}</a>.
          </div>
        </div>
      </div>
    </div>
  );
};

export const RefundPolicyPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-2xs">
        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#006e2d] hover:text-[#005320] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#006e2d] flex items-center justify-center shrink-0">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#006e2d]">Customer Assurance</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#001428]">Return &amp; Refund Policy</h1>
          </div>
        </div>

        <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-600 space-y-5 leading-relaxed">
          <p>
            We strive to provide genuine quality botanical health and wellness products from our shop. Please review our return and cancellation terms below.
          </p>

          <h2 className="text-base font-bold text-slate-900 pt-2">1. Damaged or Incorrect Shipments</h2>
          <p>
            If you receive an item that is damaged, leaking, or different from what you ordered, please notify our clinic team within 48 hours of delivery by sharing a photo on WhatsApp at <a href={CLINIC_CONFIG.whatsappLink} className="text-[#006e2d] font-bold hover:underline">+91 73183 06699</a>.
          </p>
          <p>
            We will promptly arrange a free replacement or issue a full refund upon verification.
          </p>

          <h2 className="text-base font-bold text-slate-900 pt-2">2. Non-Returnable Health Items</h2>
          <p>
            Due to strict healthcare hygiene standards, creams, scalp oils, and dietary drops whose product packaging has been opened cannot be accepted for return, unless found defective on arrival.
          </p>

          <h2 className="text-base font-bold text-slate-900 pt-2">3. Refund Processing</h2>
          <p>
            Approved refunds are credited back to the customer's original mode of payment (or via UPI / bank transfer) within 3 to 5 business days.
          </p>

          <h2 className="text-base font-bold text-slate-900 pt-2">4. Order Cancellation</h2>
          <p>
            Orders can be cancelled prior to dispatch by calling our clinic front desk directly. Once an order has been picked up by our courier partner, it cannot be cancelled mid-transit.
          </p>

          <div className="pt-6 border-t border-slate-100 text-xs text-slate-500">
            Shop &amp; Support Desk: {CLINIC_CONFIG.phone} &bull; Navin Homeo Care, Alambagh, Lucknow.
          </div>
        </div>
      </div>
    </div>
  );
};
