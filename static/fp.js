$(document).ready(function(){
     $("#content_body").imagesLoaded(function(){
        $('#content_body').masonry({itemSelector: '.project', columnWidth: 320});
      });
});