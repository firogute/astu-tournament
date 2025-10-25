import { matches, teams, players } from "@/lib/mockData";
import { MatchCard } from "@/components/MatchCard";
import { LeagueTable } from "@/components/LeagueTable";
import { TopScorers } from "@/components/TopScorers";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  TrendingUp,
  Trophy,
  Zap,
  Calendar,
  Star,
} from "lucide-react";
import heroImage from "@/assets/hero-stadium.jpg";

const Index = () => {
  const liveMatches = matches.filter(
    (m) =>
      m.status === "live" ||
      m.status === "first_half" ||
      m.status === "second_half"
  );
  const upcomingMatches = matches
    .filter((m) => m.status === "scheduled")
    .slice(0, 3);
  const recentMatches = matches
    .filter((m) => m.status === "finished")
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
      {/* Hero Section */}
      <section
        className="relative h-[50vh] sm:h-[60vh] lg:h-[70vh] flex items-center justify-center bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/80" />
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-6xl mx-auto w-full">
          <div className="bg-white/10 dark:bg-slate-900/20 backdrop-blur-sm rounded-3xl p-6 sm:p-8 md:p-12 border border-white/20 shadow-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-4 sm:mb-6">
              The Final Year Showdown
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
              ASTU 4th Year Football Championship 2025
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-8 py-3 text-base sm:text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 border-0"
            >
              View Full Schedule
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-8 sm:py-12 lg:py-16 space-y-12 sm:space-y-16 lg:space-y-20">
        {/* Live Matches */}
        {liveMatches.length > 0 && (
          <section className="fade-in">
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="font-bold text-sm sm:text-base">LIVE NOW</span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">
                Live Matches
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {liveMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Matches */}
        <section className="fade-in">
          <div className="flex flex-wrap items-center justify-between mb-6 sm:mb-8 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">
                Upcoming Matches
              </h2>
            </div>
            <Button
              variant="ghost"
              className="gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl"
            >
              View All
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {upcomingMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>

        {/* Recent Results */}
        {recentMatches.length > 0 && (
          <section className="fade-in">
            <div className="flex flex-wrap items-center justify-between mb-6 sm:mb-8 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                  <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">
                  Recent Results
                </h2>
              </div>
              <Button
                variant="ghost"
                className="gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl"
              >
                View All
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {recentMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </section>
        )}

        {/* League Standings & Top Performers */}
        <section className="grid lg:grid-cols-3 gap-6 sm:gap-8 fade-in">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">
                League Standings
              </h2>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <LeagueTable teams={teams} />
            </div>
          </div>

          <div className="space-y-6 sm:space-y-8">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
              <TopScorers players={players} type="goals" />
            </div>
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
              <TopScorers players={players} type="assists" />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-center fade-in shadow-2xl relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 w-20 h-20 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-4 right-4 w-16 h-16 border-2 border-white rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white rounded-full"></div>
          </div>

          <div className="relative z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Star className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-3 sm:mb-4 drop-shadow-lg">
              Join the Championship
            </h2>
            <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 opacity-90 max-w-2xl mx-auto leading-relaxed">
              Follow your favorite teams, track live scores, and never miss a
              moment of the action
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 rounded-full px-6 sm:px-8 py-3 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-0"
              >
                View Teams
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600 rounded-full px-6 sm:px-8 py-3 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Match Schedule
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
