// Testing code for our queue
const queue = require('../controllers/queue');
const moment = require("moment-timezone");

const OHQueue = queue.OHQueue;
const StudentStatus = queue.StudentStatus;

function testData(data, andrewID, preferredName, question, location, topic, entryTime) {
    expect(data.andrewID).toBe(andrewID);
    expect(data.preferredName).toBe(preferredName);
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
        queue.enqueue("stud1", "prefName1", "qn1", "loc1", "top1", entryTime);

        expect(queue.size()).toBe(1);
        expect(queue.getPosition("stud1")).toBe(0);
        expect(queue.getStatus("stud1")).toBe(StudentStatus.WAITING);
        const data = queue.getData("stud1");
        testData(data, "stud1", "prefName1", "qn1", "loc1", "top1", entryTime);
    });

    test('Enqueue adds students in FIFO order', () => {
        const queue = new OHQueue();
        expect(queue.size()).toBe(0);

        const entryTime = moment.tz(new Date(), "America/New_York").toDate();
        queue.enqueue("stud1", "prefName1", "qn1", "loc1", "top1", entryTime);
        expect(queue.size()).toBe(1);
        expect(queue.getPosition("stud1")).toBe(0);

        queue.enqueue("stud2", "prefName2", "qn2", "loc2", "top2", entryTime);
        expect(queue.size()).toBe(2);
        expect(queue.getPosition("stud1")).toBe(0);
        expect(queue.getPosition("stud2")).toBe(1);

        queue.enqueue("stud3", "prefName3", "qn3", "loc3", "top3", entryTime);
        expect(queue.size()).toBe(3);
        expect(queue.getPosition("stud1")).toBe(0);
        expect(queue.getPosition("stud2")).toBe(1);
        expect(queue.getPosition("stud3")).toBe(2);
    });

    test('Getting position of someone not on queue returns -1', () => {
        const queue = new OHQueue();
        expect(queue.size()).toBe(0);
        expect(queue.getPosition("stud1")).toBe(-1);

        const entryTime = moment.tz(new Date(), "America/New_York").toDate();
        queue.enqueue("stud1", "prefName1", "qn1", "loc1", "top1", entryTime);
        expect(queue.size()).toBe(1);
        expect(queue.getPosition("stud1")).toBe(0);
        expect(queue.getPosition("stud2")).toBe(-1);
    });

    test('Getting status of someone not on queue returns ERROR', () => {
        const queue = new OHQueue();
        expect(queue.size()).toBe(0);
        expect(queue.getStatus("stud1")).toBe(StudentStatus.ERROR);

        const entryTime = moment.tz(new Date(), "America/New_York").toDate();
        queue.enqueue("stud1", "prefName1", "qn1", "loc1", "top1", entryTime);
        expect(queue.size()).toBe(1);
        expect(queue.getStatus("stud1")).toBe(StudentStatus.WAITING);
        expect(queue.getStatus("stud2")).toBe(StudentStatus.ERROR);
    });

    test('Can remove someone from the queue', () => {
        const queue = new OHQueue();
        expect(queue.size()).toBe(0);

        const entryTime = moment.tz(new Date(), "America/New_York").toDate();
        queue.enqueue("stud1", "prefName1", "qn1", "loc1", "top1", entryTime);
        expect(queue.size()).toBe(1);
        expect(queue.getPosition("stud1")).toBe(0);

        const student1Data = queue.remove("stud1");
        testData(student1Data, "stud1", "prefName1", "qn1", "loc1", "top1", entryTime);
        expect(queue.size()).toBe(0);

        queue.enqueue("stud2", "prefName2", "qn2", "loc2", "top2", entryTime);
        expect(queue.size()).toBe(1);
        expect(queue.getPosition("stud2")).toBe(0);

        queue.enqueue("stud3", "prefName3", "qn3", "loc3", "top3", entryTime);
        expect(queue.size()).toBe(2);
        expect(queue.getPosition("stud2")).toBe(0);
        expect(queue.getPosition("stud3")).toBe(1);

        queue.enqueue("stud4", "prefName4", "qn4", "loc4", "top4", entryTime);
        expect(queue.size()).toBe(3);
        expect(queue.getPosition("stud2")).toBe(0);
        expect(queue.getPosition("stud3")).toBe(1);
        expect(queue.getPosition("stud4")).toBe(2);

        const student3Data = queue.remove("stud3");
        testData(student3Data, "stud3", "prefName3", "qn3", "loc3", "top3", entryTime);
        expect(queue.size()).toBe(2);
        expect(queue.getPosition("stud2")).toBe(0);
        expect(queue.getPosition("stud4")).toBe(1);

        const student4Data = queue.remove("stud4");
        testData(student4Data, "stud4", "prefName4", "qn4", "loc4", "top4", entryTime);
        expect(queue.size()).toBe(1);
        expect(queue.getPosition("stud2")).toBe(0);

        const student2Data = queue.remove("stud2");
        testData(student2Data, "stud2", "prefName2", "qn2", "loc2", "top2", entryTime);
        expect(queue.size()).toBe(0);
    });

    test('Can help/unhelp someone on the queue', () => {
        const queue = new OHQueue();
        expect(queue.size()).toBe(0);

        const entryTime = moment.tz(new Date(), "America/New_York").toDate();
        queue.enqueue("stud1", "prefName1", "qn1", "loc1", "top1", entryTime);
        expect(queue.size()).toBe(1);
        expect(queue.getStatus("stud1")).toBe(StudentStatus.WAITING);

        const helpTime = moment.tz(new Date(), "America/New_York").toDate();
        queue.help("stud1", "ta1", "taAndrew1", "taPrefName", true, "zoomURL", helpTime);
        expect(queue.getStatus("stud1")).toBe(StudentStatus.BEING_HELPED);
        const student1Data = queue.getData("stud1");
        expect(student1Data.taID).toBe("ta1");
        expect(student1Data.taAndrewID).toBe("taAndrew1");
        expect(student1Data.helpTime).toBe(helpTime);
        expect(student1Data.isFrozen).toBe(false);

        queue.unhelp("stud1");
        expect(queue.getStatus("stud1")).toBe(StudentStatus.WAITING);
        expect(student1Data.taID).toBe(null);
        expect(student1Data.taAndrewID).toBe(null);
        expect(student1Data.helpTime).toBe(null);
        expect(student1Data.isFrozen).toBe(false);
    });

    test('Can freeze/unfreeze someone on the queue', () => {
        const queue = new OHQueue();
        expect(queue.size()).toBe(0);

        const entryTime = moment.tz(new Date(), "America/New_York").toDate();
        queue.enqueue("stud1", "prefName1", "qn1", "loc1", "top1", entryTime);
        expect(queue.size()).toBe(1);
        expect(queue.getStatus("stud1")).toBe(StudentStatus.WAITING);
        const student1Data = queue.getData("stud1");
        expect(student1Data.isFrozen).toBe(false);

        queue.freeze("stud1");
        expect(queue.getStatus("stud1")).toBe(StudentStatus.FROZEN);
        expect(student1Data.isFrozen).toBe(true);

        queue.unfreeze("stud1");
        expect(queue.getStatus("stud1")).toBe(StudentStatus.WAITING);
        expect(student1Data.isFrozen).toBe(false);
    });

    test('Can set/unset fix question for someone on the queue', () => {
        const queue = new OHQueue();
        expect(queue.size()).toBe(0);

        const entryTime = moment.tz(new Date(), "America/New_York").toDate();
        queue.enqueue("stud1", "prefName1", "qn1", "loc1", "top1", entryTime);
        expect(queue.size()).toBe(1);
        expect(queue.getStatus("stud1")).toBe(StudentStatus.WAITING);
        const student1Data = queue.getData("stud1");
        expect(student1Data.isFrozen).toBe(false);

        queue.setFixQuestion("stud1");
        expect(queue.getStatus("stud1")).toBe(StudentStatus.FIXING_QUESTION);
        expect(student1Data.isFrozen).toBe(true);
        expect(student1Data.numAskedToFix).toBe(1);

        queue.unsetFixQuestion("stud1");
        expect(queue.getStatus("stud1")).toBe(StudentStatus.WAITING);
        expect(student1Data.isFrozen).toBe(false);
        expect(student1Data.numAskedToFix).toBe(1);
    });

    test('Can set/unset cooldown violation for someone on the queue', () => {
        const queue = new OHQueue();
        expect(queue.size()).toBe(0);

        const entryTime = moment.tz(new Date(), "America/New_York").toDate();
        queue.enqueue("stud1", "prefName1", "qn1", "loc1", "top1", entryTime);
        const student1Data = queue.getData("stud1");
        expect(queue.size()).toBe(1);
        expect(queue.getStatus("stud1")).toBe(StudentStatus.WAITING);
        expect(student1Data.isFrozen).toBe(false);

        queue.setCooldownViolation("stud1");
        expect(queue.getStatus("stud1")).toBe(StudentStatus.COOLDOWN_VIOLATION);
        expect(student1Data.isFrozen).toBe(true);

        queue.unsetCooldownViolation("stud1");
        expect(queue.getStatus("stud1")).toBe(StudentStatus.WAITING);
        expect(student1Data.isFrozen).toBe(false);
    });

    test('Removing will shift order bypassing frozen students', () => {
        const queue = new OHQueue();
        expect(queue.size()).toBe(0);

        const entryTime = moment.tz(new Date(), "America/New_York").toDate();
        queue.enqueue("stud1", "prefName1", "qn1", "loc1", "top1", entryTime);
        queue.enqueue("stud2", "prefName2", "qn2", "loc2", "top2", entryTime);
        queue.enqueue("stud3", "prefName3", "qn3", "loc3", "top3", entryTime);
        queue.enqueue("stud4", "prefName4", "qn4", "loc4", "top4", entryTime);
        queue.enqueue("stud5", "prefName5", "qn5", "loc5", "top5", entryTime);
        const student1Data = queue.getData("stud1");
        const student2Data = queue.getData("stud2");
        const student3Data = queue.getData("stud3");
        const student4Data = queue.getData("stud4");
        const student5Data = queue.getData("stud5");
        expect(queue.size()).toBe(5);

        queue.freeze("stud2");
        expect(queue.getStatus("stud2")).toBe(StudentStatus.FROZEN);
        expect(student2Data.isFrozen).toBe(true);

        queue.setFixQuestion("stud4");
        expect(queue.getStatus("stud4")).toBe(StudentStatus.FIXING_QUESTION);
        expect(student4Data.isFrozen).toBe(true);

        queue.remove("stud1");
        expect(queue.size()).toBe(4);
        expect(queue.getPosition("stud3")).toBe(0);
        expect(queue.getPosition("stud2")).toBe(1);
        expect(queue.getPosition("stud5")).toBe(2);
        expect(queue.getPosition("stud4")).toBe(3);

        queue.unfreeze("stud2");
        expect(queue.getStatus("stud2")).toBe(StudentStatus.WAITING);
        expect(student2Data.isFrozen).toBe(false);

        queue.remove("stud3");
        expect(queue.size()).toBe(3);
        expect(queue.getPosition("stud2")).toBe(0);
        expect(queue.getPosition("stud5")).toBe(1);
        expect(queue.getPosition("stud4")).toBe(2);

        queue.enqueue("stud6", "prefName6", "qn6", "loc6", "top6", entryTime);
        queue.setCooldownViolation("stud6");
        expect(queue.size()).toBe(4);

        queue.enqueue("stud7", "prefName7", "qn7", "loc7", "top7", entryTime);
        expect(queue.size()).toBe(5);

        queue.remove("stud2");
        expect(queue.size()).toBe(4);
        expect(queue.getPosition("stud5")).toBe(0);
        expect(queue.getPosition("stud7")).toBe(1);
        expect(queue.getPosition("stud4")).toBe(2);
        expect(queue.getPosition("stud6")).toBe(3);
    });

});
