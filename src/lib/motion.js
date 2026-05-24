export const motionEase = [0.22, 1, 0.36, 1];

const defaultViewport = { once: true, amount: 0.12, margin: '0px 0px -8% 0px' };
const calmTransition = { duration: 0.42, ease: motionEase };

export const fadeUp = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: defaultViewport,
  transition: calmTransition,
};

export const fadeIn = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: defaultViewport,
  transition: { duration: 0.36, ease: motionEase },
};

export const fadeLeft = {
  initial: { opacity: 0, x: -12 },
  whileInView: { opacity: 1, x: 0 },
  viewport: defaultViewport,
  transition: calmTransition,
};

export const fadeRight = {
  initial: { opacity: 0, x: 12 },
  whileInView: { opacity: 1, x: 0 },
  viewport: defaultViewport,
  transition: calmTransition,
};

export const cardHover = {
  whileHover: { y: -2, transition: { duration: 0.18, ease: motionEase } },
  whileTap: { scale: 0.992 },
};

export const subtleTap = {
  whileTap: { scale: 0.994 },
};

export const navPillSpring = {
  type: 'spring',
  stiffness: 260,
  damping: 32,
  mass: 0.9,
};
