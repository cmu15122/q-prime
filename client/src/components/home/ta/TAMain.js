import React, { useState } from 'react';
import AskQuestion from './AskQuestion';

function TAMain (props) {
    const { theme, queueData } = props;
    const [questionValue, setQuestionValue] = useState('')

    return (
      <div>
          <AskQuestion
            questionValue={questionValue}
            setQuestionValue={setQuestionValue}
          />
      </div>
    );
}

export default TAMain;
