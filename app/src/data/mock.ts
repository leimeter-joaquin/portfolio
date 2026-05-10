export type Project = {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  href?: string;
  featured?: boolean;
  gradient: [string, string];
  thumbnailLabel?: string;
};

export type Role = {
  company: string;
  title: string;
  start: string;
  end: string | "present";
  note?: string;
};

export type Contact = {
  location: string;
  email: string;
  github: string;
  linkedin: string;
};

export const heroCopy = {
  eyebrow: "Full Stack Developer",
  headline:
    "I build the whole system, interface to infrastructure.",
  accentPhrase: "whole system",
  bio: "I'm a web developer with a solid foundation in both front and back ends. Across teams and roles I've worked through every stage of the product lifecycle — discovery, design, implementation, release. Lately I'm expanding into DevOps and infrastructure, with a focus on AWS. The goal: own the system end to end, from interface to infrastructure.",
};

export const projects: Project[] = [
  {
    id: "payment",
    title: "Payment",
    summary: "Core payments platform",
    tags: [
      "typescript",
      "node.js",
      "aws",
      "postgres",
    ],
    featured: true,
    gradient: ["#1a2540", "#0f1a30"],
    thumbnailLabel: "Payment",
  },
  {
    id: "internal-training",
    title: "Internal training program",
    summary:
      "Onboarding curriculum and dashboard",
    tags: [
      "astro",
      "typescript",
      "scss",
    ],
    gradient: ["#1c2a44", "#101b30"],
    thumbnailLabel: "Internal training",
  },
  {
    id: "headless-commerce",
    title: "Headless commerce front",
    summary:
      "Storefront integrating headless commerce APIs",
    tags: [
      "next.js",
      "typescript",
      "graphql",
    ],
    gradient: ["#1f2c46", "#101b30"],
    thumbnailLabel: "Headless commerce",
  },
];

export const experience: Role[] = [
  {
    company: "Radium-Rocket",
    title: "Full Stack Developer",
    start: "2022-09",
    end: "present",
    note: "Front and back teams in 1 to 4 national client projects, working in Vue.js, Next.js / NodeJS, Headless UI, plus a workspace and lite.",
  },
  {
    company: "Mark Audio",
    title: "Stage Technician",
    start: "2019-01",
    end: "2022-08",
  },
  {
    company: "Voices in Anger ESL",
    title: "Administrative Assistant",
    start: "2017-03",
    end: "2018-12",
  },
];

export const contact: Contact = {
  location:
    "Rosario / Santa Fe, Argentina",
  email: "leimeter.joaquin@gmail.com",
  github:
    "https://github.com/leimeter-joaquin",
  linkedin:
    "",
};
