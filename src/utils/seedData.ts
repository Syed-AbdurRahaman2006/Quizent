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
            },
            {
                difficulty: 'easy',
                questionText: 'How do you declare an array of integers in Java?',
                options: ['int arr[]', 'int[] arr', 'Both A and B', 'array int arr'],
                correctAnswer: 2,
            },
            {
                difficulty: 'easy',
                questionText: 'What is the index of the first element in a Java array?',
                options: ['0', '1', '-1', 'It depends on declaration'],
                correctAnswer: 0,
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
            },
            {
                difficulty: 'medium',
                questionText: 'Which method is used to sort an array in Java?',
                options: ['Array.sort()', 'Arrays.sort()', 'arr.sort()', 'Collections.sort()'],
                correctAnswer: 1,
            },
            {
                difficulty: 'medium',
                questionText: 'What is the time complexity of accessing an element by index in an array?',
                options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
                correctAnswer: 0,
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
            },
            {
                difficulty: 'hard',
                questionText: 'What is the space complexity of merging two sorted arrays of sizes m and n?',
                options: ['O(1)', 'O(m)', 'O(n)', 'O(m + n)'],
                correctAnswer: 3,
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
            },
            {
                difficulty: 'easy',
                questionText: 'What does the head of a linked list represent?',
                options: ['Last node', 'First node', 'Middle node', 'Null node'],
                correctAnswer: 1,
            },
            {
                difficulty: 'easy',
                questionText: 'What is stored in a node of a singly linked list?',
                options: ['Only data', 'Data and pointer to next node', 'Data and pointer to previous node', 'Only a pointer'],
                correctAnswer: 1,
            },
            {
                difficulty: 'medium',
                questionText: 'What is the time complexity of inserting at the beginning of a linked list?',
                options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
                correctAnswer: 0,
            },
            {
                difficulty: 'medium',
                questionText: 'Which type of linked list allows traversal in both directions?',
                options: ['Singly linked list', 'Doubly linked list', 'Circular linked list', 'None'],
                correctAnswer: 1,
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
            },
            {
                difficulty: 'hard',
                questionText: 'What is the time complexity of reversing a singly linked list iteratively?',
                options: ['O(1)', 'O(n)', 'O(n log n)', 'O(n²)'],
                correctAnswer: 1,
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
            },
            {
                difficulty: 'easy',
                questionText: 'Which method adds an element to the end of a Python list?',
                options: ['add()', 'append()', 'insert()', 'push()'],
                correctAnswer: 1,
            },
            {
                difficulty: 'easy',
                questionText: 'What does len() return for a list?',
                options: ['The first element', 'The last element', 'The number of elements', 'The total memory used'],
                correctAnswer: 2,
            },
            {
                difficulty: 'medium',
                questionText: 'What is the output of [1, 2, 3][1:3]?',
                options: ['[1, 2]', '[2, 3]', '[1, 2, 3]', '[2]'],
                correctAnswer: 1,
            },
            {
                difficulty: 'medium',
                questionText: 'What does list comprehension [x**2 for x in range(4)] produce?',
                options: ['[0, 1, 4, 9]', '[1, 4, 9, 16]', '[0, 1, 2, 3]', '[1, 2, 3, 4]'],
                correctAnswer: 0,
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
            },
            {
                difficulty: 'hard',
                questionText: 'What is the time complexity of Python\'s list.sort() method?',
                options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
                correctAnswer: 1,
            },
            {
                difficulty: 'hard',
                questionText: 'What algorithm does Python use internally for sorting lists?',
                options: ['QuickSort', 'MergeSort', 'TimSort', 'HeapSort'],
                correctAnswer: 2,
            },
            {
                difficulty: 'hard',
                questionText: 'What is the amortized time complexity of list.append() in Python?',
                options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
                correctAnswer: 0,
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
            },
            {
                difficulty: 'easy',
                questionText: 'Which method is used to handle a fulfilled Promise?',
                options: ['.then()', '.catch()', '.finally()', '.resolve()'],
                correctAnswer: 0,
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
            },
            {
                difficulty: 'hard',
                questionText: 'What is the output order of: console.log(1); Promise.resolve().then(() => console.log(2)); console.log(3);',
                options: ['1, 2, 3', '1, 3, 2', '2, 1, 3', '3, 2, 1'],
                correctAnswer: 1,
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
