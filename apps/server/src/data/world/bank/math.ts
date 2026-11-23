// Written by scripts/world-content.ts (writer deepseek-v4.1-flash-1017, checker qwen3.8-27b, auditor glm-5.3-flash). Don't edit by hand.
import type { WorldBank } from '../types.js';

export const MATH_BANK: WorldBank = {
 "1": {
  "questions": [
   {
    "id": "math-L1-q1",
    "q": "What is the value of 7 × 8?",
    "options": [
     "54",
     "48",
     "63",
     "56"
    ],
    "answer": 3,
    "why": "7 × 8 = 56, since 7 × 8 is one of the basic multiplication facts.",
    "hint": "Think of 7 groups of 8, or 8 groups of 7."
   },
   {
    "id": "math-L1-q2",
    "q": "Which fraction is equivalent to 0.25?",
    "options": [
     "1/2",
     "1/3",
     "2/5",
     "1/4"
    ],
    "answer": 3,
    "why": "0.25 means 25 hundredths, which simplifies to 1/4.",
    "hint": "Divide 1 by 4 on a calculator."
   },
   {
    "id": "math-L1-q3",
    "q": "What is 15% of 200?",
    "options": [
     "30",
     "15",
     "20",
     "45"
    ],
    "answer": 0,
    "why": "15% of 200 = 0.15 × 200 = 30.",
    "hint": "10% of 200 is 20; add half of that again."
   },
   {
    "id": "math-L1-q4",
    "q": "Simplify: 3x + 5x",
    "options": [
     "8x",
     "15x",
     "8x²",
     "2x"
    ],
    "answer": 0,
    "why": "Like terms add by adding their coefficients: 3 + 5 = 8, so 3x + 5x = 8x.",
    "hint": "The x stays the same; just add the numbers in front."
   },
   {
    "id": "math-L1-q5",
    "q": "A triangle has angles 50° and 60°. What is the third angle?",
    "options": [
     "90°",
     "80°",
     "70°",
     "60°"
    ],
    "answer": 2,
    "why": "Angles in a triangle add to 180°, so the third is 180 − 50 − 60 = 70°.",
    "hint": "The three angles together make a straight angle."
   },
   {
    "id": "math-L1-q6",
    "q": "What is the mean (average) of 4, 8, 10 and 14?",
    "options": [
     "10",
     "8",
     "12",
     "9"
    ],
    "answer": 3,
    "why": "The sum is 36, and 36 ÷ 4 = 9.",
    "hint": "Add them all, then divide by how many there are."
   },
   {
    "id": "math-L1-q7",
    "q": "What is the next term in the sequence 2, 4, 6, 8, ...?",
    "options": [
     "16",
     "12",
     "10",
     "9"
    ],
    "answer": 2,
    "why": "The sequence increases by 2 each time, so after 8 comes 10.",
    "hint": "Find the difference between neighbouring terms."
   },
   {
    "id": "math-L1-q8",
    "q": "What is 2³ (two cubed)?",
    "options": [
     "6",
     "8",
     "9",
     "12"
    ],
    "answer": 1,
    "why": "2³ means 2 × 2 × 2 = 8.",
    "hint": "Multiply 2 by itself three times in total."
   },
   {
    "id": "math-L1-q9",
    "q": "Which of these numbers is prime?",
    "options": [
     "9",
     "15",
     "17",
     "21"
    ],
    "answer": 2,
    "why": "17 has exactly two factors, 1 and 17; the others each have more factors.",
    "hint": "A prime has no divisors except 1 and itself."
   },
   {
    "id": "math-L1-q10",
    "q": "What is the perimeter of a square with side 6 cm?",
    "options": [
     "12 cm",
     "24 cm",
     "36 cm",
     "18 cm"
    ],
    "answer": 1,
    "why": "A square has four equal sides, so perimeter = 4 × 6 = 24 cm.",
    "hint": "Walk all the way round the square."
   },
   {
    "id": "math-L1-q11",
    "q": "What is 1/2 + 1/4?",
    "options": [
     "1/6",
     "3/4",
     "2/4",
     "2/6"
    ],
    "answer": 1,
    "why": "1/2 = 2/4, and 2/4 + 1/4 = 3/4.",
    "hint": "Make the denominators the same first."
   },
   {
    "id": "math-L1-q12",
    "q": "If a fair coin is tossed once, what is the probability of getting heads?",
    "options": [
     "0",
     "1/4",
     "1/2",
     "1"
    ],
    "answer": 2,
    "why": "There are two equally likely outcomes, heads and tails, so P(heads) = 1/2.",
    "hint": "Count the favourable outcomes over all possible outcomes."
   },
   {
    "id": "math-L1-q13",
    "q": "What is the value of 5! (five factorial)?",
    "options": [
     "720",
     "120",
     "60",
     "25"
    ],
    "answer": 1,
    "why": "5! = 5 × 4 × 3 × 2 × 1 = 120.",
    "hint": "Start at 5 and multiply by every whole number below it."
   }
  ],
  "truths": [
   {
    "id": "math-L1-t1",
    "s": "The sum of the angles in any triangle is 180 degrees.",
    "answer": true,
    "why": "This is a standard fact of Euclidean geometry."
   },
   {
    "id": "math-L1-t2",
    "s": "The number 1 is a prime number.",
    "answer": false,
    "why": "A prime has exactly two factors, but 1 has only one factor, itself."
   },
   {
    "id": "math-L1-t3",
    "s": "In the fraction 3/8, the number 8 is called the denominator.",
    "answer": true,
    "why": "The bottom number of a fraction is the denominator."
   },
   {
    "id": "math-L1-t4",
    "s": "Multiplying any number by zero gives one.",
    "answer": false,
    "why": "Multiplying by zero gives zero, not one."
   },
   {
    "id": "math-L1-t5",
    "s": "The mean of a data set can be found by adding all the values and dividing by how many there are.",
    "answer": true,
    "why": "That is the definition of the arithmetic mean."
   },
   {
    "id": "math-L1-t6",
    "s": "A square has exactly three sides.",
    "answer": false,
    "why": "A square has four equal sides; three sides describe a triangle."
   },
   {
    "id": "math-L1-t7",
    "s": "The probability of an impossible event is 0.",
    "answer": true,
    "why": "An event that cannot happen has probability zero."
   },
   {
    "id": "math-L1-t8",
    "s": "In the expression 2x + 3, the letter x is called a constant.",
    "answer": false,
    "why": "x is a variable; 2 and 3 are the constants."
   },
   {
    "id": "math-L1-t9",
    "s": "The perimeter of a shape is the total distance around its edge.",
    "answer": true,
    "why": "Perimeter measures the boundary length of a shape."
   },
   {
    "id": "math-L1-t10",
    "s": "The value of 4² is 8.",
    "answer": false,
    "why": "4² means 4 × 4 = 16, not 8."
   },
   {
    "id": "math-L1-t11",
    "s": "Two fractions with different denominators can still be equal, such as 1/2 and 2/4.",
    "answer": true,
    "why": "These are equivalent fractions representing the same value."
   },
   {
    "id": "math-L1-t12",
    "s": "In a right-angled triangle, the longest side is called the hypotenuse.",
    "answer": true,
    "why": "The hypotenuse is opposite the right angle and is the longest side."
   },
   {
    "id": "math-L1-t13",
    "s": "The next number after 1, 3, 5, 7 in this pattern is 9.",
    "answer": true,
    "why": "The pattern adds 2 each time, so 7 + 2 = 9."
   },
   {
    "id": "math-L1-t14",
    "s": "Subtracting a larger number from a smaller one always gives a positive answer.",
    "answer": false,
    "why": "For example 3 − 7 = −4, which is negative."
   },
   {
    "id": "math-L1-t15",
    "s": "A regular hexagon has six equal sides.",
    "answer": true,
    "why": "Regular means all sides and angles are equal, and a hexagon has six sides."
   },
   {
    "id": "math-L1-t16",
    "s": "The median of 1, 2, 3, 4, 100 is 3.",
    "answer": true,
    "why": "With five ordered values, the middle (third) value is the median, 3."
   },
   {
    "id": "math-L1-t17",
    "s": "The number 0.5 is greater than the fraction 3/4.",
    "answer": false,
    "why": "0.5 equals 1/2, which is less than 3/4 = 0.75."
   }
  ],
  "terms": [
   {
    "id": "math-L1-w1",
    "word": "FRACTION",
    "clue": "A number written as one whole number over another."
   },
   {
    "id": "math-L1-w2",
    "word": "TRIANGLE",
    "clue": "A closed shape with exactly three straight sides."
   },
   {
    "id": "math-L1-w3",
    "word": "AVERAGE",
    "clue": "Another name for the mean of a set of values."
   },
   {
    "id": "math-L1-w4",
    "word": "PRIME",
    "clue": "A whole number greater than one with only two factors."
   },
   {
    "id": "math-L1-w5",
    "word": "SQUARE",
    "clue": "A rectangle with four equal sides and right angles."
   },
   {
    "id": "math-L1-w6",
    "word": "ANGLE",
    "clue": "The amount of turn between two lines meeting at a point."
   },
   {
    "id": "math-L1-w7",
    "word": "SEQUENCE",
    "clue": "An ordered list of numbers following a rule."
   },
   {
    "id": "math-L1-w8",
    "word": "PERCENT",
    "clue": "A fraction expressed out of one hundred."
   }
  ]
 },
 "2": {
  "questions": [
   {
    "id": "math-L2-q1",
    "q": "What is the value of 9 × 6?",
    "options": [
     "63",
     "56",
     "45",
     "54"
    ],
    "answer": 3,
    "why": "9 × 6 = 54, since 9 × 6 = 9 × 5 + 9 = 45 + 9.",
    "hint": "Break 9 into 10 − 1 and subtract 6 from 60."
   },
   {
    "id": "math-L2-q2",
    "q": "Which decimal is equal to 3/8?",
    "options": [
     "0.83",
     "0.375",
     "0.38",
     "0.3"
    ],
    "answer": 1,
    "why": "3 ÷ 8 = 0.375 exactly.",
    "hint": "Divide 3 by 8, or find an equivalent fraction with denominator 1000."
   },
   {
    "id": "math-L2-q3",
    "q": "What is 20% of 45?",
    "options": [
     "9",
     "4.5",
     "90",
     "18"
    ],
    "answer": 0,
    "why": "20% is one fifth, and 45 ÷ 5 = 9.",
    "hint": "20% = 1/5, so divide by 5."
   },
   {
    "id": "math-L2-q4",
    "q": "Simplify: 4a − a + 2a",
    "options": [
     "5a",
     "7a",
     "3a",
     "6a"
    ],
    "answer": 0,
    "why": "4a − a = 3a, then 3a + 2a = 5a.",
    "hint": "Collect all the a terms together like counting objects."
   },
   {
    "id": "math-L2-q5",
    "q": "A quadrilateral has three angles of 80°, 90° and 100°. What is the fourth angle?",
    "options": [
     "100°",
     "80°",
     "90°",
     "110°"
    ],
    "answer": 2,
    "why": "Angles in a quadrilateral add to 360°, and 360 − (80 + 90 + 100) = 90.",
    "hint": "The angles of any quadrilateral sum to 360°."
   },
   {
    "id": "math-L2-q6",
    "q": "What is the median of 3, 7, 5, 9, 11?",
    "options": [
     "7",
     "6",
     "5",
     "9"
    ],
    "answer": 0,
    "why": "In order the values are 3, 5, 7, 9, 11, and the middle one is 7.",
    "hint": "Put the numbers in order first, then find the middle."
   },
   {
    "id": "math-L2-q7",
    "q": "What is the next term in the sequence 3, 6, 12, 24, ...?",
    "options": [
     "42",
     "30",
     "36",
     "48"
    ],
    "answer": 3,
    "why": "Each term is double the previous one, so 24 × 2 = 48.",
    "hint": "Compare each term with the one before it."
   },
   {
    "id": "math-L2-q8",
    "q": "What is 4² (four squared)?",
    "options": [
     "12",
     "24",
     "8",
     "16"
    ],
    "answer": 3,
    "why": "Squaring means multiplying a number by itself: 4 × 4 = 16.",
    "hint": "It is 4 multiplied by 4, not 4 × 2."
   },
   {
    "id": "math-L2-q9",
    "q": "Which of these numbers is a factor of 24?",
    "options": [
     "6",
     "5",
     "9",
     "7"
    ],
    "answer": 0,
    "why": "24 ÷ 6 = 4 exactly, so 6 is a factor of 24.",
    "hint": "Test which option divides 24 with no remainder."
   },
   {
    "id": "math-L2-q10",
    "q": "What is the area of a rectangle 7 cm long and 4 cm wide?",
    "options": [
     "28 cm²",
     "22 cm²",
     "14 cm²",
     "11 cm²"
    ],
    "answer": 0,
    "why": "Area of a rectangle = length × width = 7 × 4 = 28 cm².",
    "hint": "Multiply the two side lengths; don't add them."
   },
   {
    "id": "math-L2-q11",
    "q": "What is 2/3 + 1/6?",
    "options": [
     "5/6",
     "3/9",
     "1/2",
     "3/6"
    ],
    "answer": 0,
    "why": "2/3 = 4/6, and 4/6 + 1/6 = 5/6.",
    "hint": "Rewrite both fractions with denominator 6 first."
   },
   {
    "id": "math-L2-q12",
    "q": "A fair six-sided die is rolled once. What is the probability of rolling a number greater than 4?",
    "options": [
     "2/3",
     "1/3",
     "1/2",
     "1/6"
    ],
    "answer": 1,
    "why": "The numbers greater than 4 are 5 and 6, so 2 out of 6 gives 1/3.",
    "hint": "Count the successful faces out of the six possible faces."
   },
   {
    "id": "math-L2-q13",
    "q": "What is the value of 3! (three factorial)?",
    "options": [
     "6",
     "9",
     "12",
     "3"
    ],
    "answer": 0,
    "why": "3! = 3 × 2 × 1 = 6.",
    "hint": "Multiply all whole numbers from 3 down to 1."
   }
  ],
  "truths": [
   {
    "id": "math-L2-t1",
    "s": "The sum of the angles in any triangle is 180°.",
    "answer": true,
    "why": "This is the standard angle sum for a triangle in Euclidean geometry."
   },
   {
    "id": "math-L2-t2",
    "s": "The number 1 is a prime number.",
    "answer": false,
    "why": "A prime has exactly two factors, but 1 has only one factor, itself."
   },
   {
    "id": "math-L2-t3",
    "s": "Multiplying any number by zero gives zero.",
    "answer": true,
    "why": "Zero times any number is always zero."
   },
   {
    "id": "math-L2-t4",
    "s": "The mean of 2, 4 and 6 is 6.",
    "answer": false,
    "why": "The mean is (2 + 4 + 6) ÷ 3 = 4, not 6."
   },
   {
    "id": "math-L2-t5",
    "s": "A square is a special type of rectangle.",
    "answer": true,
    "why": "A square has four right angles and opposite sides equal, so it satisfies the definition of a rectangle."
   },
   {
    "id": "math-L2-t6",
    "s": "The probability of an impossible event is 1.",
    "answer": false,
    "why": "An impossible event has probability 0; probability 1 means certain."
   },
   {
    "id": "math-L2-t7",
    "s": "In the expression 5x, the number 5 is called the coefficient of x.",
    "answer": true,
    "why": "The number multiplying a variable is its coefficient."
   },
   {
    "id": "math-L2-t8",
    "s": "The next term in the sequence 1, 4, 9, 16, ... is 20.",
    "answer": false,
    "why": "These are square numbers, so the next term is 25, not 20."
   },
   {
    "id": "math-L2-t9",
    "s": "The diameter of a circle is twice its radius.",
    "answer": true,
    "why": "Diameter = 2 × radius by definition."
   },
   {
    "id": "math-L2-t10",
    "s": "Two negative numbers always multiply to give a negative number.",
    "answer": false,
    "why": "A negative times a negative gives a positive number."
   },
   {
    "id": "math-L2-t11",
    "s": "The mode of a data set is the value that appears most often.",
    "answer": true,
    "why": "The mode is defined as the most frequent value."
   },
   {
    "id": "math-L2-t12",
    "s": "The value of 2⁵ is 10.",
    "answer": false,
    "why": "2⁵ means 2 × 2 × 2 × 2 × 2 = 32, not 10."
   },
   {
    "id": "math-L2-t13",
    "s": "Adding the same number to both sides of an equation keeps it true.",
    "answer": true,
    "why": "This is the addition property of equality."
   },
   {
    "id": "math-L2-t14",
    "s": "The perimeter of a square with side 5 cm is 20 cm².",
    "answer": false,
    "why": "The perimeter is 20 cm; cm² is a unit of area, not length."
   },
   {
    "id": "math-L2-t15",
    "s": "A fraction with denominator 0 is undefined.",
    "answer": true,
    "why": "Division by zero is not defined in arithmetic."
   },
   {
    "id": "math-L2-t16",
    "s": "The number 0.5 is greater than 3/4.",
    "answer": false,
    "why": "3/4 = 0.75, which is greater than 0.5."
   },
   {
    "id": "math-L2-t17",
    "s": "A right angle measures 90°.",
    "answer": true,
    "why": "A right angle is defined as 90 degrees."
   },
   {
    "id": "math-L2-t18",
    "s": "The range of a data set is found by adding the largest and smallest values.",
    "answer": false,
    "why": "The range is the largest value minus the smallest value."
   }
  ],
  "terms": [
   {
    "id": "math-L2-w1",
    "word": "FRACTION",
    "clue": "A number written as one whole number over another."
   },
   {
    "id": "math-L2-w2",
    "word": "VARIABLE",
    "clue": "A letter standing for an unknown or changing number."
   },
   {
    "id": "math-L2-w3",
    "word": "TRIANGLE",
    "clue": "A polygon with exactly three sides and three angles."
   },
   {
    "id": "math-L2-w4",
    "word": "AVERAGE",
    "clue": "Another name for the mean of a set of values."
   },
   {
    "id": "math-L2-w5",
    "word": "SEQUENCE",
    "clue": "An ordered list of numbers following a rule."
   },
   {
    "id": "math-L2-w6",
    "word": "PRIME",
    "clue": "A whole number greater than one with only two factors."
   },
   {
    "id": "math-L2-w7",
    "word": "DIAMETER",
    "clue": "A straight line across a circle through its centre."
   },
   {
    "id": "math-L2-w8",
    "word": "EQUATION",
    "clue": "A statement that two mathematical expressions are equal."
   }
  ]
 },
 "3": {
  "questions": [
   {
    "id": "math-L3-q1",
    "q": "What is the value of 12 ÷ 4 + 3 × 2?",
    "options": [
     "9",
     "10",
     "6",
     "12"
    ],
    "answer": 0,
    "why": "Division and multiplication come before addition: 12 ÷ 4 = 3 and 3 × 2 = 6, so 3 + 6 = 9.",
    "hint": "Work left to right but do × and ÷ before + and −."
   },
   {
    "id": "math-L3-q2",
    "q": "Which fraction is equivalent to 0.6?",
    "options": [
     "3/5",
     "6/100",
     "1/6",
     "2/3"
    ],
    "answer": 0,
    "why": "0.6 means 6 tenths, and 6/10 simplifies to 3/5.",
    "hint": "Write the decimal over 10 first, then simplify."
   },
   {
    "id": "math-L3-q3",
    "q": "What is 35% of 80?",
    "options": [
     "35",
     "32",
     "24",
     "28"
    ],
    "answer": 3,
    "why": "10% of 80 is 8, so 30% is 24 and 5% is 4; together 28.",
    "hint": "Split 35% into 30% and 5%."
   },
   {
    "id": "math-L3-q4",
    "q": "Simplify: 5y − 2y + 4",
    "options": [
     "9y",
     "3y − 4",
     "7y + 4",
     "3y + 4"
    ],
    "answer": 3,
    "why": "5y − 2y = 3y, and the constant 4 stays separate, giving 3y + 4.",
    "hint": "Only combine terms with the same letter."
   },
   {
    "id": "math-L3-q5",
    "q": "A triangle has angles 45° and 65°. What is the third angle?",
    "options": [
     "70°",
     "80°",
     "60°",
     "90°"
    ],
    "answer": 0,
    "why": "Angles in a triangle sum to 180°, and 180 − 45 − 65 = 70.",
    "hint": "What do the three angles of a triangle add up to?"
   },
   {
    "id": "math-L3-q6",
    "q": "What is the mean of 6, 9, 12 and 13?",
    "options": [
     "9",
     "10",
     "12",
     "11"
    ],
    "answer": 1,
    "why": "The sum is 40, and 40 ÷ 4 = 10.",
    "hint": "Add them all, then divide by how many there are."
   },
   {
    "id": "math-L3-q7",
    "q": "What is the next term in the sequence 1, 4, 9, 16, ...?",
    "options": [
     "24",
     "20",
     "36",
     "25"
    ],
    "answer": 3,
    "why": "These are the square numbers 1², 2², 3², 4², so the next is 5² = 25.",
    "hint": "Compare each term with its position in the list."
   },
   {
    "id": "math-L3-q8",
    "q": "What is the value of 2⁵ (two to the power five)?",
    "options": [
     "32",
     "10",
     "25",
     "64"
    ],
    "answer": 0,
    "why": "2⁵ means 2 × 2 × 2 × 2 × 2 = 32.",
    "hint": "It is not 2 × 5; multiply five twos together."
   },
   {
    "id": "math-L3-q9",
    "q": "Which of these numbers is a multiple of 6?",
    "options": [
     "15",
     "42",
     "34",
     "26"
    ],
    "answer": 1,
    "why": "42 = 6 × 7, so it is a multiple of 6; the others leave a remainder.",
    "hint": "A multiple of 6 must be even and divisible by 3."
   },
   {
    "id": "math-L3-q10",
    "q": "What is the area of a triangle with base 10 cm and height 6 cm?",
    "options": [
     "30 cm²",
     "60 cm²",
     "16 cm²",
     "36 cm²"
    ],
    "answer": 0,
    "why": "Area of a triangle is ½ × base × height = ½ × 10 × 6 = 30 cm².",
    "hint": "A triangle is half of a rectangle with the same base and height."
   },
   {
    "id": "math-L3-q11",
    "q": "What is 3/4 − 1/2?",
    "options": [
     "2/4",
     "1/4",
     "2/2",
     "1/2"
    ],
    "answer": 1,
    "why": "1/2 = 2/4, so 3/4 − 2/4 = 1/4.",
    "hint": "Rewrite both fractions with the same denominator."
   },
   {
    "id": "math-L3-q12",
    "q": "A fair six-sided die is rolled once. What is the probability of rolling a 5?",
    "options": [
     "1/6",
     "5/6",
     "1/5",
     "5/36"
    ],
    "answer": 0,
    "why": "There is one face showing 5 out of six equally likely faces, so the probability is 1/6.",
    "hint": "Count the favourable outcomes and divide by all outcomes."
   },
   {
    "id": "math-L3-q13",
    "q": "If x + 7 = 15, what is the value of x?",
    "options": [
     "7",
     "8",
     "22",
     "15"
    ],
    "answer": 1,
    "why": "Subtract 7 from both sides: x = 15 − 7 = 8.",
    "hint": "Undo the addition to isolate x."
   },
   {
    "id": "math-L3-q14",
    "q": "What is the value of 13²?",
    "options": [
     "196",
     "169",
     "139",
     "156"
    ],
    "answer": 1,
    "why": "13 × 13 = 169.",
    "hint": "Multiply 13 by itself, not by 2."
   },
   {
    "id": "math-L3-q15",
    "q": "Which decimal is equal to 5/8?",
    "options": [
     "0.8",
     "0.85",
     "0.625",
     "0.58"
    ],
    "answer": 2,
    "why": "Dividing 5 by 8 gives 0.625 exactly.",
    "hint": "Divide the numerator by the denominator."
   },
   {
    "id": "math-L3-q16",
    "q": "Which number is the highest common factor (HCF) of 12 and 18?",
    "options": [
     "6",
     "3",
     "36",
     "2"
    ],
    "answer": 0,
    "why": "The factors of 12 and 18 include 1, 2, 3 and 6; the largest shared one is 6.",
    "hint": "List the factors each number has and look for the biggest shared one."
   }
  ],
  "truths": [
   {
    "id": "math-L3-t1",
    "s": "The sum of the angles in any triangle is 180°.",
    "answer": true,
    "why": "This is a standard angle fact for all triangles."
   },
   {
    "id": "math-L3-t2",
    "s": "The number 1 is a prime number.",
    "answer": false,
    "why": "A prime has exactly two factors, but 1 has only one factor, itself."
   },
   {
    "id": "math-L3-t3",
    "s": "A square is a special type of rectangle.",
    "answer": true,
    "why": "A square has four right angles and opposite sides equal, so it satisfies the definition of a rectangle."
   },
   {
    "id": "math-L3-t4",
    "s": "The median of 2, 4, 8, 10 and 12 is 8.",
    "answer": true,
    "why": "With five values in order, the middle (third) value is 8."
   },
   {
    "id": "math-L3-t5",
    "s": "Multiplying any number by 0 gives 1.",
    "answer": false,
    "why": "Any number multiplied by 0 gives 0, not 1."
   },
   {
    "id": "math-L3-t6",
    "s": "The probability of an impossible event is 0.",
    "answer": true,
    "why": "An event that cannot happen has probability 0 on the 0-to-1 scale."
   },
   {
    "id": "math-L3-t7",
    "s": "In the expression 2x, the x is called the coefficient.",
    "answer": false,
    "why": "In 2x the number 2 is the coefficient and x is the variable."
   },
   {
    "id": "math-L3-t8",
    "s": "The perimeter of a rectangle is found by adding twice its length to twice its width.",
    "answer": true,
    "why": "Perimeter = 2 × length + 2 × width, going all the way round."
   },
   {
    "id": "math-L3-t9",
    "s": "The fraction 5/8 is greater than 3/4.",
    "answer": false,
    "why": "3/4 = 6/8, which is greater than 5/8."
   },
   {
    "id": "math-L3-t10",
    "s": "Any number raised to the power 0 equals 1.",
    "answer": true,
    "why": "By the index laws, a⁰ = 1 for any non-zero number a."
   },
   {
    "id": "math-L3-t11",
    "s": "The mean of a set of numbers must be one of the numbers in the set.",
    "answer": false,
    "why": "The mean of 2 and 4 is 3, which is not in the set."
   },
   {
    "id": "math-L3-t12",
    "s": "Two triangles with the same angles are always congruent.",
    "answer": false,
    "why": "Same angles make them similar; they can be different sizes, so not necessarily congruent."
   },
   {
    "id": "math-L3-t13",
    "s": "The sequence 5, 10, 15, 20 increases by 5 each time.",
    "answer": true,
    "why": "The common difference is 5, so it is an arithmetic sequence."
   },
   {
    "id": "math-L3-t14",
    "s": "Subtracting a negative number is the same as adding its positive value.",
    "answer": true,
    "why": "For example 7 − (−3) = 7 + 3 = 10."
   },
   {
    "id": "math-L3-t15",
    "s": "The mode of a data set is the middle value when the data are ordered.",
    "answer": false,
    "why": "The mode is the most frequent value; the middle value is the median."
   },
   {
    "id": "math-L3-t16",
    "s": "The area of a circle with radius r is given by πr².",
    "answer": true,
    "why": "This is the standard formula for the area of a circle."
   },
   {
    "id": "math-L3-t17",
    "s": "If two straight lines are parallel, they meet at exactly one point.",
    "answer": false,
    "why": "Parallel lines never meet, however far they are extended."
   },
   {
    "id": "math-L3-t18",
    "s": "A number that is divisible by 9 is also divisible by 3.",
    "answer": true,
    "why": "Since 9 is a multiple of 3, divisibility by 9 implies divisibility by 3."
   },
   {
    "id": "math-L3-t19",
    "s": "The angles of any triangle add up to 180°.",
    "answer": true,
    "why": "This is a standard angle fact for every triangle."
   },
   {
    "id": "math-L3-t20",
    "s": "The sum of the interior angles of any quadrilateral is 360°.",
    "answer": true,
    "why": "Splitting a quadrilateral into two triangles gives 2 × 180° = 360°."
   },
   {
    "id": "math-L3-t21",
    "s": "The sum of the interior angles of any triangle is 180°.",
    "answer": true,
    "why": "This is a standard result of Euclidean geometry."
   },
   {
    "id": "math-L3-t22",
    "s": "In a right-angled triangle, the longest side is called the hypotenuse.",
    "answer": true,
    "why": "The hypotenuse lies opposite the right angle and is the longest side."
   }
  ],
  "terms": [
   {
    "id": "math-L3-w1",
    "word": "PERIMETER",
    "clue": "The total distance all the way around the edge of a shape."
   },
   {
    "id": "math-L3-w2",
    "word": "EQUATION",
    "clue": "A mathematical statement with an equals sign linking two expressions."
   },
   {
    "id": "math-L3-w3",
    "word": "SEQUENCE",
    "clue": "An ordered list of numbers following a rule, such as 2, 5, 8."
   },
   {
    "id": "math-L3-w4",
    "word": "FACTOR",
    "clue": "A whole number that divides another exactly, leaving no remainder."
   },
   {
    "id": "math-L3-w5",
    "word": "NUMERATOR",
    "clue": "The top number of a fraction, showing parts taken."
   },
   {
    "id": "math-L3-w6",
    "word": "MEDIAN",
    "clue": "Middle value when a data set is arranged in order."
   }
  ]
 },
 "4": {
  "questions": [
   {
    "id": "math-L4-q1",
    "q": "What is the value of 18 ÷ 3 + 2 × 5?",
    "options": [
     "20",
     "12",
     "16",
     "10"
    ],
    "answer": 2,
    "why": "Following order of operations, do division and multiplication before addition: 18 ÷ 3 = 6 and 2 × 5 = 10, so 6 + 10 = 16.",
    "hint": "Remember BODMAS: division and multiplication come before addition."
   },
   {
    "id": "math-L4-q2",
    "q": "Which fraction is equivalent to 0.75?",
    "options": [
     "3/4",
     "7/5",
     "5/8",
     "2/3"
    ],
    "answer": 0,
    "why": "0.75 means 75 hundredths, which simplifies to 3/4.",
    "hint": "Convert the decimal to a fraction with denominator 100, then simplify."
   },
   {
    "id": "math-L4-q3",
    "q": "What is 40% of 150?",
    "options": [
     "60",
     "45",
     "50",
     "70"
    ],
    "answer": 0,
    "why": "40% of 150 is (40/100) × 150 = 0.4 × 150 = 60.",
    "hint": "Change the percentage to a decimal and multiply."
   },
   {
    "id": "math-L4-q4",
    "q": "Simplify: 7x − 3x + 2x",
    "options": [
     "2x",
     "12x",
     "6x",
     "4x"
    ],
    "answer": 2,
    "why": "Combine like terms: 7x − 3x = 4x, then 4x + 2x = 6x.",
    "hint": "Add and subtract the coefficients of x."
   },
   {
    "id": "math-L4-q5",
    "q": "A triangle has angles 40° and 75°. What is the third angle?",
    "options": [
     "85°",
     "75°",
     "55°",
     "65°"
    ],
    "answer": 3,
    "why": "The angles in a triangle sum to 180°, so the third angle is 180° − 40° − 75° = 65°.",
    "hint": "Subtract the two given angles from 180°."
   },
   {
    "id": "math-L4-q6",
    "q": "What is the mean of 5, 9, 12 and 14?",
    "options": [
     "9",
     "10",
     "11",
     "12"
    ],
    "answer": 1,
    "why": "The sum is 5 + 9 + 12 + 14 = 40, and 40 ÷ 4 = 10.",
    "hint": "Add all the numbers and divide by how many there are."
   },
   {
    "id": "math-L4-q7",
    "q": "What is the next term in the sequence 1, 3, 6, 10, ...?",
    "options": [
     "15",
     "20",
     "12",
     "16"
    ],
    "answer": 0,
    "why": "The differences are 2, 3, 4, so the next difference is 5, giving 10 + 5 = 15.",
    "hint": "Look at how much each term increases by."
   },
   {
    "id": "math-L4-q8",
    "q": "What is the value of 4³ (four cubed)?",
    "options": [
     "81",
     "64",
     "12",
     "16"
    ],
    "answer": 1,
    "why": "4³ means 4 × 4 × 4 = 64.",
    "hint": "Multiply 4 by itself three times."
   },
   {
    "id": "math-L4-q9",
    "q": "Which of these numbers is a factor of 36?",
    "options": [
     "7",
     "9",
     "8",
     "5"
    ],
    "answer": 1,
    "why": "36 ÷ 9 = 4 exactly, so 9 is a factor of 36.",
    "hint": "Check which number divides 36 without a remainder."
   },
   {
    "id": "math-L4-q10",
    "q": "What is the perimeter of a rectangle 8 cm long and 5 cm wide?",
    "options": [
     "40 cm",
     "18 cm",
     "26 cm",
     "13 cm"
    ],
    "answer": 2,
    "why": "Perimeter = 2 × (length + width) = 2 × (8 + 5) = 26 cm.",
    "hint": "Add the length and width, then double."
   },
   {
    "id": "math-L4-q11",
    "q": "What is 3/5 + 1/10?",
    "options": [
     "2/5",
     "4/15",
     "7/10",
     "1/2"
    ],
    "answer": 2,
    "why": "Convert 3/5 to 6/10, then 6/10 + 1/10 = 7/10.",
    "hint": "Write both fractions with the same denominator."
   },
   {
    "id": "math-L4-q12",
    "q": "A fair six-sided die is rolled once. What is the probability of rolling an even number?",
    "options": [
     "2/3",
     "1/6",
     "1/3",
     "1/2"
    ],
    "answer": 3,
    "why": "The even numbers on a die are 2, 4 and 6, so 3 out of 6 outcomes gives 1/2.",
    "hint": "Count how many outcomes are even."
   },
   {
    "id": "math-L4-q13",
    "q": "If 3x − 4 = 11, what is the value of x?",
    "options": [
     "3",
     "4",
     "5",
     "7"
    ],
    "answer": 2,
    "why": "Add 4 to both sides: 3x = 15, then divide by 3 to get x = 5.",
    "hint": "Undo the subtraction first, then the multiplication."
   }
  ],
  "truths": [
   {
    "id": "math-L4-t1",
    "s": "The sum of the interior angles of any quadrilateral is 360°.",
    "answer": true,
    "why": "A quadrilateral can be split into two triangles, each summing to 180°, so the total is 360°."
   },
   {
    "id": "math-L4-t2",
    "s": "The number 1 is a prime number.",
    "answer": false,
    "why": "A prime number has exactly two distinct factors, but 1 has only one factor (itself), so 1 is not prime."
   },
   {
    "id": "math-L4-t3",
    "s": "In a right-angled triangle, the square of the hypotenuse equals the sum of the squares of the other two sides.",
    "answer": true,
    "why": "This is Pythagoras' theorem."
   },
   {
    "id": "math-L4-t4",
    "s": "The median of a data set is always equal to its mean.",
    "answer": false,
    "why": "The median and mean are usually different; for example, the mean of 1, 2 and 6 is 3 but the median is 2."
   },
   {
    "id": "math-L4-t5",
    "s": "The probability of an impossible event is 0.",
    "answer": true,
    "why": "An impossible event has no favourable outcomes, so its probability is 0."
   },
   {
    "id": "math-L4-t6",
    "s": "The sequence 2, 5, 8, 11, ... is arithmetic with common difference 3.",
    "answer": true,
    "why": "Each term increases by 3, so it is an arithmetic sequence with common difference 3."
   },
   {
    "id": "math-L4-t7",
    "s": "The graph of y = 2x + 3 is a straight line with gradient 3.",
    "answer": false,
    "why": "In y = mx + c, the gradient is m, which here is 2, not 3."
   },
   {
    "id": "math-L4-t8",
    "s": "The derivative of x² with respect to x is 2x.",
    "answer": true,
    "why": "Using the power rule, d/dx (x²) = 2x."
   },
   {
    "id": "math-L4-t9",
    "s": "The highest common factor (HCF) of 8 and 12 is 4.",
    "answer": true,
    "why": "The factors of 8 are 1, 2, 4, 8 and of 12 are 1, 2, 3, 4, 6, 12; the largest common factor is 4."
   },
   {
    "id": "math-L4-t10",
    "s": "The square root of 16 is only 4.",
    "answer": false,
    "why": "Both 4 and −4 square to 16, so the square root of 16 is ±4 (though the principal square root is 4)."
   },
   {
    "id": "math-L4-t11",
    "s": "In a frequency table, the mode is the value with the highest frequency.",
    "answer": true,
    "why": "The mode is the most frequent value, which corresponds to the highest frequency."
   },
   {
    "id": "math-L4-t12",
    "s": "The area of a circle with radius r is 2πr.",
    "answer": false,
    "why": "The area is πr²; 2πr is the circumference."
   },
   {
    "id": "math-L4-t13",
    "s": "When you multiply two negative numbers, the result is positive.",
    "answer": true,
    "why": "The product of two negative numbers is positive, e.g. (−2) × (−3) = 6."
   },
   {
    "id": "math-L4-t14",
    "s": "The line y = 3 is a horizontal line.",
    "answer": true,
    "why": "The equation y = 3 means y is always 3, which gives a horizontal line."
   },
   {
    "id": "math-L4-t15",
    "s": "The sum of the first 10 positive integers is 55.",
    "answer": true,
    "why": "Using the formula n(n+1)/2 with n=10 gives 10×11/2 = 55."
   },
   {
    "id": "math-L4-t16",
    "s": "The equation x² = 9 has only one solution, x = 3.",
    "answer": false,
    "why": "x² = 9 has two solutions, x = 3 and x = −3."
   },
   {
    "id": "math-L4-t17",
    "s": "The gradient of the line passing through (1,2) and (3,6) is 2.",
    "answer": true,
    "why": "Gradient = (6−2)/(3−1) = 4/2 = 2."
   },
   {
    "id": "math-L4-t18",
    "s": "A prime number has exactly two distinct factors: 1 and itself.",
    "answer": true,
    "why": "This is the definition of a prime number."
   }
  ],
  "terms": [
   {
    "id": "math-L4-w1",
    "word": "HYPOTENUSE",
    "clue": "Longest side of a right-angled triangle, opposite the right angle."
   },
   {
    "id": "math-L4-w2",
    "word": "PROBABILITY",
    "clue": "Measure of how likely an event is, between 0 and 1."
   },
   {
    "id": "math-L4-w3",
    "word": "DERIVATIVE",
    "clue": "Rate of change of a function, found by differentiation."
   },
   {
    "id": "math-L4-w4",
    "word": "SEQUENCE",
    "clue": "Ordered list of numbers following a pattern or rule."
   },
   {
    "id": "math-L4-w5",
    "word": "PERIMETER",
    "clue": "Total distance around the boundary of a shape."
   },
   {
    "id": "math-L4-w6",
    "word": "FACTOR",
    "clue": "Whole number that divides another exactly without remainder."
   },
   {
    "id": "math-L4-w7",
    "word": "MEDIAN",
    "clue": "Middle value of a data set when arranged in order."
   },
   {
    "id": "math-L4-w8",
    "word": "GRADIENT",
    "clue": "Steepness of a line, often called slope."
   },
   {
    "id": "math-L4-w9",
    "word": "VARIABLE",
    "clue": "Letter or symbol representing an unknown or changing quantity."
   }
  ]
 },
 "5": {
  "questions": [
   {
    "id": "math-L5-q1",
    "q": "A jacket costs 80 euros. Its price is reduced by 25%, and then a 10% sales tax is added to the reduced price. What is the final price?",
    "options": [
     "88 euros",
     "60 euros",
     "72 euros",
     "66 euros"
    ],
    "answer": 3,
    "why": "25% off 80 gives 60; adding 10% of 60 gives 66.",
    "hint": "Apply the two changes one after the other, not both to 80."
   },
   {
    "id": "math-L5-q2",
    "q": "Which of these is the largest?",
    "options": [
     "5/8",
     "2/3",
     "3/5",
     "7/12"
    ],
    "answer": 1,
    "why": "2/3 ≈ 0.667 is greater than 0.625, 0.6 and 0.583.",
    "hint": "Convert each fraction to a decimal or give them a common denominator."
   },
   {
    "id": "math-L5-q3",
    "q": "Simplify 2(3x − 4) − 3(x − 5).",
    "options": [
     "3x − 7",
     "3x + 7",
     "3x − 23",
     "9x + 7"
    ],
    "answer": 1,
    "why": "Expanding gives 6x − 8 − 3x + 15 = 3x + 7.",
    "hint": "Watch the sign when you multiply the second bracket by −3."
   },
   {
    "id": "math-L5-q4",
    "q": "The interior angles of a pentagon add up to how many degrees?",
    "options": [
     "450°",
     "720°",
     "540°",
     "360°"
    ],
    "answer": 2,
    "why": "An n-sided polygon has interior angle sum (n − 2) × 180°, so 3 × 180° = 540°.",
    "hint": "Split the pentagon into triangles from one vertex."
   },
   {
    "id": "math-L5-q5",
    "q": "A right-angled triangle has a hypotenuse of 13 cm and one leg of 5 cm. How long is the other leg?",
    "options": [
     "8 cm",
     "12 cm",
     "√194 cm",
     "18 cm"
    ],
    "answer": 1,
    "why": "By Pythagoras, the leg is √(13² − 5²) = √144 = 12 cm.",
    "hint": "Subtract the squares; do not add them."
   },
   {
    "id": "math-L5-q6",
    "q": "In a class of 30 pupils, 18 walk to school. What percentage of the class walks?",
    "options": [
     "18%",
     "40%",
     "60%",
     "65%"
    ],
    "answer": 2,
    "why": "18 out of 30 is 18/30 = 0.6, which is 60%.",
    "hint": "Write the fraction first, then multiply by 100."
   },
   {
    "id": "math-L5-q7",
    "q": "A bag has 4 red and 6 blue counters. One counter is taken at random. What is the probability that it is red?",
    "options": [
     "2/3",
     "1/4",
     "2/5",
     "4/6"
    ],
    "answer": 2,
    "why": "There are 4 red counters out of 10 in total, so 4/10 = 2/5.",
    "hint": "The denominator is the total number of counters, not the number of blue ones."
   },
   {
    "id": "math-L5-q8",
    "q": "A sequence begins 5, 9, 13, 17, ... What is the 10th term?",
    "options": [
     "45",
     "41",
     "40",
     "37"
    ],
    "answer": 1,
    "why": "The terms increase by 4 each time, so the nth term is 4n + 1 and the 10th is 41.",
    "hint": "Find the rule for the nth term, or count forward carefully."
   },
   {
    "id": "math-L5-q9",
    "q": "The mean of five numbers is 12. Four of the numbers are 8, 10, 13 and 15. What is the fifth number?",
    "options": [
     "12",
     "14",
     "16",
     "18"
    ],
    "answer": 1,
    "why": "The total must be 5 × 12 = 60; the four known numbers add to 46, so the fifth is 14.",
    "hint": "Work out the total of all five numbers first."
   },
   {
    "id": "math-L5-q10",
    "q": "Solve 5 − 2x = 17.",
    "options": [
     "x = −11",
     "x = 6",
     "x = −6",
     "x = 11"
    ],
    "answer": 2,
    "why": "Subtracting 5 gives −2x = 12, so x = −6.",
    "hint": "Divide by a negative number at the end; check by substituting."
   },
   {
    "id": "math-L5-q11",
    "q": "What is the gradient (slope) of the straight line through the points (2, 3) and (6, 11)?",
    "options": [
     "2",
     "1/2",
     "4",
     "8"
    ],
    "answer": 0,
    "why": "Gradient = (11 − 3)/(6 − 2) = 8/4 = 2.",
    "hint": "Divide the change in y by the change in x."
   },
   {
    "id": "math-L5-q12",
    "q": "What is the value of 2⁴ × 2³ ÷ 2⁵?",
    "options": [
     "2⁷",
     "2¹²",
     "2⁶",
     "2²"
    ],
    "answer": 3,
    "why": "Adding the indices for the product and subtracting for the division gives 2^(4+3−5) = 2².",
    "hint": "Use the index laws for multiplying and dividing powers of the same base."
   },
   {
    "id": "math-L5-q13",
    "q": "A fair coin is tossed twice. What is the probability of getting exactly one head?",
    "options": [
     "1/3",
     "1/2",
     "1/4",
     "3/4"
    ],
    "answer": 1,
    "why": "The outcomes HH, HT, TH, TT are equally likely, and exactly one head occurs in two of them, so 2/4 = 1/2.",
    "hint": "List all four equally likely outcomes."
   }
  ],
  "truths": [
   {
    "id": "math-L5-t1",
    "s": "The sum of the interior angles of any quadrilateral is 360°.",
    "answer": true,
    "why": "(4 − 2) × 180° = 360° for every quadrilateral."
   },
   {
    "id": "math-L5-t2",
    "s": "The number 1 is a prime number.",
    "answer": false,
    "why": "A prime has exactly two factors, and 1 has only one factor, itself."
   },
   {
    "id": "math-L5-t3",
    "s": "Multiplying a number by 0.5 gives the same result as dividing it by 2.",
    "answer": true,
    "why": "0.5 equals 1/2, so multiplying by 0.5 is the same as halving."
   },
   {
    "id": "math-L5-t4",
    "s": "The median of a data set is always equal to its mean.",
    "answer": false,
    "why": "Mean and median differ in general, for example for 1, 2, 10 the mean is 13/3 but the median is 2."
   },
   {
    "id": "math-L5-t5",
    "s": "In a right-angled triangle, the square of the hypotenuse equals the sum of the squares of the other two sides.",
    "answer": true,
    "why": "This is Pythagoras' theorem."
   },
   {
    "id": "math-L5-t6",
    "s": "The expression x² − 9 factorises as (x − 3)(x − 3).",
    "answer": false,
    "why": "It factorises as (x − 3)(x + 3), a difference of two squares."
   },
   {
    "id": "math-L5-t7",
    "s": "For any two positive fractions with the same denominator, the one with the larger numerator is larger.",
    "answer": true,
    "why": "With a common positive denominator, the size is decided by the numerator."
   },
   {
    "id": "math-L5-t8",
    "s": "A fair six-sided die is rolled once. The probability of rolling a 7 is 1/6.",
    "answer": false,
    "why": "A standard die has faces 1 to 6, so rolling 7 is impossible; its probability is 0."
   },
   {
    "id": "math-L5-t9",
    "s": "The graph of y = 3x + 2 is a straight line with gradient 3.",
    "answer": true,
    "why": "In y = mx + c the coefficient m = 3 is the gradient."
   },
   {
    "id": "math-L5-t10",
    "s": "The highest common factor of 24 and 36 is 6.",
    "answer": false,
    "why": "The highest common factor is 12, since 12 divides both 24 and 36."
   },
   {
    "id": "math-L5-t11",
    "s": "Adding the same number to every value in a data set leaves the mean unchanged.",
    "answer": false,
    "why": "Adding a constant shifts the mean by that same constant."
   },
   {
    "id": "math-L5-t12",
    "s": "The square root of 2 is an irrational number.",
    "answer": true,
    "why": "√2 cannot be written as a fraction of two integers."
   },
   {
    "id": "math-L5-t13",
    "s": "The probability of an event and the probability of its complement always add up to 1.",
    "answer": true,
    "why": "An event either happens or does not, so the two probabilities sum to 1."
   },
   {
    "id": "math-L5-t14",
    "s": "The sequence 2, 6, 18, 54, ... is arithmetic with common difference 3.",
    "answer": false,
    "why": "It is geometric with common ratio 3, not arithmetic."
   },
   {
    "id": "math-L5-t15",
    "s": "If two straight lines have gradients 2 and −1/2, they are perpendicular.",
    "answer": true,
    "why": "The product of the gradients is 2 × (−1/2) = −1, which means perpendicular."
   },
   {
    "id": "math-L5-t16",
    "s": "When you multiply two negative numbers, the result is negative.",
    "answer": false,
    "why": "The product of two negative numbers is positive."
   },
   {
    "id": "math-L5-t17",
    "s": "The mode of a data set is the value that occurs most often.",
    "answer": true,
    "why": "That is the definition of the mode."
   },
   {
    "id": "math-L5-t18",
    "s": "A triangle with sides 3 cm, 4 cm and 5 cm is obtuse-angled.",
    "answer": false,
    "why": "Since 3² + 4² = 5², it is right-angled, not obtuse."
   }
  ],
  "terms": [
   {
    "id": "math-L5-w1",
    "word": "HYPOTENUSE",
    "clue": "Longest side of a right-angled triangle, opposite the right angle."
   },
   {
    "id": "math-L5-w2",
    "word": "PERCENTAGE",
    "clue": "A proportion expressed as a number out of one hundred."
   },
   {
    "id": "math-L5-w3",
    "word": "GRADIENT",
    "clue": "Steepness of a straight line, rise divided by run."
   },
   {
    "id": "math-L5-w4",
    "word": "FACTORIAL",
    "clue": "Product of all whole numbers from one up to a given number."
   },
   {
    "id": "math-L5-w5",
    "word": "PROBABILITY",
    "clue": "Measure between zero and one of how likely an event is."
   },
   {
    "id": "math-L5-w6",
    "word": "SEQUENCE",
    "clue": "Ordered list of numbers following a rule."
   },
   {
    "id": "math-L5-w7",
    "word": "DENOMINATOR",
    "clue": "Bottom number of a fraction, showing how many equal parts in a whole."
   },
   {
    "id": "math-L5-w8",
    "word": "TRIANGLE",
    "clue": "Three-sided polygon whose angles sum to 180 degrees."
   },
   {
    "id": "math-L5-w9",
    "word": "MEDIAN",
    "clue": "Middle value when a data set is arranged in order."
   }
  ]
 },
 "6": {
  "questions": [
   {
    "id": "math-L6-q1",
    "q": "For a geometric sequence with first term 3 and common ratio -2, what is the sum of the first 5 terms?",
    "options": [
     "33",
     "30",
     "-33",
     "-30"
    ],
    "answer": 0,
    "why": "The sum is 3(1-(-2)^5)/(1-(-2)) = 3(1+32)/3 = 33.",
    "hint": "Use the finite geometric series formula, being careful with the sign of the ratio."
   },
   {
    "id": "math-L6-q2",
    "q": "If log₂(x) + log₂(x - 2) = 3, what is x?",
    "options": [
     "4",
     "5",
     "2",
     "8"
    ],
    "answer": 0,
    "why": "Combining logs gives log₂(x(x-2))=3, so x²-2x=8, and x=4 is the valid positive solution.",
    "hint": "Combine the logarithms, then convert from logarithmic to exponential form."
   },
   {
    "id": "math-L6-q3",
    "q": "What is the coefficient of x² in the expansion of (2x - 3)⁴?",
    "options": [
     "-96",
     "-216",
     "216",
     "96"
    ],
    "answer": 2,
    "why": "The x² term is C(4,2)(2x)²(-3)² = 6·4x²·9 = 216x².",
    "hint": "Use the binomial theorem and pick the term where x has power 2."
   },
   {
    "id": "math-L6-q4",
    "q": "The polynomial p(x) = x³ - 2x² - 5x + 6 has a factor (x - 1). What are the other two linear factors?",
    "options": [
     "(x - 3)(x + 2)",
     "(x + 3)(x - 2)",
     "(x + 6)(x - 1)",
     "(x - 6)(x + 1)"
    ],
    "answer": 0,
    "why": "Dividing by (x-1) gives x²-x-6, which factorises as (x-3)(x+2).",
    "hint": "Do polynomial division first, then factorise the quadratic quotient."
   },
   {
    "id": "math-L6-q5",
    "q": "The line 3x + 4y = 12 is reflected in the y-axis. What is the equation of the image line?",
    "options": [
     "-3x - 4y = 12",
     "3x - 4y = 12",
     "-3x + 4y = 12",
     "3x + 4y = -12"
    ],
    "answer": 2,
    "why": "Reflecting in the y-axis replaces x by -x, giving -3x + 4y = 12.",
    "hint": "A reflection in the y-axis sends every x to -x."
   },
   {
    "id": "math-L6-q6",
    "q": "What is the value of sin(150°) + cos(240°)?",
    "options": [
     "-1",
     "1/2",
     "0",
     "1"
    ],
    "answer": 2,
    "why": "sin 150° = 1/2 and cos 240° = -1/2, so their sum is 0.",
    "hint": "Use the symmetry of the unit circle in the second and third quadrants."
   },
   {
    "id": "math-L6-q7",
    "q": "A curve has derivative f'(x) = 3x² - 6x. At which value of x does f have a local minimum?",
    "options": [
     "0",
     "2",
     "1",
     "-2"
    ],
    "answer": 1,
    "why": "f'(x)=3x(x-2) is zero at 0 and 2; f''(x)=6x-6 is positive at x=2, giving a minimum.",
    "hint": "Find the stationary points, then test the second derivative."
   },
   {
    "id": "math-L6-q8",
    "q": "What is the sum of the infinite geometric series 1 + 1/3 + 1/9 + 1/27 + ...?",
    "options": [
     "3",
     "9/4",
     "2/3",
     "3/2"
    ],
    "answer": 3,
    "why": "The first term is 1 and the ratio is 1/3, so the sum is 1/(1-1/3) = 3/2.",
    "hint": "An infinite geometric series converges when |r| < 1; use a/(1-r)."
   },
   {
    "id": "math-L6-q9",
    "q": "A fair coin is tossed 4 times. What is the probability of getting exactly 2 heads?",
    "options": [
     "1/4",
     "5/16",
     "1/2",
     "3/8"
    ],
    "answer": 3,
    "why": "There are C(4,2)=6 favourable outcomes out of 16, giving 6/16 = 3/8.",
    "hint": "Count the arrangements of two heads among four tosses over the total outcomes."
   },
   {
    "id": "math-L6-q10",
    "q": "The matrix M = [[2,1],[1,2]] has eigenvalues 1 and 3. What is the determinant of M?",
    "options": [
     "3",
     "2",
     "1",
     "4"
    ],
    "answer": 0,
    "why": "The determinant equals the product of the eigenvalues, 1 × 3 = 3; also det M = 4 - 1 = 3.",
    "hint": "The determinant is the product of the eigenvalues."
   },
   {
    "id": "math-L6-q11",
    "q": "What is the remainder when 3²⁰² is divided by 5?",
    "options": [
     "4",
     "2",
     "3",
     "1"
    ],
    "answer": 0,
    "why": "Powers of 3 cycle modulo 5 as 3, 4, 2, 1; since 202 ≡ 2 (mod 4), the remainder is 4.",
    "hint": "Find the cycle of powers of 3 modulo 5 and reduce the exponent modulo the cycle length."
   },
   {
    "id": "math-L6-q12",
    "q": "In how many ways can the letters of the word LEVEL be arranged?",
    "options": [
     "120",
     "60",
     "30",
     "20"
    ],
    "answer": 2,
    "why": "There are 5 letters with L repeated twice and E repeated twice, so 5!/(2!2!) = 30.",
    "hint": "Divide the total permutations by the factorials of the repeated-letter counts."
   },
   {
    "id": "math-L6-q13",
    "q": "Which statement is equivalent to the negation of 'for all real x, x² ≥ 0'?",
    "options": [
     "For all real x, x² < 0",
     "There exists a real x with x² ≥ 0",
     "For all real x, x² ≤ 0",
     "There exists a real x with x² < 0"
    ],
    "answer": 3,
    "why": "Negating a universal statement gives an existential statement with the inequality reversed.",
    "hint": "Swap the quantifier and negate the predicate."
   }
  ],
  "truths": [
   {
    "id": "math-L6-t1",
    "s": "The sum of the first n positive odd numbers is n².",
    "answer": true,
    "why": "1+3+...+(2n-1) = n², a standard result provable by induction."
   },
   {
    "id": "math-L6-t2",
    "s": "Every continuous function on the closed interval [0,1] attains both a maximum and a minimum there.",
    "answer": true,
    "why": "The extreme value theorem guarantees this for continuous functions on closed bounded intervals."
   },
   {
    "id": "math-L6-t3",
    "s": "If a square matrix has determinant zero, then its columns are linearly independent.",
    "answer": false,
    "why": "Determinant zero means the columns are linearly dependent, not independent."
   },
   {
    "id": "math-L6-t4",
    "s": "The derivative of sin(x) with respect to x is cos(x).",
    "answer": true,
    "why": "This is a standard calculus result."
   },
   {
    "id": "math-L6-t5",
    "s": "For any two events A and B, P(A ∪ B) = P(A) + P(B) always holds.",
    "answer": false,
    "why": "The addition rule needs P(A ∩ B) subtracted unless the events are mutually exclusive."
   },
   {
    "id": "math-L6-t6",
    "s": "The number 91 is prime.",
    "answer": false,
    "why": "91 = 7 × 13, so it is composite."
   },
   {
    "id": "math-L6-t7",
    "s": "The graph of y = 2x + 3 has gradient 2 and y-intercept 3.",
    "answer": true,
    "why": "In y = mx + c, m is the gradient and c the y-intercept."
   },
   {
    "id": "math-L6-t8",
    "s": "The interior angles of a regular hexagon each measure 120°.",
    "answer": true,
    "why": "Each interior angle is (6-2)×180°/6 = 120°."
   },
   {
    "id": "math-L6-t9",
    "s": "A geometric series with common ratio 2 converges to a finite sum.",
    "answer": false,
    "why": "It diverges because the common ratio has magnitude greater than 1."
   },
   {
    "id": "math-L6-t10",
    "s": "The mean of a data set is always one of the data values.",
    "answer": false,
    "why": "The mean need not appear in the data, e.g. the mean of 1 and 4 is 2.5."
   },
   {
    "id": "math-L6-t11",
    "s": "The product of two odd integers is always odd.",
    "answer": true,
    "why": "(2m+1)(2n+1) = 2(2mn+m+n)+1, which is odd."
   },
   {
    "id": "math-L6-t12",
    "s": "For any real numbers a and b, (a + b)² = a² + b².",
    "answer": false,
    "why": "The correct expansion includes the cross term: a² + 2ab + b²."
   },
   {
    "id": "math-L6-t13",
    "s": "The function f(x) = x³ is strictly increasing on the whole real line.",
    "answer": true,
    "why": "Its derivative 3x² is non-negative and only zero at a single point, so f is strictly increasing."
   },
   {
    "id": "math-L6-t14",
    "s": "The binomial coefficient C(n, r) equals C(n, n - r).",
    "answer": true,
    "why": "Choosing r items is the same as choosing which n - r to leave out."
   },
   {
    "id": "math-L6-t15",
    "s": "The integral of 1/x with respect to x is ln|x| + C for x ≠ 0.",
    "answer": true,
    "why": "This is the standard antiderivative, valid on intervals avoiding zero."
   },
   {
    "id": "math-L6-t16",
    "s": "The square root of 2 is a rational number.",
    "answer": false,
    "why": "√2 is irrational; it cannot be written as a ratio of integers."
   },
   {
    "id": "math-L6-t17",
    "s": "If two events are independent, then P(A ∩ B) = P(A)P(B).",
    "answer": true,
    "why": "This is the defining multiplication rule for independent events."
   },
   {
    "id": "math-L6-t18",
    "s": "The vertex of the parabola y = x² - 4x + 1 is at the point (2, -3).",
    "answer": true,
    "why": "Completing the square gives (x-2)² - 3, so the vertex is (2, -3)."
   }
  ],
  "terms": [
   {
    "id": "math-L6-w1",
    "word": "LOGARITHM",
    "clue": "Exponent to which a base must be raised to give a number"
   },
   {
    "id": "math-L6-w2",
    "word": "DERIVATIVE",
    "clue": "Instantaneous rate of change of a function"
   },
   {
    "id": "math-L6-w3",
    "word": "EIGENVALUE",
    "clue": "Scalar by which an eigenvector is scaled under a matrix"
   },
   {
    "id": "math-L6-w4",
    "word": "PERMUTATION",
    "clue": "Arrangement of objects in which order matters"
   },
   {
    "id": "math-L6-w5",
    "word": "HYPOTENUSE",
    "clue": "Longest side of a right-angled triangle"
   },
   {
    "id": "math-L6-w6",
    "word": "FACTORIAL",
    "clue": "Product of all positive integers up to a given number"
   },
   {
    "id": "math-L6-w7",
    "word": "BINOMIAL",
    "clue": "Polynomial with exactly two terms, often raised to powers"
   },
   {
    "id": "math-L6-w8",
    "word": "ASYMPTOTE",
    "clue": "Line that a curve approaches but never reaches"
   },
   {
    "id": "math-L6-w9",
    "word": "CONVERGENT",
    "clue": "Describes a series or sequence with a finite limit"
   }
  ]
 },
 "7": {
  "questions": [
   {
    "id": "math-L7-q1",
    "q": "What is the value of the derivative of f(x) = x³ - 3x at x = 2?",
    "options": [
     "12",
     "9",
     "6",
     "3"
    ],
    "answer": 1,
    "why": "f'(x) = 3x² - 3, so f'(2) = 12 - 3 = 9.",
    "hint": "Differentiate first, then substitute."
   },
   {
    "id": "math-L7-q2",
    "q": "The sum of the first n terms of an arithmetic sequence is n² + 2n. What is the 10th term?",
    "options": [
     "17",
     "21",
     "23",
     "19"
    ],
    "answer": 1,
    "why": "S(10) - S(9) = 120 - 99 = 21.",
    "hint": "Subtract consecutive partial sums."
   },
   {
    "id": "math-L7-q3",
    "q": "What is the value of the integral of 2x from x = 0 to x = 3?",
    "options": [
     "18",
     "9",
     "3",
     "6"
    ],
    "answer": 1,
    "why": "∫₀³ 2x dx = [x²]₀³ = 9.",
    "hint": "The antiderivative of 2x is x²."
   },
   {
    "id": "math-L7-q4",
    "q": "What is the remainder when 2¹⁰⁰ is divided by 7?",
    "options": [
     "2",
     "4",
     "6",
     "1"
    ],
    "answer": 0,
    "why": "2³ ≡ 1 mod 7, and 100 ≡ 1 mod 3, so 2¹⁰⁰ ≡ 2 mod 7.",
    "hint": "Look for the cycle of powers of 2 modulo 7."
   },
   {
    "id": "math-L7-q5",
    "q": "The matrix A = [[1,2],[3,4]] has determinant -2. What is the determinant of A²?",
    "options": [
     "-2",
     "2",
     "-4",
     "4"
    ],
    "answer": 3,
    "why": "det(A²) = (det A)² = (-2)² = 4.",
    "hint": "The determinant is multiplicative."
   },
   {
    "id": "math-L7-q6",
    "q": "What is the value of cos(60°) + sin(30°)?",
    "options": [
     "1/2",
     "0",
     "√3",
     "1"
    ],
    "answer": 3,
    "why": "cos 60° = 1/2 and sin 30° = 1/2, so the sum is 1.",
    "hint": "Both angles give the same standard value."
   },
   {
    "id": "math-L7-q7",
    "q": "The line y = 2x + 1 is rotated 90° anticlockwise about the origin. What is the gradient of the image line?",
    "options": [
     "1/2",
     "2",
     "-1/2",
     "-2"
    ],
    "answer": 2,
    "why": "A 90° rotation maps gradient m to -1/m, giving -1/2.",
    "hint": "Perpendicular gradients multiply to -1."
   },
   {
    "id": "math-L7-q8",
    "q": "What is the coefficient of x² in the expansion of (x + 2)⁵?",
    "options": [
     "160",
     "10",
     "40",
     "80"
    ],
    "answer": 3,
    "why": "The term is C(5,2)x²(2)³ = 10·8x² = 80x².",
    "hint": "Use the binomial theorem with the 2³ factor."
   },
   {
    "id": "math-L7-q9",
    "q": "If z = 3 + 4i, what is the modulus of z?",
    "options": [
     "25",
     "7",
     "5",
     "√7"
    ],
    "answer": 2,
    "why": "|z| = √(3² + 4²) = √25 = 5.",
    "hint": "Pythagoras on the real and imaginary parts."
   },
   {
    "id": "math-L7-q10",
    "q": "What is the sum of the roots of the equation 2x² - 8x + 6 = 0?",
    "options": [
     "-3",
     "3",
     "-4",
     "4"
    ],
    "answer": 3,
    "why": "Sum of roots = -b/a = 8/2 = 4.",
    "hint": "Use the coefficient ratio -b/a."
   },
   {
    "id": "math-L7-q11",
    "q": "A geometric series has first term 4 and common ratio 1/2. What is the sum to infinity?",
    "options": [
     "6",
     "16",
     "4",
     "8"
    ],
    "answer": 3,
    "why": "S∞ = a/(1 - r) = 4/(1/2) = 8.",
    "hint": "Divide the first term by 1 minus the ratio."
   },
   {
    "id": "math-L7-q12",
    "q": "What is the value of log₃(81)?",
    "options": [
     "4",
     "3",
     "27",
     "9"
    ],
    "answer": 0,
    "why": "3⁴ = 81, so log₃(81) = 4.",
    "hint": "Ask which power of 3 gives 81."
   }
  ],
  "truths": [
   {
    "id": "math-L7-t1",
    "s": "The derivative of sin x is cos x.",
    "answer": true,
    "why": "This is a standard calculus result."
   },
   {
    "id": "math-L7-t2",
    "s": "Every square matrix has an inverse.",
    "answer": false,
    "why": "Only square matrices with non-zero determinant are invertible."
   },
   {
    "id": "math-L7-t3",
    "s": "The sum of the interior angles of a hexagon is 720°.",
    "answer": true,
    "why": "(6 - 2) × 180° = 720°."
   },
   {
    "id": "math-L7-t4",
    "s": "If a sequence converges, then it must be bounded.",
    "answer": true,
    "why": "Convergent sequences are always bounded."
   },
   {
    "id": "math-L7-t5",
    "s": "The product of two irrational numbers is always irrational.",
    "answer": false,
    "why": "√2 × √2 = 2, which is rational."
   },
   {
    "id": "math-L7-t6",
    "s": "For any events A and B, P(A ∪ B) = P(A) + P(B) - P(A ∩ B).",
    "answer": true,
    "why": "This is the addition rule for probability."
   },
   {
    "id": "math-L7-t7",
    "s": "The function f(x) = x³ is strictly decreasing on the real line.",
    "answer": false,
    "why": "x³ is strictly increasing, since its derivative 3x² is non-negative."
   },
   {
    "id": "math-L7-t8",
    "s": "The number 1 is a prime number.",
    "answer": false,
    "why": "A prime has exactly two distinct positive divisors; 1 has only one."
   },
   {
    "id": "math-L7-t9",
    "s": "The determinant of a 2×2 matrix [[a,b],[c,d]] is ad - bc.",
    "answer": true,
    "why": "This is the standard formula for a 2×2 determinant."
   },
   {
    "id": "math-L7-t10",
    "s": "If f'(c) = 0, then f has a local extremum at x = c.",
    "answer": false,
    "why": "A stationary point can be a point of inflection, e.g. f(x) = x³ at 0."
   },
   {
    "id": "math-L7-t11",
    "s": "The graph of y = eˣ is always above the x-axis.",
    "answer": true,
    "why": "eˣ is positive for all real x."
   },
   {
    "id": "math-L7-t12",
    "s": "The harmonic series 1 + 1/2 + 1/3 + ... converges.",
    "answer": false,
    "why": "The harmonic series diverges."
   },
   {
    "id": "math-L7-t13",
    "s": "For any integer n, n² + n is always even.",
    "answer": true,
    "why": "n² + n = n(n+1), a product of consecutive integers, one of which is even."
   },
   {
    "id": "math-L7-t14",
    "s": "The inverse of a 2×2 rotation matrix is always a reflection matrix.",
    "answer": false,
    "why": "The inverse of a rotation is a rotation through the opposite angle."
   },
   {
    "id": "math-L7-t15",
    "s": "The variance of a data set is always non-negative.",
    "answer": true,
    "why": "Variance is the mean of squared deviations, hence non-negative."
   },
   {
    "id": "math-L7-t16",
    "s": "If A and B are independent events, then P(A ∩ B) = P(A)P(B).",
    "answer": true,
    "why": "This is the definition of independence for two events."
   },
   {
    "id": "math-L7-t17",
    "s": "The equation x² + 1 = 0 has two real roots.",
    "answer": false,
    "why": "It has no real roots; the roots are ±i."
   },
   {
    "id": "math-L7-t18",
    "s": "The mean of a data set is always one of the data values.",
    "answer": false,
    "why": "The mean need not be a member of the data set, e.g. mean of 1 and 4 is 2.5."
   }
  ],
  "terms": [
   {
    "id": "math-L7-w1",
    "word": "DETERMINANT",
    "clue": "Scalar value computed from a square matrix that tests invertibility."
   },
   {
    "id": "math-L7-w2",
    "word": "DERIVATIVE",
    "clue": "Instantaneous rate of change of a function at a point."
   },
   {
    "id": "math-L7-w3",
    "word": "ASYMPTOTE",
    "clue": "Line that a curve approaches but never reaches."
   },
   {
    "id": "math-L7-w4",
    "word": "BINOMIAL",
    "clue": "Type of distribution counting successes in fixed independent trials."
   },
   {
    "id": "math-L7-w5",
    "word": "EIGENVALUE",
    "clue": "Scalar for which a matrix maps a vector to a multiple of itself."
   },
   {
    "id": "math-L7-w6",
    "word": "PERMUTATION",
    "clue": "Ordered arrangement of a set of objects."
   },
   {
    "id": "math-L7-w7",
    "word": "LOGARITHM",
    "clue": "Exponent to which a base must be raised to give a number."
   },
   {
    "id": "math-L7-w8",
    "word": "CONVERGENT",
    "clue": "Describing a sequence or series with a finite limit or sum."
   },
   {
    "id": "math-L7-w9",
    "word": "HYPOTENUSE",
    "clue": "Longest side of a right-angled triangle, opposite the right angle."
   }
  ]
 },
 "8": {
  "questions": [
   {
    "id": "math-L8-q1",
    "q": "What is the remainder when 5²⁰² is divided by 7?",
    "options": [
     "2",
     "1",
     "4",
     "6",
     "3"
    ],
    "answer": 0,
    "why": "5 ≡ −2 mod 7; by Fermat 5⁶ ≡ 1, and 202 ≡ 4 mod 6, so 5²⁰² ≡ 5⁴ ≡ 625 ≡ 2.",
    "hint": "Reduce the exponent modulo the order of 5 modulo 7."
   },
   {
    "id": "math-L8-q2",
    "q": "What is the derivative of f(x) = x² sin x at x = 0?",
    "options": [
     "π",
     "−1",
     "0",
     "1",
     "2"
    ],
    "answer": 2,
    "why": "f'(x) = 2x sin x + x² cos x, which is 0 at x = 0.",
    "hint": "Apply the product rule, then substitute x = 0."
   },
   {
    "id": "math-L8-q3",
    "q": "What is the value of the integral of 3x² from x = 1 to x = 2?",
    "options": [
     "7",
     "5",
     "8",
     "9",
     "6"
    ],
    "answer": 0,
    "why": "The antiderivative is x³, so 2³ − 1³ = 7.",
    "hint": "Integrate then evaluate at the limits."
   },
   {
    "id": "math-L8-q4",
    "q": "If z = 1 + i, what is z⁴?",
    "options": [
     "−4i",
     "4i",
     "4",
     "2",
     "−4"
    ],
    "answer": 4,
    "why": "(1+i)² = 2i, so (1+i)⁴ = (2i)² = −4.",
    "hint": "Square z twice, using i² = −1."
   },
   {
    "id": "math-L8-q5",
    "q": "What is the multiplicative inverse of 3 modulo 7?",
    "options": [
     "4",
     "5",
     "2",
     "3",
     "6"
    ],
    "answer": 1,
    "why": "3 × 5 = 15 ≡ 1 mod 7, so the inverse is 5.",
    "hint": "Find x with 3x ≡ 1 mod 7."
   },
   {
    "id": "math-L8-q6",
    "q": "What is the remainder when 7¹⁰⁰ is divided by 5?",
    "options": [
     "3",
     "2",
     "0",
     "1",
     "4"
    ],
    "answer": 3,
    "why": "7 ≡ 2 (mod 5), and 2⁴ ≡ 1 (mod 5), so 7¹⁰⁰ = (7⁴)²⁵ ≡ 1 (mod 5).",
    "hint": "Reduce the base modulo 5 and look for a cycle in the powers."
   },
   {
    "id": "math-L8-q7",
    "q": "The matrix B = [[3,1],[2,4]] has eigenvalues 2 and 5. What is the determinant of B?",
    "options": [
     "10",
     "7",
     "2",
     "14",
     "12"
    ],
    "answer": 0,
    "why": "The determinant equals the product of the eigenvalues, 2 × 5 = 10.",
    "hint": "The determinant is the product of the eigenvalues."
   },
   {
    "id": "math-L8-q8",
    "q": "What is the value of ∫₀² (3x² + 2x) dx?",
    "options": [
     "6",
     "14",
     "8",
     "10",
     "12"
    ],
    "answer": 4,
    "why": "Antiderivative x³ + x², evaluated from 0 to 2 gives (8 + 4) − 0 = 12.",
    "hint": "Integrate term by term and substitute the limits."
   },
   {
    "id": "math-L8-q9",
    "q": "If log₂(x) + log₂(x − 3) = 2, what is x?",
    "options": [
     "6",
     "−1",
     "5",
     "3",
     "4"
    ],
    "answer": 4,
    "why": "Combine logs: log₂(x(x−3)) = 2, so x² − 3x = 4, giving x = 4 (x = −1 rejected).",
    "hint": "Combine the logs into one, then convert from logarithmic to exponential form."
   },
   {
    "id": "math-L8-q10",
    "q": "What is the remainder when 2¹⁰⁰ is divided by 9?",
    "options": [
     "2",
     "5",
     "4",
     "1",
     "7"
    ],
    "answer": 4,
    "why": "2⁶ ≡ 1 (mod 9), so 2¹⁰⁰ = (2⁶)¹⁶ · 2⁴ ≡ 16 ≡ 7 (mod 9).",
    "hint": "Find the order of 2 modulo 9 and reduce the exponent."
   },
   {
    "id": "math-L8-q11",
    "q": "The line y = 2x + 1 is rotated 90° anticlockwise about the origin. What is the gradient of the image line?",
    "options": [
     "−2",
     "1/2",
     "2",
     "−1/2",
     "1"
    ],
    "answer": 3,
    "why": "A 90° anticlockwise rotation replaces gradient m by −1/m, so 2 becomes −1/2.",
    "hint": "Perpendicular lines have gradients whose product is −1."
   },
   {
    "id": "math-L8-q12",
    "q": "If z = 3 + 4i, what is |z|² (the square of the modulus)?",
    "options": [
     "7",
     "5",
     "49",
     "12",
     "25"
    ],
    "answer": 4,
    "why": "|z|² = 3² + 4² = 9 + 16 = 25.",
    "hint": "The modulus squared is the sum of the squares of the real and imaginary parts."
   },
   {
    "id": "math-L8-q13",
    "q": "The matrix A = [[1,2],[3,4]] has determinant −2. What is det(A²)?",
    "options": [
     "16",
     "2",
     "−4",
     "−2",
     "4"
    ],
    "answer": 4,
    "why": "det(A²) = (det A)² = (−2)² = 4.",
    "hint": "The determinant is multiplicative: det(AB) = det(A)det(B)."
   },
   {
    "id": "math-L8-q14",
    "q": "In how many distinct ways can the letters of the word LEVEL be arranged?",
    "options": [
     "60",
     "20",
     "120",
     "30",
     "24"
    ],
    "answer": 3,
    "why": "LEVEL has 5 letters with L twice and E twice, so the count is 5!/(2!·2!) = 30.",
    "hint": "Divide the total permutations by the factorials of the repeated letters."
   },
   {
    "id": "math-L8-q15",
    "q": "What is the value of the binomial coefficient C(8,3)?",
    "options": [
     "56",
     "48",
     "24",
     "336",
     "112"
    ],
    "answer": 0,
    "why": "C(8,3) = 8!/(3!5!) = 56.",
    "hint": "It counts the number of 3-element subsets of an 8-element set."
   },
   {
    "id": "math-L8-q16",
    "q": "What is the sum of the infinite geometric series 2 − 1 + 1/2 − 1/4 + ...?",
    "options": [
     "4/3",
     "3/2",
     "1",
     "2",
     "8/3"
    ],
    "answer": 0,
    "why": "First term 2, ratio −1/2, so sum = 2/(1+1/2) = 4/3.",
    "hint": "Use a/(1−r) with r negative."
   }
  ],
  "truths": [
   {
    "id": "math-L8-t1",
    "s": "Every subgroup of an abelian group is normal.",
    "answer": true,
    "why": "In an abelian group conjugation is trivial, so every subgroup is closed under conjugation."
   },
   {
    "id": "math-L8-t2",
    "s": "The set of all 2×2 real matrices with non-zero determinant forms a group under matrix multiplication.",
    "answer": true,
    "why": "It is closed under multiplication, has the identity, and every non-singular matrix has an inverse."
   },
   {
    "id": "math-L8-t3",
    "s": "A continuous real-valued function on a closed bounded interval always attains a maximum.",
    "answer": true,
    "why": "This is the extreme value theorem."
   },
   {
    "id": "math-L8-t4",
    "s": "If a square matrix has determinant zero, then its columns are linearly independent.",
    "answer": false,
    "why": "Determinant zero means the columns are linearly dependent, not independent."
   },
   {
    "id": "math-L8-t5",
    "s": "The sum of the first n odd positive integers equals n².",
    "answer": true,
    "why": "1 + 3 + … + (2n − 1) = n², provable by induction."
   },
   {
    "id": "math-L8-t6",
    "s": "Every convergent sequence of real numbers is bounded.",
    "answer": true,
    "why": "Convergence forces all terms beyond some point to lie near the limit, so the whole sequence is bounded."
   },
   {
    "id": "math-L8-t7",
    "s": "The derivative of sin x is cos x for every real x.",
    "answer": true,
    "why": "This is a standard calculus result."
   },
   {
    "id": "math-L8-t8",
    "s": "If two events A and B are independent, then P(A ∩ B) = P(A)P(B).",
    "answer": true,
    "why": "This is the defining condition for independence."
   },
   {
    "id": "math-L8-t9",
    "s": "The determinant of a 3×3 matrix changes sign when two of its rows are interchanged.",
    "answer": true,
    "why": "Row interchange multiplies the determinant by −1."
   },
   {
    "id": "math-L8-t10",
    "s": "The function f(x) = x³ is strictly decreasing on the whole real line.",
    "answer": false,
    "why": "x³ is strictly increasing everywhere, since its derivative 3x² is non-negative."
   },
   {
    "id": "math-L8-t11",
    "s": "The integral of 1/x with respect to x is ln|x| + C on any interval not containing zero.",
    "answer": true,
    "why": "Differentiating ln|x| gives 1/x on such intervals."
   },
   {
    "id": "math-L8-t12",
    "s": "A geometric series with common ratio r converges whenever |r| > 1.",
    "answer": false,
    "why": "It converges only when |r| < 1; for |r| ≥ 1 the terms do not tend to zero."
   },
   {
    "id": "math-L8-t13",
    "s": "The product of two irrational numbers is always irrational.",
    "answer": false,
    "why": "For example √2 · √2 = 2, which is rational."
   },
   {
    "id": "math-L8-t14",
    "s": "By the fundamental theorem of arithmetic, every integer greater than 1 has a unique prime factorisation up to order.",
    "answer": true,
    "why": "This is the standard unique factorisation theorem."
   },
   {
    "id": "math-L8-t15",
    "s": "The mean of a data set is always equal to one of the data values.",
    "answer": false,
    "why": "The mean need not be one of the observed values, e.g. the mean of 1 and 4 is 2.5."
   },
   {
    "id": "math-L8-t16",
    "s": "The angle sum of a convex n-sided polygon is (n − 2)·180°.",
    "answer": true,
    "why": "Triangulating from one vertex gives n − 2 triangles."
   },
   {
    "id": "math-L8-t17",
    "s": "A continuous real-valued function on a closed bounded interval must attain a maximum.",
    "answer": true,
    "why": "This is the extreme value theorem."
   },
   {
    "id": "math-L8-t18",
    "s": "The determinant of a product of two n×n matrices equals the product of their determinants.",
    "answer": true,
    "why": "This is the multiplicative property of determinants."
   },
   {
    "id": "math-L8-t19",
    "s": "Every finite integral domain is a field.",
    "answer": true,
    "why": "A finite integral domain is a field because multiplication by a nonzero element is injective and hence surjective."
   },
   {
    "id": "math-L8-t20",
    "s": "Every finite-dimensional real vector space equipped with an inner product has an orthonormal basis.",
    "answer": true,
    "why": "The Gram–Schmidt process constructs one from any basis."
   },
   {
    "id": "math-L8-t21",
    "s": "If a real square matrix has all eigenvalues equal to zero, then the matrix must be the zero matrix.",
    "answer": false,
    "why": "The matrix [[0,1],[0,0]] has only eigenvalue 0 but is not the zero matrix."
   },
   {
    "id": "math-L8-t22",
    "s": "Every continuous function on the closed interval [0, 1] is differentiable on (0, 1).",
    "answer": false,
    "why": "|x| is continuous on [0,1] but not differentiable at 0."
   }
  ],
  "terms": [
   {
    "id": "math-L8-w1",
    "word": "EIGENVALUE",
    "clue": "Scalar λ for which some non-zero vector satisfies Av = λv."
   },
   {
    "id": "math-L8-w2",
    "word": "PERMUTATION",
    "clue": "Arrangement of objects in which order matters."
   },
   {
    "id": "math-L8-w3",
    "word": "ASYMPTOTE",
    "clue": "Line that a curve approaches ever more closely but never reaches."
   },
   {
    "id": "math-L8-w4",
    "word": "CONVERGENT",
    "clue": "Describes a sequence or series with a finite limiting sum."
   },
   {
    "id": "math-L8-w5",
    "word": "DETERMINANT",
    "clue": "Scalar computed from a square matrix that tests invertibility."
   },
   {
    "id": "math-L8-w6",
    "word": "PROBABILITY",
    "clue": "Measure between zero and one of how likely an event is."
   },
   {
    "id": "math-L8-w7",
    "word": "HYPOTHESIS",
    "clue": "A proposition assumed in order to prove a conditional statement."
   }
  ]
 },
 "9": {
  "questions": [
   {
    "id": "math-L9-q1",
    "q": "Let A be a 3×3 matrix with eigenvalues 2, 3, and 5. What is the trace of A²?",
    "options": [
     "19",
     "10",
     "35",
     "38",
     "25"
    ],
    "answer": 3,
    "why": "The trace of A² equals the sum of the squares of the eigenvalues: 2²+3²+5²=4+9+25=38.",
    "hint": "Trace is the sum of eigenvalues; for powers, sum the powers of eigenvalues."
   },
   {
    "id": "math-L9-q2",
    "q": "For the probability density function f(x)=2x on [0,1] and 0 elsewhere, what is the variance of X?",
    "options": [
     "1/18",
     "1/12",
     "1/6",
     "1/9",
     "1/4"
    ],
    "answer": 0,
    "why": "E[X]=∫₀¹ x·2x dx=2/3, E[X²]=∫₀¹ x²·2x dx=1/2, so Var(X)=1/2−(2/3)²=1/18.",
    "hint": "Compute E[X] and E[X²] by integration, then use Var(X)=E[X²]−(E[X])²."
   },
   {
    "id": "math-L9-q3",
    "q": "Evaluate the integral ∫₀¹ x e^x dx.",
    "options": [
     "1/e",
     "1",
     "0",
     "e−1",
     "e"
    ],
    "answer": 1,
    "why": "Integration by parts: ∫ x e^x dx = (x−1)e^x, so from 0 to 1 gives (0)e − (−1)e⁰ = 1.",
    "hint": "Use integration by parts with u=x, dv=e^x dx."
   },
   {
    "id": "math-L9-q4",
    "q": "For the function f(x)=x³−3x²+4, what is the value of the second derivative at x=2?",
    "options": [
     "12",
     "−6",
     "0",
     "3",
     "6"
    ],
    "answer": 4,
    "why": "f'(x)=3x²−6x, f''(x)=6x−6, so f''(2)=12−6=6.",
    "hint": "Differentiate twice and substitute x=2."
   },
   {
    "id": "math-L9-q5",
    "q": "In a group of 5 people, what is the probability that at least two share the same birth month (assuming 12 equally likely months)?",
    "options": [
     "1 − (12×11×10×9×8)/12⁵",
     "(12×11×10×9×8)/12⁵",
     "5/12",
     "1 − (11/12)⁵",
     "1 − (12/11)⁵"
    ],
    "answer": 0,
    "why": "The complement is all distinct months: (12×11×10×9×8)/12⁵, so probability at least two share is 1 minus that.",
    "hint": "Use complementary counting: all distinct months."
   },
   {
    "id": "math-L9-q6",
    "q": "What is the sum of the series ∑_{n=1}^∞ n/2^n?",
    "options": [
     "1.5",
     "4",
     "3",
     "1",
     "2"
    ],
    "answer": 4,
    "why": "Using ∑ n x^n = x/(1−x)² for |x|<1, with x=1/2 gives (1/2)/(1/2)²=2.",
    "hint": "Use the formula for sum n x^n."
   },
   {
    "id": "math-L9-q7",
    "q": "The polynomial p(x)=x³−6x²+11x−6 has roots 1, 2, and 3. What is the value of p'(2)?",
    "options": [
     "1",
     "0",
     "2",
     "−1",
     "3"
    ],
    "answer": 3,
    "why": "p'(x)=3x²−12x+11, so p'(2)=12−24+11=−1.",
    "hint": "Differentiate and substitute x=2."
   },
   {
    "id": "math-L9-q8",
    "q": "Let A be a 2×2 matrix with determinant 3. What is the determinant of the adjugate of A?",
    "options": [
     "9",
     "3",
     "1/3",
     "0",
     "6"
    ],
    "answer": 1,
    "why": "For 2×2, adj(A) = det(A) A^{-1}, so det(adj(A)) = det(A)² / det(A) = det(A) = 3? Actually det(adj(A)) = det(A)^{n−1} = det(A) for n=2, so 3.",
    "hint": "Use the property det(adj(A)) = det(A)^{n−1}."
   },
   {
    "id": "math-L9-q9",
    "q": "What is the value of the limit lim_{x→0} (sin x − x)/x³?",
    "options": [
     "1/3",
     "−1/3",
     "0",
     "1/6",
     "−1/6"
    ],
    "answer": 4,
    "why": "Taylor expansion: sin x = x − x³/6 + O(x⁵), so (sin x − x)/x³ → −1/6.",
    "hint": "Use the Taylor series for sin x."
   },
   {
    "id": "math-L9-q10",
    "q": "In a vector space of dimension 4, two subspaces U and W each have dimension 3. What is the minimum possible dimension of U∩W?",
    "options": [
     "2",
     "1",
     "0",
     "3",
     "4"
    ],
    "answer": 0,
    "why": "By the dimension formula, dim(U∩W) = dim U + dim W − dim(U+W) ≥ 3+3−4 = 2.",
    "hint": "Use dim(U+W) ≤ 4."
   }
  ],
  "truths": [
   {
    "id": "math-L9-t1",
    "s": "Every finite-dimensional inner product space has an orthonormal basis.",
    "answer": true,
    "why": "The Gram–Schmidt process constructs one from any basis."
   },
   {
    "id": "math-L9-t2",
    "s": "The determinant of a matrix is unchanged if you add a multiple of one row to another.",
    "answer": true,
    "why": "This is a standard elementary row operation that preserves determinant."
   },
   {
    "id": "math-L9-t3",
    "s": "If a function is differentiable at a point, then it is continuous at that point.",
    "answer": true,
    "why": "Differentiability implies continuity."
   },
   {
    "id": "math-L9-t4",
    "s": "The sum of two irrational numbers is always irrational.",
    "answer": false,
    "why": "Counterexample: √2 + (−√2) = 0, which is rational."
   },
   {
    "id": "math-L9-t5",
    "s": "Every subgroup of a cyclic group is cyclic.",
    "answer": true,
    "why": "All subgroups of a cyclic group are generated by a power of the generator."
   },
   {
    "id": "math-L9-t6",
    "s": "The product of two symmetric matrices is always symmetric.",
    "answer": false,
    "why": "Only if they commute; otherwise the product may not be symmetric."
   },
   {
    "id": "math-L9-t7",
    "s": "If a sequence is bounded and monotonic, then it converges.",
    "answer": true,
    "why": "A bounded monotonic sequence converges by the monotone convergence theorem."
   },
   {
    "id": "math-L9-t8",
    "s": "The set of all 2×2 matrices with real entries forms a field under matrix addition and multiplication.",
    "answer": false,
    "why": "Not every nonzero matrix has a multiplicative inverse, so it is not a field."
   },
   {
    "id": "math-L9-t9",
    "s": "If a and b are integers and a divides b, then a divides bc for any integer c.",
    "answer": true,
    "why": "If b = ka, then bc = kca, so a divides bc."
   },
   {
    "id": "math-L9-t10",
    "s": "The function f(x)=|x| is differentiable at x=0.",
    "answer": false,
    "why": "The absolute value function is not differentiable at 0."
   },
   {
    "id": "math-L9-t11",
    "s": "Every real polynomial of odd degree has at least one real root.",
    "answer": true,
    "why": "By the intermediate value theorem, the limits at ±∞ have opposite signs."
   },
   {
    "id": "math-L9-t12",
    "s": "The eigenvalues of a real symmetric matrix are always real.",
    "answer": true,
    "why": "This is the spectral theorem for real symmetric matrices."
   },
   {
    "id": "math-L9-t13",
    "s": "The integral of an odd function over a symmetric interval [−a,a] is always zero.",
    "answer": true,
    "why": "The positive and negative parts cancel exactly."
   },
   {
    "id": "math-L9-t14",
    "s": "If a matrix has an eigenvalue 0, then it is invertible.",
    "answer": false,
    "why": "A zero eigenvalue means the matrix is singular, hence not invertible."
   },
   {
    "id": "math-L9-t15",
    "s": "The set of rational numbers is uncountable.",
    "answer": false,
    "why": "The rationals are countable."
   },
   {
    "id": "math-L9-t16",
    "s": "For any events A and B, P(A∪B)=P(A)+P(B)−P(A∩B).",
    "answer": true,
    "why": "This is the inclusion–exclusion principle for two events."
   },
   {
    "id": "math-L9-t17",
    "s": "The derivative of x^x is x^x(ln x + 1).",
    "answer": true,
    "why": "Using logarithmic differentiation, d/dx x^x = x^x(ln x + 1)."
   },
   {
    "id": "math-L9-t18",
    "s": "Every continuous function on a closed interval is uniformly continuous.",
    "answer": true,
    "why": "Heine–Cantor theorem: continuity on a compact set implies uniform continuity."
   }
  ],
  "terms": [
   {
    "id": "math-L9-w1",
    "word": "EIGENVALUE",
    "clue": "A scalar λ such that Av = λv for some nonzero vector v."
   },
   {
    "id": "math-L9-w2",
    "word": "DETERMINANT",
    "clue": "A scalar quantity computed from a square matrix that indicates invertibility."
   },
   {
    "id": "math-L9-w3",
    "word": "DERIVATIVE",
    "clue": "The instantaneous rate of change of a function."
   },
   {
    "id": "math-L9-w4",
    "word": "INTEGRAL",
    "clue": "A mathematical object that can be interpreted as an area or a generalisation of area."
   },
   {
    "id": "math-L9-w5",
    "word": "PROBABILITY",
    "clue": "A measure of the likelihood that an event will occur."
   },
   {
    "id": "math-L9-w6",
    "word": "SEQUENCE",
    "clue": "An ordered list of numbers defined by a rule."
   },
   {
    "id": "math-L9-w7",
    "word": "CONTINUITY",
    "clue": "A property of a function meaning that small changes in input cause small changes in output."
   },
   {
    "id": "math-L9-w8",
    "word": "ISOMORPHISM",
    "clue": "A bijective structure-preserving map between two algebraic structures."
   }
  ]
 },
 "10": {
  "questions": [
   {
    "id": "math-L10-q1",
    "q": "How many non-isomorphic groups of order 8 are there?",
    "options": [
     "7",
     "6",
     "5",
     "4",
     "3"
    ],
    "answer": 2,
    "why": "There are five groups of order 8: C8, C4×C2, C2×C2×C2, D8 and Q8.",
    "hint": "Include both abelian and non-abelian possibilities."
   },
   {
    "id": "math-L10-q2",
    "q": "Let A be a 3×3 real matrix with eigenvalues 1, 2, 3. What is the trace of A²?",
    "options": [
     "14",
     "10",
     "25",
     "6",
     "36"
    ],
    "answer": 0,
    "why": "The eigenvalues of A² are 1, 4, 9, so trace(A²)=14.",
    "hint": "Eigenvalues of A² are squares of eigenvalues of A."
   },
   {
    "id": "math-L10-q3",
    "q": "Which of the following numbers is a primitive root modulo 17?",
    "options": [
     "2",
     "8",
     "3",
     "16",
     "4"
    ],
    "answer": 2,
    "why": "3 has order 16 modulo 17, whereas 2, 4, 8 and 16 have smaller orders.",
    "hint": "Check powers of the candidate modulo 17."
   },
   {
    "id": "math-L10-q4",
    "q": "A random variable X has the standard normal distribution. What is the value of E[X⁴]?",
    "options": [
     "3",
     "2",
     "4",
     "6",
     "1"
    ],
    "answer": 0,
    "why": "For a standard normal, E[X⁴]=3 by the moment formula or integration by parts.",
    "hint": "Use the moment generating function or Gaussian integral."
   },
   {
    "id": "math-L10-q5",
    "q": "In a vector space of dimension 4, subspaces U and W each have dimension 3. What is the minimum possible dimension of U ∩ W?",
    "options": [
     "3",
     "1",
     "4",
     "2",
     "0"
    ],
    "answer": 3,
    "why": "dim(U∩W)=dim U+dim W−dim(U+W) ≥ 3+3−4=2.",
    "hint": "Use the dimension formula for sums of subspaces."
   },
   {
    "id": "math-L10-q6",
    "q": "Which of the following sets of numbers is linearly dependent over the reals?",
    "options": [
     "{(1,1,0),(0,1,1),(1,0,1)}",
     "{(1,2),(3,4)}",
     "{(2,0),(0,3)}",
     "{(1,0,0),(0,1,0),(0,0,1)}",
     "{(1,2,3),(4,5,6),(7,8,9)}"
    ],
    "answer": 4,
    "why": "The three vectors (1,2,3),(4,5,6),(7,8,9) satisfy (1,2,3)+(7,8,9)=2(4,5,6), so they are linearly dependent; the other listed sets are independent.",
    "hint": "Check whether one vector is a combination of the others."
   },
   {
    "id": "math-L10-q7",
    "q": "What is the value of the Euler totient φ(36)?",
    "options": [
     "18",
     "6",
     "24",
     "9",
     "12"
    ],
    "answer": 4,
    "why": "36=2²·3², so φ(36)=36(1−1/2)(1−1/3)=12.",
    "hint": "Use the product formula over distinct prime factors."
   },
   {
    "id": "math-L10-q8",
    "q": "A fair six-sided die is rolled until a 6 appears. What is the probability that the first 6 occurs on an even-numbered roll?",
    "options": [
     "6/11",
     "5/12",
     "1/3",
     "1/2",
     "5/11"
    ],
    "answer": 4,
    "why": "The probability is (5/6)(1/6)+(5/6)³(1/6)+… = (5/36)/(1−25/36)=5/11.",
    "hint": "Sum a geometric series with ratio (5/6)²."
   },
   {
    "id": "math-L10-q9",
    "q": "What is the sum of the squares of the roots of x³−6x²+11x−6?",
    "options": [
     "36",
     "25",
     "14",
     "11",
     "6"
    ],
    "answer": 2,
    "why": "Roots 1,2,3 give 1+4+9=14; equivalently (sum)²−2(sum of pairwise products)=36−22=14.",
    "hint": "Use Newton's identities or factorise."
   },
   {
    "id": "math-L10-q10",
    "q": "A 3×3 real matrix has eigenvalues 1, 2 and 3. What is the trace of its inverse?",
    "options": [
     "11/6",
     "6",
     "11",
     "1/6",
     "6/11"
    ],
    "answer": 0,
    "why": "Eigenvalues of the inverse are 1,1/2,1/3, whose sum is 11/6.",
    "hint": "Invert the eigenvalues and add."
   },
   {
    "id": "math-L10-q11",
    "q": "In how many ways can 8 identical balls be distributed into 4 distinct boxes so that no box is empty?",
    "options": [
     "20",
     "56",
     "70",
     "35",
     "165"
    ],
    "answer": 3,
    "why": "Stars and bars: C(8−1,4−1)=C(7,3)=35.",
    "hint": "Place one ball in each box first."
   },
   {
    "id": "math-L10-q12",
    "q": "What is the value of the double integral over the unit square [0,1]² of x·y?",
    "options": [
     "1/4",
     "1/3",
     "1",
     "1/8",
     "1/2"
    ],
    "answer": 0,
    "why": "The integral separates as (∫₀¹x dx)(∫₀¹y dy)=(1/2)(1/2)=1/4.",
    "hint": "The integrand is a product of single-variable functions."
   }
  ],
  "truths": [
   {
    "id": "math-L10-t1",
    "s": "Every finite integral domain is a field.",
    "answer": true,
    "why": "A finite integral domain is a finite division ring, hence a field by Wedderburn's theorem or elementary argument."
   },
   {
    "id": "math-L10-t2",
    "s": "Every group of order 15 is cyclic.",
    "answer": true,
    "why": "Groups of order pq with p<q and p∤(q−1) are cyclic; 3∤14."
   },
   {
    "id": "math-L10-t3",
    "s": "The sum of the reciprocals of all primes diverges.",
    "answer": true,
    "why": "Euler proved the divergence of the prime harmonic series."
   },
   {
    "id": "math-L10-t4",
    "s": "A continuous function on a closed bounded interval is uniformly continuous there.",
    "answer": true,
    "why": "This is Heine–Cantor theorem."
   },
   {
    "id": "math-L10-t5",
    "s": "The determinant of a real skew-symmetric matrix of odd order is zero.",
    "answer": true,
    "why": "det(A)=det(Aᵀ)=det(−A)=(−1)ⁿ det(A), so for odd n det(A)=0."
   },
   {
    "id": "math-L10-t6",
    "s": "Every subgroup of a cyclic group is cyclic.",
    "answer": true,
    "why": "Subgroups of cyclic groups are generated by a power of the original generator."
   },
   {
    "id": "math-L10-t7",
    "s": "The set of rational numbers is complete in the usual metric.",
    "answer": false,
    "why": "Q is not complete; for example, a sequence of rationals converging to √2 is Cauchy but does not converge in Q."
   },
   {
    "id": "math-L10-t8",
    "s": "The polynomial x³−2 is reducible over Q.",
    "answer": false,
    "why": "By Eisenstein with p=2, x³−2 is irreducible over Q."
   },
   {
    "id": "math-L10-t9",
    "s": "Every connected graph has an Eulerian circuit.",
    "answer": false,
    "why": "An Eulerian circuit requires all vertices to have even degree, which connected graphs need not satisfy."
   },
   {
    "id": "math-L10-t10",
    "s": "The matrix [[0,−1],[1,0]] has real eigenvalues.",
    "answer": false,
    "why": "Its characteristic polynomial is λ²+1, with eigenvalues ±i, which are not real."
   },
   {
    "id": "math-L10-t11",
    "s": "Every prime greater than 2 can be written as the sum of two squares of integers.",
    "answer": false,
    "why": "Only primes congruent to 1 mod 4 have such a representation; 3 is a counterexample."
   },
   {
    "id": "math-L10-t12",
    "s": "For any two square matrices A and B of the same size, det(AB)=det(A)det(B).",
    "answer": true,
    "why": "The determinant is multiplicative."
   },
   {
    "id": "math-L10-t13",
    "s": "The equation x² ≡ 2 (mod 7) has no integer solutions.",
    "answer": false,
    "why": "3²=9≡2 mod 7, so it does have solutions."
   },
   {
    "id": "math-L10-t14",
    "s": "The set of 2×2 real matrices with non-zero determinant forms a group under matrix multiplication.",
    "answer": true,
    "why": "Non-singular matrices are closed under multiplication and inversion."
   },
   {
    "id": "math-L10-t15",
    "s": "The sum of the reciprocals of the primes diverges.",
    "answer": true,
    "why": "Euler proved the series ∑1/p over primes diverges."
   },
   {
    "id": "math-L10-t16",
    "s": "Every continuous function on a closed bounded interval is uniformly continuous there.",
    "answer": true,
    "why": "This is the Heine–Cantor theorem."
   },
   {
    "id": "math-L10-t17",
    "s": "The polynomial x²+1 is reducible over the field with 3 elements.",
    "answer": false,
    "why": "Over F₃, x²+1 has no root (0²+1=1, 1²+1=2, 2²+1=2), so it is irreducible."
   },
   {
    "id": "math-L10-t18",
    "s": "The determinant of a 2×2 matrix equals the product of its eigenvalues only when the matrix is symmetric.",
    "answer": false,
    "why": "The determinant always equals the product of the eigenvalues (with multiplicity), symmetric or not."
   }
  ],
  "terms": [
   {
    "id": "math-L10-w1",
    "word": "EIGENVALUE",
    "clue": "Scalar λ for which a nonzero vector maps to a multiple of itself."
   },
   {
    "id": "math-L10-w2",
    "word": "ISOMORPHISM",
    "clue": "Structure-preserving bijection between two algebraic structures."
   },
   {
    "id": "math-L10-w3",
    "word": "HOMOMORPHISM",
    "clue": "Map preserving the operation between two algebraic structures."
   },
   {
    "id": "math-L10-w4",
    "word": "DERIVATIVE",
    "clue": "Instantaneous rate of change of a function."
   },
   {
    "id": "math-L10-w5",
    "word": "INTEGRAL",
    "clue": "Limit of sums used to compute area or accumulation."
   },
   {
    "id": "math-L10-w6",
    "word": "DETERMINANT",
    "clue": "Scalar computed from a square matrix that tests invertibility."
   }
  ]
 }
};
