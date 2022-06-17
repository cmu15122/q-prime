// Testing code for our queue
const queue = require('../controllers/queue');

const OHQueue = queue.OHQueue;
const StudentStatus = queue.StudentStatus;

describe('Queue tests', () => {
    test('Creation makes empty queue', () => {
        const queue = new OHQueue();
        expect(queue.size()).toBe(0);
        expect(queue.isEmpty()).toBe(true);
    });

    test('Enqueue adds student to be waiting on the queue', () => {
        const queue = new OHQueue();
        expect(queue.size()).toBe(0);

        queue.enqueue("student1");
        expect(queue.size()).toBe(1);
        expect(queue.getPosition("student1")).toBe(0);
        expect(queue.getStatus("student1")).toBe(StudentStatus.WAITING);
    });

    test('Enqueue adds students in FIFO order', () => {
        const queue = new OHQueue();
        expect(queue.size()).toBe(0);

        queue.enqueue("student1");
        expect(queue.size()).toBe(1);
        expect(queue.getPosition("student1")).toBe(0);

        queue.enqueue("student2");
        expect(queue.size()).toBe(2);
        expect(queue.getPosition("student1")).toBe(0);
        expect(queue.getPosition("student2")).toBe(1);

        queue.enqueue("student3");
        expect(queue.size()).toBe(3);
        expect(queue.getPosition("student1")).toBe(0);
        expect(queue.getPosition("student2")).toBe(1);
        expect(queue.getPosition("student3")).toBe(2);
    });

    test('Getting position of someone not on queue returns -1', () => {
        const queue = new OHQueue();
        expect(queue.size()).toBe(0);
        expect(queue.getPosition("student1")).toBe(-1);

        queue.enqueue("student1");
        expect(queue.size()).toBe(1);
        expect(queue.getPosition("student1")).toBe(0);
        expect(queue.getPosition("student2")).toBe(-1);
    });

    test('Getting status of someone not on queue returns ERROR', () => {
        const queue = new OHQueue();
        expect(queue.size()).toBe(0);
        expect(queue.getStatus("student1")).toBe(StudentStatus.ERROR);

        queue.enqueue("student1");
        expect(queue.size()).toBe(1);
        expect(queue.getStatus("student1")).toBe(StudentStatus.WAITING);
        expect(queue.getStatus("student2")).toBe(StudentStatus.ERROR);
    });

    test('Can remove someone from the queue', () => {
        const queue = new OHQueue();
        expect(queue.size()).toBe(0);

        queue.enqueue("student1");
        expect(queue.size()).toBe(1);
        expect(queue.getPosition("student1")).toBe(0);

        queue.remove("student1");
        expect(queue.size()).toBe(0);

        queue.enqueue("student2");
        expect(queue.size()).toBe(1);
        expect(queue.getPosition("student2")).toBe(0);

        queue.enqueue("student3");
        expect(queue.size()).toBe(2);
        expect(queue.getPosition("student2")).toBe(0);
        expect(queue.getPosition("student3")).toBe(1);

        queue.enqueue("student4");
        expect(queue.size()).toBe(3);
        expect(queue.getPosition("student2")).toBe(0);
        expect(queue.getPosition("student3")).toBe(1);
        expect(queue.getPosition("student4")).toBe(2);

        queue.remove("student3");
        expect(queue.size()).toBe(2);
        expect(queue.getPosition("student2")).toBe(0);
        expect(queue.getPosition("student4")).toBe(1);

        queue.remove("student4");
        expect(queue.size()).toBe(1);
        expect(queue.getPosition("student2")).toBe(0);

        queue.remove("student2");
        expect(queue.size()).toBe(0);
    });

    test('Can help/unhelp someone on the queue', () => {
        const queue = new OHQueue();
        expect(queue.size()).toBe(0);

        queue.enqueue("student1");
        expect(queue.size()).toBe(1);
        expect(queue.getStatus("student1")).toBe(StudentStatus.WAITING);

        queue.help("student1");
        expect(queue.getStatus("student1")).toBe(StudentStatus.BEING_HELPED);

        queue.unhelp("student1");
        expect(queue.getStatus("student1")).toBe(StudentStatus.WAITING);
    });

    test('Can freeze/unfreeze someone on the queue', () => {
        const queue = new OHQueue();
        expect(queue.size()).toBe(0);

        queue.enqueue("student1");
        expect(queue.size()).toBe(1);
        expect(queue.getStatus("student1")).toBe(StudentStatus.WAITING);

        queue.freeze("student1");
        expect(queue.getStatus("student1")).toBe(StudentStatus.FROZEN);

        queue.unfreeze("student1");
        expect(queue.getStatus("student1")).toBe(StudentStatus.WAITING);
    });

    test('Can set/unset fix question for someone on the queue', () => {
        const queue = new OHQueue();
        expect(queue.size()).toBe(0);

        queue.enqueue("student1");
        expect(queue.size()).toBe(1);
        expect(queue.getStatus("student1")).toBe(StudentStatus.WAITING);

        queue.setFixQuestion("student1");
        expect(queue.getStatus("student1")).toBe(StudentStatus.FIXING_QUESTION);

        queue.unsetFixQuestion("student1");
        expect(queue.getStatus("student1")).toBe(StudentStatus.WAITING);
    });

    test('Can set/unset cooldown violation for someone on the queue', () => {
        const queue = new OHQueue();
        expect(queue.size()).toBe(0);

        queue.enqueue("student1");
        expect(queue.size()).toBe(1);
        expect(queue.getStatus("student1")).toBe(StudentStatus.WAITING);

        queue.setCooldownViolation("student1");
        expect(queue.getStatus("student1")).toBe(StudentStatus.COOLDOWN_VIOLATION);

        queue.unsetCooldownViolation("student1");
        expect(queue.getStatus("student1")).toBe(StudentStatus.WAITING);
    });

    test('Removing will shift order bypassing frozen students', () => {
        const queue = new OHQueue();
        expect(queue.size()).toBe(0);

        queue.enqueue("student1");
        queue.enqueue("student2");
        queue.enqueue("student3");
        queue.enqueue("student4");
        queue.enqueue("student5");
        expect(queue.size()).toBe(5);

        queue.freeze("student2");
        expect(queue.getStatus("student2")).toBe(StudentStatus.FROZEN);

        queue.setFixQuestion("student4");
        expect(queue.getStatus("student4")).toBe(StudentStatus.FIXING_QUESTION);

        queue.remove("student1");
        expect(queue.size()).toBe(4);
        expect(queue.getPosition("student3")).toBe(0);
        expect(queue.getPosition("student2")).toBe(1);
        expect(queue.getPosition("student5")).toBe(2);
        expect(queue.getPosition("student4")).toBe(3);

        queue.unfreeze("student2");
        expect(queue.getStatus("student2")).toBe(StudentStatus.WAITING);

        queue.remove("student3");
        expect(queue.size()).toBe(3);
        expect(queue.getPosition("student2")).toBe(0);
        expect(queue.getPosition("student5")).toBe(1);
        expect(queue.getPosition("student4")).toBe(2);

        queue.enqueue("student6");
        queue.setCooldownViolation("student6");
        expect(queue.size()).toBe(4);
        
        queue.enqueue("student7");
        expect(queue.size()).toBe(5);

        queue.remove("student2");
        expect(queue.size()).toBe(4);
        expect(queue.getPosition("student5")).toBe(0);
        expect(queue.getPosition("student7")).toBe(1);
        expect(queue.getPosition("student4")).toBe(2);
        expect(queue.getPosition("student6")).toBe(3);
    });
});
