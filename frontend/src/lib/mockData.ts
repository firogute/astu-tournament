// Mock data for the application

export interface Team {
  id: string;
  name: string;
  short_name: string;
  logo: string;
  color: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface Player {
  id: string;
  name: string;
  team: string;
  teamId: string;
  position: "GK" | "DF" | "MF" | "FW";
  jerseyNumber: number;
  photo: string;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  appearances: number;
  minutesPlayed: number;
}

export interface MatchEvent {
  id: string;
  type:
    | "goal"
    | "yellow_card"
    | "red_card"
    | "substitution"
    | "penalty"
    | "corner"
    | "offside"
    | "foul";
  minute: number;
  playerId: string;
  playerName: string;
  teamId: string;
  assistId?: string;
  assistName?: string;
  description?: string;
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  status:
    | "scheduled"
    | "live"
    | "first_half"
    | "half_time"
    | "second_half"
    | "finished";
  date: string;
  time: string;
  venue: string;
  minute?: number;
  events: MatchEvent[];
  homeLineup?: Player[];
  awayLineup?: Player[];
  homeFormation?: string;
  awayFormation?: string;
  stats: {
    possession: [number, number];
    shots: [number, number];
    shotsOnTarget: [number, number];
    corners: [number, number];
    fouls: [number, number];
    yellowCards: [number, number];
    redCards: [number, number];
  };
}

// Mock Teams
export const teams: Team[] = [
  {
    id: "team-1",
    name: "Software Engineering",
    logo: "⚡",
    color: "hsl(120 61% 34%)",
    played: 5,
    won: 4,
    drawn: 1,
    lost: 0,
    goalsFor: 12,
    goalsAgainst: 3,
    goalDifference: 9,
    points: 13,
  },
  {
    id: "team-2",
    name: "Computer Science",
    logo: "💻",
    color: "hsl(9 62% 62%)",
    played: 5,
    won: 3,
    drawn: 2,
    lost: 0,
    goalsFor: 10,
    goalsAgainst: 4,
    goalDifference: 6,
    points: 11,
  },
  {
    id: "team-3",
    name: "Information Systems",
    logo: "📊",
    color: "hsl(36 88% 65%)",
    played: 5,
    won: 3,
    drawn: 1,
    lost: 1,
    goalsFor: 9,
    goalsAgainst: 6,
    goalDifference: 3,
    points: 10,
  },
  {
    id: "team-4",
    name: "Information Technology",
    logo: "🔧",
    color: "hsl(16 67% 61%)",
    played: 5,
    won: 2,
    drawn: 1,
    lost: 2,
    goalsFor: 7,
    goalsAgainst: 7,
    goalDifference: 0,
    points: 7,
  },
  {
    id: "team-5",
    name: "Network Engineering",
    logo: "🌐",
    color: "hsl(120 45% 45%)",
    played: 5,
    won: 1,
    drawn: 2,
    lost: 2,
    goalsFor: 5,
    goalsAgainst: 8,
    goalDifference: -3,
    points: 5,
  },
  {
    id: "team-6",
    name: "Cybersecurity",
    logo: "🔒",
    color: "hsl(0 72% 51%)",
    played: 5,
    won: 0,
    drawn: 1,
    lost: 4,
    goalsFor: 3,
    goalsAgainst: 18,
    goalDifference: -15,
    points: 1,
  },
];

// Mock Players
export const players: Player[] = [
  {
    id: "p1",
    name: "Abebe Kebede",
    team: "Software Engineering",
    teamId: "team-1",
    position: "FW",
    jerseyNumber: 10,
    photo: "⚽",
    goals: 8,
    assists: 4,
    yellowCards: 1,
    redCards: 0,
    appearances: 5,
    minutesPlayed: 450,
  },
  {
    id: "p2",
    name: "Dawit Tesfaye",
    team: "Computer Science",
    teamId: "team-2",
    position: "FW",
    jerseyNumber: 9,
    photo: "⚽",
    goals: 6,
    assists: 3,
    yellowCards: 0,
    redCards: 0,
    appearances: 5,
    minutesPlayed: 430,
  },
  {
    id: "p3",
    name: "Yonas Alemayehu",
    team: "Information Systems",
    teamId: "team-3",
    position: "MF",
    jerseyNumber: 8,
    photo: "⚽",
    goals: 4,
    assists: 6,
    yellowCards: 2,
    redCards: 0,
    appearances: 5,
    minutesPlayed: 450,
  },
  {
    id: "p4",
    name: "Biniam Haile",
    team: "Software Engineering",
    teamId: "team-1",
    position: "MF",
    jerseyNumber: 7,
    photo: "⚽",
    goals: 3,
    assists: 5,
    yellowCards: 1,
    redCards: 0,
    appearances: 5,
    minutesPlayed: 440,
  },
];

// Mock Matches
export const matches: Match[] = [
  {
    id: "m1",
    homeTeam: teams[0],
    awayTeam: teams[1],
    homeScore: 2,
    awayScore: 1,
    status: "live",
    date: "2025-10-25",
    time: "15:00",
    venue: "ASTU Main Stadium",
    minute: 67,
    events: [
      {
        id: "e1",
        type: "goal",
        minute: 23,
        playerId: "p1",
        playerName: "Abebe Kebede",
        teamId: "team-1",
        assistId: "p4",
        assistName: "Biniam Haile",
      },
      {
        id: "e2",
        type: "goal",
        minute: 45,
        playerId: "p2",
        playerName: "Dawit Tesfaye",
        teamId: "team-2",
      },
      {
        id: "e3",
        type: "yellow_card",
        minute: 52,
        playerId: "p3",
        playerName: "Yonas Alemayehu",
        teamId: "team-2",
      },
      {
        id: "e4",
        type: "goal",
        minute: 61,
        playerId: "p1",
        playerName: "Abebe Kebede",
        teamId: "team-1",
      },
    ],
    stats: {
      possession: [58, 42],
      shots: [14, 9],
      shotsOnTarget: [6, 4],
      corners: [5, 3],
      fouls: [8, 12],
      yellowCards: [0, 1],
      redCards: [0, 0],
    },
  },
  {
    id: "m2",
    homeTeam: teams[2],
    awayTeam: teams[3],
    homeScore: 3,
    awayScore: 1,
    status: "finished",
    date: "2025-10-24",
    time: "14:00",
    venue: "ASTU Training Ground",
    events: [],
    stats: {
      possession: [55, 45],
      shots: [12, 8],
      shotsOnTarget: [7, 3],
      corners: [6, 2],
      fouls: [10, 14],
      yellowCards: [2, 1],
      redCards: [0, 0],
    },
  },
  {
    id: "m3",
    homeTeam: teams[4],
    awayTeam: teams[5],
    homeScore: 0,
    awayScore: 0,
    status: "scheduled",
    date: "2025-10-26",
    time: "16:30",
    venue: "ASTU Main Stadium",
    events: [],
    stats: {
      possession: [50, 50],
      shots: [0, 0],
      shotsOnTarget: [0, 0],
      corners: [0, 0],
      fouls: [0, 0],
      yellowCards: [0, 0],
      redCards: [0, 0],
    },
  },
];
