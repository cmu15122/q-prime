import React, { useState } from 'react';
import AskQuestion from './AskQuestion';
import StudentEntries from '../shared/StudentEntries';

function TAMain (props) {
    const { theme, queueData } = props;
    const [questionValue, setQuestionValue] = useState('')

    return (
      <div>
        <StudentEntries theme={props.theme}></StudentEntries>
        <AskQuestion
          questionValue={questionValue}
          setQuestionValue={setQuestionValue}
          theme={props.theme}
        />
      </div>
    );
}

export default TAMain;
