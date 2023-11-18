import { serve } from 'bun';
import Memoirist from 'memoirist';
import logger, { transport } from 'pino';
import * as elements from 'typed-html';
import { createBookmark, deleteBookmark, getBookmark, getBookmarks } from './db';
import { Bookmarks } from './ui';

const fileTransport = transport({
    target: 'pino/file',
    options: {
        destination: 'logs/app.log',
        mkdir: true
    }
})

const pinoLogger = logger(fileTransport)

const router = new Memoirist<{
    handler(req: Request, params?: Record<string, any>): Promise<Response>;
}>();

router.add('GET', '/', {
    async handler(req) {
        return new Response(Bun.file('index.html'));
    }
})

router.add('GET', '/bookmarks', {
    async handler(req) {
        const bookmarks = await getBookmarks();
        return new Response(<Bookmarks bookmarks={bookmarks} />)
    }
})

router.add('GET', '/bookmarks.json', {
    async handler(req) {
        const bookmarks = await getBookmarks();
        return new Response(JSON.stringify(bookmarks));
    }
})

router.add('POST', '/bookmarks', {
    async handler(req) {
        const data = await req.json()
        try {
            await createBookmark(data)
            return new Response(
                <div>
                    <p>Bookmark successfully created</p>
                    <button onclick='closeNbDialog()'>
                        Close
                    </button>
                </div>
            );
        } catch (e) {
            return new Response(
                <div>
                    <p>Failed to create bookmark</p>
                </div>
            );
        }
    }
})

router.add('POST', '/bookmarks.json', {
    async handler(req) {
        const data = await req.json()
        return new Response(JSON.stringify(createBookmark(data)));
    }
})

router.add('GET', '/bookmarks/:id', {
    async handler(req, params: Record<string, any>) {
        return new Response(JSON.stringify(getBookmark(params.id)));
    }
})

router.add('DELETE', '/bookmarks/:id', {
    async handler(req, params: Record<string, any>) {
        return new Response(JSON.stringify(deleteBookmark(params.id)));
    }
})

serve({
    port: 3000,
    fetch(req, server) {
        const url = req.url,
            s = url.indexOf('/', 11),
            q = url.indexOf('?', s + 1),
            path = q === -1 ? url.substring(s) : url.substring(s, q)
        const route = router.find(req.method, path);
        if (path !== '/' && req.headers.get('Authorization') && req.headers.get('Authorization') !== Bun.env.API_KEY) {
            // TODO: Add an alarm system in case of DDOS
            pinoLogger.info(
                `
Unauthorized request ${req.method} ${path} from ${req.headers.get('User-Agent')}

Authorization: ${req.headers.get('Authorization')}
IP Address: ${server.requestIP(req)?.address}
IP Port:    ${server.requestIP(req)?.port}
IP Family: ${server.requestIP(req)?.family}
            `)
            return new Response('Unauthorized', { status: 401 });
        }
        if (route) {
            return route.store.handler(req, route.params);
        }
        return new Response('Not Found', { status: 404 });
    }
})