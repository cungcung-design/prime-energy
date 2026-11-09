import Image from "next/image";

type IconProps = {
  src: string;
  width: number;
  height: number;
  className?: string;
};

export function Icon({ src, width, height, className }: IconProps) {
  return (
    <Image
      src={src}
      alt=""
      width={width}
      height={height}
      unoptimized
      className={`shrink-0 ${className ?? ""}`}
    />
  );
}
