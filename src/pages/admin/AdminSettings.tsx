import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Settings, Bell, Clock, Globe, User, Save } from "lucide-react";

interface RestaurantSettings {
  [key: string]: string | number | boolean | undefined;
  restaurant_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  opening_hours?: string;
  closing_hours?: string;
  max_party_size?: number;
  reservation_notice_hours?: number;
  auto_confirm_reservations?: boolean;
}

const AdminSettings = () => {
  const [settings, setSettings] = useState<RestaurantSettings>({
    restaurant_name: "Califorian Restaurant",
    phone: "",
    email: "",
    address: "",
    opening_hours: "11:00",
    closing_hours: "23:00",
    max_party_size: 10,
    reservation_notice_hours: 2,
    auto_confirm_reservations: false,
  });
  const [profile, setProfile] = useState({ full_name: "", phone: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchSettings();
    fetchProfile();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from("restaurant_settings")
      .select("*");

    if (data) {
      const settingsObj: RestaurantSettings = {};
      data.forEach((row) => {
        const value = row.setting_value;
        settingsObj[row.setting_key as keyof RestaurantSettings] = 
          typeof value === "object" ? (value as any)?.value : value;
      });
      setSettings((prev) => ({ ...prev, ...settingsObj }));
    }
    setIsLoading(false);
  };

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data) setProfile(data);
  };

  const saveSetting = async (key: string, value: any) => {
    const { error } = await supabase
      .from("restaurant_settings")
      .upsert({ setting_key: key, setting_value: { value } }, { onConflict: "setting_key" });

    if (error) {
      throw error;
    }
  };

  const saveAllSettings = async () => {
    setIsSaving(true);
    try {
      await Promise.all(
        Object.entries(settings).map(([key, value]) => saveSetting(key, value))
      );
      toast({ title: "Success", description: "Settings saved" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setIsSaving(false);
  };

  const saveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update(profile)
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Profile updated" });
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your restaurant settings</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general"><Settings className="h-4 w-4 mr-2" />General</TabsTrigger>
          <TabsTrigger value="reservations"><Clock className="h-4 w-4 mr-2" />Reservations</TabsTrigger>
          <TabsTrigger value="profile"><User className="h-4 w-4 mr-2" />Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Restaurant Information</CardTitle>
                <CardDescription>Basic details about your restaurant</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Restaurant Name</Label>
                    <Input
                      value={settings.restaurant_name || ""}
                      onChange={(e) => setSettings({ ...settings, restaurant_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={settings.phone || ""}
                      onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={settings.email || ""}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input
                      value={settings.address || ""}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 mt-4">
              <CardHeader>
                <CardTitle>Operating Hours</CardTitle>
                <CardDescription>Set your restaurant's operating schedule</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Opening Time</Label>
                    <Input
                      type="time"
                      value={settings.opening_hours || ""}
                      onChange={(e) => setSettings({ ...settings, opening_hours: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Closing Time</Label>
                    <Input
                      type="time"
                      value={settings.closing_hours || ""}
                      onChange={(e) => setSettings({ ...settings, closing_hours: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end mt-4">
              <Button onClick={saveAllSettings} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="reservations" className="space-y-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Reservation Settings</CardTitle>
                <CardDescription>Configure how reservations work</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Maximum Party Size</Label>
                    <Input
                      type="number"
                      min={1}
                      value={settings.max_party_size || 10}
                      onChange={(e) => setSettings({ ...settings, max_party_size: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum Notice (Hours)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={settings.reservation_notice_hours || 2}
                      onChange={(e) => setSettings({ ...settings, reservation_notice_hours: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4 pt-4">
                  <Switch
                    checked={settings.auto_confirm_reservations}
                    onCheckedChange={(v) => setSettings({ ...settings, auto_confirm_reservations: v })}
                  />
                  <div>
                    <Label>Auto-confirm Reservations</Label>
                    <p className="text-sm text-muted-foreground">Automatically confirm new reservations</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end mt-4">
              <Button onClick={saveAllSettings} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user?.email || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={profile.full_name || ""}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={profile.phone || ""}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end mt-4">
              <Button onClick={saveProfile} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
