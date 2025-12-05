import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface Reservation {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  status: string;
  special_requests: string | null;
  notes: string | null;
  table_id: string | null;
  created_at: string;
}

export const useRealtimeReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReservations = useCallback(async () => {
    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .order("reservation_date", { ascending: true })
      .order("reservation_time", { ascending: true });

    if (!error && data) {
      setReservations(data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchReservations();

    const channel: RealtimeChannel = supabase
      .channel("reservations-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reservations",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setReservations((prev) => [...prev, payload.new as Reservation]);
          } else if (payload.eventType === "UPDATE") {
            setReservations((prev) =>
              prev.map((r) => (r.id === payload.new.id ? (payload.new as Reservation) : r))
            );
          } else if (payload.eventType === "DELETE") {
            setReservations((prev) => prev.filter((r) => r.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchReservations]);

  return { reservations, isLoading, refetch: fetchReservations };
};
