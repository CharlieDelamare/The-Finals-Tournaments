export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-6 w-6 items-center justify-center bg-finals-gold skew-x-[-6deg]">
              <span className="skew-x-[6deg] font-display text-xs font-extrabold italic text-black">
                TF
              </span>
            </div>
            <span className="text-sm text-white/30">
              The Finals Tournaments
            </span>
          </div>
          <p className="text-xs text-white/20">
            Built with Next.js, Tailwind CSS & shadcn/ui
          </p>
        </div>
      </div>
    </footer>
  );
}
