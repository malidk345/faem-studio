import { supabase } from './lib/supabase';

async function testProfiles() {
  console.log("Checking reviews...");
  const { data: reviews } = await supabase.from('reviews').select('user_id').limit(5);
  console.log("Found review user IDs:", reviews?.map(r => r.user_id));

  if (reviews && reviews.length > 0) {
    const ids = reviews.map(r => r.user_id);
    console.log("Checking profiles for these IDs:", ids);
    const { data: profiles, error } = await supabase.from('profiles').select('*').in('id', ids);
    
    if (error) console.error("Error fetching profiles:", error);
    else console.log("Profiles found:", profiles);
  } else {
    console.log("No reviews found. Checking profiles directly:");
    const { data: profiles } = await supabase.from('profiles').select('*').limit(5);
    console.log("Profiles found:", profiles);
  }
}

testProfiles();
