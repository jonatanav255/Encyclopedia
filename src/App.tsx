import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MDXProvider } from '@mdx-js/react';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { TopicPage } from './pages/TopicPage';
import { Callout } from './components/mdx/Callout';
import { QA } from './components/mdx/QA';
import { Compare } from './components/mdx/Compare';
import { Steps, Step } from './components/mdx/Steps';
import { Diagram, DBox, DArrow } from './components/mdx/Diagram';
import { MiddlewarePipeline } from './components/demos/MiddlewarePipeline';
import { RouteMatcher } from './components/demos/RouteMatcher';

const mdxComponents = {
  Callout,
  QA,
  Compare,
  Steps,
  Step,
  Diagram,
  DBox,
  DArrow,
  MiddlewarePipeline,
  RouteMatcher,
};

export default function App() {
  return (
    <MDXProvider components={mdxComponents}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/:topic/:name" element={<TopicPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </MDXProvider>
  );
}
