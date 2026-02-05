'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Clock } from 'lucide-react';

interface DraftViewerProps {
  draft: {
    id: string;
    versionNumber: number;
    content: string;
    outline: {
      sections: Array<{ title: string; content: string }>;
    };
    citations: Array<{ sourceId: string; text: string; context: string }>;
    qualityScore: number;
    generationTime: number;
    createdAt: string;
  };
}

export function DraftViewer({ draft }: DraftViewerProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <p className="font-medium">Version {draft.versionNumber}</p>
                  <Badge variant="secondary" className="text-xs">
                    {Math.round(draft.qualityScore * 100)}% Quality
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Generated in {Math.round(draft.generationTime / 1000)}s •{' '}
                  {new Date(draft.createdAt).toLocaleDateString()}
                </p>
                {draft.content && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {draft.content.substring(0, 150)}...
                  </p>
                )}
                <p className="text-xs text-blue-600 mt-2">Click to view full content</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Draft Version {draft.versionNumber}
          </DialogTitle>
          <DialogDescription>
            Generated in {Math.round(draft.generationTime / 1000)} seconds • Quality Score:{' '}
            {Math.round(draft.qualityScore * 100)}%
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Outline */}
            {draft.outline?.sections && draft.outline.sections.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">
                  Outline
                </h3>
                <ul className="space-y-2">
                  {draft.outline.sections.map((section, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-blue-600 font-medium">{idx + 1}.</span>
                      <div>
                        <p className="font-medium text-sm">{section.title}</p>
                        <p className="text-xs text-gray-500">{section.content}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Full Content */}
            <div>
              <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">
                Content
              </h3>
              <div className="prose prose-sm max-w-none">
                {draft.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-4 text-gray-800 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Citations */}
            {draft.citations && draft.citations.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-blue-600">
                  Citations
                </h3>
                <ul className="space-y-2">
                  {draft.citations.map((citation, idx) => (
                    <li key={idx} className="text-sm">
                      <span className="text-blue-600 font-medium">[{idx + 1}]</span>{' '}
                      <span className="text-gray-700">{citation.text}</span>
                      <span className="text-gray-500 text-xs block mt-1">{citation.context}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
