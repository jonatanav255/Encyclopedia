import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MDXProvider } from '@mdx-js/react';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { TopicPage } from './pages/TopicPage';
import { TopicOverview } from './pages/TopicOverview';
import { NotFound } from './pages/NotFound';
import { Practice } from './pages/Practice';
import { SearchModal } from './components/search/SearchModal';
import { Callout } from './components/mdx/Callout';
import { QA } from './components/mdx/QA';
import { Compare } from './components/mdx/Compare';
import { Steps, Step } from './components/mdx/Steps';
import { Diagram, DBox, DArrow } from './components/mdx/Diagram';
import { Cheatsheet } from './components/mdx/Cheatsheet';
import { Term } from './components/mdx/Term';
import { Reference } from './components/mdx/Reference';
import { MiddlewarePipeline } from './components/demos/MiddlewarePipeline';
import { RouteMatcher } from './components/demos/RouteMatcher';
import { EventLoop } from './components/demos/EventLoop';

const mdxComponents = {
  Callout,
  QA,
  Compare,
  Steps,
  Step,
  Diagram,
  DBox,
  DArrow,
  Cheatsheet,
  Term,
  Reference,
  MiddlewarePipeline,
  RouteMatcher,
  EventLoop,
};

export default function App() {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <MDXProvider components={mdxComponents}>
      <BrowserRouter>
        <Layout onOpenSearch={() => setSearchOpen(true)}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/:topic" element={<TopicOverview />} />
            <Route path="/:topic/:name" element={<TopicPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
        <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      </BrowserRouter>
    </MDXProvider>
  );
}
