import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';

import type { ShelfBook } from '@/lib/books';

/**
 * Free books saved in the app for offline reading. Files live in the app's own storage (not the
 * phone's Downloads folder), so they open only in Knowzone. PDFs are shown by a small PDF.js reader
 * page saved alongside them; single-page books (HTML) open directly.
 */
export type SavedBook = { id: string; title: string; type: 'pdf' | 'html'; bytes: number; savedAt: number };

const INDEX = 'knowzone.books.saved';
const PAGES = 'knowzone.books.pages';
// PDF.js (Mozilla), the classic build: it runs from saved files with no network.
const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174';

const booksDir = () => new Directory(Paths.document, 'books');
const readerDir = () => new Directory(Paths.document, 'reader');
export const bookFile = (id: string, type: 'pdf' | 'html') => new File(booksDir(), `${id}.${type}`);

export async function savedBooks(): Promise<Record<string, SavedBook>> {
  try {
    return JSON.parse((await AsyncStorage.getItem(INDEX)) ?? '{}') as Record<string, SavedBook>;
  } catch {
    return {};
  }
}

/** Is the book saved, and is its file still there? */
export async function savedBook(id: string): Promise<SavedBook | null> {
  const s = (await savedBooks())[id];
  return s && bookFile(id, s.type).exists ? s : null;
}

/** The reader page for PDFs, and PDF.js next to it. Fetched once, then reused offline. */
async function ensureReader() {
  const dir = readerDir();
  dir.create({ intermediates: true, idempotent: true });
  for (const name of ['pdf.min.js', 'pdf.worker.min.js']) {
    const f = new File(dir, name);
    if (!f.exists) await File.downloadFileAsync(`${PDFJS}/${name}`, f, { idempotent: true });
  }
  new File(dir, 'viewer.html').write(VIEWER);
}

/** Saves a free book in the app. `onProgress` gets 0–1. Returns a way to cancel. */
export function saveBook(book: ShelfBook, onProgress: (share: number) => void) {
  const type = book.downloadType!;
  const target = bookFile(book.id, type);
  let task: ReturnType<typeof File.createDownloadTask> | null = null;
  let cancelled = false;
  const promise = (async () => {
    booksDir().create({ intermediates: true, idempotent: true });
    if (type === 'pdf') await ensureReader();
    if (cancelled) throw new Error('cancelled');
    if (target.exists) target.delete();
    task = File.createDownloadTask(book.downloadUrl!, target, {
      onProgress: ({ bytesWritten, totalBytes }) => totalBytes > 0 && onProgress(bytesWritten / totalBytes),
    });
    const file = await task.downloadAsync();
    if (!file) throw new Error('The download stopped.');
    const all = await savedBooks();
    all[book.id] = {
      id: book.id,
      title: book.title,
      type,
      bytes: file.size ?? book.downloadBytes ?? 0,
      savedAt: Date.now(),
    };
    await AsyncStorage.setItem(INDEX, JSON.stringify(all));
    return all[book.id]!;
  })();
  return {
    promise,
    cancel: () => {
      cancelled = true;
      task?.cancel();
      if (target.exists) target.delete();
    },
  };
}

export async function removeBook(id: string) {
  const all = await savedBooks();
  const s = all[id];
  if (s && bookFile(id, s.type).exists) bookFile(id, s.type).delete();
  delete all[id];
  await AsyncStorage.setItem(INDEX, JSON.stringify(all));
}

/** Where to open a saved book: the file itself, or the PDF reader page pointed at it. */
export async function savedUri(s: SavedBook) {
  if (s.type === 'html') return bookFile(s.id, 'html').uri;
  const page = (await lastPage(s.id)) ?? 1;
  return `${new File(readerDir(), 'viewer.html').uri}?file=${encodeURIComponent(bookFile(s.id, 'pdf').uri)}&page=${page}`;
}

/** The page a reader was on, so a book opens where they left off. */
export async function lastPage(id: string) {
  try {
    return (JSON.parse((await AsyncStorage.getItem(PAGES)) ?? '{}') as Record<string, number>)[id] ?? null;
  } catch {
    return null;
  }
}
export async function rememberPage(id: string, page: number) {
  try {
    const all = JSON.parse((await AsyncStorage.getItem(PAGES)) ?? '{}') as Record<string, number>;
    all[id] = page;
    await AsyncStorage.setItem(PAGES, JSON.stringify(all));
  } catch {
    // Not worth interrupting reading for.
  }
}

export const megabytes = (bytes: number) => `${Math.max(0.1, bytes / 1e6).toFixed(bytes > 1e7 ? 0 : 1)} MB`;

/**
 * The PDF reader page: pages one under the other, drawn when they come into view and cleared when
 * far away (so 1,000-page books don't run out of memory). It reports the page in view, so the app
 * can open the book there next time.
 */
const VIEWER = `<!doctype html>
<html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=5,user-scalable=yes">
<style>
html,body{margin:0;background:#3b3f55}
#msg{color:#fff;font:16px sans-serif;text-align:center;padding:48px 24px}
#pages{display:flex;flex-direction:column;align-items:center;gap:10px;padding:10px 0 40px}
canvas{display:block;width:96%;max-width:900px;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.35)}
#count{position:fixed;bottom:12px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,.6);color:#fff;font:600 13px sans-serif;padding:6px 12px;border-radius:999px}
</style>
<script src="pdf.min.js"></script></head>
<body><div id="msg">Opening your book…</div><div id="pages"></div><div id="count" hidden></div>
<script>
var q=new URLSearchParams(location.search);
var start=parseInt(q.get('page')||'1',10);
pdfjsLib.GlobalWorkerOptions.workerSrc='pdf.worker.min.js';
function tell(m){try{window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify(m))}catch(e){}}
pdfjsLib.getDocument({url:q.get('file')}).promise.then(function(pdf){
  return pdf.getPage(1).then(function(first){
    var v=first.getViewport({scale:1});
    document.getElementById('msg').remove();
    var box=document.getElementById('pages'),count=document.getElementById('count');
    for(var i=1;i<=pdf.numPages;i++){var c=document.createElement('canvas');c.dataset.page=i;c.style.aspectRatio=v.width+'/'+v.height;box.appendChild(c);}
    function draw(c){if(c.dataset.on)return;c.dataset.on=1;pdf.getPage(+c.dataset.page).then(function(p){
      var w=c.getBoundingClientRect().width*(window.devicePixelRatio||1);var vp=p.getViewport({scale:w/p.getViewport({scale:1}).width});
      c.width=vp.width;c.height=vp.height;p.render({canvasContext:c.getContext('2d'),viewport:vp});});}
    function clear(c){if(!c.dataset.on)return;delete c.dataset.on;c.width=0;c.height=0;}
    var near=new IntersectionObserver(function(es){es.forEach(function(e){e.isIntersecting?draw(e.target):clear(e.target)})},{rootMargin:'2000px 0px'});
    var current=0;
    var seen=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var n=+e.target.dataset.page;if(n!==current){current=n;count.hidden=false;count.textContent=n+' / '+pdf.numPages;tell({page:n,pages:pdf.numPages});}}})},{threshold:0.5});
    box.querySelectorAll('canvas').forEach(function(c){near.observe(c);seen.observe(c)});
    var target=box.querySelector('canvas[data-page="'+Math.min(Math.max(1,start),pdf.numPages)+'"]');
    if(target&&start>1)setTimeout(function(){target.scrollIntoView()},50);
  });
}).catch(function(e){document.getElementById('msg').textContent='This book could not be opened. Try saving it again.';tell({error:String(e&&e.message||e)})});
</script></body></html>`;
