import React from 'react';
import { RouterProvider, useRouter } from './context/RouterContext';
import { CartProvider } from './context/CartContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MobileStickyBar } from './components/MobileStickyBar';

// Existing Pages
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { TreatmentsPage } from './pages/TreatmentsPage';
import { TreatmentDetailPage } from './pages/TreatmentDetailPage';
import { GalleryPage } from './pages/GalleryPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { FaqPage } from './pages/FaqPage';
import { ContactPage } from './pages/ContactPage';
import { AppointmentPage } from './pages/AppointmentPage';
import {
  MedicalDisclaimerPage,
  PrivacyPolicyPage,
  TermsPage,
} from './pages/LegalPages';

// New E-Commerce Pages
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderLookupPage } from './pages/OrderLookupPage';
import { ShippingPolicyPage, RefundPolicyPage } from './pages/ShopPoliciesPages';

// Advanced Admin Panel Pages
import { adminAuthService } from './services/adminAuthService';
import { AdminLoginPage } from './admin/AdminLoginPage';
import { AdminDashboardPage } from './admin/AdminDashboardPage';
import { AdminAppointmentsPage } from './admin/AdminAppointmentsPage';
import { AdminCalendarPage } from './admin/AdminCalendarPage';
import { AdminOrdersPage } from './admin/AdminOrdersPage';
import { AdminProductsPage } from './admin/AdminProductsPage';
import { AdminCustomersPage } from './admin/AdminCustomersPage';
import { AdminReportsPage } from './admin/AdminReportsPage';
import { AdminEnquiriesPage } from './admin/AdminEnquiriesPage';
import { AdminReviewsPage } from './admin/AdminReviewsPage';
import { AdminSettingsPage } from './admin/AdminSettingsPage';

function AppContent() {
  const { currentPath, activeSlug, navigate } = useRouter();

  // Normalize trailing slash except root
  const path = currentPath === '/' ? '/' : currentPath.replace(/\/$/, '');
  const isAdminRoute = path.startsWith('/admin');

  // Render Admin Protected Portal
  if (isAdminRoute) {
    if (path === '/admin/login') {
      return <AdminLoginPage />;
    }

    // Authentication Guard
    if (!adminAuthService.isAuthenticated()) {
      return <AdminLoginPage />;
    }

    if (path === '/admin' || path === '/admin/dashboard') {
      return <AdminDashboardPage />;
    }
    if (path === '/admin/calendar') {
      return <AdminCalendarPage />;
    }
    if (path === '/admin/appointments' || path.startsWith('/admin/appointments/')) {
      return <AdminAppointmentsPage initialSelectedId={activeSlug} />;
    }
    if (path === '/admin/orders' || path.startsWith('/admin/orders/')) {
      return <AdminOrdersPage initialSelectedId={activeSlug} />;
    }
    if (path === '/admin/reports') {
      return <AdminReportsPage />;
    }
    if (path === '/admin/products') {
      return <AdminProductsPage />;
    }
    if (path === '/admin/customers') {
      return <AdminCustomersPage />;
    }
    if (path === '/admin/enquiries') {
      return <AdminEnquiriesPage />;
    }
    if (path === '/admin/reviews') {
      return <AdminReviewsPage />;
    }
    if (path === '/admin/settings') {
      return <AdminSettingsPage />;
    }

    // Default admin fallback
    return <AdminDashboardPage />;
  }

  const renderCurrentPage = () => {

    if (path === '/') return <HomePage />;
    if (path === '/about') return <AboutPage />;
    if (path === '/treatments') return <TreatmentsPage />;
    if (path.startsWith('/treatments/') && activeSlug) {
      return <TreatmentDetailPage slug={activeSlug} />;
    }
    // E-Commerce Routes
    if (path === '/shop') return <ShopPage />;
    if (path.startsWith('/shop/') && activeSlug) {
      return <ProductDetailPage slug={activeSlug} />;
    }
    if (path === '/cart') return <CartPage />;
    if (path === '/checkout') return <CheckoutPage />;
    if (path === '/track-order' || path === '/order-lookup') return <OrderLookupPage />;

    if (path === '/gallery') return <GalleryPage />;
    if (path === '/reviews') return <ReviewsPage />;
    if (path === '/faq') return <FaqPage />;
    if (path === '/contact') return <ContactPage />;
    if (path === '/appointment') return <AppointmentPage />;
    if (path === '/medical-disclaimer') return <MedicalDisclaimerPage />;
    if (path === '/privacy') return <PrivacyPolicyPage />;
    if (path === '/terms') return <TermsPage />;
    if (path === '/shipping-policy') return <ShippingPolicyPage />;
    if (path === '/refund-policy') return <RefundPolicyPage />;

    // Fallback 404
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center bg-slate-50">
        <span className="text-4xl font-black text-[#001428] mb-2">404</span>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Page Not Found</h2>
        <p className="text-slate-500 max-w-md text-sm mb-6">
          The page you are looking for does not exist or may have been moved.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-xl bg-[#001428] text-white font-medium text-xs uppercase tracking-wider cursor-pointer hover:bg-slate-800 transition-colors"
        >
          Return to Homepage
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* 
        Sticky Header (natural document flow at initial render so sticky header 
        NEVER overlaps or partially obscures page hero titles)
      */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 pb-20 lg:pb-0">
        {renderCurrentPage()}
      </main>

      {/* Premium Navy Footer */}
      <Footer />

      {/* Mobile Bottom Sticky Action Bar */}
      <MobileStickyBar />
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </RouterProvider>
  );
}
