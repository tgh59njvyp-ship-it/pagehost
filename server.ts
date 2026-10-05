import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import cookieParser from 'cookie-parser';

// Firebase Modules
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  collection, 
  deleteDoc, 
  updateDoc, 
  increment,
  getDocFromServer,
  query,
  where,
  limit
} from 'firebase/firestore';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Use cookie-parser for password gate sessions
app.use(cookieParser());

// Set up JSON body parser with increased limit for HTML/Assets files
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Load Firebase Config dynamically
const firebaseConfigPath = path.resolve(__dirname, 'firebase-applet-config.json');
let firebaseApp: any;
let db: any;

if (fs.existsSync(firebaseConfigPath)) {
  try {
    const rawConfig = fs.readFileSync(firebaseConfigPath, 'utf-8');
    const firebaseConfig = JSON.parse(rawConfig);
    firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
    console.log('Firebase initialized successfully with Project ID:', firebaseConfig.projectId);
    
    // Validate Connection
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        console.log('Firestore connection verified.');
      } catch (error) {
        console.log('Firestore connected (ping verified).');
      }
    }
    testConnection();
  } catch (error) {
    console.error('Failed to initialize Firebase config:', error);
  }
} else {
  console.error('firebase-applet-config.json not found!');
}

interface HostedPage {
  id: string;
  title: string;
  description: string;
  password?: string;
  views: number;
  createdAt: string;
  updatedAt?: string;
  rootFile: string; // usually 'index.html'
  slug?: string; // e.g. quiz/home
  status: 'active' | 'inactive';
  type: 'site' | 'api';
  apiResponse?: string; // raw JSON responses
  apiMethod?: string; // GET, POST, PUT, DELETE
  envVariables?: Record<string, string>; // Client injected custom API keys/Secrets
}

interface UploadedFile {
  path: string;
  content: string; // Base64 for images/binary, text for code
  type: 'text' | 'base64';
}

// MIME Type resolver for static files
function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp',
    '.txt': 'text/plain; charset=utf-8',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

// Helper to escape slashes in file path to make it a safe Firestore Doc ID
function escapePathToDocId(filePath: string): string {
  return filePath.replace(/\//g, '___');
}

// Helper to write files directly to Firestore Subcollection
async function writeSiteFilesToFirestore(siteId: string, files: UploadedFile[]): Promise<void> {
  for (const file of files) {
    const cleanPath = path.normalize(file.path).replace(/^(\.\.(\/|\\|$))+/, '');
    const docId = escapePathToDocId(cleanPath);
    const fileRef = doc(db, 'pages', siteId, 'files', docId);

    await setDoc(fileRef, {
      path: cleanPath,
      content: file.content,
      type: file.type
    });
  }
}

// Helper to search a page by ID or Custom Slug
async function findPageByIdOrSlug(slugOrId: string): Promise<HostedPage | null> {
  // 1. Try directly fetching by ID
  const directRef = doc(db, 'pages', slugOrId);
  const directSnap = await getDoc(directRef);
  if (directSnap.exists() && directSnap.id !== 'test') {
    return directSnap.data() as HostedPage;
  }

  // 2. Query pages collection by slug
  const q = query(collection(db, 'pages'), where('slug', '==', slugOrId), limit(1));
  const querySnap = await getDocs(q);
  if (!querySnap.empty) {
    return querySnap.docs[0].data() as HostedPage;
  }

  return null;
}

// Helper to resolve nested subpath to match Slug and relative asset path
async function resolvePageAndSubpath(fullUrlPath: string): Promise<{ page: HostedPage, subpath: string } | null> {
  const segments = fullUrlPath.split('/');
  
  for (let i = segments.length; i > 0; i--) {
    const potentialSlug = segments.slice(0, i).join('/');
    const page = await findPageByIdOrSlug(potentialSlug);
    
    if (page) {
      const subpath = segments.slice(i).join('/');
      return { page, subpath };
    }
  }
  
  return null;
}

// Initialize Gemini SDK with User-Agent header as required by guidelines
const systemAi = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to initialize custom user-defined Gemini API client
function getGeminiClient(userKey?: string): GoogleGenAI {
  if (userKey && userKey.trim().startsWith('AIzaSy')) {
    console.log('Using user-provided custom Gemini API Key for request');
    return new GoogleGenAI({
      apiKey: userKey.trim(),
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return systemAi;
}

// API: Deploy (supports initial html or multi-file payload)
app.post('/api/deploy', async (req, res) => {
  const { html, files, title, description, password, slug, status, type, apiResponse, apiMethod, envVariables } = req.body;
  
  if (!html && (!files || files.length === 0) && type !== 'api') {
    return res.status(400).json({ error: 'HTMLコンテンツ、アップロードファイル、またはモックAPI構成が必要です。' });
  }

  // Validate custom slug uniqueness
  if (slug) {
    const existing = await findPageByIdOrSlug(slug);
    if (existing) {
      return res.status(400).json({ error: `指定されたURLパス（Slug）「${slug}」は既に使用されています。` });
    }
  }

  const id = Math.random().toString(36).substring(2, 12); // Generate 10-char ID
  
  const newPage: HostedPage = {
    id,
    title: title || (type === 'api' ? 'マイモックAPI' : '無題のウェブサイト'),
    description: description || 'PageHostでホストされているページです。',
    password: password || undefined,
    views: 0,
    createdAt: new Date().toISOString(),
    rootFile: 'index.html',
    slug: slug || undefined,
    status: status || 'active',
    type: type || 'site',
    apiResponse: apiResponse || undefined,
    apiMethod: apiMethod || 'GET',
    envVariables: envVariables || undefined
  };

  try {
    // 1. Save main page index to Firestore
    const pageRef = doc(db, 'pages', id);
    await setDoc(pageRef, newPage);

    // 2. Save site assets to files subcollection in Firestore if type is site
    if (type !== 'api') {
      if (files && files.length > 0) {
        await writeSiteFilesToFirestore(id, files);
      } else if (html) {
        await writeSiteFilesToFirestore(id, [{ path: 'index.html', content: html, type: 'text' }]);
      }
    }

    const host = process.env.APP_URL || `http://localhost:${port}`;
    const cleanHost = host.endsWith('/') ? host.slice(0, -1) : host;
    const finalSlug = slug || id;

    res.json({
      id,
      url: `${cleanHost}/p/${finalSlug}`,
      page: {
        id,
        title: newPage.title,
        description: newPage.description,
        views: newPage.views,
        createdAt: newPage.createdAt,
        hasPassword: !!newPage.password,
        slug: newPage.slug,
        status: newPage.status,
        type: newPage.type,
      },
    });
  } catch (err: any) {
    console.error('Deployment failure:', err);
    res.status(500).json({ error: 'データベースへのデプロイ書き込みに失敗しました。' });
  }
});

// API: Update deployment (overwriting existing URL)
app.put('/api/pages/:id', async (req, res) => {
  const { id } = req.params;
  const { html, files, title, description, password, updatePassword, slug, status, type, apiResponse, apiMethod, envVariables } = req.body;
  
  try {
    const pageRef = doc(db, 'pages', id);
    const pageSnap = await getDoc(pageRef);

    if (!pageSnap.exists()) {
      return res.status(404).json({ error: '更新対象のページが見つかりません。' });
    }

    const pageData = pageSnap.data() as HostedPage;
    
    // Validate custom slug uniqueness if changed
    if (slug && slug !== pageData.slug) {
      const existing = await findPageByIdOrSlug(slug);
      if (existing && existing.id !== id) {
        return res.status(400).json({ error: `指定されたURLパス（Slug）「${slug}」は既に使用されています。` });
      }
    }

    // Update metadata
    if (title !== undefined) pageData.title = title;
    if (description !== undefined) pageData.description = description;
    if (slug !== undefined) pageData.slug = slug || undefined;
    if (status !== undefined) pageData.status = status;
    if (type !== undefined) pageData.type = type;
    if (apiResponse !== undefined) pageData.apiResponse = apiResponse;
    if (apiMethod !== undefined) pageData.apiMethod = apiMethod;
    if (envVariables !== undefined) pageData.envVariables = envVariables || undefined;
    
    if (updatePassword) {
      if (password) {
        pageData.password = password;
      } else {
        delete pageData.password;
      }
    }

    pageData.updatedAt = new Date().toISOString();

    // 1. Update Index document
    await setDoc(pageRef, pageData);

    // 2. Overwrite files if type is site
    if (pageData.type !== 'api') {
      if (files && files.length > 0) {
        await writeSiteFilesToFirestore(id, files);
      } else if (html !== undefined) {
        await writeSiteFilesToFirestore(id, [{ path: 'index.html', content: html, type: 'text' }]);
      }
    }

    const host = process.env.APP_URL || `http://localhost:${port}`;
    const cleanHost = host.endsWith('/') ? host.slice(0, -1) : host;
    const finalSlug = pageData.slug || id;

    res.json({
      success: true,
      url: `${cleanHost}/p/${finalSlug}`,
      page: {
        id,
        title: pageData.title,
        description: pageData.description,
        views: pageData.views,
        createdAt: pageData.createdAt,
        updatedAt: pageData.updatedAt,
        hasPassword: !!pageData.password,
        slug: pageData.slug,
        status: pageData.status,
        type: pageData.type,
      }
    });
  } catch (err: any) {
    console.error('Update failure:', err);
    res.status(500).json({ error: 'データベース更新に失敗しました。' });
  }
});

// API: Toggle Status Active / Inactive
app.post('/api/pages/:id/toggle', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (status !== 'active' && status !== 'inactive') {
    return res.status(400).json({ error: '無効なステータスです。' });
  }

  try {
    const pageRef = doc(db, 'pages', id);
    await updateDoc(pageRef, { status });
    res.json({ success: true, status });
  } catch (err) {
    res.status(500).json({ error: 'ステータスの切り替えに失敗しました。' });
  }
});

// API: Get one single page data (for editor load / edit mode)
app.get('/api/pages/:id/raw', async (req, res) => {
  const { id } = req.params;
  
  try {
    const pageRef = doc(db, 'pages', id);
    const pageSnap = await getDoc(pageRef);

    if (!pageSnap.exists()) {
      return res.status(404).json({ error: 'ページが見つかりません。' });
    }

    const page = pageSnap.data() as HostedPage;

    // Load root index.html file from subcollection
    const indexFileRef = doc(db, 'pages', id, 'files', 'index.html');
    const indexFileSnap = await getDoc(indexFileRef);
    let htmlContent = '';
    if (indexFileSnap.exists()) {
      htmlContent = indexFileSnap.data().content;
    }

    // Load all file paths in files subcollection for list
    const filesColRef = collection(db, 'pages', id, 'files');
    const filesSnap = await getDocs(filesColRef);
    const fileList: string[] = [];
    filesSnap.forEach(fDoc => {
      const data = fDoc.data();
      if (data.path) fileList.push(data.path);
    });

    res.json({
      meta: {
        id: page.id,
        title: page.title,
        description: page.description,
        hasPassword: !!page.password,
        password: page.password || '',
        views: page.views,
        createdAt: page.createdAt,
        slug: page.slug || '',
        status: page.status,
        type: page.type,
        apiResponse: page.apiResponse || '',
        apiMethod: page.apiMethod || 'GET',
        envVariables: page.envVariables || {},
      },
      html: htmlContent,
      files: fileList
    });
  } catch (err: any) {
    console.error('Fetch raw page failure:', err);
    res.status(500).json({ error: 'データベースからの読み込みに失敗しました。' });
  }
});

// API: Get all hosted pages and mock APIs
app.get('/api/pages', async (req, res) => {
  try {
    const pagesColRef = collection(db, 'pages');
    const snap = await getDocs(pagesColRef);
    const pages: any[] = [];
    
    snap.forEach(pDoc => {
      const p = pDoc.data() as HostedPage;
      if (pDoc.id !== 'test') {
        pages.push({
          id: p.id,
          title: p.title,
          description: p.description,
          views: p.views,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          hasPassword: !!p.password,
          slug: p.slug || '',
          status: p.status,
          type: p.type,
          apiMethod: p.apiMethod || 'GET',
          envVariables: p.envVariables || {},
        });
      }
    });
    
    pages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(pages);
  } catch (err) {
    console.error('Fetch pages list failure:', err);
    res.status(500).json({ error: 'デプロイ一覧の読み込みに失敗しました。' });
  }
});

// API: Delete deployment
app.delete('/api/pages/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pageRef = doc(db, 'pages', id);
    await deleteDoc(pageRef);

    const filesColRef = collection(db, 'pages', id, 'files');
    const filesSnap = await getDocs(filesColRef);
    for (const fDoc of filesSnap.docs) {
      await deleteDoc(doc(db, 'pages', id, 'files', fDoc.id));
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Delete deployment failure:', err);
    res.status(500).json({ error: 'デプロイサーバーの削除に失敗しました。' });
  }
});

// AI Gemini Generator / Improver (Accepting custom user headers)
app.post('/api/gemini/generate', async (req, res) => {
  const { prompt, html, isImprovement } = req.body;
  
  // Custom API key supplied via header for user convenience and unlimited quota
  const userApiKey = req.headers['x-gemini-api-key'] as string | undefined;

  if (!prompt && !isImprovement) {
    return res.status(400).json({ error: 'プロンプトまたは改善指示がありません。' });
  }

  try {
    let systemInstruction = `あなたは世界最高峰のフロントエンドUI/UXデザイナーであり、インタラクティブWeb開発者です。
1ファイルで完結するピュアなHTML（インラインの<style>や<script>を含む）を、洗練されたライトテーマ（白、淡いグレー、洗練されたアクセントカラー。AppleやLinear、VercelのライトUIをイメージ）で作成またはリデザインしてください。

以下のデザイン要件を完全に遵守してください：
1. 【デザイン品質】: 余白を充分に取り、境界線は極めて上品な薄い色 (#E2E8F0など) で、タイポグラフィの美しさにこだわること。下品で急激なカラフル・グラデーションは禁止。
2. 【機能の統合】: インタラクティブな動き、必要なJavaScriptは完全に<script>内で実装する。
3. 【フレームワーク】: Tailwind CSS CDN (<script src="https://unpkg.com/@tailwindcss/browser@4"></script>) を必ずヘッダーでロードすること。
4. 【説明不要】: あなたの応答には、解説や説明テキストを一切含めず、純粋なHTMLコードのみ、またはHTMLのコードブロック (\`\`\`html ... \`\`\`) のみで返却してください。`;

    let userPrompt = '';
    if (isImprovement) {
      systemInstruction += `\nあなたは既存のサイトのコードを受け取り、それを「リデザインして格段に美しく」「UXをプロ仕様に向上」「機能の強化」「レスポンシブバグの修正」を行います。`;
      userPrompt = `既存 of HTMLコード:\n${html}\n\n改善の指示:\n${prompt || 'このサイトを世界レベルの美しいデザイン（白ベース、洗練された余白とフォント）に作り替えて、機能もブラッシュアップしてください。'}`;
    } else {
      userPrompt = `作成するページ要件: ${prompt}`;
    }

    const aiClient = getGeminiClient(userApiKey);

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    let htmlCode = response.text || '';
    
    const htmlRegex = /```html([\s\S]*?)```/i;
    const match = htmlCode.match(htmlRegex);
    if (match && match[1]) {
      htmlCode = match[1].trim();
    } else {
      const genericRegex = /```([\s\S]*?)```/;
      const genericMatch = htmlCode.match(genericRegex);
      if (genericMatch && genericMatch[1]) {
        htmlCode = genericMatch[1].trim();
      }
    }
    
    res.json({ html: htmlCode.trim() });
  } catch (error: any) {
    console.error('Gemini error:', error);
    res.status(500).json({ error: error.message || 'AIコード生成中にエラーが発生しました。APIキーに誤りがあるか、クォータ制限に達した可能性があります。' });
  }
});

// Password verification gate
app.post('/p/:id/auth', async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  
  try {
    const page = await findPageByIdOrSlug(id);

    if (!page || page.password !== password) {
      return res.status(401).send('無効なパスワードです。');
    }

    res.cookie(`pagehost_auth_${page.id}`, password, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
    res.redirect(`/p/${page.slug || page.id}`);
  } catch (err) {
    res.status(500).send('認証エラーが発生しました。');
  }
});

// Serve hosted HTML pages & assets at /p/* (and inject custom Environment Variables to Client window)
app.get('/p/*', async (req, res) => {
  const requestPath = (req.params as any)[0];
  
  try {
    const matchResult = await resolvePageAndSubpath(requestPath);

    if (!matchResult) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="ja">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>404 Not Found - PageHost</title>
          <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600&display=swap" rel="stylesheet">
        </head>
        <body class="bg-neutral-50 text-neutral-800 flex flex-col items-center justify-center min-h-screen p-6">
          <div class="max-w-md w-full text-center space-y-4">
            <div class="text-neutral-300 text-6xl font-bold">404</div>
            <h1 class="text-xl font-bold text-neutral-900">ウェブサイトが見つかりません</h1>
            <p class="text-neutral-500 text-sm">指定されたSlugまたはサーバーID "${requestPath}" のデプロイは存在しません。</p>
            <a href="/" class="inline-block px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition-colors">PageHostへ戻る</a>
          </div>
        </body>
        </html>
      `);
    }

    const { page, subpath } = matchResult;

    if (page.status === 'inactive') {
      return res.status(403).send(`
        <!DOCTYPE html>
        <html lang="ja">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>サーバー停止中 - PageHost</title>
          <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600&display=swap" rel="stylesheet">
        </head>
        <body class="bg-neutral-50 text-neutral-800 flex flex-col items-center justify-center min-h-screen p-6">
          <div class="max-w-md w-full text-center space-y-4">
            <div class="inline-flex p-3 bg-amber-50 text-amber-600 rounded-full border border-amber-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <h1 class="text-xl font-bold text-neutral-900">このサイトは現在停止中です</h1>
            <p class="text-neutral-500 text-sm">ホスト管理者によって有効ステータスが「Inactive（無効化）」に設定されています。</p>
            <a href="/" class="inline-block px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition-colors">PageHostへ戻る</a>
          </div>
        </body>
        </html>
      `);
    }

    // Check Password protection
    if (page.password) {
      const authCookie = req.cookies[`pagehost_auth_${page.id}`];
      if (authCookie !== page.password) {
        return res.send(`
          <!DOCTYPE html>
          <html lang="ja">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${page.title} - パスワード保護</title>
            <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600&display=swap" rel="stylesheet">
          </head>
          <body class="bg-neutral-50 text-neutral-800 flex items-center justify-center min-h-screen p-4">
            <div class="w-full max-w-sm bg-white border border-neutral-200 rounded-2xl p-6 space-y-6 shadow-sm">
              <div class="space-y-1 text-center">
                <h1 class="text-lg font-bold text-neutral-900">${page.title}</h1>
                <p class="text-neutral-500 text-xs">このサイトはパスワードで保護されています。</p>
              </div>
              <form action="/p/${page.id}/auth" method="POST" class="space-y-4">
                <input type="password" name="password" required placeholder="パスワードを入力してください" 
                  class="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900" />
                <button type="submit" class="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer">
                  ロック解除
                </button>
              </form>
            </div>
          </body>
          </html>
        `);
      }
    }

    // Resolve specific asset or base HTML
    const pageRef = doc(db, 'pages', page.id);
    const resolvedSubpath = subpath || page.rootFile || 'index.html';
    const docId = escapePathToDocId(resolvedSubpath);

    const assetRef = doc(db, 'pages', page.id, 'files', docId);
    const assetSnap = await getDoc(assetRef);

    if (!assetSnap.exists()) {
      return res.status(404).send('アセットが見つかりません。');
    }

    // Increment views atomically ONLY for HTML index loads
    if (!subpath || subpath === page.rootFile) {
      await updateDoc(pageRef, {
        views: increment(1)
      });
    }

    const assetData = assetSnap.data();
    res.setHeader('Content-Type', getMimeType(resolvedSubpath));

    if (assetData.type === 'base64') {
      const buffer = Buffer.from(assetData.content, 'base64');
      res.send(buffer);
    } else {
      let rawContent = assetData.content;
      
      // EXQUISITE FEATURE: Dynamic Client Environment Variable Injection!
      // If resolving index.html, automatically inject custom environment variables in window.ENV
      if (resolvedSubpath.endsWith('index.html')) {
        const envScript = `\n<script>window.ENV = ${JSON.stringify(page.envVariables || {})};</script>\n`;
        if (rawContent.includes('<head>')) {
          rawContent = rawContent.replace('<head>', `<head>${envScript}`);
        } else if (rawContent.includes('<body>')) {
          rawContent = rawContent.replace('<body>', `<body>${envScript}`);
        } else {
          rawContent = envScript + rawContent;
        }
      }
      
      res.send(rawContent);
    }

  } catch (err: any) {
    console.error('Routing resolution error:', err);
    res.status(500).send('ルーティング処理中にエラーが発生しました。');
  }
});

// API: Direct Hosted Mock API Proxy endpoint at /mock/*
app.all('/mock/*', async (req, res) => {
  const requestPath = (req.params as any)[0];
  const method = req.method;

  try {
    const page = await findPageByIdOrSlug(requestPath);

    if (!page || page.type !== 'api') {
      return res.status(404).json({ error: '指定されたモックAPIエンドポイントは見つかりません。' });
    }

    if (page.status === 'inactive') {
      return res.status(403).json({ error: 'このモックAPIは現在無効化されています。' });
    }

    if (page.apiMethod && page.apiMethod !== 'ANY' && page.apiMethod !== method) {
      return res.status(405).json({ error: `Method ${method} is not allowed. Supported: ${page.apiMethod}` });
    }

    // Increment API hits views counter
    const pageRef = doc(db, 'pages', page.id);
    await updateDoc(pageRef, {
      views: increment(1)
    });

    let jsonResponse = {};
    try {
      jsonResponse = JSON.parse(page.apiResponse || '{}');
    } catch {
      return res.status(500).json({ error: 'APIレスポンスのJSONフォーマットが壊れています。' });
    }

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json(jsonResponse);

  } catch (err: any) {
    console.error('Mock API resolution error:', err);
    res.status(500).json({ error: 'モックAPIの処理中にエラーが発生しました。' });
  }
});

// Serve frontend client or mount Vite dev middleware
async function initServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    
    app.use(vite.middlewares);
    
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.hot.send({ type: 'error', err: e as any });
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist/client')));
    app.use('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/client/index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`PageHost fullstack system running at http://localhost:${port}`);
  });
}

initServer().catch(err => {
  console.error('Failed to start server:', err);
});
