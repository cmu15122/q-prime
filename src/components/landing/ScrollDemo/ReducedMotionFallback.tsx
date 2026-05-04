import { BEATS } from './students';

// Static, vertical-stack version shown when prefers-reduced-motion is set.
// No animation, no scroll-jacking. The captions describe what the live demo does.
export default function ReducedMotionFallback() {
  return (
    <section className="ohq-scroll ohq-scroll--rm">
      <div className="ohq-row">
        <div className="ohq-section__head">
          <div className="ohq-section__eyebrow">
            <span className="ohq-label">01 / The queue</span>
          </div>
          <h2 className="ohq-section__title">How it actually flows.</h2>
        </div>
        <div className="stack">
          {BEATS.map((b) => (
            <div className="stack__item" key={b.step}>
              <div>
                <span className="ohq-label">{b.step}</span>
                <div className="stack__caption" style={{ marginTop: 6 }}>
                  {b.text}
                </div>
              </div>
              <div
                style={{
                  border: '1px solid var(--ohq-rule-soft)',
                  background: 'var(--ohq-paper-2)',
                  borderRadius: 4,
                  minHeight: 80,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--ohq-mono)',
                  fontSize: 11,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--ohq-muted)',
                }}
              >
                Reduced-motion preview
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
