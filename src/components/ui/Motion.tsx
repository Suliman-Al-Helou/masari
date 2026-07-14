"use client";

import { motion, type HTMLMotionProps, type Variants } from "motion/react";
import { authFormVariants, fadeIn, scaleIn } from "@/lib/motion";

type MotionType = "fade" | "scale" | "auth-form";

type Props = HTMLMotionProps<"div"> & {
  type?: MotionType;
  variants?: Variants;
};

const variantsMap: Record<MotionType, Variants> = {
  fade: fadeIn,
  scale: scaleIn,
  "auth-form": authFormVariants,
};

export default function Motion({
  type = "fade",
  variants,
  children,
  ...props
}: Props) {
  return (
    <motion.div
      variants={variants ?? variantsMap[type]}
      initial="hidden"
      animate="visible"
      exit="exit"
      {...props}
    >
      {children}
    </motion.div>
  );
}

Motion.displayName = "Motion";