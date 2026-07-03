const games = [
  { href: "/lotto", label: "Lotto" },
  { href: "/vikinglotto", label: "Vikinglotto" },
  { href: "/eurojackpot", label: "Eurojackpot" },
  { href: "/joker", label: "Joker" },
];

export default function Home() {
  return (
    <div style={{ fontFamily: "Georgia, serif", maxWidth: 640, margin: "0 auto", padding: 40 }}>
      <h1 style={{ fontSize: 32 }}>Lottoresultater</h1>
      <p style={{ fontFamily: "system-ui, sans-serif", color: "#555" }}>
        Velg spill for å se siste vinnertall og premier.
      </p>
      <ul style={{ fontFamily: "system-ui, sans-serif", fontSize: 18, lineHeight: 2 }}>
        {games.map((g) => (
          <li key={g.href}><a href={g.href}>{g.label}</a></li>
        ))}
      </ul>
    </div>
  );
}
