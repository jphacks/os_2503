import EggViewer from "@/components/egg-viewer";
import MyProfile from "@/components/my-profile";
import { Progress } from "@/components/ui/progress";
import { fetchMockHomePageData } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { VscTriangleRight } from "react-icons/vsc";

export default async function Home() {
  const crack = 100;
  const crack_need = 100;
  const aquatan_history: string[] = [
    "/test_1.png",
    "/test_2.png",
    "/test_3.png",
    "/test_4.png",
  ];

  const homePageData = await fetchMockHomePageData();

  return (
    <div className="flex flex-col items-center justify-center gap-y-4 px-8 pb-30">
      <MyProfile />
      <EggViewer
        crackUrls={homePageData.egg.cracks.map((c) => c.transparent_url)}
        className="h-80 w-80 overflow-clip rounded-2xl lg:h-96 lg:w-96"
      />
      <Progress
        value={(crack / crack_need) * 100}
        className={`${crack >= crack_need ? "[&>div]:bg-red-500" : "[&>div]:bg-[#ffc36e]"} h-4 w-[90%] bg-gray-200 lg:w-[45%]`}
      />
      <div className="flex h-30 w-[90%] items-center justify-between rounded-2xl bg-[#ffc36e] px-4 py-2 lg:w-[45%]">
        <div className="h-full w-[90%]">
          <p className="font-black">Recent Aquatans</p>
          <div className="flex justify-center gap-x-4">
            {aquatan_history.slice(0, 3).map((name, index) => (
              <div
                key={index}
                className="relative h-16 w-16 flex-shrink-0 sm:h-20 sm:w-20"
              >
                <Image
                  src={name}
                  alt={name}
                  fill
                  style={{ objectFit: "contain" }}
                  className="m-auto rounded-full"
                />
              </div>
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
