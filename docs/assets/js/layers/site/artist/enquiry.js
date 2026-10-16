import {loadJson} from '../../../core/data.js';
export async function bindArtistEnquiry(){
  const form=document.querySelector('[data-artist-enquiry]');
  if(!form)return;
  const hub=await loadJson('assets/data/hub.json');
  form.addEventListener('submit',event=>{
    event.preventDefault();
    if(!form.reportValidity())return;
    const data=new FormData(form);
    const recipient=hub.contacts.find(contact=>contact.id===data.get('purpose'));
    if(!recipient?.url?.startsWith('mailto:'))return;
    const subject=form.elements.purpose.selectedOptions[0].textContent;
    const body=`${data.get('name')}\n${data.get('email')}\n\n${data.get('message')}`;
    location.href=`${recipient.url}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}
