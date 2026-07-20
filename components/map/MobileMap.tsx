/**
 * Portrait schematic map from the mobile design handoff (Mobile.dc.html, 390×470).
 * Shown below ~640px instead of the interactive Leaflet map — tile-map labels
 * become illegible at phone widths.
 */
export default function MobileMap() {
  return (
    <svg
      viewBox="0 0 390 470"
      className="mobile-map"
      role="img"
      aria-label="Map of River North around 401 W. Ontario"
    >
      <rect x="0" y="0" width="390" height="470" fill="#14120F" />
      <path
        d="M 30,0 C 45,110 55,260 100,375 C 118,415 155,428 195,430 L 390,430"
        fill="none"
        stroke="#26333A"
        strokeWidth="26"
        strokeLinecap="round"
      />
      <path
        d="M 30,0 C 45,110 55,260 100,375 C 118,415 155,428 195,430 L 390,430"
        fill="none"
        stroke="#3E5560"
        strokeWidth="1.5"
        opacity="0.6"
      />
      <g stroke="#3A362F" strokeWidth="1.2">
        <line x1="62" y1="50" x2="390" y2="50" />
        <line x1="70" y1="150" x2="390" y2="150" />
        <line x1="76" y1="250" x2="390" y2="250" />
        <line x1="86" y1="300" x2="390" y2="300" />
        <line x1="150" y1="405" x2="390" y2="405" />
        <line x1="118" y1="10" x2="118" y2="390" />
        <line x1="185" y1="0" x2="185" y2="412" />
        <line x1="252" y1="0" x2="252" y2="412" />
        <line x1="320" y1="0" x2="320" y2="412" />
      </g>
      <g
        fill="#6E675B"
        style={{ fontFamily: 'var(--font-body)' }}
        fontSize="10"
        letterSpacing="1.2"
        paintOrder="stroke"
        stroke="#14120F"
        strokeWidth="4"
      >
        <text x="382" y="44" textAnchor="end">CHICAGO AVE</text>
        <text x="382" y="144" textAnchor="end">ONTARIO ST</text>
        <text x="382" y="244" textAnchor="end">OHIO ST</text>
        <text x="382" y="294" textAnchor="end">GRAND AVE</text>
        <text x="382" y="399" textAnchor="end">KINZIE ST</text>
        <text x="124" y="230" transform="rotate(90 124 230)">SEDGWICK ST</text>
        <text x="191" y="60" transform="rotate(90 191 60)">ORLEANS ST</text>
        <text x="258" y="60" transform="rotate(90 258 60)">FRANKLIN ST</text>
        <text x="326" y="60" transform="rotate(90 326 60)">WELLS ST</text>
      </g>
      <text
        x="70"
        y="200"
        fill="#5D7885"
        style={{ fontFamily: 'var(--font-body)' }}
        fontSize="10"
        letterSpacing="1.6"
        transform="rotate(70 70 200)"
        paintOrder="stroke"
        stroke="#14120F"
        strokeWidth="4"
      >
        CHICAGO RIVER
      </text>
      <text
        x="230"
        y="458"
        fill="#5D7885"
        style={{ fontFamily: 'var(--font-body)' }}
        fontSize="10"
        letterSpacing="1.6"
      >
        MAIN BRANCH
      </text>
      <g style={{ fontFamily: 'var(--font-body)' }} paintOrder="stroke" stroke="#14120F" strokeWidth="4">
        <circle cx="252" cy="50" r="5" fill="#14120F" stroke="#8A7B5C" strokeWidth="1.8" />
        <text x="243" y="72" fill="#B0A793" fontSize="10" fontWeight="600">BROWN LINE</text>
        <circle cx="376" cy="50" r="5" fill="#14120F" stroke="#8A7B5C" strokeWidth="1.8" />
        <text x="382" y="76" fill="#B0A793" fontSize="10" fontWeight="600" textAnchor="end">WHOLE FOODS</text>
        <circle cx="72" cy="105" r="5" fill="#14120F" stroke="#8A7B5C" strokeWidth="1.8" />
        <text x="84" y="100" fill="#B0A793" fontSize="10" fontWeight="600">WARD PARK</text>
        <circle cx="140" cy="392" r="5" fill="#14120F" stroke="#8A7B5C" strokeWidth="1.8" />
        <text x="152" y="386" fill="#B0A793" fontSize="10" fontWeight="600">EAST BANK CLUB</text>
        <circle cx="320" cy="430" r="5" fill="#14120F" stroke="#8A7B5C" strokeWidth="1.8" />
        <text x="314" y="416" fill="#B0A793" fontSize="10" fontWeight="600" textAnchor="end">MERCHANDISE MART</text>
      </g>
      <g style={{ fontFamily: 'var(--font-heading)' }} paintOrder="stroke" stroke="#14120F" strokeWidth="4">
        <rect x="108" y="140" width="22" height="22" fill="#B4553C" stroke="none" />
        <rect x="108" y="140" width="22" height="22" fill="none" stroke="#EDE6DB" strokeWidth="1.2" />
        <text x="138" y="150" fill="#EDE6DB" fontSize="14" fontWeight="700" letterSpacing="1.2">BIRKEN LOFTS</text>
        <text x="138" y="164" fill="#8F8677" fontSize="9" style={{ fontFamily: 'var(--font-body)' }} letterSpacing="0.8">401 W. ONTARIO ST</text>
      </g>
    </svg>
  );
}
