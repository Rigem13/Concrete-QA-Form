// Replace YOUR_PROJECT_REF with the Supabase project reference.
// Add <input type="email" name="inspectorEmail" placeholder="Inspector email (optional)">.
// Remove the previous form submit listener, then include this file before </body>.
const QF_FUNCTION_URL="https://uyhwijnqrnghdleyzmho.supabase.co/functions/v1/submit-inspection";
const qfForm=document.getElementById("inspectionForm");
function qfRead(file){return new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(r.result);r.onerror=no;r.readAsDataURL(file);});}
async function qfPhoto(file){
 if(!file||!file.type.startsWith("image/")) throw Error("Please upload an image.");
 const url=await qfRead(file), img=new Image();
 await new Promise((ok,no)=>{img.onload=ok;img.onerror=no;img.src=url;});
 const scale=Math.min(1,1600/Math.max(img.width,img.height));
 const c=document.createElement("canvas");c.width=img.width*scale;c.height=img.height*scale;
 c.getContext("2d").drawImage(img,0,0,c.width,c.height);
 return c.toDataURL("image/jpeg",0.78);
}
qfForm?.addEventListener("submit",async e=>{
 e.preventDefault();
 const btn=qfForm.querySelector('button[type="submit"]');
 try{
  const file=(document.getElementById("photoInput")||document.getElementById("photo"))?.files?.[0];
  if(!file) throw Error("Please upload the inspection photo.");
  const checklist=[...qfForm.querySelectorAll('input[name="checklist"]:checked')].map(x=>x.parentElement?.innerText.trim()||"Verified");
  if(checklist.length!==5) throw Error("Please check all five QA/QC items.");
  if(btn){btn.disabled=true;btn.textContent="SUBMITTING...";}
  const get=n=>qfForm.elements.namedItem(n)?.value?.trim()||"";
  const payload={
   project:get("project"),inspector:get("inspector"),inspectorEmail:get("inspectorEmail"),
   element:get("element"),spacer:qfForm.querySelector('[name="spacer"]:checked')?.value||"",
   checklist,photoLog:get("photoLog"),status:qfForm.querySelector('[name="status"]:checked')?.value||"",
   comments:get("comments"),photoBase64:await qfPhoto(file),photoMimeType:"image/jpeg"
  };
  const r=await fetch(QF_FUNCTION_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
  const result=await r.json();if(!r.ok||!result.ok) throw Error(result.error||"Submission failed.");
  const msg=document.getElementById("successMessage");
  if(msg){msg.style.display="block";msg.innerHTML=`<h3>✓ INSPECTION SAVED!</h3><p>Reference: <b>${result.inspectionNo}</b></p><p>Photo saved to Google Drive.</p><p>Email notifications: ${result.emailSent?"sent":"not configured / not sent"}</p>`;msg.scrollIntoView({behavior:"smooth"});}
  qfForm.reset();
 }catch(err){alert(err.message||"Submission failed.");}
 finally{if(btn){btn.disabled=false;btn.textContent="SUBMIT INSPECTION";}}
});
