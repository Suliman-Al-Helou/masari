import type { Transition, Variants } from "motion/react";

/**
 * Default transition used for most UI animations.
 */
export const defaultTransition: Transition = {
  duration: 0.25,
  ease: "easeOut",
};

/**
 * Spring-like transition for toast animation.
 */
export const bounceTransition: Transition = {
  duration: 0.3,
  ease: [0.34, 1.56, 0.64, 1],
};

/**
 * Auth form enter/exit animation.
 */
export const authFormVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
    filter: "blur(4px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: defaultTransition,
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: "blur(4px)",
    transition: {
      duration: 0.16,
      ease: "easeIn",
    },
  },
};

/**
 * Simple fade animation.
 */
export const fadeIn: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: defaultTransition,
  },
  exit: {
    opacity: 0,
    transition: defaultTransition,
  },
};

/**
 * Scale animation for modals, cards, or small UI elements.
 */
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: defaultTransition,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: defaultTransition,
  },
};

/**
 * Button hover and tap animation.
 */
export const buttonVariants: Variants = {
  initial: {
    scale: 1,
    y: 0,
  },
  hover: {
    scale: 1.04,
    y: -1,
    transition: {
      duration: 0.18,
      ease: "easeOut",
    },
  },
  tap: {
    scale: 0.97,
    y: 0,
    transition: {
      duration: 0.1,
      ease: "easeIn",
    },
  },
};

/**
 * Toast enter/exit animation.
 */
export const toastVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: bounceTransition,
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.15,
      ease: "easeIn",
    },
  },
};



