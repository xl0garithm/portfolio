export type Repo = {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
  html_url: string;
  homepage: string | null;
};

const GH_BASE = 'https://api.github.com';

export async function searchPortfolioRepos(username: string): Promise<Repo[] | null> {
  try {
    // Use search API to filter by topic:portfolio and is:public
    const q = encodeURIComponent(`user:${username} topic:portfolio is:public`);
    const res = await fetch(`${GH_BASE}/search/repositories?q=${q}&sort=updated&order=desc&per_page=30`);
    if (!res.ok) return null;
    const data = await res.json();
    const items = (data.items ?? []) as Array<any>;
    return items.map(it => ({
      name: it.name,
      description: it.description,
      language: it.language,
      stargazers_count: it.stargazers_count,
      updated_at: it.updated_at,
      html_url: it.html_url,
      homepage: it.homepage,
    }));
  } catch {
    return null;
  }
}

