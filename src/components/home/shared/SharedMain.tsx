import Announcements from './Annoucements';
import QueueStats from './QueueStats';

function SharedMain() {
  return (
    <div>
      {
        <div>
          <Announcements />
          <QueueStats />
        </div>
      }
    </div>
  );
}

export default SharedMain;
