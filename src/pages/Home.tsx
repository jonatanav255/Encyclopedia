import { Link } from 'react-router-dom';
import { groups } from '../lib/content';

export function Home() {
  return (
    <div>
      <h1>Encyclopedia</h1>
      <p>
        A personal reference for languages, tools, and concepts — written in MDX with interactive
        demos embedded inline. Pick a topic from the sidebar to start, or browse below.
      </p>
      {groups.map((group) => (
        <section key={group.topic}>
          <h2>{group.title}</h2>
          <ul>
            {group.entries.map((e) => (
              <li key={e.slug}>
                <Link to={`/${e.slug}`}>{e.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
