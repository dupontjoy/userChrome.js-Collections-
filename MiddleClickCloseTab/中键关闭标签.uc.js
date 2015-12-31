var time = 1;
 gBrowser.mTabContainer.addEventListener('click', function(event) {
   if (event.target.localName == "tab" && event.button ==1) {
     if(time){
       gBrowser.removeTab(event.target);
       event.stopPropagation();
       event.preventDefault();
       time = 0;
       setTimeout('time=1',400);
     }
   }
 }, true);