import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://crqvvcxmbvvcngfqdsnj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNycXZ2Y3htYnZ2Y25nZnFkc25qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjkxNTA4MywiZXhwIjoyMDgyNDkxMDgzfQ.1JjQpDIiXLCyW3KmGoCEPttyVZjxKkrS7jHu1r4xe-Q';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkRealLocations() {
  console.log('--- Inspecting Raw Database Locations ---');
  
  const { data: profiles } = await supabase.from('profiles').select('id, worker_name, full_name, mobile, current_lat, current_lng, city, state, address, location');
  console.log(`Profiles: ${profiles?.length || 0}`);
  
  const cities = new Set();
  const addressList = [];
  profiles?.forEach(p => {
    if (p.city) cities.add(p.city);
    if (p.address || p.location) addressList.push({ name: p.worker_name || p.full_name || p.mobile, city: p.city, address: p.address || p.location });
  });

  console.log('Unique Cities in profiles:', Array.from(cities));
  console.log('Sample addresses in profiles:', addressList.slice(0, 10));

  const { data: alerts } = await supabase.from('fraud_alerts').select('id, user_id, location, ip_address');
  console.log('\nFraud Alerts locations:', alerts);
}

checkRealLocations();
