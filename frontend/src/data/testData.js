export const testLibrary = [
  {
    id: 1,
    title: "Software Engineer Readiness Test",
    role: "Software Engineer",
    difficulty: "Medium",
    mcqs: [
      { q: "What is the time complexity of searching in a Hash Map?", options: ["O(1)", "O(n)", "O(log n)"], answer: "O(1)", skill: "DSA" },
      { q: "Which command is used to combine two branches in Git?", options: ["git combine", "git join", "git merge"], answer: "git merge", skill: "Git" },
      { q: "What does the 'self' keyword represent in Python classes?", options: ["The class itself", "The instance of the class", "The parent class"], answer: "The instance of the class", skill: "Python" }
    ],
    codingProblems: [
      {
        title: "Array Sum Challenge",
        description: "Write a function 'sumArray(arr)' that returns the sum of all numbers in an array.",
        initialCode: "function sumArray(arr) {\n  // Write your code here\n}",
        testCase: "[1, 2, 3, 4] should return 10",
        skill: "DSA"
      },
      {
        title: "Reverse String (No Slicing)",
        description: "Write a Python function to reverse a string without using slicing [::-1].",
        initialCode: "def reverse_string(s):\n    # Your code here\n    pass",
        testCase: "reverse_string('hello') == 'olleh'",
        skill: "Python"
      }
    ]
  }
];