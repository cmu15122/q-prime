import { motion, MotionValue, useTransform } from 'framer-motion';
import { BEATS, Beat } from './students';

function CaptionItem({ progress, beat }: { progress: MotionValue<number>; beat: Beat }) {
  const [a, b, c, d] = beat.range;
  const opacity = useTransform(progress, [a, b, c, d], [0, 1, 1, 0]);
  return (
    <motion.span className="ohq-rail__caption" style={{ opacity }}>
      {beat.emText && <em>{beat.emText}</em>}
      {beat.text}
    </motion.span>
  );
}

function Tick({ progress, beat }: { progress: MotionValue<number>; beat: Beat }) {
  const [a, , c] = beat.range;
  // Tick fills as the user enters this beat, holds full while it's active,
  // dims slightly past it (still on, but de-emphasized).
  const fill = useTransform(progress, [a - 0.01, a, c], [0, 1, 1]);
  const bg = useTransform(fill, [0, 1], ['var(--ohq-rule-soft)', 'var(--ohq-forest)']);
  return <motion.span className="ohq-rail__tick" style={{ background: bg }} />;
}

export default function CaptionRail({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="ohq-rail">
      <span className="ohq-rail__step">Live demo · scroll ↓</span>
      <div className="ohq-rail__captions">
        {BEATS.map((b) => (
          <CaptionItem key={b.step} progress={progress} beat={b} />
        ))}
      </div>
      <div className="ohq-rail__ticks">
        {BEATS.map((b) => (
          <Tick key={b.step} progress={progress} beat={b} />
        ))}
      </div>
    </div>
  );
}
