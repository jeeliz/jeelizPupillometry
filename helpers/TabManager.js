"use strict";

// Minimalist tab manager inspired from https://www.w3schools.com/howto/howto_js_tabs.asp
// not very material design, it avoids bloated UI libz

// all tabs content divs should have the CSS class "tabContent"
// all tabs links divs should have the CSS class "tabLink"
// the active tab link will have the CSS classes "tabLink tabLinkActive"

var TabManager = (function(){

  function switch_visibility(className, isVisible){
    const domElts = document.getElementsByClassName(className);
    for (let i=0; i<domElts.length; ++i){
      domElts[i].style.display = (isVisible) ? 'block' : 'none';
    }
  }

  function unset_activeTabLinks(){
    const domElts=document.getElementsByClassName('tabLink');
    for (let i=0; i<domElts.length; ++i){
      domElts[i].className = domElts[i].className.replace(' tabLinkActive', '');
    }
  }

  return {
    open: function(eventOrId, domId){
      // hide all tabs content:
      switch_visibility('tabContent', false);

      // show good tab content:
      document.getElementById(domId).style.display = 'block';

      unset_activeTabLinks();
      const domLink = (typeof(eventOrId)==='string') ? document.getElementById(eventOrId) : eventOrId.target;
      domLink.className += ' tabLinkActive';
    }
  }
})();