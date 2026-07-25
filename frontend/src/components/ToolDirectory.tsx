'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchTools } from '@/lib/api';
import type { OsintTool, CategoryKey } from '@/types';
import SearchBar from './SearchBar';
import CategoryFilter from './CategoryFilter';

export default function ToolDirectory() {
  const [tools, setTools] = useState<OsintTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all');

  const loadTools = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTools(activeCategory, searchQuery);
      setTools(data.tools || []);
    } catch {
      // If backend is offline, use empty array
      setTools([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    const debounce = setTimeout(loadTools, 300);
    return () => clearTimeout(debounce);
  }, [loadTools]);

  const categoryCount = (cat: string) =>
    cat === 'all'
      ? tools.length
      : tools.filter((t) => t.category === cat).length;

  return (
    <section id="tool-directory" className="animate-fade-in-up mx-auto w-full max-w-5xl">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="mb-2 text-2xl font-bold tracking-tight text-black">
          OSINT Tool Directory
        </h2>
        <p className="text-sm text-text-secondary">
          Curated collection of open-source intelligence tools and resources.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search tools by name, category, or keyword..."
        />
        <CategoryFilter active={activeCategory} onSelect={setActiveCategory} />
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="shimmer h-24 rounded-2xl" />
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && tools.length === 0 && (
        <div className="rounded-2xl border border-border bg-white p-16 text-center">
          <p className="mb-1 text-sm font-medium text-black">No tools found</p>
          <p className="text-xs text-text-muted">
            Try adjusting your search or category filter.
          </p>
        </div>
      )}

      {/* Tool Cards */}
      {!loading && tools.length > 0 && (
        <div className="space-y-3">
          {tools.map((tool, idx) => (
            <a
              key={tool.id}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`animate-fade-in-up group block rounded-2xl border border-border bg-white p-5 transition-all duration-200 hover:border-black hover:shadow-sm stagger-${Math.min(idx + 1, 6)}`}
              style={{ opacity: 0 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-center gap-2.5">
                    <h3 className="text-sm font-bold text-black group-hover:underline">
                      {tool.name}
                    </h3>
                    <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-text-muted">
                      {tool.categoryLabel}
                    </span>
                    {tool.isFree ? (
                      <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-bold text-black">
                        FREE
                      </span>
                    ) : (
                      <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-text-muted">
                        PAID
                      </span>
                    )}
                  </div>
                  <p className="mb-2 text-xs leading-relaxed text-text-secondary">
                    {tool.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {tool.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-surface px-2 py-0.5 text-[10px] font-medium text-text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-border transition-all duration-200 group-hover:border-black group-hover:bg-black group-hover:text-white">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Count Footer */}
      {!loading && tools.length > 0 && (
        <p className="mt-6 text-center text-xs text-text-muted">
          Showing {tools.length} tool{tools.length !== 1 ? 's' : ''}
        </p>
      )}
    </section>
  );
}
