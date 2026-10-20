import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { RSVPFormData, GuestbookEntry } from '../types/wedding';

// Key names in localStorage for custom runtime Supabase configuration
const STORAGE_URL_KEY = 'wedding_supabase_url';
const STORAGE_ANON_KEY = 'wedding_supabase_anon_key';
const LOCAL_RSVP_KEY = 'wedding_local_rsvp_data';
const LOCAL_GUESTBOOK_KEY = 'wedding_local_guestbook_data';

// Initial sample guestbook wishes if local storage is empty
const INITIAL_GUESTBOOK_WISHES: GuestbookEntry[] = [
  {
    id: 'wish-1',
    created_at: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    name: 'Nguyễn Minh Tuấn & Bạn bè ĐH',
    message: 'Chúc hai bạn trăm năm hạnh phúc, đầu bạc răng long! Chúc cho tổ ấm nhỏ luôn tràn ngập tiếng cười và yêu thương.',
    relationship: 'friend',
    avatar_color: 'rose',
    likes_count: 14,
  },
  {
    id: 'wish-2',
    created_at: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    name: 'Chị Mai Thảo & Gia đình',
    message: 'Mừng ngày vui của hai em! Chúc hai em luôn đồng hành, thấu hiểu và chia sẻ mọi khoảnh khắc ngọt ngào bên nhau.',
    relationship: 'family',
    avatar_color: 'amber',
    likes_count: 9,
  },
  {
    id: 'wish-3',
    created_at: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    name: 'Đức Huy & Team Công Nghệ',
    message: 'Chúc mừng anh Nam và chị Linh! Đám cưới đẹp như mơ, chúc hai vợ chồng sớm có quý tử thiên thần nha!',
    relationship: 'colleague',
    avatar_color: 'emerald',
    likes_count: 18,
  },
  {
    id: 'wish-4',
    created_at: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    name: 'Bác Thanh & Cô Liên',
    message: 'Chúc hai cháu trăm năm tình viên mãn, bạc đầu nghĩa phu thê. Hạnh phúc và viên mãn trọn đời!',
    relationship: 'relative',
    avatar_color: 'indigo',
    likes_count: 7,
  }
];

export function getSupabaseConfig(): { url: string; anonKey: string; isConfigured: boolean } {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_URL_KEY) || '' : '';
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_ANON_KEY) || '' : '';

  const activeUrl = storedUrl || envUrl;
  const activeKey = storedKey || envKey;

  const isConfigured = Boolean(
    activeUrl && 
    activeKey && 
    activeUrl.startsWith('https://') &&
    activeUrl.includes('supabase.co')
  );

  return {
    url: activeUrl,
    anonKey: activeKey,
    isConfigured,
  };
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    if (url) localStorage.setItem(STORAGE_URL_KEY, url.trim());
    else localStorage.removeItem(STORAGE_URL_KEY);

    if (anonKey) localStorage.setItem(STORAGE_ANON_KEY, anonKey.trim());
    else localStorage.removeItem(STORAGE_ANON_KEY);
    
    // Refresh client
    cachedClient = null;
  }
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  if (!cachedClient) {
    try {
      cachedClient = createClient(url, anonKey);
    } catch (err) {
      console.error('Failed to create Supabase client:', err);
      return null;
    }
  }
  return cachedClient;
}

// ==================== RSVP SERVICES ====================

export async function submitRSVP(formData: RSVPFormData): Promise<{ success: boolean; message: string; mode: 'supabase' | 'local' }> {
  const client = getSupabaseClient();

  if (client) {
    try {
      const { error } = await client.from('rsvp').insert([
        {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          attending: formData.attending,
          guests_count: formData.guestsCount,
          side: formData.side,
          message: formData.message?.trim() || null,
          dietary_requirements: formData.dietaryRequirements?.trim() || null,
        }
      ]);

      if (error) {
        console.error('Supabase RSVP insert error:', error);
        throw error;
      }

      return {
        success: true,
        message: 'Đã gửi xác nhận tham dự thành công vào Supabase!',
        mode: 'supabase'
      };
    } catch (err: any) {
      console.warn('Falling back to local storage due to Supabase error:', err);
      // Fallback below
    }
  }

  // Local storage fallback
  try {
    const raw = localStorage.getItem(LOCAL_RSVP_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const newEntry = {
      ...formData,
      id: 'rsvp-' + Date.now(),
      created_at: new Date().toISOString(),
    };
    list.unshift(newEntry);
    localStorage.setItem(LOCAL_RSVP_KEY, JSON.stringify(list));

    return {
      success: true,
      message: 'Đã ghi nhận xác nhận tham dự của bạn!',
      mode: 'local'
    };
  } catch (err) {
    return {
      success: false,
      message: 'Không thể lưu dữ liệu. Vui lòng thử lại sau.',
      mode: 'local'
    };
  }
}

// ==================== GUESTBOOK SERVICES ====================

export async function fetchGuestbook(): Promise<{ data: GuestbookEntry[]; mode: 'supabase' | 'local' }> {
  const client = getSupabaseClient();

  if (client) {
    try {
      const { data, error } = await client
        .from('guestbook')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && data) {
        return { data: data as GuestbookEntry[], mode: 'supabase' };
      }
      console.warn('Supabase fetch error, fallback to local:', error);
    } catch (err) {
      console.warn('Supabase fetch exception, fallback to local:', err);
    }
  }

  // Local fallback
  try {
    const raw = localStorage.getItem(LOCAL_GUESTBOOK_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_GUESTBOOK_KEY, JSON.stringify(INITIAL_GUESTBOOK_WISHES));
      return { data: INITIAL_GUESTBOOK_WISHES, mode: 'local' };
    }
    return { data: JSON.parse(raw), mode: 'local' };
  } catch (err) {
    return { data: INITIAL_GUESTBOOK_WISHES, mode: 'local' };
  }
}

export async function submitGuestbookWish(
  name: string,
  message: string,
  relationship: string = 'friend',
  avatar_color: string = 'rose'
): Promise<{ success: boolean; entry: GuestbookEntry; mode: 'supabase' | 'local' }> {
  const client = getSupabaseClient();

  const newEntry: GuestbookEntry = {
    id: 'wish-' + Date.now(),
    created_at: new Date().toISOString(),
    name: name.trim(),
    message: message.trim(),
    relationship,
    avatar_color,
    likes_count: 0
  };

  if (client) {
    try {
      const { data, error } = await client
        .from('guestbook')
        .insert([
          {
            name: newEntry.name,
            message: newEntry.message,
            relationship: newEntry.relationship,
            avatar_color: newEntry.avatar_color,
            likes_count: 0,
          }
        ])
        .select()
        .single();

      if (!error && data) {
        return {
          success: true,
          entry: data as GuestbookEntry,
          mode: 'supabase'
        };
      }
      console.warn('Supabase insert guestbook error:', error);
    } catch (err) {
      console.warn('Supabase insert exception, fallback to local:', err);
    }
  }

  // Local fallback
  try {
    const raw = localStorage.getItem(LOCAL_GUESTBOOK_KEY);
    const list: GuestbookEntry[] = raw ? JSON.parse(raw) : [...INITIAL_GUESTBOOK_WISHES];
    list.unshift(newEntry);
    localStorage.setItem(LOCAL_GUESTBOOK_KEY, JSON.stringify(list));
    return { success: true, entry: newEntry, mode: 'local' };
  } catch (err) {
    return { success: false, entry: newEntry, mode: 'local' };
  }
}

export async function likeGuestbookWish(id: string): Promise<boolean> {
  const client = getSupabaseClient();

  if (client) {
    try {
      // Try using the rpc function if defined, or simple update
      const { error: rpcError } = await client.rpc('increment_guestbook_like', { entry_id: id });
      if (!rpcError) return true;

      // Fallback to fetch + update if rpc not found
      const { data } = await client.from('guestbook').select('likes_count').eq('id', id).single();
      if (data) {
        const nextLikes = (data.likes_count || 0) + 1;
        await client.from('guestbook').update({ likes_count: nextLikes }).eq('id', id);
        return true;
      }
    } catch (err) {
      console.warn('Supabase like error, using local fallback:', err);
    }
  }

  // Local fallback
  try {
    const raw = localStorage.getItem(LOCAL_GUESTBOOK_KEY);
    if (raw) {
      const list: GuestbookEntry[] = JSON.parse(raw);
      const idx = list.findIndex(item => item.id === id);
      if (idx !== -1) {
        list[idx].likes_count = (list[idx].likes_count || 0) + 1;
        localStorage.setItem(LOCAL_GUESTBOOK_KEY, JSON.stringify(list));
        return true;
      }
    }
  } catch (err) {
    console.error('Local like error:', err);
  }
  return false;
}

/**
 * Lắng nghe thay đổi Realtime từ bảng guestbook trên Supabase
 * Tự động cập nhật giao diện khi có lời chúc mới hoặc lượt thích thay đổi
 */
export function subscribeGuestbookRealtime(
  onInsert?: (entry: GuestbookEntry) => void,
  onUpdate?: (entry: GuestbookEntry) => void
): () => void {
  const client = getSupabaseClient();
  if (!client) {
    return () => {};
  }

  try {
    const channel = client
      .channel('guestbook-realtime-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'guestbook',
        },
        (payload) => {
          if (payload.new && onInsert) {
            onInsert(payload.new as GuestbookEntry);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'guestbook',
        },
        (payload) => {
          if (payload.new && onUpdate) {
            onUpdate(payload.new as GuestbookEntry);
          }
        }
      )
      .subscribe();

    return () => {
      try {
        client.removeChannel(channel);
      } catch (e) {
        console.warn('Error removing Supabase channel:', e);
      }
    };
  } catch (err) {
    console.warn('Realtime subscription error:', err);
    return () => {};
  }
}

