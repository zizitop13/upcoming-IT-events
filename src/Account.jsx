import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, GithubAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { starDocumentId } from './lib/stars.js';

const config = { apiKey: import.meta.env.VITE_FIREBASE_API_KEY, authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID, appId: import.meta.env.VITE_FIREBASE_APP_ID };
const configured = Object.values(config).every(Boolean);
const app = configured ? initializeApp(config) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const Account = createContext(null);
export const useAccount = () => useContext(Account);

export function AccountProvider({ children }) {
  const [user, setUser] = useState(null);
  const [stars, setStars] = useState(new Set());
  const [ready, setReady] = useState(!configured);
  const [starsReady, setStarsReady] = useState(false);
  const [pending, setPending] = useState(new Set());
  const [error, setError] = useState('');
  useEffect(() => auth ? onAuthStateChanged(auth, value => { setUser(value); setStars(new Set()); setStarsReady(false); setReady(true); setError(''); }) : undefined, []);
  useEffect(() => {
    if (!user) return;
    return onSnapshot(collection(db, 'users', user.uid, 'starredEvents'), snapshot => {
      setStars(new Set(snapshot.docs.map(item => item.data().eventKey))); setStarsReady(true);
    }, () => { setStarsReady(false); setError('Could not load your starred events. Please try signing in again.'); });
  }, [user]);
  async function login() {
    if (!auth) return;
    setError('');
    try { await signInWithPopup(auth, new GithubAuthProvider()); }
    catch (e) { if (e.code !== 'auth/popup-closed-by-user') setError('GitHub sign-in failed. Please try again.'); }
  }
  async function logout() { try { await signOut(auth); } catch { setError('Could not sign out. Please try again.'); } }
  async function toggle(event) {
    if (!user) { await login(); return; }
    if (!starsReady || pending.has(event.key)) return;
    setPending(old => new Set(old).add(event.key)); setError('');
    try {
      const ref = doc(db, 'users', user.uid, 'starredEvents', starDocumentId(event.key));
      if (stars.has(event.key)) await deleteDoc(ref);
      else await setDoc(ref, { eventKey: event.key, createdAt: serverTimestamp() });
    } catch { setError('Could not save your star. Please try again.'); }
    finally { setPending(old => { const next = new Set(old); next.delete(event.key); return next; }); }
  }
  return <Account.Provider value={{ user, stars, ready, starsReady, pending, configured, login, logout, toggle }}>
    {error && <div className="account-error" role="alert">{error}</div>}{children}
  </Account.Provider>;
}
export function AccountButton() {
  const a = useAccount();
  return <button disabled={!a.configured || !a.ready} title={!a.configured ? 'Sign-in is being configured' : undefined} onClick={a.user ? a.logout : a.login}>{a.user ? 'Sign out' : 'Sign in with GitHub'}</button>;
}
export function StarButton({ event }) {
  const a = useAccount(); const starred = a.stars.has(event.key);
  return <button className={`star-button ${starred ? 'starred' : ''}`} aria-label={`${starred ? 'Unstar' : 'Star'} ${event.name}`} aria-pressed={starred} disabled={!a.configured || !a.ready || (a.user && !a.starsReady) || a.pending.has(event.key)} title={!a.configured ? 'Sign-in is being configured' : !a.user ? 'Sign in to star events' : undefined} onClick={() => a.toggle(event)}>{starred ? '★' : '☆'}</button>;
}
