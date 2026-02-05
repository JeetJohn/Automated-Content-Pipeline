'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProjectStore } from '@/stores/project.store';
import { PlusCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CreateProjectDialogProps {
  children?: React.ReactNode;
}

export function CreateProjectDialog({ children }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [contentType, setContentType] = useState<'blog' | 'article' | 'report' | 'summary'>(
    'article'
  );
  const [tonePreference, setTonePreference] = useState<
    'formal' | 'casual' | 'technical' | 'persuasive'
  >('formal');
  const [targetLength, setTargetLength] = useState('1000');
  const [localError, setLocalError] = useState<string | null>(null);
  const { createProject, isLoading, error, clearError } = useProjectStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!title.trim()) {
      setLocalError('Please enter a project title');
      return;
    }

    try {
      await createProject({
        title: title.trim(),
        contentType,
        tonePreference,
        targetLength: parseInt(targetLength) || 1000,
      });

      // Reset form and close dialog
      setTitle('');
      setContentType('article');
      setTonePreference('formal');
      setTargetLength('1000');
      setOpen(false);

      // Redirect to projects page to see the new project
      router.push('/projects');
    } catch (err) {
      // Error is already set in the store, but we'll also set it locally for display
      console.error('Failed to create project:', err);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setLocalError(null);
      clearError();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button size="lg" className="gap-2">
            <PlusCircle className="w-5 h-5" />
            Create New Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Create a new content project. Fill in the details below to get started.
            </DialogDescription>
          </DialogHeader>

          {(localError || error) && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{localError || error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Project Title
              </label>
              <Input
                id="title"
                placeholder="Enter project title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="contentType" className="text-sm font-medium">
                Content Type
              </label>
              <Select value={contentType} onValueChange={(v) => setContentType(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blog">Blog Post</SelectItem>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="report">Report</SelectItem>
                  <SelectItem value="summary">Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="tone" className="text-sm font-medium">
                Tone Preference
              </label>
              <Select value={tonePreference} onValueChange={(v) => setTonePreference(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="persuasive">Persuasive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="length" className="text-sm font-medium">
                Target Length (words)
              </label>
              <Input
                id="length"
                type="number"
                min="100"
                max="10000"
                value={targetLength}
                onChange={(e) => setTargetLength(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !title.trim()}>
              {isLoading ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
