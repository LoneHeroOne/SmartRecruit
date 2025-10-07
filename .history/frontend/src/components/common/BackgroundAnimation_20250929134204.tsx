import { motion } from "framer-motion";

const colors = [
  ["#0B5AAA", "#E03E3E"], // Blue → Red
  ["#E03E3E", "#FFC107"], // Red → Yellow
  ["#FFC107", "#4CAF50"], // Yellow → Green
  ["#4CAF50", "#6A1B9A"], // Green → Purple
  ["#6A1B9A", "#0B5AAA"], // Purple → Blue
];

export default function BackgroundAnimation() {
  return (
    <motion.div
      className="absolute inset-0 -z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <motion.div
        className="w-full h-full"
        animate={{ background: colors.map(([from, to]) => `linear-gradient(135deg, ${from}, ${to})`) }}
        transition={{
          duration: 15,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop",
        }}
      />
    </motion.div>
  );
}
