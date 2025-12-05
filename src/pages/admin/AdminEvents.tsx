import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PartyPopper, Plus, Edit, Trash2, Calendar, Clock, Users, DollarSign } from "lucide-react";
import { format } from "date-fns";

interface SpecialEvent {
  id: string;
  title: string;
  title_tr: string | null;
  description: string | null;
  description_tr: string | null;
  event_date: string;
  start_time: string;
  end_time: string | null;
  image_url: string | null;
  capacity: number | null;
  price: number | null;
  is_active: boolean;
  created_at: string;
}

const AdminEvents = () => {
  const [events, setEvents] = useState<SpecialEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<SpecialEvent | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    title_tr: "",
    description: "",
    description_tr: "",
    event_date: "",
    start_time: "",
    end_time: "",
    image_url: "",
    capacity: "",
    price: "",
    is_active: true,
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("special_events")
      .select("*")
      .order("event_date", { ascending: true });

    if (error) {
      toast.error("Failed to fetch events");
      return;
    }
    setEvents(data || []);
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.event_date || !formData.start_time) {
      toast.error("Title, date, and start time are required");
      return;
    }

    const eventData = {
      title: formData.title,
      title_tr: formData.title_tr || null,
      description: formData.description || null,
      description_tr: formData.description_tr || null,
      event_date: formData.event_date,
      start_time: formData.start_time,
      end_time: formData.end_time || null,
      image_url: formData.image_url || null,
      capacity: formData.capacity ? parseInt(formData.capacity) : null,
      price: formData.price ? parseFloat(formData.price) : null,
      is_active: formData.is_active,
    };

    if (editingEvent) {
      const { error } = await supabase
        .from("special_events")
        .update(eventData)
        .eq("id", editingEvent.id);

      if (error) {
        toast.error("Failed to update event");
        return;
      }
      toast.success("Event updated");
    } else {
      const { error } = await supabase.from("special_events").insert(eventData);

      if (error) {
        toast.error("Failed to create event");
        return;
      }
      toast.success("Event created");
    }

    setIsDialogOpen(false);
    resetForm();
    fetchEvents();
  };

  const handleEdit = (event: SpecialEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      title_tr: event.title_tr || "",
      description: event.description || "",
      description_tr: event.description_tr || "",
      event_date: event.event_date,
      start_time: event.start_time,
      end_time: event.end_time || "",
      image_url: event.image_url || "",
      capacity: event.capacity?.toString() || "",
      price: event.price?.toString() || "",
      is_active: event.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;

    const { error } = await supabase.from("special_events").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete event");
      return;
    }
    toast.success("Event deleted");
    fetchEvents();
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("special_events")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update status");
      return;
    }
    fetchEvents();
  };

  const resetForm = () => {
    setEditingEvent(null);
    setFormData({
      title: "",
      title_tr: "",
      description: "",
      description_tr: "",
      event_date: "",
      start_time: "",
      end_time: "",
      image_url: "",
      capacity: "",
      price: "",
      is_active: true,
    });
  };

  const upcomingEvents = events.filter((e) => new Date(e.event_date) >= new Date() && e.is_active);
  const pastEvents = events.filter((e) => new Date(e.event_date) < new Date());

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold flex items-center gap-2">
            <PartyPopper className="h-8 w-8 text-primary" />
            Special Events
          </h1>
          <p className="text-muted-foreground mt-1">Manage special events and occasions</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="gap-2">
              <Plus className="h-4 w-4" /> Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEvent ? "Edit Event" : "Create Event"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title (English) *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Wine Tasting Night"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title (Turkish)</Label>
                  <Input
                    value={formData.title_tr}
                    onChange={(e) => setFormData({ ...formData, title_tr: e.target.value })}
                    placeholder="Şarap Tadım Gecesi"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description (English)</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Join us for an exclusive wine tasting..."
                />
              </div>

              <div className="space-y-2">
                <Label>Description (Turkish)</Label>
                <Textarea
                  value={formData.description_tr}
                  onChange={(e) => setFormData({ ...formData, description_tr: e.target.value })}
                  placeholder="Özel şarap tadımımıza katılın..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start Time *</Label>
                  <Input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Capacity</Label>
                  <Input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="75.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Active</Label>
              </div>

              <Button onClick={handleSubmit} className="w-full">
                {editingEvent ? "Update Event" : "Create Event"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Events", value: events.length, icon: Calendar },
          { label: "Upcoming", value: upcomingEvents.length, icon: PartyPopper },
          { label: "Past Events", value: pastEvents.length, icon: Clock },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className="h-8 w-8 text-primary" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Events Grid */}
      <div className="space-y-6">
        {upcomingEvents.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingEvents.map((event, index) => (
                <EventCard
                  key={event.id}
                  event={event}
                  index={index}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggle={toggleActive}
                />
              ))}
            </div>
          </div>
        )}

        {pastEvents.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-muted-foreground">Past Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
              {pastEvents.map((event, index) => (
                <EventCard
                  key={event.id}
                  event={event}
                  index={index}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggle={toggleActive}
                />
              ))}
            </div>
          </div>
        )}

        {events.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <PartyPopper className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No events yet</h3>
            <p className="text-muted-foreground">Create your first special event</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface EventCardProps {
  event: SpecialEvent;
  index: number;
  onEdit: (event: SpecialEvent) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, status: boolean) => void;
}

const EventCard = ({ event, index, onEdit, onDelete, onToggle }: EventCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
  >
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {event.image_url && (
        <div className="h-40 overflow-hidden">
          <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
        </div>
      )}
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold">{event.title}</h3>
            {event.title_tr && (
              <p className="text-sm text-muted-foreground">{event.title_tr}</p>
            )}
          </div>
          <Badge variant={event.is_active ? "default" : "secondary"}>
            {event.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {format(new Date(event.event_date), "MMMM d, yyyy")}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {event.start_time}{event.end_time && ` - ${event.end_time}`}
          </div>
          {event.capacity && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {event.capacity} guests
            </div>
          )}
          {event.price && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              ${event.price}
            </div>
          )}
        </div>

        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{event.description}</p>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <Switch
            checked={event.is_active}
            onCheckedChange={() => onToggle(event.id, event.is_active)}
          />
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(event)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(event.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default AdminEvents;
