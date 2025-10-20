export default function JobCount({ count }:{ count:number }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, background:"var(--bg-50)", borderRadius:"8px" }}>
      <span style={{ border: "1px solid #2a59c8ff", padding: "8px 15px", color: "#2a59c8ff", borderRadius: 8, fontSize: 14, fontWeight: 500, background: "transparent" }}>
        💼 Offer {count}
      </span>
    </div>
  );
}
