export function TopoPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="topo-pattern"
          x="0"
          y="0"
          width="200"
          height="200"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 0 100 Q 50 80, 100 100 T 200 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.3"
          />
          <path
            d="M 0 120 Q 50 100, 100 120 T 200 120"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.25"
          />
          <path
            d="M 0 140 Q 50 120, 100 140 T 200 140"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.2"
          />
          <ellipse cx="50" cy="50" rx="30" ry="20" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.15" />
          <ellipse cx="150" cy="150" rx="40" ry="25" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.15" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#topo-pattern)" />
    </svg>
  );
}
