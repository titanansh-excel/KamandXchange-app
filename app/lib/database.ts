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
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const getListingById = async (id: string) => {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

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

// Messages related functions
export const getMessages = async (listingId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('listing_id', listingId)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data
}

export const sendMessage = async (message: Database['public']['Tables']['messages']['Insert']) => {
  const { data, error } = await supabase
    .from('messages')
    .insert(message)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const markMessageAsRead = async (messageId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('id', messageId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

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

export const subscribeToMessages = (listingId: string, callback: (message: Message) => void) => {
  return supabase
    .channel(`public:messages:${listingId}`)
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `listing_id=eq.${listingId}` },
      (payload) => callback(payload.new as Message)
    )
    .subscribe()
} 