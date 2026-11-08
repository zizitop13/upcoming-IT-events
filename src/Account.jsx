import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, GithubAuthProvider, onAuthStateChanged, signInWithPopup, signOut, reauthenticateWithPopup, deleteUser } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, runTransaction, serverTimestamp, getDocs, writeBatch } from 'firebase/firestore';
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
  async function deleteAccount() {
    if (!auth?.currentUser || !db) return;
    setError('');
    try {
      const currentUser = auth.currentUser;
      await reauthenticateWithPopup(currentUser, new GithubAuthProvider());
      const savedEvents = await getDocs(collection(db, 'users', currentUser.uid, 'starredEvents'));
      for (let offset = 0; offset < savedEvents.docs.length; offset += 450) {
        const batch = writeBatch(db);
        savedEvents.docs.slice(offset, offset + 450).forEach(item => batch.delete(item.ref));
        await batch.commit();
      }
      await deleteUser(currentUser);
    } catch (e) {
      setError(e.code === 'auth/popup-closed-by-user'
        ? 'Account deletion was cancelled during GitHub verification.'
        : 'Could not delete your account. Please sign in again and retry.');
      throw e;
    }
  }
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
  return <Account.Provider value={{ user, stars, ready, starsReady, pending, configured, login, logout, deleteAccount, toggle }}>
    {error && <div className="account-error" role="alert">{error}</div>}{children}
  </Account.Provider>;
}
export function AccountButton({ compact = false }) {
  const a = useAccount();
  return <button className={`account-button ${compact ? 'account-button-compact' : ''}`} disabled={!a.configured || !a.ready} title={!a.configured ? 'Sign-in is being configured' : a.user ? 'Sign out' : 'Sign in with GitHub'} aria-label={a.user ? 'Sign out' : 'Sign in with GitHub'} onClick={a.user ? a.logout : a.login}>{a.user ? 'Sign out' : compact ? <><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="m10 17 5-5-5-5M15 12H3"/></svg><span>Sign in with GitHub</span></> : 'Sign in with GitHub'}</button>;
}
export function StarButton({ event }) {
  const a = useAccount(); const starred = a.stars.has(event.key);
  return <button className={`star-button ${starred ? 'starred' : ''}`} aria-label={`${starred ? 'Unstar' : 'Star'} ${event.name}`} aria-pressed={starred} disabled={!a.configured || !a.ready || (a.user && !a.starsReady) || a.pending.has(event.key)} title={!a.configured ? 'Sign-in is being configured' : !a.user ? 'Sign in to star events' : undefined} onClick={() => a.toggle(event)}>{starred ? '★' : '☆'}</button>;
}
