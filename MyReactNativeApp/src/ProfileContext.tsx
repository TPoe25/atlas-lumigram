import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { uploadAvatarImage } from "./uploadImage";

export type Profile = {
  username: string;
  avatarUri: string | null;
};

type ProfileCtx = {
  profile: Profile;
  loading: boolean;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
};

const Ctx = createContext<ProfileCtx | null>(null);

function defaultUsernameForUser(user: User | null) {
  const fromEmail = user?.email?.split("@")[0]?.trim();
  if (fromEmail) return fromEmail.toLowerCase();
  const fromUid = user?.uid ? `user_${user.uid.slice(0, 6)}` : "lumigram_user";
  return fromUid;
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile>({
    username: "lumigram_user",
    avatarUri: null,
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      if (!user) {
        setProfile({ username: "lumigram_user", avatarUri: null });
        setLoading(false);
        return;
      }

      setLoading(true);
      const ref = doc(db, "profiles", user.uid);
      const snap = await getDoc(ref);
      const fallbackUsername = defaultUsernameForUser(user);

      if (!snap.exists()) {
        const initial = { username: fallbackUsername, avatarUri: null };
        if (!cancelled) setProfile(initial);
        await setDoc(
          ref,
          {
            uid: user.uid,
            email: user.email ?? null,
            username: fallbackUsername,
            avatarUrl: null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        if (!cancelled) setLoading(false);
        return;
      }

      const data = snap.data() as { username?: string; avatarUrl?: string | null };
      if (!cancelled) {
        setProfile({
          username: (data.username ?? fallbackUsername).trim() || fallbackUsername,
          avatarUri: data.avatarUrl ?? null,
        });
        setLoading(false);
      }
    }

    loadProfile().catch((e) => {
      console.error("Profile load failed:", e);
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const value = useMemo(
    () => ({
      profile,
      loading,
      updateProfile: async (updates: Partial<Profile>) => {
        if (!user) throw new Error("You must be signed in.");

        let nextAvatar: string | null = profile.avatarUri;
        if (Object.prototype.hasOwnProperty.call(updates, "avatarUri")) {
          const candidate = updates.avatarUri ?? null;
          if (candidate && candidate.startsWith("file:")) {
            nextAvatar = await uploadAvatarImage({ uid: user.uid, imageUri: candidate });
          } else {
            nextAvatar = candidate;
          }
        }

        const nextUsername =
          updates.username?.trim() || profile.username || defaultUsernameForUser(user);

        const next: Profile = {
          username: nextUsername,
          avatarUri: nextAvatar,
        };

        setProfile(next);

        await setDoc(
          doc(db, "profiles", user.uid),
          {
            uid: user.uid,
            email: user.email ?? null,
            username: next.username,
            avatarUrl: next.avatarUri ?? null,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      },
    }),
    [profile, loading, user]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProfile() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useProfile must be used inside ProfileProvider");
  return ctx;
}
