import { useNavigate } from 'react-router-dom';
import { useConvexAuth, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { GITHUB_URL } from '../../themes/constants';

export default function Hero() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const ownedCourse = useQuery(api.courses.getMyOwnedCourse, isAuthenticated ? {} : 'skip');

  const showGoTo = isAuthenticated && ownedCourse;
  const onClick = () => {
    if (showGoTo) navigate(`/${ownedCourse.slug}`);
    else navigate('/create');
  };

  return (
    <section className="ohq-hero ohq-row">
      <h1 className="ohq-hero__head">
        A real-time <em>office hours queue.</em>
      </h1>
      <p className="ohq-hero__sub">
        Free for .edu users with verified courses. Sign in, set up your course, and share with your
        TAs and students. Open-source, self-hostable options available.
      </p>
      <div className="ohq-hero__ctas">
        <button className="ohq-btn ohq-btn--primary" onClick={onClick} disabled={authLoading}>
          {showGoTo ? 'Go to your course' : 'Start for free'}
        </button>
        <a className="ohq-btn" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
          Self host <span className="ohq-arrow" aria-hidden />
        </a>
      </div>

      <div className="ohq-hero__meta">
        <div className="ohq-hero__metaitem">
          <span className="ohq-label">Live</span>
          <strong>Real-time queue</strong>
          <span>See and manage every student with notifications the instant a TA clicks help.</span>
        </div>
        <div className="ohq-hero__metaitem">
          <span className="ohq-label">Metrics</span>
          <strong>Stats for every user</strong>
          <span>Every help session and wait-time, recorded and exportable.</span>
        </div>
        <div className="ohq-hero__metaitem">
          <span className="ohq-label">Slack</span>
          <strong>Wait-time pings</strong>
          <span>A webhook posts to your channel when the queue gets long.</span>
        </div>
      </div>
    </section>
  );
}
