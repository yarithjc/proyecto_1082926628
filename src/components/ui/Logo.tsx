export function Logo({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="StockControl"
    >
      <rect x="2" y="2" width="44" height="44" rx="10" fill="#FEE2E2" />
      <path
        d="M14 32L30 16l2 2-16 16-2-2zM30 16l4-4a3 3 0 1 1 4 4l-4 4"
        stroke="#DC2626"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M28 30l6 6"
        stroke="#DC2626"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <rect x="29" y="29" width="11" height="11" rx="2" fill="#FFFFFF" stroke="#DC2626" strokeWidth="2" />
      <path
        d="M31.5 34.5l2.5 2.5 4-4.5"
        stroke="#DC2626"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
