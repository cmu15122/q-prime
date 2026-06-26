import { motion, MotionValue, useTransform } from 'framer-motion';
import { STUDENTS, WAIT_TIME_AT_PEAK_MIN } from './students';

export default function MockSlack({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0.84, 0.9, 1.0], [0, 1, 1]);
  const y = useTransform(progress, [0.84, 0.9], [22, 0]);
  return (
    <motion.div style={{ opacity, y }} className="mock-slack">
      <div className="mock-slack__avatar">Q</div>
      <div>
        <div className="mock-slack__head">
          <strong>OHQ Bot</strong>
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>APP</span>
          <span className="ts">2:14 PM</span>
        </div>
        <div className="mock-slack__body">
          Wait time on the queue is <code>{WAIT_TIME_AT_PEAK_MIN}m</code> with{' '}
          <code>{STUDENTS.length}</code> students waiting.
          <br />
          <span style={{ color: 'rgba(255,255,255,0.55)' }}>#15-122-staff</span>
        </div>
      </div>
    </motion.div>
  );
}
