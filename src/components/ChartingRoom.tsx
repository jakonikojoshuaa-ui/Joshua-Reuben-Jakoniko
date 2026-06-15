/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import { 
  Users, LogIn, UserPlus, LogOut, MessageSquare, Compass, 
  Send, RefreshCw, BarChart4, ChevronRight, CheckCircle2, ShieldCheck, 
  Database, UserCheck, AlertCircle, Thermometer, Wind, Check,
  Lightbulb, AlertTriangle, Bell, BellOff, X, Download, HelpCircle,
  MessageCircle, Wrench, ShieldAlert, Mail
} from 'lucide-react';
import { SystemSpecs, RodentSpecies } from '../types';
import { googleSignIn } from '../lib/workspaceAuth';
import { getEriconLogoDataUrl, getLogoFitDimensions, getLogoAspectRatio } from '../utils/ericonLogoDraw';

interface ChartingRoomProps {
  specs: SystemSpecs;
  rodentSpecies: RodentSpecies;
  survivalScore: number;
  onLoadSpecs: (newSpecs: SystemSpecs) => void;
  onLoadRodentSpecies: (newSpecies: RodentSpecies) => void;
}

interface User {
  username: string;
  email: string;
  role: string;
  institution: string;
}

interface Reply {
  id: string;
  author: string;
  authorRole: string;
  authorInstitution: string;
  timestamp: string;
  content: string;
}

interface ForumComment {
  id: string;
  author: string;
  authorRole: string;
  authorInstitution: string;
  timestamp: string;
  content: string;
  chartState?: {
    specs: SystemSpecs;
    rodentSpecies: RodentSpecies;
    survivalScore: number;
  };
  reactions?: {
    insightful: number;
    verified: number;
    alert: number;
    fluid: number;
  };
  replies: Reply[];
}

export const ChartingRoom: React.FC<ChartingRoomProps> = ({
  specs,
  rodentSpecies,
  survivalScore,
  onLoadSpecs,
  onLoadRodentSpecies,
}) => {
  // Session authentication states
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('ericon_logged_scientist');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authView, setAuthView] = useState<'signin' | 'signup'>('signin');
  const [activeChannel, setActiveChannel] = useState<'general' | 'research' | 'feedback'>('general');
  const [successLoadId, setSuccessLoadId] = useState<string | null>(null);

  // Form states - authentication
  const [loginVal, setLoginVal] = useState('');
  const [passwordVal, setPasswordVal] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('Field Epidemiologist');
  const [regInstitution, setRegInstitution] = useState('ERICON Ecological Group');

  // Form states - commenting
  const [newCommentBody, setNewCommentBody] = useState('');
  const [attachSimState, setAttachSimState] = useState(true);
  const [activeReplyBox, setActiveReplyBox] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [feedbackType, setFeedbackType] = useState('Bug Report');
  const [feedbackSeverity, setFeedbackSeverity] = useState('Medium');

  // Forum lists
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);

  // Reaction / Upvote network handler
  const handleReactComment = async (commentId: string, reactionType: 'insightful' | 'verified' | 'alert' | 'fluid') => {
    try {
      const res = await fetch(`/api/forum/comments/${commentId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reactionType })
      });
      if (res.ok) {
        fetchComments();
      }
    } catch (e) {
      console.error('Failed to register upvote/reaction:', e);
    }
  };

  // In-app interactive notifications persistence
  const [seenReplyIds, setSeenReplyIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ericon_seen_reply_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('ericon_seen_reply_ids', JSON.stringify(seenReplyIds));
  }, [seenReplyIds]);

  // Compute unread notification entities
  const unreadNotifications = useMemo(() => {
    if (!currentUser) return [];
    const arr: {
      replyId: string;
      commentId: string;
      commentSnippet: string;
      replyAuthor: string;
      replyContent: string;
      timestamp: string;
    }[] = [];

    comments.forEach(comment => {
      if (comment.author.toLowerCase() === currentUser.username.toLowerCase()) {
        if (comment.replies) {
          comment.replies.forEach(reply => {
            if (
              reply.author.toLowerCase() !== currentUser.username.toLowerCase() &&
              !seenReplyIds.includes(reply.id)
            ) {
              arr.push({
                replyId: reply.id,
                commentId: comment.id,
                commentSnippet: comment.content.length > 50 ? comment.content.substring(0, 50) + '...' : comment.content,
                replyAuthor: reply.author,
                replyContent: reply.content,
                timestamp: reply.timestamp
              });
            }
          });
        }
      }
    });

    return arr;
  }, [comments, currentUser, seenReplyIds]);

  const handleMarkAsRead = (replyId: string) => {
    setSeenReplyIds(prev => [...prev, replyId]);
  };

  const handleClearAllNotifications = () => {
    const ids = unreadNotifications.map(n => n.replyId);
    setSeenReplyIds(prev => Array.from(new Set([...prev, ...ids])));
  };

  // PDF Export Generation Core
  const handleExportPDFArchive = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Read PDF layout customization variables
    const applyScaling = localStorage.getItem('ericon_include_reports') !== 'false';
    const exportFontSize = localStorage.getItem('ericon_export_font_size') || 'standard';
    let offset = 0;
    if (applyScaling) {
      if (exportFontSize === 'large') {
        offset = 2.0;
      } else if (exportFontSize === 'publication') {
        offset = 4.0;
      }
    }
    
    // Override setFontSize to dynamically apply standard offset
    const originalSetFontSize = doc.setFontSize;
    doc.setFontSize = function(size: number) {
      return originalSetFontSize.call(this, size + offset);
    };

    // Header banner (ERICON accredited slate branding)
    doc.setFillColor(6, 78, 59); // deep emerald
    doc.rect(0, 0, 210, 32, 'F');

    // Add high-fidelity official ERICON logo on the right header banner (corrected alignment with square badge)
    const ericonLogoData = getEriconLogoDataUrl(200, 230);
    if (ericonLogoData) {
      const ratio = getLogoAspectRatio() || (162 / 186);
      const cardHeight = 22;
      const cardWidth = cardHeight * ratio;
      const xPos = 195 - cardWidth;
      const yPos = 5;

      doc.setFillColor(255, 255, 255);
      doc.roundedRect(xPos, yPos, cardWidth, cardHeight, 1.5, 1.5, 'F');

      doc.setDrawColor(197, 160, 43); // Premium Gold `#C5A02B`
      doc.setLineWidth(0.4);
      doc.roundedRect(xPos, yPos, cardWidth, cardHeight, 1.5, 1.5, 'S');

      // Fit logo snuggly inside the card
      const padding = 1.6;
      const logoW = cardWidth - (padding * 2);
      const logoH = cardHeight - (padding * 2);
      const logoX = xPos + padding;
      const logoY = yPos + padding;

      doc.addImage(ericonLogoData, 'PNG', logoX, logoY, logoW, logoH);
    }

    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12.5); // Adjusted to fit nicely when logo is on the right
    // Draw text with enough space starting at the left margin x=15
    doc.text('ERICON FORUM ARCHIVE & SCIENTIFIC COLLABORATION REPORT', 15, 12);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(`Generated At: ${new Date().toLocaleString()} (UTC)  |  ERICON Security Core Encryption`, 15, 20);
    doc.text(`Active Sessions Logged: Dr. ${currentUser ? currentUser.username : 'Anonymous Collaborator'}`, 15, 25);

    const addFooter = (pageNum: number) => {
      doc.setFillColor(241, 245, 249);
      doc.rect(0, 285, 210, 12, 'F');
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(21, 70, 45);
      doc.text('OWEP-EMA-V1 SYSTEM DEMARCATION REPORT • ACCREDITED DESIGN BLUEPRINT', 15, 292);
      doc.text(`Page ${pageNum}`, 190, 292);
    };

    let y = 42;
    let pageNum = 1;
    addFooter(pageNum);

    if (comments.length === 0) {
      doc.setFont('Helvetica', 'italic');
      doc.setFontSize(10);
      doc.setTextColor(21, 70, 45);
      doc.text('No scholarly dispatches registered inside the server mirror database.', 15, y);
    } else {
      comments.forEach((comment, index) => {
        if (y > 235) {
          doc.addPage();
          pageNum++;
          addFooter(pageNum);
          y = 22;
        }

        // Horizontal line separation
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.4);
        doc.line(15, y, 195, y);
        y += 6;

        // Author details
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(21, 70, 45); // deep dark green 
        doc.text(`DISPATCH #${index + 1}: Posted by Dr. ${comment.author}`, 15, y);

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(21, 70, 45); // deep dark green
        doc.text(`Role: ${comment.authorRole}   |   Institution: ${comment.authorInstitution}`, 15, y + 4.5);
        doc.text(`Timestamp: ${new Date(comment.timestamp).toLocaleString()}`, 15, y + 8.5);
        y += 13;

        // Content body text
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(21, 70, 45); // deep dark green
        const textLines = doc.splitTextToSize(`"${comment.content}"`, 175);
        textLines.forEach((line: string) => {
          if (y > 270) {
            doc.addPage();
            pageNum++;
            addFooter(pageNum);
            y = 22;
          }
          doc.text(line, 15, y);
          y += 5;
        });

        // Associated chart specifications
        if (comment.chartState) {
          if (y > 255) {
            doc.addPage();
            pageNum++;
            addFooter(pageNum);
            y = 22;
          }

          doc.setFillColor(248, 250, 252); // slate 50
          doc.setDrawColor(241, 245, 249);
          doc.rect(15, y, 180, 16, 'F');

          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.setTextColor(21, 70, 45);
          doc.text('ATTACHED VECTOR MODEL SPECS & VARIABLES:', 18, y + 5);

          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(21, 70, 45);
          const speciesFriendly = comment.chartState.rodentSpecies.replace('_', ' ').toUpperCase();
          const specReport = `Species: ${speciesFriendly}   |   Temp: ${comment.chartState.specs.temperature}°C   |   P1-P2: ${comment.chartState.specs.p1.toFixed(1)}-${comment.chartState.specs.p2.toFixed(1)} kPa   |   Survival score: ${comment.chartState.survivalScore}%`;
          doc.text(specReport, 18, y + 10);
          y += 20;
        }

        // Response items
        if (comment.replies && comment.replies.length > 0) {
          comment.replies.forEach((rep) => {
            if (y > 255) {
              doc.addPage();
              pageNum++;
              addFooter(pageNum);
              y = 22;
            }

            doc.setDrawColor(241, 245, 249);
            doc.line(22, y, 22, y + 10);

            doc.setFont('Helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(21, 70, 45);
            doc.text(`↳ Reply: Dr. ${rep.author} (${rep.authorRole})`, 25, y + 4.5);

            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.setTextColor(21, 70, 45);

            const replyLines = doc.splitTextToSize(`"${rep.content}"`, 160);
            y += 8;
            replyLines.forEach((line: string) => {
              if (y > 270) {
                doc.addPage();
                pageNum++;
                addFooter(pageNum);
                y = 22;
              }
              doc.text(line, 25, y);
              y += 4.5;
            });
            y += 4;
          });
        }
        y += 6; // separator spacing between parent rows
      });
    }

    doc.save(`ERICON_Scientific_Discussions_Offline_Archival.pdf`);
  };

  // Fetch comments from server core filtered by selected channel
  const fetchComments = async () => {
    setIsLoadingFeed(true);
    try {
      const response = await fetch(`/api/forum/comments?channel=${activeChannel}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (e) {
      console.error('Failed to resolve comments feed from server:', e);
    } finally {
      setIsLoadingFeed(false);
    }
  };

  useEffect(() => {
    fetchComments();
    const interval = setInterval(fetchComments, 10000); // Poll comments every 10 seconds for real-time collaboration
    return () => clearInterval(interval);
  }, [activeChannel]);

  // Handle Log Out
  const handleSignOut = () => {
    localStorage.removeItem('ericon_logged_scientist');
    setCurrentUser(null);
    setAuthSuccess(null);
    setAuthError(null);
  };

  // Handle Registered User
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!regUsername || !regEmail || !regPassword || !regRole || !regInstitution) {
      setAuthError('All registration parameters must be completed.');
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: regUsername,
          email: regEmail,
          password: regPassword,
          role: regRole,
          institution: regInstitution
        })
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Server registration failure');
      }

      // Automatically sign in on success
      localStorage.setItem('ericon_logged_scientist', JSON.stringify(result.user));
      setCurrentUser(result.user);
      setAuthSuccess(`Account created for ${result.user.username}. Logged in successfully.`);
      // Clear signup form
      setRegUsername('');
      setRegEmail('');
      setRegPassword('');
    } catch (err: any) {
      setAuthError(err.message || 'Network registration failure.');
    }
  };

  // Handle Sign In / Login
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernameOrEmail: loginVal,
          password: passwordVal
        })
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Identity verification failure');
      }

      localStorage.setItem('ericon_logged_scientist', JSON.stringify(result.user));
      setCurrentUser(result.user);
      setAuthSuccess(`Verification successful. Welcome back, Dr. ${result.user.username}.`);
      setLoginVal('');
      setPasswordVal('');
    } catch (err: any) {
      setAuthError(err.message || 'Credentials invalid. Please verify inputs.');
    }
  };

  // Google Firebase accredited sign-in handler
  const handleGoogleSignIn = async () => {
    try {
      setAuthError(null);
      setAuthSuccess(null);
      const result = await googleSignIn();
      if (result && result.user) {
        const u = {
          username: result.user.displayName || result.user.email?.split('@')[0] || 'GoogleUser',
          email: result.user.email || '',
          role: 'Accredited Eco-Officer',
          institution: 'Firebase Accredited G-Suite'
        };
        setCurrentUser(u);
        localStorage.setItem('ericon_logged_scientist', JSON.stringify(u));
        setAuthSuccess(`Successfully authenticated via Google credentials as ${u.username}!`);
        setTimeout(() => setAuthSuccess(null), 4000);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Google authentication window closed or expired.');
    }
  };

  // Submit Comments
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError(null);

    if (!currentUser) {
      setCommentError('You must sign in before posting dispatches.');
      return;
    }

    if (!newCommentBody.trim()) {
      setCommentError('Discussion dispatch content cannot be left empty.');
      return;
    }

    let finalBody = newCommentBody.trim();
    if (activeChannel === 'feedback') {
      finalBody = `🛠️ [${feedbackType.toUpperCase()}] • [SEVERITY: ${feedbackSeverity.toUpperCase()}] • [STATUS: ACTIVE/OPEN]\n\n${finalBody}`;
    }

    const payload = {
      author: currentUser.username,
      authorRole: currentUser.role,
      authorInstitution: currentUser.institution,
      content: finalBody,
      channel: activeChannel,
      chartState: attachSimState ? { specs, rodentSpecies, survivalScore } : null
    };

    try {
      const res = await fetch('/api/forum/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failure saving comment');
      }

      setNewCommentBody('');
      fetchComments();
    } catch (err: any) {
      setCommentError(err.message || 'Server connection error when transmitting post.');
    }
  };

  // Submit Reply to Comment
  const handlePostReply = async (commentId: string) => {
    if (!currentUser) return;
    if (!replyBody.trim()) return;

    try {
      const res = await fetch(`/api/forum/comments/${commentId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: currentUser.username,
          authorRole: currentUser.role,
          authorInstitution: currentUser.institution,
          content: replyBody.trim()
        })
      });

      if (!res.ok) {
        throw new Error('Connection failed');
      }

      setReplyBody('');
      setActiveReplyBox(null);
      fetchComments();
    } catch (err: any) {
      console.error(err);
    }
  };

  // Load a colleague's simulation trace into our active controls
  const handleLoadAttachedState = (commentId: string, chartState: any) => {
    if (!chartState || !chartState.specs) return;
    
    onLoadSpecs(chartState.specs);
    if (chartState.rodentSpecies) {
      onLoadRodentSpecies(chartState.rodentSpecies);
    }

    // Flash success loaded banner indicator
    setSuccessLoadId(commentId);
    setTimeout(() => {
      setSuccessLoadId(null);
    }, 4000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-slate-800" id="scientist-charting-discussion-container">
      {/* LEFT COLUMN: SECURITY DIRECTORY & LOGS (4 COLS) */}
      <div className="lg:col-span-4 flex flex-col gap-6" id="discuss-left-panel">
        
        {/* Authentication Card Info */}
        <div className="bg-white border-2 border-slate-200 rounded-sm p-5 shadow-sm">
          <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-emerald-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              ERICON Security Directory
            </h3>
            {currentUser && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </div>

          {currentUser ? (
            // LOGGED IN VIEW WITH ACTIVE CREDENTIALS
            <div className="space-y-4" id="logged-user-credentials">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-sm flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-sm shadow-sm border border-emerald-950/20">
                    {currentUser.username[0].toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-[12px] font-bold text-slate-900">{currentUser.username}</h4>
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest leading-none mt-1">Authorized Colleague</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-2.5 space-y-1.5 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">ROLE:</span>
                    <span className="text-slate-700 font-bold">{currentUser.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">INSTITUTION:</span>
                    <span className="text-slate-700 font-bold truncate max-w-[170px]" title={currentUser.institution}>{currentUser.institution}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">ACCESS LVL:</span>
                    <span className="text-emerald-600 font-extrabold flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" /> PI ACCREDITED
                    </span>
                  </div>
                </div>
              </div>

              {authSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] rounded-sm animate-pulse flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{authSuccess}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleSignOut}
                id="btn-sign-out"
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white border border-slate-950 hover:border-black font-extrabold text-[10px] uppercase tracking-widest rounded-sm transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out Credentials
              </button>
            </div>
          ) : (
            // NOT LOGGED IN VIEW - FORM
            <div id="authenticator-forms" className="space-y-4">
              {/* Tab selector */}
              <div className="grid grid-cols-2 bg-slate-100 p-0.5 rounded-sm border border-slate-200 text-[9px] font-bold uppercase shadow-inner">
                <button
                  type="button"
                  onClick={() => { setAuthView('signin'); setAuthError(null); }}
                  className={`py-2 text-center rounded transition-all cursor-pointer ${authView === 'signin' ? 'bg-white text-emerald-950 border border-slate-300 shadow-xs' : 'text-slate-500'}`}
                >
                  <LogIn className="w-3 h-3 inline mr-1" />
                  Staff Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthView('signup'); setAuthError(null); }}
                  className={`py-2 text-center rounded transition-all cursor-pointer ${authView === 'signup' ? 'bg-white text-emerald-950 border border-slate-300 shadow-xs' : 'text-slate-500'}`}
                >
                  <UserPlus className="w-3 h-3 inline mr-1" />
                  Acquire Account
                </button>
              </div>

              {authError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-[9.5px]/relaxed rounded-sm flex items-start gap-1.5 leading-tight">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {authView === 'signin' ? (
                // SIGN IN FORM
                <form onSubmit={handleSignIn} className="space-y-3.5 text-[10px]" id="auth-signin-form">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-black uppercase">Username or Email</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 p-2 text-slate-800 focus:outline-hidden focus:border-blue-600 font-mono rounded"
                      placeholder="e.g. sjenkins"
                      value={loginVal}
                      onChange={(e) => setLoginVal(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-black uppercase">Field Passcode</label>
                    <div className="relative">
                      <input
                        type="password"
                        className="w-full bg-slate-50 border border-slate-200 p-2 text-slate-800 focus:outline-hidden focus:border-blue-600 font-mono rounded"
                        placeholder="••••••"
                        value={passwordVal}
                        onChange={(e) => setPasswordVal(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold uppercase tracking-wide border border-blue-700 hover:border-blue-800 shadow-xs cursor-pointer transition rounded"
                  >
                    Authenticate Colleague
                  </button>

                  <div className="relative flex py-2 items-center text-[9px]">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-3 text-slate-400 font-extrabold uppercase tracking-wider">OR PERSIST SECURELY</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 rounded font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition hover:border-slate-300 cursor-pointer"
                  >
                    <span className="text-emerald-600 font-black">G</span>
                    Accredit via Google Auth (Firebase)
                  </button>

                  <div className="bg-slate-50 border border-slate-200 p-3 rounded text-[9px]/relaxed text-slate-400">
                    <span className="font-bold text-slate-500">PROTOTYPE ASSIST:</span> Pre-configured credentials are active for instant access:
                    <div className="mt-1 font-mono text-slate-650">
                      • <strong className="text-slate-800">sjenkins</strong> & passcode: <strong className="text-slate-800">123456</strong>
                      <br />• <strong className="text-slate-800">mvance</strong> & passcode: <strong className="text-slate-800">123456</strong>
                    </div>
                  </div>
                </form>
              ) : (
                // SIGN UP FORM
                <form onSubmit={handleSignUp} className="space-y-3 text-[10px]" id="auth-signup-form">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-black uppercase">Choose Username</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-slate-50 border border-slate-200 p-1.5 focus:outline-hidden focus:border-blue-600 font-mono rounded"
                      placeholder="e.g. jjakoniko"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-black uppercase">Staff Email Address</label>
                    <input
                      type="email"
                      required
                      className="w-full bg-slate-50 border border-slate-200 p-1.5 focus:outline-hidden focus:border-blue-600 font-mono rounded"
                      placeholder="name@reynolds.tech"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-black uppercase">Field Passcode</label>
                    <input
                      type="password"
                      required
                      className="w-full bg-slate-50 border border-slate-200 p-1.5 focus:outline-hidden focus:border-blue-600 font-mono rounded"
                      placeholder="••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-black uppercase">Academic / Research Role</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 p-1.5 focus:outline-hidden focus:border-blue-600 font-mono rounded select-none"
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                    >
                      <option value="Senior Epidemiologist">Senior Epidemiologist</option>
                      <option value="Fluid Dynamics Specialist">Fluid Dynamics Specialist</option>
                      <option value="Graduate Research Fellow">Graduate Research Fellow</option>
                      <option value="Field Biologist">Field Biologist</option>
                      <option value="Biosafety Supervisor">Biosafety Supervisor</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-black uppercase">Research Institution</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-slate-50 border border-slate-200 p-1.5 focus:outline-hidden focus:border-blue-600 font-mono rounded"
                      placeholder="ERICON Ecological Group"
                      value={regInstitution}
                      onChange={(e) => setRegInstitution(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold uppercase tracking-wide border border-emerald-900 hover:border-emerald-950 shadow-xs cursor-pointer transition rounded"
                  >
                    Acquire New Account
                  </button>

                  <div className="relative flex py-2 items-center text-[9px]">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-3 text-slate-400 font-extrabold uppercase tracking-wider">OR PERSIST SECURELY</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 rounded font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition hover:border-slate-300 cursor-pointer"
                  >
                    <span className="text-emerald-600 font-black">G</span>
                    Acquire via Google Auth
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Live Vector Telemetry Metadata Indicator */}
        <div id="live-vector-telemetry-indicator" className="bg-slate-900 border border-slate-800 p-5 rounded-sm text-slate-350 shadow-md">
          <h4 id="telemetry-header" className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-3 flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <Database className="w-4 h-4 text-teal-500" />
            Active Vector Telemetry
          </h4>
          <div className="space-y-2 text-[9.5px]">
            <p id="telemetry-paragraph" className="text-[9px]/relaxed text-slate-400 font-mono italic">
              When constructing comments in the peer discussion room, you can automatically capture ERICON's active fluid dynamics vectors.
            </p>
            <div className="border border-slate-805 bg-slate-950 p-3 rounded-sm space-y-1.5 font-mono">
              <div className="flex justify-between items-center text-slate-300">
                <span>Target Genus:</span>
                <span className="font-bold text-amber-400 uppercase">{rodentSpecies.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Tube Pressure (P1-P2):</span>
                <span className="font-bold text-white text-[10px]">{specs.p1.toFixed(1)} – {specs.p2.toFixed(1)} kPa</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Operating. Temperature:</span>
                <span className="font-bold text-white text-[10px]">{specs.temperature.toFixed(1)}°C</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Computed Survival S.I.:</span>
                <span className="font-black text-emerald-400 text-xs">{survivalScore}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* IN-APP INFORUM NOTIFICATION SYSTEM */}
        {currentUser && (
          <div className="bg-white border-2 border-slate-200 rounded-sm p-5 shadow-sm space-y-3.5" id="peer-reply-notification-system">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs uppercase font-extrabold tracking-widest text-emerald-950 flex items-center gap-2">
                <Bell className={`w-4 h-4 text-blue-600 ${unreadNotifications.length > 0 ? 'animate-bounce' : ''}`} />
                Live Dispatch Alerts
              </h3>
              {unreadNotifications.length > 0 && (
                <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[8px] font-black rounded-sm uppercase tracking-wide">
                  {unreadNotifications.length} NEW
                </span>
              )}
            </div>

            {unreadNotifications.length === 0 ? (
              <div className="text-center text-[9px] text-slate-400 font-mono py-2 flex flex-col items-center justify-center gap-1">
                <BellOff className="w-5 h-5 text-slate-300" />
                <span>No pending replies to your research posts.</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[8.5px] font-bold text-slate-400 uppercase">
                  <span>UNREAD SCIENTIFIC CORRESPONDENCE</span>
                  <button 
                    onClick={handleClearAllNotifications}
                    className="text-blue-600 hover:text-blue-800 transition cursor-pointer hover:underline bg-transparent border-0"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {unreadNotifications.map(notif => (
                    <div key={notif.replyId} className="p-2.5 bg-slate-50 border border-slate-250 hover:bg-slate-100 rounded-sm space-y-1.5 text-[9.5px]/relaxed transition flex flex-col relative group">
                      <div className="flex justify-between items-center border-b border-slate-200/50 pb-1 text-[8.5px]">
                        <span className="font-bold text-slate-700">Dr. {notif.replyAuthor}</span>
                        <button
                          onClick={() => handleMarkAsRead(notif.replyId)}
                          className="text-slate-400 hover:text-red-550 transition cursor-pointer bg-transparent border-0"
                          title="Mark reply as read"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-[8px] text-slate-400 italic">
                        On your post: "{notif.commentSnippet}"
                      </div>
                      <p className="text-slate-800 font-mono italic">
                        "{notif.replyContent.length > 80 ? notif.replyContent.substring(0, 80) + '...' : notif.replyContent}"
                      </p>
                      <span className="text-[7.5px] text-slate-405 text-right self-end mt-1">
                        ⏱ {new Date(notif.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* RIGHT COLUMN: PEER DISCUSSION FORUM (8 COLS) */}
      <div className="lg:col-span-8 flex flex-col gap-6" id="discuss-right-forum">
        
        {/* CHANNELS NAVIGATION BAR - ULTRA MODERN */}
        <div id="discuss-channels-tabs" className="grid grid-cols-3 bg-slate-100 p-1 border-2 border-slate-200 rounded-sm gap-1 text-[10px] font-bold uppercase shadow-sm">
          <button
            onClick={() => setActiveChannel('general')}
            className={`py-3 flex flex-col sm:flex-row items-center justify-center gap-1.5 rounded transition-all cursor-[pointer] select-none ${activeChannel === 'general' ? 'bg-emerald-800 text-white shadow-xs border border-emerald-900' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'}`}
          >
            <Users className="w-3.5 h-3.5" />
            General Lounge
          </button>
          <button
            onClick={() => setActiveChannel('research')}
            className={`py-3 flex flex-col sm:flex-row items-center justify-center gap-1.5 rounded transition-all cursor-[pointer] select-none ${activeChannel === 'research' ? 'bg-emerald-800 text-white shadow-xs border border-emerald-900' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'}`}
          >
            <Compass className="w-3.5 h-3.5" />
            Research Channel
          </button>
          <button
            onClick={() => setActiveChannel('feedback')}
            className={`py-3 flex flex-col sm:flex-row items-center justify-center gap-1.5 rounded transition-all cursor-[pointer] select-none ${activeChannel === 'feedback' ? 'bg-indigo-900 text-white shadow-xs border border-indigo-950' : 'text-slate-500 hover:text-indigo-850 hover:bg-slate-200/50'}`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Dev Feedback Portal
          </button>
        </div>

        {/* NEW DISPATCH TRANSMITTER FORM */}
        <div className="bg-white border-2 border-slate-200 rounded-sm p-5 shadow-sm">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#15462D] mb-3 border-b border-slate-100 pb-2.5 flex items-center gap-2">
            {activeChannel === 'general' ? (
              <>
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                Open Staff Lounge Dispatch
              </>
            ) : activeChannel === 'research' ? (
              <>
                <Compass className="w-4 h-4 text-emerald-600" />
                Transmit Core Scientific Simulation Thesis
              </>
            ) : (
              <>
                <Wrench className="w-4 h-4 text-indigo-600" />
                Developer Feedback & Issue Ledger Form
              </>
            )}
          </h3>

          {currentUser ? (
            <form onSubmit={handlePostComment} className="space-y-4" id="post-dispatch-form">
              {commentError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-[10px] rounded-sm flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{commentError}</span>
                </div>
              )}

              {/* Developer feedback special controls */}
              {activeChannel === 'feedback' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-indigo-50/50 p-4 rounded-sm border border-indigo-150 text-[10px] font-bold">
                  <div className="space-y-1">
                    <label className="text-indigo-950 uppercase">Feedback Category</label>
                    <select
                      className="w-full bg-white border border-indigo-200 p-2 font-mono rounded cursor-pointer"
                      value={feedbackType}
                      onChange={(e) => setFeedbackType(e.target.value)}
                    >
                      <option value="Bug Report">🐛 Software Bug / Glitch</option>
                      <option value="Fluid Model Anomaly">💨 Fluid Model Deviation</option>
                      <option value="UI UX Layout Alignment">📱 Responsive UI/UX Suggestion</option>
                      <option value="New Feature Proposal">💡 New Feature Suggestion</option>
                      <option value="Other Issue">⚙️ Operations General</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-indigo-950 uppercase">Severity Priority Level</label>
                    <select
                      className="w-full bg-white border border-indigo-200 p-2 font-mono rounded cursor-pointer"
                      value={feedbackSeverity}
                      onChange={(e) => setFeedbackSeverity(e.target.value)}
                    >
                      <option value="Low">Low - Cosmetic/Typo</option>
                      <option value="Medium">Medium - Standard Inquiry</option>
                      <option value="High">High - Misalignment/Error</option>
                      <option value="Critical">Critical - System Obstruction</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[9.5px] font-black tracking-wider text-slate-400 uppercase">
                  {activeChannel === 'feedback' ? "In-depth Description / Replication Steps" : "Argument Text / Observations Thesis Body"}
                </label>
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 p-3 h-28 text-slate-800 focus:outline-hidden focus:border-blue-600 font-mono text-[11px] placeholder-slate-400 leading-normal rounded"
                  placeholder={
                    activeChannel === 'feedback'
                      ? "Explain what happened, what was expected, and how to replicate the layout/velocity glitch..."
                      : activeChannel === 'general'
                      ? "Say hi, coordinate research schedules, or chat with ERICON staff..."
                      : "Detail biological stress observations, pneumatic fluid gradients, or proposed system tweaks..."
                  }
                  value={newCommentBody}
                  onChange={(e) => setNewCommentBody(e.target.value)}
                />
              </div>

              {/* Toggle to attach simulation State parameters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 outline-slate-100 outline border border-slate-250 p-3 rounded-sm text-[10px]">
                <label className="flex items-center gap-2.5 cursor-pointer text-slate-600 font-bold uppercase select-none">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-emerald-800 outline-hidden border border-slate-300 rounded-sm cursor-pointer"
                    checked={attachSimState}
                    onChange={(e) => setAttachSimState(e.target.checked)}
                  />
                  <span>Attach Active Simulator Model Specs</span>
                </label>
                {attachSimState && (
                  <span className="text-[8.5px] text-slate-500 font-mono px-2 py-0.5 bg-slate-200 font-bold uppercase rounded-xs">
                    📎 {rodentSpecies.replace('_', ' ')} • {specs.temperature}°C • {specs.p1} kPa / {specs.p2} kPa
                  </span>
                )}
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  id="btn-submit-discussion"
                  className={`px-6 py-2.5 text-white font-extrabold uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-xs cursor-[pointer] rounded transition-all border ${
                    activeChannel === 'feedback'
                      ? 'bg-indigo-600 hover:bg-indigo-700 border-indigo-700'
                      : 'bg-emerald-800 hover:bg-emerald-950 border-emerald-900'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  {activeChannel === 'feedback' ? "Register Issue with Developers" : "Transmit Dispatch to Network"}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-sm bg-slate-50/20" id="discuss-unauthorized-overlay">
              <Users className="w-8 h-8 text-slate-350 mx-auto mb-2 animate-bounce-slow" />
              <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Authentication Core Required</h4>
              <p className="text-[9.5px] text-slate-400 max-w-sm mx-auto mt-1 leading-normal font-mono">
                You must sign in via your ERICON Ecological registry credentials on the left directory panel to submit comments, responses, and attached charts.
              </p>
            </div>
          )}
        </div>

        {/* FEED SEPARATOR */}
        <div className="flex items-center justify-between font-mono" id="discuss-feed-toolbar">
          <div className="flex items-center gap-1.5 text-[9.5px] font-black uppercase text-slate-400">
            <span id="historical-commits-title">Historical Commits & Collaboration logs</span>
            <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 text-[8px] rounded-sm font-bold">{comments.length} THREADS</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="pdf-archivist-btn"
              onClick={handleExportPDFArchive}
              className="flex items-center gap-1.5 shadow-xs hover:shadow-xs px-2.5 py-1 text-[8.5px] font-black uppercase text-white bg-emerald-800 hover:bg-emerald-900 border border-emerald-900 rounded-sm transition cursor-pointer"
              title="Download conversation history and simulation parameters as certified PDF report"
            >
              <Download className="w-3 h-3 text-emerald-100" />
              PDF Archivist
            </button>

            <button
              type="button"
              id="refresh-feed-btn"
              onClick={fetchComments}
              className="flex items-center gap-1 shadow-xs hover:shadow-xs px-2.5 py-1 text-[8.5px] font-bold text-slate-600 bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-sm transition cursor-pointer"
              title="Reload comments feed immediately"
            >
              <RefreshCw className={`w-3 h-3 text-slate-550 ${isLoadingFeed ? 'animate-spin' : ''}`} />
              Refresh Feed
            </button>
          </div>
        </div>

        {/* FEED INNER CONTAINER */}
        <div className="space-y-6" id="discuss-feed-threads">
          {isLoadingFeed && comments.length === 0 ? (
            <div className="p-12 text-center text-[10px] text-slate-500 font-mono italic bg-white border rounded">
              Syncing peer servers and downloading cryptographic dispatches...
            </div>
          ) : comments.length === 0 ? (
            <div className="p-12 text-center text-[10px] text-slate-400 font-mono italic bg-white border border-slate-200 rounded-sm shadow-xs">
              No scientific dispatches posted. Use the dialog creator to transmit the first thesis log!
            </div>
          ) : (
            comments.map((comment) => (
              <div 
                key={comment.id}
                id={`thread-card-${comment.id}`}
                className="bg-white border-2 border-slate-200 rounded-sm p-5 shadow-sm space-y-4 hover:border-slate-300 transition-colors"
              >
                {/* Header author details */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded bg-slate-100 text-emerald-800 border border-slate-300 flex items-center justify-center font-bold text-[12px] shadow-xs">
                      {comment.author[0].toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black text-slate-900">Dr. {comment.author}</h4>
                      <p className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 leading-none">
                        {comment.authorRole} • <span className="text-slate-500 font-medium italic">{comment.authorInstitution}</span>
                      </p>
                    </div>
                  </div>

                  <span className="text-[8.5px] font-mono font-bold text-slate-400 bg-slate-50 border border-slate-200 px-2 py-1 rounded" title="Post Timestamp">
                    ⏱ {new Date(comment.timestamp).toLocaleString()}
                  </span>
                </div>

                {/* Content text */}
                <p className="text-slate-700 text-[10.5px]/relaxed whitespace-pre-wrap font-mono font-medium border-l-2 border-slate-200 pl-3 italic">
                  "{comment.content}"
                </p>

                {/* ATTACHED SIMULATOR TRACE STATE */}
                {comment.chartState && (
                  <div className="bg-slate-950 border border-slate-850 p-4 rounded-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-slate-300 select-none">
                    <div className="space-y-1.5 font-mono">
                      <div className="text-[8px] text-teal-400 font-bold uppercase tracking-widest flex items-center gap-1">
                        <BarChart4 className="w-3.5 h-3.5" /> ATTACHED VECTOR MODEL BLUEPRINT
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[9.5px] font-mono text-slate-350">
                        <div>
                          Species: <span className="font-extrabold text-white uppercase">{comment.chartState.rodentSpecies.replace('_', ' ')}</span>
                        </div>
                        <div>
                          Temp: <span className="font-black text-amber-400">{comment.chartState.specs.temperature}°C</span>
                        </div>
                        <div>
                          P1–P2: <span className="font-medium text-slate-200">{comment.chartState.specs.p1.toFixed(1)}–{comment.chartState.specs.p2.toFixed(1)} kPa</span>
                        </div>
                        <div>
                          Survival SI: <span className={`font-black ${comment.chartState.survivalScore >= 50 ? 'text-emerald-400' : 'text-rose-400 animate-pulse'}`}>{comment.chartState.survivalScore ?? 'N/A'}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto self-stretch md:self-auto shrink-0 justify-end">
                      {successLoadId === comment.id ? (
                        <span className="text-[9px] font-black text-emerald-400 py-1.5 px-3 bg-emerald-950/70 border border-emerald-550 rounded-sm flex items-center gap-1.5 uppercase animate-pulse w-full md:w-auto text-center justify-center">
                          <Check className="w-3.5 h-3.5" /> Installed Specs!
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleLoadAttachedState(comment.id, comment.chartState)}
                          className="py-1.5 px-3.5 bg-sky-800 hover:bg-sky-900 text-white font-extrabold uppercase text-[9px] tracking-widest border border-sky-950 hover:border-black rounded-sm shadow-xs cursor-pointer transition flex items-center gap-1.5 w-full md:w-auto justify-center"
                          title="Instantly calibrate the main fluid and species dashboard sliders to match these exact variables"
                        >
                          <Compass className="w-3.5 h-3.5 text-sky-250 shrink-0" />
                          Set Simulator To Specs
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* REPLIES BUNDLE BLOCK */}
                {(comment.replies && comment.replies.length > 0) && (
                  <div className="bg-slate-50 border border-slate-150 p-4 rounded-sm space-y-3.5 ml-4 md:ml-8 relative" id="reply-list-container">
                    {/* Visual left thread guideline matching architectural layouts */}
                    <div className="absolute top-0 bottom-0 left-[-16px] md:left-[-24px] w-0.5 border-l-2 border-dashed border-slate-200" />

                    <div className="text-[8.5px] text-slate-400 font-extrabold uppercase tracking-widest border-b border-slate-100 pb-1.5">
                      Peer Responses ({comment.replies.length})
                    </div>

                    <div className="space-y-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="text-[10px] space-y-1 bg-white border border-slate-200 p-3 rounded shadow-xs relative">
                          <div className="flex justify-between items-center border-b border-slate-50 pb-1 mb-1.5 text-[8.5px]">
                            <div className="font-extrabold text-slate-800">
                              Dr. {reply.author} <span className="text-[7.5px] text-slate-400 uppercase font-medium">({reply.authorRole} • {reply.authorInstitution})</span>
                            </div>
                            <span className="text-slate-400 text-[8px]">{new Date(reply.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="text-slate-700 italic pr-2 font-mono">
                            "{reply.content}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Peer Reactions Feedback Panel */}
                <div className="flex flex-wrap items-center gap-2 py-2 border-t border-slate-100/80 text-[9px]">
                  <span className="text-slate-400 font-bold uppercase tracking-wide mr-1 select-none">Peer Endorsements:</span>
                  
                  {/* Insightful */}
                  <button
                    type="button"
                    onClick={() => handleReactComment(comment.id, 'insightful')}
                    disabled={!currentUser}
                    title={currentUser ? "Mark as Insightful Insight" : "Sign in to upvote"}
                    className="ericon-reaction-btn ericon-reaction-insightful flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-amber-50 border border-amber-200/50 hover:border-amber-405 text-amber-850 transition cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="font-bold">Insightful</span>
                    <span className="ericon-badge-num px-1.5 py-0.2 bg-amber-200/40 rounded-xs font-mono font-bold text-amber-900">{comment.reactions?.insightful || 0}</span>
                  </button>

                  {/* Peer Verified */}
                  <button
                    type="button"
                    onClick={() => handleReactComment(comment.id, 'verified')}
                    disabled={!currentUser}
                    title={currentUser ? "Mark as Method Verified" : "Sign in to upvote"}
                    className="ericon-reaction-btn ericon-reaction-verified flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-emerald-50 border border-emerald-200/50 hover:border-emerald-405 text-emerald-850 transition cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-bold">Verified</span>
                    <span className="ericon-badge-num px-1.5 py-0.2 bg-emerald-200/40 rounded-xs font-mono font-bold text-emerald-900">{comment.reactions?.verified || 0}</span>
                  </button>

                  {/* Warning Danger */}
                  <button
                    type="button"
                    onClick={() => handleReactComment(comment.id, 'alert')}
                    disabled={!currentUser}
                    title={currentUser ? "Mark as Vital Warning Indicator" : "Sign in to upvote"}
                    className="ericon-reaction-btn ericon-reaction-warning flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-rose-50 border border-rose-200/50 hover:border-rose-405 text-rose-850 transition cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="font-bold">Crucial Warning</span>
                    <span className="ericon-badge-num px-1.5 py-0.2 bg-rose-200/40 rounded-xs font-mono font-bold text-rose-900">{comment.reactions?.alert || 0}</span>
                  </button>

                  {/* Wind / Fluid physics */}
                  <button
                    type="button"
                    onClick={() => handleReactComment(comment.id, 'fluid')}
                    disabled={!currentUser}
                    title={currentUser ? "Mark as Outstanding Fluid Dynamics Application" : "Sign in to upvote"}
                    className="ericon-reaction-btn ericon-reaction-fluid flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-sky-50 border border-sky-200/50 hover:border-sky-405 text-sky-850 transition cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    <Wind className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    <span className="font-bold">Fluid Dynamics</span>
                    <span className="ericon-badge-num px-1.5 py-0.2 bg-sky-200/40 rounded-xs font-mono font-bold text-sky-900">{comment.reactions?.fluid || 0}</span>
                  </button>
                </div>

                {/* BOTTOM ACTION BAR AND NESTED DISCUSS FORM */}
                <div className="flex justify-between items-center pt-2.5 text-[9px] font-bold uppercase border-t border-slate-100">
                  <span className="text-slate-400 tracking-wider">
                    COMMIT REF: {comment.id.split('-')[1]}
                  </span>

                  {currentUser ? (
                    activeReplyBox === comment.id ? (
                      <button
                        type="button"
                        onClick={() => setActiveReplyBox(null)}
                        className="py-1 px-3 bg-slate-200 hover:bg-slate-350 text-slate-700 rounded transition"
                      >
                        Cancel Response
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setActiveReplyBox(comment.id); setReplyBody(''); }}
                        className="ericon-pen-response-btn py-1 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition cursor-pointer flex items-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3 text-slate-500" />
                        Pen Response
                      </button>
                    )
                  ) : (
                    <span className="text-slate-400 italic">Sign In To Reply</span>
                  )}
                </div>

                {/* REPLY TRANSMISSION BOX */}
                {activeReplyBox === comment.id && (
                  <div className="mt-3 bg-slate-50 p-3 rounded-sm border border-slate-205 flex flex-col sm:flex-row gap-2 transition-all">
                    <input
                      type="text"
                      className="flex-grow bg-white border border-slate-200 rounded px-3 py-2 text-[10px] text-slate-850 font-mono placeholder-slate-400 focus:outline-hidden focus:border-blue-600"
                      placeholder={`Drafting peer response to Dr. ${comment.author}...`}
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                    />
                    <button
                      type="button"
                      disabled={!replyBody.trim()}
                      onClick={() => handlePostReply(comment.id)}
                      className="px-4 py-2 bg-emerald-800 disabled:opacity-40 hover:bg-emerald-900 text-white font-extrabold uppercase text-[9px] tracking-wider rounded-sm shadow-xs transition-all cursor-pointer"
                    >
                      Xmit Reply
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
