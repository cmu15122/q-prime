import { useEffect, useRef, useState } from 'react';
import { useInView, useScroll } from 'framer-motion';
import CaptionRail from './CaptionRail';
import MockOHQ from './MockOHQ';
import ReducedMotionFallback from './ReducedMotionFallback';

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

export default function ScrollDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  // Used by the live help-timer to reset whenever the demo enters/leaves view.
  const isInView = useInView(ref, { amount: 0.05 });
  const reduced = usePrefersReducedMotion();

  if (reduced) return <ReducedMotionFallback />;

  return (
    <section ref={ref} className="ohq-scroll" style={{ height: '500vh' }}>
      <div className="ohq-scroll__sticky">
        <CaptionRail progress={scrollYProgress} />
        <div className="ohq-scroll__stage">
          <div className="ohq-scroll__stage__chrome">
            <span className="dot live" />
            <span>OHQ</span>
            <span className="url">app.ohq.dev / 15-122 / ohq</span>
            <span className="right">live</span>
          </div>
          <div className="ohq-scroll__stage__inner">
            <MockOHQ progress={scrollYProgress} isInView={isInView} />
          </div>
        </div>
      </div>
    </section>
  );
}
