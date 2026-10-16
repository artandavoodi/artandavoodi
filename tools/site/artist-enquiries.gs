/** Independent artist enquiries. Never configure this project with label storage. */
function configuration_() {
  const properties=PropertiesService.getScriptProperties();
  const config=JSON.parse(properties.getProperty('ARTIST_ENQUIRY_CONFIG')||'{}');
  config.secret=properties.getProperty('RECAPTCHA_SECRET');
  config.spreadsheet=properties.getProperty('SPREADSHEET_ID');
  if(!config.secret||!config.spreadsheet||!config.recipients||!config.hostnames) throw Error('Enquiries are not configured');
  return config;
}
function validateArtistEnquiry_(values,recipients) {
  const result={};
  for(const key of ['name','email','purpose','message']){
    const value=String(values[key]||'').trim();
    if(!value||value.length>(key==='message'?5000:254)||/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(value)) throw Error('Check the required fields');
    result[key]=value;
  }
  if(!/^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/.test(result.email))throw Error('Check your email address');
  if(!Object.prototype.hasOwnProperty.call(recipients,result.purpose))throw Error('Choose an enquiry subject');
  if(values.website_check||values.processing_acknowledgement!=='yes')throw Error('Check your enquiry');
  return result;
}
function safeArtistCell_(value){return /^[\s]*[=+@-]/.test(value)?"'"+value:value;}
function response_(message){
  const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  return HtmlService.createHtmlOutput('<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Artist enquiry</title><main><h1>'+escape(message)+'</h1><p><a href="https://artandavoodi.com/press/#enquiries">Return to Press &amp; contact</a></p></main></html>');
}
function doGet(){return response_('Use the enquiry form on the artist website.');}
function doPost(event){
  try{
    const config=configuration_();
    const values=event&&event.parameter||{};
    const enquiry=validateArtistEnquiry_(values,config.recipients);
    const token=String(values['g-recaptcha-response']||'');
    if(!token||token.length>10000)throw Error('Verification required');
    const verification=JSON.parse(UrlFetchApp.fetch('https://www.google.com/recaptcha/api/siteverify',{method:'post',payload:{secret:config.secret,response:token}}).getContentText());
    if(!verification.success||!config.hostnames.includes(verification.hostname))throw Error('Verification failed');
    const lock=LockService.getScriptLock();
    if(!lock.tryLock(10000))throw Error('Please try again shortly');
    let reference;
    try{
      const cache=CacheService.getScriptCache();
      const bucket='artist-enquiries-'+new Date().toISOString().slice(0,13);
      const count=Number(cache.get(bucket)||0);
      if(count>=50)throw Error('Please contact us by email');
      cache.put(bucket,String(count+1),3600);
      reference=Utilities.getUuid();
      const sheet=SpreadsheetApp.openById(config.spreadsheet).getSheets()[0];
      sheet.appendRow([reference,new Date().toISOString(),enquiry.purpose,enquiry.name,enquiry.email,enquiry.message,'New'].map(safeArtistCell_));
    }finally{lock.releaseLock();}
    try{
      MailApp.sendEmail({to:config.recipients[enquiry.purpose],replyTo:enquiry.email,subject:'Artist enquiry · '+reference,body:enquiry.name+'\n'+enquiry.email+'\n\n'+enquiry.message});
    }catch(error){console.error('Notification unavailable for saved enquiry '+reference);}
    return response_('Thank you. Your enquiry has been received.');
  }catch(error){return response_('Your enquiry could not be sent. Please try again or contact us by email.');}
}
/** Owner-run setup. Do not expose setup through doGet or doPost. */
function createArtistEnquirySheet(){
  const active=Session.getActiveUser().getEmail();
  if(!active||active!==Session.getEffectiveUser().getEmail())throw Error('Owner authorization required');
  const properties=PropertiesService.getScriptProperties();
  if(properties.getProperty('SPREADSHEET_ID'))throw Error('Artist storage is already configured');
  const book=SpreadsheetApp.create('Artan Davoodi Artist Enquiries');
  book.getSheets()[0].appendRow(['Reference','Received UTC','Purpose','Name','Email','Message','Review status']);
  properties.setProperty('SPREADSHEET_ID',book.getId());
}
