export function BookPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-10"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="book-pattern"
          x="0"
          y="0"
          width="120"
          height="120"
          patternUnits="userSpaceOnUse"
        >
          {/* Book icon */}
          <g transform="translate(40, 40)">
            <circle cx="20" cy="20" r="35" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
            <rect x="10" y="12" width="20" height="16" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <line x1="20" y1="12" x2="20" y2="28" stroke="currentColor" strokeWidth="1.2" />
            <line x1="14" y1="16" x2="17" y2="16" stroke="currentColor" strokeWidth="0.8" />
            <line x1="23" y1="16" x2="26" y2="16" stroke="currentColor" strokeWidth="0.8" />
            <line x1="14" y1="20" x2="17" y2="20" stroke="currentColor" strokeWidth="0.8" />
            <line x1="23" y1="20" x2="26" y2="20" stroke="currentColor" strokeWidth="0.8" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#book-pattern)" />
    </svg>
  );
}
