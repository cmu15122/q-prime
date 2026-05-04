import { useEffect } from 'react';
import Header from '../components/landing/Header';
import Hero from '../components/landing/Hero';
import ScrollDemo from '../components/landing/ScrollDemo';
import MetricsSpotlight from '../components/landing/MetricsSpotlight';
import FeatureGrid from '../components/landing/FeatureGrid';
import HostingCompare from '../components/landing/HostingCompare';
import Footer from '../components/landing/Footer';
import '../themes/landing.css';

// Override page title only while the landing page is mounted; restore on unmount
// so the per-course pages keep their own document.title (set elsewhere in-app).
function useLandingDocumentTitle() {
  useEffect(() => {
    const prev = document.title;
    document.title = 'OHQ — a real-time office hours queue';
    return () => {
      document.title = prev;
    };
  }, []);
}

export default function LandingPage() {
  useLandingDocumentTitle();
  return (
    <div className="ohq-landing">
      <Header />
      <main>
        <Hero />
        <div id="01">
          <ScrollDemo />
        </div>
        <div id="02">
          <MetricsSpotlight />
        </div>
        <div id="03">
          <FeatureGrid />
        </div>
        <div id="04">
          <HostingCompare />
        </div>
      </main>
      <Footer />
    </div>
  );
}
