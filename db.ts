import postgres from "postgres";
import migrations from "./migrations";

export type Bookmark = {
    id: number;
    title: string;
    url: string;
    description?: string;
    created_at: Date;
    tag: string;
};

if (!Bun.env.DB_URL) {
    throw new Error("Missing env DB_URL");
}

const sql = postgres(Bun.env.DB_URL);
migrations({ sql });

export const getBookmarks = async () => {
    const bookmarks = await sql<Bookmark[]>`SELECT * FROM bookmarks`;
    return bookmarks;
};

export const getBookmark = async (id: number) => {
    const [bookmark]: [Bookmark?] =
        await sql`SELECT * FROM users WHERE id = ${id};`;
    return bookmark;
};

export const createBookmark = async (bookmark: Bookmark) => {
    if (bookmark.description) {
    await sql`
    INSERT INTO bookmarks 
    (title, url, description, tag)
    VALUES 
    (${bookmark.title}, 
    ${bookmark.url}, 
    ${bookmark.description}, 
    ${bookmark.tag}
    );`;
    } else {
     sql`
        INSERT INTO bookmarks 
        (title, url, tag)
        VALUES 
        (${bookmark.title}, 
        ${bookmark.url}, 
        ${bookmark.tag}
        );`;
    }
};

export const deleteBookmark = async (id: number) => {
    const [deletedBookmark]: [Bookmark?] = await sql`
    DELETE FROM bookmarks 
    WHERE id = ${id} RETURNING *;`;
    return deletedBookmark;
};
