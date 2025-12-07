import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

type AuditAction = 
  | 'order_created'
  | 'order_status_changed'
  | 'order_cancelled'
  | 'order_completed'
  | 'order_served'
  | 'order_item_added'
  | 'order_item_updated'
  | 'order_item_deleted'
  | 'order_deleted'
  | 'service_request_created'
  | 'service_request_completed'
  | 'table_closed'
  | 'reservation_created'
  | 'reservation_updated'
  | 'reservation_cancelled'
  | 'menu_item_created'
  | 'menu_item_updated'
  | 'menu_item_deleted'
  | 'category_created'
  | 'category_updated'
  | 'category_deleted'
  | 'promo_code_created'
  | 'promo_code_updated'
  | 'staff_login_created'
  | 'staff_login_updated'
  | 'settings_updated';

interface AuditLogParams {
  action: AuditAction;
  tableName: string;
  recordId?: string;
  oldData?: Json | null;
  newData?: Json | null;
  userId?: string | null;
}

export const logAuditEvent = async ({
  action,
  tableName,
  recordId,
  oldData = null,
  newData = null,
  userId = null,
}: AuditLogParams): Promise<void> => {
  try {
    // Get user session if available
    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = userId || session?.user?.id || null;

    await supabase.from("audit_logs").insert([{
      action,
      table_name: tableName,
      record_id: recordId || null,
      old_data: oldData,
      new_data: newData,
      user_id: currentUserId,
      ip_address: null,
    }]);
  } catch (error) {
    console.error("Failed to log audit event:", error);
  }
};

// Helper functions for common order events
export const logOrderCreated = async (orderId: string, orderData: Json) => {
  await logAuditEvent({
    action: 'order_created',
    tableName: 'orders',
    recordId: orderId,
    newData: orderData,
  });
};

export const logOrderStatusChanged = async (
  orderId: string, 
  oldStatus: string, 
  newStatus: string,
  orderNumber?: number,
  tableNumber?: string | null
) => {
  await logAuditEvent({
    action: 'order_status_changed',
    tableName: 'orders',
    recordId: orderId,
    oldData: { status: oldStatus, order_number: orderNumber, table_number: tableNumber },
    newData: { status: newStatus, order_number: orderNumber, table_number: tableNumber },
  });
};

export const logOrderCancelled = async (
  orderId: string, 
  orderNumber?: number,
  tableNumber?: string | null,
  reason?: string
) => {
  await logAuditEvent({
    action: 'order_cancelled',
    tableName: 'orders',
    recordId: orderId,
    oldData: { order_number: orderNumber, table_number: tableNumber },
    newData: { status: 'cancelled', order_number: orderNumber, table_number: tableNumber, cancel_reason: reason },
  });
};

export const logOrderServed = async (
  orderId: string,
  orderNumber?: number,
  tableNumber?: string | null
) => {
  await logAuditEvent({
    action: 'order_served',
    tableName: 'orders',
    recordId: orderId,
    newData: { status: 'served', order_number: orderNumber, table_number: tableNumber },
  });
};

export const logOrderCompleted = async (
  orderId: string,
  orderNumber?: number,
  tableNumber?: string | null
) => {
  await logAuditEvent({
    action: 'order_completed',
    tableName: 'orders',
    recordId: orderId,
    newData: { status: 'completed', order_number: orderNumber, table_number: tableNumber },
  });
};

export const logOrderDeleted = async (
  orderId: string,
  orderNumber?: number,
  tableNumber?: string | null
) => {
  await logAuditEvent({
    action: 'order_deleted',
    tableName: 'orders',
    recordId: orderId,
    oldData: { order_number: orderNumber, table_number: tableNumber },
  });
};

export const logOrderItemAdded = async (
  itemId: string,
  orderId: string,
  itemName: string,
  quantity: number
) => {
  await logAuditEvent({
    action: 'order_item_added',
    tableName: 'order_items',
    recordId: itemId,
    newData: { item_name: itemName, quantity, order_id: orderId },
  });
};

export const logOrderItemUpdated = async (
  itemId: string,
  itemName: string,
  oldQuantity: number,
  newQuantity: number
) => {
  await logAuditEvent({
    action: 'order_item_updated',
    tableName: 'order_items',
    recordId: itemId,
    oldData: { item_name: itemName, quantity: oldQuantity },
    newData: { item_name: itemName, quantity: newQuantity },
  });
};

export const logOrderItemDeleted = async (
  itemId: string,
  itemName: string,
  quantity: number
) => {
  await logAuditEvent({
    action: 'order_item_deleted',
    tableName: 'order_items',
    recordId: itemId,
    oldData: { item_name: itemName, quantity },
  });
};

export const logTableClosed = async (
  tableNumber: string,
  totalAmount: number,
  orderCount: number
) => {
  await logAuditEvent({
    action: 'table_closed',
    tableName: 'orders',
    newData: { table_number: tableNumber, total_amount: totalAmount, order_count: orderCount },
  });
};

export const logServiceRequest = async (
  requestId: string,
  requestType: string,
  tableNumber: string,
  status: 'created' | 'completed'
) => {
  await logAuditEvent({
    action: status === 'created' ? 'service_request_created' : 'service_request_completed',
    tableName: 'service_requests',
    recordId: requestId,
    newData: { request_type: requestType, table_number: tableNumber, status },
  });
};

export const logReservationCreated = async (
  reservationId: string,
  guestName: string,
  date: string,
  time: string,
  partySize: number
) => {
  await logAuditEvent({
    action: 'reservation_created',
    tableName: 'reservations',
    recordId: reservationId,
    newData: { guest_name: guestName, date, time, party_size: partySize },
  });
};

export const logReservationUpdated = async (
  reservationId: string,
  oldStatus: string,
  newStatus: string,
  guestName?: string
) => {
  await logAuditEvent({
    action: 'reservation_updated',
    tableName: 'reservations',
    recordId: reservationId,
    oldData: { status: oldStatus, guest_name: guestName },
    newData: { status: newStatus, guest_name: guestName },
  });
};

export const logReservationCancelled = async (
  reservationId: string,
  guestName: string
) => {
  await logAuditEvent({
    action: 'reservation_cancelled',
    tableName: 'reservations',
    recordId: reservationId,
    oldData: { guest_name: guestName },
  });
};

export const logMenuItemChange = async (
  action: 'menu_item_created' | 'menu_item_updated' | 'menu_item_deleted',
  itemId: string,
  itemName?: string,
  changes?: string
) => {
  await logAuditEvent({
    action,
    tableName: 'menu_items',
    recordId: itemId,
    newData: { item_name: itemName, changes },
  });
};

export const logCategoryChange = async (
  action: 'category_created' | 'category_updated' | 'category_deleted',
  categoryId: string,
  categoryName?: string
) => {
  await logAuditEvent({
    action,
    tableName: 'menu_categories',
    recordId: categoryId,
    newData: { category_name: categoryName },
  });
};
