
import { TrendingUp } from "lucide-react";

const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="absolute -left-1 top-0">
          <TrendingUp className="h-6 w-6 text-trading-loss rotate-45" />
        </div>
        <TrendingUp className="h-6 w-6 text-trading-win" />
      </div>
      <span className="text-xl font-bold bg-gradient-to-r from-trading-win via-white to-trading-loss bg-clip-text text-transparent">
        Sniper Pro Deriv
      </span>
    </div>
  );
};

export default Logo;
