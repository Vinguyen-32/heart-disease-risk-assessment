import React from 'react';

interface ResultsDashboardProps {
  prediction: any;
}

export default function ResultsDashboard({ prediction }: ResultsDashboardProps) {
  // This component can be used for embedded results display
  // Currently, Results.tsx handles the full page display
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Assessment Complete</h3>
      <p className="text-gray-600">Your results are ready for review.</p>
    </div>
  );
}