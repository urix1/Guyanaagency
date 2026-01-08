/* auto-engineer.js — cleaned and simplified.
   Purpose: preserve local error collection and console capture but remove any Blink branding,
   badge injection, or external postMessage telemetry. No debug endpoint in production build.
*/
(function(){
  // Global stores
  window.__AUTO_ENGINEER_ERRORS__ = window.__AUTO_ENGINEER_ERRORS__ || [];
  window.__AUTO_ENGINEER_INTERACTION_TRAIL__ = window.__AUTO_ENGINEER_INTERACTION_TRAIL__ || [];

  // Add interaction helper
  function addInteraction(interaction){
    try{
      const enriched = Object.assign({}, interaction, {timestamp: Date.now(), pageUrl: location.href});
      const trail = window.__AUTO_ENGINEER_INTERACTION_TRAIL__;
      trail.push(enriched);
      if(trail.length > 12) trail.shift();
    }catch(e){/* ignore */}
  }

  // Basic error handler
  window.addEventListener('error', function(ev){
    try{
      const err = ev.error || {};
      window.__AUTO_ENGINEER_ERRORS__.push({
        id: 'runtime-'+Date.now(),
        message: err.message || ev.message || 'Unknown error',
        stack: err.stack || null,
        filename: ev.filename || null,
        lineno: ev.lineno || null,
        colno: ev.colno || null,
        source: 'runtime',
        timestamp: new Date().toISOString(),
        pageUrl: location.href,
        interactionTrail: Array.from(window.__AUTO_ENGINEER_INTERACTION_TRAIL__ || [])
      });
    }catch(e){/* ignore */}
  }, true);

  window.addEventListener('unhandledrejection', function(ev){
    try{
      const reason = ev.reason;
      window.__AUTO_ENGINEER_ERRORS__.push({
        id: 'promise-'+Date.now(),
        message: (reason && reason.message) || String(reason) || 'Unhandled promise rejection',
        stack: reason && reason.stack || null,
        source: 'unhandledrejection',
        timestamp: new Date().toISOString(),
        pageUrl: location.href,
        interactionTrail: Array.from(window.__AUTO_ENGINEER_INTERACTION_TRAIL__ || [])
      });
    }catch(e){/* ignore */}
  }, true);

  // Console capture for errors
  (function(){
    const origError = console.error.bind(console);
    console.error = function(){
      try{
        const items = Array.from(arguments).map(a => {
          try{ return typeof a === 'string' ? a : JSON.stringify(a); }catch(e){ return String(a); }
        }).join(' ');
        window.__AUTO_ENGINEER_ERRORS__.push({
          id: 'console-'+Date.now(),
          message: items,
          source: 'console',
          timestamp: new Date().toISOString(),
          pageUrl: location.href,
          interactionTrail: Array.from(window.__AUTO_ENGINEER_INTERACTION_TRAIL__ || [])
        });
      }catch(e){}
      origError.apply(console, arguments);
    };
  })();

  // Lightweight interaction tracking (clicks)
  document.addEventListener('click', function(e){
    try{
      const t = e.target;
      const tag = t && t.tagName ? t.tagName.toLowerCase() : 'unknown';
      addInteraction({type: 'click', tag: tag, text: (t && t.innerText||'').slice(0,60)});
    }catch(err){}
  }, true);

  // Production build: no external telemetry, no badge injection, no postMessage to blink.new
})();
