import Image from "next/image";

export default function Brand() {
  return (
    <div className="relative h-full min-h-[540px] w-full overflow-hidden ">
      <Image
        src="/images/logoimage.jpg"
        alt="Logo"
        fill
        priority
        sizes="(max-width: 600px) 0px, 430px"
        className="object-cover"
      />

      <div className="absolute inset-0 bg-black/15" />
    </div>
  );
}