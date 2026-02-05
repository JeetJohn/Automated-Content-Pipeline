'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText, Calendar } from 'lucide-react';
import { CreateProjectDialog } from '@/components/create-project-dialog';
import { useProjectStore } from '@/stores/project.store';
import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ProjectsPage() {
  const { projects, fetchProjects, isLoading } = useProjectStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const getContentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      blog: 'Blog Post',
      article: 'Article',
      report: 'Report',
      summary: 'Summary',
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      ready: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-semibold text-lg hover:text-blue-600">
              ContentPipe
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-600">Projects</span>
          </div>
          <CreateProjectDialog>
            <Button className="gap-2">
              <PlusCircle className="w-4 h-4" />
              New Project
            </Button>
          </CreateProjectDialog>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-semibold">All Projects</h1>
            <p className="text-gray-600 mt-1">Manage and organize your content projects</p>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-gray-500">
              <p>Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No projects yet. Create your first project to get started.</p>
            </div>
          ) : (
            <div className="p-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project: any) => (
                <Link href={`/projects/${project.id}`} key={project.id}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                      </div>
                      <h3 className="font-semibold text-lg mb-2 line-clamp-1">{project.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{getContentTypeLabel(project.contentType)}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
