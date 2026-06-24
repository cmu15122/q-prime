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
        </div>

        <div className="ohq-host">
          <div className="ohq-host__col ohq-host__col--cloud">
            <span className="ohq-label">Cloud</span>
            <h3 className="ohq-host__title">Hosted</h3>
            <ul className="ohq-host__list">
              <li>Sign in with Google. Set up a course in a minute</li>
              <li>One course per account. Multi-semester out of the box</li>
              <li>Provided for free by Jackson Romero to verified courses</li>
            </ul>
            <div className="ohq-host__cta">
              <button className="ohq-btn ohq-btn--primary" onClick={() => navigate('/create')}>
                Start for free
              </button>
            </div>
          </div>

          <div className="ohq-host__col ohq-host__col--self">
            <span className="ohq-label">Self-host</span>
            <h3 className="ohq-host__title">Run the whole stack</h3>
            <ul className="ohq-host__list">
              <li>Docker Compose: Convex backend, dashboard, NGINX, Certbot</li>
              <li>Google OAuth for sign-in</li>
              <li>MIT licensed</li>
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
