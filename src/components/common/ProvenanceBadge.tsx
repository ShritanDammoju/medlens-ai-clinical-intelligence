import React from 'react';
import { ProvenanceLabel, SourceProvenance } from '../../types/medical';
import { UserCheck, FileText, Sparkles, Brain, AlertCircle } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';

interface Props {
  provenance: ProvenanceLabel;
  fullProvenance?: SourceProvenance;
  showIcon?: boolean;
  className?: string;
}

export const ProvenanceBadge: React.FC<Props> = ({
  provenance,
  fullProvenance,
  showIcon = true,
  className = ''
}) => {
  const { openSourceInspector } = usePatient();

  const getStyle = () => {
    switch (provenance) {
      case 'Patient Provided':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
          icon: <UserCheck className="w-3 h-3 text-emerald-600" />
        };
      case 'Extracted from Report':
        return {
          bg: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100',
          icon: <FileText className="w-3 h-3 text-sky-600" />
        };
      case 'AI Generated':
        return {
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
          icon: <Sparkles className="w-3 h-3 text-indigo-600" />
        };
      case 'AI Inferred':
        return {
          bg: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
          icon: <Brain className="w-3 h-3 text-purple-600" />
        };
      case 'Needs Verification':
      default:
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
          icon: <AlertCircle className="w-3 h-3 text-amber-600" />
        };
    }
  };

  const style = getStyle();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fullProvenance) {
      openSourceInspector(fullProvenance);
    } else {
      openSourceInspector({
        sourceName: 'System Record',
        sourceType: 'patient_intake',
        provenance,
        confidence: 95
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title="Click to view source provenance & origin"
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${style.bg} ${className}`}
    >
      {showIcon && style.icon}
      <span>{provenance}</span>
      {fullProvenance?.confidence && (
        <span className="text-[10px] opacity-75 font-mono">({fullProvenance.confidence}%)</span>
      )}
    </button>
  );
};
