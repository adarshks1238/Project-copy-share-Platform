import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Copy, 
  Check,
  Link2, 
  FileText, 
  ExternalLink,
  Laptop,
  Smartphone,
  Info,
  Calendar
} from 'lucide-react';

function Dashboard({ token, apiBase, showToast }) {
  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [newContent, setNewContent] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [detectedType, setDetectedType] = useState('TEXT');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, LINK, TEXT
  const [copiedClipId, setCopiedClipId] = useState(null);

  // URL detection helper
  const isUrl = (str) => {
    if (!str) return false;
    const trimmed = str.trim();
    // Match standard HTTP/HTTPS URLs or common domains
    const pattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?(\?.*)?(#.*)?$/i;
    // Also test if it starts with HTTP/HTTPS to be sure
    if (/^https?:\/\//i.test(trimmed)) return true;
    return pattern.test(trimmed);
  };

  // Detect type on content change
  useEffect(() => {
    if (isUrl(newContent)) {
      setDetectedType('LINK');
    } else {
      setDetectedType('TEXT');
    }
  }, [newContent]);

  // Fetch clips from API
  const fetchClips = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/clips`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to load clipboard clips.');
      }
      const data = await response.json();
      setClips(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClips();
  }, [token]);

  // Retrieve friendly device name
  const getDeviceName = () => {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) {
      if (/iphone|ipad|ipod/i.test(ua)) return "iOS Device";
      if (/android/i.test(ua)) return "Android Device";
      return "Mobile Device";
    }
    if (/macintosh|mac os x/i.test(ua)) return "Mac Computer";
    if (/windows/i.test(ua)) return "Windows PC";
    if (/linux/i.test(ua)) return "Linux PC";
    return "Web Browser";
  };

  // Add clip
  const handleSaveClip = async (e) => {
    e.preventDefault();
    if (!newContent.trim()) {
      showToast('Clipboard content cannot be empty!', 'error');
      return;
    }

    setIsSaving(true);
    const resolvedTitle = newTitle.trim() || (detectedType === 'LINK' ? 'Saved Link' : 'Pasted Text');
    
    try {
      const response = await fetch(`${apiBase}/clips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: detectedType,
          content: newContent,
          title: resolvedTitle,
          deviceInfo: getDeviceName()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save clip');
      }

      const savedClip = await response.json();
      setClips([savedClip, ...clips]);
      
      // Auto-switch filter to ALL so the new clip is visible
      setActiveFilter('ALL');
      
      // Reset form
      setNewContent('');
      setNewTitle('');
      showToast('Copied to Cloud successfully!');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete clip
  const handleDeleteClip = async (id) => {
    try {
      const response = await fetch(`${apiBase}/clips/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete clip');
      }

      setClips(clips.filter(c => c.id !== id));
      showToast('Clip deleted successfully.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Copy clip content to local clipboard
  const handleCopyToClipboard = async (id, content) => {
    navigator.clipboard.writeText(content);
    setCopiedClipId(id);
    showToast('Copied to device clipboard!');
    setTimeout(() => {
      setCopiedClipId(null);
    }, 2000);

    try {
      const response = await fetch(`${apiBase}/clips/${id}/copied`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const updatedClip = await response.json();
        setClips(prevClips => prevClips.map(clip => clip.id === id ? updatedClip : clip));
      }
    } catch (err) {
      console.error('Failed to increment copy count:', err);
    }
  };

  // Format date nicely
  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Helper to get device icon
  const getDeviceIcon = (deviceInfo) => {
    if (!deviceInfo) return <Laptop size={12} />;
    const info = deviceInfo.toLowerCase();
    if (info.includes('ios') || info.includes('android') || info.includes('mobile')) {
      return <Smartphone size={12} />;
    }
    return <Laptop size={12} />;
  };

  // Filters and queries
  const filteredClips = clips.filter(clip => {
    const matchesFilter = activeFilter === 'ALL' || clip.type === activeFilter;
    const matchesSearch = 
      (clip.content && clip.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (clip.title && clip.title.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="dashboard-grid">
      
      {/* Left Column: Input Form (Creator) */}
      <div className="creator-sticky">
        <form onSubmit={handleSaveClip} className="creator-card">
          <h3>
            <Plus size={20} className="toast-icon" />
            <span>Add to Clipboard</span>
          </h3>

          <textarea
            className="creator-textarea"
            placeholder="Paste your link or text here..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            required
            disabled={isSaving}
          />

          <div className="type-indicator-row">
            <span style={{ color: 'var(--text-medium)' }}>Detected Type:</span>
            <span className={`type-detector ${detectedType.toLowerCase()}`}>
              {detectedType === 'LINK' ? (
                <>
                  <Link2 size={13} />
                  <span>Link</span>
                </>
              ) : (
                <>
                  <FileText size={13} />
                  <span>Text</span>
                </>
              )}
            </span>
          </div>

          <input
            type="text"
            className="creator-title-input"
            placeholder="Label/Title (Optional)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            disabled={isSaving}
          />

          <button 
            type="submit" 
            className="btn btn-primary btn-submit-clip"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Copy to Cloud'}
          </button>
        </form>
      </div>

      {/* Right Column: Search, Filters & Clip Feed */}
      <div>
        <div className="feed-header">
          <div className="feed-title">
            <h2>Your Cloud Clipboard</h2>
            <span className="badge">{filteredClips.length}</span>
          </div>

          <div className="search-filter-controls">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={16} />
              <input
                type="text"
                className="search-input"
                placeholder="Search clips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-tabs">
              <button 
                className={`filter-tab ${activeFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setActiveFilter('ALL')}
              >
                All
              </button>
              <button 
                className={`filter-tab ${activeFilter === 'LINK' ? 'active' : ''}`}
                onClick={() => setActiveFilter('LINK')}
              >
                Links
              </button>
              <button 
                className={`filter-tab ${activeFilter === 'TEXT' ? 'active' : ''}`}
                onClick={() => setActiveFilter('TEXT')}
              >
                Texts
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-medium)' }}>
            <p>Syncing clips with cloud...</p>
          </div>
        ) : filteredClips.length === 0 ? (
          <div className="empty-state">
            <Info className="empty-state-icon" size={48} />
            <h3>No clips found</h3>
            <p>
              {searchQuery || activeFilter !== 'ALL' 
                ? "Try adjusting your search query or filters." 
                : "Your cloud clipboard is empty. Add links or text from the side panel to store them securely."
              }
            </p>
          </div>
        ) : (
          <div className="clip-feed">
            {filteredClips.map((clip) => {
              const isLink = clip.type === 'LINK';
              
              // Standardize URL for browser link click (prepend http:// if needed)
              let hrefUrl = clip.content;
              if (isLink && !/^https?:\/\//i.test(clip.content)) {
                hrefUrl = `https://${clip.content.trim()}`;
              }

              return (
                <div key={clip.id} className={`clip-card type-${clip.type.toLowerCase()}`}>
                  <div className="clip-header">
                    <div className="clip-title-area">
                      <span className={`clip-badge type-${clip.type.toLowerCase()}`}>
                        {isLink ? <Link2 size={10} /> : <FileText size={10} />}
                        <span>{clip.type}</span>
                      </span>
                      <h4 className="clip-title">{clip.title}</h4>
                    </div>

                    <div className="clip-actions">
                      <button 
                        onClick={() => handleCopyToClipboard(clip.id, clip.content)}
                        className="btn btn-secondary btn-icon"
                        title="Copy to clipboard"
                        style={{ height: '32px', width: '32px', padding: 0 }}
                      >
                        {copiedClipId === clip.id ? <Check size={14} style={{ color: 'var(--yellow-600)' }} /> : <Copy size={14} />}
                      </button>

                      {isLink && (
                        <a 
                          href={hrefUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-icon"
                          title="Open Link"
                          style={{ height: '32px', width: '32px', padding: 0, display: 'inline-flex', justifyContent: 'center', alignItems: 'center' }}
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}



                      <button 
                        onClick={() => handleDeleteClip(clip.id)}
                        className="btn btn-danger-outline btn-icon"
                        title="Delete clip"
                        style={{ height: '32px', width: '32px', padding: 0 }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {isLink ? (
                    <a 
                      href={hrefUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="clip-link-preview"
                    >
                      <Link2 size={14} style={{ flexShrink: 0 }} />
                      <span>{clip.content}</span>
                    </a>
                  ) : (
                    <div className="clip-content-box">
                      {clip.content}
                    </div>
                  )}

                  <div className="clip-footer">
                    <span className="clip-meta-item">
                      {getDeviceIcon(clip.deviceInfo)}
                      <span>{clip.deviceInfo || 'Unknown Device'}</span>
                    </span>
                    
                    <span className="clip-meta-item" title="Times copied to clipboard">
                      <Copy size={12} />
                      <span>{clip.copyCount || 0} {clip.copyCount === 1 ? 'copy' : 'copies'}</span>
                    </span>

                    <span className="clip-meta-item">
                      <Calendar size={12} />
                      <span>{formatDate(clip.createdAt)}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

export default Dashboard;
