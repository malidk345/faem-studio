export const springTransition = { type: "spring", bounce: 0, duration: 0.5 };
export const contentTransition = { duration: 0.3, ease: [0.23, 1, 0.32, 1] };

export const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.1 }
  },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

export const itemVariants = {
  hidden: { opacity: 0, y: 12, filter: 'blur(4px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: springTransition }
};
