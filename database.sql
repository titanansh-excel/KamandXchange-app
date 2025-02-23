-- Create listings table
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL NOT NULL,
    category TEXT,
    condition TEXT,
    status TEXT DEFAULT 'available',
    images TEXT[], -- This creates an array of text for image URLs
    CONSTRAINT price_positive CHECK (price >= 0)
);

-- Enable Row Level Security
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view all listings
CREATE POLICY "Anyone can view listings" ON public.listings
    FOR SELECT
    USING (true);

-- Create policy to allow authenticated users to create listings
CREATE POLICY "Authenticated users can create listings" ON public.listings
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own listings
CREATE POLICY "Users can update own listings" ON public.listings
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to delete their own listings
CREATE POLICY "Users can delete own listings" ON public.listings
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    sender_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    CONSTRAINT fk_sender
        FOREIGN KEY (sender_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_receiver
        FOREIGN KEY (receiver_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own messages
CREATE POLICY "Users can view their own messages" ON public.messages
    FOR SELECT
    TO authenticated
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Create policy to allow authenticated users to send messages
CREATE POLICY "Authenticated users can send messages" ON public.messages
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = sender_id);

-- Create policy to allow users to mark messages as read
CREATE POLICY "Users can mark messages as read" ON public.messages
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = receiver_id)
    WITH CHECK (auth.uid() = receiver_id AND read = true);

-- Create a view to join messages with listings
CREATE OR REPLACE VIEW public.messages_with_listings AS
SELECT 
    m.*,
    l.title as listing_title
FROM public.messages m
LEFT JOIN public.listings l ON m.listing_id = l.id;

-- Grant access to the view
GRANT SELECT ON public.messages_with_listings TO authenticated;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" ON public.profiles
    FOR SELECT
    USING (true);

-- Create policy to allow anyone to insert their own profile
CREATE POLICY "Allow users to create their own profile" ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Create policy to allow authenticated users to update their own profile
CREATE POLICY "Allow authenticated users to update own profile" ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id); 