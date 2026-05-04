import { useNavigate } from 'react-router-dom';
import { GITHUB_URL } from '../../themes/constants';

export default function FinalCTA() {
  const navigate = useNavigate();
  return (
    <section className="ohq-final">
      <div className="ohq-row">
        <h2 className="ohq-final__head">
          Set up in a <em>minute</em>.
          <br />
          Or read the source.
        </h2>
        <p className="ohq-final__sub">It's free either way.</p>
        <div className="ohq-final__ctas">
          <button className="ohq-btn ohq-btn--primary" onClick={() => navigate('/create')}>
            Start for free
          </button>
          <a className="ohq-btn" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
            Self host <span className="ohq-arrow" aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}
