/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Code2, 
  Terminal, 
  Globe, 
  BookOpen, 
  FileCode, 
  Copy, 
  ExternalLink, 
  Trash2, 
  Plus, 
  Check, 
  Upload, 
  Sparkles, 
  Lock, 
  Eye, 
  Play, 
  Settings, 
  ChevronRight,
  Menu,
  X,
  FileText,
  FolderOpen,
  RefreshCw,
  Edit3,
  Undo2,
  FileArchive,
  ArrowUpRight,
  Save,
  HelpCircle,
  Activity,
  Layers,
  CheckCircle2,
  Power,
  Server,
  BarChart3,
  Code,
  LockKeyhole,
  KeyRound,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import JSZip from 'jszip';

// Interfaces matching server.ts data structure
interface PageItem {
  id: string;
  title: string;
  description: string;
  views: number;
  createdAt: string;
  updatedAt?: string;
  hasPassword: boolean;
  slug?: string;
  status: 'active' | 'inactive';
  type: 'site' | 'api';
  apiMethod?: string;
  envVariables?: Record<string, string>;
}

interface UploadedFilePayload {
  path: string;
  content: string;
  type: 'text' | 'base64';
}

const TEMPLATES = [
  {
    id: 'portfolio',
    name: 'Minimal Portfolio / ミニマル・ポートフォリオ',
    description: '美しくタイポグラフィが際立つ個人用ポートフォリオ。洗練されたホワイトテーマ、なめらかなスクロール。',
    html: `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sarah Miller | Portfolio</title>
  <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
  </style>
</head>
<body class="bg-[#FAFAFA] text-neutral-800 min-h-screen">
  <main class="max-w-2xl mx-auto px-6 py-20 space-y-16">
    <!-- Header -->
    <header class="space-y-4">
      <div class="space-y-2">
        <h1 class="text-3xl font-extrabold tracking-tight text-neutral-900">Sarah Miller</h1>
        <p class="text-neutral-500 text-base">UI Designer & Frontend Engineer based in Kyoto. Specialized in building clean, minimalist interfaces.</p>
      </div>
    </header>

    <!-- Selected Projects -->
    <section class="space-y-4">
      <h2 class="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Selected Projects</h2>
      <div class="space-y-6">
        <div class="p-5 bg-white border border-neutral-200/60 rounded-xl space-y-2 hover:border-neutral-300 transition-colors">
          <h3 class="text-neutral-900 font-bold text-sm">01. Kinfolk Digital</h3>
          <p class="text-xs text-neutral-500 leading-relaxed">Editorial website redesign with lightweight React component system and server-side optimization.</p>
        </div>
        <div class="p-5 bg-white border border-neutral-200/60 rounded-xl space-y-2 hover:border-neutral-300 transition-colors">
          <h3 class="text-neutral-900 font-bold text-sm">02. Slate Workspace</h3>
          <p class="text-xs text-neutral-500 leading-relaxed">Slate is a minimal local-first workspace for developers.</p>
        </div>
      </div>
    </section>

    <!-- Environment Variable usage sample inside site -->
    <section class="p-5 bg-white border border-neutral-200/60 rounded-xl space-y-3">
      <h3 class="text-neutral-900 font-bold text-xs">🔑 インジェクション環境変数 (window.ENV) テスト</h3>
      <p class="text-xs text-neutral-500 leading-relaxed">PageHostに設定した独自の APIキーは、window.ENV を通して自動的にインジェクションされます。</p>
      <div class="p-3 bg-neutral-50 border border-neutral-100 rounded-lg">
        <p id="env-test" class="font-mono text-[10px] text-neutral-600">環境変数をスキャン中...</p>
      </div>
    </section>

    <!-- Footer -->
    <footer class="pt-8 border-t border-neutral-200/60 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-neutral-400">
      <p>© 2026 Sarah Miller. Built with PageHost.</p>
    </footer>
  </main>

  <script>
    // window.ENV will hold variables like GOOGLE_MAPS_KEY if configured on PageHost deploy settings
    setTimeout(() => {
      const keys = Object.keys(window.ENV || {});
      const display = document.getElementById('env-test');
      if (keys.length > 0) {
        display.innerHTML = "検出された環境変数:\\n" + keys.map(k => k + ": " + "*".repeat(window.ENV[k].length)).join("\\n");
      } else {
        display.innerHTML = "window.ENV に環境変数は検出されませんでした。(Canvasの設定から追加可能です)";
      }
    }, 500);
  </script>
</body>
</html>`
  },
  {
    id: 'dashboard',
    name: 'Minimal SaaS App Interface / ミニマルSaaSダッシュボード',
    description: '1ファイルで驚くほどのインタラクティビティを誇る、美しいSaaS型プロダクトのプロトタイプ。',
    html: `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MetricX Dashboard</title>
  <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
  </style>
</head>
<body class="bg-[#F8F9FA] text-neutral-800 min-h-screen">
  <div class="flex flex-col min-h-screen">
    <!-- Navbar -->
    <header class="bg-white border-b border-neutral-200/80 px-6 py-4 flex items-center justify-between">
      <span class="text-neutral-900 font-bold tracking-tight text-sm">MetricX</span>
      <div class="flex items-center gap-3">
        <button onclick="addMetric()" class="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer">+ データ追加</button>
      </div>
    </header>

    <!-- Content -->
    <main class="flex-1 max-w-5xl w-full mx-auto p-6 space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Stat Card 1 -->
        <div class="bg-white border border-neutral-200 rounded-xl p-5 space-y-2">
          <p class="text-xs font-medium text-neutral-500">インプレッション</p>
          <p id="stat-views" class="text-2xl font-bold text-neutral-900 tracking-tight">12,482</p>
        </div>
        <!-- Stat Card 2 -->
        <div class="bg-white border border-neutral-200 rounded-xl p-5 space-y-2">
          <p class="text-xs font-medium text-neutral-500">アクティブユーザー</p>
          <p id="stat-users" class="text-2xl font-bold text-neutral-900 tracking-tight">1,824</p>
        </div>
        <!-- Stat Card 3 -->
        <div class="bg-white border border-neutral-200 rounded-xl p-5 space-y-2">
          <p class="text-xs font-medium text-neutral-500">コンバージョン率</p>
          <p class="text-2xl font-bold text-emerald-600 tracking-tight">4.2%</p>
        </div>
      </div>

      <!-- Data Table -->
      <div class="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div class="px-5 py-4 border-b border-neutral-200">
          <h3 class="text-sm font-bold text-neutral-900">リアルタイム・イベントログ</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold">
              <tr>
                <th class="p-4">イベントタイプ</th>
                <th class="p-4">パス</th>
                <th class="p-4">ステータス</th>
                <th class="p-4 text-right">時間</th>
              </tr>
            </thead>
            <tbody id="log-body" class="divide-y divide-neutral-100">
              <tr>
                <td class="p-4 font-semibold text-neutral-900">API_REQUEST</td>
                <td class="p-4 font-mono text-neutral-500">/v1/telemetry</td>
                <td class="p-4"><span class="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] rounded font-medium">SUCCESS</span></td>
                <td class="p-4 text-right text-neutral-400 font-mono">12:34:01</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>

  <script>
    let views = 12482;
    let users = 1824;

    function addMetric() {
      views += Math.floor(Math.random() * 50) + 10;
      users += Math.floor(Math.random() * 5) + 1;
      document.getElementById('stat-views').innerText = views.toLocaleString();
      document.getElementById('stat-users').innerText = users.toLocaleString();

      const tbody = document.getElementById('log-body');
      const tr = document.createElement('tr');
      const now = new Date().toTimeString().split(' ')[0];
      tr.innerHTML = \`
        <td class="p-4 font-semibold text-neutral-900">MANUAL_LOG</td>
        <td class="p-4 font-mono text-neutral-500">/v1/trigger</td>
        <td class="p-4"><span class="px-2 py-0.5 bg-cyan-50 text-cyan-700 text-[10px] rounded font-medium">ADDED</span></td>
        <td class="p-4 text-right text-neutral-400 font-mono">\${now}</td>
      \`;
      tbody.insertBefore(tr, tbody.firstChild);
    }
  </script>
</body>
</html>`
  }
];

const INITIAL_HTML = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to PageHost</title>
  <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
  </style>
</head>
<body class="bg-[#FAFAFA] text-[#2D3142] flex flex-col items-center justify-center min-h-screen p-6 text-center">
  <div class="max-w-md space-y-6">
    <div class="inline-flex p-3 rounded-2xl bg-white border border-neutral-200/80 text-neutral-950 font-extrabold text-2xl tracking-widest shadow-sm">
      PAGEHOST
    </div>
    <div class="space-y-2">
      <h1 class="text-2xl font-bold tracking-tight text-neutral-900">リアルタイム・サーバープレビュー</h1>
      <p class="text-neutral-500 text-sm leading-relaxed">左側のエディタを直接書き換える、ファイルをアップロードする、あるいはAIアシスタントにプロンプトを指示すると、この画面が瞬時に動作し更新されます。</p>
    </div>
    <div class="p-5 bg-white rounded-xl border border-neutral-200/80 text-xs text-neutral-500 space-y-1.5 shadow-sm text-left">
      <p class="font-bold text-neutral-950 mb-1 flex items-center gap-1.5">💡 PageHostの強力な機能</p>
      <p>・同一URL（ID）のまま何度でもコードの<strong>上書き更新・保存</strong>が可能</p>
      <p>・<strong>ZIP / 複数フォルダ</strong>のドラッグ＆ドロップ配信に対応</p>
      <p>・アップロードされた複数ファイル（CSSや画像など）もサブパスでホスト</p>
      <p>・<strong>AI改善アシスタント</strong>によるデザイン・サーバーロジックの最適化</p>
    </div>
  </div>
</body>
</html>`;

const INITIAL_JSON_API = `{
  "status": "success",
  "message": "Hello from PageHost Mock API!",
  "data": {
    "users": [
      { "id": 1, "name": "田中 太郎", "role": "Administrator" },
      { "id": 2, "name": "佐藤 美咲", "role": "Developer" }
    ]
  }
}`;

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'canvas' | 'history' | 'templates' | 'docs' | 'settings'>('dashboard');
  const [htmlCode, setHtmlCode] = useState(INITIAL_HTML);
  const [pageTitle, setPageTitle] = useState('マイ・ウェブサイト');
  const [pageDesc, setPageDesc] = useState('PageHostで簡単公開されたウェブサイト。');
  const [password, setPassword] = useState('');
  const [hasPassword, setHasPassword] = useState(false);
  
  // Custom Slug & Meta Properties
  const [customSlug, setCustomSlug] = useState('');
  const [deployStatus, setDeployStatus] = useState<'active' | 'inactive'>('active');
  const [deployType, setDeployType] = useState<'site' | 'api'>('site');
  const [apiMethod, setApiMethod] = useState<string>('GET');
  const [apiResponse, setApiResponse] = useState<string>(INITIAL_JSON_API);

  // ENVIRONMENT VARIABLES & SECRETS FOR HOSTED PAGE
  const [envPairs, setEnvPairs] = useState<{ key: string; value: string }[]>([
    { key: 'API_SECRET_TOKEN', value: 'secret_example_value_12345' }
  ]);
  const [envKeyInput, setEnvKeyInput] = useState('');
  const [envValInput, setEnvValInput] = useState('');

  // GLOBAL SYSTEM SETTINGS (Custom Gemini API Key)
  const [systemGeminiKey, setSystemGeminiKey] = useState<string>(() => {
    return localStorage.getItem('pagehost_system_gemini_key') || '';
  });
  const [showGeminiKey, setShowGeminiKey] = useState(false);

  // Edit mode / Existing URL tracking
  const [editingId, setEditingId] = useState<string | null>(null);
  const [originalMeta, setOriginalMeta] = useState<any>(null);

  // File system state for folders / ZIP uploads
  const [attachedFiles, setAttachedFiles] = useState<UploadedFilePayload[]>([]);

  // Mobile navigation
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // AI Assistant state
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingMessage, setGeneratingMessage] = useState('');

  // Deploy state
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<{ id: string; url: string; isUpdate: boolean } | null>(null);

  // History state
  const [historyPages, setHistoryPages] = useState<PageItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Iframe refreshing anchor
  const [previewKey, setPreviewKey] = useState(0);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const previewFrameRef = useRef<HTMLIFrameElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Save system API Key to LocalStorage when changed
  useEffect(() => {
    localStorage.setItem('pagehost_system_gemini_key', systemGeminiKey);
  }, [systemGeminiKey]);

  // Render iframe content dynamically
  useEffect(() => {
    if (activeTab === 'canvas' && deployType === 'site' && previewFrameRef.current) {
      const doc = previewFrameRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(htmlCode);
        doc.close();

        if (editingId) {
          const base = doc.createElement('base');
          base.href = `${window.location.origin}/p/${editingId}/`;
          doc.head.appendChild(base);
        }
      }
    }
  }, [htmlCode, activeTab, previewKey, editingId, deployType]);

  // Sync index.html with attachedFiles if changed
  useEffect(() => {
    if (attachedFiles.length > 0) {
      const indexFile = attachedFiles.find(f => f.path.toLowerCase().endsWith('index.html'));
      if (indexFile) {
        setHtmlCode(indexFile.content);
        setDeployType('site');
      }
    }
  }, [attachedFiles]);

  useEffect(() => {
    fetchHistory();
  }, [activeTab]);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch('/api/pages');
      if (res.ok) {
        const data = await res.json();
        setHistoryPages(data);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(id);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  // ZIP Upload Parser
  const handleZipUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsGenerating(true);
    setGeneratingMessage('ZIPファイルを解析中...');

    try {
      const zip = new JSZip();
      const loadedZip = await zip.loadAsync(file);
      const parsedFiles: UploadedFilePayload[] = [];

      for (const relativePath of Object.keys(loadedZip.files)) {
        const entry = loadedZip.files[relativePath];
        if (entry.dir) continue;

        const isText = /\.(html|css|js|json|svg|txt)$/i.test(relativePath);
        if (isText) {
          const text = await entry.async('string');
          parsedFiles.push({ path: relativePath, content: text, type: 'text' });
        } else {
          const b64 = await entry.async('base64');
          parsedFiles.push({ path: relativePath, content: b64, type: 'base64' });
        }
      }

      const indexFile = parsedFiles.find(f => f.path.toLowerCase().endsWith('index.html'));
      if (!indexFile) {
        alert('ZIPファイルの中に index.html が見つかりませんでした。メインのHTMLファイルを index.html にして再アップロードしてください。');
        return;
      }

      setAttachedFiles(parsedFiles);
      setHtmlCode(indexFile.content);
      setDeployType('site');
      setPageTitle(file.name.replace(/\.zip$/i, ''));
      setPreviewKey(prev => prev + 1);
      alert(`ZIPから ${parsedFiles.length} 個のファイルを正常に読み込みました。`);
    } catch (err) {
      console.error('ZIP loading failed:', err);
      alert('ZIPファイルの展開に失敗しました。');
    } finally {
      setIsGenerating(false);
    }
  };

  // Folder Upload Parser
  const handleFolderUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsGenerating(true);
    setGeneratingMessage('フォルダ構造を構築中...');

    try {
      const parsedFiles: UploadedFilePayload[] = [];
      let indexFileFound = false;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const relativePath = file.webkitRelativePath || file.name;
        
        const isText = /\.(html|css|js|json|svg|txt)$/i.test(file.name);
        if (isText) {
          const text = await file.text();
          parsedFiles.push({ path: relativePath, content: text, type: 'text' });
          if (file.name.toLowerCase() === 'index.html') {
            indexFileFound = true;
          }
        } else {
          const b64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const res = reader.result as string;
              resolve(res.split(',')[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          parsedFiles.push({ path: relativePath, content: b64, type: 'base64' });
        }
      }

      if (!indexFileFound) {
        alert('アップロードされたフォルダの中に index.html が見つかりませんでした。');
        return;
      }

      const cleanFiles = parsedFiles.map(f => {
        const parts = f.path.split('/');
        if (parts.length > 1) {
          return { ...f, path: parts.slice(1).join('/') };
        }
        return f;
      });

      setAttachedFiles(cleanFiles);
      const mainHtml = cleanFiles.find(f => f.path.toLowerCase() === 'index.html');
      if (mainHtml) {
        setHtmlCode(mainHtml.content);
        setDeployType('site');
      }
      setPreviewKey(prev => prev + 1);
      alert(`フォルダから ${cleanFiles.length} 個のファイルを正常に読み込みました。`);
    } catch (err) {
      console.error('Folder upload failed:', err);
      alert('フォルダのアップロード解析に失敗しました。');
    } finally {
      setIsGenerating(false);
    }
  };

  // Load target to edit
  const handleLoadToEdit = async (id: string) => {
    setIsGenerating(true);
    setGeneratingMessage('サーバーデータをインポート中...');
    
    try {
      const res = await fetch(`/api/pages/${id}/raw`);
      if (res.ok) {
        const data = await res.json();
        setEditingId(id);
        setOriginalMeta(data.meta);
        setPageTitle(data.meta.title);
        setPageDesc(data.meta.description);
        setHasPassword(data.meta.hasPassword);
        setPassword(data.meta.password || '');
        setCustomSlug(data.meta.slug || '');
        setDeployStatus(data.meta.status || 'active');
        setDeployType(data.meta.type || 'site');
        setApiResponse(data.meta.apiResponse || INITIAL_JSON_API);
        setApiMethod(data.meta.apiMethod || 'GET');
        
        // Load custom Environment variables from meta
        const rawEnv = data.meta.envVariables || {};
        const parsedPairs = Object.keys(rawEnv).map(k => ({ key: k, value: rawEnv[k] }));
        setEnvPairs(parsedPairs);
        
        if (data.meta.type === 'site') {
          setHtmlCode(data.html);
        }
        
        setAttachedFiles([]);
        setPreviewKey(prev => prev + 1);
        setActiveTab('canvas');
        alert(`URLパス [ ${data.meta.slug || id} ] のサーバー編集モードに入りました。`);
      } else {
        alert('指定されたデプロイデータのロードに失敗しました。');
      }
    } catch (err) {
      console.error('Load edit failed:', err);
      alert('ロードできませんでした。');
    } finally {
      setIsGenerating(false);
    }
  };

  // Discard edit mode and reset canvas
  const handleDiscardEditMode = () => {
    if (confirm('現在の編集モードを破棄して新規キャンバスに戻しますか？')) {
      setEditingId(null);
      setOriginalMeta(null);
      setHtmlCode(INITIAL_HTML);
      setPageTitle('マイ・ウェブサイト');
      setPageDesc('PageHostで簡単公開されたウェブサイト。');
      setHasPassword(false);
      setPassword('');
      setCustomSlug('');
      setDeployStatus('active');
      setDeployType('site');
      setApiResponse(INITIAL_JSON_API);
      setApiMethod('GET');
      setEnvPairs([{ key: 'API_SECRET_TOKEN', value: 'secret_example_value_12345' }]);
      setAttachedFiles([]);
      setPreviewKey(prev => prev + 1);
    }
  };

  // Toggle page status on the fly
  const handleToggleStatus = async (id: string, currentStatus: 'active' | 'inactive') => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/pages/${id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        setHistoryPages(prev => prev.map(p => p.id === id ? { ...p, status: nextStatus } : p));
      } else {
        alert('ステータスの切り替えに失敗しました。');
      }
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  // Add environment variable pair
  const handleAddEnvPair = () => {
    const key = envKeyInput.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '');
    const value = envValInput.trim();
    if (!key || !value) return;

    if (envPairs.some(p => p.key === key)) {
      alert(`キー「${key}」はすでに存在しています。上書きする場合は、一度削除してから追加してください。`);
      return;
    }

    setEnvPairs(prev => [...prev, { key, value }]);
    setEnvKeyInput('');
    setEnvValInput('');
  };

  // Remove environment variable pair
  const handleRemoveEnvPair = (key: string) => {
    setEnvPairs(prev => prev.filter(p => p.key !== key));
  };

  // Perform Deploy (POST) or Save/Update (PUT)
  const handlePublish = async (forceAsNew: boolean = false) => {
    setIsDeploying(true);
    const isUpdate = !!editingId && !forceAsNew;
    const url = isUpdate ? `/api/pages/${editingId}` : '/api/deploy';
    const method = isUpdate ? 'PUT' : 'POST';

    // Build environment variables object from state array
    const envVariablesObj: Record<string, string> = {};
    envPairs.forEach(p => {
      if (p.key.trim()) envVariablesObj[p.key.trim()] = p.value;
    });

    let payloadFiles = [...attachedFiles];
    if (deployType === 'site') {
      if (payloadFiles.length === 0) {
        payloadFiles.push({ path: 'index.html', content: htmlCode, type: 'text' });
      } else {
        payloadFiles = payloadFiles.map(f => {
          if (f.path.toLowerCase() === 'index.html') {
            return { ...f, content: htmlCode };
          }
          return f;
        });
      }
    }

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: deployType === 'site' ? htmlCode : undefined,
          files: deployType === 'site' ? payloadFiles : undefined,
          title: pageTitle,
          description: pageDesc,
          password: hasPassword ? password : '',
          updatePassword: true,
          slug: customSlug.trim() || undefined,
          status: deployStatus,
          type: deployType,
          apiResponse: deployType === 'api' ? apiResponse : undefined,
          apiMethod: deployType === 'api' ? apiMethod : undefined,
          envVariables: envVariablesObj,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setDeployResult({ id: data.page.id, url: data.url, isUpdate });
        if (!isUpdate) {
          setEditingId(data.page.id);
          setOriginalMeta(data.page);
        }
      } else {
        alert(data.error || 'デプロイ中にエラーが発生しました。');
      }
    } catch (err) {
      console.error('Deploy error:', err);
      alert('サーバー通信に失敗しました。');
    } finally {
      setIsDeploying(false);
    }
  };

  // Delete hosted page
  const handleDeletePage = async (id: string) => {
    if (!confirm('このサーバーを削除すると、URLパスも永久に失われます。本当に削除しますか？')) return;

    try {
      const res = await fetch(`/api/pages/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setHistoryPages(prev => prev.filter(p => p.id !== id));
        if (editingId === id) {
          setEditingId(null);
          setOriginalMeta(null);
        }
      } else {
        alert('削除に失敗しました。');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Load a template
  const handleLoadTemplate = (html: string) => {
    if (confirm('現在の編集中のコードは上書きされます。テンプレートを読み込みますか？')) {
      setHtmlCode(html);
      setDeployType('site');
      setPreviewKey(prev => prev + 1);
      setActiveTab('canvas');
    }
  };

  // AI Gemini Optimization (includes X-Gemini-API-Key header)
  const handleAIImprove = async (promptText: string) => {
    if (!promptText.trim()) return;

    setIsGenerating(true);
    setGeneratingMessage('デザインとUIレイアウトを再構成中...');
    
    const messages = [
      'HTMLコード構造を最適化中...',
      'ホワイトテーマの洗練された余白をアライン中...',
      '双方向のJavaScriptロジックをバグ修正中...',
      '表示テストを実行し、最終調整中...'
    ];
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < messages.length) {
        setGeneratingMessage(messages[index]);
        index++;
      }
    }, 2200);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      // Inject custom user API key if supplied
      if (systemGeminiKey.trim()) {
        headers['x-gemini-api-key'] = systemGeminiKey.trim();
      }

      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          prompt: promptText, 
          html: deployType === 'site' ? htmlCode : undefined, 
          isImprovement: deployType === 'site'
        }),
      });

      const data = await response.json();
      if (response.ok && data.html) {
        if (deployType === 'site') {
          setHtmlCode(data.html);
        } else {
          setApiResponse(data.html);
        }
        setPreviewKey(prev => prev + 1);
        setAiPrompt('');
      } else {
        alert(data.error || 'AIによるコード改善に失敗しました。APIキーを確認してください。');
      }
    } catch (err) {
      console.error('AI error:', err);
      alert('AIアシスタントとの通信に失敗しました。');
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  // Dashboard calculations
  const totalViews = historyPages.reduce((acc, p) => acc + p.views, 0);
  const totalHosts = historyPages.length;
  const siteCount = historyPages.filter(p => p.type === 'site').length;
  const apiCount = historyPages.filter(p => p.type === 'api').length;
  const activeCount = historyPages.filter(p => p.status === 'active').length;

  return (
    <div className="flex min-h-screen bg-[#F9F9FB] text-neutral-800 selection:bg-neutral-900 selection:text-white font-sans">
      
      {/* Mobile Top Navbar (15% sticky height limit) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-neutral-200/80 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-neutral-900" />
          <span className="text-neutral-900 font-bold text-sm tracking-tight">PageHost</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-neutral-500 hover:text-neutral-900">
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation Panel - White Theme */}
      <aside className={`
        fixed inset-y-0 left-0 w-[280px] bg-white border-r border-neutral-200/80 flex flex-col z-50 transition-transform duration-300 md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:z-10 pt-14 md:pt-0
      `}>
        {/* Logo and branding */}
        <div className="p-6 border-b border-neutral-200/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center">
              <Terminal className="w-4 h-4 text-white stroke-[2.5]" />
            </div>
            <div>
              <span className="text-neutral-900 font-extrabold text-base tracking-tight">PageHost</span>
              <p className="text-[10px] text-neutral-400 font-semibold tracking-wider uppercase">SaaS Hosting Engine</p>
            </div>
          </div>
        </div>

        {/* Tab List */}
        <nav className="flex-1 p-4 space-y-1">
          <span className="px-3 py-1.5 block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Main Console</span>
          
          <button 
            onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeTab === 'dashboard' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'}`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>ダッシュボード</span>
          </button>

          <button 
            onClick={() => { setActiveTab('canvas'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeTab === 'canvas' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'}`}
          >
            <Code2 className="w-4 h-4" />
            <span>新規作成 & 編集</span>
            {editingId && (
              <span className="ml-auto w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>

          <button 
            onClick={() => { setActiveTab('history'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeTab === 'history' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'}`}
          >
            <Globe className="w-4 h-4" />
            <span>サーバー管理 & 一覧</span>
            {historyPages.length > 0 && (
              <span className="ml-auto bg-neutral-200 text-neutral-600 text-[10px] font-mono px-1.5 py-0.5 rounded font-bold">
                {historyPages.length}
              </span>
            )}
          </button>

          <span className="px-3 pt-6 pb-1.5 block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Resources</span>

          <button 
            onClick={() => { setActiveTab('templates'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeTab === 'templates' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'}`}
          >
            <FileText className="w-4 h-4" />
            <span>デザイン・テンプレート</span>
          </button>

          <button 
            onClick={() => { setActiveTab('docs'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeTab === 'docs' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'}`}
          >
            <BookOpen className="w-4 h-4" />
            <span>使い方説明書</span>
          </button>

          <span className="px-3 pt-6 pb-1.5 block text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-sans">Settings</span>

          <button 
            onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeTab === 'settings' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'}`}
          >
            <Settings className="w-4 h-4" />
            <span>環境設定 / Secrets</span>
          </button>
        </nav>

        {/* Footer info box */}
        <div className="p-4 border-t border-neutral-200/60 space-y-2 bg-[#FAFAFA]">
          <div className="flex items-center gap-3 px-2 py-2 bg-white border border-neutral-200/80 rounded-lg text-xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2563EB] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2563EB]"></span>
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-neutral-700 font-semibold truncate">Firestore Connected</p>
              <p className="text-[10px] text-neutral-400 font-mono truncate">ID: gen-lang-client-0907...</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container Area */}
      <main className="flex-1 flex flex-col min-w-0 pt-14 md:pt-0">
        
        {/* Header Contract */}
        <header className="h-14 border-b border-neutral-200/80 flex items-center justify-between px-6 shrink-0 bg-white z-30">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
            <span className="text-neutral-900">PageHost</span>
            <ChevronRight className="w-3 h-3 text-neutral-300" />
            <span className="text-neutral-500 font-medium capitalize">
              {activeTab === 'dashboard' ? 'Overview' : activeTab === 'canvas' ? 'Canvas' : activeTab === 'history' ? 'Manager' : activeTab === 'templates' ? 'Templates' : activeTab === 'settings' ? 'Settings' : 'Documentation'}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-3 text-xs text-neutral-400 font-mono">
            {editingId ? (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 rounded text-xs font-sans">
                <Edit3 className="w-3 h-3" />
                <span>編集ロック中 (Slug/ID: <strong>{customSlug || editingId}</strong>)</span>
              </div>
            ) : (
              <span>Cloud Storage API: Live</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'canvas' && (
              <div className="flex items-center gap-2">
                {editingId && (
                  <button 
                    onClick={handleDiscardEditMode}
                    className="px-3 py-1.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 text-xs font-semibold rounded-lg border border-neutral-200 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">新規へ</span>
                  </button>
                )}

                <button 
                  onClick={() => handlePublish(false)}
                  disabled={isDeploying || isGenerating}
                  className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isDeploying ? (
                    <>
                      <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full"></span>
                      <span>構築中...</span>
                    </>
                  ) : editingId ? (
                    <>
                      <Save className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>サーバー更新保存</span>
                    </>
                  ) : (
                    <>
                      <Globe className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>サーバー新規作成 (Deploy)</span>
                    </>
                  )}
                </button>
              </div>
            )}
            
            {activeTab === 'dashboard' && (
              <button 
                onClick={fetchHistory}
                className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                ダッシュボード同期
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Display Area */}
        <div className="flex-1 min-h-0 relative">
          
          {/* TAB 0: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 animate-[fadeIn_0.2s_ease-out]">
              <div className="space-y-1">
                <h1 className="text-xl font-bold tracking-tight text-neutral-900">ホスティング・オーバービュー</h1>
                <p className="text-neutral-500 text-xs">現在稼働しているサーバー、モックAPIの一覧およびアクセス統計情報です。</p>
              </div>

              {/* Key Metrics row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white border border-neutral-200/80 rounded-xl p-5 space-y-1 shadow-sm">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">総訪問者数 (Views)</p>
                  <p className="text-2xl font-extrabold text-neutral-900 font-mono tracking-tight tabular-nums">
                    {totalViews.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white border border-neutral-200/80 rounded-xl p-5 space-y-1 shadow-sm">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">総サーバー数 (Hosts)</p>
                  <p className="text-2xl font-extrabold text-neutral-900 font-mono tracking-tight tabular-nums">
                    {totalHosts}
                  </p>
                </div>
                <div className="bg-white border border-neutral-200/80 rounded-xl p-5 space-y-1 shadow-sm">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">HTMLページホスト</p>
                  <p className="text-2xl font-extrabold text-neutral-900 font-mono tracking-tight tabular-nums">
                    {siteCount} <span className="text-xs font-sans font-medium text-neutral-400">sites</span>
                  </p>
                </div>
                <div className="bg-white border border-neutral-200/80 rounded-xl p-5 space-y-1 shadow-sm">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">モックAPIホスト</p>
                  <p className="text-2xl font-extrabold text-[#2563EB] font-mono tracking-tight tabular-nums">
                    {apiCount} <span className="text-xs font-sans font-medium text-neutral-400">APIs</span>
                  </p>
                </div>
              </div>

              {/* Quick Status / Activity Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Top Performing table */}
                <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden lg:col-span-2 shadow-sm">
                  <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
                    <h3 className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-neutral-500" />
                      <span>トップ・パフォーマンス (訪問者順)</span>
                    </h3>
                  </div>
                  <div className="overflow-x-auto text-xs">
                    {historyPages.length === 0 ? (
                      <div className="p-8 text-center text-neutral-400">まだ稼働中のサーバーはありません。「新規作成」からホストしてください。</div>
                    ) : (
                      <table className="w-full text-left">
                        <thead className="bg-neutral-50 border-b border-neutral-100 text-neutral-400 font-semibold">
                          <tr>
                            <th className="p-3">サーバー / タイトル</th>
                            <th className="p-3">エンドポイント / Slug</th>
                            <th className="p-3">タイプ</th>
                            <th className="p-3 text-right">アクセス数</th>
                            <th className="p-3 text-center">有効状態</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {historyPages.slice(0, 5).map((page) => {
                            const publicPath = page.slug || page.id;
                            const pathUrl = page.type === 'api' 
                              ? `/mock/${publicPath}` 
                              : `/p/${publicPath}`;
                            return (
                              <tr key={page.id} className="hover:bg-neutral-50/40">
                                <td className="p-3">
                                  <p className="font-bold text-neutral-900 truncate max-w-[140px]">{page.title}</p>
                                </td>
                                <td className="p-3 font-mono text-[10px] text-neutral-500 truncate max-w-[160px]" title={pathUrl}>
                                  {pathUrl}
                                </td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${page.type === 'api' ? 'bg-blue-50 text-blue-700 border border-blue-150' : 'bg-neutral-100 text-neutral-800'}`}>
                                    {page.type === 'api' ? `${page.apiMethod || 'GET'} API` : 'Website'}
                                  </span>
                                </td>
                                <td className="p-3 text-right font-mono font-bold text-neutral-600 tabular-nums">
                                  {page.views}
                                </td>
                                <td className="p-3 text-center">
                                  <button 
                                    onClick={() => handleToggleStatus(page.id, page.status)}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${page.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-neutral-50 text-neutral-400 border border-neutral-200'}`}
                                    title="クリックして有効/無効切り替え"
                                  >
                                    {page.status === 'active' ? '稼働中' : '停止中'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* Developer system status card */}
                <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">ホストサーバー・ステータス</h3>
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-500">アクティブ稼働率:</span>
                        <span className="font-bold font-mono text-emerald-600">
                          {totalHosts > 0 ? `${Math.round((activeCount / totalHosts) * 100)}%` : '0%'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-500">データベース領域:</span>
                        <span className="font-bold text-neutral-700">Firestore (永久保証)</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-500">インジェクション変数:</span>
                        <span className="font-bold text-neutral-700">window.ENV 自動対応</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-neutral-50 border border-neutral-100 rounded-xl space-y-2 text-xs">
                    <p className="font-bold text-neutral-800 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-neutral-500" />
                      <span>クイックサーバー作成</span>
                    </p>
                    <p className="text-neutral-500 text-[11px] leading-relaxed">
                      「新規作成」タブより、即座に環境変数付きサイトやモックAPIをカスタムSlug付きでデプロイできます。
                    </p>
                    <button 
                      onClick={() => setActiveTab('canvas')}
                      className="w-full mt-1.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded text-[11px] transition-colors cursor-pointer"
                    >
                      サーバーを新規デプロイ
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 1: CANVAS - EDIT AND BUILD */}
          {activeTab === 'canvas' && (
            <div className="absolute inset-0 flex flex-col min-h-0 bg-white">
              
              {/* Type Switcher Bar */}
              <div className="h-11 border-b border-neutral-200/80 px-4 flex items-center gap-1.5 bg-neutral-50 shrink-0">
                <button 
                  onClick={() => setDeployType('site')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${deployType === 'site' ? 'bg-white text-neutral-900 border border-neutral-200' : 'text-neutral-400 hover:text-neutral-700'}`}
                >
                  🌐 HTML ウェブサイトホスティング
                </button>
                <button 
                  onClick={() => setDeployType('api')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${deployType === 'api' ? 'bg-white text-[#2563EB] border border-blue-200' : 'text-neutral-400 hover:text-[#2563EB]'}`}
                >
                  ⚡ モック JSON API サーバー作成
                </button>
              </div>

              {/* Settings / Upload strip panel */}
              <div className="bg-[#FAF9FA] border-b border-neutral-200/80 p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">サーバー/サイトタイトル</label>
                  <input 
                    type="text" 
                    value={pageTitle}
                    onChange={(e) => setPageTitle(e.target.value)}
                    placeholder={deployType === 'api' ? "マイ・モックAPI" : "マイ・ウェブサイト"}
                    className="w-full px-3 py-1.5 bg-white border border-neutral-200 rounded-md text-neutral-900 text-xs focus:outline-none focus:border-neutral-400 focus:ring-0 transition-colors"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    {deployType === 'api' ? 'APIの説明文' : '共有時の説明文'}
                  </label>
                  <input 
                    type="text" 
                    value={pageDesc}
                    onChange={(e) => setPageDesc(e.target.value)}
                    placeholder="PageHostでホストされているページです。"
                    className="w-full px-3 py-1.5 bg-white border border-neutral-200 rounded-md text-neutral-900 text-xs focus:outline-none focus:border-neutral-400 focus:ring-0 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
                    <span>カスタム URL Slug (任意)</span>
                    <span className="text-[9px] text-neutral-400 font-normal">例: quiz/home</span>
                  </label>
                  <div className="flex items-center bg-white border border-neutral-200 rounded-md overflow-hidden">
                    <span className="px-2.5 py-1 text-xs bg-neutral-50 text-neutral-400 border-r border-neutral-200">
                      /p/
                    </span>
                    <input 
                      type="text" 
                      value={customSlug}
                      onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_\-\/]/g, ''))}
                      placeholder="quiz/home"
                      className="w-full px-3 py-1 bg-white border-0 text-neutral-900 text-xs focus:outline-none focus:ring-0"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> アクセス制限
                    </label>
                    <input 
                      type="checkbox" 
                      checked={hasPassword}
                      onChange={(e) => setHasPassword(e.target.checked)}
                      className="rounded border-neutral-300 bg-white text-neutral-900 focus:ring-0 cursor-pointer"
                    />
                  </div>
                  <input 
                    type="password" 
                    value={password}
                    disabled={!hasPassword}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={hasPassword ? "パスワードを入力..." : "パスワード無効"}
                    className="w-full px-3 py-1.5 bg-white disabled:bg-neutral-100/50 disabled:text-neutral-400 border border-neutral-200 rounded-md text-neutral-900 text-xs focus:outline-none focus:border-neutral-400 focus:ring-0 transition-colors"
                  />
                </div>
              </div>

              {/* Advanced settings strip (Uploads for sites, HTTP Methods for APIs) */}
              <div className="bg-neutral-50 border-b border-neutral-200 px-4 py-3 flex flex-wrap gap-4 items-center justify-between text-xs text-neutral-600">
                {deployType === 'site' ? (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">ステータス:</span>
                      <select 
                        value={deployStatus} 
                        onChange={(e: any) => setDeployStatus(e.target.value)}
                        className="bg-white border border-neutral-200 rounded px-2 py-1 text-xs"
                      >
                        <option value="active">稼働中 (Active)</option>
                        <option value="inactive">停止中 (Inactive)</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-neutral-300">|</span>
                      <Upload className="w-3.5 h-3.5 text-neutral-400" />
                      <span className="font-semibold text-[11px]">ZIP or フォルダ読み込み:</span>
                      <label className="px-2 py-1 bg-white hover:bg-neutral-100 border border-neutral-200 rounded text-[11px] font-bold cursor-pointer text-neutral-700">
                        ZIPを指定
                        <input type="file" accept=".zip" onChange={handleZipUpload} className="hidden" />
                      </label>
                      <button 
                        onClick={() => folderInputRef.current?.click()}
                        className="px-2 py-1 bg-white hover:bg-neutral-100 border border-neutral-200 rounded text-[11px] font-bold text-neutral-700 cursor-pointer"
                      >
                        フォルダ構造ごと指定
                      </button>
                      <input 
                        ref={folderInputRef}
                        type="file" 
                        webkitdirectory="" 
                        directory="" 
                        multiple 
                        onChange={handleFolderUpload} 
                        className="hidden" 
                        {...{ webkitdirectory: "", directory: "" } as any}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">許可する HTTP メソッド:</span>
                      <select 
                        value={apiMethod} 
                        onChange={(e) => setApiMethod(e.target.value)}
                        className="bg-white border border-neutral-200 rounded px-2 py-1 text-xs font-bold text-[#2563EB]"
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                        <option value="ANY">ANY (すべてのメソッド)</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">有効状態:</span>
                      <select 
                        value={deployStatus} 
                        onChange={(e: any) => setDeployStatus(e.target.value)}
                        className="bg-white border border-neutral-200 rounded px-2 py-1 text-xs"
                      >
                        <option value="active">有効稼働 (Active)</option>
                        <option value="inactive">無効停止 (Inactive)</option>
                      </select>
                    </div>
                  </div>
                )}

                {attachedFiles.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>ホスト対象アセット : <strong>{attachedFiles.length}個</strong> (Index: index.html)</span>
                  </div>
                )}
              </div>

              {/* Environment Variable Input Sub-strip panel (KEY-VALUE Store) */}
              <div className="bg-[#FCFCFD] border-b border-neutral-200 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="text-xs font-bold text-neutral-700">環境変数 (Secrets & Environment Variables) 設定</span>
                  <span className="text-[10px] text-neutral-400">※デプロイしたHTMLの window.ENV からセキュアに取得できます（例: window.ENV.API_KEY）</span>
                </div>
                
                <div className="flex flex-wrap gap-2 items-center">
                  <input 
                    type="text" 
                    value={envKeyInput}
                    onChange={(e) => setEnvKeyInput(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                    placeholder="変数名 (例: API_KEY)"
                    className="px-2.5 py-1.5 bg-white border border-neutral-200 rounded-md text-xs focus:outline-none w-48 font-mono"
                  />
                  <input 
                    type="text" 
                    value={envValInput}
                    onChange={(e) => setEnvValInput(e.target.value)}
                    placeholder="値 (例: azaSyB...)"
                    className="px-2.5 py-1.5 bg-white border border-neutral-200 rounded-md text-xs focus:outline-none w-64"
                  />
                  <button 
                    onClick={handleAddEnvPair}
                    className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-lg text-xs cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>変数追加</span>
                  </button>
                </div>

                {/* Environment Variables Chip list */}
                {envPairs.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {envPairs.map((pair) => (
                      <div key={pair.key} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 border border-neutral-200 rounded-lg text-[11px] font-mono">
                        <span className="text-neutral-500 font-bold">{pair.key}:</span>
                        <span className="text-neutral-800 font-medium truncate max-w-[120px]" title={pair.value}>{pair.value}</span>
                        <button 
                          onClick={() => handleRemoveEnvPair(pair.key)}
                          className="text-neutral-400 hover:text-rose-600 transition-colors ml-1 font-sans font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Main Split-Screen Workstation */}
              <div className="flex-1 flex flex-col md:flex-row min-h-0">
                
                {/* Editor Container Panel */}
                <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-neutral-200/80 flex flex-col min-h-[300px] md:min-h-0 bg-white">
                  <div className="h-9 border-b border-neutral-200/60 px-4 flex items-center justify-between bg-[#FCFCFD] shrink-0">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-3.5 h-3.5 text-neutral-400" />
                      <span className="text-xs font-bold text-neutral-600">
                        {deployType === 'site' ? 'index.html (HTMLコード)' : 'api_response.json (返却JSONデータ)'}
                      </span>
                    </div>
                    {deployType === 'site' && (
                      <button 
                        onClick={() => setPreviewKey(prev => prev + 1)}
                        className="text-[10px] font-bold text-neutral-500 hover:text-neutral-900 transition-colors"
                      >
                        プレビュー同期
                      </button>
                    )}
                  </div>

                  {/* HTML raw code field / API JSON Response field */}
                  <div className="flex-1 relative font-mono text-xs">
                    <textarea 
                      value={deployType === 'site' ? htmlCode : apiResponse}
                      onChange={(e) => {
                        if (deployType === 'site') {
                          setHtmlCode(e.target.value);
                        } else {
                          setApiResponse(e.target.value);
                        }
                      }}
                      className="absolute inset-0 w-full h-full p-4 bg-white text-neutral-800 outline-none resize-none overflow-y-auto leading-relaxed border-0 focus:ring-0 focus:outline-none font-mono"
                      style={{ tabSize: 2 }}
                    />
                  </div>

                  {/* Gemini AI Optimization Panel */}
                  <div className="border-t border-neutral-200 p-4 bg-[#FCFCFD] shrink-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-neutral-800" />
                          <span>AI Assistant (Gemini v3.8 Flash)</span>
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          {deployType === 'site' ? 'デザイン・機能自動記述' : 'JSONレスポンス構造の生成'}
                        </span>
                      </div>
                      
                      <div className="relative">
                        <textarea 
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          placeholder={deployType === 'site' 
                            ? "どのようなサイトにしますか？ (例: 「ホワイト調の洗練されたクイズLPを作って」)" 
                            : "どのようなAPIレスポンスにしますか？ (例: 「ダミーの製品データが10件入ったJSONを作って」)"}
                          rows={2}
                          className="w-full pr-12 pl-4 py-3 bg-white border border-neutral-200 rounded-xl text-neutral-800 text-xs placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 resize-none leading-relaxed shadow-none"
                        />
                        <div className="absolute right-3 bottom-3 flex items-center gap-1.5">
                          <button 
                            onClick={() => handleAIImprove(aiPrompt)}
                            disabled={isGenerating || !aiPrompt.trim()}
                            className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg disabled:opacity-30 disabled:bg-neutral-200 transition-colors cursor-pointer flex items-center justify-center"
                            title="AIを実行"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Panel: Sandbox iFrame (Sites) or Endpoint Details Mock Test (APIs) */}
                <div className="w-full md:w-1/2 flex flex-col min-h-[300px] md:min-h-0 bg-neutral-50">
                  <div className="h-9 border-b border-neutral-200/60 px-4 flex items-center justify-between bg-[#FCFCFD] shrink-0">
                    <div className="flex items-center gap-2">
                      <Eye className="w-3.5 h-3.5 text-neutral-400" />
                      <span className="text-xs font-bold text-neutral-600">
                        {deployType === 'site' ? 'リアルタイム・プレビュー' : 'モックAPIドキュメント & テスト'}
                      </span>
                    </div>
                  </div>

                  {deployType === 'site' ? (
                    <div className="flex-1 bg-white relative">
                      <iframe 
                        ref={previewFrameRef}
                        title="PageHost Live Preview Sandbox"
                        className="absolute inset-0 w-full h-full border-0 bg-white"
                        sandbox="allow-scripts allow-modals allow-popups"
                      />
                    </div>
                  ) : (
                    /* API Test and Tutorial Screen */
                    <div className="flex-1 p-6 space-y-6 overflow-y-auto text-xs bg-neutral-50">
                      <div className="bg-white border border-neutral-200 p-5 rounded-xl space-y-4 shadow-none">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">ホスト後のリクエストURL</span>
                          <div className="p-3 bg-neutral-50 rounded-lg font-mono text-neutral-600 text-xs border border-neutral-200 flex items-center justify-between overflow-x-auto whitespace-nowrap">
                            <span>{window.location.origin}/mock/{customSlug.trim() || editingId || '【自動生成API_ID】'}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">クライアント（HTMLページ）からのフェッチ例 (JS)</span>
                          <pre className="p-4 bg-neutral-900 text-white rounded-lg font-mono text-[11px] overflow-x-auto leading-relaxed">
{`// モックAPIからデータを非同期ロードするJSコード
fetch('${window.location.origin}/mock/${customSlug.trim() || editingId || 'my-api'}', {
  method: '${apiMethod}'
})
.then(response => response.json())
.then(data => {
  console.log("読み込んだモックデータ:", data);
  // あなたのHTML上にデータをバインド表示するロジック
})
.catch(error => console.error("データ取得失敗:", error));`}
                          </pre>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-2 text-neutral-700">
                        <h4 className="font-bold flex items-center gap-1.5 text-blue-900">
                          <Server className="w-4 h-4 text-blue-500" />
                          モックAPIサーバーの特徴
                        </h4>
                        <p className="leading-relaxed text-[11px] text-blue-800">
                          作成されたモックAPIは、CORS（オリジン間リソース共有）に対応しているため、どのHTMLサイトからでも直接 `fetch` で叩き、完全に双方向な動的プロトタイプを作るデータサーバーとして永久活用できます。
                        </p>
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: SERVERS LIST / HISTORY */}
          {activeTab === 'history' && (
            <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 animate-[fadeIn_0.2s_ease-out]">
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight text-neutral-900">サーバー & API 管理一覧</h2>
                <p className="text-neutral-500 text-xs">デプロイ済みHTMLサーバー、モックAPIの統合管理。Slugパス、有効状態をオンタイムで制御可能です。</p>
              </div>

              {isLoadingHistory ? (
                <div className="py-20 text-center space-y-3">
                  <div className="animate-spin inline-block w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full"></div>
                  <p className="text-neutral-400 text-xs">リスト同期中...</p>
                </div>
              ) : historyPages.length === 0 ? (
                <div className="border border-neutral-200 rounded-2xl bg-white p-12 text-center space-y-5 max-w-xl mx-auto shadow-sm">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-50 border border-neutral-200 text-neutral-400">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-neutral-900 font-bold text-sm">デプロイ済みのサーバーがありません</h3>
                    <p className="text-neutral-400 text-xs leading-relaxed">
                      「新規作成」画面でHTMLまたはモックAPIレスポンスを構成して公開してみましょう！
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('canvas')}
                    className="inline-flex px-4 py-2 bg-neutral-900 text-white font-bold text-xs rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    キャンバスを開く
                  </button>
                </div>
              ) : (
                <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-400 font-bold">
                          <th className="p-4">サーバー名 / OGP記述</th>
                          <th className="p-4">デプロイURL</th>
                          <th className="p-4">タイプ</th>
                          <th className="p-4 text-center">有効状態</th>
                          <th className="p-4 text-right">アクセス数</th>
                          <th className="p-4">作成日</th>
                          <th className="p-4 text-right">アクション</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {historyPages.map((page) => {
                          const publicPath = page.slug || page.id;
                          const publicUrl = page.type === 'api' 
                            ? `${window.location.origin}/mock/${publicPath}`
                            : `${window.location.origin}/p/${publicPath}`;
                          
                          return (
                            <tr key={page.id} className="hover:bg-neutral-50/50 transition-colors">
                              <td className="p-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <p className="font-bold text-neutral-900">{page.title}</p>
                                    {page.hasPassword && (
                                      <span title="パスワード保護中">
                                        <LockKeyhole className="w-3.5 h-3.5 text-amber-500" />
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-neutral-400 text-[10px] max-w-[200px] truncate">{page.description}</p>
                                </div>
                              </td>
                              <td className="p-4 font-mono text-[11px]">
                                <div className="flex items-center gap-1.5 text-neutral-500">
                                  <span className="truncate max-w-[180px]">{publicUrl}</span>
                                  <button 
                                    onClick={() => handleCopyText(publicUrl, page.id)}
                                    className="p-1 hover:text-neutral-900 transition-colors cursor-pointer shrink-0"
                                    title="コピー"
                                  >
                                    {copySuccess === page.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${page.type === 'api' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-neutral-100 text-neutral-800'}`}>
                                  {page.type === 'api' ? `${page.apiMethod || 'GET'} API` : 'Website'}
                                </span>
                              </td>
                              <td className="p-4 text-center">
                                <button 
                                  onClick={() => handleToggleStatus(page.id, page.status)}
                                  className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer inline-flex items-center gap-1 ${page.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-neutral-50 text-neutral-400 border border-neutral-200'}`}
                                  title="状態を切り替え"
                                >
                                  <Power className="w-3 h-3" />
                                  <span>{page.status === 'active' ? 'Active' : 'Inactive'}</span>
                                </button>
                              </td>
                              <td className="p-4 text-right font-mono font-bold text-neutral-600 tabular-nums">
                                {page.views}
                              </td>
                              <td className="p-4 text-neutral-400 text-[10px] font-mono whitespace-nowrap">
                                {new Date(page.createdAt).toLocaleDateString('ja-JP')}
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button 
                                    onClick={() => handleLoadToEdit(page.id)}
                                    className="p-1.5 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-all text-neutral-500 cursor-pointer inline-flex items-center justify-center gap-1"
                                    title="編集"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-bold hidden sm:inline">編集</span>
                                  </button>
                                  <a 
                                    href={page.type === 'api' ? `/mock/${publicPath}` : `/p/${publicPath}`}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-1.5 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-all text-neutral-500 inline-flex items-center justify-center"
                                    title="開く"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                  <button 
                                    onClick={() => handleDeletePage(page.id)}
                                    className="p-1.5 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all text-neutral-400 cursor-pointer inline-flex items-center justify-center"
                                    title="削除"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DESIGN PRESETS */}
          {activeTab === 'templates' && (
            <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 animate-[fadeIn_0.2s_ease-out]">
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight text-neutral-900">プリセットテンプレート</h2>
                <p className="text-neutral-500 text-xs">ワンクリックで読み込み、自由にアレンジして公開できるホワイトベースのプロフェッショナルコード。</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {TEMPLATES.map((tpl) => (
                  <div key={tpl.id} className="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col justify-between hover:border-neutral-300 transition-all space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-800 shrink-0">
                          {tpl.id === 'portfolio' ? <FileCode className="w-4 h-4" /> : <Terminal className="w-4 h-4" />}
                        </div>
                        <h3 className="text-neutral-900 font-bold text-sm">{tpl.name}</h3>
                      </div>
                      <p className="text-neutral-500 text-xs leading-relaxed">{tpl.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                      <span className="text-[10px] font-mono text-neutral-400">Tailwind CSS + Pure JavaScript</span>
                      <button 
                        onClick={() => handleLoadTemplate(tpl.html)}
                        className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        キャンバスに適用
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: MANUAL GUIDE */}
          {activeTab === 'docs' && (
            <div className="p-6 md:p-12 max-w-3xl mx-auto space-y-10 bg-white my-8 rounded-2xl border border-neutral-200 animate-[fadeIn_0.2s_ease-out]">
              <div className="space-y-2 pb-6 border-b border-neutral-200">
                <div className="inline-flex items-center gap-1.5 text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Manual & Guide</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900">PageHost 操作マニュアル</h1>
                <p className="text-neutral-500 text-sm leading-relaxed">PageHostを120%活用して、高品質なウェブサイト、モックJSON APIサーバーを構築・ホスティングする方法を解説します。</p>
              </div>

              <div className="space-y-8">
                
                <section className="space-y-2">
                  <h3 className="text-neutral-900 font-bold text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-700 flex items-center justify-center text-[10px] font-bold font-mono">1</span>
                    自由な URL Slug パス変更（例: quiz/home）
                  </h3>
                  <div className="pl-7 space-y-1.5 text-xs text-neutral-500 leading-relaxed">
                    <p>サーバー公開時に「カスタム URL Slug」を任意で設定できます。</p>
                    <p>スラッシュを含めた階層パス（例: `quiz/home`）も完璧にサポート。公開されるURLは、`/p/quiz/home` という非常に美しいフォーマットになります。同じプロジェクトの中に複数の関連ページを配置したい時に便利です。</p>
                  </div>
                </section>

                <section className="space-y-2">
                  <h3 className="text-neutral-900 font-bold text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-700 flex items-center justify-center text-[10px] font-bold font-mono">2</span>
                    モック JSON API サーバーの構築
                  </h3>
                  <div className="pl-7 space-y-1.5 text-xs text-neutral-500 leading-relaxed">
                    <p>Website に加え、JSONデータを直接レスポンスする「モックAPIサーバー」をその場で作ることができます。</p>
                    <p>メソッド（GET / POST など）を指定し、返却するJSONを設定すれば、即座に外部から `fetch` で叩けるモックAPIとして機能します。作成したHTMLとモックAPIを同一のPageHost上で組み合わせることで、完全なフロントエンド＋バックエンド同期プロトタイプが開発可能です。</p>
                  </div>
                </section>

                <section className="space-y-2">
                  <h3 className="text-neutral-900 font-bold text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-700 flex items-center justify-center text-[10px] font-bold font-mono">3</span>
                    インジェクション環境変数とAPIキー管理
                  </h3>
                  <div className="pl-7 space-y-1.5 text-xs text-neutral-500 leading-relaxed">
                    <p>デプロイ時に「環境変数 (Environment Variables)」を設定すると、公開サイトの JavaScript から <strong className="text-neutral-900">window.ENV.WEATHER_API_KEY</strong> などのように、変数として安全にAPIキーやシークレットを読み取ることができます。</p>
                    <p>さらに、「グローバル設定」にあなた独自の Gemini APIキー（AIzaSy...）を登録すると、無料枠の上限を気にすることなく、AI自動改善アシスタントを無限に使い倒すことができます！</p>
                  </div>
                </section>

              </div>
            </div>
          )}

          {/* TAB 5: GLOBAL SYSTEM SETTINGS (Custom Gemini API Keys / Secrets) */}
          {activeTab === 'settings' && (
            <div className="p-6 md:p-12 max-w-2xl mx-auto space-y-8 bg-white my-8 rounded-2xl border border-neutral-200 animate-[fadeIn_0.2s_ease-out]">
              <div className="space-y-2 pb-6 border-b border-neutral-200">
                <div className="inline-flex items-center gap-1.5 text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                  <KeyRound className="w-4 h-4 text-neutral-500" />
                  <span>Secrets & API Keys</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900">環境設定 & APIキー登録</h1>
                <p className="text-neutral-500 text-sm leading-relaxed">
                  PageHost での AI 構築機能を最適化するためのシステムシークレット（APIキー）を構成します。このキーはブラウザに安全にキャッシュされ、サーバーのクォータ制限を超えた場合でも独自のキーで無制限に稼働させることができます。
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">システム用 Gemini API キー (AIzaSy...)</label>
                    <span className="text-[10px] text-neutral-400">※ご自身のGoogle AI Studio Secrets Keyを指定します</span>
                  </div>

                  <div className="relative flex items-center">
                    <input 
                      type={showGeminiKey ? "text" : "password"} 
                      value={systemGeminiKey}
                      onChange={(e) => setSystemGeminiKey(e.target.value)}
                      placeholder="AIzaSy..." 
                      className="w-full pl-4 pr-12 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 font-mono text-xs focus:outline-none focus:border-neutral-400"
                    />
                    <button 
                      onClick={() => setShowGeminiKey(!showGeminiKey)}
                      className="absolute right-3 p-1.5 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                    >
                      {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {systemGeminiKey.trim() ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-emerald-950">
                      <Check className="w-4 h-4 text-emerald-600" />
                      ご自身の API キーがセットアップされました
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      これより PageHost 内での AI 新規生成・改善リクエストは、すべて独自の Gemini クォータを使用して最優先で無制限に稼働します。
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-neutral-50 border border-neutral-100 text-neutral-600 rounded-xl text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-neutral-800">システムデフォルトの共有キーで稼働中</p>
                      <p className="text-[11px] text-neutral-500 leading-relaxed">
                        APIキーを設定しない場合は、PageHost 共有の Gemini API キーが適用されます（アクセス数過多により一時的に混雑する場合があります）。安定して無制限に使いたい場合は API キーの登録を推奨します。
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* AI PROCESSING OVERLAY */}
      {isGenerating && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-[999] flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full space-y-6">
            <div className="relative inline-flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-neutral-100 opacity-75"></span>
              <div className="w-16 h-16 rounded-2xl bg-neutral-50 border border-neutral-200 text-neutral-900 flex items-center justify-center shadow-sm">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <h3 className="text-neutral-900 font-extrabold text-base">PageHost Engine</h3>
              <p className="text-neutral-500 text-xs min-h-[16px]">{generatingMessage}</p>
            </div>
            
            <div className="w-40 h-1 bg-neutral-100 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-neutral-900 animate-[shimmer_2.5s_infinite] w-1/2 rounded-full"></div>
            </div>
          </div>
        </div>
      )}

      {/* DEPLOY SUCCESS MODAL */}
      {deployResult && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 w-full max-w-md rounded-2xl p-8 space-y-6 shadow-2xl relative">
            <button 
              onClick={() => { setDeployResult(null); fetchHistory(); }}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer"
            >
              ✕
            </button>

            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 mb-2">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h3 className="text-neutral-900 font-extrabold text-lg tracking-tight">
                {deployResult.isUpdate ? 'サーバーを更新しました' : 'サーバー公開に成功しました'}
              </h3>
              <p className="text-neutral-500 text-xs">あなたのWebサイトはライブ公開中であり、今すぐアクセス可能です。</p>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">公開サーバー / API URL</span>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={deployResult.url} 
                    className="w-full bg-transparent text-neutral-900 text-xs font-mono border-0 focus:ring-0 p-0 overflow-x-auto focus:outline-none"
                  />
                  <button 
                    onClick={() => handleCopyText(deployResult.url, 'success-copy')}
                    className="p-1 hover:text-neutral-900 text-neutral-400 transition-colors cursor-pointer shrink-0"
                    title="コピー"
                  >
                    {copySuccess === 'success-copy' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              
              <div className="h-px bg-neutral-200"></div>

              <div className="flex items-center justify-between text-[10px] font-semibold text-neutral-400">
                <span>サーバーID: <strong className="font-mono text-neutral-700">{deployResult.id}</strong></span>
                {deployType === 'api' ? (
                  <span className="text-[#2563EB] font-bold">⚡ MOCK API</span>
                ) : hasPassword ? (
                  <span className="text-amber-600 font-bold flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> 限定公開中
                  </span>
                ) : (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> パブリック公開中
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2 text-xs font-bold">
              <button 
                onClick={() => { setDeployResult(null); fetchHistory(); }}
                className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors cursor-pointer"
              >
                キャンバスに戻る
              </button>
              <a 
                href={deployResult.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-center transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>公開URLを開く</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
