import React from 'react';

interface QuestionFormProps {
  title: string;
  children: React.ReactNode;
}

export default function QuestionForm({ title, children }: QuestionFormProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      {children}
    </div>
  );
}