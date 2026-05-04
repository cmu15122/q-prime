import { useNavigate } from 'react-router-dom';
import { GITHUB_URL } from '../../themes/constants';

export default function HostingCompare() {
  const navigate = useNavigate();
  return (
    <section className="ohq-section">
      <div className="ohq-row">
        <div className="ohq-section__head">
          <div className="ohq-section__eyebrow">
            <span className="ohq-label">04 / Run it</span>
          </div>
          <h2 className="ohq-section__title">
            Hosted, or run it <em>yourself</em>.
          </h2>
        </div>

        <div className="ohq-host">
          <div className="ohq-host__col ohq-host__col--cloud">
            <span className="ohq-label">Cloud · the easy way</span>
            <h3 className="ohq-host__title">Hosted</h3>
            <ul className="ohq-host__list">
              <li>Sign in with Google. Set up a course in a minute.</li>
              <li>One course per account. Multi-semester out of the box.</li>
              <li>Provided for free to verified courses.</li>
            </ul>
            <div className="ohq-host__cta">
              <button className="ohq-btn ohq-btn--primary" onClick={() => navigate('/create')}>
                Start for free
              </button>
            </div>
          </div>

          <div className="ohq-host__col ohq-host__col--self">
            <span className="ohq-label">Self-host · your box, your rules</span>
            <h3 className="ohq-host__title">Or run the whole stack.</h3>
            <ul className="ohq-host__list">
              <li>Docker Compose: Convex backend, dashboard, NGINX, Certbot.</li>
              <li>Google OAuth for sign-in. Bring your own DNS.</li>
              <li>Source-available. MIT licensed.</li>
            </ul>
            <div className="ohq-host__shell" aria-hidden>
              <span>
                <span className="prompt">$</span> git clone github.com/cmu15122/q-prime
              </span>
              <span>
                <span className="prompt">$</span> cd q-prime &amp;&amp; ./docker/scripts/setup.sh
              </span>
            </div>
            <div className="ohq-host__cta">
              <a className="ohq-btn" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                Open the repo <span className="ohq-arrow" aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
