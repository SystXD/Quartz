import type {
  QuartzMessage,
  QuartzMember,
  QuartzUser,
  QuartzGuild,
  QuartzChannel,
  QuartzRole,
  QuartzInteraction,
  QuartzPresence,
  QuartzVoiceState,
  QuartzReaction,
  Snowflake,
} from "@core/lib/structures";

export const QuartzEvents = {
  READY: "ready",
  RESUMED: "resumed",
  MESSAGE_CREATE: "messageCreate",
  MESSAGE_UPDATE: "messageUpdate",
  MESSAGE_DELETE: "messageDelete",
  MESSAGE_BULK_DELETE: "messageBulkDelete",
  REACTION_ADD: "reactionAdd",
  REACTION_REMOVE: "reactionRemove",
  REACTION_REMOVE_ALL: "reactionRemoveAll",
  REACTION_REMOVE_EMOJI: "reactionRemoveEmoji",
  GUILD_CREATE: "guildCreate",
  GUILD_UPDATE: "guildUpdate",
  GUILD_DELETE: "guildDelete",
  GUILD_AVAILABLE: "guildAvailable",
  GUILD_UNAVAILABLE: "guildUnavailable",
  GUILD_MEMBER_ADD: "guildMemberAdd",
  GUILD_MEMBER_UPDATE: "guildMemberUpdate",
  GUILD_MEMBER_REMOVE: "guildMemberRemove",
  GUILD_BAN_ADD: "guildBanAdd",
  GUILD_BAN_REMOVE: "guildBanRemove",
  GUILD_ROLE_CREATE: "guildRoleCreate",
  GUILD_ROLE_UPDATE: "guildRoleUpdate",
  GUILD_ROLE_DELETE: "guildRoleDelete",
  CHANNEL_CREATE: "channelCreate",
  CHANNEL_UPDATE: "channelUpdate",
  CHANNEL_DELETE: "channelDelete",
  THREAD_CREATE: "threadCreate",
  THREAD_UPDATE: "threadUpdate",
  THREAD_DELETE: "threadDelete",
  INTERACTION_CREATE: "interactionCreate",
  PRESENCE_UPDATE: "presenceUpdate",
  VOICE_STATE_UPDATE: "voiceStateUpdate",
  TYPING_START: "typingStart",
} as const;

export type QuartzEventName = (typeof QuartzEvents)[keyof typeof QuartzEvents];

export type PartialMessage = Pick<QuartzMessage, "id" | "channelId"> &
  Partial<Omit<QuartzMessage, "id" | "channelId">>;

export type PartialMember = Pick<QuartzMember, "id" | "guildId"> &
  Partial<Omit<QuartzMember, "id" | "guildId">>;

export interface ReadyPayload {
  user: QuartzUser;
  guildCount: number;
  sessionId: string;
}

export interface MessageDeletePayload {
  id: Snowflake;
  channelId: Snowflake;
  guildId: Snowflake | null;
}

export interface MessageBulkDeletePayload {
  ids: Snowflake[];
  channelId: Snowflake;
  guildId: Snowflake | null;
}

export interface ReactionPayload {
  userId: Snowflake;
  channelId: Snowflake;
  messageId: Snowflake;
  guildId: Snowflake | null;
  reaction: QuartzReaction;
}

export interface ReactionAddPayload extends ReactionPayload {
  member: QuartzMember | null;
}

export interface ReactionRemoveAllPayload {
  channelId: Snowflake;
  messageId: Snowflake;
  guildId: Snowflake | null;
}

export interface GuildBanPayload {
  guildId: Snowflake;
  user: QuartzUser;
}

export interface GuildMemberRemovePayload {
  guildId: Snowflake;
  user: QuartzUser;
}

export interface GuildRoleDeletePayload {
  guildId: Snowflake;
  roleId: Snowflake;
}

export interface ThreadDeletePayload {
  id: Snowflake;
  guildId: Snowflake | null;
  parentId: Snowflake | null;
}

export interface TypingStartPayload {
  channelId: Snowflake;
  guildId: Snowflake | null;
  userId: Snowflake;
  timestamp: number;
  member: QuartzMember | null;
}

export interface QuartzEventMap {
  [QuartzEvents.READY]: [payload: ReadyPayload];
  [QuartzEvents.RESUMED]: [];
  [QuartzEvents.MESSAGE_CREATE]: [message: QuartzMessage];
  [QuartzEvents.MESSAGE_UPDATE]: [
    old: PartialMessage | null,
    message: QuartzMessage,
  ];
  [QuartzEvents.MESSAGE_DELETE]: [payload: MessageDeletePayload];
  [QuartzEvents.MESSAGE_BULK_DELETE]: [payload: MessageBulkDeletePayload];
  [QuartzEvents.REACTION_ADD]: [payload: ReactionAddPayload];
  [QuartzEvents.REACTION_REMOVE]: [payload: ReactionPayload];
  [QuartzEvents.REACTION_REMOVE_ALL]: [payload: ReactionRemoveAllPayload];
  [QuartzEvents.REACTION_REMOVE_EMOJI]: [
    payload: ReactionRemoveAllPayload & { reaction: QuartzReaction },
  ];
  [QuartzEvents.GUILD_CREATE]: [guild: QuartzGuild];
  [QuartzEvents.GUILD_UPDATE]: [old: QuartzGuild | null, guild: QuartzGuild];
  [QuartzEvents.GUILD_DELETE]: [id: Snowflake, unavailable: boolean];
  [QuartzEvents.GUILD_AVAILABLE]: [guild: QuartzGuild];
  [QuartzEvents.GUILD_UNAVAILABLE]: [guildId: Snowflake];
  [QuartzEvents.GUILD_MEMBER_ADD]: [member: QuartzMember];
  [QuartzEvents.GUILD_MEMBER_UPDATE]: [
    old: PartialMember | null,
    member: QuartzMember,
  ];
  [QuartzEvents.GUILD_MEMBER_REMOVE]: [payload: GuildMemberRemovePayload];
  [QuartzEvents.GUILD_BAN_ADD]: [payload: GuildBanPayload];
  [QuartzEvents.GUILD_BAN_REMOVE]: [payload: GuildBanPayload];
  [QuartzEvents.GUILD_ROLE_CREATE]: [role: QuartzRole];
  [QuartzEvents.GUILD_ROLE_UPDATE]: [old: QuartzRole | null, role: QuartzRole];
  [QuartzEvents.GUILD_ROLE_DELETE]: [payload: GuildRoleDeletePayload];
  [QuartzEvents.CHANNEL_CREATE]: [channel: QuartzChannel];
  [QuartzEvents.CHANNEL_UPDATE]: [
    old: QuartzChannel | null,
    channel: QuartzChannel,
  ];
  [QuartzEvents.CHANNEL_DELETE]: [channel: QuartzChannel];
  [QuartzEvents.THREAD_CREATE]: [thread: QuartzChannel];
  [QuartzEvents.THREAD_UPDATE]: [
    old: QuartzChannel | null,
    thread: QuartzChannel,
  ];
  [QuartzEvents.THREAD_DELETE]: [payload: ThreadDeletePayload];
  [QuartzEvents.INTERACTION_CREATE]: [interaction: QuartzInteraction];
  [QuartzEvents.PRESENCE_UPDATE]: [
    old: QuartzPresence | null,
    presence: QuartzPresence,
  ];
  [QuartzEvents.VOICE_STATE_UPDATE]: [
    old: QuartzVoiceState | null,
    state: QuartzVoiceState,
  ];
  [QuartzEvents.TYPING_START]: [payload: TypingStartPayload];
}
