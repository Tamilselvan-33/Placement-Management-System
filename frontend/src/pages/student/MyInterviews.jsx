import React, { useState, useEffect } from 'react';
import { studentApi } from '../../services/api';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Calendar, Video, MapPin, User, ExternalLink, Clock } from 'lucide-react';

export const MyInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const res = await studentApi.getMyInterviews();
      if (res.success && res.data) {
        setInterviews(res.data);
      }
    } catch (e) {
      console.error('Failed to load interviews:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size={32} text="Loading interview schedule..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Interview Schedule</h1>
        <p className="text-xs text-slate-500">Upcoming technical assessments, panel rounds, and HR interviews</p>
      </div>

      {interviews.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
          No interviews scheduled yet. You will be notified when a recruiter schedules a round.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interviews.map((intv) => (
            <div key={intv.id} className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{intv.roundDisplayName || intv.round}</h3>
                  <span className="text-xs text-indigo-600 font-semibold">{intv.companyName} • {intv.jobTitle}</span>
                </div>
                <Badge status={intv.status} />
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-slate-700">
                  <Calendar size={14} className="text-indigo-600" />
                  <span className="font-semibold">{intv.interviewDate}</span>
                  <span className="text-slate-400">•</span>
                  <Clock size={14} className="text-indigo-600" />
                  <span>{intv.interviewTime}</span>
                </div>

                <div className="flex items-center space-x-2 text-slate-700">
                  {intv.mode === 'ONLINE' ? (
                    <Video size={14} className="text-purple-600" />
                  ) : (
                    <MapPin size={14} className="text-emerald-600" />
                  )}
                  <span className="font-medium">{intv.mode} Mode</span>
                  {intv.venueOrLink && (
                    <>
                      <span className="text-slate-400">•</span>
                      {intv.venueOrLink.startsWith('http') ? (
                        <a
                          href={intv.venueOrLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:underline font-semibold flex items-center space-x-1"
                        >
                          <span>Join Meeting</span>
                          <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="text-slate-600">{intv.venueOrLink}</span>
                      )}
                    </>
                  )}
                </div>

                {intv.interviewerName && (
                  <div className="flex items-center space-x-2 text-slate-600 text-[11px]">
                    <User size={13} className="text-slate-400" />
                    <span>Interviewer: {intv.interviewerName}</span>
                  </div>
                )}
              </div>

              {intv.feedback && (
                <div className="text-[11px] bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100 text-indigo-900">
                  <span className="font-semibold block mb-0.5">Recruiter Feedback:</span>
                  <p>{intv.feedback}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyInterviews;

