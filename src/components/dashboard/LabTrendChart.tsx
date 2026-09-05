import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { DEMO_CHART_DATA } from '../../data/demoData';
import { Activity, Info } from 'lucide-react';

export const LabTrendChart: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState<'Glucose' | 'Hemoglobin' | 'VitaminD'>('Glucose');

  const configs = {
    Glucose: {
      color: '#0284c7',
      unit: 'mg/dL',
      refMin: 70,
      refMax: 99,
      refLabel: 'Source Range: 70�99 mg/dL',
      title: 'Fasting Blood Glucose Longitudinal Trend'
    },
    Hemoglobin: {
      color: '#0d9488',
      unit: 'g/dL',
      refMin: 12.0,
      refMax: 16.0,
      refLabel: 'Source Range: 12.0�16.0 g/dL',
      title: 'Hemoglobin (g/dL) Trend'
    },
    VitaminD: {
      color: '#d97706',
      unit: 'ng/mL',
      refMin: 30,
      refMax: 100,
      refLabel: 'Source Target: > 30 ng/mL',
      title: 'Vitamin D (25-OH) Recovery Trend'
    }
  };

  const activeConfig = configs[selectedMetric];

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-soft">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Biomarker Longitudinal Trajectory</h3>
            <p className="text-xs text-slate-500">Values plotted chronologically across uploaded diagnostic reports</p>
          </div>
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          {(['Glucose', 'Hemoglobin', 'VitaminD'] as const).map((metric) => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedMetric === metric
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {metric === 'VitaminD' ? 'Vitamin D' : metric}
            </button>
          ))}
        </div>
      </div>

      {/* Chart container */}
      <div className="pt-6 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={DEMO_CHART_DATA} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11, fill: '#64748b' }} 
              axisLine={{ stroke: '#e2e8f0' }} 
              tickLine={false} 
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#64748b' }} 
              axisLine={{ stroke: '#e2e8f0' }} 
              tickLine={false}
              domain={['auto', 'auto']}
              unit={` ${activeConfig.unit}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: 'none',
                borderRadius: '0.75rem',
                color: '#fff',
                fontSize: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)'
              }}
              formatter={(value: any) => [`${value} ${activeConfig.unit}`, selectedMetric]}
              labelStyle={{ color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}
            />
            {activeConfig.refMax && (
              <ReferenceLine 
                y={activeConfig.refMax} 
                stroke="#f59e0b" 
                strokeDasharray="4 4" 
                label={{ value: `Max: ${activeConfig.refMax}`, fill: '#d97706', fontSize: 10, position: 'insideTopRight' }} 
              />
            )}
            {activeConfig.refMin && (
              <ReferenceLine 
                y={activeConfig.refMin} 
                stroke="#10b981" 
                strokeDasharray="4 4" 
                label={{ value: `Min: ${activeConfig.refMin}`, fill: '#059669', fontSize: 10, position: 'insideBottomRight' }} 
              />
            )}
            <Line
              type="monotone"
              dataKey={selectedMetric}
              stroke={activeConfig.color}
              strokeWidth={2.5}
              dot={{ r: 4, fill: activeConfig.color, stroke: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 6, stroke: activeConfig.color, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          {activeConfig.refLabel} (extracted verbatim from laboratory reports)
        </span>
        <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-mono">
          3 Historical Datapoints
        </span>
      </div>
    </div>
  );
};
