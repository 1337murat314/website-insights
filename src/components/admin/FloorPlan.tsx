import { useEffect, useRef, useState, useCallback } from "react";
import { Canvas as FabricCanvas, Rect, Circle, FabricText, Group } from "fabric";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, RotateCcw, ZoomIn, ZoomOut, Grid3X3 } from "lucide-react";

interface RestaurantTable {
  id: string;
  table_number: string;
  capacity: number;
  location: string | null;
  is_available: boolean;
  pos_x: number;
  pos_y: number;
}

interface TodayReservation {
  id: string;
  guest_name: string;
  party_size: number;
  reservation_time: string;
  status: string;
  table_id: string | null;
}

interface FloorPlanProps {
  tables: RestaurantTable[];
  onTableUpdate: () => void;
}

const FloorPlan = ({ tables, onTableUpdate }: FloorPlanProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [reservations, setReservations] = useState<TodayReservation[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const tableObjectsRef = useRef<Map<string, Group>>(new Map());

  // Fetch today's reservations
  useEffect(() => {
    const fetchReservations = async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("reservations")
        .select("id, guest_name, party_size, reservation_time, status, table_id")
        .eq("reservation_date", today)
        .in("status", ["pending", "confirmed"]);
      setReservations(data || []);
    };
    fetchReservations();
  }, []);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const canvas = new FabricCanvas(canvasRef.current, {
      width: container.clientWidth,
      height: 500,
      backgroundColor: "#faf9f6",
      selection: true,
    });

    setFabricCanvas(canvas);

    const handleResize = () => {
      canvas.setWidth(container.clientWidth);
      canvas.renderAll();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.dispose();
    };
  }, []);

  // Create table objects
  const createTableObject = useCallback((table: RestaurantTable, reservation?: TodayReservation) => {
    const isOccupied = !!reservation;
    const isReserved = reservation?.status === "confirmed";
    const isPending = reservation?.status === "pending";
    
    // Determine colors based on status
    let fillColor = table.is_available ? "#22c55e" : "#9ca3af"; // green or gray
    let strokeColor = "#166534";
    
    if (isReserved) {
      fillColor = "#f97316"; // orange for confirmed
      strokeColor = "#c2410c";
    } else if (isPending) {
      fillColor = "#eab308"; // yellow for pending
      strokeColor = "#a16207";
    } else if (!table.is_available) {
      fillColor = "#ef4444"; // red for occupied/unavailable
      strokeColor = "#b91c1c";
    }

    // Table shape based on capacity
    const size = 40 + (table.capacity * 5);
    let tableShape;
    
    if (table.capacity <= 2) {
      tableShape = new Circle({
        radius: size / 2,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: 2,
        originX: "center",
        originY: "center",
      });
    } else {
      tableShape = new Rect({
        width: size,
        height: table.capacity > 4 ? size * 1.5 : size,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: 2,
        rx: 8,
        ry: 8,
        originX: "center",
        originY: "center",
      });
    }

    // Table number text
    const tableText = new FabricText(table.table_number, {
      fontSize: 14,
      fontWeight: "bold",
      fill: "#ffffff",
      originX: "center",
      originY: "center",
      top: -8,
    });

    // Capacity text
    const capacityText = new FabricText(`${table.capacity}`, {
      fontSize: 10,
      fill: "#ffffff",
      originX: "center",
      originY: "center",
      top: 8,
    });

    const group = new Group([tableShape, tableText, capacityText], {
      left: table.pos_x || 100,
      top: table.pos_y || 100,
      hasControls: false,
      hasBorders: true,
      lockRotation: true,
      lockScalingX: true,
      lockScalingY: true,
    });

    // Store table ID in the group
    (group as any).tableId = table.id;
    (group as any).tableData = table;

    return group;
  }, []);

  // Render tables on canvas
  useEffect(() => {
    if (!fabricCanvas || tables.length === 0) return;

    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#faf9f6";
    tableObjectsRef.current.clear();

    // Draw grid
    const gridSize = 50;
    const width = fabricCanvas.width || 800;
    const height = fabricCanvas.height || 500;

    for (let i = 0; i < width; i += gridSize) {
      const line = new Rect({
        left: i,
        top: 0,
        width: 1,
        height: height,
        fill: "#e5e5e5",
        selectable: false,
        evented: false,
      });
      fabricCanvas.add(line);
    }

    for (let i = 0; i < height; i += gridSize) {
      const line = new Rect({
        left: 0,
        top: i,
        width: width,
        height: 1,
        fill: "#e5e5e5",
        selectable: false,
        evented: false,
      });
      fabricCanvas.add(line);
    }

    // Add tables
    tables.forEach((table) => {
      const reservation = reservations.find((r) => r.table_id === table.id);
      const tableObj = createTableObject(table, reservation);
      tableObjectsRef.current.set(table.id, tableObj);
      fabricCanvas.add(tableObj);
    });

    fabricCanvas.renderAll();

    // Handle selection
    fabricCanvas.on("selection:created", (e) => {
      const selected = e.selected?.[0];
      if (selected && (selected as any).tableData) {
        setSelectedTable((selected as any).tableData);
      }
    });

    fabricCanvas.on("selection:updated", (e) => {
      const selected = e.selected?.[0];
      if (selected && (selected as any).tableData) {
        setSelectedTable((selected as any).tableData);
      }
    });

    fabricCanvas.on("selection:cleared", () => {
      setSelectedTable(null);
    });

    // Handle object movement
    fabricCanvas.on("object:modified", () => {
      setHasChanges(true);
    });

  }, [fabricCanvas, tables, reservations, createTableObject]);

  const savePositions = async () => {
    if (!fabricCanvas) return;

    for (const [tableId, obj] of tableObjectsRef.current.entries()) {
      const pos = obj.getCenterPoint();
      await supabase
        .from("restaurant_tables")
        .update({ pos_x: Math.round(pos.x), pos_y: Math.round(pos.y) })
        .eq("id", tableId);
    }

    toast.success("Floor plan saved!");
    setHasChanges(false);
    onTableUpdate();
  };

  const resetPositions = () => {
    onTableUpdate();
    setHasChanges(false);
    toast.info("Positions reset");
  };

  const zoomIn = () => {
    if (!fabricCanvas) return;
    const zoom = fabricCanvas.getZoom() * 1.1;
    fabricCanvas.setZoom(Math.min(zoom, 2));
  };

  const zoomOut = () => {
    if (!fabricCanvas) return;
    const zoom = fabricCanvas.getZoom() / 1.1;
    fabricCanvas.setZoom(Math.max(zoom, 0.5));
  };

  const getTableReservation = (tableId: string) => {
    return reservations.find((r) => r.table_id === tableId);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={savePositions} disabled={!hasChanges} className="gap-2">
          <Save className="h-4 w-4" /> Save Layout
        </Button>
        <Button variant="outline" onClick={resetPositions} disabled={!hasChanges} className="gap-2">
          <RotateCcw className="h-4 w-4" /> Reset
        </Button>
        <div className="flex items-center gap-1 ml-auto">
          <Button variant="outline" size="icon" onClick={zoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={zoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-500" />
          <span>Confirmed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500" />
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500" />
          <span>Unavailable</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Canvas */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-2" ref={containerRef}>
              <canvas ref={canvasRef} className="rounded-lg border border-border" />
            </CardContent>
          </Card>
        </div>

        {/* Selected Table Info */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Grid3X3 className="h-5 w-5" />
                {selectedTable ? `Table ${selectedTable.table_number}` : "Select a Table"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTable ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Capacity</span>
                      <span className="font-medium">{selectedTable.capacity} seats</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Location</span>
                      <span className="font-medium">{selectedTable.location}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant={selectedTable.is_available ? "default" : "secondary"}>
                        {selectedTable.is_available ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                  </div>

                  {(() => {
                    const res = getTableReservation(selectedTable.id);
                    if (res) {
                      return (
                        <div className="pt-4 border-t">
                          <h4 className="font-medium mb-2">Today's Reservation</h4>
                          <div className="bg-secondary/50 rounded-lg p-3 space-y-1 text-sm">
                            <p className="font-medium">{res.guest_name}</p>
                            <p className="text-muted-foreground">
                              {res.party_size} guests at {res.reservation_time}
                            </p>
                            <Badge variant={res.status === "confirmed" ? "default" : "outline"}>
                              {res.status}
                            </Badge>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          No reservations for today
                        </p>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Click on a table to view details and today's reservations
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FloorPlan;
