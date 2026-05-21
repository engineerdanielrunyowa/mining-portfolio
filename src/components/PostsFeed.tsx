import { useState, useRef, useEffect } from 'react';
import { Clock, Image as ImageIcon, Video, ChevronDown } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import type { Post } from '../types';

interface PostsFeedProps {
  posts: Post[];
}

function PostTimestamp({ timestamp }: { timestamp: string }) {
  const [showExact, setShowExact] = useState(false);
  const date = parseISO(timestamp);
  const relative = formatDistanceToNow(date, { addSuffix: true });
  const exact = date.toLocaleString('en-AU', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <span
      className="text-xs font-mono cursor-default select-none flex items-center gap-1.5"
      style={{ color: 'var(--text-muted)' }}
      onMouseEnter={() => setShowExact(true)}
      onMouseLeave={() => setShowExact(false)}
      title={exact}
    >
      <Clock size={11} />
      {showExact ? exact : relative}
    </span>
  );
}

function ImageGrid({ urls }: { urls: string[] }) {
  if (urls.length === 0) return null;

  if (urls.length === 1) {
    return (
      <div className="mt-4 rounded-xl overflow-hidden" style={{ maxHeight: '420px' }}>
        <img src={urls[0]} alt="Post image" className="w-full h-full object-cover" loading="lazy" style={{ maxHeight: '420px' }} />
      </div>
    );
  }

  if (urls.length === 2) {
    return (
      <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl overflow-hidden">
        {urls.map((url, i) => (
          <img key={i} src={url} alt={`Post image ${i + 1}`} className="w-full h-48 object-cover" loading="lazy" />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-4 grid grid-cols-3 gap-1 rounded-xl overflow-hidden">
      {urls.slice(0, 3).map((url, i) => (
        <div key={i} className="relative">
          <img src={url} alt={`Post image ${i + 1}`} className="w-full h-36 object-cover" loading="lazy" />
          {i === 2 && urls.length > 3 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-lg">
              +{urls.length - 3}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function VideoEmbed({ url }: { url: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="mt-4 rounded-xl overflow-hidden relative" style={{ paddingBottom: '56.25%' }}>
      {!loaded && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <div className="flex flex-col items-center gap-2" style={{ color: 'var(--text-muted)' }}>
            <Video size={32} />
            <span className="text-sm">Loading video...</span>
          </div>
        </div>
      )}
      <iframe
        className="absolute inset-0 w-full h-full"
        src={url}
        title="Embedded video"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  const [expanded, setExpanded] = useState(false);
  const text = post.TextContent || '';
  const isLong = text.split('\n').length > 5 || text.length > 400;

  const displayText = !expanded && isLong
    ? text.split('\n').slice(0, 4).join('\n') + '...'
    : text;

  return (
    <div className="post-card">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-sm"
          style={{ backgroundColor: 'var(--accent-secondary)', color: '#0E1621' }}
        >
          JT
        </div>
        <div>
          <div className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>
            James Thornton
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <PostTimestamp timestamp={post.Timestamp} />
            {post.ImageURLs.length > 0 && (
              <span className="flex items-center gap-1 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                <ImageIcon size={10} /> {post.ImageURLs.length}
              </span>
            )}
            {post.VideoURLs.length > 0 && (
              <span className="flex items-center gap-1 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                <Video size={10} /> {post.VideoURLs.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Text */}
      {text && (
        <div className="mb-1">
          <p
            className="text-sm leading-relaxed whitespace-pre-line"
            style={{ color: 'var(--text-main)' }}
          >
            {displayText}
          </p>
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 text-xs font-semibold flex items-center gap-1 transition-colors duration-200"
              style={{ color: 'var(--accent-secondary)' }}
            >
              {expanded ? 'Show less' : 'Read more'}
              <ChevronDown size={12} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
          )}
        </div>
      )}

      {/* Images */}
      <ImageGrid urls={post.ImageURLs} />

      {/* Videos */}
      {post.VideoURLs.map((url, i) => (
        <VideoEmbed key={i} url={url} />
      ))}
    </div>
  );
}

const POSTS_PER_PAGE = 5;

export default function PostsFeed({ posts }: PostsFeedProps) {
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);
  const sectionRef = useRef<HTMLElement>(null);
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setHeaderVisible(true);
    }, { threshold: 0.05 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const sorted = [...posts].sort((a, b) =>
    new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime()
  );
  const visible = sorted.slice(0, visibleCount);

  return (
    <section
      ref={sectionRef}
      id="feed"
      className="py-20 lg:py-28"
      style={{ backgroundColor: 'var(--bg-main)' }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className="text-center mb-12"
          style={{
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? 'none' : 'translateY(20px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}
        >
          <div className="section-label">Professional Insights</div>
          <h2 className="text-3xl sm:text-4xl font-bold mt-2" style={{ color: 'var(--text-main)' }}>
            Industry{' '}
            <span style={{ color: 'var(--accent-secondary)' }}>Feed</span>
          </h2>
          <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>
            Technical articles, project updates, and industry commentary from the field.
          </p>
        </div>

        {/* Posts */}
        {posts.length === 0 ? (
          <div
            className="text-center py-20 rounded-2xl"
            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px dashed var(--border-color)' }}
          >
            <div style={{ color: 'var(--text-muted)' }} className="text-sm">
              No posts published yet.
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {visible.map(post => (
              <PostCard key={post.ID} post={post} />
            ))}
          </div>
        )}

        {/* Load More */}
        {visibleCount < sorted.length && (
          <div className="text-center mt-8">
            <button
              onClick={() => setVisibleCount(c => c + POSTS_PER_PAGE)}
              className="btn-secondary"
            >
              <ChevronDown size={16} />
              Load More Posts
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
