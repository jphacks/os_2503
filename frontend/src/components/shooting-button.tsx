"use client";

import { Button } from "@/components/ui/button";

import { FaCamera } from "react-icons/fa";

import Link from "next/link";

import { usePathname } from "next/navigation";

export default function ShootingButton() {
  const pathname = usePathname();
  return (
    <>
      {pathname != "/camera" && (
        <Button className="egg-up -translate-y-8 bg-white">
          <Link href="/camera">
            <FaCamera size={48} className="flex-none text-black" />
          </Link>
        </Button>
      )}
    </>
  );
}
