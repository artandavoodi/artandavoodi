import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';
const context=vm.createContext({});
vm.runInContext(await readFile(new URL('./artist-enquiries.gs',import.meta.url),'utf8'),context);
const recipients={press:'press@example.invalid',music:'music@example.invalid',general:'contact@example.invalid'};
const valid={name:'Visitor',email:'visitor@example.invalid',purpose:'press',message:'Interview request',processing_acknowledgement:'yes'};
test('artist enquiries validate purpose, email, acknowledgement and field bounds',()=>{
  assert.equal(context.validateArtistEnquiry_(valid,recipients).purpose,'press');
  for(const input of [{...valid,purpose:'owner'},{...valid,email:'x\r\nBcc:y'},{...valid,message:'x'.repeat(5001)},{...valid,processing_acknowledgement:'no'},{...valid,website_check:'spam'}])assert.throws(()=>context.validateArtistEnquiry_(input,recipients));
});
test('artist sheet cells cannot execute formulas',()=>{
  for(const value of ['=1+1',' +SUM(A1)','@value','-1'])assert.equal(context.safeArtistCell_(value),"'"+value);
  assert.equal(context.safeArtistCell_('A normal message'),'A normal message');
});
