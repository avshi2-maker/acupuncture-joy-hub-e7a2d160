import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, Code, Key, Shield, Zap, BookOpen, Terminal, Lock, Globe } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const endpoints = [
  {
    method: 'POST',
    path: '/api/v1/search',
    description: 'Search the knowledge base with AI-powered semantic search',
    auth: true,
  },
  {
    method: 'GET',
    path: '/api/v1/points/:code',
    description: 'Get detailed information about an acupuncture point',
    auth: true,
  },
  {
    method: 'GET',
    path: '/api/v1/herbs/:id',
    description: 'Get herbal medicine information and formulas',
    auth: true,
  },
  {
    method: 'POST',
    path: '/api/v1/chat',
    description: 'Interactive RAG chat with the knowledge base',
    auth: true,
  },
  {
    method: 'GET',
    path: '/api/v1/conditions',
    description: 'List all TCM conditions and treatment protocols',
    auth: true,
  },
];

const codeExamples = {
  curl: `curl -X POST https://api.tcm-encyclopedia.com/v1/search \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "treatment for lower back pain",
    "limit": 10,
    "tier": "researcher"
  }'`,
  javascript: `import { TCMClient } from '@tcm-encyclopedia/sdk';

const client = new TCMClient({
  apiKey: process.env.TCM_API_KEY,
});

// Search the knowledge base
const results = await client.search({
  query: 'treatment for lower back pain',
  limit: 10,
});

// Get specific acupuncture point
const point = await client.points.get('BL23');

// Interactive chat
const response = await client.chat({
  message: 'What are the best points for kidney deficiency?',
  context: 'clinical',
});`,
  python: `from tcm_encyclopedia import TCMClient

client = TCMClient(api_key="YOUR_API_KEY")

# Search the knowledge base
results = client.search(
    query="treatment for lower back pain",
    limit=10
)

# Get specific acupuncture point
point = client.points.get("BL23")

# Interactive chat
response = client.chat(
    message="What are the best points for kidney deficiency?",
    context="clinical"
)`,
};

const tierLimits = [
  { tier: 'Student', requests: '1,000/month', rateLimit: '10/min', features: 'Basic search, Point lookup' },
  { tier: 'Practitioner', requests: '10,000/month', rateLimit: '60/min', features: 'Full search, Chat, Formulas' },
  { tier: 'Researcher', requests: 'Unlimited', rateLimit: '120/min', features: 'Full access, Bulk export, Analytics' },
];

export default function Developers() {
  return (
    <>
      <Helmet>
        <title>API Documentation | TCM Encyclopedia</title>
        <meta name="description" content="Integrate Dr. Roni Sapir's TCM knowledge base into your applications with our REST API." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <Badge variant="outline" className="mb-4">
                <Terminal className="w-3 h-3 mr-1" />
                API v1.0
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Build with TCM Knowledge
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Access 30+ years of Traditional Chinese Medicine research through our 
                REST API. Semantic search, RAG chat, and structured data for your applications.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link to="/encyclopedia">
                    Get API Key <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="#quickstart">Quick Start</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <Zap className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Fast Response</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Average response time under 200ms with global CDN distribution.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Shield className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Secure Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  API key authentication with tier-based access control and rate limiting.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <BookOpen className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Rich Data</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  5,000+ documents, 361 acupuncture points, 400+ herbal formulas.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Globe className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Multi-language</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Content available in English, Hebrew, Chinese with Pinyin transliteration.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Quick Start */}
        <section id="quickstart" className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Quick Start</h2>
            
            <Tabs defaultValue="curl" className="max-w-4xl">
              <TabsList>
                <TabsTrigger value="curl">cURL</TabsTrigger>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
              </TabsList>
              {Object.entries(codeExamples).map(([lang, code]) => (
                <TabsContent key={lang} value={lang}>
                  <Card>
                    <CardContent className="p-0">
                      <pre className="p-6 overflow-x-auto text-sm bg-zinc-950 text-zinc-100 rounded-lg">
                        <code>{code}</code>
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>

        {/* Endpoints */}
        <section className="py-16 container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">API Endpoints</h2>
          
          <div className="space-y-4 max-w-4xl">
            {endpoints.map((endpoint, index) => (
              <Card key={index}>
                <CardContent className="p-4 flex items-center gap-4">
                  <Badge 
                    variant={endpoint.method === 'GET' ? 'secondary' : 'default'}
                    className="font-mono"
                  >
                    {endpoint.method}
                  </Badge>
                  <code className="text-sm font-mono flex-1">{endpoint.path}</code>
                  <span className="text-muted-foreground text-sm hidden md:block">
                    {endpoint.description}
                  </span>
                  {endpoint.auth && (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Rate Limits */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Rate Limits by Tier</h2>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl">
              {tierLimits.map((tier, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>{tier.tier}</CardTitle>
                    <CardDescription>{tier.requests}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Rate Limit</span>
                      <span className="font-mono">{tier.rateLimit}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {tier.features}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to integrate?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Get your API key and start building with 30+ years of TCM research.
          </p>
          <Button size="lg" asChild>
            <Link to="/encyclopedia">
              <Key className="mr-2 w-4 h-4" />
              Get API Key
            </Link>
          </Button>
        </section>

        {/* Back Link */}
        <div className="container mx-auto px-4 pb-8">
          <Link to="/" className="text-primary hover:underline inline-flex items-center gap-2">
            ← Back to Home
          </Link>
        </div>
      </div>
    </>
  );
}
