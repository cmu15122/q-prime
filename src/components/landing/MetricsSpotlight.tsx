export default function MetricsSpotlight() {
  return (
    <section className="ohq-section">
      <div className="ohq-row">
        <div className="ohq-section__head">
          <div className="ohq-section__eyebrow">
            <span className="ohq-label">02 / Metrics</span>
          </div>
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
                <span>Metrics · OH 14:00-17:00</span>
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
                  <dd>1h 22m</dd>
                </dl>
              </div>
            </div>
          </figure>

          <div className="ohq-metrics__copy">
            <p>
              Every student interaction is recorded and metrics are aggregated. Track queue wait times over the course of a semester, check
              which students were helped the most, and more.
            </p>
            <p>
              Course admins can download all data.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
