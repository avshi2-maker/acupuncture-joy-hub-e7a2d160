import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Database, Settings, Code, ArrowLeft, Shield, Key } from 'lucide-react';
import { toast } from 'sonner';
import { KnowledgeBaseCard } from '@/components/dashboard/KnowledgeBaseCard';
import { AssetInventoryCard } from '@/components/dashboard/AssetInventoryCard';
import { HebrewQuestionsCard } from '@/components/dashboard/HebrewQuestionsCard';

const DEVELOPER_PASSWORD = 'sapir2024dev'; // Internal password - change as needed

export default function PrivateDeveloper() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      if (password === DEVELOPER_PASSWORD) {
        setIsAuthenticated(true);
        toast.success('Developer access granted');
      } else {
        toast.error('Invalid password');
      }
      setIsLoading(false);
    }, 500);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Helmet>
          <title>Developer Access | TCM Clinic</title>
        </Helmet>
        
        <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 backdrop-blur-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-amber-500" />
            </div>
            <CardTitle className="text-2xl text-white">Private Developer Area</CardTitle>
            <CardDescription className="text-slate-400">
              Internal tools for system administration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Developer Password</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter developer password"
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Access Developer Tools'}
              </Button>
              <Button 
                type="button"
                variant="ghost" 
                className="w-full text-slate-400 hover:text-white"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <Helmet>
        <title>Developer Tools | TCM Clinic</title>
      </Helmet>

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Shield className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Private Developer Area</h1>
                <p className="text-sm text-slate-400">Internal system utilities</p>
              </div>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setIsAuthenticated(false)}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <Lock className="h-4 w-4 mr-2" />
            Lock
          </Button>
        </div>
      </div>

      {/* Developer Tools Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Knowledge Base Management */}
        <div className="col-span-1">
          <KnowledgeBaseCard />
        </div>

        {/* Asset Inventory */}
        <div className="col-span-1">
          <AssetInventoryCard />
        </div>

        {/* Hebrew Questions Report */}
        <div className="col-span-1">
          <HebrewQuestionsCard />
        </div>

        {/* Placeholder: More tools to be added */}
        <Card className="bg-slate-800/50 border-slate-700 border-dashed">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Database className="h-6 w-6 text-slate-500" />
              <CardTitle className="text-slate-400">Database Tools</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">Coming soon - Direct database utilities</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 border-dashed">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6 text-slate-500" />
              <CardTitle className="text-slate-400">System Config</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">Coming soon - System configuration panel</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 border-dashed">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Code className="h-6 w-6 text-slate-500" />
              <CardTitle className="text-slate-400">API Testing</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">Coming soon - API endpoint testing</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
