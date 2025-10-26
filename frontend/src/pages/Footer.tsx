import { Link } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Trophy,
  Users,
  Heart,
} from "lucide-react";
import logo from "@/assets/logo.png";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { path: "/", label: "Home" },
    { path: "/teams", label: "Teams" },
    { path: "/table", label: "Standings" },
    { path: "/top-scorers", label: "Top Scorers" },
    { path: "/top-assists", label: "Top Assists" },
  ];

  const tournamentInfo = [
    { label: "Teams", value: "6 Departments" },
    { label: "Matches", value: "15 Total" },
    { label: "Season", value: "2025" },
    { label: "Venue", value: "ASTU Stadium" },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Mail, href: "#", label: "Email" },
  ];

  return (
    <footer className="bg-gradient-to-br from-slate-900 to-blue-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 border-2 border-white rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-2 border-white rounded-full"></div>
      </div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <Link to="/" className="inline-block mb-6">
                <div className="flex items-center gap-3 group">
                  <div className="relative">
                    <img
                      src={logo}
                      alt="ASTU Tournament"
                      className="h-12 w-12 transition-transform group-hover:scale-110"
                    />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full border-2 border-slate-900"></div>
                  </div>
                  <div>
                    <div className="font-bold text-xl bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                      ASTU 4th Year
                    </div>
                    <div className="text-sm text-blue-200 font-medium">
                      Football Championship
                    </div>
                  </div>
                </div>
              </Link>

              <p className="text-blue-100 mb-6 leading-relaxed text-sm sm:text-base">
                Celebrating the spirit of competition and sportsmanship in the
                4th Year Football Championship. Six departments, one champion.
              </p>

              {/* Tournament Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {tournamentInfo.map((item, index) => (
                  <div
                    key={index}
                    className="text-center p-3 bg-white/5 rounded-xl backdrop-blur-sm"
                  >
                    <div className="text-lg sm:text-xl font-bold text-white">
                      {item.value}
                    </div>
                    <div className="text-xs text-blue-200 font-medium">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                Quick Links
              </h3>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-blue-100 hover:text-white transition-colors duration-300 flex items-center gap-2 group text-sm sm:text-base"
                    >
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full group-hover:scale-150 transition-transform"></div>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Phone className="h-5 w-5 text-green-400" />
                Contact Info
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-blue-100">
                  <MapPin className="h-5 w-5 text-blue-400 flex-shrink-0" />
                  <span className="text-sm sm:text-base">
                    Adama Science and Technology University
                  </span>
                </div>
                <div className="flex items-center gap-3 text-blue-100">
                  <Phone className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span className="text-sm sm:text-base">+251 123 456 789</span>
                </div>
                <div className="flex items-center gap-3 text-blue-100">
                  <Mail className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                  <span className="text-sm sm:text-base">
                    sports@astu.edu.et
                  </span>
                </div>
              </div>

              {/* Social Links */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-blue-200 mb-4">
                  Follow the Championship
                </h4>
                <div className="flex gap-3">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={social.label}
                        href={social.href}
                        className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg group"
                        aria-label={social.label}
                      >
                        <Icon className="h-5 w-5 text-blue-200 group-hover:text-white transition-colors" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Championship Highlights */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
                Championship
              </h3>
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                  <div className="text-sm text-blue-200 mb-1">
                    Current Leader
                  </div>
                  <div className="font-bold text-white text-lg">
                    Computer Science
                  </div>
                  <div className="text-xs text-blue-300">
                    15 Points • 5 Wins
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                  <div className="text-sm text-blue-200 mb-1">Top Scorer</div>
                  <div className="font-bold text-white text-lg">
                    Alemayehu T.
                  </div>
                  <div className="text-xs text-blue-300">
                    8 Goals • 3 Assists
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 text-center">
                  <div className="text-sm font-semibold mb-1">NEXT MATCH</div>
                  <div className="font-bold text-white">CS vs IS</div>
                  <div className="text-xs text-blue-100">
                    Tomorrow • 4:00 PM
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="text-blue-200 text-sm">
                © {currentYear} ASTU 4th Year Football Championship. All rights
                reserved.
              </div>

              <div className="flex items-center gap-4 text-blue-200 text-sm">
                <Link
                  to="/privacy"
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/terms"
                  className="hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
                <div className="flex items-center gap-1">
                  <span>Made with</span>
                  <Heart className="h-4 w-4 text-red-400 fill-current" />
                  <span>for ASTU</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
