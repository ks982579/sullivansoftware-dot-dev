export interface Course {
    id: string;
    name: string;
    description: string;
    specialization?: string; // e.g., "Blockchain", "AI", "Cybersecurity"
}

export interface Education {
    id: string;
    slug: string; // URL-friendly slug
    title: string;
    university: string;
    startDate: string;
    endDate: string;
    description: string; // Brief intro for the detail page
    courses: Course[];
}

export const educationData: Education[] = [
    {
        id: "msc-cs",
        slug: "msc-cs",
        title: "MSc Computer Science",
        university: "International University of Applied Sciences",
        startDate: "Jan 2023",
        endDate: "Present",
        description:
            "Advanced studies in Computer Science with focus on emerging technologies and specialized domains. This program allows for deep exploration into areas of personal interest while building a strong foundation in theoretical and practical computer science.",
        courses: [
            {
                id: "python-1",
                name: "Programming with Python",
                description:
                    "Coming soon...",
                specialization: "Python",
            },
            {
                id: "software-engineering-1",
                name: "Software Engineering: Software Processes",
                description:
                    "Coming soon...",
                specialization: "Software Engineering",
            },
            {
                id: "algorithmics-1",
                name: "Algorithmics",
                description:
                    "Coming soon...",
                specialization: "Algorithms and Data Structures",
            },
            {
                id: "statistics-1",
                name: "Advances Statistics",
                description:
                    "Coming soon...",
                specialization: "Statistics",
            },
            {
                id: "big-data-1",
                name: "Big Data Technology",
                description:
                    "Coming soon...",
                specialization: "Big Data",
            },
            {
                id: "artificial-intelligence-1",
                name: "Artificial Intelligence",
                description:
                    "Coming soon...",
                specialization: "Artificial Intelligence",
            },
            {
                id: "cyber-security-1",
                name: "Cyber Security and Data Protection",
                description:
                    "Coming soon...",
                specialization: "Cyber Security",
            },
            {
                id: "software-engineering-2",
                name: "Project: Software Engineering",
                description:
                    "Coming soon...",
                specialization: "Software Engineering Practices, Web Development, and Rust",
            },
            {
                id: "computer-science-1",
                name: "Project: Computer Science",
                description:
                    "Coming soon...",
                specialization: "Artificial Intelligence, Machine Learning, Python",
            },
            {
                id: "distributed-systems-1",
                name: "Networks and Distributed Systems",
                description:
                    "Coming soon...",
                specialization: "Networks and Distributed Systems",
            },
            {
                id: "machine-learning-1",
                name: "Machine Learning",
                description:
                    "In progress...",
                specialization: "Machine Learning",
            },
            {
                id: "deep-learning-1",
                name: "Deep Learning",
                description:
                    "In progress...",
                specialization: "Deep Learning",
            },
            {
                id: "blockchain-1",
                name: "Blockchain",
                description:
                    "In progress...",
                specialization: "Blockchain",
            },
            {
                id: "computer-science-2",
                name: "Seminar: Current Topics in Computer Science",
                description:
                    "In progress...",
                specialization: "Artificial Intelligence and Blockchain",
            },
            {
                id: "quantum-computing-1",
                name: "Quantum Computing",
                description:
                    "To do...",
                specialization: "Quantum Computing",
            },
            {
                id: "master-thesis-1",
                name: "Master Thesis",
                description:
                    "To do...",
                specialization: "Unsure",
            },
        ],
    },
    {
        id: "bsc-actuarial",
        slug: "bsc-actuarial",
        title: "BSc Actuarial Science & Economics",
        university: "The State University of New York at Albany (UAlbany)",
        startDate: "August 2011",
        endDate: "21 December 2013",
        description:
            "Foundation in actuarial science and economics with strong mathematical background. This degree provided the analytical thinking and problem-solving skills that naturally led to a career in software engineering.",
        courses: [
            {
                id: "actuarial-math",
                name: "Actuarial Mathematics",
                description: "Core actuarial concepts including life contingencies and risk modeling.",
            },
            {
                id: "economics",
                name: "Microeconomics & Macroeconomics",
                description: "Economic principles and their real-world applications.",
            },
            {
                id: "probability",
                name: "Probability & Statistics",
                description: "Statistical methods and probability theory for risk analysis.",
            },
            {
                id: "finance",
                name: "Financial Mathematics",
                description: "Mathematical models for financial derivatives and portfolio management.",
            },
            {
                id: "computer-basics",
                name: "Computational Methods",
                description:
                    "Introduction to computing and programming for solving mathematical problems.",
            },
        ],
    },
];

export function getEducationBySlug(slug: string): Education | undefined {
    return educationData.find((edu) => edu.slug === slug);
}

export function getAllEducationSlugs(): string[] {
    return educationData.map((edu) => edu.slug);
}
