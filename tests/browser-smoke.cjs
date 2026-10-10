const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const assert = require('node:assert/strict');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const out = process.env.ARTIFACT_DIR ? path.resolve(process.env.ARTIFACT_DIR) : path.join(root, '.test-artifacts');
fs.mkdirSync(out, {recursive:true});
const browserEntries = process.env.BROWSER_EXECUTABLES ? JSON.parse(process.env.BROWSER_EXECUTABLES) : [['Chromium', null]];
const server = http.createServer((req,res) => {
  const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if (file !== root && !file.startsWith(root + path.sep)) {res.writeHead(403);res.end();return;}
  const target = file === root ? path.join(root,'index.html') : file;
  const types = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.pdf':'application/pdf','.svg':'image/svg+xml'};
  fs.readFile(target,(err,body)=>{res.writeHead(err?404:200,{'Content-Type':types[path.extname(target)] || 'application/octet-stream'});res.end(err?'Not found':body);});
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  for(const match of fs.readFileSync(path.join(root,'index.html'),'utf8').matchAll(/(?:src|href)="(assets\/[^"]+)"/g)) {
    assert.ok(fs.existsSync(path.join(root,match[1].split(/[?#]/)[0])), 'Missing asset: ' + match[1]);
  }
  const reports=[];
  const origin = 'http://127.0.0.1:' + server.address().port;
  for(const [name,exe] of browserEntries){
    const browser=await chromium.launch({...(exe ? {executablePath:exe} : {}),headless:true});
    const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
    const pdfRequests=[],downloads=[],errors=[],missing=[];
    page.on('request',req=>{if(/\.pdf(?:[?#]|$)/i.test(req.url()))pdfRequests.push(req.url());});
    page.on('download',d=>downloads.push(d.suggestedFilename()));
    page.on('pageerror',err=>errors.push(err.message));
    page.on('response',res=>{if(res.status()>=400)missing.push(res.url());});
    await page.goto(origin + '/',{waitUntil:'networkidle'});
    assert.equal(await page.locator('.publication').count(),14);
    for (const img of await page.locator('.publication-media img').all()) { await img.scrollIntoViewIfNeeded(); await img.evaluate(el=>el.decode()); }
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    assert.deepEqual(pdfRequests,[]);
    assert.deepEqual(downloads,[]);
    await page.locator('.filter-button[data-year="2026"]').click();
    assert.equal(await page.locator('.publication:visible').count(),4);
    await page.locator('.filter-button[data-year="2025"]').click();
    assert.equal(await page.locator('.publication:visible').count(),5);
    await page.locator('.filter-button[data-year="earlier"]').click();
    assert.equal(await page.locator('.publication:visible').count(),5);
    await page.locator('.filter-button[data-year="all"]').click();
    await page.locator('#publicationSearch').fill('QuadFusion');
    assert.equal(await page.locator('.publication:visible').count(),1);
    await page.locator('#publicationSearch').fill('unmatched-query-xyz');
    assert.equal(await page.locator('.publication:visible').count(),0);
    assert.equal(await page.locator('#emptyState').isVisible(),true);
    await page.locator('#publicationSearch').fill('');
    assert.equal(await page.locator('.publication:visible').count(),14);
    assert.equal(await page.locator('iframe,object,embed').count(),0);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await page.locator('body').click({position:{x:5,y:5}});
    await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
    if(name===browserEntries[0][0]){ await page.screenshot({path:path.join(out,'homepage-desktop.png'),fullPage:true}); await page.screenshot({path:path.join(out,'homepage-preview.png')}); }
    await page.setViewportSize({width:390,height:844});
    await page.locator('body').click({position:{x:5,y:5}});
    await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
    await page.locator('#siteNav').waitFor({state:'hidden'});
    await page.locator('#menuToggle').click();
    assert.equal(await page.locator('#siteNav').isVisible(),true);
    await page.keyboard.press('Escape');
    await page.locator('#siteNav').waitFor({state:'hidden'});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    if(name===browserEntries[0][0])await page.screenshot({path:path.join(out,'homepage-mobile.png'),fullPage:true});
    await page.setViewportSize({width:320,height:800});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    assert.deepEqual(errors,[]);
    assert.deepEqual(missing,[]);
    assert.deepEqual(pdfRequests,[]);
    reports.push({browser:name,papers:14,filters:{2026:4,2025:5,earlier:5},pdfRequests:pdfRequests.length,downloads:downloads.length,pageErrors:errors.length,missingAssets:missing.length,overflow:false});
    const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
    const fallback=await context.newPage();
    await fallback.goto(origin + '/');
    assert.equal(await fallback.locator('.publication:visible').count(),14);
    assert.equal(await fallback.locator('#siteNav').isVisible(),true);
    await browser.close();
  }
  fs.writeFileSync(path.join(out,'validation.json'),JSON.stringify(reports,null,2));
  console.log(JSON.stringify(reports,null,2));
})().catch(err=>{console.error(err);process.exit(1)}).finally(()=>server.close());




