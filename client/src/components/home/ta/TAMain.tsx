import React from 'react';
import AskQuestion from '../shared/AskQuestion';
import StudentEntries from './StudentEntries';

export default function TAMain(props) {
  return (
    <div>
      <StudentEntries/>
      <AskQuestion/>
    </div>
  );
}
