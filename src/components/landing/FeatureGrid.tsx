type Feat = {
  num: string;
  title: string;
  body: string;
};

const features: Feat[] = [
  {
    num: '03·a',
    title: 'Video links',
    body: "TAs add their Zoom or Meet URL. Students get a one-click link when it's their turn.",
  },
  {
    num: '03·b',
    title: 'Announcements',
    body: 'Pin a message above the queue. Edit, delete, or replace it whenever you want.',
  },
  {
    num: '03·c',
    title: 'Locations',
    body: "Map office hours rooms to weekdays. Students pick the location they're actually in.",
  },
  {
    num: '03·d',
    title: 'Cooldowns',
    body: 'Block re-joining the queue right after being helped. The cooldown length is configurable.',
  },
  {
    num: '03·e',
    title: 'Override approvals',
    body: 'Students can request to skip the cooldown. TAs approve or deny, on the queue itself.',
  },
  {
    num: '03·f',
    title: 'Topics',
    body: 'Tie each question to an assignment. TAs can filter the queue by topic.',
  },
  {
    num: '03·g',
    title: 'Multi-semester',
    body: 'Roll over to the next term. Old data stays. New roster, new active queue.',
  },
  {
    num: '03·h',
    title: 'Roles',
    body: 'Student, TA, admin — and a course owner. Permissions scoped to each.',
  },
];

export default function FeatureGrid() {
  return (
    <section className="ohq-section">
      <div className="ohq-row">
        <div className="ohq-section__head">
          <div className="ohq-section__eyebrow">
            <span className="ohq-label">03 / Everything else</span>
          </div>
          <h2 className="ohq-section__title">
            The <em>boring infrastructure</em>, already done.
          </h2>
        </div>

        <div className="ohq-grid">
          {features.map((f) => (
            <div className="ohq-grid__cell" key={f.num}>
              <span className="ohq-grid__num">{f.num}</span>
              <h3 className="ohq-grid__title">{f.title}</h3>
              <p className="ohq-grid__body">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
