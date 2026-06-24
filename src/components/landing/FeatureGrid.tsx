type Feat = {
  num: string;
  title: string;
  body: string;
};

const features: Feat[] = [
  {
    num: '03·a',
    title: 'Video links',
    body: "TAs add their Zoom or Meet URL. Students get a when it's their turn.",
  },
  {
    num: '03·b',
    title: 'Announcements',
    body: 'Pin messages above the queue',
  },
  {
    num: '03·c',
    title: 'Locations',
    body: "Host office hours in multiple locations and let TAs filter by the location they're in.",
  },
  {
    num: '03·d',
    title: 'Cooldowns',
    body: 'Block students from rejoining the queue right after being helped.',
  },
  {
    num: '03·e',
    title: 'Override approvals',
    body: 'Students can request to skip the cooldown, which TAs approve or deny.',
  },
  {
    num: '03·f',
    title: 'Topics',
    body: 'Tie each question to an assignment, and let TAs filter the queue by topic.',
  },
  {
    num: '03·g',
    title: 'Multi-semester',
    body: 'Easily roll over to the next term. Your old data stays.',
  },
  {
    num: '03·h',
    title: 'Roles',
    body: 'Student, TA, Admin, and Owner roles, with permissions scoped to each.',
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
