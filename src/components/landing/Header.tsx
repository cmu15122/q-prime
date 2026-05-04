import { useNavigate } from 'react-router-dom';
import { useConvexAuth, useQuery } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { api } from '../../../convex/_generated/api';
import { GITHUB_URL } from '../../themes/constants';

export default function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  // Skip the query unless we know we're authenticated; convex returns
  // undefined for skipped queries.
  const ownedCourse = useQuery(api.courses.getMyOwnedCourse, isAuthenticated ? {} : 'skip');

  // Three states for the right-hand action:
  //   1. Not authenticated -> "Sign in" (sends to /create's auth gate).
  //   2. Authenticated, owns a course -> "Go to {course}".
  //   3. Authenticated, no course -> "Sign in" still (clicking sends them to
  //      /create where they can either start one or continue).
  const showGoTo = isAuthenticated && ownedCourse;
  const onClick = () => {
    if (showGoTo) navigate(`/${ownedCourse.slug}`);
    else navigate('/create');
  };

  return (
    <header className="ohq-header">
      <div className="ohq-row ohq-header__inner">
        <a className="ohq-wm" href="/" aria-label="OHQ home" style={{ fontSize: 18 }}>
          ohq
          <span className="ohq-wm__dot" aria-hidden />
        </a>
        <nav className="ohq-header__right">
          <a
            className="ohq-icon-btn"
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 0C5.37 0 0 5.51 0 12.31c0 5.44 3.44 10.05 8.21 11.68.6.11.82-.27.82-.6v-2.1c-3.34.74-4.04-1.64-4.04-1.64-.55-1.42-1.34-1.8-1.34-1.8-1.09-.76.08-.74.08-.74 1.21.09 1.85 1.27 1.85 1.27 1.07 1.88 2.81 1.34 3.5 1.02.11-.79.42-1.34.76-1.65-2.67-.31-5.47-1.37-5.47-6.08 0-1.34.47-2.44 1.24-3.3-.13-.31-.54-1.55.11-3.24 0 0 1.01-.33 3.31 1.26.96-.27 1.99-.41 3.01-.41 1.02 0 2.05.14 3.01.41 2.3-1.59 3.31-1.26 3.31-1.26.65 1.69.24 2.93.11 3.24.77.86 1.24 1.96 1.24 3.3 0 4.72-2.81 5.77-5.49 6.07.43.38.81 1.13.81 2.27v3.36c0 .33.22.71.83.59C20.57 22.36 24 17.75 24 12.31 24 5.51 18.63 0 12 0z" />
            </svg>
          </a>
          {/* Don't render anything until auth has resolved, to avoid the button
              briefly flashing "Sign in" for users that actually own a course. */}
          {!authLoading && (
            <>
              <button
                className="ohq-header__signin"
                onClick={onClick}
                aria-label={showGoTo ? `Go to ${ownedCourse.display_name}` : 'Sign in'}
              >
                {showGoTo ? (
                  <>
                    Go to <strong>{ownedCourse.display_name}</strong>
                    <span aria-hidden>→</span>
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
              {isAuthenticated && (
                <button
                  className="ohq-header__signout"
                  onClick={() => signOut()}
                  aria-label="Sign out"
                >
                  Sign out
                </button>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
