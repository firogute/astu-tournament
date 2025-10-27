// components/QuickStats.tsx
import { Trophy, Users, Calendar, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface QuickStatsProps {
  masterData: any;
  onTabChange: (tab: string) => void;
}

const QuickStats = ({ masterData, onTabChange }: QuickStatsProps) => {
  const stats = [
    {
      title: "Tournaments",
      value: masterData?.tournaments?.length || 0,
      description: "Active competitions",
      icon: Trophy,
      color: "#F59E0B",
      tab: "tournaments",
    },
    {
      title: "Teams",
      value: masterData?.teams?.length || 0,
      description: "Registered teams",
      icon: Users,
      color: "#3B82F6",
      tab: "teams",
    },
    {
      title: "Matches",
      value: masterData?.matches?.length || 0,
      description: "Scheduled games",
      icon: Calendar,
      color: "#10B981",
      tab: "matches",
    },
    {
      title: "Players",
      value: masterData?.players?.length || 0,
      description: "Active athletes",
      icon: UserPlus,
      color: "#EF4444",
      tab: "players",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat) => (
        <MobileCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          description={stat.description}
          icon={stat.icon}
          color={stat.color}
          onClick={() => onTabChange(stat.tab)}
        />
      ))}
    </div>
  );
};

const MobileCard = ({
  title,
  value,
  description,
  icon: Icon,
  color,
  onClick,
}: any) => (
  <Card
    className="cursor-pointer hover:shadow-lg transition-all duration-300 border-l-4"
    style={{ borderLeftColor: color }}
    onClick={onClick}
  >
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        <div
          className="p-3 rounded-full bg-opacity-10"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default QuickStats;
