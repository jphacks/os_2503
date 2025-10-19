import { Map, MapMarker, MapPopup, MapTileLayer } from "@/components/ui/map";
import { fetchMockMapPageData } from "@/lib/api";
import Image from "next/image";
import { JSX } from "react";
import { FaMapMarker } from "react-icons/fa";

const SEVERITY_ICONS: Record<string, JSX.Element> = {
  "1": <FaMapMarker size={24} color={"#44DD44"} />,
  "2": <FaMapMarker size={24} color={"#EEEE44"} />,
  "3": <FaMapMarker size={24} color={"#DD4444"} />,
};

export default async function MapPage() {
  const mapPageData = await fetchMockMapPageData();

  return (
    <Map
      center={[34.650192402615914, 135.58809239603212]}
      className="h-screen w-full"
    >
      <MapTileLayer />
      {mapPageData.map((crack) => (
        <MapMarker
          key={crack.id}
          position={[crack.latitude, crack.longitude]}
          icon={SEVERITY_ICONS[crack.severity.toString()]}
        >
          <MapPopup>
            <div className="flex flex-row items-center gap-4">
              <Image
                src={crack.img_url}
                alt={`Crack ${crack.id}`}
                width={128}
                height={128}
                className="size-16 rounded-sm object-cover"
              />
              <div className="flex flex-col items-start">
                <p className="font-bold">危険度：{crack.severity}</p>
                <p className="font-bold">緯度：{crack.latitude}</p>
                <p className="font-bold">経度：{crack.longitude}</p>
              </div>
            </div>
          </MapPopup>
        </MapMarker>
      ))}
    </Map>
  );
}
