import { useEffect, useState } from 'react';
import EventEmitter from '../../event/EventEmitter';

export enum LyricsState {
  Idle = 'Idle',
  Loading = 'Loading',
  Loaded = 'Loaded',
};


export function useLyricsState(listener: EventEmitter<LyricsState>) {
  const [state, setState] = useState<LyricsState>(LyricsState.Idle);

  useEffect(() => {
    const value = listener.on('state', (e) => {
      setState(e.detail);
    });

    return () => listener.off(value);
  }, [listener])

  return state;
}