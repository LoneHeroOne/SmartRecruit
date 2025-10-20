import React from "react";
import "./InfoBadge.css";

type Props = { icon?: React.ReactNode; label: string; value: string | null | undefined };
export default function InfoBadge({ icon, label, value }: Props){
  return (
    <div className="infoBadge">
      <div className="infoBadge__icon" aria-hidden="true">{icon ?? "•"}</div>
      <div className="infoBadge__text">
        <div className="infoBadge__label">{label}</div>
        <div className="infoBadge__value">{value ?? "—"}</div>
      </div>
    </div>
  );
}
