import { useEffect, useRef, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { attachCopyButtons } from '../../lib/copyButtons';

export function Layout({
  children,
  onOpenSearch,
}: {
  children: ReactNode;
  onOpenSearch?: () => void;
}) {
  const location = useLocation();
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    const el = contentRef.current;
    attachCopyButtons(el);
    const observer = new MutationObserver(() => attachCopyButtons(el));
    observer.observe(el, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header onOpenSearch={onOpenSearch} />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div ref={contentRef} className="max-w-3xl mx-auto px-8 py-10 prose-doc">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
