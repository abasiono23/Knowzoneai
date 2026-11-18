import type { Skill } from './skills';

/**
 * Demo mode's Future skills: the five subjects with their YouTube lessons, in English, copied from the
 * server's list (apps/server/data/skills/skills.json; the real lists come from the server, in the app's
 * language). Enough to see the skill screens without a server.
 */
export const DEMO_SKILLS: (Skill & { tagline: string })[] = [
  {
    "id": "coding",
    "name": "Coding",
    "tagline": "Learn how code works, then write your own",
    "summary": "Coding means writing instructions a computer can follow, using languages such as Python and HTML. It is useful for building websites and apps, automating repetitive tasks and solving problems step by step. These lessons start with how computers read code and how websites are made, practise problem-solving, then build up to writing your own simple web pages and Python programs.",
    "videos": [
      {
        "youtubeId": "QXjU9qTsYCc",
        "title": "How do computers read code?",
        "channel": "Frame of Essence",
        "seconds": 721,
        "summary": "Learn what happens between the code you write and the computer running it. You will see how source code differs from machine code, how a compiler translates one into the other, and how compilers make programming easier."
      },
      {
        "youtubeId": "gT0Lh1eYk78",
        "title": "HTML, CSS, JavaScript Explained [in 4 minutes for beginners]",
        "channel": "Danielle Thé",
        "seconds": 238,
        "summary": "Learn which three languages are used to build websites: HTML, CSS and JavaScript. This short explainer for beginners shows why you can’t exist online without them, and it is meant to be watched before you start any web development tutorial."
      },
      {
        "youtubeId": "KFVdHDMcepw",
        "title": "The Prison Break | Think Like A Coder, Ep 1",
        "channel": "TED-Ed",
        "seconds": 411,
        "summary": "Learn to think like a programmer through an animated adventure. Ethic wakes up in a mysterious cell, and she and her robot Hedge must solve programming puzzles to escape. It is the first episode of a 10-part TED-Ed series."
      },
      {
        "youtubeId": "Z1Yd7upQsXY",
        "title": "Python Tutorial for Absolute Beginners #1 - What Are Variables?",
        "channel": "CS Dojo",
        "seconds": 1478,
        "summary": "Learn what Python is, what you can do with it, and how to set up Python and Jupyter Notebook using Anaconda. You will then use the print() function, find out what variables are, assign one variable to another, and try a practice problem: swapping two variables."
      },
      {
        "youtubeId": "MwxMsaFFycg",
        "title": "IP addresses and DNS | Internet 101 | Computer Science | Khan Academy",
        "channel": "Khan Academy",
        "seconds": 405,
        "summary": "Find out how computers find each other on the internet. Internet co-founder Vint Cerf and engineer Paola Mejia explain IP addresses, which work like postal addresses for devices, and DNS, which turns website names into those numbers."
      },
      {
        "youtubeId": "rL8X2mlNHPM",
        "title": "Intro to Algorithms: Crash Course Computer Science #13",
        "channel": "CrashCourse",
        "seconds": 704,
        "summary": "Learn what an algorithm is and why some are much faster than others. Using sorting and finding the shortest route on a map, you’ll see how computer scientists measure an algorithm’s efficiency with Big O notation and make it better."
      },
      {
        "youtubeId": "hJHvdBlSxug",
        "title": "How The Web Works - The Big Picture",
        "channel": "Academind",
        "seconds": 745,
        "summary": "Get the big picture of what happens when you open a website. You will follow a request from your browser to a server and back, and see how domains, servers and responses fit together."
      },
      {
        "youtubeId": "FQdaUv95mR8",
        "title": "HTML Tutorial for Beginners",
        "channel": "Kevin Stratvert",
        "seconds": 2346,
        "summary": "Learn to create a simple web page with HTML, step by step. You will make and edit an HTML file, add headers, paragraphs, lists, links, images, audio, video, tables and forms, and get tips on structuring your page and writing clean, semantic code (tags that describe their content)."
      },
      {
        "youtubeId": "b093aqAZiPU",
        "title": "👩‍💻 Python for Beginners Tutorial",
        "channel": "Kevin Stratvert",
        "seconds": 3801,
        "summary": "Learn to program in Python from scratch: get Python, run your first code and set up Visual Studio Code. You will then work with numbers, text, variables, if statements, functions, loops and libraries, and learn to troubleshoot syntax, semantic and runtime errors."
      },
      {
        "youtubeId": "RGOj5yH7evk",
        "title": "Git and GitHub for Beginners - Crash Course",
        "channel": "freeCodeCamp.org",
        "seconds": 4110,
        "summary": "A hands-on course on Git and GitHub, the tools developers use to track changes to their code and work together on projects. You’ll learn to create a repository, commit changes, use branches and share your work on GitHub."
      }
    ]
  },
  {
    "id": "ui-ux",
    "name": "UI/UX design",
    "tagline": "Design apps and websites that people find easy to use",
    "summary": "UI/UX design is about making apps and websites easy and pleasant to use. UX (user experience) covers how a product works for the person using it, while UI (user interface) covers the screens, buttons and layouts they see and touch. It is useful because good design saves people confusion. These lessons build from the basic ideas to design principles, the tool Figma, research with users and how UX designers work in teams.",
    "videos": [
      {
        "youtubeId": "ziQEqGZB8GE",
        "title": "What Is UX Design? - An Introduction (Full Guide For 2024)",
        "channel": "CareerFoundry",
        "seconds": 504,
        "summary": "Learn what UX design means, its key factors and what sits at its core. Examples of good UX, including one from Don Norman, show the ideas in action, then come the five basic steps of UX design and a UX designer’s daily tasks."
      },
      {
        "youtubeId": "5CxXhyhT6Fc",
        "title": "UX Design vs UI Design - What's The Difference? (2024)",
        "channel": "CareerFoundry",
        "seconds": 608,
        "summary": "Learn clear definitions of UX design and UI design, and how the two roles are similar and different. You will compare the tasks each one involves, see an example of a UI designer and think about which might suit you better."
      },
      {
        "youtubeId": "9EPTM91TBDU",
        "title": "The Principles of Design | FREE COURSE",
        "channel": "Envato",
        "seconds": 1307,
        "summary": "Learn the main rules for creating compositions that work well and carry an organised message. The course takes each principle in turn, including balance, unity, contrast, emphasis, pattern, rhythm, movement, proportion, harmony and variety."
      },
      {
        "youtubeId": "kQ_6faxhyIw",
        "title": "What is UX Research? | Google UX Design Certificate",
        "channel": "Grow with Google",
        "seconds": 1380,
        "summary": "Learn how UX research puts the user first and closes the gap between what a business thinks users need and what they actually need, before an expensive product is made. It also covers choosing a research method, each method’s benefits and drawbacks, and types of bias."
      },
      {
        "youtubeId": "n8MnoJyl3W4",
        "title": "Usability Testing 101",
        "channel": "NNgroup",
        "seconds": 106,
        "summary": "A quick introduction to usability testing, one of the most popular UX research methods. You’ll see how watching real people try tasks with a design uncovers its problems and opportunities to improve it."
      },
      {
        "youtubeId": "20SHvU2PKsM",
        "title": "Introduction to Web Accessibility and W3C Standards",
        "channel": "W3C Web Accessibility Initiative (WAI)",
        "seconds": 247,
        "summary": "Learn why websites and apps must work for people with disabilities, and how good accessibility helps everyone, including older people and anyone on a mobile phone. It also introduces the international W3C standards that guide accessible design."
      },
      {
        "youtubeId": "sqi0-Lz_ZTY",
        "title": "How to Conduct a Heuristic Evaluation",
        "channel": "NNgroup",
        "seconds": 290,
        "summary": "Learn how to review a product step by step against proven usability principles (heuristics) to find problems before your users do. You’ll see how to plan the review and record what you find, with a free workbook from Nielsen Norman Group."
      },
      {
        "youtubeId": "gHGN6hs2gZY",
        "title": "What Is Design Thinking? An Overview",
        "channel": "AJ&Smart",
        "seconds": 620,
        "summary": "Get an overview of design thinking, a problem-solving approach that starts with understanding people’s needs. You’ll learn its main stages, from understanding the problem to generating ideas, prototyping and testing them."
      },
      {
        "youtubeId": "II-6dDzc-80",
        "title": "Figma Masterclass for Beginners (2023 Updated)",
        "channel": "Jesse Showalter",
        "seconds": 1917,
        "summary": "Learn the basics of Figma step by step, starting from downloading and installing it. This beginner tutorial aims to give you what you need to start using Figma for your own web and UI design projects."
      },
      {
        "youtubeId": "2QQQtiFwXjU",
        "title": "Intro to UX (User Experience) | Google UX Design Certificate",
        "channel": "Grow with Google",
        "seconds": 1919,
        "summary": "Learn the basics of UX design, what makes a good user experience and what entry-level UX designers do. It also explains specialists, generalists and T-shaped designers, working in a cross-functional team (people with different skills), and UX design at different types of company."
      }
    ]
  },
  {
    "id": "cybersecurity",
    "name": "Cybersecurity",
    "tagline": "Protect yourself and others from online threats",
    "summary": "Cybersecurity is the practice of keeping people, accounts, devices and data safe from attack, theft and damage. It matters because scams and stolen passwords can affect anyone who goes online. These lessons start with everyday protection, such as spotting phishing and scams, turning on two-factor authentication and guarding your passwords, then build up to how security professionals protect organisations and the people who rely on them.",
    "videos": [
      {
        "youtubeId": "XsOWczwRVuc",
        "title": "What Is Phishing? And How to Avoid the Bait",
        "channel": "iluli by Mike Lamb",
        "seconds": 261,
        "summary": "Learn what phishing is, why convincing fake messages fool so many people, and how spear phishing targets particular people using their personal details. You’ll also pick up habits that protect you: check website addresses carefully, avoid links in emails, and call your bank, friend or relative directly if unsure."
      },
      {
        "youtubeId": "hGRii5f_uSc",
        "title": "Why You Should Turn On Two Factor Authentication",
        "channel": "Tom Scott",
        "seconds": 492,
        "summary": "Find out why two-factor authentication, a second check on top of your password, makes your accounts more secure and why it is worth turning on. The longer answer, filmed at a computing history museum, even involves Ronald Reagan, the former US president."
      },
      {
        "youtubeId": "bPVaOlJ6ln0",
        "title": "Cybersecurity: Crash Course Computer Science #31",
        "channel": "CrashCourse",
        "seconds": 750,
        "summary": "Learn cybersecurity’s three goals: secrecy, integrity and availability of systems and data. You’ll meet threats such as malware, DDoS (Denial of Service) attacks and brute-force password cracking, and defences that protect you, including strong passwords, biometrics, access privileges and two-factor authentication."
      },
      {
        "youtubeId": "vKPGZHoHX8k",
        "title": "How Hackers Steal Passwords: 5 Attack Methods Explained",
        "channel": "IBM Technology",
        "seconds": 787,
        "summary": "Understand five ways hackers steal passwords, namely guessing, harvesting, cracking, spraying and stuffing, so you can recognise the risks and defend against them. You’ll also learn how to prevent credential theft (stolen login details) using multi-factor authentication, passkeys and rate limiting."
      },
      {
        "youtubeId": "CDhAOvsyw2s",
        "title": "10 Common Internet Scams and How To Avoid Them",
        "channel": "macmostvideo",
        "seconds": 829,
        "summary": "Learn how 10 common internet scams work, including job posting, lottery, online purchase, tech support and online romance scams. It ends with ways to protect yourself and others, so you can talk about scams with your friends and family before it is too late."
      },
      {
        "youtubeId": "6-JjHa-qLPk",
        "title": "Encryption and public keys | Internet 101 | Computer Science | Khan Academy",
        "channel": "Khan Academy",
        "seconds": 400,
        "summary": "See how encryption keeps your data safe online. Security expert Mia Epner explains 256-bit encryption, public and private keys, and how SSL/TLS and HTTPS protect what you send on the web."
      },
      {
        "youtubeId": "WYkbKzDfgqo",
        "title": "What Is Ethical Hacking? Roles, Skills, and Cybersecurity",
        "channel": "IBM Technology",
        "seconds": 443,
        "summary": "Discover how ethical hackers protect organisations by attacking systems, with permission, to find weaknesses before criminals do. You’ll learn about their roles and skills, red and blue teams, and adversary simulation."
      },
      {
        "youtubeId": "X2UiMLxRdhE",
        "title": "Incident Response - CompTIA Security+ SY0-701 - 4.8",
        "channel": "Professor Messer",
        "seconds": 554,
        "summary": "Learn what to do when a security incident happens. Professor Messer walks through the incident response process, from preparation and detection to isolating the problem, recovering and learning lessons afterwards."
      },
      {
        "youtubeId": "AYgXr1dynKU",
        "title": "Understanding the OSI Model - CompTIA Network+ N10-009 - 1.1",
        "channel": "Professor Messer",
        "seconds": 831,
        "summary": "Learn the OSI model, the seven-layer framework IT professionals use to describe how data moves across a network. Each layer is linked to practical networking, giving you a solid base for networking and security."
      },
      {
        "youtubeId": "_DVVNOGYtmU",
        "title": "Cybersecurity for Beginners | Google Cybersecurity Certificate",
        "channel": "Grow with Google",
        "seconds": 4473,
        "summary": "Explore, in a beginner course of over an hour, how cybersecurity protects organisations and the people who rely on them: what it is, its history and the eight security domains. You’ll also see core skills, frameworks and controls, ethics, and the tools and programming languages professionals use."
      }
    ]
  },
  {
    "id": "ai-prompting",
    "name": "AI prompting",
    "tagline": "Ask AI clearly, and check what it gives back",
    "summary": "AI prompting is the skill of telling an AI tool clearly what you want: the task, the background and the form the answer should take. Better prompts usually get more useful answers, though AI can still make mistakes, so its work needs checking. These lessons cover how language models work and build up from clear, structured prompts to more advanced methods.",
    "videos": [
      {
        "youtubeId": "QAKtNOWsaHI",
        "title": "How to write an AI prompt",
        "channel": "Google",
        "seconds": 187,
        "summary": "Learn how to write clearer prompts for vibe coding, which means creating software by describing it in natural language, through the build of a playable 3D racing game. The strategies are to be specific, guide the choice of technology and add sketches or screenshots as visual references."
      },
      {
        "youtubeId": "LPZh9BOjkQs",
        "title": "Large Language Models explained briefly",
        "channel": "3Blue1Brown",
        "seconds": 478,
        "summary": "Get a short, light introduction to large language models, known as LLMs, along with chatbots, pretraining and transformers. These ideas give you a first picture of the topic, and you can explore it further later."
      },
      {
        "youtubeId": "-Hjw0_PMyfQ",
        "title": "Learn Better Prompt Engineering in 7 Minutes",
        "channel": "AWS Developers",
        "seconds": 441,
        "summary": "Learn the basics of prompt engineering through a worked example of a business insights summary, using Amazon Bedrock, an AWS service for building AI applications. Topics include clear instructions, where to place questions, separator characters, output indicators and inference parameters."
      },
      {
        "youtubeId": "jC4v5AS4RIM",
        "title": "Master the Perfect ChatGPT Prompt Formula (in just 8 minutes)!",
        "channel": "Jeff Su",
        "seconds": 510,
        "summary": "Learn a six-part prompt formula for chatbots such as ChatGPT: task, context, exemplars (examples), persona, format and tone. Real-world examples show how each part helps, and you’ll see tips such as starting the task with an action verb. The lesson ends by comparing outputs from good and bad prompts."
      },
      {
        "youtubeId": "1c9iyoVIwDs",
        "title": "4 Methods of Prompt Engineering",
        "channel": "IBM Technology",
        "seconds": 762,
        "summary": "Compare four prompt engineering methods: Retrieval Augmented Generation (RAG), Chain-of-Thought (COT), ReACT (Reason + Act) and Directional Stimulus Prompting (DSP). You’ll see an example of each, how they differ, and how they can be best used and even combined."
      },
      {
        "youtubeId": "9aA2YAcFs0A",
        "title": "Prompting basics | Introducing Khanmigo | Khanmigo for students | Khan Academy",
        "channel": "Khan Academy",
        "seconds": 481,
        "summary": "Sal Khan shares simple strategies for prompting an AI to get answers that are truly useful for learning. The tips are shown with Khan Academy’s AI tutor Khanmigo, but they work with any AI assistant you use to study."
      },
      {
        "youtubeId": "cfqtFvWOfg0",
        "title": "Why Large Language Models Hallucinate",
        "channel": "IBM Technology",
        "seconds": 578,
        "summary": "Learn why AI chatbots sometimes state false things with confidence, which is called hallucination. You’ll see the main types and causes, and steps you can take as a user to make them less likely."
      },
      {
        "youtubeId": "gV0_raKR2UQ",
        "title": "Algorithmic Bias and Fairness: Crash Course AI #18",
        "channel": "CrashCourse",
        "seconds": 680,
        "summary": "Understand how AI systems can end up unfair. You’ll learn five common sources of algorithmic bias, from data that reflects existing prejudice to feedback loops and deliberately harmful data, and why it pays to question AI results."
      },
      {
        "youtubeId": "_ZvnD73m40o",
        "title": "Prompt Engineering Tutorial – Master ChatGPT and LLM Responses",
        "channel": "freeCodeCamp.org",
        "seconds": 2496,
        "summary": "Learn prompt engineering techniques for better results from ChatGPT and other LLMs in a longer course. It covers AI, machine learning, linguistics and language models, then the prompt engineering mindset, GPT-4, best practices, zero-shot and few-shot prompts, AI hallucinations (made-up answers) and text embeddings."
      },
      {
        "youtubeId": "zjkBMFhNj_g",
        "title": "[1hr Talk] Intro to Large Language Models",
        "channel": "Andrej Karpathy",
        "seconds": 3588,
        "summary": "A one-hour talk for a general audience by AI researcher Andrej Karpathy on how large language models like ChatGPT are built and trained, and where they are heading. It also covers new security risks such as jailbreaks and prompt injection (recorded in November 2023)."
      }
    ]
  },
  {
    "id": "data-science",
    "name": "Data science",
    "tagline": "Turn raw data into clear answers and better decisions",
    "summary": "Data science combines statistics, computer programming and knowledge of a subject to find useful patterns in data and answer real questions. It helps people in health, business, government and research make better-informed decisions, though results are only as good as the data behind them. These lessons move from what the field is, through statistics and machine learning, to exploring a dataset in Python and organising a data project.",
    "videos": [
      {
        "youtubeId": "RBSUwFGa6Fk",
        "title": "What is Data Science?",
        "channel": "IBM Technology",
        "seconds": 471,
        "summary": "Learn what data science is: a blend of computer science, mathematics and business knowledge used to predict, diagnose and solve problems. An IBM engineer explains the basics, including data mining, data cleaning and machine learning, and how they turn data into insights people can act on."
      },
      {
        "youtubeId": "dcXqhMqhZUo",
        "title": "Data Analytics vs Data Science",
        "channel": "IBM Technology",
        "seconds": 390,
        "summary": "Learn the difference between data science and data analytics, two terms people often use as if they meant the same thing. The lesson looks at the two job roles and compares the tools and practices of data scientists with those of data analysts."
      },
      {
        "youtubeId": "sxQaBpKfDRk",
        "title": "What Is Statistics: Crash Course Statistics #1",
        "channel": "CrashCourse",
        "seconds": 780,
        "summary": "Learn what statistics are and why they matter in everyday life, from small daily choices to government policy. It also explains that statistics are tools that cannot give every answer and can be used to misinform, and the series aims to make you a more informed reader of them."
      },
      {
        "youtubeId": "Gv9_4yMHFhI",
        "title": "A Gentle Introduction to Machine Learning",
        "channel": "StatQuest with Josh Starmer",
        "seconds": 765,
        "summary": "Learn the most basic ideas behind machine learning, without the hype and confusing terms. Simple, silly examples introduce classification, which sorts things into groups, and regression, which predicts a number, giving you a foundation for learning more."
      },
      {
        "youtubeId": "hEWY6kkBdpo",
        "title": "Charts Are Like Pasta - Data Visualization Part 1: Crash Course Statistics #5",
        "channel": "CrashCourse",
        "seconds": 622,
        "summary": "Learn how to turn raw numbers into clear charts. You’ll see the difference between categorical and quantitative data, and when to use bar charts, pie charts, pictographs and histograms."
      },
      {
        "youtubeId": "HZGCoVF3YvM",
        "title": "Bayes theorem, the geometry of changing beliefs",
        "channel": "3Blue1Brown",
        "seconds": 911,
        "summary": "A visual explanation of Bayes’ theorem, the rule for updating what you believe when new evidence arrives. Clear diagrams show where the formula comes from and why people so often misjudge probabilities."
      },
      {
        "youtubeId": "LgXzzu68j7M",
        "title": "Excel Tutorial for Beginners",
        "channel": "Kevin Stratvert",
        "seconds": 977,
        "summary": "A step-by-step start with spreadsheets in Microsoft Excel. You’ll go from entering and formatting data to sorting, filtering, conditional formatting, charts and pivot tables, the everyday tools of data analysis."
      },
      {
        "youtubeId": "xi0vhXFPegw",
        "title": "Exploratory Data Analysis with Pandas Python",
        "channel": "Rob Mulla",
        "seconds": 2422,
        "summary": "Learn the basics of exploratory data analysis, using Python and the pandas library to get to know a dataset. Step by step, you see how to read in the data, prepare it, study its features (columns) and the relationships between them, then ask a question of the data."
      },
      {
        "youtubeId": "4DlsTsqpY84",
        "title": "Data Science for Beginners | Google Advanced Data Analytics Certificate",
        "channel": "Grow with Google",
        "seconds": 5935,
        "summary": "Learn what data professionals do at work and the skills data careers call for, in this long beginner course. It also covers using data analytics for good, how the field has developed, communication, and PACE (Plan, Analyze, Construct, Execute), a workflow for organising data projects."
      },
      {
        "youtubeId": "h0nxCDiD-zg",
        "title": "SQL Tutorial for Beginners",
        "channel": "Kevin Stratvert",
        "seconds": 2697,
        "summary": "Learn to write your own SQL queries to get data out of a database, with no prior knowledge and only free tools. SQL is the standard language for talking to databases and one of the most useful skills for any data role."
      }
    ]
  }
];
