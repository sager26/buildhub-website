import Image from "next/image";

export default function Logo({
  className = "",
  variant = "light",
}: {
  className?: string;
  /** "light" = white logo for dark backgrounds (inverted)
   *  "dark"  = original colour logo for light backgrounds */
  variant?: "light" | "dark";
}) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      <Image
        src="/logo-transparent.png"
        alt="BuildHub"
        width={160}
        height={44}
        priority
        style={{
          filter: variant === "light" ? "invert(1) hue-rotate(180deg)" : "none",
          objectFit: "contain",
          height: "36px",
          width: "auto",
        }}
      />
    </span>
  );
}
