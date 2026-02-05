'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText, Settings } from 'lucide-react';
import { CreateProjectDialog } from '@/components/create-project-dialog';

export default function HomePage() {
  const showComingSoon = () => {
    alert('Coming soon!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CP</span>
            </div>
            <span className="font-semibold text-lg">ContentPipe</span>
          </div>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={showComingSoon}>
              Docs
            </Button>
            <Button variant="ghost" size="sm" onClick={showComingSoon}>
              Settings
            </Button>
            <Button size="sm" onClick={showComingSoon}>
              Sign In
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Transform Research Into
            <span className="text-blue-600"> Publishable Content</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Upload your research materials, let AI distill the key insights, and generate
            publication-ready drafts in minutes.
          </p>
          <div className="flex items-center justify-center gap-4">
            <CreateProjectDialog>
              <Button size="lg" className="gap-2">
                <PlusCircle className="w-5 h-5" />
                Create New Project
              </Button>
            </CreateProjectDialog>
            <Button size="lg" variant="outline" onClick={showComingSoon}>
              View Demo
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <FeatureCard
            icon={<FileText className="w-6 h-6" />}
            title="Multi-Format Input"
            description="Upload PDFs, DOCX, URLs, and notes. We'll extract and organize all your sources."
          />
          <FeatureCard
            icon={<Settings className="w-6 h-6" />}
            title="AI-Powered Distillation"
            description="Automatically extract key insights, themes, and facts from your research materials."
          />
          <FeatureCard
            icon={<PlusCircle className="w-6 h-6" />}
            title="Draft Generation"
            description="Generate coherent drafts with proper citations in your preferred tone and style."
          />
        </div>

        {/* Recent Projects Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Recent Projects</h2>
            <Link href="/projects">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <div className="bg-white rounded-lg border p-8 text-center text-gray-500">
            <p>No projects yet. Create your first project to get started.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
