import React, { useState } from 'react';
import AskQuestion from './AskQuestion';
import StudentEntries from './StudentEntries';

function TAMain (props) {
    const { theme, queueData } = props;
    const [questionValue, setQuestionValue] = useState('')

    return (
      <div>
        <AskQuestion
          questionValue={questionValue}
          setQuestionValue={setQuestionValue}
        />

        <StudentEntries theme={props.theme}></StudentEntries>

      </div>
    );
}

export default TAMain;
