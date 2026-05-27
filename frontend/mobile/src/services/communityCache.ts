type Entry = { data: unknown; at: number };

const store = new Map<string, Entry>();

export const communityCache = {
  get<T>(key: string, ttlMs: number): T | null {
    const e = store.get(key);
    if (!e || Date.now() - e.at > ttlMs) return null;
    return e.data as T;
  },

  peek<T>(key: string): T | null {
    return (store.get(key)?.data ?? null) as T | null;
  },

  set(key: string, data: unknown): void {
    store.set(key, { data, at: Date.now() });
  },

  invalidate(...keys: string[]): void {
    keys.forEach(k => store.delete(k));
  },

  invalidatePrefix(prefix: string): void {
    for (const k of store.keys()) {
      if (k.startsWith(prefix)) store.delete(k);
    }
  },
};

export const CK = {
  communities: 'c:my',
  socialFeed:  'c:social-feed',
  detail:      (id: string) => `c:detail:${id}`,
  posts:       (cid: string) => `c:posts:${cid}`,
  comments:    (cid: string, pid: string) => `c:comments:${cid}:${pid}`,
  members:     (cid: string) => `c:members:${cid}`,
  dailyForum:  'c:daily-forum',
  allForums:   'c:all-forums',
  forumDetail: (cid: string, fid: string) => `c:forum:${cid}:${fid}`,
};

export const TTL = {
  communities: 5 * 60_000,
  socialFeed:  2 * 60_000,
  posts:       2 * 60_000,
  comments:    60_000,
  members:     3 * 60_000,
  dailyForum:  5 * 60_000,
  allForums:   5 * 60_000,
  forumDetail: 90_000,
};
