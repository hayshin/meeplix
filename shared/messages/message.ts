import type {
  TLiteral,
  TObject,
  TAny,
  TSchema,
  TUnion,
  TOptional,
} from "@sinclair/typebox";
import { Type as t } from "@sinclair/typebox";

/**
 * Base schema for message metadata.
 * Provides common fields that are available on all messages.
 * Can be extended for specific message types.
 */
export const MessageMetadataSchema = t.Object({
  clientId: t.Optional(t.String()),
  timestamp: t.Optional(t.Integer({ minimum: 0 })),
  corelationId: t.Optional(t.String()),
});

/**
 * Base message schema that all specific message types extend.
 * Defines the minimum structure required for routing.
 */
export const MessageSchema = t.Object({
  type: t.String(),
  meta: t.Optional(MessageMetadataSchema),
});

/**
 * Standard error codes for WebSocket communication.
 * Used in ErrorMessage payloads for consistent error handling.
 */
export const ErrorCode = t.Union([
  t.Literal("INVALID_MESSAGE_FORMAT"), // Message isn't valid JSON or lacks required structure
  t.Literal("VALIDATION_FAILED"), // Message failed schema validation
  t.Literal("UNSUPPORTED_MESSAGE_TYPE"), // No handler registered for this message type
  t.Literal("AUTHENTICATION_FAILED"), // Client isn't authenticated or has invalid credentials
  t.Literal("AUTHORIZATION_FAILED"), // Client lacks permission for the requested action
  t.Literal("RESOURCE_NOT_FOUND"), // Requested resource (user, room, etc.) doesn't exist
  t.Literal("RATE_LIMIT_EXCEEDED"), // Client is sending messages too frequently
  t.Literal("INTERNAL_SERVER_ERROR"), // Unexpected server error occurred
]);

export type ErrorCode =
  | "INVALID_MESSAGE_FORMAT"
  | "VALIDATION_FAILED"
  | "UNSUPPORTED_MESSAGE_TYPE"
  | "AUTHENTICATION_FAILED"
  | "AUTHORIZATION_FAILED"
  | "RESOURCE_NOT_FOUND"
  | "RATE_LIMIT_EXCEEDED"
  | "INTERNAL_SERVER_ERROR";

/**
 * Standard error message schema for consistent error responses.
 */
export const ErrorMessage = messageSchema("ERROR", {
  code: ErrorCode,
  message: t.Optional(t.String()),
  context: t.Optional(t.Record(t.String(), t.Any())),
});

// -----------------------------------------------------------------------
// Type Definitions
// -----------------------------------------------------------------------

/**
 * Schema type for messages without a payload
 */
export type BaseMessageSchema<T extends string> = TObject<{
  type: TLiteral<T>;
  meta: TOptional<typeof MessageMetadataSchema>;
}>;

/**
 * Schema type for messages with a payload
 */
export type PayloadMessageSchema<
  T extends string,
  P extends TSchema,
> = TObject<{
  type: TLiteral<T>;
  meta: TOptional<typeof MessageMetadataSchema>;
  payload: P;
}>;

/**
 * Schema type for messages with custom metadata
 */
export type MessageSchemaWithCustomMeta<
  T extends string,
  M extends Record<string, TSchema>,
> = TObject<{
  type: TLiteral<T>;
  meta: TOptional<TObject<typeof MessageMetadataSchema.properties & M>>;
}>;

/**
 * Schema type for messages with both payload and custom metadata
 */
export type PayloadMessageSchemaWithCustomMeta<
  T extends string,
  P extends TSchema,
  M extends Record<string, TSchema>,
> = TObject<{
  type: TLiteral<T>;
  meta: TOptional<TObject<typeof MessageMetadataSchema.properties & M>>;
  payload: P;
}>;

// -----------------------------------------------------------------------
// Function Overloads
// -----------------------------------------------------------------------

/**
 * Creates a basic message schema with just type and standard metadata
 */
export function messageSchema<T extends string>(
  messageType: T,
): BaseMessageSchema<T>;

/**
 * Creates a message schema with a payload defined as an object
 */
export function messageSchema<
  T extends string,
  P extends Record<string, TSchema>,
>(messageType: T, payload: P): PayloadMessageSchema<T, TObject<P>>;

/**
 * Creates a message schema with a payload defined as a TypeBox schema
 */
export function messageSchema<T extends string, P extends TSchema>(
  messageType: T,
  payload: P,
): PayloadMessageSchema<T, P>;

/**
 * Creates a message schema with custom metadata
 */
export function messageSchema<
  T extends string,
  M extends Record<string, TSchema>,
>(
  messageType: T,
  payload: undefined,
  meta: TObject<M>,
): MessageSchemaWithCustomMeta<T, M>;

/**
 * Creates a message schema with an object payload and custom metadata
 */
export function messageSchema<
  T extends string,
  P extends Record<string, TSchema>,
  M extends Record<string, TSchema>,
>(
  messageType: T,
  payload: P,
  meta: TObject<M>,
): PayloadMessageSchemaWithCustomMeta<T, TObject<P>, M>;

/**
 * Creates a message schema with a TypeBox payload and custom metadata
 */
export function messageSchema<
  T extends string,
  P extends TSchema,
  M extends Record<string, TSchema>,
>(
  messageType: T,
  payload: P,
  meta: TObject<M>,
): PayloadMessageSchemaWithCustomMeta<T, P, M>;

// -----------------------------------------------------------------------
// Implementation
// -----------------------------------------------------------------------

/**
 * Creates a type-safe WebSocket message schema.
 *
 * The schema includes:
 * - A literal type field for routing messages
 * - Metadata for tracking client info and message context
 * - Optional payload for the message data
 *
 * Types are fully inferred for use with WebSocketRouter handlers.
 */
export function messageSchema<
  T extends string,
  P extends Record<string, TSchema> | TSchema | undefined = undefined,
  M extends Record<string, TSchema> = Record<string, never>,
>(
  messageType: T,
  payload?: P,
  meta?: TObject<M>,
): P extends undefined
  ? M extends Record<string, never>
    ? BaseMessageSchema<T>
    : MessageSchemaWithCustomMeta<T, M>
  : P extends Record<string, TSchema>
    ? M extends Record<string, never>
      ? PayloadMessageSchema<T, TObject<P>>
      : PayloadMessageSchemaWithCustomMeta<T, TObject<P>, M>
    : M extends Record<string, never>
      ? PayloadMessageSchema<T, P & TSchema>
      : PayloadMessageSchemaWithCustomMeta<T, P & TSchema, M> {
  // Create base schema with type and meta
  const baseMetaSchema = meta
    ? t.Object({ ...MessageMetadataSchema.properties, ...meta.properties })
    : MessageMetadataSchema;

  const baseSchema = t.Object({
    type: t.Literal(messageType),
    meta: t.Optional(baseMetaSchema),
  });

  // If no payload schema provided, return without payload
  if (payload === undefined) {
    // @ts-expect-error - TypeScript can't verify complex conditional return types
    return baseSchema;
  }

  // Determine if payload is a record of schemas or a schema itself
  const payloadSchema =
    payload && typeof payload === "object" && !("type" in payload)
      ? t.Object(payload as Record<string, TSchema>)
      : (payload as TSchema);

  // Add payload to schema
  const finalSchema = t.Object({
    ...baseSchema.properties,
    payload: payloadSchema,
  });

  // @ts-expect-error - TypeScript can't verify complex conditional return types
  return finalSchema;
}
