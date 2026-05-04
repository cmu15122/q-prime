export default function MetricsSpotlight() {
  return (
    <section className="ohq-section">
      <div className="ohq-row">
        <div className="ohq-section__head">
          <div className="ohq-section__eyebrow">
            <span className="ohq-label">02 / Metrics</span>
          </div>
          <h2 className="ohq-section__title">
            Wait times and help sessions, <em>recorded</em>.
          </h2>
        </div>

        <div className="ohq-metrics">
          <figure className="ohq-metrics__shot" aria-label="Metrics screenshot placeholder">
            <div className="ohq-metrics__shot__placeholder">
              <header
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'var(--ohq-mono)',
                  fontSize: 11,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--ohq-muted)',
                }}
              >
                <span>Metrics · OH 14:00–17:00</span>
                <span>Spring 2026</span>
              </header>
              <div className="ohq-metrics__chart" aria-hidden>
                <i style={{ height: '34%' }} />
                <i style={{ height: '52%' }} />
                <i style={{ height: '46%' }} />
                <i style={{ height: '78%' }} />
                <i style={{ height: '88%' }} />
                <i style={{ height: '64%' }} />
                <i style={{ height: '42%' }} />
                <i style={{ height: '36%' }} />
                <i style={{ height: '58%' }} />
                <i style={{ height: '72%' }} />
                <i style={{ height: '54%' }} />
                <i style={{ height: '38%' }} />
              </div>
              <div className="ohq-metrics__numbers">
                <dl>
                  <dt>Avg wait</dt>
                  <dd>4m 12s</dd>
                </dl>
                <dl>
                  <dt>Helped</dt>
                  <dd>23</dd>
                </dl>
                <dl>
                  <dt>Time helped</dt>
                  <dd>1h 14m</dd>
                </dl>
              </div>
            </div>
          </figure>

          <div className="ohq-metrics__copy">
            <p>
              Every help session, every "asked-to-fix", every wait — recorded against the right
              student and TA. Per-student histories. Per-TA help time.
            </p>
            <p>
              Course admins can download the whole semester as a CSV: who waited how long, who was
              helped by whom, and which questions came back twice.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
