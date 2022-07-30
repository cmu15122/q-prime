/**
 * Class for a linked list queue in Javascript
 */
var assert = require('assert');

class Node {
    constructor(data) {
        this.data = data;
        this.prev = null;
        this.next = null;
    }
}

class LinkedList {
    constructor() {
        this.start = null;
        this.end = null;
        this.size = 0;
    }

    /** Returns true if linked list is empty */
    isEmpty() {
        return this.size == 0;
    }

    /** Adds to the front of the linked list */
    addFirst(data) {
        var newNode = new Node(data);

        if (this.size == 0) {
            this.start = newNode;
            this.end = this.start;
        } else {
            newNode.next = this.start;
            this.start.prev = newNode;
            this.start = newNode;
        }
        this.size++;
    }

    /** Adds to the end of the linked list */
    addLast(data) {
        var newNode = new Node(data);

        if (this.size == 0) {
            this.start = newNode;
            this.end = this.start;
        } else {
            this.end.next = newNode;
            newNode.prev = this.end;
            this.end = newNode;
        }
        this.size++;
    }

    /** Inserts data at given index if index is valid; otherwise, does nothing */
    insert(data, index) {
        if (index < 0 || index > this.size) {
            throw new Error(`Insertion failed: invalid index ${index}`);
        }

        if (index == 0) {
            this.addFirst(data);
            return;
        }

        if (index == this.size) {
            this.addLast(data);
            return;
        }

        var newNode = new Node(data);

        var prevNode = null;
        var nextNode = this.start;
        var currIndex = 0;

        while (currIndex < index) {
            prevNode = nextNode;
            nextNode = nextNode.next;
            currIndex++;
        }

        newNode.prev = prevNode;
        newNode.next = nextNode;

        assert(prevNode != null && nextNode != null);
        prevNode.next = newNode;
        nextNode.prev = newNode;

        this.size++;
    }

    /** Gets the data at the front of the linked list if valid; error otherwise */
    getFirst() {
        if (this.isEmpty()) {
            throw new Error(`Get failed: linked list is empty`);
        }
        return this.start.data;
    }

    /** Gets the data at the end of the linked list if valid; error otherwise */
    getLast() {
        if (this.isEmpty()) {
            throw new Error(`Get failed: linked list is empty`);
        }
        return this.end.data;
    }

    /** Gets the data at the given index if valid; error otherwise */
    get(index) {
        if (index < 0 || index >= this.size) {
            throw new Error(`Get failed: invalid index ${index}`);
        }

        if (index == 0) {
            return this.getFirst();
        }

        if (index == this.size - 1) {
            return this.getLast();
        }

        var currNode = this.start;
        var currIndex = 0;

        while (currIndex < index) {
            currNode = currNode.next;
            currIndex++;
        }

        return currNode.data;
    }

    /** Gets an array of all data in the linked list */
    getAll() {
        var allNodes = []
        var currNode = this.start;

        while (currNode != null) {
            allNodes.push(currNode.data);
            currNode = currNode.next;
        }

        return allNodes;
    }

    /** Returns the first Node whose data satisfies the given predicate; null if none found */
    find(predicate) {
        var currNode = this.start;

        while (currNode != null) {
            if (predicate(currNode.data)) return currNode;
            currNode = currNode.next;
        }

        // None found
        return null;
    }

    /** Removes the node with the given data from the linked list and returns the data; error if invalid */
    removeData(data) {
        if (this.isEmpty()) {
            throw new Error(`Remove failed: empty linked list`);
        }

        var toRemove = this.find(x => (x == data));
        if (toRemove == null) {
            throw new Error(`Remove failed: data not found`);
        }

        this.removeNode(toRemove);
        return toRemove.data;
    }

    /** Removes the given node from the linked list and returns its data; error if invalid */
    removeNode(node) {
        if (node == null) {
            throw new Error(`Remove failed: input node was null`);
        }

        if (this.isEmpty()) {
            throw new Error(`Remove failed: empty linked list`);
        }

        if (node == this.start && this.size == 1) {
            this.start = null;
            this.end = null;
        } else if (node == this.start) {
            this.start = node.next;
            this.start.prev = null;
        } else if (node == this.end) {
            this.end = node.prev;
            this.end.next = null;
        } else {
            node.prev.next = node.next;
            node.next.prev = node.prev;
        }
        this.size--;

        return node.data;
    }

    /** Removes at the front of the linked list and returns its data if valid; error otherwise */
    removeFirst() {
        if (this.isEmpty()) {
            throw new Error(`Remove failed: empty linked list`);
        }
        return this.removeNode(this.start);
    }

    /** Removes at the end of the linked list and returns its data if valid; error otherwise */
    removeLast() {
        if (this.isEmpty()) {
            throw new Error(`Remove failed: empty linked list`);
        }
        return this.removeNode(this.end);
    }

    /** Removes the node at the given index and returns its data if valid; error otherwise */
    removeAt(index) {
        if (index < 0 || index >= this.size) {
            throw new Error(`Remove failed: invalid index ${index}`);
        }

        if (index == 0) {
            return this.removeFirst();
        }

        if (index == this.size - 1) {
            return this.removeLast();
        }

        var currNode = this.start;
        var currIndex = 0;

        while (currIndex < index) {
            currNode = currNode.next;
            currIndex++;
        }

        return this.removeNode(currNode);
    }

    /** Swaps a given node back by one. If node is at the end, do nothing */
    swapBack(node) {
        if (node.next == null) return;

        var nextNode = node.next;
        node.next = nextNode.next;
        nextNode.prev = node.prev;
        node.prev = nextNode;
        nextNode.next = node;

        if (nextNode.prev != null) {
            nextNode.prev.next = nextNode;
        }
        if (node.next != null) {
            node.next.prev = node;
        }

        // Handle edges
        if (this.start == node) {
            this.start = nextNode;
        }
        if (this.end == nextNode) {
            this.end = node;
        }
    }

    /** Swaps a given node up by one. If node is at the front, do nothing */
    swapUp(node) {
        if (node.prev == null) return;

        var prevNode = node.prev;
        node.prev = prevNode.prev;
        prevNode.next = node.next;
        node.next = prevNode;
        prevNode.prev = node;

        if (prevNode.next != null) {
            prevNode.next.prev = prevNode;
        }
        if (node.prev != null) {
            node.prev.next = node;
        }

        // Handle edges
        if (this.start == prevNode) {
            this.start = node;
        }
        if (this.end == node) {
            this.end = prevNode;
        }
    }

    /** Prints out the linked list to the console */
    print() {
        var currNode = this.start;
        var printString = "[";

        while (currNode != null) {
            printString += JSON.stringify(currNode.data) + ", ";
            currNode = currNode.next;
        }
        printString += "]";

        console.log(printString);
    }
}

/** Standin for enum in JavaScript */
const StudentStatus = Object.freeze({
    BEING_HELPED: 0,
    WAITING: 1,
    FIXING_QUESTION: 2,
    FROZEN: 3,
    COOLDOWN_VIOLATION: 4,
    ERROR: 5
});

/**
 * Student data structure
 * {
 *      andrewID: string,
 *      preferredName: string,
 *      status: StudentStatus,
 *      question: string,
 *      location: string,
 *      topic: json string (fields: topic_id (int), name (string)
 *      entryTime: Moment object,
 *      taID: int,
 *      taAndrewID: string,
 *      helpTime: Moment object,
 *      isFrozen: bool,
 *      numAskedToFix: int
 * }
 */

class OHQueue {
    constructor() {
        this.queue = new LinkedList();
    }

    /** Returns the number of students currently in the queue */
    size() {
        return this.queue.size;
    }

    /** Returns whether the queue is currently empty */
    isEmpty() {
        return this.queue.isEmpty();
    }

    /** Enqueues student to the queue */
    enqueue(andrewID, preferredName, question, location, topic, entryTime) {
        var data = {
            andrewID: andrewID,
            preferredName: preferredName,
            status: StudentStatus.WAITING,
            question: question,
            location: location,
            topic: topic,
            entryTime: entryTime,
            taID: null,
            taAndrewID: null,
            helpTime: null,
            isFrozen: false,
            numAskedToFix: 0
        }
        this.queue.addLast(data);
    }

    getData(andrewID) {
        var node = this.queue.find(x => x.andrewID == andrewID);
        if (node == null) return StudentStatus.ERROR;

        assert(node.data != null);
        return node.data;
    }

    /** Returns an array of student data for all students currently on the queue */
    getAllStudentData() {
        return this.queue.getAll();
    }

    /** If found, returns the status of the student with the given id; else returns error */
    getStatus(andrewID) {
        var node = this.queue.find(x => x.andrewID == andrewID);
        if (node == null) return StudentStatus.ERROR;

        assert(node.data != null);
        return node.data.status;
    }

    /**
     * If found, returns the position of the student with the given id; else returns -1
     * Position is 0-indexed, i.e. returns 0 for the first person in the queue
     */
    getPosition(andrewID) {
        var count = 0;
        var currNode = this.queue.start;

        while (currNode != null) {
            if (currNode.data.andrewID == andrewID) return count;
            currNode = currNode.next;
            count++;
        }

        // Not found
        return -1;
    }

    /**
     * If found, removes the student with the given id from the queue
     * Also moves all students behind a frozen student up in the queue
     */
    remove(andrewID) {
        var node = this.queue.find(x => x.andrewID == andrewID);
        if (node == null) return;

        var data = this.queue.removeNode(node);

        // Move up all students behind a frozen student
        var currNode = this.queue.end;
        while (currNode != null) {
            var prevNode = currNode.prev;
            if (prevNode != null) {
                if (!currNode.data.isFrozen && prevNode.data.isFrozen) {
                    this.queue.swapUp(currNode);
                }
            }
            currNode = prevNode;
        }
        return data;
    }

    /// Setting status of students ///

    /** If found, helps the student with the given id */
    help(andrewID, taID, taAndrewID, helpTime) {
        var node = this.queue.find(x => x.andrewID == andrewID);
        if (node != null) {
            node.data.status = StudentStatus.BEING_HELPED;
            node.data.taID = taID;
            node.data.taAndrewID = taAndrewID;
            node.data.helpTime = helpTime;
            node.data.isFrozen = false;
        }
    }

    /** If found, unhelps the student with the given id */
    unhelp(andrewID) {
        var node = this.queue.find(x => x.andrewID == andrewID);
        if (node != null) {
            node.data.status = StudentStatus.WAITING;
            node.data.taID = null;
            node.data.taAndrewID = null;
            node.data.helpTime = null;
            node.data.isFrozen = false;
        }
    }

    /** If found, freezes the student with the given id */
    freeze(andrewID) {
        var node = this.queue.find(x => x.andrewID == andrewID);
        if (node != null) {
            node.data.status = StudentStatus.FROZEN;
            node.data.isFrozen = true;
        }
    }

    /** If found, unfreezes the student with the given id */
    unfreeze(andrewID) {
        var node = this.queue.find(x => x.andrewID == andrewID);
        if (node != null) {
            node.data.status = StudentStatus.WAITING;
            node.data.isFrozen = false;
        }
    }

    /** If found, sets the student with the given id to question fixing */
    setFixQuestion(andrewID) {
        var node = this.queue.find(x => x.andrewID == andrewID);
        if (node != null) {
            node.data.status = StudentStatus.FIXING_QUESTION;
            node.data.isFrozen = true;
            node.data.numAskedToFix += 1;
        }
    }

    /** If found, unsets the student with the given id to question fixing */
    unsetFixQuestion(andrewID) {
        var node = this.queue.find(x => x.andrewID == andrewID);
        if (node != null) {
            node.data.status = StudentStatus.WAITING;
            node.data.isFrozen = false;
        }
    }

    /** If found, sets the student with the given id to cooldown violation */
    setCooldownViolation(andrewID) {
        var node = this.queue.find(x => x.andrewID == andrewID);
        if (node != null) {
            node.data.status = StudentStatus.COOLDOWN_VIOLATION;
            node.data.isFrozen = true;
        }
    }

    /** If found, unsets the student with the given id to cooldown violation */
    unsetCooldownViolation(andrewID) {
        var node = this.queue.find(x => x.andrewID == andrewID);
        if (node != null) {
            node.data.status = StudentStatus.WAITING;
            node.data.isFrozen = false;
        }
    }

    /** Prints out the queue to the console */
    print() {
        this.queue.print();
    }
}

module.exports.Node = Node;
module.exports.LinkedList = LinkedList;
module.exports.StudentStatus = StudentStatus;
module.exports.OHQueue = OHQueue;
