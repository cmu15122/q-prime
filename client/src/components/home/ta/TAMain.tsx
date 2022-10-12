import AskQuestion from '../shared/AskQuestion';
import StudentEntries from './StudentEntries';

export default function TAMain(props) {
    const { queueData } = props;
    
    return (
        <div>
            <StudentEntries queueData={queueData}/>
            <AskQuestion queueData={queueData}/>
        </div>
    );
}
