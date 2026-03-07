"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import type { Profile, Market, PriceData } from "@/types";
import { supabase } from "./supabase";
import { INITIAL_CHIPS } from "./constants";

export function useUserProfile() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrCreateProfile = useCallback(async () => {
    if (!session?.user?.id) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const userId = session.user.id;

    try {
      // Try to fetch existing profile
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("clerk_id", userId)
        .single();

      if (data && !error) {
        setProfile(data);
      } else {
        // Create new profile
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert({
            clerk_id: userId,
            username:
              session.user.name ||
              `Player${userId.slice(-4)}`,
            avatar_url: session.user.image,
            chips_balance: INITIAL_CHIPS,
          })
          .select()
          .single();

        if (newProfile && !insertError) {
          setProfile(newProfile);
        }
      }
    } catch {
      console.error("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status !== "loading") {
      fetchOrCreateProfile();
    }
  }, [status, fetchOrCreateProfile]);

  const refreshProfile = useCallback(async () => {
    if (!session?.user?.id) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("clerk_id", session.user.id)
      .single();
    if (data) setProfile(data);
  }, [session]);

  return { profile, loading, refreshProfile };
}

export function useMarkets(filter?: string) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMarkets() {
      let query = supabase
        .from("markets")
        .select("*, instrument:instruments(*)")
        .order("created_at", { ascending: false });

      if (filter && filter !== "all") {
        query = query.eq("instruments.type", filter);
      }

      const { data } = await query;
      if (data) {
        setMarkets(
          data.map((m) => ({
            ...m,
            instrument: Array.isArray(m.instrument)
              ? m.instrument[0]
              : m.instrument,
          }))
        );
      }
      setLoading(false);
    }

    fetchMarkets();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("markets-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "markets" },
        () => {
          fetchMarkets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filter]);

  return { markets, loading };
}

export function useMarket(id: string) {
  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMarket = useCallback(async () => {
    const { data } = await supabase
      .from("markets")
      .select("*, instrument:instruments(*)")
      .eq("id", id)
      .single();

    if (data) {
      setMarket({
        ...data,
        instrument: Array.isArray(data.instrument)
          ? data.instrument[0]
          : data.instrument,
      });
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchMarket();

    const channel = supabase
      .channel(`market-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "markets",
          filter: `id=eq.${id}`,
        },
        () => {
          fetchMarket();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, fetchMarket]);

  return { market, loading, refreshMarket: fetchMarket };
}

export function usePrices() {
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const res = await fetch("/api/prices");
        const data = await res.json();
        if (data.prices) setPrices(data.prices);
      } catch {
        console.error("Failed to fetch prices");
      } finally {
        setLoading(false);
      }
    }

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return { prices, loading };
}
