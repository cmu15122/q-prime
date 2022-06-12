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
    test('Creation makes empty linked list', () => {
        const list = new LinkedList();
        expect(list.size).toBe(0);
        expect(list.isEmpty()).toBe(true);
    });

    test('Add at front has correct values', () => {
        const list = new LinkedList();

        list.addFirst(3);
        expect(list.size).toBe(1);
        expect(list.get(0)).toBe(3);

        list.addFirst(2);
        expect(list.size).toBe(2);
        expect(list.get(0)).toBe(2);
        expect(list.get(1)).toBe(3);

        list.addFirst(1);
        expect(list.size).toBe(3);
        expect(list.get(0)).toBe(1);
        expect(list.get(1)).toBe(2);
        expect(list.get(2)).toBe(3);

        for (var i = 0; i <= 10; i++)
        {
            expect(list.size).toBe(3 + i);
            list.addFirst(i);
            expect(list.size).toBe(3 + i + 1);
        }

        for (var i = 0; i <= 10; i++)
        {
            expect(list.get(i)).toBe(10 - i);
        }
    });

    test('Add at back has correct values', () => {
        const list = new LinkedList();

        list.addLast(3);
        expect(list.size).toBe(1);
        expect(list.get(0)).toBe(3);

        list.addLast(4);
        expect(list.size).toBe(2);
        expect(list.get(0)).toBe(3);
        expect(list.get(1)).toBe(4);

        list.addLast(5);
        expect(list.size).toBe(3);
        expect(list.get(0)).toBe(3);
        expect(list.get(1)).toBe(4);
        expect(list.get(2)).toBe(5);

        for (var i = 0; i <= 10; i++)
        {
            expect(list.size).toBe(3 + i);
            list.addLast(i);
            expect(list.size).toBe(3 + i + 1);
        }

        for (var i = 0; i <= 10; i++)
        {
            expect(list.get(3 + i)).toBe(i);
        }
    });
    
    test('Add/insert/get has correct values', () => {
        const list = new LinkedList();

        list.addFirst(3);
        expect(list.size).toBe(1);
        expect(list.get(0)).toBe(3);
        expect(list.getFirst()).toBe(3);

        list.addLast(5);
        expect(list.size).toBe(2);
        expect(list.get(1)).toBe(5);
        expect(list.getLast()).toBe(5);

        list.insert(4, 1);
        expect(list.size).toBe(3);
        expect(list.get(0)).toBe(3);
        expect(list.get(1)).toBe(4);
        expect(list.get(2)).toBe(5);
    });

    test('Insertion at invalid index throws error', () => {
        const list = new LinkedList();
        expect(() => {
            list.insert(5, 1)
        }).toThrowError(Error);

        expect(() => {
            list.insert(5, -1)
        }).toThrowError(Error);
    });

    test('Get at invalid index throws error', () => {
        const list = new LinkedList();
        expect(list.isEmpty()).toBe(true);

        expect(() => {
            list.getFirst()
        }).toThrowError(Error);

        expect(() => {
            list.getLast()
        }).toThrowError(Error);

        expect(() => {
            list.get(0)
        }).toThrowError(Error);

        expect(() => {
            list.get(1)
        }).toThrowError(Error);

        expect(() => {
            list.get(-1)
        }).toThrowError(Error);
    });

    test('Add/remove at front should result in empty linked list', () => {
        const list = new LinkedList();

        list.addFirst(5);
        expect(list.size).toBe(1);
        expect(list.get(0)).toBe(5);

        var x = list.removeFirst();
        expect(x).toBe(5);
        expect(list.isEmpty()).toBe(true);

        list.addFirst(5);
        x = list.removeAt(0);
        expect(x).toBe(5);
        expect(list.isEmpty()).toBe(true);
    });

    test('Add/remove at back should result in empty linked list', () => {
        const list = new LinkedList();

        list.addLast(5);
        expect(list.size).toBe(1);
        expect(list.get(0)).toBe(5);

        var x = list.removeLast();
        expect(x).toBe(5);
        expect(list.isEmpty()).toBe(true);

        list.addLast(5);
        x = list.removeAt(0);
        expect(x).toBe(5);
        expect(list.isEmpty()).toBe(true);
    });

    test('Add/remove in middle should cause correct behavior', () => {
        const list = new LinkedList();

        list.addFirst(3);
        list.addLast(5);
        list.insert(4, 1); // [3, 4, 5]

        var x = list.removeAt(1);
        expect(x).toBe(4);
        expect(list.size).toBe(2);
        expect(list.get(0)).toBe(3);
        expect(list.get(1)).toBe(5);

        x = list.removeAt(1);
        expect(x).toBe(5);
        expect(list.size).toBe(1);
        expect(list.get(0)).toBe(3);

        list.addFirst(2);
        list.addLast(4);
        expect(list.size).toBe(3);
        expect(list.get(0)).toBe(2);
        expect(list.get(1)).toBe(3);
        expect(list.get(2)).toBe(4);

        x = list.removeAt(0);
        expect(x).toBe(2);
        expect(list.size).toBe(2);
        expect(list.get(0)).toBe(3);
        expect(list.get(1)).toBe(4);

        x = list.removeAt(1);
        expect(x).toBe(4);
        expect(list.size).toBe(1);
        expect(list.get(0)).toBe(3);

        x = list.removeAt(0);
        expect(x).toBe(3);
        expect(list.isEmpty()).toBe(true);
    });

    test('Remove at invalid index throws error', () => {
        const list = new LinkedList();
        expect(list.isEmpty()).toBe(true);

        expect(() => {
            list.removeFirst()
        }).toThrowError(Error);

        expect(() => {
            list.removeLast()
        }).toThrowError(Error);

        expect(() => {
            list.removeAt(0)
        }).toThrowError(Error);

        expect(() => {
            list.removeAt(1)
        }).toThrowError(Error);

        expect(() => {
            list.removeAt(-1)
        }).toThrowError(Error);
    });

    test('Removing data works as expected', () => {
        const list = new LinkedList();
        list.addLast(2);
        list.addLast(3);
        list.addLast(4);
        list.addLast(5);
        list.addLast(6);
        expect(list.size).toBe(5);

        var x = list.removeData(3);
        expect(x).toBe(3);
        expect(list.size).toBe(4);
        expect(list.get(0)).toBe(2);
        expect(list.get(1)).toBe(4);
        expect(list.get(2)).toBe(5);
        expect(list.get(3)).toBe(6);
        
        x = list.removeData(6);
        expect(x).toBe(6);
        expect(list.size).toBe(3);
        expect(list.get(0)).toBe(2);
        expect(list.get(1)).toBe(4);
        expect(list.get(2)).toBe(5);

        x = list.removeData(2);
        expect(x).toBe(2);
        expect(list.size).toBe(2);
        expect(list.get(0)).toBe(4);
        expect(list.get(1)).toBe(5);
    });

    test('Remove invalid data throws error', () => {
        const list = new LinkedList();
        expect(list.isEmpty()).toBe(true);

        expect(() => {
            list.removeData(5)
        }).toThrowError(Error);

        list.addFirst(3);
        list.addFirst(4);
        list.addFirst(5);

        expect(() => {
            list.removeData(6)
        }).toThrowError(Error);
    });

    test('Finding with various predicates should work as expected', () => {
        const list = new LinkedList();
        list.addLast(2);
        list.addLast(3);
        list.addLast(4);
        list.addLast(5);
        list.addLast(6);

        var node = list.find(x => x == 2);
        expect(node.data).toBe(2);

        node = list.find(x => x % 2 == 0);
        expect(node.data).toBe(2);

        node = list.find(x => x % 2 == 1);
        expect(node.data).toBe(3);

        node = list.find(x => x % 5 == 0);
        expect(node.data).toBe(5);
    });

    test('Can find/remove nodes accordingly', () => {
        const list = new LinkedList();
        list.addLast(2);
        list.addLast(3);
        list.addLast(4);
        list.addLast(5);
        list.addLast(6);
        expect(list.size).toBe(5);

        var node = list.find(x => x % 2 == 1);
        expect(node.data).toBe(3);

        var x = list.removeNode(node); // Remove 3 from the list
        expect(x).toBe(3);
        expect(list.size).toBe(4);

        node = list.find(x => x % 2 == 1);
        expect(node.data).toBe(5);
    });

    test('Can swap nodes up accordingly', () => {
        const list = new LinkedList();
        list.addLast(2);
        list.addLast(3);
        list.addLast(4);
        expect(list.size).toBe(3);

        var node = list.find(x => x == 3);
        expect(node.data).toBe(3);

        list.swapUp(node);
        expect(list.size).toBe(3);
        expect(list.get(0)).toBe(3);
        expect(list.get(1)).toBe(2);
        expect(list.get(2)).toBe(4);

        list.swapUp(node);
        expect(list.size).toBe(3);
        expect(list.get(0)).toBe(3);
        expect(list.get(1)).toBe(2);
        expect(list.get(2)).toBe(4);

        node = list.find(x => x == 4);
        expect(node.data).toBe(4);

        list.swapUp(node);
        expect(list.size).toBe(3);
        expect(list.get(0)).toBe(3);
        expect(list.get(1)).toBe(4);
        expect(list.get(2)).toBe(2);
    });

    test('Can swap nodes back accordingly', () => {
        const list = new LinkedList();
        list.addLast(2);
        list.addLast(3);
        list.addLast(4);
        expect(list.size).toBe(3);

        var node = list.find(x => x == 3);
        expect(node.data).toBe(3);

        list.swapBack(node);
        expect(list.size).toBe(3);
        expect(list.get(0)).toBe(2);
        expect(list.get(1)).toBe(4);
        expect(list.get(2)).toBe(3);

        list.swapBack(node);
        expect(list.size).toBe(3);
        expect(list.get(0)).toBe(2);
        expect(list.get(1)).toBe(4);
        expect(list.get(2)).toBe(3);

        node = list.find(x => x == 2);
        expect(node.data).toBe(2);

        list.swapBack(node);
        expect(list.size).toBe(3);
        expect(list.get(0)).toBe(4);
        expect(list.get(1)).toBe(2);
        expect(list.get(2)).toBe(3);
    });
});
