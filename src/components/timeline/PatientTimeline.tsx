import React, { useState } from 'react';
import { usePatient } from '../../context/PatientContext';
import { TimelineEvent } from '../../types/medical';
import { 
  Clock, 
  FileText, 
  Pill, 
  FlaskConical, 
  UserPlus, 
  Sparkles, 
  ChevronRight, 
  Info,
  Calendar
} from 'lucide-react';
import { ProvenanceBadge } from '../common/ProvenanceBadge';

export const PatientTimeline: React.FC = () => {
  const { currentPatient, state } = usePatient();
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  const timelineEvents = state.timeline.filter(t => t.patientId === currentPatient?.id);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'report':
        return <FileText className="w-4 h-4 text-sky-600" />;
      case 'medication':
        return <Pill className="w-4 h-4 text-amber-600" />;
      case 'lab':
        return <FlaskConical className="w-4 h-4 text-teal-600" />;
      case 'intake':
        return <UserPlus className="w-4 h-4 text-emerald-600" />;
      default:
        return <Clock className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Chronological Patient Journey</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Traceable, immutable record of document uploads, medication records, and clinical intake updates.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vertical Timeline Tree */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-soft">
          <div className="relative border-l-2 border-slate-200 ml-4 sm:ml-6 space-y-8 pb-4">
            {timelineEvents.map((event) => {
              const isSelected = selectedEvent?.id === event.id;
              return (
                <div key={event.id} className="relative pl-6 sm:pl-8 group">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-3 top-1 w-6 h-6 rounded-full bg-white border-2 flex items-center justify-center transition-all ${
                    isSelected 
                      ? 'border-sky-600 ring-4 ring-sky-100 shadow-md scale-110' 
                      : 'border-slate-300 group-hover:border-sky-500'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-sky-600" />
                  </div>

                  {/* Card Container */}
                  <div
                    onClick={() => setSelectedEvent(event)}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50/70 border-sky-300 shadow-md ring-1 ring-sky-300'
                        : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-lg bg-white border border-slate-200/60 shadow-2xs">
                          {getCategoryIcon(event.category)}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                          {event.title}
                        </h3>
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {event.date}
                      </span>
                    </div>

                    <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {event.description}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <ProvenanceBadge provenance={event.provenance} />
                      <span className="text-[11px] text-slate-400 font-mono">
                        Source: {event.sourceName}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Event Details Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-soft h-fit">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base pb-3 border-b border-slate-100 flex items-center gap-2">
            <Info className="w-4 h-4 text-sky-600" />
            <span>Event Context & Provenance</span>
          </h3>

          {selectedEvent ? (
            <div className="mt-4 space-y-4 text-xs sm:text-sm">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase">Event Title</span>
                <p className="font-bold text-slate-900 text-base mt-0.5">{selectedEvent.title}</p>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase">Documented Date</span>
                <p className="font-mono text-slate-700 font-semibold mt-0.5">{selectedEvent.date}</p>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase">Event Detail</span>
                <p className="text-slate-600 leading-relaxed mt-0.5">{selectedEvent.description}</p>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase">Source Provenance</span>
                <div className="mt-1">
                  <ProvenanceBadge provenance={selectedEvent.provenance} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-slate-500 font-medium block">Originating Source File:</span>
                <span className="font-mono font-bold text-slate-800 break-all">{selectedEvent.sourceName}</span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs sm:text-sm">
              Select any event on the timeline to inspect its underlying audit trail.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
