import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { SalesPageData } from '../types';
import SalesPagePreview from '../components/SalesPagePreview';
import { Loader2, AlertCircle } from 'lucide-react';

export default function PublicPage() {
  const { pageId } = useParams();
  const [data, setData] = useState<SalesPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPage() {
      if (!pageId) return;
      try {
        const docRef = doc(db, 'sales-pages', pageId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setData(docSnap.data().content);
        } else {
          setError('Page not found');
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `sales-pages/${pageId}`);
        setError('Failed to load page');
      } finally {
        setLoading(false);
      }
    }
    loadPage();
  }, [pageId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">{error || 'Something went wrong'}</h1>
        <p className="text-slate-500 max-w-md">The page you are looking for might have been deleted or the link is incorrect.</p>
        <a href="/" className="mt-6 text-blue-600 font-semibold hover:underline">Go to ViralPage AI</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SalesPagePreview data={data} />
      {/* Attribution footer */}
      <footer className="py-8 bg-slate-50 border-t border-slate-100 text-center">
        <p className="text-sm text-slate-400">
          Generated with <span className="font-bold text-slate-600">ViralPage AI</span>
        </p>
      </footer>
    </div>
  );
}
