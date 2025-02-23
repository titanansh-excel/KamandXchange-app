import { supabase } from './supabase'
import { Database } from '../types/database.types'
import { decode } from 'base64-arraybuffer'

type Listing = Database['public']['Tables']['listings']['Row']
type Message = Database['public']['Tables']['messages']['Row']

// Function to upload image to Supabase Storage
export const uploadImage = async (uri: string): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const base64Data = base64.split(',')[1];
          const fileName = `${Date.now()}.jpg`;
          
          const { data, error } = await supabase.storage
            .from('listings')
            .upload(fileName, decode(base64Data), {
              contentType: 'image/jpeg'
            });
            
          if (error) throw error;
          
          const { data: { publicUrl } } = supabase.storage
            .from('listings')
            .getPublicUrl(fileName);
            
          resolve(publicUrl);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    throw new Error('Failed to upload image');
  }
};

// Listings related functions
export const getListings = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;

  // Map the results to include seller_email
  return data?.map(listing => ({
    ...listing,
    seller_email: session?.user?.id === listing.user_id && session?.user?.email
      ? session.user.email 
      : `User-${listing.user_id.slice(0, 8)}@example.com`
  }));
}

export const getListingById = async (id: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null;
      }
      throw error;
    }
    
    // Add seller_email to the listing data
    return data ? {
      ...data,
      seller_email: session?.user?.id === data.user_id && session?.user?.email
        ? session.user.email 
        : `User-${data.user_id.slice(0, 8)}@example.com`
    } : null;
    
  } catch (error) {
    console.error('Error in getListingById:', error);
    throw error;
  }
};

export const createListing = async (listing: Database['public']['Tables']['listings']['Insert']) => {
  const { data, error } = await supabase
    .from('listings')
    .insert(listing)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const updateListing = async (id: string, updates: Database['public']['Tables']['listings']['Update']) => {
  const { data, error } = await supabase
    .from('listings')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const deleteListing = async (listingId: string) => {
  try {
    console.log('Supabase delete operation starting for listing:', listingId);
    
    // First verify the listing exists
    const { data: listing, error: fetchError } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching listing:', fetchError);
      throw new Error('Could not verify listing exists');
    }
    
    if (!listing) {
      throw new Error('Listing not found');
    }
    
    // Attempt to delete
    const { data, error } = await supabase
      .from('listings')
      .delete()
      .eq('id', listingId)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase delete error:', error);
      throw new Error(error.message);
    }
    
    console.log('Successfully deleted listing:', data);
    return data;
  } catch (error) {
    console.error('Error in deleteListing function:', error);
    throw error;
  }
};

// Function to delete all listings for a user
export const deleteAllUserListings = async (userId: string) => {
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('user_id', userId);
  
  if (error) throw error;
};

// Function to delete ALL listings from the database
export const deleteAllListings = async () => {
  const { error } = await supabase
    .from('listings')
    .delete()
    .neq('id', '0'); // This will match all rows
  
  if (error) throw error;
};

// Helper function to get username from profiles table
export const getUserUsername = async (userId: string): Promise<string> => {
  try {
    if (!userId) {
      console.error('No userId provided to getUserUsername');
      return '';
    }

    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    
    // If this is the current user, return their email
    if (session?.user?.id === userId) {
      return session.user.email || '';
    }

    // For other users, return a generic identifier
    return `User-${userId.slice(0, 8)}`;

  } catch (error) {
    console.error('Error in getUserUsername:', error);
    return '';
  }
};

// Messages related functions
export const getMessages = async (userId: string) => {
  try {
    if (!userId) {
      console.error('No userId provided to getMessages');
      return [];
    }

    // Get all messages for this user
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    // Group messages by unique conversation (pair of users)
    const conversationMap = new Map();
    
    for (const message of messages || []) {
      const partnerId = message.sender_id === userId ? message.receiver_id : message.sender_id;
      const conversationId = [userId, partnerId].sort().join('-');
      
      if (!conversationMap.has(conversationId)) {
        conversationMap.set(conversationId, {
          ...message,
          partner_id: partnerId,
          partner_username: `User-${partnerId.slice(0, 8)}`,
        });
      }
    }

    return Array.from(conversationMap.values());
  } catch (error) {
    console.error('Error in getMessages:', error);
    return [];
  }
};

export const findExistingChat = async (userId: string, partnerId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is the "no rows returned" error
    console.error('Error finding existing chat:', error);
    throw error;
  }

  return data;
};

export const getConversationMessages = async (userId: string, partnerId: string) => {
  // Sort IDs to ensure consistent conversation ID regardless of sender/receiver
  const [id1, id2] = [userId, partnerId].sort();
  
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${id1},receiver_id.eq.${id2}),and(sender_id.eq.${id2},receiver_id.eq.${id1})`)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching conversation:', error);
    throw error;
  }
  return data;
};

export const sendMessage = async (message: { content: string; sender_id: string; receiver_id: string; listing_id?: string }) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        content: message.content,
        sender_id: message.sender_id,
        receiver_id: message.receiver_id,
        listing_id: message.listing_id,
        read: false
      })
      .select()
      .single();
  
    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error in sendMessage:', error);
    throw error;
  }
};

export const markMessageAsRead = async (messageId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('id', messageId)
    .select()
    .single();
  
  if (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
  return data;
};

// Real-time subscriptions
export const subscribeToListings = (callback: (listing: Listing) => void) => {
  return supabase
    .channel('public:listings')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'listings' },
      (payload) => callback(payload.new as Listing)
    )
    .subscribe()
}

export const subscribeToMessages = (userId: string, callback: (message: Message & { sender_username?: string, listing_title?: string }) => void) => {
  return supabase
    .channel(`public:messages:${userId}`)
    .on('postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `or(sender_id.eq.${userId},receiver_id.eq.${userId})`
      },
      async (payload) => {
        const newMessage = payload.new as Message;
        try {
          // Get sender's username
          const senderUsername = await getUserUsername(newMessage.sender_id);
          
          // Get listing info
          const { data: listing } = await supabase
            .from('listings')
            .select('title')
            .eq('id', newMessage.listing_id)
            .single();

          callback({
            ...newMessage,
            sender_username: senderUsername,
            listing_title: listing?.title || 'Unknown Listing'
          });
        } catch (error) {
          console.error('Error in message subscription:', error);
          callback(newMessage);
        }
      }
    )
    .subscribe();
} 