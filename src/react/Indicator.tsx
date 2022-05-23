import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Container, Image, Link, Text } from './Indicator.style';
import { LyricsState, useLyricsState } from './hooks/lyrics-state';
import EventEmitter from '../event/EventEmitter';

export type IndicatorProps = {
  listener: EventEmitter<LyricsState>;
};

const REPOSITORY_URL = 'https://github.com/Cristian-Sknz/kashi-extension';

const Indicator: React.FC<IndicatorProps> = ({ listener }) => {
  const state = useLyricsState(listener);

  return (
    <AnimatePresence>
      {state !== 'Idle' && (
        <Container layout key={state}>
          <Link href={REPOSITORY_URL} rel='external' target={'_blank'}>
            <Image src={`${REPOSITORY_URL}/raw/master/public/icons/icon48.png`}/>
          </Link>
          <Text>{state}</Text>
        </Container>
      )}
    </AnimatePresence>
  );
};

export default Indicator;