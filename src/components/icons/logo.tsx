import type { SVGProps } from 'react';

export function BingeTimeLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 200 50" 
      width="120" 
      height="30"
      aria-label="BingeTime Logo"
      {...props}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700&display=swap');
          .logo-text { font-family: 'Poppins', sans-serif; fill: url(#logoGradient); }
        `}
      </style>
      <text x="10" y="35" className="logo-text" fontSize="30" fontWeight="bold">
        BingeTime
      </text>
    </svg>
  );
}
