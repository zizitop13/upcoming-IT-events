import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function EventDetail({ markdown }) {
  if (!markdown) {
    return <main className="page detail-page"><Link to="/">← Back</Link><h1>Event details not found</h1></main>;
  }
  return (
    <main className="page detail-page">
      <Link className="back-link" to="/">← All events</Link>
      <article className="markdown-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      </article>
    </main>
  );
}
