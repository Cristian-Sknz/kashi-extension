import { css } from '@emotion/css';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

export const Root = css`
  position: absolute;
  bottom: 5px;
  right: 2.5%;
`

export const Container = styled(motion.div)`
  background: #8325db;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 0.4rem;
  padding: 0.2rem 0.6rem;
  user-select: none;
  box-shadow: 0px 0px 2px 0px #0006;
`;

Container.defaultProps = {
  initial: {
    y: -25,
    opacity: 0
  },
  animate: {
    y: 0,
    opacity: 1
  },
  exit: {
    y: -25,
    opacity: 0
  },
  whileHover: {
    opacity: 0.8,
    scale: 1.03
  }
};

export const Link = styled.a`
  cursor: pointer;
`;

export const Image = styled.img`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: block;
`;

export const Text = styled.span`
  color: #fff;
  font-weight: 600;
  font-family: "spotify-circular";
`;