import React, { useState, useEffect } from 'react';
import { studentApi } from '../../services/api';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Award, CheckCircle2, XCircle, Calendar, IndianRupee, FileCheck } from 'lucide-react';

export const MyOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const res = await studentApi.getMyOffers();
      if (res.success && res.data) {
        setOffers(res.data);
      }
    } catch (e) {
      console.error('Failed to load offers:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (offerId, status) => {
    const actionText = status === 'ACCEPTED' ? 'accept' : 'decline';
    if (!window.confirm(`Are you sure you want to ${actionText} this offer?`)) return;

    setProcessingId(offerId);
    try {
      const res = await studentApi.respondToOffer(offerId, status, `Response submitted by candidate`);
      if (res.success) {
        alert(`Offer ${status.toLowerCase()} successfully!`);
        fetchOffers();
      }
    } catch (err) {
      alert(err.message || `Failed to ${actionText} offer`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner size={32} text="Loading placement offers..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Placement Offers</h1>
        <p className="text-xs text-slate-500">Official employment offers extended by recruiting companies</p>
      </div>

      {offers.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
          No job offers received yet. Prepare for upcoming interview rounds!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className={`p-6 rounded-2xl border shadow-xs space-y-4 ${
                offer.status === 'ACCEPTED'
                  ? 'bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white border-emerald-200'
                  : 'bg-white border-slate-200/80'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{offer.jobTitle}</h3>
                  <span className="text-xs text-indigo-600 font-semibold">{offer.companyName}</span>
                </div>
                <Badge status={offer.status} />
              </div>

              {/* Offer Details */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Total Compensation (CTC)</span>
                  <span className="text-base font-extrabold text-emerald-700">₹ {offer.ctc} LPA</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>Offer Extended On:</span>
                  <span className="font-medium">{offer.offerDate}</span>
                </div>

                {offer.joiningDate && (
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Expected Joining Date:</span>
                    <span className="font-semibold text-slate-800">{offer.joiningDate}</span>
                  </div>
                )}

                {offer.remarks && (
                  <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">Remarks:</span> {offer.remarks}
                  </div>
                )}
              </div>

              {/* Accept / Decline Action Buttons */}
              {offer.status === 'PENDING' && (
                <div className="flex items-center space-x-2 pt-2">
                  <button
                    disabled={processingId === offer.id}
                    onClick={() => handleRespond(offer.id, 'ACCEPTED')}
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
                  >
                    {processingId === offer.id ? 'Processing...' : 'Accept Offer'}
                  </button>
                  <button
                    disabled={processingId === offer.id}
                    onClick={() => handleRespond(offer.id, 'DECLINED')}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
                  >
                    Decline
                  </button>
                </div>
              )}

              {offer.status === 'ACCEPTED' && (
                <div className="flex items-center space-x-1.5 text-emerald-700 font-bold text-xs pt-1">
                  <FileCheck size={16} />
                  <span>Offer Accepted & Position Secured</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOffers;

