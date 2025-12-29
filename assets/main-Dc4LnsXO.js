import{s as E}from"./supabase-BZnn04Q5.js";function _e(e){return e?Array.isArray(e)&&e.length>0?e[0].name:e.name?e.name:"Məktəb":"Məktəb"}async function we(){const e=document.getElementById("topStudentsList");if(!e)return;const{data:t,error:n}=await E.from("students").select("id, full_name, class_name, xp_points, schools(name)").order("xp_points",{ascending:!1}).limit(5);if(n&&console.error("Students Error:",n),!t||t.length===0){e.innerHTML='<p class="text-center text-gray-400 py-6">Məlumat yoxdur</p>';return}let s="";t.forEach((o,i)=>{let r=i===0?"text-yellow-500":i===1?"text-gray-500":i===2?"text-orange-500":"text-blue-500",a=i===0?"👑":`#${i+1}`;const d=_e(o.schools).split(" ")[0];s+=`
        <div onclick="window.openStudentDetails('${o.id}')" 
             class="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-yellow-50 hover:shadow-md transition cursor-pointer group border border-transparent hover:border-yellow-200">
            <div class="flex items-center gap-3">
                <span class="font-bold ${r} w-6 text-center">${a}</span>
                <div>
                    <p class="font-bold text-gray-800 text-sm group-hover:text-primary transition">${o.full_name}</p>
                    <p class="text-xs text-gray-500">${d}</p>
                </div>
            </div>
            <div class="font-cinzel font-bold text-primary text-sm">${o.xp_points} XP</div>
        </div>`}),e.innerHTML=s}async function Ie(){const e=document.getElementById("topBooksList");if(!e)return;const{data:t,error:n}=await E.from("books").select("id, title, author, borrow_count").order("borrow_count",{ascending:!1}).limit(5);if(n&&console.error("Books Error:",n),!t||t.length===0){e.innerHTML='<p class="text-center text-gray-400 py-6">Məlumat yoxdur</p>';return}let s="";t.forEach(o=>{s+=`
        <div onclick="window.openBookDetails('${o.id}')"
             class="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-red-50 hover:shadow-md transition cursor-pointer group border border-transparent hover:border-red-200">
            <div class="flex items-center gap-3">
                <div class="w-8 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                    <i class="fas fa-book"></i>
                </div>
                <div>
                    <p class="font-bold text-gray-800 text-sm line-clamp-1 group-hover:text-red-600 transition">${o.title}</p>
                    <p class="text-xs text-gray-500">${o.author||"Müəllif naməlum"}</p>
                </div>
            </div>
            <div class="text-xs font-bold text-red-500 bg-red-100 px-2 py-1 rounded-lg">
                🔥 ${o.borrow_count}
            </div>
        </div>`}),e.innerHTML=s}async function be(){const e=document.getElementById("recentActivityList");if(!e)return;const{data:t,error:n}=await E.from("transactions").select("status, borrow_date, students(full_name), books(title)").order("borrow_date",{ascending:!1}).limit(6);if(n&&console.error("Activity Error:",n),!t||t.length===0){e.innerHTML='<p class="text-center text-gray-400 py-6">Sakitlikdir...</p>';return}let s="";t.forEach(o=>{var f,g;const i=o.status==="returned",r=i?'<i class="fas fa-check-circle text-green-500"></i>':'<i class="fas fa-book-open text-blue-500"></i>',a=i?"qaytardı":"götürdü",d=o.students?Array.isArray(o.students)?(f=o.students[0])==null?void 0:f.full_name:o.students.full_name:"Naməlum",u=o.books?Array.isArray(o.books)?(g=o.books[0])==null?void 0:g.title:o.books.title:"Kitab";s+=`
        <div class="flex items-start gap-3 p-3 border-b border-gray-100 last:border-0">
            <div class="mt-1">${r}</div>
            <div>
                <p class="text-sm text-gray-700">
                    <span class="font-bold">${d}</span> bir kitab ${a}.
                </p>
                <p class="text-xs text-gray-400 mt-1">"${u}"</p>
            </div>
        </div>`}),e.innerHTML=s}let G=null;const T=document.getElementById("borrowModal"),L=document.getElementById("step1"),M=document.getElementById("step2"),U=document.getElementById("schoolCodeInput"),Y=document.getElementById("selectedSchoolName"),C=document.getElementById("orderBookTitle"),_=document.getElementById("bookSuggestions"),x=document.getElementById("orderStudentName"),w=document.getElementById("studentSuggestions"),le=document.getElementById("orderClass");function N(e,t){var s;const n=document.createElement("div");n.className=`toast ${t}`,n.innerHTML=`<i class="fas fa-${t==="success"?"check-circle":"exclamation-circle"}"></i> ${e}`,(s=document.getElementById("toast-container"))==null||s.appendChild(n),setTimeout(()=>n.remove(),3e3)}async function Ce(){const e=U.value.trim();if(!e)return N("Məktəb kodunu yazın!","error");try{const{data:t,error:n}=await E.from("schools").select("id, name").ilike("name",`%${e}%`).single();n||!t?(N("Məktəb tapılmadı!","error"),U.classList.add("border-red-500"),setTimeout(()=>U.classList.remove("border-red-500"),1e3)):(G=t.id,Y&&(Y.innerText=t.name),L==null||L.classList.add("hidden"),M==null||M.classList.remove("hidden"),N(`Məktəb tapıldı: ${t.name}`,"success"))}catch(t){console.error(t)}}let P;function xe(){C==null||C.addEventListener("input",e=>{const t=e.target.value;if(t.length<2){_&&(_.style.display="none");return}clearTimeout(P),P=setTimeout(async()=>{const{data:n}=await E.from("books").select("id, title, quantity").eq("school_id",G).ilike("title",`%${t}%`).limit(5);_&&(_.innerHTML="",n&&n.length?(_.style.display="block",n.forEach(s=>{const o=document.createElement("div");o.className="suggestion-item",o.innerHTML=`${s.title} <span class="text-xs font-bold ${s.quantity>0?"text-green-600":"text-red-500"} float-right">${s.quantity} ədəd</span>`,o.onclick=()=>{C.value=s.title,C.dataset.id=s.id,_.style.display="none"},_.appendChild(o)})):_.style.display="none")},300)})}let V;function Re(){x==null||x.addEventListener("input",e=>{const t=e.target.value;if(t.length<2){w&&(w.style.display="none");return}clearTimeout(V),V=setTimeout(async()=>{const{data:n}=await E.from("students").select("id, full_name, class_name").eq("school_id",G).ilike("full_name",`%${t}%`).limit(5);w&&(w.innerHTML="",n&&n.length?(w.style.display="block",n.forEach(s=>{const o=document.createElement("div");o.className="suggestion-item",o.innerText=`${s.full_name} (${s.class_name})`,o.onclick=()=>{x.value=s.full_name,x.dataset.id=s.id,le.value=s.class_name,w.style.display="none"},w.appendChild(o)})):w.style.display="none")},300)})}async function Te(){const e=x.dataset.id,t=C.dataset.id;if(!e||!t)return N("Zəhmət olmasa siyahıdan seçin!","error");const{error:n}=await E.from("transactions").insert([{school_id:G,student_id:e,book_id:t,status:"pending",borrow_date:new Date}]);n?N("Xəta: "+n.message,"error"):(N("Sifariş göndərildi! Müəllim təsdiqini gözləyin.","success"),T==null||T.classList.add("hidden"),T==null||T.classList.remove("flex"),C.value="",x.value="",le.value="",L==null||L.classList.remove("hidden"),M==null||M.classList.add("hidden"))}const ue=e=>{window.showToast?window.showToast(e,"error"):alert(e)};async function Ae(e){var i;const t=document.getElementById("studentDetailsModal"),n=document.getElementById("studentHistoryList"),s=document.getElementById("detailStudentName"),o=document.getElementById("detailStudentSchool");t==null||t.classList.remove("hidden"),t==null||t.classList.add("flex"),n&&(n.innerHTML='<div class="text-center py-10"><i class="fas fa-spinner fa-spin text-3xl text-primary"></i></div>');try{const{data:r,error:a}=await E.from("students").select("full_name, class_name, schools(name)").eq("id",e).single();if(a||!r)throw new Error("Şagird tapılmadı");s&&(s.innerText=r.full_name);const d=r.schools,u=(Array.isArray(d)?(i=d[0])==null?void 0:i.name:d==null?void 0:d.name)||"Məktəb";o&&(o.innerText=`${u} • ${r.class_name}`);const{data:f}=await E.from("transactions").select("rating, review_text, borrow_date, returned_date, is_review_approved, books(title, author)").eq("student_id",e).eq("status","returned").order("returned_date",{ascending:!1});if(n){if(n.innerHTML="",!f||f.length===0){n.innerHTML='<div class="text-center text-gray-400 py-4">Bu şagird hələ kitab bitirməyib.</div>';return}f.forEach(g=>{var y,p;const c="⭐".repeat(g.rating||0),l=(Array.isArray(g.books)?(y=g.books[0])==null?void 0:y.title:(p=g.books)==null?void 0:p.title)||"Kitab";let m="";g.review_text&&g.is_review_approved?m=`<p class="text-sm text-gray-600 italic bg-white p-3 rounded-lg border border-gray-100 mt-2">"${g.review_text}"</p>`:g.review_text&&!g.is_review_approved&&(m='<p class="text-xs text-yellow-600 bg-yellow-50 p-2 rounded mt-2">Rəy yoxlanılır...</p>'),n.innerHTML+=`
                <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div class="flex justify-between items-start mb-1">
                        <h5 class="font-bold text-gray-800 text-sm">${l}</h5>
                        <span class="text-xs text-yellow-500">${c}</span>
                    </div>
                    ${m}
                    <p class="text-xs text-gray-400 mt-2 text-right">${new Date(g.returned_date).toLocaleDateString("az-AZ")}</p>
                </div>`})}}catch(r){console.error(r),ue("Xəta oldu."),t==null||t.classList.add("hidden")}}async function Oe(e){const t=document.getElementById("bookDetailsModal"),n=document.getElementById("bookReviewsList"),s=document.getElementById("detailBookTitle"),o=document.getElementById("detailBookRating"),i=document.getElementById("detailBookStars");t==null||t.classList.remove("hidden"),t==null||t.classList.add("flex"),n&&(n.innerHTML='<div class="text-center py-10"><i class="fas fa-spinner fa-spin text-3xl text-red-500"></i></div>');try{const{data:r}=await E.from("books").select("title").eq("id",e).single();s&&r&&(s.innerText=r.title);const{data:a}=await E.from("transactions").select("rating, review_text, returned_date, students(full_name)").eq("book_id",e).eq("is_review_approved",!0).not("review_text","is",null).order("rating",{ascending:!1});if(n&&a){n.innerHTML="";let d=0;a.forEach(f=>d+=f.rating||0);const u=a.length>0?(d/a.length).toFixed(1):"0.0";if(o&&(o.innerText=u),i){const f=Math.round(Number(u));i.innerHTML="⭐".repeat(f)+"<span class='text-gray-300'>"+"⭐".repeat(5-f)+"</span>"}if(a.length===0){n.innerHTML='<div class="text-center text-gray-400 py-4">Hələ təsdiqlənmiş rəy yoxdur.</div>';return}a.forEach(f=>{var l,m;const g="⭐".repeat(f.rating||0),c=(Array.isArray(f.students)?(l=f.students[0])==null?void 0:l.full_name:(m=f.students)==null?void 0:m.full_name)||"Anonim";n.innerHTML+=`
                <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div class="flex justify-between items-center mb-2">
                        <div class="flex items-center gap-2">
                            <div class="w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-xs font-bold">
                                ${c.charAt(0)}
                            </div>
                            <span class="font-bold text-gray-700 text-sm">${c}</span>
                        </div>
                        <span class="text-xs text-yellow-500">${g}</span>
                    </div>
                    <p class="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-100">"${f.review_text}"</p>
                </div>`})}}catch(r){console.error(r),ue("Məlumat yüklənmədi."),t==null||t.classList.add("hidden")}}var z;(function(e){e.STRING="string",e.NUMBER="number",e.INTEGER="integer",e.BOOLEAN="boolean",e.ARRAY="array",e.OBJECT="object"})(z||(z={}));/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var X;(function(e){e.LANGUAGE_UNSPECIFIED="language_unspecified",e.PYTHON="python"})(X||(X={}));var J;(function(e){e.OUTCOME_UNSPECIFIED="outcome_unspecified",e.OUTCOME_OK="outcome_ok",e.OUTCOME_FAILED="outcome_failed",e.OUTCOME_DEADLINE_EXCEEDED="outcome_deadline_exceeded"})(J||(J={}));/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const W=["user","model","function","system"];var O;(function(e){e.HARM_CATEGORY_UNSPECIFIED="HARM_CATEGORY_UNSPECIFIED",e.HARM_CATEGORY_HATE_SPEECH="HARM_CATEGORY_HATE_SPEECH",e.HARM_CATEGORY_SEXUALLY_EXPLICIT="HARM_CATEGORY_SEXUALLY_EXPLICIT",e.HARM_CATEGORY_HARASSMENT="HARM_CATEGORY_HARASSMENT",e.HARM_CATEGORY_DANGEROUS_CONTENT="HARM_CATEGORY_DANGEROUS_CONTENT",e.HARM_CATEGORY_CIVIC_INTEGRITY="HARM_CATEGORY_CIVIC_INTEGRITY"})(O||(O={}));var S;(function(e){e.HARM_BLOCK_THRESHOLD_UNSPECIFIED="HARM_BLOCK_THRESHOLD_UNSPECIFIED",e.BLOCK_LOW_AND_ABOVE="BLOCK_LOW_AND_ABOVE",e.BLOCK_MEDIUM_AND_ABOVE="BLOCK_MEDIUM_AND_ABOVE",e.BLOCK_ONLY_HIGH="BLOCK_ONLY_HIGH",e.BLOCK_NONE="BLOCK_NONE"})(S||(S={}));var Z;(function(e){e.HARM_PROBABILITY_UNSPECIFIED="HARM_PROBABILITY_UNSPECIFIED",e.NEGLIGIBLE="NEGLIGIBLE",e.LOW="LOW",e.MEDIUM="MEDIUM",e.HIGH="HIGH"})(Z||(Z={}));var Q;(function(e){e.BLOCKED_REASON_UNSPECIFIED="BLOCKED_REASON_UNSPECIFIED",e.SAFETY="SAFETY",e.OTHER="OTHER"})(Q||(Q={}));var B;(function(e){e.FINISH_REASON_UNSPECIFIED="FINISH_REASON_UNSPECIFIED",e.STOP="STOP",e.MAX_TOKENS="MAX_TOKENS",e.SAFETY="SAFETY",e.RECITATION="RECITATION",e.LANGUAGE="LANGUAGE",e.BLOCKLIST="BLOCKLIST",e.PROHIBITED_CONTENT="PROHIBITED_CONTENT",e.SPII="SPII",e.MALFORMED_FUNCTION_CALL="MALFORMED_FUNCTION_CALL",e.OTHER="OTHER"})(B||(B={}));var ee;(function(e){e.TASK_TYPE_UNSPECIFIED="TASK_TYPE_UNSPECIFIED",e.RETRIEVAL_QUERY="RETRIEVAL_QUERY",e.RETRIEVAL_DOCUMENT="RETRIEVAL_DOCUMENT",e.SEMANTIC_SIMILARITY="SEMANTIC_SIMILARITY",e.CLASSIFICATION="CLASSIFICATION",e.CLUSTERING="CLUSTERING"})(ee||(ee={}));var te;(function(e){e.MODE_UNSPECIFIED="MODE_UNSPECIFIED",e.AUTO="AUTO",e.ANY="ANY",e.NONE="NONE"})(te||(te={}));var ne;(function(e){e.MODE_UNSPECIFIED="MODE_UNSPECIFIED",e.MODE_DYNAMIC="MODE_DYNAMIC"})(ne||(ne={}));/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class h extends Error{constructor(t){super(`[GoogleGenerativeAI Error]: ${t}`)}}class A extends h{constructor(t,n){super(t),this.response=n}}class fe extends h{constructor(t,n,s,o){super(t),this.status=n,this.statusText=s,this.errorDetails=o}}class b extends h{}class ge extends h{}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Se="https://generativelanguage.googleapis.com",Le="v1beta",Me="0.24.1",Ne="genai-js";var R;(function(e){e.GENERATE_CONTENT="generateContent",e.STREAM_GENERATE_CONTENT="streamGenerateContent",e.COUNT_TOKENS="countTokens",e.EMBED_CONTENT="embedContent",e.BATCH_EMBED_CONTENTS="batchEmbedContents"})(R||(R={}));class Be{constructor(t,n,s,o,i){this.model=t,this.task=n,this.apiKey=s,this.stream=o,this.requestOptions=i}toString(){var t,n;const s=((t=this.requestOptions)===null||t===void 0?void 0:t.apiVersion)||Le;let i=`${((n=this.requestOptions)===null||n===void 0?void 0:n.baseUrl)||Se}/${s}/${this.model}:${this.task}`;return this.stream&&(i+="?alt=sse"),i}}function ke(e){const t=[];return e!=null&&e.apiClient&&t.push(e.apiClient),t.push(`${Ne}/${Me}`),t.join(" ")}async function $e(e){var t;const n=new Headers;n.append("Content-Type","application/json"),n.append("x-goog-api-client",ke(e.requestOptions)),n.append("x-goog-api-key",e.apiKey);let s=(t=e.requestOptions)===null||t===void 0?void 0:t.customHeaders;if(s){if(!(s instanceof Headers))try{s=new Headers(s)}catch(o){throw new b(`unable to convert customHeaders value ${JSON.stringify(s)} to Headers: ${o.message}`)}for(const[o,i]of s.entries()){if(o==="x-goog-api-key")throw new b(`Cannot set reserved header name ${o}`);if(o==="x-goog-api-client")throw new b(`Header name ${o} can only be set using the apiClient field`);n.append(o,i)}}return n}async function De(e,t,n,s,o,i){const r=new Be(e,t,n,s,i);return{url:r.toString(),fetchOptions:Object.assign(Object.assign({},Ue(i)),{method:"POST",headers:await $e(r),body:o})}}async function D(e,t,n,s,o,i={},r=fetch){const{url:a,fetchOptions:d}=await De(e,t,n,s,o,i);return He(a,d,r)}async function He(e,t,n=fetch){let s;try{s=await n(e,t)}catch(o){Ge(o,e)}return s.ok||await qe(s,e),s}function Ge(e,t){let n=e;throw n.name==="AbortError"?(n=new ge(`Request aborted when fetching ${t.toString()}: ${e.message}`),n.stack=e.stack):e instanceof fe||e instanceof b||(n=new h(`Error fetching from ${t.toString()}: ${e.message}`),n.stack=e.stack),n}async function qe(e,t){let n="",s;try{const o=await e.json();n=o.error.message,o.error.details&&(n+=` ${JSON.stringify(o.error.details)}`,s=o.error.details)}catch{}throw new fe(`Error fetching from ${t.toString()}: [${e.status} ${e.statusText}] ${n}`,e.status,e.statusText,s)}function Ue(e){const t={};if((e==null?void 0:e.signal)!==void 0||(e==null?void 0:e.timeout)>=0){const n=new AbortController;(e==null?void 0:e.timeout)>=0&&setTimeout(()=>n.abort(),e.timeout),e!=null&&e.signal&&e.signal.addEventListener("abort",()=>{n.abort()}),t.signal=n.signal}return t}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function K(e){return e.text=()=>{if(e.candidates&&e.candidates.length>0){if(e.candidates.length>1&&console.warn(`This response had ${e.candidates.length} candidates. Returning text from the first candidate only. Access response.candidates directly to use the other candidates.`),H(e.candidates[0]))throw new A(`${I(e)}`,e);return Ke(e)}else if(e.promptFeedback)throw new A(`Text not available. ${I(e)}`,e);return""},e.functionCall=()=>{if(e.candidates&&e.candidates.length>0){if(e.candidates.length>1&&console.warn(`This response had ${e.candidates.length} candidates. Returning function calls from the first candidate only. Access response.candidates directly to use the other candidates.`),H(e.candidates[0]))throw new A(`${I(e)}`,e);return console.warn("response.functionCall() is deprecated. Use response.functionCalls() instead."),se(e)[0]}else if(e.promptFeedback)throw new A(`Function call not available. ${I(e)}`,e)},e.functionCalls=()=>{if(e.candidates&&e.candidates.length>0){if(e.candidates.length>1&&console.warn(`This response had ${e.candidates.length} candidates. Returning function calls from the first candidate only. Access response.candidates directly to use the other candidates.`),H(e.candidates[0]))throw new A(`${I(e)}`,e);return se(e)}else if(e.promptFeedback)throw new A(`Function call not available. ${I(e)}`,e)},e}function Ke(e){var t,n,s,o;const i=[];if(!((n=(t=e.candidates)===null||t===void 0?void 0:t[0].content)===null||n===void 0)&&n.parts)for(const r of(o=(s=e.candidates)===null||s===void 0?void 0:s[0].content)===null||o===void 0?void 0:o.parts)r.text&&i.push(r.text),r.executableCode&&i.push("\n```"+r.executableCode.language+`
`+r.executableCode.code+"\n```\n"),r.codeExecutionResult&&i.push("\n```\n"+r.codeExecutionResult.output+"\n```\n");return i.length>0?i.join(""):""}function se(e){var t,n,s,o;const i=[];if(!((n=(t=e.candidates)===null||t===void 0?void 0:t[0].content)===null||n===void 0)&&n.parts)for(const r of(o=(s=e.candidates)===null||s===void 0?void 0:s[0].content)===null||o===void 0?void 0:o.parts)r.functionCall&&i.push(r.functionCall);if(i.length>0)return i}const je=[B.RECITATION,B.SAFETY,B.LANGUAGE];function H(e){return!!e.finishReason&&je.includes(e.finishReason)}function I(e){var t,n,s;let o="";if((!e.candidates||e.candidates.length===0)&&e.promptFeedback)o+="Response was blocked",!((t=e.promptFeedback)===null||t===void 0)&&t.blockReason&&(o+=` due to ${e.promptFeedback.blockReason}`),!((n=e.promptFeedback)===null||n===void 0)&&n.blockReasonMessage&&(o+=`: ${e.promptFeedback.blockReasonMessage}`);else if(!((s=e.candidates)===null||s===void 0)&&s[0]){const i=e.candidates[0];H(i)&&(o+=`Candidate was blocked due to ${i.finishReason}`,i.finishMessage&&(o+=`: ${i.finishMessage}`))}return o}function k(e){return this instanceof k?(this.v=e,this):new k(e)}function Fe(e,t,n){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var s=n.apply(e,t||[]),o,i=[];return o={},r("next"),r("throw"),r("return"),o[Symbol.asyncIterator]=function(){return this},o;function r(c){s[c]&&(o[c]=function(l){return new Promise(function(m,y){i.push([c,l,m,y])>1||a(c,l)})})}function a(c,l){try{d(s[c](l))}catch(m){g(i[0][3],m)}}function d(c){c.value instanceof k?Promise.resolve(c.value.v).then(u,f):g(i[0][2],c)}function u(c){a("next",c)}function f(c){a("throw",c)}function g(c,l){c(l),i.shift(),i.length&&a(i[0][0],i[0][1])}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const oe=/^data\: (.*)(?:\n\n|\r\r|\r\n\r\n)/;function Ye(e){const t=e.body.pipeThrough(new TextDecoderStream("utf8",{fatal:!0})),n=ze(t),[s,o]=n.tee();return{stream:Ve(s),response:Pe(o)}}async function Pe(e){const t=[],n=e.getReader();for(;;){const{done:s,value:o}=await n.read();if(s)return K(Xe(t));t.push(o)}}function Ve(e){return Fe(this,arguments,function*(){const n=e.getReader();for(;;){const{value:s,done:o}=yield k(n.read());if(o)break;yield yield k(K(s))}})}function ze(e){const t=e.getReader();return new ReadableStream({start(s){let o="";return i();function i(){return t.read().then(({value:r,done:a})=>{if(a){if(o.trim()){s.error(new h("Failed to parse stream"));return}s.close();return}o+=r;let d=o.match(oe),u;for(;d;){try{u=JSON.parse(d[1])}catch{s.error(new h(`Error parsing JSON response: "${d[1]}"`));return}s.enqueue(u),o=o.substring(d[0].length),d=o.match(oe)}return i()}).catch(r=>{let a=r;throw a.stack=r.stack,a.name==="AbortError"?a=new ge("Request aborted when reading from the stream"):a=new h("Error reading from the stream"),a})}}})}function Xe(e){const t=e[e.length-1],n={promptFeedback:t==null?void 0:t.promptFeedback};for(const s of e){if(s.candidates){let o=0;for(const i of s.candidates)if(n.candidates||(n.candidates=[]),n.candidates[o]||(n.candidates[o]={index:o}),n.candidates[o].citationMetadata=i.citationMetadata,n.candidates[o].groundingMetadata=i.groundingMetadata,n.candidates[o].finishReason=i.finishReason,n.candidates[o].finishMessage=i.finishMessage,n.candidates[o].safetyRatings=i.safetyRatings,i.content&&i.content.parts){n.candidates[o].content||(n.candidates[o].content={role:i.content.role||"user",parts:[]});const r={};for(const a of i.content.parts)a.text&&(r.text=a.text),a.functionCall&&(r.functionCall=a.functionCall),a.executableCode&&(r.executableCode=a.executableCode),a.codeExecutionResult&&(r.codeExecutionResult=a.codeExecutionResult),Object.keys(r).length===0&&(r.text=""),n.candidates[o].content.parts.push(r)}o++}s.usageMetadata&&(n.usageMetadata=s.usageMetadata)}return n}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function me(e,t,n,s){const o=await D(t,R.STREAM_GENERATE_CONTENT,e,!0,JSON.stringify(n),s);return Ye(o)}async function he(e,t,n,s){const i=await(await D(t,R.GENERATE_CONTENT,e,!1,JSON.stringify(n),s)).json();return{response:K(i)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ee(e){if(e!=null){if(typeof e=="string")return{role:"system",parts:[{text:e}]};if(e.text)return{role:"system",parts:[e]};if(e.parts)return e.role?e:{role:"system",parts:e.parts}}}function $(e){let t=[];if(typeof e=="string")t=[{text:e}];else for(const n of e)typeof n=="string"?t.push({text:n}):t.push(n);return Je(t)}function Je(e){const t={role:"user",parts:[]},n={role:"function",parts:[]};let s=!1,o=!1;for(const i of e)"functionResponse"in i?(n.parts.push(i),o=!0):(t.parts.push(i),s=!0);if(s&&o)throw new h("Within a single message, FunctionResponse cannot be mixed with other type of part in the request for sending chat message.");if(!s&&!o)throw new h("No content is provided for sending chat message.");return s?t:n}function We(e,t){var n;let s={model:t==null?void 0:t.model,generationConfig:t==null?void 0:t.generationConfig,safetySettings:t==null?void 0:t.safetySettings,tools:t==null?void 0:t.tools,toolConfig:t==null?void 0:t.toolConfig,systemInstruction:t==null?void 0:t.systemInstruction,cachedContent:(n=t==null?void 0:t.cachedContent)===null||n===void 0?void 0:n.name,contents:[]};const o=e.generateContentRequest!=null;if(e.contents){if(o)throw new b("CountTokensRequest must have one of contents or generateContentRequest, not both.");s.contents=e.contents}else if(o)s=Object.assign(Object.assign({},s),e.generateContentRequest);else{const i=$(e);s.contents=[i]}return{generateContentRequest:s}}function ie(e){let t;return e.contents?t=e:t={contents:[$(e)]},e.systemInstruction&&(t.systemInstruction=Ee(e.systemInstruction)),t}function Ze(e){return typeof e=="string"||Array.isArray(e)?{content:$(e)}:e}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const re=["text","inlineData","functionCall","functionResponse","executableCode","codeExecutionResult"],Qe={user:["text","inlineData"],function:["functionResponse"],model:["text","functionCall","executableCode","codeExecutionResult"],system:["text"]};function et(e){let t=!1;for(const n of e){const{role:s,parts:o}=n;if(!t&&s!=="user")throw new h(`First content should be with role 'user', got ${s}`);if(!W.includes(s))throw new h(`Each item should include role field. Got ${s} but valid roles are: ${JSON.stringify(W)}`);if(!Array.isArray(o))throw new h("Content should have 'parts' property with an array of Parts");if(o.length===0)throw new h("Each Content should have at least one part");const i={text:0,inlineData:0,functionCall:0,functionResponse:0,fileData:0,executableCode:0,codeExecutionResult:0};for(const a of o)for(const d of re)d in a&&(i[d]+=1);const r=Qe[s];for(const a of re)if(!r.includes(a)&&i[a]>0)throw new h(`Content with role '${s}' can't contain '${a}' part`);t=!0}}function ae(e){var t;if(e.candidates===void 0||e.candidates.length===0)return!1;const n=(t=e.candidates[0])===null||t===void 0?void 0:t.content;if(n===void 0||n.parts===void 0||n.parts.length===0)return!1;for(const s of n.parts)if(s===void 0||Object.keys(s).length===0||s.text!==void 0&&s.text==="")return!1;return!0}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const de="SILENT_ERROR";class tt{constructor(t,n,s,o={}){this.model=n,this.params=s,this._requestOptions=o,this._history=[],this._sendPromise=Promise.resolve(),this._apiKey=t,s!=null&&s.history&&(et(s.history),this._history=s.history)}async getHistory(){return await this._sendPromise,this._history}async sendMessage(t,n={}){var s,o,i,r,a,d;await this._sendPromise;const u=$(t),f={safetySettings:(s=this.params)===null||s===void 0?void 0:s.safetySettings,generationConfig:(o=this.params)===null||o===void 0?void 0:o.generationConfig,tools:(i=this.params)===null||i===void 0?void 0:i.tools,toolConfig:(r=this.params)===null||r===void 0?void 0:r.toolConfig,systemInstruction:(a=this.params)===null||a===void 0?void 0:a.systemInstruction,cachedContent:(d=this.params)===null||d===void 0?void 0:d.cachedContent,contents:[...this._history,u]},g=Object.assign(Object.assign({},this._requestOptions),n);let c;return this._sendPromise=this._sendPromise.then(()=>he(this._apiKey,this.model,f,g)).then(l=>{var m;if(ae(l.response)){this._history.push(u);const y=Object.assign({parts:[],role:"model"},(m=l.response.candidates)===null||m===void 0?void 0:m[0].content);this._history.push(y)}else{const y=I(l.response);y&&console.warn(`sendMessage() was unsuccessful. ${y}. Inspect response object for details.`)}c=l}).catch(l=>{throw this._sendPromise=Promise.resolve(),l}),await this._sendPromise,c}async sendMessageStream(t,n={}){var s,o,i,r,a,d;await this._sendPromise;const u=$(t),f={safetySettings:(s=this.params)===null||s===void 0?void 0:s.safetySettings,generationConfig:(o=this.params)===null||o===void 0?void 0:o.generationConfig,tools:(i=this.params)===null||i===void 0?void 0:i.tools,toolConfig:(r=this.params)===null||r===void 0?void 0:r.toolConfig,systemInstruction:(a=this.params)===null||a===void 0?void 0:a.systemInstruction,cachedContent:(d=this.params)===null||d===void 0?void 0:d.cachedContent,contents:[...this._history,u]},g=Object.assign(Object.assign({},this._requestOptions),n),c=me(this._apiKey,this.model,f,g);return this._sendPromise=this._sendPromise.then(()=>c).catch(l=>{throw new Error(de)}).then(l=>l.response).then(l=>{if(ae(l)){this._history.push(u);const m=Object.assign({},l.candidates[0].content);m.role||(m.role="model"),this._history.push(m)}else{const m=I(l);m&&console.warn(`sendMessageStream() was unsuccessful. ${m}. Inspect response object for details.`)}}).catch(l=>{l.message!==de&&console.error(l)}),c}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function nt(e,t,n,s){return(await D(t,R.COUNT_TOKENS,e,!1,JSON.stringify(n),s)).json()}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function st(e,t,n,s){return(await D(t,R.EMBED_CONTENT,e,!1,JSON.stringify(n),s)).json()}async function ot(e,t,n,s){const o=n.requests.map(r=>Object.assign(Object.assign({},r),{model:t}));return(await D(t,R.BATCH_EMBED_CONTENTS,e,!1,JSON.stringify({requests:o}),s)).json()}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ce{constructor(t,n,s={}){this.apiKey=t,this._requestOptions=s,n.model.includes("/")?this.model=n.model:this.model=`models/${n.model}`,this.generationConfig=n.generationConfig||{},this.safetySettings=n.safetySettings||[],this.tools=n.tools,this.toolConfig=n.toolConfig,this.systemInstruction=Ee(n.systemInstruction),this.cachedContent=n.cachedContent}async generateContent(t,n={}){var s;const o=ie(t),i=Object.assign(Object.assign({},this._requestOptions),n);return he(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:(s=this.cachedContent)===null||s===void 0?void 0:s.name},o),i)}async generateContentStream(t,n={}){var s;const o=ie(t),i=Object.assign(Object.assign({},this._requestOptions),n);return me(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:(s=this.cachedContent)===null||s===void 0?void 0:s.name},o),i)}startChat(t){var n;return new tt(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:(n=this.cachedContent)===null||n===void 0?void 0:n.name},t),this._requestOptions)}async countTokens(t,n={}){const s=We(t,{model:this.model,generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:this.cachedContent}),o=Object.assign(Object.assign({},this._requestOptions),n);return nt(this.apiKey,this.model,s,o)}async embedContent(t,n={}){const s=Ze(t),o=Object.assign(Object.assign({},this._requestOptions),n);return st(this.apiKey,this.model,s,o)}async batchEmbedContents(t,n={}){const s=Object.assign(Object.assign({},this._requestOptions),n);return ot(this.apiKey,this.model,t,s)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class it{constructor(t){this.apiKey=t}getGenerativeModel(t,n){if(!t.model)throw new h("Must provide a model name. Example: genai.getGenerativeModel({ model: 'my-model-name' })");return new ce(this.apiKey,t,n)}getGenerativeModelFromCachedContent(t,n,s){if(!t.name)throw new b("Cached content must contain a `name` field.");if(!t.model)throw new b("Cached content must contain a `model` field.");const o=["model","systemInstruction"];for(const r of o)if(n!=null&&n[r]&&t[r]&&(n==null?void 0:n[r])!==t[r]){if(r==="model"){const a=n.model.startsWith("models/")?n.model.replace("models/",""):n.model,d=t.model.startsWith("models/")?t.model.replace("models/",""):t.model;if(a===d)continue}throw new b(`Different value for "${r}" specified in modelParams (${n[r]}) and cachedContent (${t[r]})`)}const i=Object.assign(Object.assign({},n),{model:t.model,tools:t.tools,toolConfig:t.toolConfig,systemInstruction:t.systemInstruction,cachedContent:t});return new ce(this.apiKey,i,s)}}const rt="AIzaSyC6QGX8Jm3RVGdK7Jm9pY8aKqMTpIjZpGk",at=new it(rt);async function dt(e,t){const n=at.getGenerativeModel({model:"gemini-2.5-flash",safetySettings:[{category:O.HARM_CATEGORY_HARASSMENT,threshold:S.BLOCK_NONE},{category:O.HARM_CATEGORY_HATE_SPEECH,threshold:S.BLOCK_NONE},{category:O.HARM_CATEGORY_SEXUALLY_EXPLICIT,threshold:S.BLOCK_NONE},{category:O.HARM_CATEGORY_DANGEROUS_CONTENT,threshold:S.BLOCK_NONE}]}),s=`
        Sən Azərbaycan dilində "Məktəb Kitabxanası" sisteminin ciddi moderatorusan.
        Şagird "${e}" kitabı haqqında bu rəyi yazıb: "${t}".

        Vəzifən (Ardıcıllıqla):
        1. Rəyi yoxla: Söyüş, təhqir, arqo, siyasi şüarlar və ya mənasız hərflər (spam) varmı?
           - VARSA: "approved": false qaytar. "feedback": "Rəyinizdə qəbuledilməz ifadələr var."
        2. Əgər təmizdirsə: "approved": true qaytar.
        3. Rəyi təhlil et və Müəllim üçün qısa hesabat yaz ("analysis").
        4. Rəyə 0-100 arası xal ver ("score").

        Cavabı YALNIZ bu JSON formatında ver (Markdown istifadə etmə):
        {
            "approved": boolean,
            "score": number,
            "analysis": "string",
            "feedback": "string"
        }
    `;try{console.log("🤖 AI Təhlil edir...");let r=(await(await n.generateContent(s)).response).text();return console.log("✅ AI Cavabı:",r),r=r.replace(/```json/g,"").replace(/```/g,"").trim(),JSON.parse(r)}catch(o){return console.error("❌ AI Xətası:",o),{approved:!1,score:0,analysis:`Xəta: ${o.message}`,feedback:"Sistem xətası: Konsola baxın (F12)."}}}let ye=null;const v=(e,t)=>{window.showToast?window.showToast(e,t):alert(e)};document.addEventListener("DOMContentLoaded",()=>{const e=document.getElementById("reviewText"),t=document.getElementById("charCount");e&&t&&e.addEventListener("input",()=>{const s=e.value.length;t.innerText=s.toString(),s>=100?t.classList.add("text-red-500","font-bold"):t.classList.remove("text-red-500","font-bold")});const n=document.getElementById("reviewCodeInput");n&&n.addEventListener("keypress",s=>{s.key==="Enter"&&(s.preventDefault(),j())})});async function j(){var n,s,o,i;const t=document.getElementById("reviewCodeInput").value.trim();if(t.length!==5)return v("Kod 5 rəqəmli olmalıdır!","error");try{const{data:r,error:a}=await E.from("transactions").select("id, student_id, status, review_text, students(full_name), books(title)").eq("secret_code",t).single();if(a||!r)return v("Kod yanlışdır!","error");if(r.status!=="returned")return v("Bu kitab hələ qaytarılmayıb!","error");if(r.review_text)return v("Bu kodla artıq rəy yazılıb!","error");ye=r.id;const d=r.students,u=r.books,f=(Array.isArray(d)?(n=d[0])==null?void 0:n.full_name:d==null?void 0:d.full_name)||"Şagird",g=(Array.isArray(u)?(s=u[0])==null?void 0:s.title:u==null?void 0:u.title)||"Kitab",c=document.getElementById("revStudentName"),l=document.getElementById("revBookTitle");c&&(c.innerText=f),l&&(l.innerText=g),(o=document.getElementById("reviewStep1"))==null||o.classList.add("hidden"),(i=document.getElementById("reviewStep2"))==null||i.classList.remove("hidden")}catch(r){console.error(r),v("Sistem xətası","error")}}function F(e){document.querySelectorAll("#starContainer span").forEach((s,o)=>{o<e?s.classList.add("text-yellow-400"):s.classList.remove("text-yellow-400")});const n=document.getElementById("reviewRating");n&&(n.value=e.toString())}async function ve(){var r,a,d;const e=document.getElementById("reviewText"),t=document.getElementById("reviewRating"),n=document.getElementById("submitReviewBtn"),s=e.value.trim(),o=t.value,i=((r=document.getElementById("revBookTitle"))==null?void 0:r.innerText)||"Kitab";if(!s)return v("Rəy yazın!","error");if(o==="0")return v("Ulduz seçin!","error");n&&(n.innerText="AI YOXLAYIR...",n.disabled=!0);try{const u=await dt(i,s);if(!u.approved){v(`⛔ ${u.feedback}`,"error"),n&&(n.innerText="GÖNDƏR",n.disabled=!1);return}const{error:f}=await E.from("transactions").update({review_text:s,rating:parseInt(o),is_review_approved:!1,ai_analysis:u.analysis,ai_score:u.score}).eq("id",ye);if(f)throw f;v(`✅ Rəy göndərildi! Müəllim təsdiq edəndə +${u.score} XP qazanacaqsınız.`,"success"),window.closeModal&&window.closeModal("reviewModal");const g=document.getElementById("reviewCodeInput");g&&(g.value=""),e.value="";const c=document.getElementById("charCount");c&&(c.innerText="0"),F(0),(a=document.getElementById("reviewStep1"))==null||a.classList.remove("hidden"),(d=document.getElementById("reviewStep2"))==null||d.classList.add("hidden")}catch(u){console.error(u),v("Xəta baş verdi","error")}finally{n&&(n.innerText="GÖNDƏR",n.disabled=!1)}}console.log("🚀 Main System Loaded");window.openStudentDetails=Ae;window.openBookDetails=Oe;window.verifyReviewCode=j;window.submitReview=ve;window.setRating=F;window.showToast=(e,t)=>{const n=document.getElementById("toast-container");if(!n)return;const s=document.createElement("div");s.className=`toast ${t}`,s.innerHTML=`<i class="fas fa-${t==="success"?"check-circle":"exclamation-circle"}"></i> ${e}`,n.appendChild(s),setTimeout(()=>s.remove(),3e3)};window.openModal=e=>{var t,n;return((t=document.getElementById(e))==null?void 0:t.classList.remove("hidden","flex"))||((n=document.getElementById(e))==null?void 0:n.classList.add("flex"))};window.closeModal=e=>{var t;return(t=document.getElementById(e))==null?void 0:t.classList.add("hidden")};window.openBorrowModal=()=>{var e,t;window.openModal("borrowModal"),(e=document.getElementById("step1"))==null||e.classList.remove("hidden"),(t=document.getElementById("step2"))==null||t.classList.add("hidden"),document.getElementById("schoolCodeInput").value=""};document.addEventListener("DOMContentLoaded",()=>{var t,n,s,o,i,r,a,d,u,f,g,c;we(),Ie(),be(),xe(),Re(),(t=document.getElementById("btnBorrowBook"))==null||t.addEventListener("click",window.openBorrowModal);const e=document.getElementById("btnWriteReview");e?(e.addEventListener("click",()=>window.openModal("reviewModal")),console.log("✅ Rəy düyməsi aktivdir")):console.error("❌ Rəy düyməsi tapılmadı (ID yoxlayın)"),(n=document.getElementById("btnAdminLogin"))==null||n.addEventListener("click",()=>window.openModal("teacherModal")),(s=document.getElementById("closeBorrowModal"))==null||s.addEventListener("click",()=>window.closeModal("borrowModal")),(o=document.getElementById("closeReviewModal"))==null||o.addEventListener("click",()=>window.closeModal("reviewModal")),(i=document.getElementById("closeTeacherModal"))==null||i.addEventListener("click",()=>window.closeModal("teacherModal")),(r=document.getElementById("closeStudentDetails"))==null||r.addEventListener("click",()=>window.closeModal("studentDetailsModal")),(a=document.getElementById("closeBookDetails"))==null||a.addEventListener("click",()=>window.closeModal("bookDetailsModal")),(d=document.getElementById("verifyCodeBtn"))==null||d.addEventListener("click",Ce),(u=document.getElementById("submitOrderBtn"))==null||u.addEventListener("click",Te),(f=document.getElementById("verifyReviewBtn"))==null||f.addEventListener("click",j),(g=document.getElementById("submitReviewBtn"))==null||g.addEventListener("click",ve),document.querySelectorAll("#starContainer span").forEach((l,m)=>{l.addEventListener("click",()=>F(m+1))}),(c=document.getElementById("adminLoginForm"))==null||c.addEventListener("submit",async l=>{l.preventDefault();const m=document.getElementById("email").value,y=document.getElementById("password").value,p=document.getElementById("loginBtn");p.innerText="YOXLANILIR...",p.disabled=!0;try{const{data:q,error:pe}=await E.from("admins").select("*").eq("email",m).eq("password",y).single();pe||!q?(window.showToast("Yanlış məlumat!","error"),p.innerText="Daxil Ol",p.disabled=!1):(localStorage.setItem("admin_user",JSON.stringify(q)),localStorage.setItem("school_id",q.school_id),window.location.href="./admin.html")}catch{window.showToast("Sistem xətası","error"),p.disabled=!1}})});
