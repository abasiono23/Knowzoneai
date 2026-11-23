// Written by scripts/world-content.ts (writer deepseek-v4.1-flash-1017, checker qwen3.8-27b, auditor glm-5.3-flash). Don't edit by hand.
import type { WorldBank } from '../types.js';

export const CODE_BANK: WorldBank = {
 "1": {
  "questions": [
   {
    "id": "code-L1-q1",
    "q": "In a computer, what does the binary digit system use to represent all data?",
    "options": [
     "Only the number 2",
     "The digits 1 to 9",
     "The letters A to Z",
     "Only the digits 0 and 1"
    ],
    "answer": 3,
    "why": "Binary is a base-2 system, so every value is built from just two symbols: 0 and 1.",
    "hint": "Think of a system with only two possible symbols."
   },
   {
    "id": "code-L1-q2",
    "q": "Which part of a computer is often called the 'brain' because it carries out instructions?",
    "options": [
     "The power supply",
     "The keyboard",
     "The CPU",
     "The monitor"
    ],
    "answer": 2,
    "why": "The central processing unit (CPU) fetches and executes the instructions of a program.",
    "hint": "It is a chip that processes instructions."
   },
   {
    "id": "code-L1-q3",
    "q": "What is an algorithm?",
    "options": [
     "A physical part inside a computer",
     "A step-by-step set of instructions to solve a problem",
     "A type of computer screen",
     "A kind of internet cable"
    ],
    "answer": 1,
    "why": "An algorithm is a clear, ordered sequence of steps that solves a problem or completes a task.",
    "hint": "Think of a recipe with clear steps."
   },
   {
    "id": "code-L1-q4",
    "q": "What does the 'www' at the start of many web addresses stand for?",
    "options": [
     "World Web Wide",
     "World Wide Web",
     "Wide Web World",
     "Web World Wide"
    ],
    "answer": 1,
    "why": "The abbreviation www stands for World Wide Web, the system of linked pages on the internet.",
    "hint": "The words are in the order World, Wide, Web."
   },
   {
    "id": "code-L1-q5",
    "q": "Which of these is a strong password?",
    "options": [
     "yourname",
     "Tr9!kLm2#q",
     "password123",
     "123456"
    ],
    "answer": 1,
    "why": "A strong password mixes upper- and lower-case letters, digits and symbols and is not a common word.",
    "hint": "Pick the one with mixed characters and no obvious word."
   },
   {
    "id": "code-L1-q6",
    "q": "In computing, what is a 'bug'?",
    "options": [
     "A network cable",
     "A small insect inside the machine",
     "An error in a program",
     "A type of printer"
    ],
    "answer": 2,
    "why": "A bug is a mistake or fault in a program that makes it behave incorrectly.",
    "hint": "It makes software do the wrong thing."
   },
   {
    "id": "code-L1-q7",
    "q": "What does RAM stand for?",
    "options": [
     "Random Answer Memory",
     "Random Access Memory",
     "Rapid Answer Machine",
     "Read Access Mode"
    ],
    "answer": 1,
    "why": "RAM means Random Access Memory, the fast working memory a computer uses while running programs.",
    "hint": "The first word is 'Random'."
   },
   {
    "id": "code-L1-q8",
    "q": "Which of these is an example of artificial intelligence in everyday use?",
    "options": [
     "A voice assistant answering questions",
     "A light switch",
     "A wooden ruler",
     "A paper notebook"
    ],
    "answer": 0,
    "why": "Voice assistants use AI methods such as speech recognition to understand and respond to people.",
    "hint": "Think of something that understands spoken questions."
   },
   {
    "id": "code-L1-q9",
    "q": "What is the main job of an operating system?",
    "options": [
     "To print documents",
     "To store files only",
     "To manage the computer's hardware and software",
     "To connect to the internet only"
    ],
    "answer": 2,
    "why": "An operating system manages hardware, runs programs and organises files, acting as the go-between for the user and the machine.",
    "hint": "It controls and coordinates the whole machine."
   },
   {
    "id": "code-L1-q10",
    "q": "How many different values can a single binary digit (bit) represent?",
    "options": [
     "Four",
     "Ten",
     "One",
     "Two"
    ],
    "answer": 3,
    "why": "A bit can be either 0 or 1, so it has exactly two possible values.",
    "hint": "Count the symbols 0 and 1."
   },
   {
    "id": "code-L1-q11",
    "q": "What is a database?",
    "options": [
     "A kind of monitor",
     "A programming language",
     "A type of computer virus",
     "An organised collection of data that can be searched"
    ],
    "answer": 3,
    "why": "A database stores data in an organised way so it can be easily searched, updated and retrieved.",
    "hint": "Think of an organised store of information."
   },
   {
    "id": "code-L1-q12",
    "q": "Which device connects a home network to the internet?",
    "options": [
     "A scanner",
     "A speaker",
     "A mouse",
     "A router"
    ],
    "answer": 3,
    "why": "A router directs data between a local network and the wider internet.",
    "hint": "It 'routes' data between networks."
   },
   {
    "id": "code-L1-q13",
    "q": "What is a computer program?",
    "options": [
     "A network cable",
     "A type of screen",
     "A piece of hardware",
     "A set of instructions a computer can follow"
    ],
    "answer": 3,
    "why": "A program is a sequence of instructions written so a computer can carry out a task.",
    "hint": "It is like a list of commands for the machine."
   }
  ],
  "truths": [
   {
    "id": "code-L1-t1",
    "s": "A byte is usually made up of 8 bits.",
    "answer": true,
    "why": "In standard computing, one byte consists of 8 bits."
   },
   {
    "id": "code-L1-t2",
    "s": "A CPU permanently stores all the files you save.",
    "answer": false,
    "why": "Files are stored on storage devices such as hard drives or SSDs, not permanently in the CPU."
   },
   {
    "id": "code-L1-t3",
    "s": "The internet and the World Wide Web are exactly the same thing.",
    "answer": false,
    "why": "The internet is the global network of networks, while the World Wide Web is one service that runs on it."
   },
   {
    "id": "code-L1-t4",
    "s": "Binary uses only the digits 0 and 1.",
    "answer": true,
    "why": "Binary is a base-2 system using just the symbols 0 and 1."
   },
   {
    "id": "code-L1-t5",
    "s": "An algorithm must be written in a programming language.",
    "answer": false,
    "why": "Algorithms can be described in plain language or diagrams; they do not need a programming language."
   },
   {
    "id": "code-L1-t6",
    "s": "RAM loses its contents when the computer is switched off.",
    "answer": true,
    "why": "RAM is volatile memory, so its data is lost when power is removed."
   },
   {
    "id": "code-L1-t7",
    "s": "A firewall helps protect a computer from unwanted network access.",
    "answer": true,
    "why": "A firewall filters network traffic to block unauthorised access."
   },
   {
    "id": "code-L1-t8",
    "s": "Machine learning programs are always given explicit rules for every possible case.",
    "answer": false,
    "why": "Machine learning systems learn patterns from data rather than being given a rule for every case."
   },
   {
    "id": "code-L1-t9",
    "s": "A password should be shared with friends to keep an account safe.",
    "answer": false,
    "why": "Sharing passwords makes accounts less secure; passwords should be kept secret."
   },
   {
    "id": "code-L1-t10",
    "s": "A bit can hold the value 0 or 1.",
    "answer": true,
    "why": "A bit is a binary digit with exactly two possible values, 0 and 1."
   },
   {
    "id": "code-L1-t11",
    "s": "The operating system is a physical chip inside the computer.",
    "answer": false,
    "why": "An operating system is software, not a physical chip."
   },
   {
    "id": "code-L1-t12",
    "s": "A router can connect different networks together.",
    "answer": true,
    "why": "Routers forward data between networks, such as a home network and the internet."
   },
   {
    "id": "code-L1-t13",
    "s": "A database is the same as a spreadsheet and cannot be searched.",
    "answer": false,
    "why": "Databases are designed for organised storage and searching, which distinguishes them from simple spreadsheets."
   },
   {
    "id": "code-L1-t14",
    "s": "A compiler translates a program written in a high-level language into machine code.",
    "answer": true,
    "why": "A compiler converts source code into machine code the computer can run."
   },
   {
    "id": "code-L1-t15",
    "s": "All computer programs are written directly in binary by people.",
    "answer": false,
    "why": "People usually write in high-level or assembly languages, which are then translated for the machine."
   },
   {
    "id": "code-L1-t16",
    "s": "Antivirus software can help detect malicious programs.",
    "answer": true,
    "why": "Antivirus software scans for and detects known malicious programs."
   },
   {
    "id": "code-L1-t17",
    "s": "A monitor is an input device used to type text.",
    "answer": false,
    "why": "A monitor is an output device that displays information; a keyboard is used to type text."
   },
   {
    "id": "code-L1-t18",
    "s": "Artificial intelligence includes systems that can recognise speech.",
    "answer": true,
    "why": "Speech recognition is a well-known application of artificial intelligence."
   }
  ],
  "terms": [
   {
    "id": "code-L1-w1",
    "word": "BINARY",
    "clue": "Number system using only two symbols, zero and one"
   },
   {
    "id": "code-L1-w2",
    "word": "ALGORITHM",
    "clue": "Ordered steps for solving a problem or task"
   },
   {
    "id": "code-L1-w3",
    "word": "HARDWARE",
    "clue": "The physical parts of a computer you can touch"
   },
   {
    "id": "code-L1-w4",
    "word": "SOFTWARE",
    "clue": "Programs and instructions that run on a computer"
   },
   {
    "id": "code-L1-w5",
    "word": "NETWORK",
    "clue": "Computers linked together to share data"
   },
   {
    "id": "code-L1-w6",
    "word": "DATABASE",
    "clue": "Organised store of data that can be searched"
   },
   {
    "id": "code-L1-w7",
    "word": "PASSWORD",
    "clue": "Secret string used to prove your identity online"
   },
   {
    "id": "code-L1-w8",
    "word": "INTERNET",
    "clue": "Global system of connected computer networks"
   },
   {
    "id": "code-L1-w9",
    "word": "PROGRAM",
    "clue": "Set of coded instructions a computer can execute"
   }
  ]
 },
 "2": {
  "questions": [
   {
    "id": "code-L2-q1",
    "q": "Which number system do computers use internally to store and process data?",
    "options": [
     "Decimal",
     "Binary",
     "Roman",
     "Hexadecimal"
    ],
    "answer": 1,
    "why": "Computers use binary, based on two states (0 and 1), because electronic circuits are naturally on or off.",
    "hint": "Think of a system with only two digits."
   },
   {
    "id": "code-L2-q2",
    "q": "What is the name for a single 0 or 1 in computing?",
    "options": [
     "Byte",
     "Pixel",
     "Bit",
     "Baud"
    ],
    "answer": 2,
    "why": "A bit is one binary digit, the smallest unit of data in a computer.",
    "hint": "It is short for 'binary digit'."
   },
   {
    "id": "code-L2-q3",
    "q": "How many bits are there in one byte?",
    "options": [
     "16",
     "32",
     "4",
     "8"
    ],
    "answer": 3,
    "why": "One byte is made up of 8 bits, which can represent 256 different values.",
    "hint": "It is a small power of two."
   },
   {
    "id": "code-L2-q4",
    "q": "Which of these is an input device?",
    "options": [
     "Keyboard",
     "Speaker",
     "Monitor",
     "Printer"
    ],
    "answer": 0,
    "why": "A keyboard sends data into the computer, so it is an input device; the others output information.",
    "hint": "Which device lets you type information in?"
   },
   {
    "id": "code-L2-q5",
    "q": "What does the CPU do in a computer?",
    "options": [
     "Connects to the internet",
     "Displays images",
     "Carries out instructions",
     "Stores files permanently"
    ],
    "answer": 2,
    "why": "The central processing unit fetches and executes program instructions.",
    "hint": "It is often described as the brain of the computer."
   },
   {
    "id": "code-L2-q6",
    "q": "Which type of software is a web browser an example of?",
    "options": [
     "Utility program",
     "Firmware",
     "Application software",
     "Operating system"
    ],
    "answer": 2,
    "why": "A browser is application software used by people to do a task, unlike the operating system itself.",
    "hint": "It is a program you choose to use, not system software."
   },
   {
    "id": "code-L2-q7",
    "q": "In a flowchart, what does a diamond shape usually represent?",
    "options": [
     "Input or output",
     "A decision",
     "Start or end",
     "A process"
    ],
    "answer": 1,
    "why": "A diamond shows a yes/no decision that changes the path the algorithm takes.",
    "hint": "It has more than one arrow leaving it."
   },
   {
    "id": "code-L2-q8",
    "q": "What is a variable in a program?",
    "options": [
     "A kind of error",
     "A type of loop",
     "A named storage location",
     "A fixed number"
    ],
    "answer": 2,
    "why": "A variable is a named place in memory whose value can change while the program runs.",
    "hint": "Its value can be changed later."
   },
   {
    "id": "code-L2-q9",
    "q": "Which of these is a loop in programming?",
    "options": [
     "Variable",
     "IF statement",
     "REPEAT...UNTIL",
     "Comment"
    ],
    "answer": 2,
    "why": "REPEAT...UNTIL repeats instructions until a condition is met, so it is a loop.",
    "hint": "Which one repeats instructions?"
   },
   {
    "id": "code-L2-q10",
    "q": "What does the term 'bandwidth' describe in a network?",
    "options": [
     "The number of computers connected",
     "The amount of data sent per second",
     "The physical width of a cable",
     "The strength of a password"
    ],
    "answer": 1,
    "why": "Bandwidth measures how much data a connection can carry in a given time.",
    "hint": "It is about capacity, not physical size."
   },
   {
    "id": "code-L2-q11",
    "q": "Which of these is the best example of a strong password?",
    "options": [
     "yourname",
     "Tr0ub4dor&3x",
     "password123",
     "12345678"
    ],
    "answer": 1,
    "why": "A long mix of upper and lower case letters, digits and symbols is much harder to guess.",
    "hint": "Length and variety of characters both help."
   },
   {
    "id": "code-L2-q12",
    "q": "What is 'malware'?",
    "options": [
     "A programming language",
     "A network cable",
     "A type of hardware",
     "Software that damages or steals data"
    ],
    "answer": 3,
    "why": "Malware is malicious software such as viruses, worms and spyware.",
    "hint": "The name combines 'malicious' and 'software'."
   },
   {
    "id": "code-L2-q13",
    "q": "In machine learning, what is a 'training set' used for?",
    "options": [
     "Connecting to the internet",
     "Storing passwords",
     "Teaching the model from examples",
     "Testing the final program"
    ],
    "answer": 2,
    "why": "A model learns patterns from labelled examples in the training set before being tested on new data.",
    "hint": "It happens before the model is tested."
   }
  ],
  "truths": [
   {
    "id": "code-L2-t1",
    "s": "A byte is larger than a bit.",
    "answer": true,
    "why": "One byte contains 8 bits, so it is larger."
   },
   {
    "id": "code-L2-t2",
    "s": "The binary number 101 has the decimal value 5.",
    "answer": true,
    "why": "4 + 0 + 1 = 5 in decimal."
   },
   {
    "id": "code-L2-t3",
    "s": "RAM keeps its contents when the computer is switched off.",
    "answer": false,
    "why": "RAM is volatile, so its contents are lost when power is removed."
   },
   {
    "id": "code-L2-t4",
    "s": "A hard disk drive stores data permanently, even without power.",
    "answer": true,
    "why": "Magnetic disk storage is non-volatile and keeps data when switched off."
   },
   {
    "id": "code-L2-t5",
    "s": "An algorithm must be written in a programming language.",
    "answer": false,
    "why": "An algorithm is a step-by-step method and can be written in plain language or diagrams."
   },
   {
    "id": "code-L2-t6",
    "s": "In most programming languages, a variable can hold different values at different times.",
    "answer": true,
    "why": "That is what makes it a variable rather than a constant."
   },
   {
    "id": "code-L2-t7",
    "s": "The internet and the World Wide Web are exactly the same thing.",
    "answer": false,
    "why": "The web is one service that runs on the internet, not the internet itself."
   },
   {
    "id": "code-L2-t8",
    "s": "A router can forward data between different networks.",
    "answer": true,
    "why": "Routers choose paths for data packets between networks."
   },
   {
    "id": "code-L2-t9",
    "s": "An IP address identifies a device on a network.",
    "answer": true,
    "why": "IP addresses are used to route data to the correct device."
   },
   {
    "id": "code-L2-t10",
    "s": "Antivirus software guarantees that a computer can never be infected.",
    "answer": false,
    "why": "No software can guarantee complete protection; new threats can still get through."
   },
   {
    "id": "code-L2-t11",
    "s": "A database is an organised collection of data that can be searched and updated.",
    "answer": true,
    "why": "Databases store structured data for easy querying and updating."
   },
   {
    "id": "code-L2-t12",
    "s": "In a relational database, a table is made up of rows and columns.",
    "answer": true,
    "why": "Tables organise records in rows and fields in columns."
   },
   {
    "id": "code-L2-t13",
    "s": "A spreadsheet is the same thing as a database.",
    "answer": false,
    "why": "A spreadsheet is a calculation tool; a database is a structured data store with querying."
   },
   {
    "id": "code-L2-t14",
    "s": "Supervised learning uses labelled examples to train a model.",
    "answer": true,
    "why": "Labels tell the model the correct answer during training."
   },
   {
    "id": "code-L2-t15",
    "s": "Artificial intelligence programs always understand meaning in the way humans do.",
    "answer": false,
    "why": "AI can mimic some tasks without human-like understanding."
   },
   {
    "id": "code-L2-t16",
    "s": "An operating system manages memory and files on a computer.",
    "answer": true,
    "why": "Memory and file management are core jobs of an operating system."
   },
   {
    "id": "code-L2-t17",
    "s": "A compiler translates a program written in a high-level language into machine code.",
    "answer": true,
    "why": "That is the compiler's job before the program runs."
   },
   {
    "id": "code-L2-t18",
    "s": "Every problem can be solved by a computer given enough time.",
    "answer": false,
    "why": "Some problems are undecidable, such as the halting problem, no matter how much time is allowed."
   }
  ],
  "terms": [
   {
    "id": "code-L2-w1",
    "word": "BINARY",
    "clue": "Number system using only the digits zero and one."
   },
   {
    "id": "code-L2-w2",
    "word": "BYTE",
    "clue": "Group of eight bits treated as one unit."
   },
   {
    "id": "code-L2-w3",
    "word": "ALGORITHM",
    "clue": "Step-by-step method for solving a problem."
   },
   {
    "id": "code-L2-w4",
    "word": "VARIABLE",
    "clue": "Named storage whose value can change while running."
   },
   {
    "id": "code-L2-w5",
    "word": "ROUTER",
    "clue": "Device that forwards data between different networks."
   },
   {
    "id": "code-L2-w6",
    "word": "PACKET",
    "clue": "Small chunk of data sent across a network."
   },
   {
    "id": "code-L2-w7",
    "word": "MALWARE",
    "clue": "Software designed to harm or steal from a system."
   },
   {
    "id": "code-L2-w8",
    "word": "DATABASE",
    "clue": "Organised store of data that can be queried."
   },
   {
    "id": "code-L2-w9",
    "word": "PROGRAM",
    "clue": "Set of instructions a computer can execute."
   }
  ]
 },
 "3": {
  "questions": [
   {
    "id": "code-L3-q1",
    "q": "Which of these is an example of system software?",
    "options": [
     "A photo editor",
     "A word processor",
     "An operating system",
     "A web browser"
    ],
    "answer": 2,
    "why": "An operating system is system software because it manages the computer's hardware and provides services for other programs.",
    "hint": "Think about which program is needed before any applications can run."
   },
   {
    "id": "code-L3-q2",
    "q": "What is the main purpose of a compiler?",
    "options": [
     "To translate source code into machine code",
     "To store files on disk",
     "To run a program line by line",
     "To connect a computer to the internet"
    ],
    "answer": 0,
    "why": "A compiler translates a whole program written in a high-level language into machine code before it is run.",
    "hint": "It works on the entire program before execution, not line by line."
   },
   {
    "id": "code-L3-q3",
    "q": "Which data structure works on the 'last in, first out' principle?",
    "options": [
     "Linked list",
     "Array",
     "Queue",
     "Stack"
    ],
    "answer": 3,
    "why": "In a stack, the most recently added item is the first one removed, which is last in, first out.",
    "hint": "Think of a pile of plates."
   },
   {
    "id": "code-L3-q4",
    "q": "In binary, what is the decimal number 5 written as?",
    "options": [
     "101",
     "110",
     "100",
     "011"
    ],
    "answer": 0,
    "why": "4 + 1 = 5, so the binary number is 101.",
    "hint": "Use place values 4, 2 and 1."
   },
   {
    "id": "code-L3-q5",
    "q": "What does the term 'pixel' refer to in a digital image?",
    "options": [
     "A cable used for displays",
     "A measure of screen brightness",
     "A type of file format",
     "A single tiny dot of colour"
    ],
    "answer": 3,
    "why": "A pixel is the smallest single element of a digital image, holding one colour value.",
    "hint": "It is the smallest unit of a picture."
   },
   {
    "id": "code-L3-q6",
    "q": "Which of these is a correct example of a Boolean value?",
    "options": [
     "3.14",
     "42",
     "True",
     "'hello'"
    ],
    "answer": 2,
    "why": "A Boolean value can only be true or false, and True is one of those two values.",
    "hint": "It is one of only two possible values."
   },
   {
    "id": "code-L3-q7",
    "q": "What is the main function of a router in a network?",
    "options": [
     "To forward data between different networks",
     "To print documents",
     "To cool the computer",
     "To store backup files"
    ],
    "answer": 0,
    "why": "A router forwards data packets between networks, choosing paths for them to reach their destination.",
    "hint": "It decides where data should go next."
   },
   {
    "id": "code-L3-q8",
    "q": "Which of these is an example of a database management system?",
    "options": [
     "HTML",
     "Python",
     "MySQL",
     "Windows"
    ],
    "answer": 2,
    "why": "MySQL is software used to create, store and manage databases.",
    "hint": "It is named after a query language used with databases."
   },
   {
    "id": "code-L3-q9",
    "q": "What does 'phishing' mean in cybersecurity?",
    "options": [
     "Backing up data to the cloud",
     "Tricking people into revealing private information",
     "Encrypting files for ransom",
     "Scanning a network for open ports"
    ],
    "answer": 1,
    "why": "Phishing uses fake messages or websites to trick people into giving away passwords or other private data.",
    "hint": "It involves deceiving a person, often by email."
   },
   {
    "id": "code-L3-q10",
    "q": "In artificial intelligence, what is a 'neural network' loosely based on?",
    "options": [
     "The layout of a computer keyboard",
     "The connections between neurons in a brain",
     "The structure of the internet",
     "The rules of chess"
    ],
    "answer": 1,
    "why": "Artificial neural networks are loosely inspired by how neurons connect and pass signals in the brain.",
    "hint": "It takes inspiration from biology."
   },
   {
    "id": "code-L3-q11",
    "q": "Which of these is a valid reason to use a loop in a program?",
    "options": [
     "To comment the code",
     "To name a variable",
     "To store a single number",
     "To repeat a set of instructions many times"
    ],
    "answer": 3,
    "why": "Loops are used to repeat instructions without writing them out many times.",
    "hint": "Think about doing the same task repeatedly."
   },
   {
    "id": "code-L3-q12",
    "q": "What does the term 'latency' describe in a network?",
    "options": [
     "The number of devices connected",
     "The delay before data begins to transfer",
     "The total amount of data transferred",
     "The cost of a connection"
    ],
    "answer": 1,
    "why": "Latency is the time delay between sending data and it starting to arrive.",
    "hint": "It is about delay, not amount."
   },
   {
    "id": "code-L3-q13",
    "q": "Which of these best describes 'open source' software?",
    "options": [
     "Software whose source code is available to view and modify",
     "Software that cannot be copied",
     "Software that is always free of charge",
     "Software that needs no operating system"
    ],
    "answer": 0,
    "why": "Open source means the source code is made available so people can study, change and share it.",
    "hint": "It is about access to the code, not the price."
   }
  ],
  "truths": [
   {
    "id": "code-L3-t1",
    "s": "A byte is made up of 8 bits.",
    "answer": true,
    "why": "By standard definition one byte contains 8 bits."
   },
   {
    "id": "code-L3-t2",
    "s": "A compiler runs a program one line at a time.",
    "answer": false,
    "why": "An interpreter runs line by line; a compiler translates the whole program before running it."
   },
   {
    "id": "code-L3-t3",
    "s": "In a queue, the first item added is the first item removed.",
    "answer": true,
    "why": "A queue works on a first in, first out principle."
   },
   {
    "id": "code-L3-t4",
    "s": "HTML is a programming language used to write algorithms.",
    "answer": false,
    "why": "HTML is a markup language for structuring web pages, not a programming language."
   },
   {
    "id": "code-L3-t5",
    "s": "A router can connect two separate networks together.",
    "answer": true,
    "why": "Routers forward data between different networks."
   },
   {
    "id": "code-L3-t6",
    "s": "Antivirus software can guarantee that a computer will never be infected.",
    "answer": false,
    "why": "No antivirus tool can guarantee complete protection against every threat."
   },
   {
    "id": "code-L3-t7",
    "s": "In machine learning, a model learns patterns from a training set of examples.",
    "answer": true,
    "why": "Training data is used to adjust the model so it can make predictions."
   },
   {
    "id": "code-L3-t8",
    "s": "A solid-state drive stores data on spinning magnetic disks.",
    "answer": false,
    "why": "That describes a hard disk drive; a solid-state drive uses flash memory with no moving parts."
   },
   {
    "id": "code-L3-t9",
    "s": "The binary number 1101 equals the decimal number 13.",
    "answer": true,
    "why": "8 + 4 + 1 = 13, so 1101 in binary is 13."
   },
   {
    "id": "code-L3-t10",
    "s": "An algorithm must always produce a result in a finite number of steps.",
    "answer": true,
    "why": "By definition an algorithm must terminate after a finite number of steps."
   },
   {
    "id": "code-L3-t11",
    "s": "A spreadsheet cell containing the text '7' is automatically treated as a number in every spreadsheet.",
    "answer": false,
    "why": "Text entered as text may be stored as a string, not a number, depending on formatting."
   },
   {
    "id": "code-L3-t12",
    "s": "A firewall can block unwanted network traffic.",
    "answer": true,
    "why": "Firewalls filter incoming and outgoing traffic according to rules."
   },
   {
    "id": "code-L3-t13",
    "s": "In a relational database, a primary key may contain duplicate values.",
    "answer": false,
    "why": "A primary key must be unique for every row in a table."
   },
   {
    "id": "code-L3-t14",
    "s": "RAM loses its contents when the computer is switched off.",
    "answer": true,
    "why": "RAM is volatile memory, so its data is lost without power."
   },
   {
    "id": "code-L3-t15",
    "s": "A search engine's ranking of results is always the same for every user.",
    "answer": false,
    "why": "Rankings can vary by user, location and personalisation."
   },
   {
    "id": "code-L3-t16",
    "s": "A variable in a program can hold different values at different times.",
    "answer": true,
    "why": "A variable is a named storage location whose value can change while the program runs."
   },
   {
    "id": "code-L3-t17",
    "s": "Two-factor authentication requires only a password.",
    "answer": false,
    "why": "Two-factor authentication requires a second, different proof of identity in addition to a password."
   },
   {
    "id": "code-L3-t18",
    "s": "A stack allows items to be added and removed only at one end.",
    "answer": true,
    "why": "A stack operates at its top only, giving last in, first out behaviour."
   }
  ],
  "terms": [
   {
    "id": "code-L3-w1",
    "word": "BINARY",
    "clue": "Number system using only two digits, 0 and 1"
   },
   {
    "id": "code-L3-w2",
    "word": "LOOP",
    "clue": "Programming structure that repeats instructions until a condition changes"
   },
   {
    "id": "code-L3-w3",
    "word": "ROUTER",
    "clue": "Device that forwards data packets between networks"
   },
   {
    "id": "code-L3-w4",
    "word": "PIXEL",
    "clue": "Smallest single dot of colour in a digital image"
   },
   {
    "id": "code-L3-w5",
    "word": "MALWARE",
    "clue": "Software designed to damage or gain unauthorised access to a system"
   },
   {
    "id": "code-L3-w6",
    "word": "COMPILER",
    "clue": "Program that translates source code into machine code before running"
   },
   {
    "id": "code-L3-w7",
    "word": "DATABASE",
    "clue": "Organised collection of data that can be searched and updated"
   },
   {
    "id": "code-L3-w8",
    "word": "ENCRYPT",
    "clue": "Convert data into a coded form to protect it from unauthorised readers"
   }
  ]
 },
 "4": {
  "questions": [
   {
    "id": "code-L4-q1",
    "q": "A colour image uses 8 bits for each of the red, green and blue channels. How many bits are needed to store one pixel?",
    "options": [
     "32",
     "24",
     "16",
     "8"
    ],
    "answer": 1,
    "why": "Three channels at 8 bits each give 3 × 8 = 24 bits per pixel.",
    "hint": "Add the bits for all three colour channels."
   },
   {
    "id": "code-L4-q2",
    "q": "A program stores the decimal number 12 in an 8-bit register. What is its binary representation?",
    "options": [
     "1100",
     "1010",
     "1001",
     "1110"
    ],
    "answer": 0,
    "why": "12 = 8 + 4, so in 8-bit form it is 00001100, written here as 1100.",
    "hint": "Split 12 into powers of two: 8 and 4."
   },
   {
    "id": "code-L4-q3",
    "q": "In a queue data structure, which element is removed next?",
    "options": [
     "The one added earliest",
     "The smallest value",
     "The largest value",
     "The most recently added"
    ],
    "answer": 0,
    "why": "A queue is first in, first out, so the earliest added element leaves first.",
    "hint": "Think of people standing in line at a ticket office."
   },
   {
    "id": "code-L4-q4",
    "q": "Which statement about a compiler is correct?",
    "options": [
     "It runs the source code line by line",
     "It translates the whole program before it runs",
     "It only finds spelling mistakes",
     "It stores data permanently"
    ],
    "answer": 1,
    "why": "A compiler translates the entire source program into machine code before execution, unlike an interpreter.",
    "hint": "Compare it with an interpreter, which works line by line."
   },
   {
    "id": "code-L4-q5",
    "q": "A web page is requested from a server. Which protocol is mainly used to transfer the page securely?",
    "options": [
     "SSH",
     "HTTPS",
     "SMTP",
     "FTP"
    ],
    "answer": 1,
    "why": "HTTPS is HTTP carried over an encrypted connection, used for secure web page transfer.",
    "hint": "The 'S' stands for secure."
   },
   {
    "id": "code-L4-q6",
    "q": "What does a firewall mainly do on a network?",
    "options": [
     "Filter incoming and outgoing traffic",
     "Assign IP addresses",
     "Increase the bandwidth",
     "Store web pages"
    ],
    "answer": 0,
    "why": "A firewall inspects and filters network traffic according to rules, blocking unwanted connections.",
    "hint": "Think of a barrier that checks traffic against rules."
   },
   {
    "id": "code-L4-q7",
    "q": "In a relational database, what is a primary key?",
    "options": [
     "Any column with numbers",
     "A field that uniquely identifies each record",
     "A copy of another table",
     "The first row of a table"
    ],
    "answer": 1,
    "why": "A primary key uniquely identifies every record in a table and cannot be duplicated.",
    "hint": "It must be unique for every row."
   },
   {
    "id": "code-L4-q8",
    "q": "A supervised machine-learning model is trained on labelled examples. What does the label provide?",
    "options": [
     "The programming language used",
     "The size of the dataset",
     "The speed of training",
     "The correct output for each example"
    ],
    "answer": 3,
    "why": "In supervised learning the label gives the desired output, so the model can learn to predict it.",
    "hint": "It tells the model what the right answer is."
   },
   {
    "id": "code-L4-q9",
    "q": "Which of these is an example of a phishing attack?",
    "options": [
     "Guessing a password by trying many words",
     "Flooding a server with requests",
     "Encrypting files and demanding payment",
     "Sending a fake email that asks for login details"
    ],
    "answer": 3,
    "why": "Phishing tricks users into revealing credentials, often through fake emails or websites.",
    "hint": "It relies on deceiving the user, not on technical force."
   },
   {
    "id": "code-L4-q10",
    "q": "A loop that never ends because its condition never becomes false is called what?",
    "options": [
     "A recursive call",
     "A syntax error",
     "An infinite loop",
     "A nested loop"
    ],
    "answer": 2,
    "why": "If the loop condition stays true, the loop runs forever: an infinite loop.",
    "hint": "The condition never changes to false."
   },
   {
    "id": "code-L4-q11",
    "q": "In a binary search on a sorted list of 1000 items, roughly how many comparisons are needed in the worst case?",
    "options": [
     "500",
     "100",
     "10",
     "1000"
    ],
    "answer": 2,
    "why": "Binary search halves the search space each time; log2(1000) is about 10.",
    "hint": "Each step halves the remaining items."
   },
   {
    "id": "code-L4-q12",
    "q": "Which of these is an example of a logic (Boolean) operator used in conditions?",
    "options": [
     "PLUS",
     "AND",
     "PRINT",
     "GOTO"
    ],
    "answer": 1,
    "why": "AND combines two conditions and is a Boolean operator, along with OR and NOT.",
    "hint": "It combines two conditions."
   },
   {
    "id": "code-L4-q13",
    "q": "What does the term 'latency' measure in a network?",
    "options": [
     "The number of users",
     "The physical cable length",
     "The delay before data starts arriving",
     "The maximum data rate"
    ],
    "answer": 2,
    "why": "Latency is the time delay for data to travel from source to destination.",
    "hint": "It is about delay, not amount."
   }
  ],
  "truths": [
   {
    "id": "code-L4-t1",
    "s": "A single byte consists of 8 bits.",
    "answer": true,
    "why": "One byte is defined as 8 bits in modern computing."
   },
   {
    "id": "code-L4-t2",
    "s": "RAM keeps its contents when the computer is switched off.",
    "answer": false,
    "why": "RAM is volatile and loses its contents when power is removed."
   },
   {
    "id": "code-L4-t3",
    "s": "In a stack, the last item pushed is the first item popped.",
    "answer": true,
    "why": "A stack is last in, first out."
   },
   {
    "id": "code-L4-t4",
    "s": "An operating system is an example of application software.",
    "answer": false,
    "why": "An operating system is system software, not application software."
   },
   {
    "id": "code-L4-t5",
    "s": "The binary number 1010 equals the decimal number 10.",
    "answer": true,
    "why": "1010 = 8 + 2 = 10 in decimal."
   },
   {
    "id": "code-L4-t6",
    "s": "A router forwards data packets between different networks.",
    "answer": true,
    "why": "Routers direct packets between networks using IP addresses."
   },
   {
    "id": "code-L4-t7",
    "s": "HTML is a programming language used to write algorithms.",
    "answer": false,
    "why": "HTML is a markup language for structuring web pages, not a programming language."
   },
   {
    "id": "code-L4-t8",
    "s": "In machine learning, more training data always guarantees a better model.",
    "answer": false,
    "why": "Data quality and relevance matter; more data alone does not guarantee improvement."
   },
   {
    "id": "code-L4-t9",
    "s": "A variable in a program is a named storage location whose value can change.",
    "answer": true,
    "why": "Variables hold values that may be updated during execution."
   },
   {
    "id": "code-L4-t10",
    "s": "Encryption makes data unreadable to anyone without the correct key.",
    "answer": true,
    "why": "Encryption scrambles data so only holders of the key can decrypt it."
   },
   {
    "id": "code-L4-t11",
    "s": "A compiler translates a program one line at a time as it runs.",
    "answer": false,
    "why": "That describes an interpreter; a compiler translates the whole program first."
   },
   {
    "id": "code-L4-t12",
    "s": "A solid-state drive (SSD) stores data using spinning magnetic disks.",
    "answer": false,
    "why": "SSDs use flash memory; spinning disks are used in hard disk drives."
   },
   {
    "id": "code-L4-t13",
    "s": "The decimal number 255 is the largest value an 8-bit unsigned integer can hold.",
    "answer": true,
    "why": "2^8 − 1 = 255 is the maximum for 8 unsigned bits."
   },
   {
    "id": "code-L4-t14",
    "s": "A database index is used to make searches faster.",
    "answer": true,
    "why": "Indexes speed up lookups at the cost of extra storage."
   },
   {
    "id": "code-L4-t15",
    "s": "Phishing is a type of attack that exploits weaknesses in network cables.",
    "answer": false,
    "why": "Phishing deceives users into revealing information; it does not target cables."
   },
   {
    "id": "code-L4-t16",
    "s": "In a flowchart, a parallelogram usually represents input or output.",
    "answer": true,
    "why": "Parallelograms denote input/output operations in flowcharts."
   },
   {
    "id": "code-L4-t17",
    "s": "Two-factor authentication requires only a password.",
    "answer": false,
    "why": "Two-factor authentication needs a second, different factor besides the password."
   },
   {
    "id": "code-L4-t18",
    "s": "An algorithm must finish after a finite number of steps.",
    "answer": true,
    "why": "Finiteness is a defining property of an algorithm."
   }
  ],
  "terms": [
   {
    "id": "code-L4-w1",
    "word": "BINARY",
    "clue": "Base-two number system using only zeros and ones"
   },
   {
    "id": "code-L4-w2",
    "word": "ALGORITHM",
    "clue": "Finite step-by-step procedure for solving a problem"
   },
   {
    "id": "code-L4-w3",
    "word": "ROUTER",
    "clue": "Device that forwards packets between separate networks"
   },
   {
    "id": "code-L4-w4",
    "word": "MALWARE",
    "clue": "Software designed to harm or gain unauthorised access"
   },
   {
    "id": "code-L4-w5",
    "word": "COMPILER",
    "clue": "Translates a whole program into machine code before running"
   },
   {
    "id": "code-L4-w6",
    "word": "DATABASE",
    "clue": "Organised collection of data stored for easy retrieval"
   },
   {
    "id": "code-L4-w7",
    "word": "PIXEL",
    "clue": "Smallest single element of a digital image"
   },
   {
    "id": "code-L4-w8",
    "word": "BOOLEAN",
    "clue": "Data type with only true and false values"
   },
   {
    "id": "code-L4-w9",
    "word": "FIREWALL",
    "clue": "Filters network traffic according to security rules"
   }
  ]
 },
 "5": {
  "questions": [
   {
    "id": "code-L5-q1",
    "q": "A queue contains, from front to back, the items X, Y, Z. An item W is enqueued, then one item is dequeued. Which item is now at the front?",
    "options": [
     "Y",
     "X",
     "W",
     "Z"
    ],
    "answer": 0,
    "why": "W joins at the back, so dequeuing removes X and leaves Y at the front.",
    "hint": "Queues add at the back and remove from the front."
   },
   {
    "id": "code-L5-q2",
    "q": "Why is a binary search faster than a linear search on a large sorted list?",
    "options": [
     "It halves the remaining search range at each step",
     "It sorts the list while searching",
     "It checks every item but does so faster",
     "It stores the list in a hash table first"
    ],
    "answer": 0,
    "why": "Each comparison rules out half of the remaining items, giving logarithmic rather than linear time.",
    "hint": "Think about how much of the list is discarded each time."
   },
   {
    "id": "code-L5-q3",
    "q": "A 24-bit colour code uses 8 bits per channel. How many distinct colours can it represent?",
    "options": [
     "65,536",
     "24",
     "4,096",
     "16,777,216"
    ],
    "answer": 3,
    "why": "2^24 = 16,777,216 distinct combinations.",
    "hint": "Raise 2 to the power of the total number of bits."
   },
   {
    "id": "code-L5-q4",
    "q": "A firewall is placed between a school network and the internet. What is its main function?",
    "options": [
     "Filtering incoming and outgoing traffic against rules",
     "Encrypting all web pages",
     "Assigning IP addresses to devices",
     "Converting domain names into IP addresses"
    ],
    "answer": 0,
    "why": "A firewall inspects packets and allows or blocks them according to configured rules.",
    "hint": "It decides which traffic is allowed through."
   },
   {
    "id": "code-L5-q5",
    "q": "In a relational database, a table of orders must link each order to exactly one customer. Which key is stored in the orders table to do this?",
    "options": [
     "A foreign key referencing the customer's primary key",
     "An index on the order date",
     "A primary key unique to each order",
     "A composite key made of all order columns"
    ],
    "answer": 0,
    "why": "A foreign key holds the primary-key value of the related customer row, creating the link.",
    "hint": "The link stores a value that identifies a row in another table."
   },
   {
    "id": "code-L5-q6",
    "q": "In supervised machine learning, a model is trained on labelled examples. What does the label represent?",
    "options": [
     "The size of the training set",
     "The number of features in the data",
     "The correct output for that example",
     "The learning rate used in training"
    ],
    "answer": 2,
    "why": "Labels are the target answers the model learns to predict from the inputs.",
    "hint": "It is what we want the model to output."
   },
   {
    "id": "code-L5-q7",
    "q": "A function calls itself with a smaller version of the same problem and stops when it reaches a base case. What is this technique called?",
    "options": [
     "Abstraction",
     "Compilation",
     "Iteration",
     "Recursion"
    ],
    "answer": 3,
    "why": "A function that calls itself, with a base case to stop, is recursive.",
    "hint": "The function appears in its own definition."
   },
   {
    "id": "code-L5-q8",
    "q": "A web browser shows a padlock and 'https' before a web address. What does this mainly indicate?",
    "options": [
     "Traffic is encrypted using TLS",
     "The site is guaranteed trustworthy",
     "The page contains no malware",
     "The site is hosted on a private network"
    ],
    "answer": 0,
    "why": "HTTPS uses TLS to encrypt traffic; it does not by itself prove the site is honest or safe.",
    "hint": "Think about what the 's' adds to HTTP."
   },
   {
    "id": "code-L5-q9",
    "q": "Two programs solve the same problem. Program A takes time proportional to n, program B to n squared. As n grows large, which statement is correct?",
    "options": [
     "A is faster only for small n",
     "A scales better because its growth is slower",
     "B scales better because squaring is efficient",
     "Both take the same time for large n"
    ],
    "answer": 1,
    "why": "Linear growth is slower than quadratic growth, so A outperforms B as n becomes large.",
    "hint": "Compare how each time grows as the input grows."
   },
   {
    "id": "code-L5-q10",
    "q": "A network sends a 6 MB file over a link of 24 Mbps. Ignoring overheads, roughly how long does the transfer take?",
    "options": [
     "12 seconds",
     "2 seconds",
     "0.25 seconds",
     "4 seconds"
    ],
    "answer": 1,
    "why": "6 MB = 48 Mbit; 48 / 24 = 2 seconds.",
    "hint": "Convert megabytes to megabits before dividing by the rate."
   },
   {
    "id": "code-L5-q11",
    "q": "A password is stored as a hash rather than plain text. Why does this improve security if the database is stolen?",
    "options": [
     "The hash encrypts the whole database",
     "The hash changes every time it is read",
     "The hash cannot easily be reversed to the password",
     "The hash is shorter than the password"
    ],
    "answer": 2,
    "why": "A good hash is one-way, so attackers cannot recover the original passwords directly from it.",
    "hint": "Think about which direction a hash function is easy to compute."
   }
  ],
  "truths": [
   {
    "id": "code-L5-t1",
    "s": "In two's complement, an 8-bit value with its most significant bit set to 1 represents a negative number.",
    "answer": true,
    "why": "The sign bit is the most significant bit in two's complement."
   },
   {
    "id": "code-L5-t2",
    "s": "A compiler translates a program line by line and runs it immediately, without producing a separate executable.",
    "answer": false,
    "why": "That describes an interpreter; a compiler translates the whole program before it runs."
   },
   {
    "id": "code-L5-t3",
    "s": "In a relational database, a primary key may contain duplicate values as long as the rows differ elsewhere.",
    "answer": false,
    "why": "A primary key must be unique for every row."
   },
   {
    "id": "code-L5-t4",
    "s": "The Domain Name System (DNS) translates domain names such as example.org into IP addresses.",
    "answer": true,
    "why": "DNS resolves human-readable names to numeric IP addresses."
   },
   {
    "id": "code-L5-t5",
    "s": "RAM is non-volatile memory, so its contents are kept when the computer is switched off.",
    "answer": false,
    "why": "RAM is volatile; its contents are lost when power is removed."
   },
   {
    "id": "code-L5-t6",
    "s": "A stack removes the most recently added item first.",
    "answer": true,
    "why": "A stack is last in, first out."
   },
   {
    "id": "code-L5-t7",
    "s": "Public-key cryptography uses the same single key for both encryption and decryption.",
    "answer": false,
    "why": "Public-key cryptography uses a key pair: a public key and a private key."
   },
   {
    "id": "code-L5-t8",
    "s": "In a colour image, a pixel is a single point of colour in the grid that makes up the image.",
    "answer": true,
    "why": "Pixels are the smallest addressable picture elements in a raster image."
   },
   {
    "id": "code-L5-t9",
    "s": "An operating system's scheduler decides which process runs on the CPU at a given time.",
    "answer": true,
    "why": "Scheduling allocates CPU time among ready processes."
   },
   {
    "id": "code-L5-t10",
    "s": "In machine learning, overfitting means a model performs equally well on training data and on new, unseen data.",
    "answer": false,
    "why": "Overfitting is fitting the training data too closely and generalising poorly to new data."
   },
   {
    "id": "code-L5-t11",
    "s": "The binary number 1011 equals the decimal number 11.",
    "answer": true,
    "why": "8 + 2 + 1 = 11."
   },
   {
    "id": "code-L5-t12",
    "s": "A denial-of-service attack aims to make a service unavailable to its legitimate users.",
    "answer": true,
    "why": "DoS attacks flood or exhaust resources so normal users cannot access the service."
   },
   {
    "id": "code-L5-t13",
    "s": "A solid-state drive (SSD) stores data by magnetising spinning platters.",
    "answer": false,
    "why": "SSDs use flash memory; magnetised spinning platters describe a hard disk drive."
   },
   {
    "id": "code-L5-t14",
    "s": "In a flowchart, a parallelogram is conventionally used to show input or output.",
    "answer": true,
    "why": "Parallelograms denote input/output; diamonds denote decisions."
   },
   {
    "id": "code-L5-t15",
    "s": "Lossless compression reduces file size by permanently discarding some of the original data.",
    "answer": false,
    "why": "Lossless compression keeps all data and allows exact reconstruction; discarding data is lossy."
   },
   {
    "id": "code-L5-t16",
    "s": "An IPv4 address is 32 bits long.",
    "answer": true,
    "why": "IPv4 uses 32-bit addresses, commonly written as four decimal octets."
   },
   {
    "id": "code-L5-t17",
    "s": "A logic gate AND outputs 1 only when both of its inputs are 1.",
    "answer": true,
    "why": "AND requires all inputs to be true to output true."
   },
   {
    "id": "code-L5-t18",
    "s": "The halting problem has been solved: a general program can always decide whether any other program will halt.",
    "answer": false,
    "why": "The halting problem is undecidable for general programs, as Turing proved."
   }
  ],
  "terms": [
   {
    "id": "code-L5-w1",
    "word": "COMPILER",
    "clue": "Translates a whole high-level program into machine code before it runs."
   },
   {
    "id": "code-L5-w2",
    "word": "PROTOCOL",
    "clue": "Agreed set of rules governing how devices exchange data on a network."
   },
   {
    "id": "code-L5-w3",
    "word": "FIREWALL",
    "clue": "Filters network traffic according to a set of security rules."
   },
   {
    "id": "code-L5-w4",
    "word": "RECURSION",
    "clue": "A function solving a problem by calling a smaller version of itself."
   },
   {
    "id": "code-L5-w5",
    "word": "VARIABLE",
    "clue": "Named storage location whose value can change while a program runs."
   },
   {
    "id": "code-L5-w6",
    "word": "ENCRYPTION",
    "clue": "Scrambling data so only authorised parties can read it."
   },
   {
    "id": "code-L5-w7",
    "word": "DATABASE",
    "clue": "Organised collection of data that can be queried and updated."
   },
   {
    "id": "code-L5-w8",
    "word": "ALGORITHM",
    "clue": "Finite step-by-step procedure for solving a problem."
   },
   {
    "id": "code-L5-w9",
    "word": "BANDWIDTH",
    "clue": "Maximum rate at which data can be carried by a connection."
   }
  ]
 },
 "6": {
  "questions": [
   {
    "id": "code-L6-q1",
    "q": "A program stores the decimal number -5 using 8-bit two's complement. What is the resulting bit pattern?",
    "options": [
     "10000101",
     "11111010",
     "11111011",
     "00000101"
    ],
    "answer": 2,
    "why": "In two's complement, -5 is the bitwise inverse of 5 (00000101) plus one, giving 11111011.",
    "hint": "Invert the positive value's bits, then add one."
   },
   {
    "id": "code-L6-q2",
    "q": "In a relational database, which property must a candidate key satisfy?",
    "options": [
     "It must be a numeric data type",
     "Its values must be unique and non-null for every row",
     "It must be the first column of the table",
     "It may contain duplicate values if indexed"
    ],
    "answer": 1,
    "why": "A candidate key uniquely identifies each row and cannot contain nulls; any such key may become the primary key.",
    "hint": "Think about what guarantees one row can be singled out."
   },
   {
    "id": "code-L6-q3",
    "q": "A TCP connection uses a three-way handshake. What is the correct order of the segments exchanged?",
    "options": [
     "SYN, SYN-ACK, ACK",
     "SYN-ACK, SYN, ACK",
     "SYN, ACK, SYN-ACK",
     "ACK, SYN, SYN-ACK"
    ],
    "answer": 0,
    "why": "The client sends SYN, the server replies SYN-ACK, and the client completes with ACK.",
    "hint": "The server both acknowledges and synchronises in its single reply."
   },
   {
    "id": "code-L6-q4",
    "q": "A hash table with 100 buckets stores 200 keys using separate chaining. What is the load factor?",
    "options": [
     "2",
     "0.5",
     "100",
     "200"
    ],
    "answer": 0,
    "why": "Load factor is the number of entries divided by the number of buckets: 200/100 = 2.",
    "hint": "Divide stored items by available buckets."
   },
   {
    "id": "code-L6-q5",
    "q": "Which statement about public-key cryptography is correct?",
    "options": [
     "Both keys must be kept secret by the sender",
     "The same key is used for encryption and decryption by both parties",
     "The private key encrypts and the public key decrypts, keeping messages secret",
     "The public key encrypts and only the matching private key decrypts"
    ],
    "answer": 3,
    "why": "In asymmetric encryption the public key is shared for encryption while the private key remains secret for decryption.",
    "hint": "One key is deliberately published; the other never leaves its owner."
   },
   {
    "id": "code-L6-q6",
    "q": "A recursive function lacks a correct base case. What is the most likely consequence at run time?",
    "options": [
     "A stack overflow from unbounded recursive calls",
     "The loop counter overflows",
     "The program returns zero silently",
     "The compiler rejects the code"
    ],
    "answer": 0,
    "why": "Without a terminating base case, calls keep pushing frames until the call stack is exhausted.",
    "hint": "Each call consumes a fixed area of memory."
   },
   {
    "id": "code-L6-q7",
    "q": "In a binary search tree, which traversal visits nodes in ascending key order?",
    "options": [
     "Level-order",
     "Pre-order",
     "Post-order",
     "In-order"
    ],
    "answer": 3,
    "why": "In-order traversal (left, root, right) yields sorted order for a binary search tree.",
    "hint": "Visit the left subtree, then the node, then the right."
   },
   {
    "id": "code-L6-q8",
    "q": "Which statement best describes the halting problem?",
    "options": [
     "No algorithm can decide, for every program and input, whether it terminates",
     "It can be solved for all programs given enough time",
     "It is solvable only for programs written in Python",
     "It asks whether a program uses too much memory"
    ],
    "answer": 0,
    "why": "Turing proved the halting problem undecidable: no general algorithm can answer it for all program-input pairs.",
    "hint": "Think about a proven limit on what any algorithm can decide."
   },
   {
    "id": "code-L6-q9",
    "q": "A model achieves 99% accuracy on training data but only 60% on unseen test data. What is this an example of?",
    "options": [
     "Overfitting",
     "Underfitting",
     "Data normalisation",
     "Regularisation"
    ],
    "answer": 0,
    "why": "Overfitting occurs when a model memorises training data and generalises poorly to new examples.",
    "hint": "The model has learned the training set too specifically."
   },
   {
    "id": "code-L6-q10",
    "q": "A web server must handle many simultaneous connections without a thread per connection. Which technique is most appropriate?",
    "options": [
     "Blocking sockets with one process per request",
     "Sequential request handling with a global lock",
     "Event-driven non-blocking I/O with a select or epoll loop",
     "Synchronous polling with fixed sleeps"
    ],
    "answer": 2,
    "why": "Event-driven I/O multiplexes many connections on one thread, avoiding the cost of a thread per connection.",
    "hint": "One loop watches many file descriptors for readiness."
   },
   {
    "id": "code-L6-q11",
    "q": "Which SQL clause is used to filter groups produced by GROUP BY?",
    "options": [
     "LIMIT",
     "HAVING",
     "WHERE",
     "ORDER BY"
    ],
    "answer": 1,
    "why": "HAVING applies conditions to aggregated groups, whereas WHERE filters individual rows before grouping.",
    "hint": "WHERE runs before grouping; this clause runs after."
   },
   {
    "id": "code-L6-q12",
    "q": "Which statement about symmetric encryption is correct?",
    "options": [
     "The same secret key encrypts and decrypts the data",
     "The sender and receiver use different keys",
     "The key may be published freely",
     "It cannot be combined with hashing"
    ],
    "answer": 0,
    "why": "Symmetric algorithms such as AES use one shared secret key for both encryption and decryption.",
    "hint": "One key serves both directions of the conversation."
   }
  ],
  "truths": [
   {
    "id": "code-L6-t1",
    "s": "A stack is a first-in, first-out data structure.",
    "answer": false,
    "why": "A stack is last-in, first-out; a queue is first-in, first-out."
   },
   {
    "id": "code-L6-t2",
    "s": "In two's complement, an 8-bit signed integer can represent values from -128 to 127.",
    "answer": true,
    "why": "The range of an n-bit signed two's complement integer is -2^(n-1) to 2^(n-1)-1."
   },
   {
    "id": "code-L6-t3",
    "s": "A compiler translates source code into machine code before the program is executed.",
    "answer": true,
    "why": "Compilation produces an executable ahead of run time, unlike interpretation."
   },
   {
    "id": "code-L6-t4",
    "s": "A router forwards packets between different networks using IP addresses.",
    "answer": true,
    "why": "Routers operate at the network layer and choose paths based on IP addressing."
   },
   {
    "id": "code-L6-t5",
    "s": "In a relational database, a foreign key must be unique within its table.",
    "answer": false,
    "why": "A foreign key may repeat; it references a candidate key but need not be unique itself."
   },
   {
    "id": "code-L6-t6",
    "s": "HTTPS encrypts the content of web traffic using TLS.",
    "answer": true,
    "why": "HTTPS is HTTP carried over a TLS-encrypted connection."
   },
   {
    "id": "code-L6-t7",
    "s": "A depth-first search of a graph always finds the shortest path in terms of edge count.",
    "answer": false,
    "why": "Breadth-first search guarantees shortest edge-count paths; DFS does not."
   },
   {
    "id": "code-L6-t8",
    "s": "In supervised learning, the training data includes the correct output labels.",
    "answer": true,
    "why": "Supervised learning learns a mapping from labelled input-output pairs."
   },
   {
    "id": "code-L6-t9",
    "s": "A binary search can be applied to any list, whether or not it is sorted.",
    "answer": false,
    "why": "Binary search requires the data to be sorted so half can be discarded each step."
   },
   {
    "id": "code-L6-t10",
    "s": "The decimal number 255 is represented as 11111111 in 8-bit binary.",
    "answer": true,
    "why": "Eight 1s sum to 128+64+32+16+8+4+2+1 = 255."
   },
   {
    "id": "code-L6-t11",
    "s": "A firewall can prevent all malware from entering a network.",
    "answer": false,
    "why": "Firewalls filter traffic but cannot guarantee protection against every threat, such as infected email attachments."
   },
   {
    "id": "code-L6-t12",
    "s": "TCP provides reliable, ordered delivery of a byte stream.",
    "answer": true,
    "why": "TCP uses acknowledgements and sequence numbers to ensure ordered, reliable delivery."
   },
   {
    "id": "code-L6-t13",
    "s": "In an operating system, virtual memory lets a process use more address space than physical RAM.",
    "answer": true,
    "why": "Paging allows parts of a process to reside on disk, extending the apparent memory."
   },
   {
    "id": "code-L6-t14",
    "s": "A Boolean expression using AND is true only when both operands are true.",
    "answer": true,
    "why": "AND requires both operands to be true for the result to be true."
   },
   {
    "id": "code-L6-t15",
    "s": "Quicksort has a worst-case time complexity of O(n log n).",
    "answer": false,
    "why": "Quicksort's worst case is O(n^2), for example with already sorted input and poor pivot choice."
   },
   {
    "id": "code-L6-t16",
    "s": "Hashing passwords with a salt makes identical passwords produce different stored hashes.",
    "answer": true,
    "why": "A unique salt per user changes the hash input, so equal passwords yield different hashes."
   },
   {
    "id": "code-L6-t17",
    "s": "SQL is a Turing-complete general-purpose programming language.",
    "answer": false,
    "why": "Standard SQL is declarative and not Turing-complete without extensions such as stored procedures."
   },
   {
    "id": "code-L6-t18",
    "s": "A deadlock occurs when two or more processes each wait for a resource held by another.",
    "answer": true,
    "why": "Circular waiting for held resources is the classic condition for deadlock."
   }
  ],
  "terms": [
   {
    "id": "code-L6-w1",
    "word": "RECURSION",
    "clue": "A function solving a problem by calling itself on smaller inputs"
   },
   {
    "id": "code-L6-w2",
    "word": "COMPILER",
    "clue": "Translates high-level source code into machine code before running"
   },
   {
    "id": "code-L6-w3",
    "word": "ALGORITHM",
    "clue": "A finite step-by-step procedure for solving a problem"
   },
   {
    "id": "code-L6-w4",
    "word": "DATABASE",
    "clue": "An organised collection of structured data stored for retrieval"
   },
   {
    "id": "code-L6-w5",
    "word": "FIREWALL",
    "clue": "Filters network traffic according to security rules"
   },
   {
    "id": "code-L6-w6",
    "word": "OVERFITTING",
    "clue": "A model memorises training data and generalises poorly"
   },
   {
    "id": "code-L6-w7",
    "word": "ENCRYPTION",
    "clue": "Converts readable data into ciphertext using a key"
   },
   {
    "id": "code-L6-w8",
    "word": "POINTERS",
    "clue": "Variables that store memory addresses of other values"
   },
   {
    "id": "code-L6-w9",
    "word": "THROUGHPUT",
    "clue": "The actual rate of data successfully transferred over a link"
   }
  ]
 },
 "7": {
  "questions": [
   {
    "id": "code-L7-q1",
    "q": "A hash table uses open addressing with linear probing and a load factor of 0.75. Two keys hash to the same initial bucket. What happens when the second key is inserted?",
    "options": [
     "It overwrites the first key",
     "It is placed in the next free bucket",
     "It is stored in a linked list at that bucket",
     "The table is resized immediately"
    ],
    "answer": 1,
    "why": "Linear probing resolves collisions by scanning forward to the next empty slot; chaining (not probing) uses linked lists.",
    "hint": "Think about what 'probing' means in the name."
   },
   {
    "id": "code-L7-q2",
    "q": "An algorithm makes 2n^2 + 5n + 3 comparisons. Which complexity class does it belong to?",
    "options": [
     "O(n^2)",
     "O(n log n)",
     "O(2^n)",
     "O(n)"
    ],
    "answer": 0,
    "why": "The dominant term as n grows is n^2, so the algorithm is O(n^2).",
    "hint": "Keep only the fastest-growing term and drop constants."
   },
   {
    "id": "code-L7-q3",
    "q": "A subnet mask is 255.255.255.192. How many usable host addresses does a subnet have?",
    "options": [
     "64",
     "126",
     "30",
     "62"
    ],
    "answer": 3,
    "why": "192 leaves 6 host bits, giving 64 addresses; two are reserved for network and broadcast, leaving 62 usable.",
    "hint": "Subtract the two reserved addresses from the block size."
   },
   {
    "id": "code-L7-q4",
    "q": "In a database, a transaction transfers £100 from account A to account B. The debit succeeds but the credit fails. Which ACID property prevents the debit from persisting?",
    "options": [
     "Consistency",
     "Atomicity",
     "Isolation",
     "Durability"
    ],
    "answer": 1,
    "why": "Atomicity ensures a transaction is all-or-nothing, so a partial transfer is rolled back.",
    "hint": "It is about treating the transaction as a single indivisible unit."
   },
   {
    "id": "code-L7-q5",
    "q": "In machine learning, a model performs very well on training data but poorly on new data. What is this called?",
    "options": [
     "Underfitting",
     "Regularisation",
     "Normalisation",
     "Overfitting"
    ],
    "answer": 3,
    "why": "Overfitting means the model has memorised training noise and fails to generalise; regularisation is a remedy, not the problem.",
    "hint": "The model has learned the training set too specifically."
   },
   {
    "id": "code-L7-q6",
    "q": "A process is waiting for a resource held by another process, which is itself waiting for a resource held by the first. What is this situation called?",
    "options": [
     "Paging",
     "Deadlock",
     "Thrashing",
     "Starvation"
    ],
    "answer": 1,
    "why": "A circular wait among processes for held resources is a deadlock; starvation is indefinite postponement without a cycle.",
    "hint": "The key feature is a cycle of waiting."
   },
   {
    "id": "code-L7-q7",
    "q": "A binary tree has 15 nodes and is perfectly balanced (full at every level). What is its height in edges?",
    "options": [
     "15",
     "5",
     "4",
     "3"
    ],
    "answer": 3,
    "why": "A perfect tree of height h has 2^(h+1)-1 nodes; 15 nodes gives h=3.",
    "hint": "Count the levels and subtract one for edges."
   },
   {
    "id": "code-L7-q8",
    "q": "Which statement about the P versus NP problem is correct?",
    "options": [
     "It asks whether all algorithms terminate",
     "It asks whether every problem whose solution can be checked quickly can also be solved quickly",
     "It has been proved that P equals NP",
     "It concerns only problems that cannot be solved at all"
    ],
    "answer": 1,
    "why": "P vs NP asks whether efficient verifiability implies efficient solvability; it remains open.",
    "hint": "Focus on the difference between checking and solving."
   },
   {
    "id": "code-L7-q9",
    "q": "Which of these best describes the role of the Memory Management Unit (MMU) in a modern computer?",
    "options": [
     "It stores the contents of recently used files",
     "It translates virtual addresses to physical addresses",
     "It holds the machine code of running programs",
     "It schedules threads onto processor cores"
    ],
    "answer": 1,
    "why": "The MMU uses page tables to map virtual addresses to physical addresses and enforces access permissions.",
    "hint": "Think about what happens between a program's address space and actual RAM chips."
   },
   {
    "id": "code-L7-q10",
    "q": "A program stores the decimal number 200 in an 8-bit unsigned register. What is its binary representation?",
    "options": [
     "10101000",
     "11100000",
     "11000100",
     "11001000"
    ],
    "answer": 3,
    "why": "128 + 64 + 8 = 200, giving 11001000 in 8 bits.",
    "hint": "Split 200 into powers of two: 128, then what remains?"
   },
   {
    "id": "code-L7-q11",
    "q": "In a binary search tree, which traversal visits the nodes in ascending key order?",
    "options": [
     "Pre-order",
     "Post-order",
     "Level-order",
     "In-order"
    ],
    "answer": 3,
    "why": "In-order traversal visits left subtree, node, then right subtree, which yields sorted order for a BST.",
    "hint": "Consider visiting the left subtree fully before the node itself."
   },
   {
    "id": "code-L7-q12",
    "q": "A hash table has 50 buckets and stores 150 keys using separate chaining. What is the load factor?",
    "options": [
     "0.33",
     "1.5",
     "50",
     "3"
    ],
    "answer": 3,
    "why": "Load factor is the number of keys divided by the number of buckets: 150/50 = 3.",
    "hint": "It is stored items divided by available buckets."
   }
  ],
  "truths": [
   {
    "id": "code-L7-t1",
    "s": "In two's complement, an 8-bit signed integer can represent values from -128 to 127.",
    "answer": true,
    "why": "The range is -2^7 to 2^7-1, i.e. -128 to 127."
   },
   {
    "id": "code-L7-t2",
    "s": "A binary search can be applied directly to any unsorted list.",
    "answer": false,
    "why": "Binary search requires the data to be sorted so it can discard half each step."
   },
   {
    "id": "code-L7-t3",
    "s": "In a relational database, a foreign key must contain values that exist in the referenced primary key (or be null).",
    "answer": true,
    "why": "Referential integrity enforces that foreign keys match existing parent keys unless null."
   },
   {
    "id": "code-L7-t4",
    "s": "Symmetric encryption uses a different key for encryption and decryption.",
    "answer": false,
    "why": "Symmetric encryption uses the same key for both; public-key cryptography uses a key pair."
   },
   {
    "id": "code-L7-t5",
    "s": "The time complexity of merging two sorted lists of total length n is O(n).",
    "answer": true,
    "why": "Merge scans each element once, giving linear time."
   },
   {
    "id": "code-L7-t6",
    "s": "A virtual memory system allows a program to use more memory than the physical RAM installed.",
    "answer": true,
    "why": "Paging moves data between RAM and disk to extend the address space."
   },
   {
    "id": "code-L7-t7",
    "s": "In TCP, the three-way handshake begins with the server sending a SYN segment.",
    "answer": false,
    "why": "The client initiates with SYN; the server replies with SYN-ACK."
   },
   {
    "id": "code-L7-t8",
    "s": "A quicksort's worst-case time complexity is O(n^2).",
    "answer": true,
    "why": "Poor pivots on already sorted data degrade quicksort to quadratic time."
   },
   {
    "id": "code-L7-t9",
    "s": "An operating system kernel always runs in user mode to protect hardware.",
    "answer": false,
    "why": "The kernel runs in privileged (kernel) mode; user programs run in user mode."
   },
   {
    "id": "code-L7-t10",
    "s": "In public-key cryptography, a message encrypted with a recipient's public key can only be decrypted with their private key.",
    "answer": true,
    "why": "The key pair is asymmetric, so only the matching private key decrypts."
   },
   {
    "id": "code-L7-t11",
    "s": "A DDoS attack typically aims to make a service unavailable by flooding it with traffic from many sources.",
    "answer": true,
    "why": "Distributed denial of service overwhelms a target using many compromised hosts."
   },
   {
    "id": "code-L7-t12",
    "s": "A primary key in a relational table may contain duplicate values.",
    "answer": false,
    "why": "A primary key must be unique and non-null for every row."
   },
   {
    "id": "code-L7-t13",
    "s": "Depth-first search uses a stack (or recursion) to explore as far as possible before backtracking.",
    "answer": true,
    "why": "DFS follows one branch deeply, using a stack or call stack to backtrack."
   },
   {
    "id": "code-L7-t14",
    "s": "In a normalised database, storing the same customer address in every order row is an example of good design.",
    "answer": false,
    "why": "That is redundancy, which normalisation aims to remove by storing it once."
   },
   {
    "id": "code-L7-t15",
    "s": "A Turing machine with a finite tape is less powerful than one with an unbounded tape.",
    "answer": true,
    "why": "A finite tape limits it to a finite automaton; unbounded tape gives full Turing power."
   },
   {
    "id": "code-L7-t16",
    "s": "In machine learning, a confusion matrix summarises predicted versus actual class labels.",
    "answer": true,
    "why": "It tabulates true/false positives and negatives across classes."
   },
   {
    "id": "code-L7-t17",
    "s": "A compiler translates source code into machine code line by line as it runs.",
    "answer": false,
    "why": "That describes an interpreter; a compiler translates the whole program before execution."
   },
   {
    "id": "code-L7-t18",
    "s": "IPv6 addresses are 128 bits long.",
    "answer": true,
    "why": "IPv6 uses 128-bit addresses, compared with 32 bits in IPv4."
   }
  ],
  "terms": [
   {
    "id": "code-L7-w1",
    "word": "RECURSION",
    "clue": "A technique where a routine solves a problem by calling itself on smaller inputs."
   },
   {
    "id": "code-L7-w2",
    "word": "COMPILER",
    "clue": "A program that translates all of a high-level source file into machine code before running."
   },
   {
    "id": "code-L7-w3",
    "word": "ENCRYPTION",
    "clue": "The process of scrambling data so that only authorised parties can read it."
   },
   {
    "id": "code-L7-w4",
    "word": "OVERFITTING",
    "clue": "When a model learns training noise and generalises poorly to new examples."
   },
   {
    "id": "code-L7-w5",
    "word": "COMPLEXITY",
    "clue": "A measure of how an algorithm's resource use grows with input size."
   },
   {
    "id": "code-L7-w6",
    "word": "PROTOCOL",
    "clue": "An agreed set of rules governing how devices exchange data on a network."
   },
   {
    "id": "code-L7-w7",
    "word": "INTERPRETER",
    "clue": "A program that executes source code directly, statement by statement, without prior compilation."
   },
   {
    "id": "code-L7-w8",
    "word": "TRAVERSAL",
    "clue": "The systematic visiting of every node in a tree or graph data structure."
   },
   {
    "id": "code-L7-w9",
    "word": "PAGETABLE",
    "clue": "Structure mapping virtual addresses to physical frames in memory"
   }
  ]
 },
 "8": {
  "questions": [
   {
    "id": "code-L8-q1",
    "q": "A hash table with 100 buckets stores 200 keys using separate chaining. What is the load factor?",
    "options": [
     "0.2",
     "200",
     "2.0",
     "1.0",
     "0.5"
    ],
    "answer": 2,
    "why": "Load factor equals number of keys divided by number of buckets, so 200 / 100 = 2.0.",
    "hint": "Divide the number of stored keys by the number of buckets."
   },
   {
    "id": "code-L8-q2",
    "q": "A subnet mask is 255.255.255.192. How many usable host addresses does each subnet have?",
    "options": [
     "192",
     "126",
     "30",
     "64",
     "62"
    ],
    "answer": 4,
    "why": "The mask 255.255.255.192 leaves 6 host bits, giving 2^6 - 2 = 62 usable addresses after removing network and broadcast.",
    "hint": "Count the zero bits in the last octet, then remove two reserved addresses."
   },
   {
    "id": "code-L8-q3",
    "q": "A TCP connection uses a three-way handshake. What is the correct order of segments exchanged?",
    "options": [
     "SYN-ACK, SYN, ACK",
     "SYN, SYN-ACK, ACK",
     "SYN, ACK, ACK",
     "ACK, SYN, SYN-ACK",
     "SYN, ACK, SYN-ACK"
    ],
    "answer": 1,
    "why": "The client sends SYN, the server replies SYN-ACK, and the client completes with ACK.",
    "hint": "The server both acknowledges and synchronises in its single reply."
   },
   {
    "id": "code-L8-q4",
    "q": "A recursive function lacks a correct base case. What is the most likely consequence at run time?",
    "options": [
     "It returns zero",
     "It throws a syntax error",
     "It compiles but loops forever or overflows the stack",
     "It automatically becomes iterative",
     "It uses no stack memory"
    ],
    "answer": 2,
    "why": "Without a base case, recursion never terminates and typically causes stack overflow or infinite recursion.",
    "hint": "Consider what happens to the call stack when recursion never stops."
   },
   {
    "id": "code-L8-q5",
    "q": "A process is waiting for a resource held by another process, which is itself waiting for a resource held by the first. This situation is called what?",
    "options": [
     "Deadlock",
     "Starvation",
     "Thrashing",
     "Spooling",
     "Paging"
    ],
    "answer": 0,
    "why": "A circular wait among processes for held resources is the classic definition of deadlock.",
    "hint": "Each process holds one resource and waits for another in a cycle."
   },
   {
    "id": "code-L8-q6",
    "q": "A model achieves 99% accuracy on training data but only 60% on unseen test data. What is the best description of this problem?",
    "options": [
     "Data leakage",
     "Normalisation",
     "Underfitting",
     "Overfitting",
     "Regularisation"
    ],
    "answer": 3,
    "why": "Large gap between training and test performance indicates overfitting to the training set.",
    "hint": "The model memorised the training data rather than generalising."
   },
   {
    "id": "code-L8-q7",
    "q": "A password is stored as a hash rather than plain text. Why does this improve security if the database is stolen?",
    "options": [
     "Hashing encrypts the whole database",
     "The attacker cannot directly read the passwords and must crack the hashes",
     "Hashing prevents SQL injection",
     "Hashes are reversible, so passwords can be recovered",
     "Hashes make passwords shorter"
    ],
    "answer": 1,
    "why": "A cryptographic hash is one-way, so a stolen database exposes only hash values that must be cracked, not plaintext passwords.",
    "hint": "Consider what a stolen database reveals when it holds only one-way digests."
   },
   {
    "id": "code-L8-q8",
    "q": "Which of these best describes the role of the Memory Management Unit (MMU) in a modern computer?",
    "options": [
     "It routes packets between networks",
     "It schedules threads on the CPU",
     "It stores the BIOS firmware",
     "It compresses files on disk",
     "It translates virtual addresses to physical addresses"
    ],
    "answer": 4,
    "why": "The MMU performs address translation using page tables and enforces memory protection.",
    "hint": "Think about the hardware that maps virtual memory to physical memory."
   },
   {
    "id": "code-L8-q9",
    "q": "A binary tree has 15 nodes and is perfectly balanced, full at every level. What is its height in edges?",
    "options": [
     "4",
     "7",
     "3",
     "15",
     "5"
    ],
    "answer": 2,
    "why": "A perfect binary tree with 15 nodes has 4 levels, so its height in edges is 3.",
    "hint": "A full tree of height h has 2^(h+1) - 1 nodes."
   },
   {
    "id": "code-L8-q10",
    "q": "A hash table with 1000 slots uses open addressing with linear probing and currently holds 800 keys. What is the main performance consequence compared with a load factor of 0.5?",
    "options": [
     "Lookups become constant time",
     "Shorter probe sequences on average",
     "Longer average probe sequences and clustering",
     "The table automatically resizes",
     "Fewer collisions in every case"
    ],
    "answer": 2,
    "why": "With linear probing, high load factor increases clustering, so unsuccessful and successful searches need more probes on average.",
    "hint": "Think about how occupied slots affect probe runs."
   },
   {
    "id": "code-L8-q11",
    "q": "An algorithm's running time is T(n) = 3n log2 n + 2n. Which complexity class best describes it?",
    "options": [
     "O(n)",
     "O(n log n)",
     "O(log n)",
     "O(n^2)",
     "O(2^n)"
    ],
    "answer": 1,
    "why": "The dominant term is 3n log2 n, so T(n) is Θ(n log n).",
    "hint": "Compare growth rates of n and n log n."
   },
   {
    "id": "code-L8-q12",
    "q": "A TCP connection is being established. Which sequence of flag combinations is correct for the three-way handshake?",
    "options": [
     "SYN, ACK, SYN-ACK",
     "SYN, SYN-ACK, ACK",
     "SYN, FIN, ACK",
     "SYN-ACK, SYN, ACK",
     "ACK, SYN, SYN-ACK"
    ],
    "answer": 1,
    "why": "The client sends SYN, the server replies SYN-ACK, and the client completes with ACK.",
    "hint": "The server acknowledges the client's initial sequence number."
   },
   {
    "id": "code-L8-q13",
    "q": "A hash table uses open addressing with linear probing and has a load factor of 0.75. Two keys hash to the same bucket. What happens when the second key is inserted?",
    "options": [
     "It replaces the existing key",
     "It probes the next free slot",
     "It is stored in a chain",
     "It causes a rehash at once",
     "It is rejected as a duplicate"
    ],
    "answer": 1,
    "why": "Linear probing resolves collisions by scanning forward from the home bucket to the next empty slot. Separate chaining uses linked lists, but open addressing never chains.",
    "hint": "Open addressing keeps everything inside the array itself."
   },
   {
    "id": "code-L8-q14",
    "q": "A subnet mask of 255.255.255.192 is used. How many usable host addresses does each subnet have?",
    "options": [
     "254",
     "126",
     "30",
     "62",
     "64"
    ],
    "answer": 3,
    "why": "The mask leaves 6 host bits (64 addresses per subnet); subtracting the network and broadcast addresses gives 62 usable hosts.",
    "hint": "Count the host bits left by the mask, then remove two addresses."
   },
   {
    "id": "code-L8-q15",
    "q": "A transaction transfers £100 from account A to account B. The debit succeeds but the system crashes before the credit. Which ACID property ensures the debit is undone on recovery?",
    "options": [
     "Normalisation",
     "Durability",
     "Atomicity",
     "Isolation",
     "Consistency"
    ],
    "answer": 2,
    "why": "Atomicity requires a transaction to be all-or-nothing, so a partial transfer is rolled back. Durability concerns committed data surviving crashes, not undoing partial work.",
    "hint": "Think 'all or nothing' rather than 'survives a crash'."
   },
   {
    "id": "code-L8-q16",
    "q": "A model scores 99% on training data but only 60% on unseen test data. Which term best describes this gap?",
    "options": [
     "Underfitting",
     "Gradient descent",
     "Overfitting",
     "Regularisation",
     "Normalisation"
    ],
    "answer": 2,
    "why": "Overfitting is when a model fits training noise so well that it generalises poorly to new data. Underfitting would show poor performance on both sets.",
    "hint": "The model has memorised the training set rather than learned general patterns."
   }
  ],
  "truths": [
   {
    "id": "code-L8-t1",
    "s": "In two's complement, an 8-bit representation of -1 is 11111111.",
    "answer": true,
    "why": "Negating 00000001 gives 11111111 in two's complement."
   },
   {
    "id": "code-L8-t2",
    "s": "A compiler always produces faster machine code than an interpreter, regardless of implementation.",
    "answer": false,
    "why": "Performance depends on implementation and JIT techniques; compiled code is not always faster."
   },
   {
    "id": "code-L8-t3",
    "s": "The halting problem is undecidable for general Turing machines.",
    "answer": true,
    "why": "Turing proved no general algorithm can decide halting for all program-input pairs."
   },
   {
    "id": "code-L8-t4",
    "s": "In a relational database, a foreign key must be unique within its table.",
    "answer": false,
    "why": "Foreign keys may repeat; uniqueness is a property of primary or candidate keys, not foreign keys."
   },
   {
    "id": "code-L8-t5",
    "s": "Symmetric encryption uses the same secret key for both encryption and decryption.",
    "answer": true,
    "why": "Symmetric ciphers such as AES use one shared key for both operations."
   },
   {
    "id": "code-L8-t6",
    "s": "In a hash table with open addressing, the load factor must never exceed 1.",
    "answer": true,
    "why": "Open addressing stores at most one key per slot, so the load factor cannot exceed 1."
   },
   {
    "id": "code-L8-t7",
    "s": "The P versus NP problem asks whether every problem whose solution can be verified in polynomial time can also be solved in polynomial time.",
    "answer": true,
    "why": "That is the standard formulation of the P vs NP question."
   },
   {
    "id": "code-L8-t8",
    "s": "A binary search on a sorted array of 1000 elements needs at most about 100 comparisons in the worst case.",
    "answer": false,
    "why": "Binary search needs about log2(1000) ≈ 10 comparisons, not 100."
   },
   {
    "id": "code-L8-t9",
    "s": "In a binary search tree, the in-order traversal of a valid BST produces keys in ascending order.",
    "answer": true,
    "why": "In-order visits left subtree, node, right subtree, giving sorted order."
   },
   {
    "id": "code-L8-t10",
    "s": "In supervised learning, a model trained on labelled data always generalises well to unseen data.",
    "answer": false,
    "why": "Overfitting can cause poor generalisation despite good training performance."
   },
   {
    "id": "code-L8-t11",
    "s": "A three-way handshake in TCP establishes a connection before data transfer.",
    "answer": true,
    "why": "SYN, SYN-ACK, ACK synchronises sequence numbers and confirms both sides are ready."
   },
   {
    "id": "code-L8-t12",
    "s": "In paging, a page fault always indicates a program error.",
    "answer": false,
    "why": "Page faults occur routinely when pages are not resident in physical memory and are handled by the OS."
   },
   {
    "id": "code-L8-t13",
    "s": "The subnet mask 255.255.255.0 leaves 8 host bits, allowing 254 usable host addresses.",
    "answer": true,
    "why": "2^8 - 2 = 254 usable addresses after removing network and broadcast."
   },
   {
    "id": "code-L8-t14",
    "s": "A hash function used in a hash table must be collision-free for all possible keys.",
    "answer": false,
    "why": "Collisions are inevitable for large key spaces and are handled by chaining or probing."
   },
   {
    "id": "code-L8-t15",
    "s": "In two's complement, the 8-bit representation of -5 is 11111011.",
    "answer": true,
    "why": "5 is 00000101; invert to 11111010 and add 1 to get 11111011."
   },
   {
    "id": "code-L8-t16",
    "s": "A SQL INNER JOIN returns all rows from both tables, including unmatched rows padded with NULLs.",
    "answer": false,
    "why": "INNER JOIN returns only matching rows; outer joins include unmatched rows."
   },
   {
    "id": "code-L8-t17",
    "s": "A digital signature can provide integrity and authenticity but not confidentiality by itself.",
    "answer": true,
    "why": "Signatures verify origin and integrity; encryption is needed for confidentiality."
   },
   {
    "id": "code-L8-t18",
    "s": "In a max-heap, the smallest element is always at the root.",
    "answer": false,
    "why": "A max-heap has the largest element at the root; the smallest is not necessarily at any fixed position."
   }
  ],
  "terms": [
   {
    "id": "code-L8-w1",
    "word": "RECURSION",
    "clue": "A function solving a problem by calling itself on a smaller input"
   },
   {
    "id": "code-L8-w2",
    "word": "DEADLOCK",
    "clue": "Circular wait among processes for resources held by each other"
   },
   {
    "id": "code-L8-w3",
    "word": "OVERFITTING",
    "clue": "Model memorises training data and generalises poorly to new data"
   },
   {
    "id": "code-L8-w4",
    "word": "HASHING",
    "clue": "Mapping keys to bucket indices using a fixed function"
   },
   {
    "id": "code-L8-w5",
    "word": "COMPILER",
    "clue": "Translates source code into machine code before execution"
   },
   {
    "id": "code-L8-w6",
    "word": "TRANSACTION",
    "clue": "Database unit of work that must be atomic and consistent"
   },
   {
    "id": "code-L8-w7",
    "word": "ENCRYPTION",
    "clue": "Transforming data so only authorised parties can read it"
   },
   {
    "id": "code-L8-w8",
    "word": "POLYNOMIAL",
    "clue": "Complexity class of problems solvable in time bounded by a power of n"
   },
   {
    "id": "code-L8-w9",
    "word": "THROUGHPUT",
    "clue": "Amount of data actually transferred over a network per unit time"
   }
  ]
 },
 "9": {
  "questions": [
   {
    "id": "code-L9-q1",
    "q": "A hash table with 2000 slots uses open addressing with linear probing and currently holds 1500 keys. Roughly what is the expected number of probes for an unsuccessful search, using the standard approximation ½(1 + 1/(1−α)²)?",
    "options": [
     "about 2",
     "about 16",
     "about 4",
     "about 8",
     "about 9"
    ],
    "answer": 4,
    "why": "With α = 1500/2000 = 0.75, the formula gives ½(1 + 1/0.0625) = ½(17) = 8.5, so about 9 probes.",
    "hint": "Compute the load factor first, then square 1−α."
   },
   {
    "id": "code-L9-q2",
    "q": "An algorithm's running time satisfies T(n) = 3n log₂ n + 2n. Which complexity class best describes it?",
    "options": [
     "O(n log n)",
     "O(log n)",
     "O(n log² n)",
     "O(n)",
     "O(n²)"
    ],
    "answer": 0,
    "why": "The dominant term is 3n log₂ n, so T(n) = O(n log n); the linear term is asymptotically smaller.",
    "hint": "Compare growth of n log n against n."
   },
   {
    "id": "code-L9-q3",
    "q": "In a TCP connection establishment, which sequence of flag combinations is correct?",
    "options": [
     "SYN, then SYN-ACK, then ACK",
     "SYN-ACK, then SYN, then ACK",
     "SYN, then SYN, then ACK",
     "SYN, then ACK, then SYN-ACK",
     "ACK, then SYN, then SYN-ACK"
    ],
    "answer": 0,
    "why": "The client sends SYN, the server replies SYN-ACK, and the client completes with ACK.",
    "hint": "The server both acknowledges and proposes its own sequence number."
   },
   {
    "id": "code-L9-q4",
    "q": "A hash table uses open addressing with linear probing at load factor 0.75. Two keys hash to the same slot. What happens when the second key is inserted?",
    "options": [
     "It is placed in the next free slot after the occupied one",
     "It is placed in the slot before the occupied one",
     "It is rejected as a duplicate",
     "It overwrites the first key",
     "It is stored in a linked list at that slot"
    ],
    "answer": 0,
    "why": "Linear probing scans forward from the home slot to the first empty slot; chaining (not probing) would use a linked list.",
    "hint": "Probing means looking at successive slots, not making a chain."
   },
   {
    "id": "code-L9-q5",
    "q": "A subnet mask of 255.255.255.192 is used. How many usable host addresses does each subnet provide?",
    "options": [
     "126",
     "64",
     "62",
     "30",
     "254"
    ],
    "answer": 2,
    "why": "The mask leaves 6 host bits (256 − 192 = 64 addresses), and 64 − 2 = 62 usable after removing network and broadcast addresses.",
    "hint": "Count host bits, then subtract two reserved addresses."
   },
   {
    "id": "code-L9-q6",
    "q": "A transaction transfers £100 from account A to account B. The debit succeeds but the system crashes before the credit is written. Which ACID property ensures the debit is rolled back?",
    "options": [
     "Atomicity",
     "Consistency",
     "Durability",
     "Isolation",
     "Integrity"
    ],
    "answer": 0,
    "why": "Atomicity requires that all operations of a transaction complete or none do, so the partial transfer is undone.",
    "hint": "Think of 'all or nothing'."
   },
   {
    "id": "code-L9-q7",
    "q": "A model scores 99% on training data but only 60% on unseen test data. Which term best describes this?",
    "options": [
     "Underfitting",
     "Overfitting",
     "Data leakage",
     "Regularisation",
     "Class imbalance"
    ],
    "answer": 1,
    "why": "A large gap between training and test performance is the classic signature of overfitting.",
    "hint": "The model has memorised the training set rather than generalised."
   },
   {
    "id": "code-L9-q8",
    "q": "A binary tree has 15 nodes and is perfectly balanced, full at every level. What is its height, counting the root as level 0?",
    "options": [
     "3",
     "7",
     "2",
     "5",
     "4"
    ],
    "answer": 0,
    "why": "A full tree of height h has 2^(h+1) − 1 nodes; 2^4 − 1 = 15, so h = 3.",
    "hint": "Use the node count of a complete binary tree."
   },
   {
    "id": "code-L9-q9",
    "q": "Which of these best describes the role of the Memory Management Unit (MMU) in a modern computer?",
    "options": [
     "It stores the page file on disk",
     "It schedules processes onto CPU cores",
     "It translates virtual addresses to physical addresses",
     "It caches frequently used disk blocks",
     "It compiles source code into machine code"
    ],
    "answer": 2,
    "why": "The MMU performs address translation, typically via page tables, and enforces memory protection.",
    "hint": "It sits between the CPU's addresses and the actual RAM addresses."
   },
   {
    "id": "code-L9-q10",
    "q": "A recursive function lacks a correct base case. What is the most likely consequence at run time?",
    "options": [
     "A compile-time error",
     "The function returns zero",
     "A stack overflow from unbounded recursion",
     "A segmentation fault on the first call",
     "An infinite loop with constant memory"
    ],
    "answer": 2,
    "why": "Without a base case the recursion never terminates, and each call pushes a frame until the call stack overflows.",
    "hint": "Consider what each recursive call adds to the call stack."
   },
   {
    "id": "code-L9-q11",
    "q": "A model achieves high accuracy on a balanced dataset but the task is detecting a rare disease with 1% prevalence. Which metric is most informative about missed cases?",
    "options": [
     "Recall",
     "Precision",
     "F1 of the majority class",
     "Accuracy",
     "Specificity"
    ],
    "answer": 0,
    "why": "Recall (sensitivity) measures the fraction of actual positives detected, directly exposing missed cases; accuracy can be high by predicting 'healthy' always.",
    "hint": "Which metric counts true positives over all real positives?"
   },
   {
    "id": "code-L9-q12",
    "q": "A cache is direct-mapped with 256 lines and 16-byte blocks. The 32-bit address is split into tag, line index and offset. Which bits of the address select the line index?",
    "options": [
     "Bits 0 to 3",
     "Bits 12 to 19",
     "Bits 8 to 15",
     "Bits 4 to 11",
     "Bits 16 to 23"
    ],
    "answer": 3,
    "why": "The 4 offset bits are bits 0-3, and 8 index bits (256 lines) are bits 4-11.",
    "hint": "Offset bits come first, then index bits."
   },
   {
    "id": "code-L9-q13",
    "q": "A relation R(A,B,C) has functional dependencies A→B and B→C. Which statement about R is correct?",
    "options": [
     "R is in 2NF but not in 3NF",
     "R is in 3NF but not in 2NF",
     "R is in BCNF",
     "R is not in 2NF",
     "R is in 3NF and BCNF"
    ],
    "answer": 0,
    "why": "The key is A, so there is no partial dependency (2NF holds), but the transitive dependency A→B→C violates 3NF.",
    "hint": "Check partial dependencies first, then transitive ones."
   },
   {
    "id": "code-L9-q14",
    "q": "A CPU uses 5-stage pipelining with stages of 1, 2, 1, 3 and 1 ns. Ignoring hazards and latch overhead, what is the steady-state throughput in instructions per nanosecond?",
    "options": [
     "0.2",
     "1.0",
     "0.25",
     "0.5",
     "0.33"
    ],
    "answer": 4,
    "why": "The clock period is set by the slowest stage, 3 ns, so throughput is 1/3 ≈ 0.33 instructions per ns.",
    "hint": "Pipeline rate is limited by the slowest stage."
   },
   {
    "id": "code-L9-q15",
    "q": "A cache uses 2-way set associative mapping with 64 sets, 16-byte blocks, and 32-bit byte addresses. Which bits of an address select the set?",
    "options": [
     "Bits 4 to 9",
     "Bits 5 to 10",
     "Bits 6 to 11",
     "Bits 10 to 15",
     "Bits 0 to 5"
    ],
    "answer": 0,
    "why": "Offset is 4 bits (16-byte blocks), and 64 sets need 6 index bits, so the set index occupies bits 4–9.",
    "hint": "Work out the offset width from the block size first, then the index width from the number of sets."
   }
  ],
  "truths": [
   {
    "id": "code-L9-t1",
    "s": "In two's complement, an 8-bit register can represent the value −128.",
    "answer": true,
    "why": "The range of 8-bit two's complement is −128 to +127."
   },
   {
    "id": "code-L9-t2",
    "s": "Quicksort's worst-case time complexity is O(n log n).",
    "answer": false,
    "why": "Quicksort's worst case is O(n²), e.g. with already-sorted input and a poor pivot choice."
   },
   {
    "id": "code-L9-t3",
    "s": "In public-key cryptography, a message encrypted with a recipient's public key can be decrypted with the recipient's private key.",
    "answer": true,
    "why": "This is the defining property of asymmetric encryption."
   },
   {
    "id": "code-L9-t4",
    "s": "A 32-bit IPv4 address space contains exactly 2^32 usable host addresses after reserving network and broadcast addresses.",
    "answer": false,
    "why": "2^32 is the total address space; usable hosts are fewer because network and broadcast addresses are reserved per subnet."
   },
   {
    "id": "code-L9-t5",
    "s": "The halting problem is undecidable for Turing machines.",
    "answer": true,
    "why": "Turing proved no general algorithm can decide halting for all program-input pairs."
   },
   {
    "id": "code-L9-t6",
    "s": "In a B-tree of order m, all leaves are at the same depth.",
    "answer": true,
    "why": "B-trees are height-balanced, so every leaf is at the same level."
   },
   {
    "id": "code-L9-t7",
    "s": "Symmetric encryption uses different keys for encryption and decryption.",
    "answer": false,
    "why": "Symmetric encryption uses the same key for both operations."
   },
   {
    "id": "code-L9-t8",
    "s": "A deadlock requires mutual exclusion, hold-and-wait, no preemption and circular wait to occur simultaneously.",
    "answer": true,
    "why": "These are the four Coffman conditions, all necessary for deadlock."
   },
   {
    "id": "code-L9-t9",
    "s": "Depth-first search on a graph always finds the shortest path in terms of edge count.",
    "answer": false,
    "why": "BFS finds shortest paths by edge count; DFS does not guarantee this."
   },
   {
    "id": "code-L9-t10",
    "s": "In relational databases, a relation in third normal form is also in second normal form.",
    "answer": true,
    "why": "3NF implies 2NF and 1NF by definition."
   },
   {
    "id": "code-L9-t11",
    "s": "The RSA algorithm relies on the assumed difficulty of factoring large integers.",
    "answer": true,
    "why": "RSA security rests on the hardness of integer factorisation."
   },
   {
    "id": "code-L9-t12",
    "s": "A TCP socket connection is identified only by the destination IP address and port.",
    "answer": false,
    "why": "A connection is identified by the four-tuple of source IP, source port, destination IP and destination port."
   },
   {
    "id": "code-L9-t13",
    "s": "Dijkstra's algorithm can handle graphs with negative edge weights if there are no negative cycles.",
    "answer": false,
    "why": "Dijkstra's algorithm requires non-negative edge weights; Bellman–Ford handles negatives."
   },
   {
    "id": "code-L9-t14",
    "s": "In machine learning, regularisation is used to reduce overfitting.",
    "answer": true,
    "why": "Regularisation penalises model complexity, improving generalisation."
   },
   {
    "id": "code-L9-t15",
    "s": "A compiler directly executes source code line by line without producing an intermediate representation.",
    "answer": false,
    "why": "That describes an interpreter; a compiler translates to another form (often machine code) before execution."
   },
   {
    "id": "code-L9-t16",
    "s": "The CAP theorem states that a distributed data store cannot simultaneously guarantee consistency, availability and partition tolerance.",
    "answer": true,
    "why": "Under a network partition, a system must sacrifice either consistency or availability."
   },
   {
    "id": "code-L9-t17",
    "s": "In a max-heap, the smallest element is always at the root.",
    "answer": false,
    "why": "The largest element is at the root of a max-heap; the smallest is in a leaf."
   },
   {
    "id": "code-L9-t18",
    "s": "A finite-state automaton can recognise the language of balanced parentheses.",
    "answer": false,
    "why": "Balanced parentheses require unbounded counting, needing a pushdown automaton, not a finite-state one."
   }
  ],
  "terms": [
   {
    "id": "code-L9-w1",
    "word": "DEADLOCK",
    "clue": "Permanent standstill when processes each wait for a resource the other holds"
   },
   {
    "id": "code-L9-w2",
    "word": "OVERFITTING",
    "clue": "Model fits training noise and generalises poorly to new data"
   },
   {
    "id": "code-L9-w3",
    "word": "RECURSION",
    "clue": "Technique where a routine calls itself on a smaller subproblem"
   },
   {
    "id": "code-L9-w4",
    "word": "ENCRYPTION",
    "clue": "Transforming plaintext into unreadable ciphertext using a key"
   },
   {
    "id": "code-L9-w5",
    "word": "NORMALISATION",
    "clue": "Database design process reducing redundancy through successive normal forms"
   },
   {
    "id": "code-L9-w6",
    "word": "COMPILATION",
    "clue": "Translating a whole program into machine code before it runs"
   },
   {
    "id": "code-L9-w7",
    "word": "POLYMORPHISM",
    "clue": "Object-oriented ability of one interface to serve many types"
   },
   {
    "id": "code-L9-w8",
    "word": "THROUGHPUT",
    "clue": "Rate at which a system successfully transfers or processes data"
   },
   {
    "id": "code-L9-w9",
    "word": "SEMAPHORE",
    "clue": "Synchronisation primitive with a counter used to control access"
   }
  ]
 },
 "10": {
  "questions": [
   {
    "id": "code-L10-q1",
    "q": "A 5-stage pipeline has stage delays 1, 2, 1, 3, 1 ns. Ignoring hazards and latch overhead, what is the steady-state throughput in nanoseconds per instruction?",
    "options": [
     "3",
     "5",
     "8",
     "1",
     "2"
    ],
    "answer": 0,
    "why": "Steady-state throughput is governed by the slowest stage, which takes 3 ns.",
    "hint": "Pipelining is limited by the bottleneck stage."
   },
   {
    "id": "code-L10-q2",
    "q": "Relation R(A,B,C) has functional dependencies A→B and B→C. Which is correct?",
    "options": [
     "R is in BCNF",
     "R is in 3NF but not 2NF",
     "R is not in 1NF",
     "R is in 3NF and BCNF",
     "R is in 2NF but not 3NF"
    ],
    "answer": 4,
    "why": "A→B and B→C give a transitive dependency A→C on a non-superkey, violating 3NF; with a single-attribute key there is no partial dependency, so 2NF holds.",
    "hint": "Look for a transitive dependency through a non-key attribute."
   },
   {
    "id": "code-L10-q3",
    "q": "An algorithm's running time is T(n) = 5n^2 + 3n log2 n + 100. Which complexity class best describes it?",
    "options": [
     "Θ(n)",
     "Θ(n log n)",
     "Θ(n^3)",
     "Θ(n^2)",
     "Θ(log n)"
    ],
    "answer": 3,
    "why": "The n^2 term dominates all lower-order terms asymptotically.",
    "hint": "Identify the fastest-growing term."
   },
   {
    "id": "code-L10-q4",
    "q": "A hash table with 1000 slots uses open addressing with linear probing and holds 900 keys. Assuming simple uniform hashing, what is the expected number of probes for an unsuccessful search?",
    "options": [
     "1",
     "10",
     "5",
     "50",
     "100"
    ],
    "answer": 1,
    "why": "For linear probing, unsuccessful search probes ≈ ½(1 + 1/(1−α)^2) with α = 0.9, giving about 50.5; the standard simpler approximation 1/(1−α) gives 10 for α = 0.9.",
    "hint": "Use the load factor in the unsuccessful-search formula."
   },
   {
    "id": "code-L10-q5",
    "q": "A subnet uses mask 255.255.255.224. How many usable host addresses does each subnet provide?",
    "options": [
     "30",
     "14",
     "32",
     "6",
     "62"
    ],
    "answer": 0,
    "why": "The mask leaves 5 host bits, giving 2^5 − 2 = 30 usable addresses.",
    "hint": "Subtract the two reserved addresses from the block size."
   },
   {
    "id": "code-L10-q6",
    "q": "In TCP connection establishment, which sequence of flag combinations is correct?",
    "options": [
     "SYN, ACK, SYN-ACK",
     "SYN, SYN-ACK, ACK",
     "SYN, SYN, ACK",
     "SYN-ACK, SYN, ACK",
     "ACK, SYN, ACK"
    ],
    "answer": 1,
    "why": "The three-way handshake is SYN, then SYN-ACK, then ACK.",
    "hint": "The server responds to the initial SYN with its own SYN plus an acknowledgement."
   },
   {
    "id": "code-L10-q7",
    "q": "A model scores 99% on training data but only 60% on unseen test data. Which term best describes this?",
    "options": [
     "Underfitting",
     "Overfitting",
     "Normalisation",
     "Regularisation",
     "Data leakage"
    ],
    "answer": 1,
    "why": "High training accuracy with poor generalisation is the classic signature of overfitting.",
    "hint": "The model has memorised the training set."
   },
   {
    "id": "code-L10-q8",
    "q": "A transaction transfers £100 from account A to account B; the debit succeeds but the system crashes before the credit. Which ACID property is violated without recovery?",
    "options": [
     "Durability",
     "Integrity",
     "Isolation",
     "Atomicity",
     "Consistency"
    ],
    "answer": 3,
    "why": "Atomicity requires all-or-nothing execution; a partial transfer breaks it.",
    "hint": "Consider 'all or nothing'."
   },
   {
    "id": "code-L10-q9",
    "q": "A direct-mapped cache has 256 lines of 16 bytes each with 32-bit addresses. How many bits form the tag?",
    "options": [
     "24",
     "20",
     "16",
     "8",
     "12"
    ],
    "answer": 1,
    "why": "Offset = log2(16) = 4 bits; index = log2(256) = 8 bits; tag = 32 − 4 − 8 = 20 bits.",
    "hint": "Subtract offset and index widths from 32."
   },
   {
    "id": "code-L10-q10",
    "q": "A cache is set-associative with 64 sets, 2 ways, 16-byte blocks and 32-bit byte addresses. Which address fields are used, in order from most to least significant, to locate a byte?",
    "options": [
     "Tag, block offset, set index",
     "Set index, tag, block offset",
     "Tag, set index, block offset",
     "Block offset, tag, set index",
     "Set index, block offset, tag"
    ],
    "answer": 2,
    "why": "Offset bits = log2(16) = 4; set index bits = log2(64) = 6; the remaining 32 − 10 = 22 bits form the tag, so the order is tag, set index, offset.",
    "hint": "Work out how many bits the offset and the set index each need."
   },
   {
    "id": "code-L10-q11",
    "q": "A 5-stage pipeline has stage delays 1, 2, 1, 3 and 1 ns. Ignoring hazards and latch overhead, what is the steady-state throughput and the latency of one instruction respectively?",
    "options": [
     "One instruction per 2 ns; latency 8 ns",
     "One instruction per 8 ns; latency 8 ns",
     "One instruction per 3 ns; latency 8 ns",
     "One instruction per 1 ns; latency 5 ns",
     "One instruction per 3 ns; latency 15 ns"
    ],
    "answer": 2,
    "why": "The clock period equals the slowest stage (3 ns); latency is the sum of stage delays (8 ns), while throughput is one instruction per clock cycle.",
    "hint": "The clock is set by the slowest stage, but latency is the whole journey."
   },
   {
    "id": "code-L10-q12",
    "q": "A classifier is 99.9% accurate on a dataset where only 0.1% of cases are positive. It predicts 'negative' for every input. Which pair of values correctly describes it?",
    "options": [
     "High accuracy, zero recall",
     "High recall, low specificity",
     "High precision, high recall",
     "High F1, low accuracy",
     "Low accuracy, high recall"
    ],
    "answer": 0,
    "why": "Always predicting the majority class gives near-perfect accuracy but never finds a positive case, so recall (true positive rate) is zero.",
    "hint": "Consider what happens to the few positive cases."
   },
   {
    "id": "code-L10-q13",
    "q": "Which statement about the satisfiability problem (SAT) is correct?",
    "options": [
     "Both 2-SAT and 3-SAT are in P",
     "SAT is decidable only for unsatisfiable formulas",
     "3-SAT is in P but SAT is not",
     "2-SAT is NP-complete, while 3-SAT is in P",
     "3-SAT is NP-complete, while 2-SAT is in P"
    ],
    "answer": 4,
    "why": "3-SAT was shown NP-complete by Cook and Levin, whereas 2-SAT is solvable in polynomial time via strongly connected components of an implication graph.",
    "hint": "The jump from two to three literals per clause changes the complexity dramatically."
   },
   {
    "id": "code-L10-q14",
    "q": "In the RSA scheme, an attacker who knows the public modulus n and exponent e but cannot factor n. Which mathematical assumption underpins the security?",
    "options": [
     "The totient of n is always prime",
     "Factoring large semiprimes is hard",
     "Discrete logs in any group are easy",
     "Multiplying two primes is hard",
     "Finding square roots modulo a prime is easy"
    ],
    "answer": 1,
    "why": "RSA's security rests on the presumed intractability of factoring n = pq for large primes p and q; multiplying primes is easy, factoring is believed hard.",
    "hint": "Which operation is easy forwards but believed hard backwards here?"
   },
   {
    "id": "code-L10-q15",
    "q": "Which statement about the CAP theorem for distributed data stores is correct?",
    "options": [
     "During a network partition a system must sacrifice either consistency or availability",
     "A system can guarantee consistency, availability and partition tolerance simultaneously",
     "Consistency in CAP means ACID durability",
     "CAP applies only to single-node databases",
     "Partition tolerance can be abandoned in any real network"
    ],
    "answer": 0,
    "why": "CAP states that when a partition occurs, a distributed system cannot be both consistent and available; partition tolerance is unavoidable in practice.",
    "hint": "Think about what must give way when the network splits."
   }
  ],
  "truths": [
   {
    "id": "code-L10-t1",
    "s": "In a binary search tree, an in-order traversal visits keys in ascending order.",
    "answer": true,
    "why": "In-order traversal of a BST yields sorted key order."
   },
   {
    "id": "code-L10-t2",
    "s": "Every problem in NP is known to be solvable in polynomial time.",
    "answer": false,
    "why": "That would imply P = NP, which is unproven and widely believed false."
   },
   {
    "id": "code-L10-t3",
    "s": "Separate chaining allows the load factor of a hash table to exceed 1.",
    "answer": true,
    "why": "Chains can hold multiple entries per bucket, so load factor can exceed 1."
   },
   {
    "id": "code-L10-t4",
    "s": "Depth-first search always finds the shortest path in an unweighted graph.",
    "answer": false,
    "why": "Breadth-first search, not DFS, finds shortest paths in unweighted graphs."
   },
   {
    "id": "code-L10-t5",
    "s": "The three-way handshake establishes initial sequence numbers for both directions of a TCP connection.",
    "answer": true,
    "why": "SYN and SYN-ACK carry each side's initial sequence number."
   },
   {
    "id": "code-L10-t6",
    "s": "In relational algebra, the natural join requires the two relations to have no attributes in common.",
    "answer": false,
    "why": "Natural join joins on common attributes; it requires shared attributes to equate."
   },
   {
    "id": "code-L10-t7",
    "s": "A context-free language is always decidable by a Turing machine.",
    "answer": true,
    "why": "Context-free languages are recursive and thus decidable."
   },
   {
    "id": "code-L10-t8",
    "s": "The halting problem is decidable for programs that never loop.",
    "answer": false,
    "why": "The halting problem is undecidable in general; even restricted classes can be undecidable."
   },
   {
    "id": "code-L10-t9",
    "s": "In two's complement, the 8-bit representation of −128 is 10000000.",
    "answer": true,
    "why": "−128 is the minimum 8-bit two's complement value, encoded as 10000000."
   },
   {
    "id": "code-L10-t10",
    "s": "Adding more hidden layers to a neural network always reduces test error.",
    "answer": false,
    "why": "Deeper networks can overfit; more capacity does not guarantee lower test error."
   },
   {
    "id": "code-L10-t11",
    "s": "A 2-way set-associative cache with 64 sets and 16-byte blocks has a set index of 6 bits.",
    "answer": true,
    "why": "log2(64) = 6 set-index bits."
   },
   {
    "id": "code-L10-t12",
    "s": "In SQL, the WHERE clause filters groups after GROUP BY.",
    "answer": false,
    "why": "HAVING filters groups; WHERE filters rows before grouping."
   },
   {
    "id": "code-L10-t13",
    "s": "Public-key encryption allows anyone with the public key to encrypt, but only the private key decrypts.",
    "answer": true,
    "why": "That is the defining asymmetric property."
   },
   {
    "id": "code-L10-t14",
    "s": "The RSA trapdoor relies on the difficulty of integer factorisation.",
    "answer": true,
    "why": "RSA security rests on factoring large semiprimes."
   },
   {
    "id": "code-L10-t15",
    "s": "A process deadlock requires at least two processes competing for resources.",
    "answer": true,
    "why": "Deadlock needs mutual waiting, which requires at least two parties."
   },
   {
    "id": "code-L10-t16",
    "s": "In a direct-mapped cache, two different memory blocks can never map to the same cache line.",
    "answer": false,
    "why": "Many blocks map to the same line by index; that causes conflict misses."
   },
   {
    "id": "code-L10-t17",
    "s": "Every language accepted by a nondeterministic finite automaton is also accepted by a deterministic finite automaton.",
    "answer": true,
    "why": "NFAs and DFAs recognise the same class, the regular languages."
   },
   {
    "id": "code-L10-t18",
    "s": "Regularisation in machine learning typically increases training error while aiming to reduce test error.",
    "answer": true,
    "why": "Penalising complexity trades training fit for better generalisation."
   },
   {
    "id": "code-L10-t19",
    "s": "In the RSA cryptosystem, the public exponent e must be coprime with the totient (p−1)(q−1) for a private exponent d to exist.",
    "answer": true,
    "why": "A modular inverse d of e exists modulo the totient exactly when gcd(e, totient) = 1."
   },
   {
    "id": "code-L10-t20",
    "s": "Every problem in NP is also in P, by definition of the class NP.",
    "answer": false,
    "why": "NP contains problems verifiable in polynomial time; whether NP ⊆ P is the open P versus NP question, not a definition."
   }
  ],
  "terms": [
   {
    "id": "code-L10-w1",
    "word": "DEADLOCK",
    "clue": "State where processes wait forever for resources held by each other"
   },
   {
    "id": "code-L10-w2",
    "word": "OVERFITTING",
    "clue": "Model memorises training data and generalises poorly to new examples"
   },
   {
    "id": "code-L10-w3",
    "word": "NORMALISATION",
    "clue": "Organising relations to reduce redundancy and update anomalies"
   },
   {
    "id": "code-L10-w4",
    "word": "PIPELINING",
    "clue": "Overlapping instruction stages to increase processor throughput"
   },
   {
    "id": "code-L10-w5",
    "word": "THRASHING",
    "clue": "Excessive paging that leaves little time for useful work"
   },
   {
    "id": "code-L10-w6",
    "word": "SEMAPHORE",
    "clue": "Synchronisation primitive with a counter and wait/signal operations"
   },
   {
    "id": "code-L10-w7",
    "word": "BROADCAST",
    "clue": "Sending one packet to all hosts on a local network segment"
   },
   {
    "id": "code-L10-w8",
    "word": "HASHING",
    "clue": "Mapping keys to bucket indices for average constant-time lookup"
   },
   {
    "id": "code-L10-w9",
    "word": "REGULARISATION",
    "clue": "Penalty term added to a loss function to discourage model complexity"
   }
  ]
 }
};
