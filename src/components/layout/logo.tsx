import Image from "next/image";
import Link from "next/link";

/**
 * Interim lockup until the client supplies the header mark (CLIENT-QUESTIONS.md Q16): the people-mark
 * cropped from the current PNG, with the name set in type so it is legible on navy. The PNG's olive
 * wordmark is 2.5:1 on navy and is not shown.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-3 ${className}`} aria-label="Total Data Limited, home">
      <span className="relative block h-9 w-[34px] overflow-hidden" aria-hidden="true">
        <Image
          src="/brand/logo.png"
          alt=""
          width={885}
          height={268}
          sizes="120px"
          priority
          className="absolute left-0 top-0 h-9 w-auto max-w-none"
        />
      </span>
      <span className="text-[15px] font-medium leading-none">Total Data Limited</span>
    </Link>
  );
}
