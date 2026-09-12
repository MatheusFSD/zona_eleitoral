const segments = ["abcdef", "bc", "abdeg", "abcdg", "bcfg", "acdfg", "acdefg", "abc", "abcdefg", "abcdfg"];
const shapes = {
  a: "4,2 20,2 17,5 7,5",
  b: "21,3 21,18 18,16 18,6",
  c: "21,22 21,37 18,34 18,24",
  d: "4,38 20,38 17,35 7,35",
  e: "3,22 6,24 6,34 3,37",
  f: "3,3 6,6 6,16 3,18",
  g: "4,20 7,18 17,18 20,20 17,22 7,22",
};

export default function DigitalClock({ time }) {
  return <time className="digital-clock" dateTime={time} aria-label={time}>
    <svg viewBox="0 0 118 40" aria-hidden="true">
      {time.replace(":", "").split("").map((digit, i) => <g key={i} transform={`translate(${[0, 27, 67, 94][i]} 0)`}>
        {Object.entries(shapes).map(([name, points]) => <polygon key={name} points={points} className={segments[Number(digit)].includes(name) ? "lit" : ""} />)}
      </g>)}
      <rect x="57" y="11" width="4" height="4" rx=".5" className="lit" />
      <rect x="57" y="25" width="4" height="4" rx=".5" className="lit" />
    </svg>
  </time>;
}
