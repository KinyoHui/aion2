export interface Server {
  id: number
  name: string
}

export interface Player {
  id: number
  name: string
  server_id: number
  full_id_string: string
}

export interface ScanRecord {
  id: number
  player_id: number
  created_at: string
}

// Extended types with relations
export interface PlayerWithServer extends Player {
  servers: Server
}

export interface ScanRecordWithPlayer extends ScanRecord {
  players: PlayerWithServer
}

// Database schema type
export interface Database {
  public: {
    Tables: {
      servers: {
        Row: Server
        Insert: Omit<Server, 'id'>
        Update: Partial<Omit<Server, 'id'>>
      }
      players: {
        Row: Player
        Insert: Omit<Player, 'id'>
        Update: Partial<Omit<Player, 'id'>>
      }
      scan_records: {
        Row: ScanRecord
        Insert: Omit<ScanRecord, 'id' | 'created_at'>
        Update: Partial<Omit<ScanRecord, 'id' | 'created_at'>>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}