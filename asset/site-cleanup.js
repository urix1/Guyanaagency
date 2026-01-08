/* site-cleanup.js
   Runs after page load to remove any leftover Blink branding, badge elements,
   convert non-button controls into accessible buttons, and update contact email links.
*/
(function(){
  function removeElements(selector){
    document.querySelectorAll(selector).forEach(el => el.remove());
  }

  function replaceMailto(newEmail){
    // Update anchors with mailto
    document.querySelectorAll('a[href^="mailto:"]').forEach(a =>{
      const href = a.getAttribute('href') || '';
      // preserve subject/body if present
      const parts = href.split('?');
      const suffix = parts[1] ? ('?'+parts[1]) : '';
      a.setAttribute('href', 'mailto:'+newEmail+suffix);
      if(!a.dataset.originalText) a.dataset.originalText = a.textContent;
      // If link text looks like an email, replace it
      if((a.textContent || '').trim().indexOf('@') !== -1){
        a.textContent = newEmail;
      }
    });
  }

  function ensureButtonAccessibility(){
    // Convert divs with role/button or class close-button into real buttons
    document.querySelectorAll('div.close-button, [role="button"], a[role="button"]').forEach(el =>{
      if(el.tagName.toLowerCase() === 'button') return;
      try{
        const btn = document.createElement('button');
        btn.type = 'button';
        // copy classes
        btn.className = el.className || '';
        // copy inline styles
        btn.style.cssText = el.style.cssText || '';
        // copy title/aria-label
        if(el.title) btn.title = el.title;
        if(el.getAttribute('aria-label')) btn.setAttribute('aria-label', el.getAttribute('aria-label'));
        // move children
        while(el.firstChild) btn.appendChild(el.firstChild);
        el.parentNode && el.parentNode.replaceChild(btn, el);
      }catch(e){
        // if conversion fails, at least make it focusable
        el.setAttribute('role', 'button');
        el.setAttribute('tabindex', '0');
      }
    });

    // Ensure all button elements have an explicit type
    document.querySelectorAll('button').forEach(b => {
      if(!b.hasAttribute('type')) b.setAttribute('type','button');
    });
  }

  function removeBlinkDataAttributes(){
    // Remove data-blnk-* attributes and elements
    document.querySelectorAll('[id*="blink"]').forEach(el => el.remove());
    document.querySelectorAll('[class*="blnk"]').forEach(el => el.classList.remove(...Array.from(el.classList).filter(c=>/blnk/i.test(c))));
    document.querySelectorAll('[data-blnk-id], [data-blnk-disabled], [data-blnk-hovered], [data-blnk-selected]').forEach(el => {
      // remove attributes
      ['data-blnk-id','data-blnk-disabled','data-blnk-hovered','data-blnk-selected'].forEach(attr=>el.removeAttribute(attr));
    });
  }

  function runCleanup(){
    try{
      // Remove the explicit badge container if present
      removeElements('#blink-badge-container');
      // Remove any node named blink-badge etc
      removeElements('[id^="blink"], [class*="blink-badge"], [data-widget="blink"], .blink-badge');

      // Remove inline Blink selector scripts if present
      removeElements('script[src*="blink.new"], script[src*="blnk"], script[data-blink]');

      // Remove attribution links that point to blink.new
      document.querySelectorAll('a[href*="blink.new"]').forEach(a=>{ a.remove(); });

      // Update contact email links to the new email
      replaceMailto('skyhighdoagency@gmail.com');

      // Convert any non-semantic button-like elements to buttons
      ensureButtonAccessibility();

      // Remove data-blnk attributes/classes
      removeBlinkDataAttributes();

      // Additional: ensure any tel: links remain unchanged but visible
      // (we don't modify phone numbers)

    }catch(err){
      console.error('site-cleanup error', err);
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', runCleanup);
  } else {
    runCleanup();
  }
})();
