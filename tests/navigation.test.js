import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { parseHTML } from 'linkedom';

test('every page uses the same categorized navigation for its language',async()=>{
  for(const language of ['ko','en']) {
    const prefix=language==='en'?'/en':'';
    const {document:home}=parseHTML(await fs.readFile('dist'+prefix+'/index.html','utf8'));
    const body=home.querySelector('.drawer-body').innerHTML;
    for(const route of ['/mll','/mll/1','/mll/100','/mll/150']) {
      const {document}=parseHTML(await fs.readFile('dist'+prefix+route+'/index.html','utf8'));
      assert.equal(document.querySelector('.drawer-body').innerHTML,body,prefix+route);
      assert.equal(document.querySelector('.drawer-head').innerHTML,home.querySelector('.drawer-head').innerHTML);
      assert.equal(document.querySelector('.drawer-overline'),null);
      assert.equal(document.querySelectorAll('.drawer-link small').length,0);
      assert.equal(document.querySelectorAll('.drawer-category').length,2);
      assert.equal(document.querySelectorAll('.drawer-sub-link').length,4);
      assert.equal(document.querySelector('.drawer-category-link[href="'+(prefix||'/')+(prefix?'/':'')+'"]').textContent.replace('↗','').trim(),language==='en'?'Muntang.com':'문탕닷컴');
    }
    const paths=[...home.querySelectorAll('.site-menu-groups a')].map(node=>node.getAttribute('href'));
    assert.ok(paths.includes((prefix||'')+'/#showreel'));
    assert.ok(paths.includes(prefix+'/mll'));
    assert.ok(paths.every(path=>path.startsWith('/')));
  }
});

test('English wordmarks highlight the existing domain dot without appending another dot',async()=>{
  const {document}=parseHTML(await fs.readFile('dist/en/index.html','utf8'));
  for(const selector of ['.brand','.paper-signature','.hero-bottom-mark','.footer-brand','.drawer-category-link>span']) {
    const node=document.querySelector(selector);
    assert.ok(node,selector);
    assert.equal(node.textContent,'Muntang.com',selector);
    assert.equal(node.querySelectorAll('.brand-dot').length,1,selector);
    assert.equal(node.querySelector('.brand-dot').textContent,'.');
  }
});
