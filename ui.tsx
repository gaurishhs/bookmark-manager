import { Bookmark } from "./db";
import * as elements from 'typed-html';
import { RowList } from "postgres";

export const Bookmarks = ({ bookmarks }: { bookmarks: RowList<Bookmark[]> }) => (
    <ul>
        {bookmarks.map((bookmark) => (
            <li onclick={`window.open('${bookmark.url}', '_blank', 'noopener noreferrer')`} class="bookmark">
                <span>ID: {bookmark.id}</span>
                <br />
                <span>Title: {bookmark.title}</span>
                <br />
                {bookmark.description ? (
                    <p>Desc: {bookmark.description}</p>
                ) : null}
                <span class="tag">Tag: {bookmark.tag}</span>
            </li>
        ))}
    </ul>
)