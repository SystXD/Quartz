/** TODO: Update the constants and structures **/
export type Snowflake = string;
export interface QuartzBase {
  id: Snowflake;
  raw?: unknown;
}

export interface QuartzUser extends QuartzBase {
  username: string;
  globalName: string | null;
  avatar: string | null;
  bot: boolean;
}

export interface QuartzMember extends QuartzBase {
  guildId: Snowflake;
  user: QuartzUser;
  nickname: string | null;
  roles: Snowflake[];
  permissions: bigint;
  joinedTimestamp: number;
  communicationDisabledUntilTimestamp: number | null;
}

export interface QuartzRole extends QuartzBase {
  guildId: Snowflake;
  name: string;
  color: number;
  hoist: boolean;
  mentionable: boolean;
  position: number;
  permissions: bigint;
}

export enum QuartzChannelType {
  GUILD_TEXT = 0,
  DM = 1,
  GUILD_VOICE = 2,
  GROUP_DM = 3,
  GUILD_CATEGORY = 4,
  GUILD_ANNOUNCEMENT = 5,
  ANNOUNCEMENT_THREAD = 10,
  PUBLIC_THREAD = 11,
  PRIVATE_THREAD = 12,
  GUILD_STAGE_VOICE = 13,
  GUILD_FORUM = 15,
  GUILD_MEDIA = 16,
}

export interface QuartzChannel extends QuartzBase {
  type: QuartzChannelType;
  guildId: Snowflake | null;
  name: string | null;
  parentId: Snowflake | null;
  position: number | null;
}

export interface QuartzGuild extends QuartzBase {
  name: string;
  ownerId: Snowflake;
  icon: string | null;
  memberCount: number;
  features: string[];
}

export interface QuartzAttachment extends QuartzBase {
  filename: string;
  url: string;
  contentType: string | null;
  size: number;
}

export interface QuartzEmbed {
  title?: string;
  description?: string;
  url?: string;
  color?: number;
  timestamp?: string;
  footer?: { text: string; iconUrl?: string };
  image?: { url: string };
  thumbnail?: { url: string };
  author?: { name: string; url?: string; iconUrl?: string };
  fields?: { name: string; value: string; inline?: boolean }[];
}

export interface QuartzEmoji extends QuartzBase {
  name: string | null;
  animated: boolean;
}

export interface QuartzReaction {
  count: number;
  me: boolean;
  emoji: QuartzEmoji;
}

export enum QuartzMessageType {
  DEFAULT = 0,
  REPLY = 19,
  CHAT_INPUT_COMMAND = 20,
  CONTEXT_MENU_COMMAND = 23,
  THREAD_STARTER_MESSAGE = 21,
}

export interface QuartzMessage extends QuartzBase {
  channelId: Snowflake;
  guildId: Snowflake | null;
  author: QuartzUser;
  member: QuartzMember | null;
  content: string;
  type: QuartzMessageType;
  timestamp: number;
  editedTimestamp: number | null;
  pinned: boolean;
  attachments: QuartzAttachment[];
  embeds: QuartzEmbed[];
  reactions: QuartzReaction[];
  webhookId: Snowflake | null;
}

export enum QuartzInteractionType {
  PING = 1,
  APPLICATION_COMMAND = 2,
  MESSAGE_COMPONENT = 3,
  APPLICATION_COMMAND_AUTOCOMPLETE = 4,
  MODAL_SUBMIT = 5,
}

export interface QuartzInteraction extends QuartzBase {
  type: QuartzInteractionType;
  guildId: Snowflake | null;
  channelId: Snowflake | null;
  user: QuartzUser;
  member: QuartzMember | null;
  token: string;
  applicationId: Snowflake;
  locale: string;
  guildLocale: string | null;
  appPermissions: bigint | null;
}

export type QuartzPresenceStatus = "online" | "idle" | "dnd" | "offline";

export interface QuartzActivity {
  name: string;
  type: 0 | 1 | 2 | 3 | 4 | 5;
  state: string | null;
  details: string | null;
}

export interface QuartzPresence {
  userId: Snowflake;
  guildId: Snowflake;
  status: QuartzPresenceStatus;
  activities: QuartzActivity[];
}

export interface QuartzVoiceState {
  guildId: Snowflake;
  channelId: Snowflake | null;
  userId: Snowflake;
  member: QuartzMember | null;
  deaf: boolean;
  mute: boolean;
  selfDeaf: boolean;
  selfMute: boolean;
  selfVideo: boolean;
}
