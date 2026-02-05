'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Edit2, Trash2, FileText, Plus, Save, X, Loader2 } from 'lucide-react';
import { DraftViewer } from './draft-viewer';
import { useProjectStore } from '@/stores/project.store';
import { api } from '@/lib/api';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const { currentProject, fetchProject, isLoading, error } = useProjectStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [sources, setSources] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
      fetchSources();
      fetchDrafts();
    }
  }, [projectId, fetchProject]);

  useEffect(() => {
    if (currentProject) {
      setEditedTitle(currentProject.title);
    }
  }, [currentProject]);

  const fetchSources = async () => {
    try {
      const data = await api.get<any[]>(`/projects/${projectId}/sources`);
      setSources(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch sources:', err);
      setSources([]);
    }
  };

  const fetchDrafts = async () => {
    try {
      const data = await api.get<any[]>(`/projects/${projectId}/drafts`);
      setDrafts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch drafts:', err);
      setDrafts([]);
    }
  };

  const handleSave = async () => {
    if (!editedTitle.trim()) return;

    setIsSaving(true);
    try {
      await api.put(`/projects/${projectId}`, { title: editedTitle.trim() });
      await fetchProject(projectId);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update project:', err);
      alert('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await api.delete(`/projects/${projectId}`);
      router.push('/projects');
    } catch (err) {
      console.error('Failed to delete project:', err);
      alert('Failed to delete project');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-yellow-100 text-yellow-800',
      DISTILLING: 'bg-blue-100 text-blue-800',
      GENERATING: 'bg-purple-100 text-purple-800',
      REFINING: 'bg-orange-100 text-orange-800',
      COMPLETED: 'bg-green-100 text-green-800',
      ARCHIVED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getContentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      BLOG: 'Blog Post',
      ARTICLE: 'Article',
      REPORT: 'Report',
      SUMMARY: 'Summary',
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !currentProject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Project not found'}</p>
          <Link href="/projects">
            <Button>Back to Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/projects">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>
              <span className="text-gray-300">/</span>
              <span className="text-gray-600">Project Details</span>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-2">
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedTitle(currentProject.title);
                    }}
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-2">
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Project Title Section */}
          <div className="mb-8">
            {isEditing ? (
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="text-3xl font-bold h-auto py-2"
                placeholder="Project Title"
              />
            ) : (
              <h1 className="text-3xl font-bold text-gray-900">{currentProject.title}</h1>
            )}
            <div className="flex items-center gap-4 mt-4">
              <Badge className={getStatusColor(currentProject.status)}>
                {currentProject.status}
              </Badge>
              <span className="text-gray-500 text-sm">
                Created {new Date(currentProject.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sources">Sources ({sources.length})</TabsTrigger>
              <TabsTrigger value="drafts">Drafts ({drafts.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Content Type</label>
                        <p className="text-gray-900">
                          {getContentTypeLabel(currentProject.contentType)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Tone Preference</label>
                        <p className="text-gray-900 capitalize">
                          {currentProject.tonePreference.toLowerCase()}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Target Length</label>
                        <p className="text-gray-900">{currentProject.targetLength} words</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Last Updated</label>
                        <p className="text-gray-900">
                          {new Date(currentProject.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-3">
                      <Button onClick={() => setActiveTab('sources')} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Source
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab('drafts')}
                        className="gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        View Drafts
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="sources" className="mt-6">
              <SourcesTab projectId={projectId} sources={sources} onRefresh={fetchSources} />
            </TabsContent>

            <TabsContent value="drafts" className="mt-6">
              <DraftsTab projectId={projectId} drafts={drafts} onRefresh={fetchDrafts} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function SourcesTab({
  projectId,
  sources,
  onRefresh,
}: {
  projectId: string;
  sources: any[];
  onRefresh: () => void;
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSourceType, setNewSourceType] = useState<'file' | 'url' | 'note'>('url');
  const [sourceContent, setSourceContent] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddSource = async () => {
    setIsAdding(true);
    try {
      if (newSourceType === 'url' && sourceUrl) {
        await api.post(`/projects/${projectId}/sources`, { url: sourceUrl });
      } else if (newSourceType === 'note' && sourceContent) {
        await api.post(`/projects/${projectId}/sources`, { note: sourceContent });
      }

      setSourceUrl('');
      setSourceContent('');
      setShowAddForm(false);
      onRefresh();
    } catch (err) {
      console.error('Failed to add source:', err);
      alert('Failed to add source');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      {!showAddForm ? (
        <Button onClick={() => setShowAddForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Source
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Add New Source</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              {(['url', 'note'] as const).map((type) => (
                <Button
                  key={type}
                  variant={newSourceType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setNewSourceType(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>

            {newSourceType === 'url' && (
              <Input
                placeholder="Enter URL..."
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
              />
            )}

            {newSourceType === 'note' && (
              <textarea
                className="w-full p-3 border rounded-md min-h-[100px]"
                placeholder="Enter your notes..."
                value={sourceContent}
                onChange={(e) => setSourceContent(e.target.value)}
              />
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleAddSource}
                disabled={isAdding || (!sourceUrl && !sourceContent)}
              >
                {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Source'}
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {sources.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-lg border">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No sources added yet.</p>
          <p className="text-sm">Add URLs, files, or notes to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sources.map((source) => (
            <Card key={source.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{source.sourceType}</p>
                    <p className="text-sm text-gray-500">{source.originalPath || 'Note'}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Added {new Date(source.createdAt).toLocaleDateString()}
                    </p>
                    {source.extractedText && (
                      <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700 border-l-2 border-blue-400">
                        <p className="font-medium text-xs text-gray-500 mb-1">Content:</p>
                        {source.extractedText.length > 300
                          ? source.extractedText.substring(0, 300) + '...'
                          : source.extractedText}
                      </div>
                    )}
                  </div>
                  <Badge
                    variant={source.processingStatus === 'COMPLETED' ? 'default' : 'secondary'}
                  >
                    {source.processingStatus}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function DraftsTab({
  projectId,
  drafts,
  onRefresh,
}: {
  projectId: string;
  drafts: any[];
  onRefresh: () => void;
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateDraft = async () => {
    setIsGenerating(true);
    try {
      await api.post(`/projects/${projectId}/drafts`, {});
      onRefresh();
    } catch (err) {
      console.error('Failed to generate draft:', err);
      alert('Failed to generate draft. Make sure you have sources added.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleGenerateDraft} disabled={isGenerating} className="gap-2">
        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        Generate New Draft
      </Button>

      {drafts.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-lg border">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No drafts generated yet.</p>
          <p className="text-sm">Add sources and generate your first draft.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {drafts.map((draft) => (
            <DraftViewer key={draft.id} draft={draft} />
          ))}
        </div>
      )}
    </div>
  );
}
