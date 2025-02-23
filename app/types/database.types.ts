export interface Database {
  public: {
    Tables: {
      listings: {
        Row: {
          id: string
          created_at: string
          user_id: string
          title: string
          description: string | null
          price: number
          category: string | null
          condition: string | null
          status: string
          images: string[]
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          title: string
          description?: string | null
          price: number
          category?: string | null
          condition?: string | null
          status?: string
          images?: string[]
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          title?: string
          description?: string | null
          price?: number
          category?: string | null
          condition?: string | null
          status?: string
          images?: string[]
        }
      }
      messages: {
        Row: {
          id: string
          created_at: string
          sender_id: string
          receiver_id: string
          listing_id: string
          content: string
          read: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          sender_id: string
          receiver_id: string
          listing_id: string
          content: string
          read?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          sender_id?: string
          receiver_id?: string
          listing_id?: string
          content?: string
          read?: boolean
        }
      }
      profiles: {
        Row: {
          id: string
          username: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 