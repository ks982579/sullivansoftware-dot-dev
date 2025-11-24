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
        id: "blockchain-1",
        name: "Blockchain Technology",
        description:
          "In-depth study of blockchain architectures, smart contracts, consensus mechanisms, and cryptographic foundations.",
        specialization: "Blockchain",
      },
      {
        id: "distributed-sys",
        name: "Distributed Systems",
        description:
          "Design and implementation of distributed systems, covering scalability, fault tolerance, and consistency models.",
        specialization: "Systems",
      },
      {
        id: "ml-1",
        name: "Machine Learning",
        description:
          "Fundamentals of machine learning algorithms, model training, evaluation, and real-world applications.",
        specialization: "AI",
      },
      {
        id: "crypto-1",
        name: "Cryptography",
        description:
          "Cryptographic algorithms, protocols, and their applications in modern security systems.",
        specialization: "Security",
      },
      {
        id: "cloud-arch",
        name: "Cloud Architecture",
        description:
          "Design patterns and best practices for building scalable applications on cloud platforms.",
        specialization: "Systems",
      },
      {
        id: "data-structures",
        name: "Advanced Data Structures",
        description:
          "Deep dive into complex data structures and their algorithmic applications for performance optimization.",
        specialization: "Algorithms",
      },
    ],
  },
  {
    id: "bsc-actuarial",
    slug: "bsc-actuarial",
    title: "BSc Actuarial Science & Economics",
    university: "[University Name]",
    startDate: "[Start Date]",
    endDate: "[End Date]",
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
