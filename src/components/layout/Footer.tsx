import { Phone, User } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white px-6 py-3 text-xs text-slate-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            Eng. Ahmed Harb
          </span>
          <span className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5" />
            <a href="tel:+201095453622" className="hover:text-slate-700 transition-colors">
              010 9545 3622
            </a>
          </span>
        </div>
        <div>
          <span>
            Developed by{" "}
            <span className="font-semibold text-slate-700">Mirage E-Marketing</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
