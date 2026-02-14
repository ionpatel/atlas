'use client';

import { useState } from 'react';
import { 
  Book, Key, Zap, Shield, Code, Copy, Check, 
  ChevronDown, ExternalLink, Package, Users, FileText, 
  ShoppingCart, Webhook 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Link from 'next/link';
import { toast } from 'sonner';

const BASE_URL = 'https://atlas-erp.vercel.app/api/v1';

interface Endpoint {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  params?: { name: string; type: string; required?: boolean; description: string }[];
  body?: { name: string; type: string; required?: boolean; description: string }[];
  response?: string;
}

interface EndpointGroup {
  name: string;
  icon: React.ReactNode;
  endpoints: Endpoint[];
}

const ENDPOINT_GROUPS: EndpointGroup[] = [
  {
    name: 'Products',
    icon: <Package className="h-4 w-4" />,
    endpoints: [
      {
        method: 'GET',
        path: '/products',
        description: 'List all products in your inventory',
        params: [
          { name: 'page', type: 'number', description: 'Page number (default: 1)' },
          { name: 'limit', type: 'number', description: 'Items per page (default: 50, max: 100)' },
          { name: 'search', type: 'string', description: 'Search by name or SKU' },
          { name: 'category', type: 'string', description: 'Filter by category' },
        ],
        response: '{ "data": [Product], "meta": { "page": 1, "total": 100 } }'
      },
      {
        method: 'GET',
        path: '/products/:id',
        description: 'Get a single product by ID',
        response: '{ "data": Product }'
      },
      {
        method: 'POST',
        path: '/products',
        description: 'Create a new product',
        body: [
          { name: 'name', type: 'string', required: true, description: 'Product name' },
          { name: 'sku', type: 'string', required: true, description: 'Unique SKU' },
          { name: 'price', type: 'number', required: true, description: 'Unit price' },
          { name: 'quantity', type: 'number', description: 'Initial stock quantity' },
          { name: 'category', type: 'string', description: 'Category name' },
        ],
        response: '{ "data": Product }'
      },
      {
        method: 'PATCH',
        path: '/products/:id',
        description: 'Update a product',
        body: [
          { name: 'name', type: 'string', description: 'Product name' },
          { name: 'price', type: 'number', description: 'Unit price' },
          { name: 'quantity', type: 'number', description: 'Stock quantity' },
        ],
        response: '{ "data": Product }'
      },
      {
        method: 'DELETE',
        path: '/products/:id',
        description: 'Delete a product',
        response: '{ "success": true }'
      },
    ]
  },
  {
    name: 'Contacts',
    icon: <Users className="h-4 w-4" />,
    endpoints: [
      {
        method: 'GET',
        path: '/contacts',
        description: 'List all contacts',
        params: [
          { name: 'type', type: 'string', description: 'Filter by type: customer, vendor, or both' },
          { name: 'search', type: 'string', description: 'Search by name or email' },
        ]
      },
      {
        method: 'GET',
        path: '/contacts/:id',
        description: 'Get a single contact'
      },
      {
        method: 'POST',
        path: '/contacts',
        description: 'Create a new contact',
        body: [
          { name: 'name', type: 'string', required: true, description: 'Contact name' },
          { name: 'email', type: 'string', description: 'Email address' },
          { name: 'phone', type: 'string', description: 'Phone number' },
          { name: 'type', type: 'string', required: true, description: 'customer or vendor' },
        ]
      },
      {
        method: 'PATCH',
        path: '/contacts/:id',
        description: 'Update a contact'
      },
    ]
  },
  {
    name: 'Invoices',
    icon: <FileText className="h-4 w-4" />,
    endpoints: [
      {
        method: 'GET',
        path: '/invoices',
        description: 'List all invoices',
        params: [
          { name: 'status', type: 'string', description: 'Filter by status: draft, sent, paid, overdue' },
          { name: 'customer_id', type: 'string', description: 'Filter by customer' },
        ]
      },
      {
        method: 'GET',
        path: '/invoices/:id',
        description: 'Get a single invoice with line items'
      },
      {
        method: 'POST',
        path: '/invoices',
        description: 'Create a new invoice',
        body: [
          { name: 'customer_id', type: 'uuid', required: true, description: 'Customer contact ID' },
          { name: 'items', type: 'array', required: true, description: 'Array of line items' },
          { name: 'due_date', type: 'date', description: 'Payment due date' },
          { name: 'notes', type: 'string', description: 'Invoice notes' },
        ]
      },
      {
        method: 'POST',
        path: '/invoices/:id/send',
        description: 'Send invoice to customer via email'
      },
    ]
  },
  {
    name: 'Sales',
    icon: <ShoppingCart className="h-4 w-4" />,
    endpoints: [
      {
        method: 'GET',
        path: '/sales',
        description: 'List all sales',
        params: [
          { name: 'from', type: 'date', description: 'Start date (YYYY-MM-DD)' },
          { name: 'to', type: 'date', description: 'End date (YYYY-MM-DD)' },
        ]
      },
      {
        method: 'POST',
        path: '/sales',
        description: 'Create a new sale',
        body: [
          { name: 'items', type: 'array', required: true, description: 'Array of items with product_id and quantity' },
          { name: 'customer_id', type: 'uuid', description: 'Optional customer ID' },
          { name: 'payment_method', type: 'string', description: 'cash, card, or other' },
        ]
      },
    ]
  },
];

const CODE_EXAMPLES = {
  auth: {
    curl: `curl -X GET "${BASE_URL}/products" \\
  -H "Authorization: Bearer atlas_your_api_key_here" \\
  -H "Content-Type: application/json"`,
    javascript: `const response = await fetch('${BASE_URL}/products', {
  headers: {
    'Authorization': 'Bearer atlas_your_api_key_here',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();`,
    python: `import requests

headers = {
    'Authorization': 'Bearer atlas_your_api_key_here',
    'Content-Type': 'application/json'
}

response = requests.get('${BASE_URL}/products', headers=headers)
data = response.json()`
  },
  listProducts: {
    curl: `curl -X GET "${BASE_URL}/products?page=1&limit=20" \\
  -H "Authorization: Bearer atlas_your_api_key_here"`,
    javascript: `const response = await fetch('${BASE_URL}/products?page=1&limit=20', {
  headers: {
    'Authorization': 'Bearer atlas_your_api_key_here'
  }
});

const { data, meta } = await response.json();
console.log(\`Found \${meta.total} products\`);`,
    python: `response = requests.get(
    '${BASE_URL}/products',
    headers=headers,
    params={'page': 1, 'limit': 20}
)

data = response.json()
print(f"Found {data['meta']['total']} products")`
  },
  createInvoice: {
    curl: `curl -X POST "${BASE_URL}/invoices" \\
  -H "Authorization: Bearer atlas_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "customer_id": "123e4567-e89b-12d3-a456-426614174000",
    "items": [
      { "product_id": "...", "quantity": 2, "price": 49.99 }
    ],
    "due_date": "2026-03-01"
  }'`,
    javascript: `const invoice = await fetch('${BASE_URL}/invoices', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer atlas_your_api_key_here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    customer_id: '123e4567-e89b-12d3-a456-426614174000',
    items: [
      { product_id: '...', quantity: 2, price: 49.99 }
    ],
    due_date: '2026-03-01'
  })
}).then(r => r.json());`,
    python: `invoice = requests.post(
    '${BASE_URL}/invoices',
    headers=headers,
    json={
        'customer_id': '123e4567-e89b-12d3-a456-426614174000',
        'items': [
            {'product_id': '...', 'quantity': 2, 'price': 49.99}
        ],
        'due_date': '2026-03-01'
    }
).json()`
  }
};

export default function ApiDocsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  function copyCode(code: string, id: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedCode(null), 2000);
  }

  const methodColors: Record<string, string> = {
    GET: 'bg-green-500/20 text-green-400',
    POST: 'bg-blue-500/20 text-blue-400',
    PATCH: 'bg-amber-500/20 text-amber-400',
    DELETE: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">API Documentation</h1>
        <p className="text-neutral-400 mt-1">
          Complete reference for the Atlas ERP REST API
        </p>
      </div>

      {/* Getting Started */}
      <Card className="bg-neutral-900/50 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Book className="h-5 w-5 text-[#9C4A29]" />
            Getting Started
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-neutral-800/50 rounded-lg">
              <div className="flex items-center gap-2 text-white mb-2">
                <Key className="h-4 w-4 text-[#9C4A29]" />
                <span className="font-medium">1. Get an API Key</span>
              </div>
              <p className="text-sm text-neutral-400 mb-2">
                Create an API key from your settings to authenticate requests.
              </p>
              <Link href="/settings/api">
                <Button variant="outline" size="sm" className="border-neutral-700">
                  Manage API Keys
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="p-4 bg-neutral-800/50 rounded-lg">
              <div className="flex items-center gap-2 text-white mb-2">
                <Shield className="h-4 w-4 text-[#9C4A29]" />
                <span className="font-medium">2. Authenticate</span>
              </div>
              <p className="text-sm text-neutral-400">
                Include your API key in the Authorization header:
              </p>
              <code className="text-xs text-[#9C4A29] mt-2 block">
                Authorization: Bearer atlas_xxxxx...
              </code>
            </div>
          </div>

          <div className="p-4 bg-neutral-800/50 rounded-lg">
            <div className="flex items-center gap-2 text-white mb-2">
              <Zap className="h-4 w-4 text-[#9C4A29]" />
              <span className="font-medium">Base URL</span>
            </div>
            <code className="text-sm text-[#9C4A29] bg-neutral-900 px-3 py-2 rounded block">
              {BASE_URL}
            </code>
          </div>

          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-sm text-amber-400">
              <strong>Rate Limits:</strong> Default 1,000 requests per hour. 
              Contact support for higher limits.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Code Examples */}
      <Card className="bg-neutral-900/50 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Code className="h-5 w-5 text-[#9C4A29]" />
            Code Examples
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            <AccordionItem value="auth" className="border-neutral-800">
              <AccordionTrigger className="text-white hover:no-underline">
                Authentication
              </AccordionTrigger>
              <AccordionContent>
                <Tabs defaultValue="curl">
                  <TabsList className="bg-neutral-800">
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                  </TabsList>
                  {Object.entries(CODE_EXAMPLES.auth).map(([lang, code]) => (
                    <TabsContent key={lang} value={lang}>
                      <div className="relative">
                        <pre className="bg-neutral-950 p-4 rounded-lg overflow-x-auto text-sm text-neutral-300">
                          {code}
                        </pre>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => copyCode(code, `auth-${lang}`)}
                        >
                          {copiedCode === `auth-${lang}` ? (
                            <Check className="h-4 w-4 text-green-400" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="list" className="border-neutral-800">
              <AccordionTrigger className="text-white hover:no-underline">
                List Products
              </AccordionTrigger>
              <AccordionContent>
                <Tabs defaultValue="curl">
                  <TabsList className="bg-neutral-800">
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                  </TabsList>
                  {Object.entries(CODE_EXAMPLES.listProducts).map(([lang, code]) => (
                    <TabsContent key={lang} value={lang}>
                      <div className="relative">
                        <pre className="bg-neutral-950 p-4 rounded-lg overflow-x-auto text-sm text-neutral-300">
                          {code}
                        </pre>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => copyCode(code, `list-${lang}`)}
                        >
                          {copiedCode === `list-${lang}` ? (
                            <Check className="h-4 w-4 text-green-400" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="invoice" className="border-neutral-800">
              <AccordionTrigger className="text-white hover:no-underline">
                Create Invoice
              </AccordionTrigger>
              <AccordionContent>
                <Tabs defaultValue="curl">
                  <TabsList className="bg-neutral-800">
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                  </TabsList>
                  {Object.entries(CODE_EXAMPLES.createInvoice).map(([lang, code]) => (
                    <TabsContent key={lang} value={lang}>
                      <div className="relative">
                        <pre className="bg-neutral-950 p-4 rounded-lg overflow-x-auto text-sm text-neutral-300">
                          {code}
                        </pre>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => copyCode(code, `invoice-${lang}`)}
                        >
                          {copiedCode === `invoice-${lang}` ? (
                            <Check className="h-4 w-4 text-green-400" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Endpoints */}
      <Card className="bg-neutral-900/50 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white">API Endpoints</CardTitle>
          <CardDescription className="text-neutral-400">
            Full reference of available endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="space-y-2">
            {ENDPOINT_GROUPS.map((group) => (
              <AccordionItem 
                key={group.name} 
                value={group.name}
                className="border-neutral-800"
              >
                <AccordionTrigger className="text-white hover:no-underline">
                  <div className="flex items-center gap-2">
                    {group.icon}
                    {group.name}
                    <Badge variant="outline" className="border-neutral-700 ml-2">
                      {group.endpoints.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {group.endpoints.map((endpoint, idx) => (
                      <div 
                        key={idx}
                        className="p-3 bg-neutral-800/50 rounded-lg"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={methodColors[endpoint.method]}>
                            {endpoint.method}
                          </Badge>
                          <code className="text-sm text-white">{endpoint.path}</code>
                        </div>
                        <p className="text-sm text-neutral-400 mb-2">
                          {endpoint.description}
                        </p>
                        {endpoint.params && (
                          <div className="mt-2">
                            <p className="text-xs text-neutral-500 mb-1">Query Parameters:</p>
                            <div className="space-y-1">
                              {endpoint.params.map((p: any) => (
                                <div key={p.name} className="text-xs">
                                  <code className="text-[#9C4A29]">{p.name}</code>
                                  <span className="text-neutral-500"> ({p.type})</span>
                                  <span className="text-neutral-400"> — {p.description}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {endpoint.body && (
                          <div className="mt-2">
                            <p className="text-xs text-neutral-500 mb-1">Request Body:</p>
                            <div className="space-y-1">
                              {endpoint.body.map((p: any) => (
                                <div key={p.name} className="text-xs">
                                  <code className="text-[#9C4A29]">{p.name}</code>
                                  {p.required && <span className="text-red-400">*</span>}
                                  <span className="text-neutral-500"> ({p.type})</span>
                                  <span className="text-neutral-400"> — {p.description}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card className="bg-neutral-900/50 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Webhook className="h-5 w-5 text-[#9C4A29]" />
            Webhooks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-neutral-400">
            Webhooks allow you to receive real-time notifications when events occur in your Atlas account.
          </p>

          <div className="p-4 bg-neutral-800/50 rounded-lg space-y-2">
            <h4 className="text-white font-medium">Signature Verification</h4>
            <p className="text-sm text-neutral-400">
              All webhook payloads are signed using HMAC-SHA256. Verify the signature using the 
              <code className="text-[#9C4A29] mx-1">X-Atlas-Signature</code> header:
            </p>
            <pre className="bg-neutral-950 p-3 rounded text-xs text-neutral-300 overflow-x-auto">
{`const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return signature === \`sha256=\${expected}\`;
}`}
            </pre>
          </div>

          <div className="p-4 bg-neutral-800/50 rounded-lg space-y-2">
            <h4 className="text-white font-medium">Retry Policy</h4>
            <p className="text-sm text-neutral-400">
              Failed deliveries are retried up to 5 times with exponential backoff:
            </p>
            <ul className="text-sm text-neutral-400 list-disc list-inside">
              <li>Retry 1: After 1 minute</li>
              <li>Retry 2: After 5 minutes</li>
              <li>Retry 3: After 30 minutes</li>
              <li>Retry 4: After 2 hours</li>
              <li>Retry 5: After 24 hours</li>
            </ul>
          </div>

          <Link href="/settings/webhooks">
            <Button variant="outline" className="border-neutral-700">
              Configure Webhooks
              <ExternalLink className="h-3 w-3 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
