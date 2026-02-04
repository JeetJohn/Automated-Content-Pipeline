import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function ProjectsPage() {
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
          <Button className="gap-2">
            <PlusCircle className="w-4 h-4" />
            New Project
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-semibold">All Projects</h1>
            <p className="text-gray-600 mt-1">Manage and organize your content projects</p>
          </div>
          <div className="p-8 text-center text-gray-500">
            <p>No projects yet. Create your first project to get started.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
