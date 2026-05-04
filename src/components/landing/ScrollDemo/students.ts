// Hard-coded queue contents for the scroll-demo mock. Mirrors the shape of
// the real `ohq` table (student_name, student_email, location, assignment_name,
// question) so visual treatment matches the live app.
export type MockStudent = {
  id: string;
  name: string;
  email: string;
  location: string;
  topic: string;
  question: string;
  cooldown?: boolean;
};

export const STUDENTS: MockStudent[] = [
  {
    id: 's1',
    name: 'Jackson Romero',
    email: 'jtromero@andrew.cmu.edu',
    location: 'Cluster 1',
    topic: 'bsearch',
    question: 'My contract on the recursive call rejects valid lo / hi.',
  },
  {
    id: 's2',
    name: 'Amanda Li',
    email: 'xal@andrew.cmu.edu',
    location: 'Cluster 1',
    topic: 'img',
    question: 'mask_filter segfaults only on 4×4 images. Smaller and larger are fine.',
  },
  {
    id: 's3',
    name: 'Krish Suraparaju',
    email: 'csurapar@andrew.cmu.edu',
    location: 'Zoom',
    topic: 'exam-2',
    question: 'Reviewing loop invariants — got 5 minutes for a sanity check?',
  },
  {
    id: 's4',
    name: 'Angela Zhang',
    email: 'angelaz1@andrew.cmu.edu',
    location: 'Cluster 2',
    topic: 'bsearch',
    question: 'Off-by-one on the descending case I think.',
  },
  {
    id: 's5',
    name: 'Pranav Addepalli',
    email: 'paddepal@andrew.cmu.edu',
    location: 'Cluster 1',
    topic: 'exam-2',
    question: 'When does //@assert add overhead in compiled mode?',
  },
  {
    id: 's6',
    name: 'Mihir Khare',
    email: 'mihirk@andrew.cmu.edu',
    location: 'Cluster 2',
    topic: 'bsearch',
    question: 'Quick follow-up — same recursive contract issue from earlier.',
    cooldown: true,
  },
];

// Single source of truth for the peak wait time shown in the demo. The stats
// card animates to this value (5 students × 4 min/student = 20) and the slack
// notification quotes the same number, so they never drift apart.
export const WAIT_TIME_AT_PEAK_MIN = 20;

// Six caption beats, with overlapping in/out ranges so transitions crossfade.
// Each entry: [fadeInStart, fullyVisibleStart, fullyVisibleEnd, fadeOutEnd]
export type Beat = {
  step: string;
  emText?: string;
  text: string;
  range: [number, number, number, number];
};

export const BEATS: Beat[] = [
  {
    step: '01',
    text: 'An empty queue. Office hours just opened.',
    range: [0.0, 0.0, 0.06, 0.12],
  },
  {
    step: '02',
    text: 'Students join, one at a time.',
    range: [0.06, 0.12, 0.28, 0.36],
  },
  {
    step: '03',
    emText: 'Help.',
    text: 'A TA helps a student. Click done when finished.',
    range: [0.3, 0.4, 0.5, 0.56],
  },
  {
    step: '04',
    text: 'Message another student on the side.',
    range: [0.46, 0.54, 0.62, 0.66],
  },
  {
    step: '05',
    text: 'Students on cooldown re-appear at the bottom — approve them by hand.',
    range: [0.64, 0.72, 0.8, 0.84],
  },
  {
    step: '06',
    text: 'Slack pings when waits start to spike.',
    range: [0.82, 0.9, 1.0, 1.0],
  },
];
