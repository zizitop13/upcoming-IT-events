import { describe, it, expect, vi } from 'vitest';
import { applyStarClick } from './stars.js';
const event = { key: 'example::2027' };
describe('star clicks from lists and calendars', () => {
  it('saves the original clicked event after sign-in', async () => {
    const write = vi.fn(); const login = vi.fn().mockResolvedValue({ uid: 'alice' });
    await applyStarClick({ user: null, login, starred: false, event, write });
    expect(write).toHaveBeenCalledWith('alice', event, false);
  });
  it('does not write when sign-in is cancelled', async () => {
    const write = vi.fn();
    await applyStarClick({ user: null, login: async () => undefined, event, write });
    expect(write).not.toHaveBeenCalled();
  });
  it('adds and removes stars for an existing account', async () => {
    const write = vi.fn(); const login = vi.fn();
    for (const starred of [false, true]) {
      await applyStarClick({ user: { uid: 'bob' }, login, starred, event, write });
      expect(write).toHaveBeenLastCalledWith('bob', event, starred);
    }
    expect(login).not.toHaveBeenCalled();
  });
  it('propagates persistence failures for the visible error message', async () => {
    await expect(applyStarClick({ user: { uid: 'bob' }, event, write: async () => { throw Error('denied'); } })).rejects.toThrow('denied');
  });
});
