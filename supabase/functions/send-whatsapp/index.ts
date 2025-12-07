import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-internal-token",
};

interface WhatsAppRequest {
  phone: string;
  message: string;
}

// Simple rate limiting - track requests per IP
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // Max requests per minute
const RATE_WINDOW = 60000; // 1 minute in ms

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);
  
  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT) {
    return false;
  }
  
  record.count++;
  return true;
}

function validatePhoneNumber(phone: string): { valid: boolean; formatted: string; error?: string } {
  // Remove all non-digit characters
  const formattedPhone = phone.replace(/\D/g, '');
  
  // Validate length (international phone numbers are typically 10-15 digits)
  if (formattedPhone.length < 10) {
    return { valid: false, formatted: '', error: 'Phone number too short' };
  }
  
  if (formattedPhone.length > 15) {
    return { valid: false, formatted: '', error: 'Phone number too long' };
  }
  
  // Add Turkey country code if not present and appears to be a local number
  let finalPhone = formattedPhone;
  if (!formattedPhone.startsWith('90') && formattedPhone.length === 10) {
    finalPhone = '90' + formattedPhone;
  }
  
  return { valid: true, formatted: finalPhone };
}

function validateMessage(message: string): { valid: boolean; error?: string } {
  if (!message || message.trim().length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }
  
  if (message.length > 1000) {
    return { valid: false, error: 'Message too long (max 1000 characters)' };
  }
  
  return { valid: true };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      return new Response(
        JSON.stringify({ success: false, error: "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify internal token for additional security
    const internalToken = req.headers.get('x-internal-token');
    const expectedToken = Deno.env.get("WHATSAPP_INTERNAL_TOKEN");
    
    // If internal token is configured, require it
    if (expectedToken && internalToken !== expectedToken) {
      console.log("WhatsApp request rejected: invalid internal token");
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { phone, message }: WhatsAppRequest = await req.json();
    
    // Validate phone number
    if (!phone) {
      return new Response(
        JSON.stringify({ success: false, error: "Phone number is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.valid) {
      return new Response(
        JSON.stringify({ success: false, error: phoneValidation.error }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    // Validate message
    const messageValidation = validateMessage(message);
    if (!messageValidation.valid) {
      return new Response(
        JSON.stringify({ success: false, error: messageValidation.error }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const instanceId = Deno.env.get("GREEN_API_INSTANCE_ID");
    const apiToken = Deno.env.get("GREEN_API_TOKEN");

    if (!instanceId || !apiToken) {
      throw new Error("Green API credentials not configured");
    }

    const chatId = `${phoneValidation.formatted}@c.us`;
    
    // Log only non-sensitive operational info
    console.log(`WhatsApp message request - phone last 4: ...${phoneValidation.formatted.slice(-4)}`);

    const url = `https://api.green-api.com/waInstance${instanceId}/sendMessage/${apiToken}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatId: chatId,
        message: message,
      }),
    });

    const responseData = await response.json();
    
    // Log success/failure without sensitive data
    console.log(`WhatsApp API response status: ${response.ok ? 'success' : 'failed'}`);

    if (!response.ok) {
      throw new Error(`Green API error: ${response.status}`);
    }

    return new Response(JSON.stringify({ success: true, data: responseData }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-whatsapp function:", error.message);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to send message" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
