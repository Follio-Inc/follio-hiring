import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.')) {
    return supabaseResponse;
  }

  const publicPaths = ['/', '/login', '/signup', '/invite'];
  const isPublic =
    publicPaths.some((p) => pathname === p) ||
    pathname.startsWith('/jobs') ||
    pathname.startsWith('/signup/') ||
    pathname.startsWith('/invite/') ||
    pathname.startsWith('/auth/');

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role;

    const authPages = ['/login', '/signup', '/signup/company'];
    if (authPages.includes(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = role === 'recruiter' ? '/hiring/dashboard' : '/jobs';
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith('/hiring') && role !== 'recruiter') {
      const url = request.nextUrl.clone();
      url.pathname = '/jobs';
      return NextResponse.redirect(url);
    }

    const candidateOnlyPaths = ['/dashboard', '/profile'];
    if (candidateOnlyPaths.some((p) => pathname === p || pathname.startsWith(p + '/')) && role === 'recruiter') {
      const url = request.nextUrl.clone();
      url.pathname = '/hiring/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
