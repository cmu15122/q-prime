import AskQuestion from '../shared/AskQuestion';
import StudentEntries from './StudentEntries';

export default function TAMain(props) {
    const { theme, queueData } = props;
    
    return (
        <div>
            <StudentEntries theme={theme} queueData={queueData}/>
            <AskQuestion theme={theme} queueData={queueData}/>
        </div>
    );
}
