export const count = { on: "Oct 21, 2026", next: "Nov 1" };

export const projects = [
  {
    slug: "udemy-reset-progress",
    name: "Udemy Reset Progress",
    stores: "Chrome, Edge, Firefox",
    since: "Feb 2025",
    what: "Reset or complete Udemy course progress in one click.",
    users: 1845,
    rating: 5,
    ratings: 25,
    installs: {
      store: "Chrome",
      from: "2026-04-28",
      weekly: [
        35, 53, 45, 46, 44, 38, 36, 26, 35, 33, 41, 28, 31, 35, 32, 23, 28, 29,
        38, 25, 31, 48, 32, 37, 32,
      ],
    },
  },
  {
    slug: "quizlet-quicklist",
    name: "Quizlet QuickList",
    stores: "Chrome, Edge, Firefox",
    since: "Oct 2024",
    what: "Manage Quizlet word lists faster.",
    users: 343,
    rating: 4.7,
    ratings: 6,
    installs: {
      store: "Chrome",
      from: "2026-04-28",
      weekly: [
        11, 20, 23, 22, 19, 14, 14, 18, 13, 9, 13, 9, 14, 9, 14, 12, 11, 15, 9,
        14, 18, 20, 13, 19, 21,
      ],
    },
  },
];

export type Project = (typeof projects)[number];
