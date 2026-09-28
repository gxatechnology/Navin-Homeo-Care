import React, { useState } from 'react';
import { GALLERY_ITEMS, GalleryItem, CLINIC_CONFIG } from '../config/clinicData';
import { LightboxModal } from '../components/LightboxModal';
import { Link } from '../context/RouterContext';
import {
  Camera,
  Maximize2,
  MapPin,
  Clock,
  Compass,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

export const GalleryPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activePhoto, setActivePhoto] = useState<GalleryItem | null>(null);

  // Exact categories required by Section I:
  // Clinic Exterior, Reception, Doctor Cabin, Consultation Area, Interior
  const categories = [
    { id: 'all', label: 'All Photos' },
    { id: 'exterior', label: 'Clinic Exterior' },
    { id: 'reception', label: 'Reception' },
    { id: 'cabin', label: 'Doctor Cabin' },
    { id: 'consultation', label: 'Consultation Area' },
    { id: 'interior', label: 'Interior' },
  ];

  const filteredPhotos = GALLERY_ITEMS.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Page Header */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-14 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-blue-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-3">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span>Clinic Gallery</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3">
            Clinic Tour &amp; Facilities
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            Take a visual tour of Navin Homeo Care &amp; Research Center in Alambagh, Lucknow. Real photographs of our doctor cabin, reception, and clinic facilities.
          </p>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="sticky top-16 lg:top-20 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#001428] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Gallery Grid */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotos.map((item) => (
              <div
                key={item.id}
                onClick={() => setActivePhoto(item)}
                className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col"
              >
                <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="p-3 rounded-full bg-white/90 text-slate-900 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                      <Maximize2 className="w-5 h-5 text-[#001428]" />
                    </span>
                  </div>
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 text-slate-900 backdrop-blur-xs shadow-2xs">
                    {item.badge}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#001428] group-hover:text-[#006e2d] transition-colors mb-1.5">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Navin Homeo Care</span>
                    <span className="text-[#006e2d] font-bold group-hover:underline flex items-center gap-1">
                      Enlarge <Maximize2 className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Infrastructure Standards Info */}
          <div className="mt-14 bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-2xs">
            <div className="max-w-3xl">
              <span className="text-xs font-bold uppercase tracking-wider text-[#006e2d]">Clinical Environment</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#001428] mt-1 mb-3">
                Designed for Calm, Hygiene &amp; Patient Privacy
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                When you step into Navin Homeo Care &amp; Research Center, our focus is to provide an orderly, quiet space where you can share your health background without pressure or hurried atmosphere.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    title: 'Private Doctor Cabin',
                    desc: 'A quiet, confidential setting where Dr. Navin Maurya conducts one-on-one constitutional examinations.',
                  },
                  {
                    title: 'Hygienic Medicine & Product Counter',
                    desc: 'Standardized homeopathic health products organized and provided under hygienic clinical supervision.',
                  },
                  {
                    title: 'Comfortable Waiting Space',
                    desc: 'Comfortable seating for accompanying family members, clean drinking water, and washroom facilities.',
                  },
                  {
                    title: 'Accessible Ground Floor Location',
                    desc: 'Convenient approach near Pakri Ka Pul, Azad Nagar Road, with easy access for senior citizens.',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-[#006e2d] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.title}</h4>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Visit CTA */}
          <div className="mt-10 bg-[#001428] text-white rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Schedule Your Visit</span>
              <h3 className="text-xl sm:text-2xl font-bold mt-1">Experience Care at Our Alambagh Center</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Near Pakri Ka Pul (500 m), Azad Nagar Road, near Zoom Optical, Alambagh, Lucknow.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                to="/appointment"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#006e2d] hover:bg-[#005320] text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                <Calendar className="w-4 h-4 text-emerald-300" />
                <span>Book Consultation</span>
              </Link>
              <a
                href={CLINIC_CONFIG.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs uppercase tracking-wider transition-colors"
              >
                <Compass className="w-4 h-4 text-emerald-400" />
                <span>Get Directions</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {activePhoto && (
        <LightboxModal
          isOpen={true}
          onClose={() => setActivePhoto(null)}
          imageUrl={activePhoto.imageUrl}
          title={activePhoto.title}
          description={activePhoto.description}
          badge={activePhoto.badge}
        />
      )}
    </div>
  );
};
