import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const launched = request.cookies.get('ofta-launched')?.value
    if (!launched) {
        const url = request.nextUrl.clone()
        url.pathname = '/splash'
        return NextResponse.redirect(url)
    }
    return NextResponse.next()
}

export const config = {
    matcher: ['/'],
}
