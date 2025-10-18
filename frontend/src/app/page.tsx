import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import Link from "next/link";
import { VscTriangleRight } from "react-icons/vsc";

export default function Home() {
  const crack = 10;
  const crack_need = 100;
  const aquatan_history: string[] = ["あ", "い", "う", "え"];
  const user_info: [string, string] = ["Aquatan", "Crack Master"];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-y-4 px-8 pb-30 font-sans">
      <div className="flex h-25 w-fit justify-center gap-x-2 rounded-2xl p-2 shadow-2xl">
        <div className="relative h-20 w-20 flex-shrink-0">
          <Image
            src="/aquatan_test.png"
            alt="aquatan_test"
            fill
            style={{ objectFit: "contain" }}
            className="m-auto rounded-full"
          />
        </div>
        <div className="my-auto text-center font-bold">
          <p>{user_info[0]}</p>
          <p>{user_info[1]}</p>
        </div>
      </div>
      <div className="h-60 w-2/3 rounded-2xl border-2 border-black lg:w-1/3"></div>
      <Progress
        value={(crack / crack_need) * 100}
        className="h-4 w-[90%] bg-gray-200 lg:w-[45%] [&>div]:bg-amber-400"
      />
      <div className="flex h-30 w-[90%] items-center justify-between rounded-2xl bg-amber-400 px-4 py-2 lg:w-[45%]">
        <div className="h-full">
          <p className="font-black">Recent Aquatans</p>
          <div className="flex">
            {aquatan_history.slice(0, 3).map((a, index) => (
              <p key={index}>{a}</p>
            ))}
          </div>
        </div>
        <Link href="/collection">
          <VscTriangleRight size={50} color={"#000000"} />
        </Link>
      </div>
    </div>
  );
}
