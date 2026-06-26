import { useEffect, useState } from 'react';
import { motion, MotionValue, useTransform } from 'framer-motion';
import { STUDENTS, MockStudent, WAIT_TIME_AT_PEAK_MIN } from './students';
import MockMessageFlow from './MockMessageFlow';
import MockSlack from './MockSlack';

// Per-row reveal timings — staggered so scrolling visibly fills the queue.
const ROW_RANGES: Array<[number, number]> = [
  [0.04, 0.1],
  [0.08, 0.14],
  [0.12, 0.18],
  [0.16, 0.22],
  [0.2, 0.26],
];

// Cooldown student appears at the bottom for the override beat.
const COOLDOWN_RANGE: [number, number] = [0.66, 0.74];

// Top row "becomes helping" — the Help button stack swaps for a live timer +
// Cancel + Done, and the row gets a green tint.
const HELPING_RANGE: [number, number] = [0.36, 0.46];
// Top row's helping treatment fades back to neutral around the slack-pings end.
const HELPING_HOLD = 0.99;

// MM:SS / HH:MM:SS formatter — mirrors HelpTimer.tsx so the look matches the
// real app, but kept local so the landing page doesn't pull in MUI's styled().
const pad = (n: number): string => (n < 10 ? `0${n}` : `${n}`);
const formatElapsed = (ms: number): string => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  if (hours > 0) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(minutes)}:${pad(seconds)}`;
};

// A live ticking timer that resets every time the demo enters/leaves the
// viewport, or when the user scrolls back up past the helping beat. Tracking
// the start as a Date.now() snapshot (rather than a counter) keeps it accurate
// across tab-throttling.
function MockTimer({ progress, isInView }: { progress: MotionValue<number>; isInView: boolean }) {
  const isHelpingActive = useTransform(progress, (p) =>
    p >= HELPING_RANGE[1] && p < HELPING_HOLD ? 1 : 0,
  );
  const [startMs, setStartMs] = useState<number | null>(null);
  const [, setTick] = useState(0);

  // Start/reset when the helping range is entered or left, or when the
  // demo section enters/leaves the viewport.
  useEffect(() => {
    const apply = (active: number) => {
      if (active && isInView) {
        setStartMs((prev) => prev ?? Date.now());
      } else {
        setStartMs(null);
      }
    };
    apply(isHelpingActive.get());
    return isHelpingActive.on('change', apply);
  }, [isHelpingActive, isInView]);

  // Tick once per second while running.
  useEffect(() => {
    if (startMs === null) return undefined;
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [startMs]);

  const elapsed = startMs === null ? 0 : Date.now() - startMs;
  return <span className="mock-row__timer">{formatElapsed(elapsed)}</span>;
}

function StatsCard({ progress }: { progress: MotionValue<number> }) {
  // Counter ramps from 0 → 5 as rows appear. The 6th cooldown student isn't
  // counted — it appears later after another student "completes" in the demo.
  const peakCount = STUDENTS.filter((s) => !s.cooldown).length;
  const count = useTransform(
    progress,
    [0.04, 0.1, 0.14, 0.18, 0.22, 0.26],
    [0, 1, 2, 3, 4, peakCount],
  );
  // Wait time scales with the student count, peaking at WAIT_TIME_AT_PEAK_MIN
  // so it lines up with the slack ping at the end.
  const eta = useTransform(count, (c) => Math.round((c / peakCount) * WAIT_TIME_AT_PEAK_MIN));
  // The queue is "open" once the first student arrives.
  const openOpacity = useTransform(progress, [0.0, 0.04, 0.06], [0, 0, 1]);
  const closedOpacity = useTransform(progress, [0.0, 0.04, 0.06], [1, 1, 0]);
  return (
    <div className="mock-stats">
      <div className="mock-stats__col">
        <h4>
          The queue is{' '}
          <span style={{ position: 'relative', display: 'inline-block' }}>
            <motion.span className="closed" style={{ opacity: closedOpacity }}>
              CLOSED
            </motion.span>
            <motion.span
              className="open"
              style={{ opacity: openOpacity, position: 'absolute', left: 0, top: 0 }}
            >
              OPEN
            </motion.span>
          </span>
        </h4>
      </div>
      <div className="mock-stats__divider" />
      <div className="mock-stats__col">
        <p>
          There are{' '}
          <strong>
            <motion.span>{useTransform(count, (c) => Math.round(c))}</motion.span> students
          </strong>{' '}
          on the queue.
        </p>
        <p>
          Estimated wait time is{' '}
          <strong>
            ~<motion.span>{eta}</motion.span> minutes
          </strong>{' '}
          from the end of the queue.
        </p>
      </div>
    </div>
  );
}

// The `…` overflow trigger every row in the real app gets. Static; the
// animated open/close happens inside MockMessageFlow on row 2.
function OverflowDots() {
  return (
    <span className="mock-overflow" aria-hidden>
      <span />
      <span />
      <span />
    </span>
  );
}

// Row 2's overflow trigger gets a press treatment right before the menu opens
// — a quick scale-down + a green-tinted background highlight that lingers
// while the menu is open, so the cause-and-effect of click → menu reads.
function PressedOverflowDots({ progress }: { progress: MotionValue<number> }) {
  const scale = useTransform(progress, [0.46, 0.475, 0.49], [1, 0.85, 1]);
  const bgOpacity = useTransform(progress, [0.46, 0.48, 0.55, 0.57], [0, 1, 1, 0]);
  return (
    <motion.span className="mock-overflow mock-overflow--pressed" style={{ scale }} aria-hidden>
      <motion.span className="mock-overflow__bg" style={{ opacity: bgOpacity }} />
      <span />
      <span />
      <span />
    </motion.span>
  );
}

interface RowProps {
  progress: MotionValue<number>;
  index: number;
  student: MockStudent;
  isInView: boolean;
}

function MockRow({ progress, index, student, isInView }: RowProps) {
  const [start, end] = ROW_RANGES[index];
  const isTop = index === 0;
  const isSecond = index === 1;

  // Continuous appearance: scale-y from 0 to 1 (height) + opacity + slight y-shift.
  const opacity = useTransform(progress, [start - 0.005, start, end], [0, 0.05, 1]);
  const y = useTransform(progress, [start, end], [-6, 0]);
  const maxHeight = useTransform(progress, [start, end], ['0px', '120px']);

  // Top row: helping tint + button stack swap. Ranges overlap so the action
  // column never goes blank during the transition.
  const helpingTint = useTransform(
    progress,
    [HELPING_RANGE[0], HELPING_RANGE[1], HELPING_HOLD],
    [0, 1, 1],
  );
  const helpStackOpacity = useTransform(progress, [0.36, 0.43], [1, 0]);
  const doneStackOpacity = useTransform(progress, [0.4, 0.46], [0, 1]);

  // Second row: small "✓ Sent" chip flashes when the message dialog closes.
  const sentOpacity = useTransform(progress, [0.61, 0.625, 0.65, 0.67], [0, 1, 1, 0]);

  return (
    <motion.div
      className="mock-row"
      style={{
        opacity,
        y,
        maxHeight,
        overflow: 'hidden',
      }}
    >
      {isTop && (
        <motion.div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'color-mix(in srgb, var(--ohq-forest) 12%, transparent)',
            opacity: helpingTint,
            pointerEvents: 'none',
          }}
        />
      )}
      <div className="mock-row__info" style={{ position: 'relative', zIndex: 1 }}>
        <div className="mock-row__name">{student.name}</div>
        <div className="mock-row__email">{student.email}</div>
        <div className="mock-row__loc">[{student.location}]</div>
      </div>
      <div className="mock-row__detail" style={{ position: 'relative', zIndex: 1 }}>
        <span className="mock-row__topic">[{student.topic}]</span>
        <div className="mock-row__q">{student.question}</div>
      </div>
      <div className="mock-row__actions" style={{ position: 'relative', zIndex: 1 }}>
        {isTop ? (
          <div className="mock-row__action-stack">
            <motion.div
              className="mock-row__action-stack-layer"
              style={{ opacity: helpStackOpacity }}
            >
              <button className="mock-btn mock-btn--primary" type="button">
                Help
              </button>
              <OverflowDots />
            </motion.div>
            <motion.div
              className="mock-row__action-stack-layer"
              style={{ opacity: doneStackOpacity }}
            >
              <MockTimer progress={progress} isInView={isInView} />
              <button className="mock-btn mock-btn--ghost" type="button">
                Cancel
              </button>
              <button className="mock-btn mock-btn--primary" type="button">
                Done
              </button>
              <OverflowDots />
            </motion.div>
          </div>
        ) : isSecond ? (
          <>
            <motion.span className="mock-row__sent-chip" style={{ opacity: sentOpacity }}>
              ✓ Sent
            </motion.span>
            <button className="mock-btn mock-btn--primary" type="button">
              Help
            </button>
            <PressedOverflowDots progress={progress} />
          </>
        ) : (
          <>
            <button className="mock-btn mock-btn--primary" type="button">
              Help
            </button>
            <OverflowDots />
          </>
        )}
      </div>
    </motion.div>
  );
}

// Cooldown row — the realistic override flow. The student "pops up" at the
// bottom of the queue with an amber tint, a [Cooldown] label, and an Approve
// action that the TA presses by hand. Mirrors EntryTails.tsx + StudentEntry.tsx
// behavior when status === 'cooldown_violation'.
function MockCooldownRow({
  progress,
  student,
}: {
  progress: MotionValue<number>;
  student: MockStudent;
}) {
  const [start, end] = COOLDOWN_RANGE;
  const opacity = useTransform(progress, [start - 0.005, start, end], [0, 0.05, 1]);
  const y = useTransform(progress, [start, end], [-6, 0]);
  const maxHeight = useTransform(progress, [start, end], ['0px', '120px']);

  return (
    <motion.div
      className="mock-row mock-row--cooldown"
      style={{ opacity, y, maxHeight, overflow: 'hidden' }}
    >
      <div className="mock-row__info" style={{ position: 'relative', zIndex: 1 }}>
        <div className="mock-row__name">{student.name}</div>
        <div className="mock-row__email">{student.email}</div>
        <div className="mock-row__loc">[{student.location}]</div>
      </div>
      <div className="mock-row__detail" style={{ position: 'relative', zIndex: 1 }}>
        <span className="mock-row__cooldown-tag">
          {/* Pause icon — matches the MUI PauseIcon on the real cooldown row. */}
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
          </svg>
          Cooldown
        </span>
        <span className="mock-row__topic" style={{ marginLeft: 6 }}>
          [{student.topic}]
        </span>
        <div className="mock-row__q">{student.question}</div>
      </div>
      <div className="mock-row__actions" style={{ position: 'relative', zIndex: 1 }}>
        <button className="mock-btn mock-btn--primary" type="button">
          Approve
        </button>
        <OverflowDots />
      </div>
    </motion.div>
  );
}

export default function MockOHQ({
  progress,
  isInView,
}: {
  progress: MotionValue<number>;
  isInView: boolean;
}) {
  const waitingStudents = STUDENTS.filter((s) => !s.cooldown);
  const cooldownStudent = STUDENTS.find((s) => s.cooldown);

  return (
    <div className="mock-ohq">
      <StatsCard progress={progress} />
      <div className="mock-table">
        <div className="mock-table__head">
          <h3>Students</h3>
          <span className="filter">⏷ Filter</span>
        </div>
        <div className="mock-table__rows">
          {waitingStudents.map((s, i) => (
            <MockRow key={s.id} progress={progress} index={i} student={s} isInView={isInView} />
          ))}
          {cooldownStudent && <MockCooldownRow progress={progress} student={cooldownStudent} />}
        </div>
      </div>
      <MockMessageFlow progress={progress} />
      <MockSlack progress={progress} />
    </div>
  );
}
