import { teams } from "@/lib/mockData";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, ArrowRight } from "lucide-react";

const Teams = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 py-4 sm:py-6 lg:py-8">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 dark:from-slate-100 dark:to-blue-100 bg-clip-text text-transparent mb-3 sm:mb-4">
            Competing Teams
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-md sm:max-w-lg lg:max-w-2xl mx-auto">
            Meet the teams battling for the championship title
          </p>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {teams.map((team, index) => {
            const stats = [
              {
                label: "Points",
                value: team.points,
                color: "text-blue-600 dark:text-blue-400",
              },
              {
                label: "Wins",
                value: team.won,
                color: "text-green-600 dark:text-green-400",
              },
              {
                label: "Goals",
                value: team.goalsFor,
                color: "text-orange-600 dark:text-orange-400",
              },
            ];

            return (
              <Card
                key={team.id}
                className="p-4 sm:p-6 lg:p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl sm:hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />

                <div className="text-center">
                  <div className="text-5xl sm:text-6xl lg:text-7xl mb-4 sm:mb-6">
                    {team.logo}
                  </div>

                  <h2 className="text-xl sm:text-2xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 line-clamp-1">
                    {team.name}
                  </h2>

                  <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 text-center">
                    {stats.map((stat) => (
                      <div key={stat.label} className="space-y-1">
                        <div
                          className={`text-xl sm:text-2xl font-black ${stat.color}`}
                        >
                          {stat.value}
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground font-medium">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Link to={`/team/${team.id}`}>
                    <Button className="w-full group/btn bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 py-2 sm:py-3 text-sm sm:text-base">
                      View Team Details
                      <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="mt-8 sm:mt-12 lg:mt-16 p-6 sm:p-8 lg:p-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-2xl border-0 rounded-2xl sm:rounded-3xl text-center transform hover:scale-[1.01] sm:hover:scale-[1.02] transition-all duration-300">
          <Trophy className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 mx-auto mb-3 sm:mb-4 drop-shadow-lg" />
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 drop-shadow-md">
            Championship Glory Awaits
          </h2>
          <p className="text-sm sm:text-base lg:text-lg opacity-90 max-w-md sm:max-w-lg lg:max-w-2xl mx-auto leading-relaxed">
            Six departments competing for ultimate bragging rights. Which team
            will be crowned the 4th Year Football Champions?
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Teams;
