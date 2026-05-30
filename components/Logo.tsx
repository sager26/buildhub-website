import Image from "next/image";

// Real logo — dark-mode adapted via CSS filter (invert grays, keep hue)
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      <Image
        src="/logo-transparent.png"
        alt="BuildHub"
        width={160}
        height={44}
        priority
        style={{
          filter: "invert(1) hue-rotate(180deg)",
          objectFit: "contain",
          height: "36px",
          width: "auto",
        }}
      />
    </span>
  );
}
