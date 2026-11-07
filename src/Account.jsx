import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, GithubAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { applyStarClick, starDocumentId } from './lib/stars.js';

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
  const pendingKeys = useRef(new Set());
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
    try { return (await signInWithPopup(auth, new GithubAuthProvider())).user; }
    catch (e) { if (e.code !== 'auth/popup-closed-by-user') setError('GitHub sign-in failed. Please try again.'); }
  }
  async function logout() { try { await signOut(auth); } catch { setError('Could not sign out. Please try again.'); } }
  async function toggle(event) {
    if (!configured || (user && !starsReady) || pendingKeys.current.has(event.key)) return;
    pendingKeys.current.add(event.key);
    setPending(new Set(pendingKeys.current)); setError('');
    try {
      await applyStarClick({ user, login, starred: stars.has(event.key), event,
        write: async (uid, item, remove) => {
          const ref = doc(db, 'users', uid, 'starredEvents', starDocumentId(item.key));
          await runTransaction(db, async transaction => {
            const existing = await transaction.get(ref);
            if (remove) transaction.delete(ref);
            else if (!existing.exists()) transaction.set(ref, { eventKey: item.key, createdAt: serverTimestamp() });
          });
        }
      });
    } catch { setError('Could not save your star. Please try again.'); }
    finally { pendingKeys.current.delete(event.key); setPending(new Set(pendingKeys.current)); }
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
