// constants/eventCategories.js
import {
  Target,
  CreditCard,
  ArrowLeftRight,
  CornerDownLeft,
  Zap,
  Flag,
  Stethoscope,
  Video,
} from "lucide-react";
import { FaFootballBall } from "react-icons/fa";

export const eventCategories = {
  goals: [
    {
      type: "goal",
      label: "Goal",
      icon: Target,
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      type: "penalty_goal",
      label: "Penalty Goal",
      icon: FaFootballBall,
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      type: "own_goal",
      label: "Own Goal",
      icon: Target,
      color: "bg-red-500 hover:bg-red-600",
    },
  ],
  cards: [
    {
      type: "yellow_card",
      label: "Yellow Card",
      icon: CreditCard,
      color: "bg-yellow-500 hover:bg-yellow-600",
    },
    {
      type: "red_card",
      label: "Red Card",
      icon: CreditCard,
      color: "bg-red-500 hover:bg-red-600",
    },
    {
      type: "second_yellow",
      label: "2nd Yellow",
      icon: CreditCard,
      color: "bg-orange-500 hover:bg-orange-600",
    },
  ],
  substitutions: [
    {
      type: "substitution_in",
      label: "Substitution",
      icon: ArrowLeftRight,
      color: "bg-blue-500 hover:bg-blue-600",
    },
  ],
  other: [
    {
      type: "corner",
      label: "Corner",
      icon: CornerDownLeft,
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      type: "free_kick",
      label: "Free Kick",
      icon: Zap,
      color: "bg-yellow-500 hover:bg-yellow-600",
    },
    {
      type: "offside",
      label: "Offside",
      icon: Flag,
      color: "bg-orange-500 hover:bg-orange-600",
    },
    {
      type: "injury",
      label: "Injury",
      icon: Stethoscope,
      color: "bg-red-500 hover:bg-red-600",
    },
    {
      type: "var_decision",
      label: "VAR Decision",
      icon: Video,
      color: "bg-blue-500 hover:bg-blue-600",
    },
  ],
};
