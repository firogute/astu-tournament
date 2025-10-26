import { Team } from "@/lib/mockData";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trophy, Crown, Award } from "lucide-react";

interface LeagueTableProps {
  teams: Team[];
}

export function LeagueTable({ teams }: LeagueTableProps) {
  console.log(teams);
  const sortedTeams = [...teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference)
      return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />;
      case 1:
        return <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />;
      case 2:
        return <Award className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankColor = (index: number) => {
    if (index === 0)
      return "bg-gradient-to-r from-yellow-400/10 to-orange-400/10 border-l-4 border-yellow-400";
    if (index === 1)
      return "bg-gradient-to-r from-gray-400/10 to-gray-500/10 border-l-4 border-gray-400";
    if (index === 2)
      return "bg-gradient-to-r from-amber-600/10 to-amber-700/10 border-l-4 border-amber-600";
    return "hover:bg-slate-50 dark:hover:bg-slate-800/50";
  };

  return (
    <Card className="overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl shadow-lg">
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
              <TableHead
                key="pos"
                className="w-10 sm:w-12 px-2 sm:px-4 py-3 text-center font-bold text-xs sm:text-sm uppercase tracking-wide text-slate-700 dark:text-slate-300"
              >
                Pos
              </TableHead>
              <TableHead
                key="team"
                className="px-2 sm:px-4 py-3 font-bold text-xs sm:text-sm uppercase tracking-wide text-slate-700 dark:text-slate-300 min-w-[120px] sm:min-w-[150px]"
              >
                Team
              </TableHead>
              <TableHead
                key="p-mobile"
                className="w-10 px-2 py-3 text-center font-bold text-xs uppercase tracking-wide text-slate-700 dark:text-slate-300 sm:hidden"
              >
                P
              </TableHead>
              <TableHead
                key="gd-mobile"
                className="w-12 px-2 py-3 text-center font-bold text-xs uppercase tracking-wide text-slate-700 dark:text-slate-300 sm:hidden"
              >
                GD
              </TableHead>
              <TableHead
                key="pts-mobile"
                className="w-14 px-2 py-3 text-center font-bold text-xs uppercase tracking-wide text-slate-700 dark:text-slate-300 sm:hidden"
              >
                Pts
              </TableHead>
              {/* Desktop columns */}
              <TableHead
                key="p-desktop"
                className="w-8 sm:w-10 px-1 sm:px-2 py-3 text-center font-bold text-xs sm:text-sm uppercase tracking-wide text-slate-700 dark:text-slate-300 hidden sm:table-cell"
              >
                P
              </TableHead>
              <TableHead
                key="w-desktop"
                className="w-8 sm:w-10 px-1 sm:px-2 py-3 text-center font-bold text-xs sm:text-sm uppercase tracking-wide text-slate-700 dark:text-slate-300 hidden sm:table-cell"
              >
                W
              </TableHead>
              <TableHead
                key="d-desktop"
                className="w-8 sm:w-10 px-1 sm:px-2 py-3 text-center font-bold text-xs sm:text-sm uppercase tracking-wide text-slate-700 dark:text-slate-300 hidden sm:table-cell"
              >
                D
              </TableHead>
              <TableHead
                key="l-desktop"
                className="w-8 sm:w-10 px-1 sm:px-2 py-3 text-center font-bold text-xs sm:text-sm uppercase tracking-wide text-slate-700 dark:text-slate-300 hidden sm:table-cell"
              >
                L
              </TableHead>
              <TableHead
                key="gf-desktop"
                className="w-10 sm:w-12 px-1 sm:px-2 py-3 text-center font-bold text-xs sm:text-sm uppercase tracking-wide text-slate-700 dark:text-slate-300 hidden sm:table-cell"
              >
                GF
              </TableHead>
              <TableHead
                key="ga-desktop"
                className="w-10 sm:w-12 px-1 sm:px-2 py-3 text-center font-bold text-xs sm:text-sm uppercase tracking-wide text-slate-700 dark:text-slate-300 hidden sm:table-cell"
              >
                GA
              </TableHead>
              <TableHead
                key="gd-desktop"
                className="w-10 sm:w-12 px-1 sm:px-2 py-3 text-center font-bold text-xs sm:text-sm uppercase tracking-wide text-slate-700 dark:text-slate-300 hidden sm:table-cell"
              >
                GD
              </TableHead>
              <TableHead
                key="pts-desktop"
                className="w-12 sm:w-14 px-2 sm:px-3 py-3 text-center font-bold text-xs sm:text-sm uppercase tracking-wide text-slate-700 dark:text-slate-300 hidden sm:table-cell"
              >
                Pts
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTeams.map((team, index) => (
              <TableRow
                key={index}
                className={`transition-all duration-200 ${getRankColor(
                  index
                )} group`}
              >
                <TableCell className="px-2 sm:px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span
                      className={`font-bold text-xs sm:text-sm ${
                        index < 3
                          ? "text-slate-900 dark:text-white"
                          : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {index + 1}
                    </span>
                    {getRankIcon(index)}
                  </div>
                </TableCell>
                <TableCell className="px-2 sm:px-4 py-3">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="flex-shrink-0">
                      {team.logo ? (
                        <img
                          src={team.logo}
                          alt={team.name}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full" />
                      )}
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base truncate">
                      {team.name}
                    </span>
                  </div>
                </TableCell>

                {/* Mobile cells */}
                <TableCell className="px-2 py-3 text-center text-sm font-medium text-slate-700 dark:text-slate-300 sm:hidden">
                  {team.played}
                </TableCell>
                <TableCell
                  className={`px-2 py-3 text-center text-sm font-semibold sm:hidden ${
                    team.goalDifference > 0
                      ? "text-green-600 dark:text-green-400"
                      : team.goalDifference < 0
                      ? "text-red-600 dark:text-red-400"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {team.goalDifference > 0 ? "+" : ""}
                  {team.goalDifference}
                </TableCell>
                <TableCell className="px-2 py-3 text-center sm:hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black text-sm py-1 px-2 rounded-lg shadow-lg">
                    {team.points}
                  </div>
                </TableCell>

                {/* Desktop cells */}
                <TableCell className="px-1 sm:px-2 py-3 text-center text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300 hidden sm:table-cell">
                  {team.played}
                </TableCell>
                <TableCell className="px-1 sm:px-2 py-3 text-center text-sm sm:text-base font-semibold text-green-600 dark:text-green-400 hidden sm:table-cell">
                  {team.won}
                </TableCell>
                <TableCell className="px-1 sm:px-2 py-3 text-center text-sm sm:text-base font-semibold text-yellow-600 dark:text-yellow-400 hidden sm:table-cell">
                  {team.drawn}
                </TableCell>
                <TableCell className="px-1 sm:px-2 py-3 text-center text-sm sm:text-base font-semibold text-red-600 dark:text-red-400 hidden sm:table-cell">
                  {team.lost}
                </TableCell>
                <TableCell className="px-1 sm:px-2 py-3 text-center text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300 hidden sm:table-cell">
                  {team.goalsFor}
                </TableCell>
                <TableCell className="px-1 sm:px-2 py-3 text-center text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300 hidden sm:table-cell">
                  {team.goalsAgainst}
                </TableCell>
                <TableCell
                  className={`px-1 sm:px-2 py-3 text-center text-sm sm:text-base font-semibold hidden sm:table-cell ${
                    team.goalDifference > 0
                      ? "text-green-600 dark:text-green-400"
                      : team.goalDifference < 0
                      ? "text-red-600 dark:text-red-400"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {team.goalDifference > 0 ? "+" : ""}
                  {team.goalDifference}
                </TableCell>
                <TableCell className="px-2 sm:px-3 py-3 text-center hidden sm:table-cell">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black text-sm sm:text-base py-1 px-2 sm:px-3 rounded-lg shadow-lg transform group-hover:scale-105 transition-transform duration-200">
                    {team.points}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
