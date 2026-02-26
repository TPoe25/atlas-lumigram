import React, { createContext, useContext, useMemo, useState } from "react";

export type Profile = {
  username: string;
  avatarUri: string | null; // local uri for now
};

type ProfileCtx = {
  profile: Profile;
  updateProfile: (updates: Partial<Profile>) => void;
};

const Ctx = createContext<ProfileCtx | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile>({
    username: "lumigram_user",
    avatarUri: null,
  });

  const value = useMemo(
    () => ({
      profile,
      updateProfile: (updates: Partial<Profile>) => {
        setProfile((prev) => ({ ...prev, ...updates }));
      },
    }),
    [profile]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProfile() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useProfile must be used inside ProfileProvider");
  return ctx;
}
