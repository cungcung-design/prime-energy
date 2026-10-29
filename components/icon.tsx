import Image from "next/image";

type IconProps = {
  src: string;
  width: number;
  height: number;
};

export function Icon({ src, width, height }: IconProps) {
  return (
    <Image
      src={src}
      alt=""
      width={width}
      height={height}
      unoptimized
      className="shrink-0"
    />
  );
}
