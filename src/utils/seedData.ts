import { Topic, Quiz, Question, Difficulty } from '../types';

/**
 * Seed data for demo purposes.
 * This can be used to populate Firestore or for local demo mode.
 */

export const SEED_TOPICS: Omit<Topic, 'id'>[] = [
    { name: 'Arrays', language: 'Java' },
    { name: 'Linked Lists', language: 'Java' },
    { name: 'Strings', language: 'Java' },
    { name: 'OOP Concepts', language: 'Java' },
    { name: 'Lists', language: 'Python' },
    { name: 'Dictionaries', language: 'Python' },
    { name: 'Functions', language: 'Python' },
    { name: 'Arrays', language: 'JavaScript' },
    { name: 'Promises', language: 'JavaScript' },
    { name: 'DOM Manipulation', language: 'JavaScript' },
];

interface SeedQuiz {
    title: string;
    topicName: string;
    language: string;
    questions: Omit<Question, 'id' | 'quizId'>[];
}

export const SEED_QUIZZES: SeedQuiz[] = [
    {
        title: 'Java Arrays Fundamentals',
        topicName: 'Arrays',
        language: 'Java',
        questions: [
            {
                difficulty: 'easy',
                questionText: 'What is the default value of an int array element in Java?',
                options: ['0', '1', 'null', 'undefined'],
                correctAnswer: 0,
                explanation: "In Java, primitive number arrays (like int[]) automatically initialize their elements to 0 when created, whereas object arrays initialize to null."
            },
            {
                difficulty: 'easy',
                questionText: 'How do you declare an array of integers in Java?',
                options: ['int arr[]', 'int[] arr', 'Both A and B', 'array int arr'],
                correctAnswer: 2,
                explanation: "Java accepts both 'int[] arr' (preferred, as it clearly shows the type is an int array) and 'int arr[]' (C/C++ legacy style)."
            },
            {
                difficulty: 'easy',
                questionText: 'What is the index of the first element in a Java array?',
                options: ['0', '1', '-1', 'It depends on declaration'],
                correctAnswer: 0,
                explanation: "Java arrays are zero-indexed, meaning the first element is always accessed at index 0."
            },
            {
                difficulty: 'medium',
                questionText: 'What happens when you access an array index that is out of bounds?',
                options: [
                    'Returns null',
                    'Returns 0',
                    'ArrayIndexOutOfBoundsException',
                    'Compilation error',
                ],
                correctAnswer: 2,
                explanation: "Java performs runtime boundary checks. Accessing an index < 0 or >= array.length throws an ArrayIndexOutOfBoundsException."
            },
            {
                difficulty: 'medium',
                questionText: 'Which method is used to sort an array in Java?',
                options: ['Array.sort()', 'Arrays.sort()', 'arr.sort()', 'Collections.sort()'],
                correctAnswer: 1,
                explanation: "The java.util.Arrays utility class provides static methods for array operations, including Arrays.sort(arr) for sorting."
            },
            {
                difficulty: 'medium',
                questionText: 'What is the time complexity of accessing an element by index in an array?',
                options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
                correctAnswer: 0,
                explanation: "Arrays occupy contiguous memory. Math is used to instantly jump to the memory address of the index, resulting in O(1) constant time."
            },
            {
                difficulty: 'hard',
                questionText: 'How does Arrays.binarySearch() behave if the array is not sorted?',
                options: [
                    'Throws an exception',
                    'Returns -1',
                    'Results are undefined',
                    'Sorts the array first',
                ],
                correctAnswer: 2,
                explanation: "Binary search algorithms require a pre-sorted array to divide and conquer correctly. If unsorted, the result is completely unpredictable (undefined)."
            },
            {
                difficulty: 'hard',
                questionText: 'What is the space complexity of merging two sorted arrays of sizes m and n?',
                options: ['O(1)', 'O(m)', 'O(n)', 'O(m + n)'],
                correctAnswer: 3,
                explanation: "Standard merging requires creating a brand new array large enough to hold all elements from both source arrays, leading to O(m + n) space."
            },
            {
                difficulty: 'hard',
                questionText: 'Which approach finds the k-th largest element in an unsorted array most efficiently on average?',
                options: [
                    'Sort the array first - O(n log n)',
                    'Quickselect algorithm - O(n) average',
                    'Use a min-heap of size k - O(n log k)',
                    'Linear search k times - O(nk)',
                ],
                correctAnswer: 1,
                explanation: "Quickselect, patterned after quicksort, partitions the array and discards the side not containing the k-th element, achieving O(n) average time complexity."
            },
        ],
    },
    {
        title: 'Java Linked Lists Mastery',
        topicName: 'Linked Lists',
        language: 'Java',
        questions: [
            {
                difficulty: 'easy',
                questionText: 'What is a linked list?',
                options: [
                    'A static array of elements',
                    'A collection of nodes where each node points to the next',
                    'A type of hash map',
                    'A sorted array',
                ],
                correctAnswer: 1,
                explanation: "A linked list is a linear data structure where elements are not stored at contiguous memory locations, but rather are linked using pointers."
            },
            {
                difficulty: 'easy',
                questionText: 'What does the head of a linked list represent?',
                options: ['Last node', 'First node', 'Middle node', 'Null node'],
                correctAnswer: 1,
                explanation: "The 'head' is a reference to the very first node in a linked list. If the list is empty, the head refers to null."
            },
            {
                difficulty: 'easy',
                questionText: 'What is stored in a node of a singly linked list?',
                options: ['Only data', 'Data and pointer to next node', 'Data and pointer to previous node', 'Only a pointer'],
                correctAnswer: 1,
                explanation: "A singly linked list node contains two fields: the actual data (payload), and a reference (pointer) to the next node in the sequence."
            },
            {
                difficulty: 'medium',
                questionText: 'What is the time complexity of inserting at the beginning of a linked list?',
                options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
                correctAnswer: 0,
                explanation: "Inserting at the head only requires creating a new node, pointing it to the current head, and updating the head reference. No traversal is needed, taking O(1) time."
            },
            {
                difficulty: 'medium',
                questionText: 'Which type of linked list allows traversal in both directions?',
                options: ['Singly linked list', 'Doubly linked list', 'Circular linked list', 'None'],
                correctAnswer: 1,
                explanation: "A doubly linked list node contains two pointers: one pointing to the next node, and one pointing to the previous node."
            },
            {
                difficulty: 'medium',
                questionText: 'What happens to the previous node when deleting a node from a singly linked list?',
                options: [
                    'Its next pointer updates to skip the deleted node',
                    'It is also deleted',
                    'Nothing changes',
                    'It becomes the new head',
                ],
                correctAnswer: 0,
                explanation: "To remove a node, you safely detach it by pointing the 'next' reference of the preceding node directly to the node following the one you want to delete."
            },
            {
                difficulty: 'hard',
                questionText: 'How can you detect a cycle in a linked list efficiently?',
                options: [
                    'Use a hash set to store visited nodes',
                    'Floyd\'s cycle-finding algorithm (two pointers)',
                    'Both A and B are valid approaches',
                    'Cycles cannot be detected',
                ],
                correctAnswer: 2,
                explanation: "Both are valid: Hash sets store O(N) memory but run in O(N). Floyd's 'Tortoise and Hare' algorithm is generally preferred as it also runs in O(N) but uses O(1) space."
            },
            {
                difficulty: 'hard',
                questionText: 'What is the time complexity of reversing a singly linked list iteratively?',
                options: ['O(1)', 'O(n)', 'O(n log n)', 'O(n²)'],
                correctAnswer: 1,
                explanation: "Iterative reversal requires traversing the entire list exactly once, swapping pointers node-by-node, resulting in an O(n) runtime."
            },
            {
                difficulty: 'hard',
                questionText: 'In a doubly linked list, what is the space overhead per node compared to an array element?',
                options: [
                    'One extra pointer',
                    'Two extra pointers',
                    'No overhead',
                    'Three extra pointers',
                ],
                correctAnswer: 1,
                explanation: "Compared to a raw array data value, a doubly linked list node requires two extra pointers (next and prev) to maintain the connections."
            },
        ],
    },
    {
        title: 'Python Lists Deep Dive',
        topicName: 'Lists',
        language: 'Python',
        questions: [
            {
                difficulty: 'easy',
                questionText: 'How do you create an empty list in Python?',
                options: ['list = []', 'list = ()', 'list = {}', 'list = new List()'],
                correctAnswer: 0,
                explanation: "In Python, square brackets [] indicate a list. Parentheses () create a tuple, and curly braces {} create a dict or set."
            },
            {
                difficulty: 'easy',
                questionText: 'Which method adds an element to the end of a Python list?',
                options: ['add()', 'append()', 'insert()', 'push()'],
                correctAnswer: 1,
                explanation: "The .append(item) method mutates the list by adding a single element to the very end. .insert() puts it at a specific index, and push() is for JS arrays."
            },
            {
                difficulty: 'easy',
                questionText: 'What does len() return for a list?',
                options: ['The first element', 'The last element', 'The number of elements', 'The total memory used'],
                correctAnswer: 2,
                explanation: "The built-in len() function returns the total count of items contained in the sequence or collection."
            },
            {
                difficulty: 'medium',
                questionText: 'What is the output of [1, 2, 3][1:3]?',
                options: ['[1, 2]', '[2, 3]', '[1, 2, 3]', '[2]'],
                correctAnswer: 1,
                explanation: "List slicing [start:end] includes the start index (1 => value 2) and goes UP TO but not including the end index (3 => index 2 value 3), resulting in [2, 3]."
            },
            {
                difficulty: 'medium',
                questionText: 'What does list comprehension [x**2 for x in range(4)] produce?',
                options: ['[0, 1, 4, 9]', '[1, 4, 9, 16]', '[0, 1, 2, 3]', '[1, 2, 3, 4]'],
                correctAnswer: 0,
                explanation: "range(4) produces 0, 1, 2, 3. The comprehension squares each element: 0^2=0, 1^2=1, 2^2=4, 3^2=9."
            },
            {
                difficulty: 'medium',
                questionText: 'How do you remove duplicates from a list while preserving order?',
                options: [
                    'list(dict.fromkeys(my_list))',
                    'set(my_list)',
                    'my_list.unique()',
                    'my_list.distinct()',
                ],
                correctAnswer: 0,
                explanation: "set(my_list) removes duplicates but destroys insertion order. Since Python 3.7+, standard dicts guarantee insertion order, so dict.fromkeys() is the idiomatic way."
            },
            {
                difficulty: 'hard',
                questionText: 'What is the time complexity of Python\'s list.sort() method?',
                options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
                correctAnswer: 1,
                explanation: "Timsort is highly optimized, but mathematically worst case and average case sorting falls under the O(n log n) bound."
            },
            {
                difficulty: 'hard',
                questionText: 'What algorithm does Python use internally for sorting lists?',
                options: ['QuickSort', 'MergeSort', 'TimSort', 'HeapSort'],
                correctAnswer: 2,
                explanation: "Python uses Timsort, a hybrid stable sorting algorithm derived from merge sort and insertion sort, designed to perform well on many kinds of real-world data."
            },
            {
                difficulty: 'hard',
                questionText: 'What is the amortized time complexity of list.append() in Python?',
                options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
                correctAnswer: 0,
                explanation: "Python lists are dynamic arrays. Appending is generally O(1). Occasionally it triggers an O(n) reallocation, but amortized over many appends, it averages strictly to O(1)."
            },
        ],
    },
    {
        title: 'JavaScript Promises & Async',
        topicName: 'Promises',
        language: 'JavaScript',
        questions: [
            {
                difficulty: 'easy',
                questionText: 'What is a Promise in JavaScript?',
                options: [
                    'A callback function',
                    'An object representing eventual completion or failure of an async operation',
                    'A type of loop',
                    'A data structure',
                ],
                correctAnswer: 1,
                explanation: "A Promise is an object that acts as a placeholder for the result of an asynchronous operation that hasn't completed yet."
            },
            {
                difficulty: 'easy',
                questionText: 'What are the possible states of a Promise?',
                options: [
                    'started, running, stopped',
                    'pending, fulfilled, rejected',
                    'open, closed, error',
                    'active, inactive, complete',
                ],
                correctAnswer: 1,
                explanation: "Promises begin in a 'pending' state, and eventually settle into either 'fulfilled' (resolved successfully) or 'rejected' (failed)."
            },
            {
                difficulty: 'easy',
                questionText: 'Which method is used to handle a fulfilled Promise?',
                options: ['.then()', '.catch()', '.finally()', '.resolve()'],
                correctAnswer: 0,
                explanation: ".then() registers callbacks for when the Promise successfully resolves, whereas .catch() is used for rejections."
            },
            {
                difficulty: 'medium',
                questionText: 'What does async/await do in JavaScript?',
                options: [
                    'Creates new threads',
                    'Provides syntactic sugar for working with Promises',
                    'Replaces Promises entirely',
                    'Blocks the event loop',
                ],
                correctAnswer: 1,
                explanation: "Async/await functions still return and process Promises under the hood, but allow you to write asynchronous code that visually looks synchronous."
            },
            {
                difficulty: 'medium',
                questionText: 'What does Promise.all() return if one promise rejects?',
                options: [
                    'The results of all successful promises',
                    'Immediately rejects with the first rejection reason',
                    'Returns null',
                    'Waits for all promises to settle',
                ],
                correctAnswer: 1,
                explanation: "Promise.all() 'fails fast'. If any single Promise within the array rejects, the entire returned Promise rejects immediately with that error."
            },
            {
                difficulty: 'medium',
                questionText: 'What is the difference between Promise.all() and Promise.allSettled()?',
                options: [
                    'No difference',
                    'allSettled waits for all promises regardless of rejection',
                    'all() is faster',
                    'allSettled returns only fulfilled promises',
                ],
                correctAnswer: 1,
                explanation: "Unlike Promise.all(), Promise.allSettled() never rejects itself. It waits for every input Promise to either fulfill or reject, then returns an array of their status."
            },
            {
                difficulty: 'hard',
                questionText: 'What is the output order of: console.log(1); Promise.resolve().then(() => console.log(2)); console.log(3);',
                options: ['1, 2, 3', '1, 3, 2', '2, 1, 3', '3, 2, 1'],
                correctAnswer: 1,
                explanation: "Synchronous logs (1 and 3) run first. The Promise .then() callback (2) is sent to the microtask queue, running only after the main execution stack clears."
            },
            {
                difficulty: 'hard',
                questionText: 'How do microtasks (promises) differ from macrotasks (setTimeout) in the event loop?',
                options: [
                    'No difference',
                    'Microtasks execute before the next macrotask',
                    'Macrotasks always run first',
                    'They run in parallel',
                ],
                correctAnswer: 1,
                explanation: "Microtasks (Promises) have higher priority. The event loop entirely empties the microtask queue immediately after the current task, before moving to the next macrotask (setTimeout)."
            },
            {
                difficulty: 'hard',
                questionText: 'What potential issue can arise from using await inside a loop?',
                options: [
                    'Syntax errors',
                    'Sequential execution instead of parallel, reducing performance',
                    'Memory leaks',
                    'No issues at all',
                ],
                correctAnswer: 1,
                explanation: "Awaiting inside a loop pauses the loop iteration until the promise completes. If the tasks are independent, doing this prevents them from running in parallel, which is slower compared to mapping into a Promise.all()."
            },
        ],
    },
];

// Helper to get demo data without Firestore
export function getDemoTopics(): Topic[] {
    return SEED_TOPICS.map((t, i) => ({ ...t, id: `topic_${i}` }));
}

export function getDemoQuizzes(): Quiz[] {
    const topics = getDemoTopics();
    return SEED_QUIZZES.map((q, i) => {
        const topic = topics.find((t) => t.name === q.topicName && t.language === q.language);
        return {
            id: `quiz_${i}`,
            title: q.title,
            topicId: topic?.id || '',
            language: q.language,
            createdBy: 'admin',
            createdAt: new Date(),
            questionCount: q.questions.length,
        };
    });
}

export function getDemoQuestions(quizId: string): Question[] {
    const quizIndex = parseInt(quizId.replace('quiz_', ''));
    const quiz = SEED_QUIZZES[quizIndex];
    if (!quiz) return [];
    return quiz.questions.map((q, i) => ({
        ...q,
        id: `${quizId}_q_${i}`,
        quizId,
    }));
}
