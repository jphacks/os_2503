"use client";

import { SignedIn, UserButton, useUser } from "@clerk/nextjs";

export default function MyProfile() {
  const { user } = useUser();

  return (
    <div className="flex h-25 w-fit items-center justify-center gap-x-2 rounded-2xl bg-white p-2 shadow-2xl">
      <SignedIn>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-[80px]! h-[80px]!",
            },
          }}
        />
      </SignedIn>
      <div className="my-auto text-center font-bold">
        <p className="font-semibold text-gray-800">
          {user?.fullName ||
            user?.username ||
            user?.primaryEmailAddress?.emailAddress ||
            "?"}
        </p>
        <p>Crack Master</p>
      </div>
    </div>
  );
}
