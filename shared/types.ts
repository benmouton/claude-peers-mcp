// Unique ID for each Claude Code instance (generated on registration)
export type PeerId = string;

export interface Peer {
  id: PeerId;
  pid: number;
  cwd: string;
  git_root: string | null;
  tty: string | null;
  summary: string;
  registered_at: string; // ISO timestamp
  last_seen: string; // ISO timestamp
}

export interface Message {
  id: number;
  from_id: PeerId;
  to_id: PeerId;
  text: string;
  sent_at: string; // ISO timestamp
  delivered: boolean;
}

// --- Broker API types ---

export interface RegisterRequest {
  pid: number;
  cwd: string;
  git_root: string | null;
  tty: string | null;
  summary: string;
}

export interface RegisterResponse {
  id: PeerId;
}

export interface HeartbeatRequest {
  id: PeerId;
  // Optional self-heal payload. When the broker has dropped this peer's row
  // (most commonly: 90s staleness from a transient outage / broker restart),
  // a heartbeat with these fields lets the broker UPSERT the peer back into
  // the table on the same id, instead of silently no-op'ing the UPDATE and
  // leaving the peer as a one-way ghost. Backward-compatible: heartbeats
  // without these fields still work, just won't self-heal.
  pid?: number;
  cwd?: string;
  git_root?: string | null;
  tty?: string | null;
  summary?: string;
  is_remote?: boolean;
}

export interface HeartbeatResponse {
  ok: boolean;
  // True when the broker had to INSERT the row instead of UPDATE — useful
  // for telemetry/logging on the client side.
  reregistered?: boolean;
  // True when the broker has no row for this id AND the heartbeat didn't
  // include enough self-heal data. Client should re-call /register or
  // /register-remote explicitly.
  needsRegister?: boolean;
}

export interface SetSummaryRequest {
  id: PeerId;
  summary: string;
}

export interface ListPeersRequest {
  scope: "machine" | "directory" | "repo";
  // The requesting peer's context (used for filtering)
  cwd: string;
  git_root: string | null;
  exclude_id?: PeerId;
}

export interface SendMessageRequest {
  from_id: PeerId;
  to_id: PeerId;
  text: string;
}

export interface PollMessagesRequest {
  id: PeerId;
}

export interface PollMessagesResponse {
  messages: Message[];
}
