// Testing code for our queue

import { Node, LinkedList } from '../controllers/queue.js';
describe('List Node tests', () => {
    test('Creation has correct default values', () => {
        const node = new Node(3);
        expect(node.data).toBe(3);
        expect(node.prev).toBe(null);
        expect(node.next).toBe(null);
    });
});

describe('Linked List tests', () => {
    test('Creation has correct default values', () => {
        const list = new LinkedList();
        expect(list.size).toBe(0);
        expect(list.start).toBe(null);
        expect(list.end).toBe(null);
    });
    
    test('Insert/get has correct values', () => {
        const list = new LinkedList();
        expect(list.getFirst()).toBe(null);

        list.addFirst(3);
        expect(list.size).toBe(1);
        expect(list.getFirst()).toBe(3);

        list.addLast(5);
        expect(list.size).toBe(2);
        expect(list.getLast()).toBe(5);

        list.insert(4, 1);
        expect(list.size).toBe(3);
        expect(list.get(0)).toBe(3);
        expect(list.get(1)).toBe(4);
        expect(list.get(2)).toBe(5);
    });
});
