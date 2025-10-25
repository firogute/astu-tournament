import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Play,
  Pause,
  Square,
  Target,
  CreditCard,
  ArrowLeftRight,
  CornerDownLeft,
  AlertCircle,
  Flag,
} from "lucide-react";
import { toast } from "sonner";
import { matches } from "@/lib/mockData";

const Commentary = () => {
  const [selectedMatch, setSelectedMatch] = useState("");
  const [matchMinute, setMatchMinute] = useState(0);
  const [matchStatus, setMatchStatus] = useState("paused");
  const [commentary, setCommentary] = useState("");

  const liveMatches = matches.filter((m) => m.status !== "finished");

  const handleStartHalf = (half) => {
    setMatchStatus(half);
    toast.success(`${half === "first_half" ? "First" : "Second"} half started`);
  };

  const handlePause = () => {
    setMatchStatus("paused");
    toast.info("Match paused");
  };

  const handleEndMatch = () => {
    toast.success("Match ended - final whistle");
    setMatchStatus("paused");
  };

  const handleEvent = (eventType) => {
    toast.success(`${eventType} logged at ${matchMinute}'`);
  };

  const handleAddCommentary = () => {
    if (commentary.trim()) {
      toast.success("Commentary added");
      setCommentary("");
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 space-y-10">
      <div className="text-center sm:text-left fade-in">
        <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4">
          Live Commentary Dashboard
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground">
          Real-time match event logging and commentary
        </p>
      </div>

      <Card className="p-6 fade-in">
        <h2 className="text-xl font-display font-bold mb-4">
          Select Active Match
        </h2>
        <Select value={selectedMatch} onValueChange={setSelectedMatch}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a match to commentate" />
          </SelectTrigger>
          <SelectContent>
            {liveMatches.map((match) => (
              <SelectItem key={match.id} value={match.id}>
                {match.homeTeam.name} vs {match.awayTeam.name} - {match.date}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      {selectedMatch ? (
        <div className="grid lg:grid-cols-3 gap-8 fade-in">
          <Card className="p-6 lg:col-span-2">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
              <h2 className="text-2xl font-display font-bold">Match Control</h2>
              <Badge
                className={`text-base px-4 py-2 ${
                  matchStatus === "first_half" || matchStatus === "second_half"
                    ? "bg-live pulse-live"
                    : "bg-muted"
                }`}
              >
                {matchStatus === "paused"
                  ? "PAUSED"
                  : matchStatus === "first_half"
                  ? "1ST HALF"
                  : "2ND HALF"}
              </Badge>
            </div>

            <div className="text-center mb-8 p-6 bg-muted rounded-lg">
              <div className="text-5xl sm:text-6xl font-bold font-display text-primary mb-2">
                {matchMinute}'
              </div>
              <div className="flex gap-2 justify-center mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setMatchMinute(Math.max(0, matchMinute - 1))}
                >
                  -1
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setMatchMinute(matchMinute + 1)}
                >
                  +1
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <Button
                size="lg"
                onClick={() => handleStartHalf("first_half")}
                disabled={matchStatus === "first_half"}
                className="flex items-center justify-center gap-2"
              >
                <Play className="h-5 w-5" />
                1st Half
              </Button>
              <Button
                size="lg"
                onClick={() => handleStartHalf("second_half")}
                disabled={matchStatus === "second_half"}
                className="flex items-center justify-center gap-2"
              >
                <Play className="h-5 w-5" />
                2nd Half
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handlePause}
                className="flex items-center justify-center gap-2"
              >
                <Pause className="h-5 w-5" />
                Pause
              </Button>
              <Button
                size="lg"
                variant="destructive"
                onClick={handleEndMatch}
                className="flex items-center justify-center gap-2"
              >
                <Square className="h-5 w-5" />
                End
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Button
                className="h-20 flex flex-col gap-2"
                onClick={() => handleEvent("Goal")}
              >
                <Target className="h-6 w-6" />
                <span>Goal</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={() => handleEvent("Yellow Card")}
              >
                <CreditCard className="h-6 w-6 text-yellow-500" />
                <span>Yellow</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={() => handleEvent("Red Card")}
              >
                <CreditCard className="h-6 w-6 text-destructive" />
                <span>Red</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={() => handleEvent("Substitution")}
              >
                <ArrowLeftRight className="h-6 w-6" />
                <span>Substitution</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={() => handleEvent("Corner")}
              >
                <CornerDownLeft className="h-6 w-6" />
                <span>Corner</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={() => handleEvent("Offside")}
              >
                <Flag className="h-6 w-6" />
                <span>Offside</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={() => handleEvent("Penalty")}
              >
                <AlertCircle className="h-6 w-6" />
                <span>Penalty</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={() => handleEvent("Foul")}
              >
                <AlertCircle className="h-6 w-6" />
                <span>Foul</span>
              </Button>
            </div>

            <div className="mt-8">
              <h3 className="font-display font-semibold mb-3">
                Add Text Commentary
              </h3>
              <Textarea
                value={commentary}
                onChange={(e) => setCommentary(e.target.value)}
                placeholder="Type live commentary here..."
                rows={3}
                className="mb-3"
              />
              <Button onClick={handleAddCommentary} className="w-full">
                Post Commentary
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-display font-bold mb-6">
              Event Timeline
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <Badge className="mt-1">67'</Badge>
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Goal!
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Abebe Kebede scores
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <Badge className="mt-1">52'</Badge>
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-yellow-500" />
                    Yellow Card
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Yonas Alemayehu
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <Card className="p-12 text-center fade-in">
          <p className="text-lg text-muted-foreground">
            Please select a match to begin commentary
          </p>
        </Card>
      )}
    </div>
  );
};

export default Commentary;
