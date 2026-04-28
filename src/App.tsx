import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Loader2, Share2, Download, Copy, RefreshCw, LogIn, LogOut, User as UserIcon, History, ExternalLink, Check } from 'lucide-react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs, serverTimestamp, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './lib/firebase';
import { generateSalesPage } from './lib/gemini';
import { GeneratorInputs, SalesPageData } from './types';
import SalesPagePreview from './components/SalesPagePreview';
import PublicPage from './pages/PublicPage';

function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const [inputs, setInputs] = useState<GeneratorInputs>({
    productName: '',
    description: '',
    targetAudience: '',
    tone: 'Professional & Trustworthy',
    uniqueSellingPoint: '',
  });
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<SalesPageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
      if (u) loadHistory(u.uid);
    });
    return () => unsubscribe();
  }, []);

  const loadHistory = async (uid: string) => {
    const path = 'sales-pages';
    try {
      const q = query(
        collection(db, path),
        where('userId', '==', uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setHistory(docs);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setGeneratedData(null);
      setHistory([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerate = async () => {
    if (!inputs.productName || !inputs.description) return;
    
    setIsGenerating(true);
    setError(null);
    try {
      const data = await generateSalesPage(inputs);
      setGeneratedData(data);
      
      if (user) {
        const path = 'sales-pages';
        if (activePageId) {
          // Update existing
          await updateDoc(doc(db, path, activePageId), {
            inputs: inputs,
            content: data,
            updatedAt: serverTimestamp(),
          });
        } else {
          // Create new
          const docRef = await addDoc(collection(db, path), {
            userId: user.uid,
            inputs: inputs,
            content: data,
            createdAt: serverTimestamp(),
          });
          setActivePageId(docRef.id);
        }
        loadHistory(user.uid);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to generate sales page. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setInputs({
      productName: '',
      description: '',
      targetAudience: '',
      tone: 'Professional & Trustworthy',
      uniqueSellingPoint: '',
    });
    setGeneratedData(null);
    setActivePageId(null);
    setError(null);
  };

  const handleDelete = async (id: string) => {
    const path = `sales-pages/${id}`;
    try {
      await deleteDoc(doc(db, 'sales-pages', id));
      if (user) loadHistory(user.uid);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleCopyLink = () => {
    if (!activePageId) return;
    const url = `${window.location.origin}/p/${activePageId}`;
    navigator.clipboard.writeText(url);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (authLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <nav className="h-16 flex items-center justify-between px-8 bg-white border-b border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">ViralPage<span className="text-blue-600">AI</span></span>
          </div>
        </nav>
        <main className="flex-1 flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-white p-12 rounded-2xl shadow-xl border border-slate-200 text-center"
          >
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-blue-100">
              <LogIn className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Welcome Back</h2>
            <p className="text-slate-500 mb-10 leading-relaxed">
              Log in to start generating high-converting sales pages and save your progress.
            </p>
            <button 
              onClick={handleLogin}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-[0.98] shadow-lg shadow-slate-200"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              Sign in with Google
            </button>
            <p className="mt-8 text-xs text-slate-400 uppercase font-bold tracking-widest">
              Secured by Firebase
            </p>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans overflow-hidden selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">ViralPage<span className="text-blue-600">AI</span></span>
        </div>
        
        <nav className="flex gap-6 items-center text-sm font-medium text-slate-600">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${showHistory ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50'}`}
          >
            <History className="w-4 h-4" />
            History
          </button>
          <div className="h-4 w-[1px] bg-slate-300"></div>
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || ''} className="w-5 h-5 rounded-full" />
            ) : (
              <UserIcon className="w-4 h-4" />
            )}
            <span className="text-xs font-bold text-slate-700">{user.displayName || user.email}</span>
            <button onClick={handleLogout} className="p-1 hover:text-red-500 transition-colors">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </nav>
      </header>

      <main className="flex-1 flex overflow-hidden p-6 gap-6 relative">
        {/* History Overlay */}
        <AnimatePresence>
          {showHistory && (
            <motion.aside 
              initial={{ x: -400 }}
              animate={{ x: 0 }}
              exit={{ x: -400 }}
              className="absolute left-6 top-6 bottom-6 w-[380px] bg-white border border-slate-200 rounded-xl shadow-2xl z-40 flex flex-col overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-600" />
                  Your History
                </h2>
                <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                  <RefreshCw className="w-4 h-4 rotate-45" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {history.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-sm italic">
                    No history found. Start generating!
                  </div>
                ) : (
                  history.map((item) => (
                    <div 
                      key={item.id} 
                      className={`p-4 rounded-xl border transition-all cursor-pointer group ${activePageId === item.id ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100 hover:border-blue-200'}`}
                      onClick={() => {
                        setGeneratedData(item.content);
                        setInputs(item.inputs);
                        setActivePageId(item.id);
                        setShowHistory(false);
                      }}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{item.inputs.productName}</h4>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                          className="text-slate-300 hover:text-red-500 transition-colors"
                        >
                          &times;
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {item.createdAt?.toDate().toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Sidebar Input */}
        <aside className="w-[380px] bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden shrink-0">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Page Parameters</h2>
            <button 
              onClick={handleReset}
              className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors"
            >
              New Page
            </button>
          </div>

          <div className="flex-1 p-5 space-y-4 overflow-y-auto scrollbar-hide">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Product / Service Name</label>
              <input 
                type="text" 
                name="productName"
                placeholder="e.g. UltraClean Dishwasher"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                value={inputs.productName}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target Audience</label>
              <input 
                type="text" 
                name="targetAudience"
                placeholder="e.g. Busy parents, restaurant owners"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                value={inputs.targetAudience}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description & Features</label>
              <textarea 
                name="description"
                rows={4}
                placeholder="Silent mode, 10 min express wash, ECO friendly..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium resize-none"
                value={inputs.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Brand Tone</label>
              <select 
                name="tone"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium appearance-none"
                value={inputs.tone}
                onChange={handleInputChange}
              >
                <option>Professional & Trustworthy</option>
                <option>Exciting & Bold</option>
                <option>Minimal & Direct</option>
                <option>Luxurious & Refined</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">USP</label>
                  <input 
                    type="text" 
                    name="uniqueSellingPoint"
                    placeholder="e.g. 10x Faster"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    value={inputs.uniqueSellingPoint}
                    onChange={handleInputChange}
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Price</label>
                  <input 
                    type="text" 
                    name="price"
                    placeholder="e.g. $49"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    value={inputs.price || ''}
                    onChange={handleInputChange}
                  />
               </div>
            </div>
          </div>

          <div className="p-5 bg-slate-50 border-t border-slate-100">
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !inputs.productName || !inputs.description}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-200 disabled:opacity-50 disabled:shadow-none active:scale-[0.98]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {activePageId ? 'Update Page' : 'Generate with Gemini'}
                </>
              )}
            </button>
            {error && <p className="text-red-500 text-[10px] mt-2 text-center font-bold uppercase tracking-wider">{error}</p>}
          </div>
        </aside>

        {/* Main Output Viewport */}
        <div className="flex-1 flex flex-col bg-slate-200 rounded-xl border border-slate-300 shadow-inner overflow-hidden relative">
          {/* Browser Chrome */}
          <div className="h-10 bg-slate-100 border-b border-slate-300 flex items-center px-4 gap-2 flex-shrink-0 z-10">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="mx-auto bg-white border border-slate-300 rounded px-3 py-0.5 text-[10px] text-slate-400 w-64 text-center overflow-hidden text-ellipsis whitespace-nowrap">
              {activePageId ? `${window.location.hostname}/p/${activePageId}` : 'preview.ViralPage.ai/idle'}
            </div>
            <div className="flex items-center gap-2">
               {activePageId && (
                 <button 
                  onClick={handleCopyLink}
                  className="p-1 hover:bg-blue-50 hover:text-blue-600 rounded transition-all flex items-center gap-1.5 px-2 font-bold text-[10px]" 
                  title="Copy Link"
                >
                    {copySuccess ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copySuccess ? 'Copied' : 'Share'}
                 </button>
               )}
               {activePageId && (
                 <a 
                   href={`/p/${activePageId}`} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="p-1 hover:bg-slate-200 rounded transition-colors" 
                   title="Open in new tab"
                 >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                 </a>
               )}
            </div>
          </div>

          <div className="flex-1 bg-white overflow-y-auto scrollbar-hide relative">
            <AnimatePresence mode="wait">
              {!generatedData ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center text-center p-12"
                >
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 border border-slate-100 shadow-sm">
                    <RefreshCw className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Canvas Ready</h3>
                  <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
                    Once you generate copy with Gemini, your high-converting landing page will appear here.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full"
                >
                  <SalesPagePreview data={generatedData} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer Status Bar */}
      <footer className="h-8 bg-white border-t border-slate-200 px-6 flex items-center justify-between text-[10px] text-slate-400 flex-shrink-0">
        <div className="flex items-center gap-4">
          <span>Session: <span className="text-slate-600 uppercase font-mono">#SF-{Math.floor(Math.random()*90000)+10000}</span></span>
          <span>Engine: <span className="text-blue-500 font-bold uppercase tracking-widest">Gemini 3 Flash</span></span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> 
            System Status: Nominal
          </span>
          <span className="text-blue-600 font-medium italic underline underline-offset-2 decoration-blue-200">
            Professional Edition Active
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/p/:pageId" element={<PublicPage />} />
      </Routes>
    </BrowserRouter>
  );
}
