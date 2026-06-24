import { GITHUB_URL } from '../../themes/constants';

export default function Footer() {
  return (
    <footer className="ohq-footer">
      <div className="ohq-row ohq-footer__inner">
        <div className="ohq-footer__col">
          {/* Same Wordmark structure as the header; em-sized dot keeps the
              dot in the same relative position at any font-size. */}
          <span className="ohq-wm" style={{ fontSize: 22 }}>
            ohq
            <span className="ohq-wm__dot" aria-hidden />
          </span>
          <p className="ohq-footer__tag">
            A real-time office hours queue. Originally built for CMU 15-122. Open source.
          </p>
        </div>
        <div className="ohq-footer__col">
          <h4>Product</h4>
          <ul>
            <li>
              <a href="#02">Metrics</a>
            </li>
            <li>
              <a href="#03">Features</a>
            </li>
            <li>
              <a href="#04">Hosting</a>
            </li>
          </ul>
        </div>
        <div className="ohq-footer__col">
          <h4>Source</h4>
          <ul>
            <li>
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </li>
            <li>
              <a href={`${GITHUB_URL}#readme`} target="_blank" rel="noopener noreferrer">
                README
              </a>
            </li>
            <li>
              <a
                href={`${GITHUB_URL}/blob/convex/LICENSE`}
                target="_blank"
                rel="noopener noreferrer"
              >
                MIT license
              </a>
            </li>
          </ul>
        </div>
        <div className="ohq-footer__col">
          <h4>Course</h4>
          <ul>
            <li>
              <a href="/create">Start a course</a>
            </li>
            <li>
              <a href="/create">Sign in</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="ohq-row ohq-footer__legal">
        <span>
          Built by <a href="https://jtromero.com/">Jackson Romero</a> and{' '}
          <a href="https://github.com/cmu15122/q-prime/graphs/contributors">other contributors</a>
        </span>
      </div>
    </footer>
  );
}
