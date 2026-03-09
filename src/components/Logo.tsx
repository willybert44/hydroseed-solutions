import Image from "next/image";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/images/logos/logo.png"
        alt="Hydroseed Solutions"
        width={192}
        height={72}
        className="h-10 w-auto"
      />
    </div>
  );
}
