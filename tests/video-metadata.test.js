import test from 'node:test';
import assert from 'node:assert/strict';
import { collectYouTubeVideos } from '../lib/youtube-parser.js';
import { formatDate } from '../public/video-state.js';
import { collectCatalog } from '../lib/youtube.js';

test('combined lockup metadata and Shorts views are kept in separate fields', () => {
  const video = collectYouTubeVideos({lockupViewModel:{contentId:'abcdefghijk',contentType:'LOCKUP_CONTENT_TYPE_VIDEO',metadata:{lockupMetadataViewModel:{title:{content:'Video'},metadata:{contentMetadataViewModel:{metadataRows:[{metadataParts:[{text:{content:'조회수 2.5천회 • 2년 전'}}]}]}}}}}})[0];
  assert.equal(video.publishedText,'2년 전');
  assert.equal(video.viewCountText,'조회수 2.5천회');
  const short = collectYouTubeVideos({shortsLockupViewModel:{onTap:{reelWatchEndpoint:{videoId:'12345678901'}},thumbnail:{sources:[]},overlayMetadata:{primaryText:{content:'Short'},secondaryText:{content:'25K views'}}}})[0];
  assert.equal(short.publishedText,'');
  assert.equal(short.viewCountText,'25K views');
});

test('cards always display relative age and views with no exact-date priority', () => {
  const now = Date.parse('2026-10-26T00:00:00Z');
  assert.equal(formatDate({published:'2024-10-01',publishedText:'2년 전',viewCountText:'조회수 2.5천회'},'ko',now),'2년 전 · 조회수 2.5천회');
  assert.equal(formatDate({published:'2024-10-01',viewCount:2500},'en',now),'2 years ago · 2.5K views');
  assert.equal(formatDate({published:'2024-10-01',publishedText:'조회수 2.5천회'},'ko',now),'2년 전 · 조회수 2.5천회');
  assert.equal(formatDate({},'ko',now),'게시일 확인 중 · 조회수 확인 중');
});

test('server fills metadata outside the RSS window using actual player data', async t => {
  const original = globalThis.fetch; t.after(()=>{globalThis.fetch=original;});
  let watchCalls=0;
  globalThis.fetch = async url => {
    if(url.includes('playlist_id=UUSH')) return new Response('', {status:503});
    if(url.includes('/feeds/')) return new Response('<feed><entry><yt:videoId>abcdefghijk</yt:videoId><title>Video</title><published>2026-10-18</published><media:statistics views="42"/></entry></feed>');
    if(url.includes('/watch?')) { watchCalls++; return new Response('var ytInitialPlayerResponse = '+JSON.stringify({videoDetails:{videoId:'12345678901',viewCount:'2500'},microformat:{playerMicroformatRenderer:{publishDate:'2024-09-01'}}})+';'); }
    const data=url.includes('/shorts?')?{reelItemRenderer:{videoId:'12345678901',headline:{simpleText:'Short'},viewCountText:{simpleText:'2.5K views'}}}:{videoRenderer:{videoId:'abcdefghijk',title:{simpleText:'Video'},thumbnail:{thumbnails:[]},publishedTimeText:{simpleText:'8 days ago'}}};
    return new Response('var ytInitialData = '+JSON.stringify(data)+';');
  };
  const data=await collectCatalog('en');
  assert.equal(watchCalls,1);
  assert.equal(data.videos[0].viewCount,42);
  assert.equal(data.videos[1].published,'2024-09-01');
  assert.equal(data.videos[1].viewCount,2500);
  assert.equal(data.videos[1].publishedText,'');
});

test('separate upload feeds cover older Shorts and videos without watch-page requests', async t => {
  const original=globalThis.fetch; t.after(()=>{globalThis.fetch=original;});
  const feedTypes=[];
  globalThis.fetch=async url=>{
    if(url.includes('/watch?')) assert.fail('complete upload feeds need no watch fetch');
    if(url.includes('/feeds/')) {
      const short=url.includes('playlist_id=UUSH');feedTypes.push(short?'shorts':'videos');
      return new Response(`<feed><entry><yt:videoId>${short?'12345678901':'abcdefghijk'}</yt:videoId><title>Live upload</title><published>2024-09-01</published><media:statistics views="2500"/></entry></feed>`);
    }
    const item=url.includes('/shorts?')?{reelItemRenderer:{videoId:'12345678901',headline:{simpleText:'Short'}}}:{lockupViewModel:{contentId:'abcdefghijk',contentType:'LOCKUP_CONTENT_TYPE_VIDEO',metadata:{lockupMetadataViewModel:{title:{content:'Video'},metadata:{contentMetadataViewModel:{metadataRows:[{metadataParts:[{text:{content:'2.5K'},accessibilityLabel:'2.5K views'},{text:{content:'2 years ago'}}]}]}}}}}};
    return new Response('var ytInitialData = '+JSON.stringify(item)+';');
  };
  const data=await collectCatalog('en');
  assert.deepEqual(feedTypes.sort(),['shorts','videos']);
  assert.equal(data.videos.length,2);
  assert.ok(data.videos.every(video=>video.published==='2024-09-01'&&video.viewCount===2500));
  assert.equal(data.videos.find(video=>video.id==='abcdefghijk').viewCountText,'2.5K views');
});
