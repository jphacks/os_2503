import { randomInt } from "node:crypto";

export async function fetchMockHomePageData() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    id: "1",
    name: "Gakkun",
    egg: {
      id: "12345",
      user_id: "1",
      cracks: Array.from({ length: 6 }, (_, i) => ({
        id: (i + 1).toString(),
        user_id: "1",
        crack_url: `/cracks/crack-${i + 1}.jpg`,
        segment_url: `/cracks/segment-${i + 1}.jpg`,
        transparent_url: `/cracks/transparent-${i + 1}.png`,
        latitude: 35.0 + i,
        longitude: 135.0 + i,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      })),
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
    },
  };
}

export async function postMockCrackReport(
  imageBase64: string,
  locationData: GeolocationPosition,
) {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return {
    status: "success",
    message: "Crack report submitted successfully",
  };
}

export async function fetchMockMapPageData() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return Array.from({ length: 32 }).map((_, i) => ({
    id: (i + 1).toString(),
    img_url: `/cracks/crack-${(i % 6) + 1}.jpg`,
    seg_url: `/cracks/segment-${(i % 6) + 1}.jpg`,
    severity: (i % 3) + 1,
    latitude: 34.650192402615914 + randomInt(-100, 100) * 0.0001,
    longitude: 135.58809239603212 + randomInt(-100, 100) * 0.0001,
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
    type_id: (i % 3) + 1,
  }));
}
