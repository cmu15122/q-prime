import { motion, MotionValue, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

// The realistic message flow from the live app: a TA opens the row's overflow
// menu (the `…` icon), picks `Message`, types into a dialog, and hits Send.
// All three stages share the existing scroll window the old chat bubble used
// (0.48 → 0.66) so the rest of the demo's timing doesn't shift.

const MESSAGE_TEXT =
  'Take another look at the contract on line 47 — the callsite is passing lo > hi.';

function TypedMessage({ progress }: { progress: MotionValue<number> }) {
  // Type the message in character-by-character once the dialog is up.
  const charCount = useTransform(progress, [0.53, 0.6], [0, MESSAGE_TEXT.length]);
  const [text, setText] = useState('');
  useEffect(() => {
    const update = (n: number) => {
      const clamped = Math.max(0, Math.min(MESSAGE_TEXT.length, Math.round(n)));
      setText(MESSAGE_TEXT.slice(0, clamped));
    };
    update(charCount.get());
    const unsubscribe = charCount.on('change', update);
    return unsubscribe;
  }, [charCount]);
  return (
    <div className="mock-msg-modal__field">
      <div className="mock-msg-modal__field-label">Message</div>
      <div className="mock-msg-modal__textarea">
        {text}
        <span className="mock-msg-modal__caret" aria-hidden />
      </div>
    </div>
  );
}

export default function MockMessageFlow({ progress }: { progress: MotionValue<number> }) {
  // Stage 1 — the overflow menu opening on row 2.
  const menuOpacity = useTransform(progress, [0.48, 0.5, 0.55, 0.57], [0, 1, 1, 0]);
  const menuY = useTransform(progress, [0.48, 0.5], [-4, 0]);
  // The "Message" item gets a pale-green hover highlight just before we click.
  const messageHover = useTransform(progress, [0.5, 0.515, 0.555, 0.57], [0, 1, 1, 0]);

  // Stage 2 — the dialog slides in from below.
  const modalOpacity = useTransform(progress, [0.53, 0.56, 0.62, 0.65], [0, 1, 1, 0]);
  const modalY = useTransform(progress, [0.53, 0.56, 0.62, 0.65], [12, 0, 0, -8]);
  // Backdrop dims the OHQ behind the modal.
  const backdropOpacity = useTransform(progress, [0.53, 0.56, 0.62, 0.65], [0, 1, 1, 0]);

  // Stage 3 — the Send button briefly highlights right before we close.
  const sendPulse = useTransform(progress, [0.605, 0.615, 0.625], [0, 1, 0]);

  return (
    <>
      {/* Row 2 overflow menu */}
      <motion.div
        className="mock-overflow-menu"
        style={{ opacity: menuOpacity, y: menuY, pointerEvents: 'none' }}
      >
        <div className="mock-overflow-menu__item">
          <span className="mock-overflow-menu__icon" aria-hidden>
            ?
          </span>
          <span>Ask to fix</span>
        </div>
        <motion.div
          className="mock-overflow-menu__item mock-overflow-menu__item--active"
          style={{
            background: useTransform(
              messageHover,
              (v) => `color-mix(in srgb, var(--ohq-forest) ${v * 14}%, transparent)`,
            ),
          }}
        >
          <span className="mock-overflow-menu__icon" aria-hidden>
            ✎
          </span>
          <span>Message</span>
        </motion.div>
        <div className="mock-overflow-menu__item mock-overflow-menu__item--danger">
          <span className="mock-overflow-menu__icon" aria-hidden>
            ✕
          </span>
          <span>Remove</span>
        </div>
      </motion.div>

      {/* Backdrop */}
      <motion.div
        className="mock-msg-backdrop"
        style={{ opacity: backdropOpacity, pointerEvents: 'none' }}
      />

      {/* Modal — `x: '-50%'` handles horizontal centering so the entry/exit
          `y` animation composes with the CSS `left: 50%` anchor cleanly. */}
      <motion.div
        className="mock-msg-modal"
        style={{ opacity: modalOpacity, x: '-50%', y: modalY, pointerEvents: 'none' }}
      >
        <div className="mock-msg-modal__head">
          <div className="mock-msg-modal__title">Send a note to Amanda Li</div>
        </div>
        <div className="mock-msg-modal__body">
          <TypedMessage progress={progress} />
        </div>
        <div className="mock-msg-modal__actions">
          <button className="mock-btn mock-btn--ghost" type="button">
            Cancel
          </button>
          <motion.button
            className="mock-btn mock-btn--primary"
            type="button"
            style={{
              boxShadow: useTransform(
                sendPulse,
                (v) =>
                  `0 0 0 ${v * 4}px color-mix(in srgb, var(--ohq-forest) ${v * 35}%, transparent)`,
              ),
            }}
          >
            Send
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}
