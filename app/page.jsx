"use client";

import { useState } from 'react';

const defaultUrl = "https://www.xiaohongshu.com/discovery/item/68eb02d1000000000700ed8e?app_platform=android&ignoreEngage=true&app_version=9.7.0&share_from_user_hidden=true&xsec_source=app_share&type=video&xsec_token=CB0biCGu--z655TJ1IJ-80norM6zkp0UpezJWRt0pCmNo=&author_share=1&xhsshare=CopyLink&shareRedId=OD8yQzk-RkI2NzUyOTgwNjk0OThHNUtB&apptime=1762439898&share_id=453f308817cf4e84a19f729ac39de457&share_channel=copy_link";

export default function HomePage() {
  const [url, setUrl] = useState(defaultUrl);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/metadata?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `Request failed: ${res.status}`);
      }
      setResult(data);
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stack">
      <form className="card" onSubmit={handleSubmit}>
        <label htmlFor="url">Enter a URL</label>
        <div className="row">
          <input
            id="url"
            type="url"
            placeholder="https://example.com/article"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Fetching?' : 'Fetch metadata'}
          </button>
        </div>
        <p className="hint">We fetch the page server-side and extract Open Graph tags.</p>
      </form>

      {error && <div className="card error">{error}</div>}

      {result && (
        <div className="card">
          <h2 className="result-title">{result.title || 'Untitled'}</h2>
          {result.siteName && <div className="muted">{result.siteName}</div>}
          {result.canonical && (
            <div className="muted small">
              Canonical: <a href={result.canonical} target="_blank" rel="noreferrer">{result.canonical}</a>
            </div>
          )}
          {result.description && <p className="description">{result.description}</p>}

          {result.video ? (
            <div className="media">
              <video controls preload="metadata" crossOrigin="anonymous" src={result.video} />
            </div>
          ) : result.image ? (
            <div className="media">
              <img src={result.image} alt={result.title || 'Preview image'} />
            </div>
          ) : null}

          {Array.isArray(result.images) && result.images.length > 1 && (
            <div className="thumbs">
              {result.images.map((img, i) => (
                <img key={i} src={img} alt={`Image ${i + 1}`} />
              ))}
            </div>
          )}

          <div className="muted small" style={{ marginTop: '0.5rem' }}>
            Source URL: <a href={result.url} target="_blank" rel="noreferrer">{result.url}</a>
          </div>
        </div>
      )}
    </div>
  );
}
