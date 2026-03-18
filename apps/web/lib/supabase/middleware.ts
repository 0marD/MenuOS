import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import type { Database } from '@menuos/database';

const PUBLIC_ROUTES = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/pin'];
const PUBLIC_PREFIXES = ['/(public)', '/offline'];

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) return true;
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return true;
  // Public menu slugs: /[slug]
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length >= 1 && !['auth', 'admin', 'waiter', 'kitchen', 'api'].includes(segments[0] ?? '')) {
    return true;
  }
  return false;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  if (!user && !isPublicRoute(pathname)) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (user && pathname.startsWith('/auth/login')) {
    return NextResponse.redirect(new URL('/(admin)/dashboard', request.url));
  }

  return response;
}
