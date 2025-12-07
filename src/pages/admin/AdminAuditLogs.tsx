import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ScrollText, Search, Filter, Database, User, Clock } from "lucide-react";
import { format } from "date-fns";

import type { Json } from "@/integrations/supabase/types";

interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  old_data: Json;
  new_data: Json;
  ip_address: string | null;
  created_at: string;
}

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [tableFilter, setTableFilter] = useState("all");

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchQuery, actionFilter, tableFilter]);

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      toast.error("Failed to fetch audit logs");
      return;
    }
    setLogs(data || []);
    setIsLoading(false);
  };

  const filterLogs = () => {
    let filtered = [...logs];

    if (searchQuery) {
      filtered = filtered.filter(
        (log) =>
          log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.table_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.record_id?.includes(searchQuery)
      );
    }

    if (actionFilter !== "all") {
      filtered = filtered.filter((log) => log.action === actionFilter);
    }

    if (tableFilter !== "all") {
      filtered = filtered.filter((log) => log.table_name === tableFilter);
    }

    setFilteredLogs(filtered);
  };

  const uniqueActions = [...new Set(logs.map((log) => log.action))];
  const uniqueTables = [...new Set(logs.map((log) => log.table_name))];

  const getActionBadge = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('created') || actionLower.includes('insert') || actionLower === 'create') {
      return <Badge className="bg-green-500/10 text-green-500">{action.replace(/_/g, ' ')}</Badge>;
    }
    if (actionLower.includes('updated') || actionLower.includes('changed') || actionLower === 'update') {
      return <Badge className="bg-blue-500/10 text-blue-500">{action.replace(/_/g, ' ')}</Badge>;
    }
    if (actionLower.includes('deleted') || actionLower.includes('cancelled') || actionLower === 'delete') {
      return <Badge className="bg-destructive/10 text-destructive">{action.replace(/_/g, ' ')}</Badge>;
    }
    if (actionLower.includes('served') || actionLower.includes('completed') || actionLower.includes('closed')) {
      return <Badge className="bg-primary/10 text-primary">{action.replace(/_/g, ' ')}</Badge>;
    }
    return <Badge variant="outline">{action.replace(/_/g, ' ')}</Badge>;
  };

  const logStats = {
    total: logs.length,
    creates: logs.filter((l) => ["create", "insert"].includes(l.action.toLowerCase())).length,
    updates: logs.filter((l) => l.action.toLowerCase() === "update").length,
    deletes: logs.filter((l) => l.action.toLowerCase() === "delete").length,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold flex items-center gap-2">
          <ScrollText className="h-8 w-8 text-primary" />
          Audit Logs
        </h1>
        <p className="text-muted-foreground mt-1">Track all system activity and changes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Logs", value: logStats.total, icon: Database, color: "text-primary" },
          { label: "Creates", value: logStats.creates, icon: ScrollText, color: "text-green-500" },
          { label: "Updates", value: logStats.updates, icon: Clock, color: "text-blue-500" },
          { label: "Deletes", value: logStats.deletes, icon: User, color: "text-destructive" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={tableFilter} onValueChange={setTableFilter}>
              <SelectTrigger className="w-[180px]">
                <Database className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Table" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tables</SelectItem>
                {uniqueTables.map((table) => (
                  <SelectItem key={table} value={table}>
                    {table}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>
            Showing {filteredLogs.length} of {logs.length} records
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Record ID</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(log.created_at), "MMM d, HH:mm:ss")}
                      </div>
                    </TableCell>
                    <TableCell>{getActionBadge(log.action)}</TableCell>
                    <TableCell>
                      <code className="bg-secondary px-2 py-1 rounded text-xs">
                        {log.table_name}
                      </code>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground font-mono">
                        {log.record_id ? log.record_id.slice(0, 8) + "..." : "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground font-mono">
                        {log.user_id ? log.user_id.slice(0, 8) + "..." : "System"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {log.ip_address || "-"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredLogs.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No audit logs found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuditLogs;
