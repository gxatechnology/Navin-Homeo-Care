import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { adminDataService, AdminReview } from '../services/adminDataService';
import {
  Star,
  Plus,
  Trash2,
  CheckCircle2,
  EyeOff,
  Eye,
  Edit2,
  X,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

export const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'pending' | 'hidden'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<AdminReview | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [author, setAuthor] = useState('');
  const [location, setLocation] = useState('Lucknow');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [status, setStatus] = useState<'published' | 'pending' | 'hidden'>('published');

  const reloadReviews = () => {
    setReviews(adminDataService.getReviews());
  };

  useEffect(() => {
    reloadReviews();
  }, []);

  const filteredReviews = reviews.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  });

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'published' ? 'hidden' : 'published';
    adminDataService.updateReviewStatus(id, nextStatus as any);
    reloadReviews();
  };

  const handleDelete = (id: string) => {
    setConfirmDeleteId(id);
  };

  const confirmDeleteReview = () => {
    if (confirmDeleteId) {
      adminDataService.deleteReview(confirmDeleteId);
      setConfirmDeleteId(null);
      reloadReviews();
    }
  };

  const handleOpenAdd = () => {
    setEditingReview(null);
    setAuthor('');
    setLocation('Lucknow, UP');
    setRating(5);
    setText('');
    setStatus('published');
    setModalOpen(true);
  };

  const handleOpenEdit = (r: AdminReview) => {
    setEditingReview(r);
    setAuthor(r.author);
    setLocation(r.location);
    setRating(r.rating);
    setText(r.text);
    setStatus(r.status);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author || !text) return;

    const initials = author
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const reviewObj: AdminReview = {
      id: editingReview ? editingReview.id : `rev-${Date.now()}`,
      author,
      initials,
      location,
      rating,
      text,
      isVerified: true,
      date: editingReview?.date || new Date().toISOString().split('T')[0],
      status,
    };

    adminDataService.saveOrAddReview(reviewObj);
    setModalOpen(false);
    reloadReviews();
  };

  return (
    <AdminLayout
      activeTab="reviews"
      pageTitle="Testimonials & Patient Reviews"
      pageSubtitle="Moderate patient experiences, publish clinical testimonials, and manage website social proof"
      headerAction={
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Testimonial</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Status Filter:</span>
            {(['all', 'published', 'pending', 'hidden'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-500">
            Total Reviews: <strong className="text-slate-800">{reviews.length}</strong>
          </span>
        </div>

        {/* Reviews List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                rev.status === 'published'
                  ? 'bg-white border-slate-200/80 shadow-xs'
                  : 'bg-slate-50 border-slate-200 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      rev.status === 'published'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {rev.status}
                  </span>
                </div>

                <p className="text-xs text-slate-700 italic leading-relaxed mb-4">"{rev.text}"</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">{rev.author}</p>
                  <p className="text-[10px] text-slate-400">
                    {rev.location} {rev.date && `• ${rev.date}`}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleStatus(rev.id, rev.status)}
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
                    title={rev.status === 'published' ? 'Hide Testimonial' : 'Publish Testimonial'}
                  >
                    {rev.status === 'published' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleOpenEdit(rev)}
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
                    title="Edit Review"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(rev.id)}
                    className="p-1.5 rounded hover:bg-red-50 text-red-500"
                    title="Delete Review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Review Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                {editingReview ? 'Edit Patient Testimonial' : 'Add New Patient Testimonial'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                &times;
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Patient Name *</label>
                <input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. Ramesh Chandra Verma"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">City / Region</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Alambagh, Lucknow"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rating (1 to 5 Stars)</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 font-semibold"
                >
                  <option value={5}>5 Stars (Excellent clinical relief)</option>
                  <option value={4}>4 Stars (Very Good)</option>
                  <option value={3}>3 Stars (Satisfactory)</option>
                  <option value={2}>2 Stars (Average)</option>
                  <option value={1}>1 Star</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Testimonial Text *</label>
                <textarea
                  rows={3}
                  required
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Patient's experience regarding treatment for allergy, skin, joint pain, etc..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Publish Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                >
                  <option value="published">Published (Visible on Reviews Page)</option>
                  <option value="pending">Pending Moderation</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer"
                >
                  Save Testimonial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Testimonial Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Delete Testimonial?</h3>
            <p className="text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete this review? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteReview}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer shadow-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
