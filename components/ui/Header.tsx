import React from 'react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/60 dark:border-zinc-800/60 backdrop-blur bg-white/70 dark:bg-zinc-950/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Left: Brand */}
        <a href="/" className="flex items-center gap-2 group">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-brand text-white font-bold leading-none">
            r
          </span>
          <span className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            redix
            <span className="text-brand">.</span>
          </span>
        </a>

        {/* Center: Search */}
        <div className="hidden md:flex flex-1 max-w-xl mx-6">
          <label htmlFor="global-search" className="sr-only">Search</label>
          <div className="relative w-full">
            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.387-1.414 1.414-4.387-4.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z" clipRule="evenodd" />
            </svg>
            <input
              id="global-search"
              placeholder="Search Redix"
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 pl-9 pr-10 py-2 text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50 transition"
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 border border-zinc-200 dark:border-zinc-700 rounded px-1 py-[2px]">/</kbd>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <a
            href="/submit"
            className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-brand px-3 py-2 text-sm font-medium text-white shadow-ring hover:brightness-95 active:brightness-90 transition"
          >
            Create Post
          </a>
          <button
            aria-label="Notifications"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition"
          >
            <svg className="h-4 w-4 text-zinc-600 dark:text-zinc-300" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22ZM20 17h-1V11a7 7 0 1 0-14 0v6H4v2h16v-2Z"/>
            </svg>
          </button>
          <button
            aria-label="Account"
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 pl-1 pr-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand/80 text-white font-semibold">R</span>
            <span className="hidden md:inline text-sm text-zinc-700 dark:text-zinc-300">Account</span>
          </button>
        </div>
      </div>

      {/* Mobile search row */}
      <div className="md:hidden border-t border-zinc-200/60 dark:border-zinc-800/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2">
          <div className="relative">
            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.387-1.414 1.414-4.387-4.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z" clipRule="evenodd" />
            </svg>
            <input
              placeholder="Search Redix"
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 pl-9 pr-3 py-2 text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50 transition"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
