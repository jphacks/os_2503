export async function fetchMockHomePageData() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    id: "1",
    name: "Gakkun",
    egg: {
      id: "12345",
      user_id: "1",
      cracks: [
        {
          id: "1",
          user_id: "1",
          crack_url: "/cracks/cracks/crack-1.jpg",
          segment_url: "/cracks/segments/segment-1.jpg",
          transparent_url: "/cracks/transparents/transparent-1.png",
          latitude: 35.6895,
          longitude: 139.6917,
          created_at: "2023-01-01T00:00:00Z",
          updated_at: "2023-01-01T00:00:00Z",
        },
        {
          id: "2",
          user_id: "1",
          crack_url: "/cracks/cracks/crack-2.jpg",
          segment_url: "/cracks/segments/segment-2.jpg",
          transparent_url: "/cracks/transparents/transparent-2.png",
          latitude: 34.0522,
          longitude: -118.2437,
          created_at: "2023-01-01T00:00:00Z",
          updated_at: "2023-01-01T00:00:00Z",
        },
      ],
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
    },
  };
}
