// Testing code for our queue
const queue = require('../controllers/queue');
const moment = require("moment-timezone");

const OHQueue = queue.OHQueue;
const StudentStatus = queue.StudentStatus;

function testData (data, andrewID, question, location, topic, entryTime) {
    expect(data.andrewID).toBe(andrewID);
    expect(data.question).toBe(question);
    expect(data.location).toBe(location);
    expect(data.topic).toBe(topic);
    expect(data.entryTime).toBe(entryTime);
}

describe('Queue tests', () => {
    test('Creation makes empty queue', () => {
        const queue = new OHQueue();
        expect(queue.size()).toBe(0);
        expect(queue.isEmpty()).toBe(true);
    });

    test('Enqueue adds student with appropriate fields set on the queue', () => {
        const queue = new OHQueue();
        expect(queue.size()).toBe(0);

        const entryTime = moment.tz(new Date(), "America/New_York").toDate();
        queue.enqueue("student1", "stud1", "qn1", "loc1", "top1", entryTime);
        
        expect(queue.size()).toBe(1);
        expect(queue.getPosition("student1")).toBe(0);
        expect(queue.getStatus("student1")).toBe(StudentStatus.WAITING);
        const data = queue.getData("student1");
        testData(data, "stud1", "qn1", "loc1", "top1", entryTime);
    });

    test('Enqueue adds students in FIFO order', () => {
        const queue = new OHQueue();
        expect(queue.size()).toBe(0);

        const entryTime = moment.tz(new Date(), "America/New_York").toDate();
        queue.enqueue("student1", "stud1", "qn1", "loc1", "top1", entryTime);
        expect(queue.size()).toBe(1);
        expect(queue.getPosition("student1")).toBe(0);

        queue.enqueue("student2", "stud2", "qn2", "loc2", "top2", entryTime);
        expect(queue.size()).toBe(2);
        expect(queue.getPosition("student1")).toBe(0);
        expect(queue.getPosition("student2")).toBe(1);

        queue.enqueue("student3", "stud3", "qn3", "loc3", "top3", entryTime);
        expect(queue.size()).toBe(3);
        expect(queue.getPosition("student1")).toBe(0);
        expect(queue.getPosition("student2")).toBe(1);
        expect(queue.getPosition("student3")).toBe(2);
    });

    test('Getting position of someone not on queue returns -1', () => {
        const queue = new OHQueue();
        expect(queue.size()).toBe(0);
        expect(queue.getPosition("student1")).toBe(-1);

        const entryTime = moment.tz(new Date(), "America/New_York").toDate();
        queue.enqueue("student1", "stud1", "qn1", "loc1", "top1", entryTime);
        expect(queue.size()).toBe(1);
        expect(queue.getPosition("student1")).toBe(0);
        expect(queue.getPosition("student2")).toBe(-1);
    });

    test('Getting status of someone not on queue returns ERROR', () => {
        const queue = new OHQueue();
        expect(queue.size()).toBe(0);
        expect(queue.getStatus("student1")).toBe(StudentStatus.ERROR);

        const entryTime = moment.tz(new Date(), "America/New_York").toDate();
        queue.enqueue("student1", "stud1", "qn1", "loc1", "top1", entryTime);
        expect(queue.size()).toBe(1);
        expect(queue.getStatus("student1")).toBe(StudentStatus.WAITING);
        expect(queue.getStatus("student2")).toBe(StudentStatus.ERROR);
    });

    test('Can remove someone from the queue', () => {
        const queue = new OHQueue();
        expect(queue.size()).toBe(0);

        const entryTime = moment.tz(new Date(), "America/New_York").toDate();
        queue.enqueue("student1", "stud1", "qn1", "loc1", "top1", entryTime);
        expect(queue.size()).toBe(1);
        expect(queue.getPosition("student1")).toBe(0);

        const student1Data = queue.remove("student1");
        testData(student1Data, "stud1", "qn1", "loc1", "top1", entryTime);
        expect(queue.size()).toBe(0);

        queue.enqueue("student2", "stud2", "qn2", "loc2", "top2", entryTime);
        expect(queue.size()).toBe(1);
        expect(queue.getPosition("student2")).toBe(0);

        queue.enqueue("student3", "stud3", "qn3", "loc3", "top3", entryTime);
        expect(queue.size()).toBe(2);
        expect(queue.getPosition("student2")).toBe(0);
        expect(queue.getPosition("student3")).toBe(1);

        queue.enqueue("student4", "stud4", "qn4", "loc4", "top4", entryTime);
        expect(queue.size()).toBe(3);
        expect(queue.getPosition("student2")).toBe(0);
        expect(queue.getPosition("student3")).toBe(1);
        expect(queue.getPosition("student4")).toBe(2);

        const student3Data = queue.remove("student3");
        testData(student3Data, "stud3", "qn3", "loc3", "top3", entryTime);
        expect(queue.size()).toBe(2);
        expect(queue.getPosition("student2")).toBe(0);
        expect(queue.getPosition("student4")).toBe(1);

        const student4Data = queue.remove("student4");
        testData(student4Data, "stud4", "qn4", "loc4", "top4", entryTime);
        expect(queue.size()).toBe(1);
        expect(queue.getPosition("student2")).toBe(0);

        const student2Data = queue.remove("student2");
        testData(student2Data, "stud2", "qn2", "loc2", "top2", entryTime);
        expect(queue.size()).toBe(0);
    });
    
    test('Can help/unhelp someone on the queue', () => {
        const queue = new OHQueue();
        expect(queue.size()).toBe(0);

        const entryTime = moment.tz(new Date(), "America/New_York").toDate();
        queue.enqueue("student1", "stud1", "qn1", "loc1", "top1", entryTime);
        expect(queue.size()).toBe(1);
        expect(queue.getStatus("student1")).toBe(StudentStatus.WAITING);

        const helpTime = moment.tz(new Date(), "America/New_York").toDate();
        queue.help("student1", "ta1", helpTime);
        expect(queue.getStatus("student1")).toBe(StudentStatus.BEING_HELPED);
        const student1Data = queue.getData("student1");
        expect(student1Data.taID).toBe("ta1");
        expect(student1Data.helpTime).toBe(helpTime);
        expect(student1Data.isFrozen).toBe(false);

        queue.unhelp("student1");
        expect(queue.getStatus("student1")).toBe(StudentStatus.WAITING);
        expect(student1Data.taID).toBe(null);
        expect(student1Data.helpTime).toBe(null);
        expect(student1Data.isFrozen).toBe(false);
    });
    
    test('Can freeze/unfreeze someone on the queue', () => {
        const queue = new OHQueue();
        expect(queue.size()).toBe(0);

        const entryTime = moment.tz(new Date(), "America/New_York").toDate();
        queue.enqueue("student1", "stud1", "qn1", "loc1", "top1", entryTime);
        expect(queue.size()).toBe(1);
        expect(queue.getStatus("student1")).toBe(StudentStatus.WAITING);
        const student1Data = queue.getData("student1");
        expect(student1Data.isFrozen).toBe(false);

        queue.freeze("student1");
        expect(queue.getStatus("student1")).toBe(StudentStatus.FROZEN);
        expect(student1Data.isFrozen).toBe(true);

        queue.unfreeze("student1");
        expect(queue.getStatus("student1")).toBe(StudentStatus.WAITING);
        expect(student1Data.isFrozen).toBe(false);
    });
    
    test('Can set/unset fix question for someone on the queue', () => {
        const queue = new OHQueue();
        expect(queue.size()).toBe(0);

        const entryTime = moment.tz(new Date(), "America/New_York").toDate();
        queue.enqueue("student1", "stud1", "qn1", "loc1", "top1", entryTime);
        expect(queue.size()).toBe(1);
        expect(queue.getStatus("student1")).toBe(StudentStatus.WAITING);
        const student1Data = queue.getData("student1");
        expect(student1Data.isFrozen).toBe(false);

        queue.setFixQuestion("student1");
        expect(queue.getStatus("student1")).toBe(StudentStatus.FIXING_QUESTION);
        expect(student1Data.isFrozen).toBe(true);
        expect(student1Data.numAskedToFix).toBe(1);

        queue.unsetFixQuestion("student1");
        expect(queue.getStatus("student1")).toBe(StudentStatus.WAITING);
        expect(student1Data.isFrozen).toBe(false);
        expect(student1Data.numAskedToFix).toBe(1);
    });
    
    test('Can set/unset cooldown violation for someone on the queue', () => {
        const queue = new OHQueue();
        expect(queue.size()).toBe(0);

        const entryTime = moment.tz(new Date(), "America/New_York").toDate();
        queue.enqueue("student1", "stud1", "qn1", "loc1", "top1", entryTime);
        const student1Data = queue.getData("student1");
        expect(queue.size()).toBe(1);
        expect(queue.getStatus("student1")).toBe(StudentStatus.WAITING);
        expect(student1Data.isFrozen).toBe(false);

        queue.setCooldownViolation("student1");
        expect(queue.getStatus("student1")).toBe(StudentStatus.COOLDOWN_VIOLATION);
        expect(student1Data.isFrozen).toBe(true);

        queue.unsetCooldownViolation("student1");
        expect(queue.getStatus("student1")).toBe(StudentStatus.WAITING);
        expect(student1Data.isFrozen).toBe(false);
    });
    
    test('Removing will shift order bypassing frozen students', () => {
        const queue = new OHQueue();
        expect(queue.size()).toBe(0);

        const entryTime = moment.tz(new Date(), "America/New_York").toDate();
        queue.enqueue("student1", "stud1", "qn1", "loc1", "top1", entryTime);
        queue.enqueue("student2", "stud2", "qn2", "loc2", "top2", entryTime);
        queue.enqueue("student3", "stud3", "qn3", "loc3", "top3", entryTime);
        queue.enqueue("student4", "stud4", "qn4", "loc4", "top4", entryTime);
        queue.enqueue("student5", "stud5", "qn5", "loc5", "top5", entryTime);
        const student1Data = queue.getData("student1");
        const student2Data = queue.getData("student2");
        const student3Data = queue.getData("student3");
        const student4Data = queue.getData("student4");
        const student5Data = queue.getData("student5");        
        expect(queue.size()).toBe(5);

        queue.freeze("student2");
        expect(queue.getStatus("student2")).toBe(StudentStatus.FROZEN);
        expect(student2Data.isFrozen).toBe(true);

        queue.setFixQuestion("student4");
        expect(queue.getStatus("student4")).toBe(StudentStatus.FIXING_QUESTION);
        expect(student4Data.isFrozen).toBe(true);

        queue.remove("student1");
        expect(queue.size()).toBe(4);
        expect(queue.getPosition("student3")).toBe(0);
        expect(queue.getPosition("student2")).toBe(1);
        expect(queue.getPosition("student5")).toBe(2);
        expect(queue.getPosition("student4")).toBe(3);

        queue.unfreeze("student2");
        expect(queue.getStatus("student2")).toBe(StudentStatus.WAITING);
        expect(student2Data.isFrozen).toBe(false);

        queue.remove("student3");
        expect(queue.size()).toBe(3);
        expect(queue.getPosition("student2")).toBe(0);
        expect(queue.getPosition("student5")).toBe(1);
        expect(queue.getPosition("student4")).toBe(2);

        queue.enqueue("student6", "stud6", "qn6", "loc6", "top6", entryTime);
        queue.setCooldownViolation("student6");
        expect(queue.size()).toBe(4);
        
        queue.enqueue("student7", "stud7", "qn7", "loc7", "top7", entryTime);
        expect(queue.size()).toBe(5);

        queue.remove("student2");
        expect(queue.size()).toBe(4);
        expect(queue.getPosition("student5")).toBe(0);
        expect(queue.getPosition("student7")).toBe(1);
        expect(queue.getPosition("student4")).toBe(2);
        expect(queue.getPosition("student6")).toBe(3);
    });
    
});
