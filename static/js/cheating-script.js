(function() {
  var addballoon, onready;

  addballoon = function() {
    return $("<div class='balloon'></div>").appendTo("body").floatingballoon();
  };

  onready = function() {
    var create_rate, i, on_screen, pix_per_sec, secs_per_screen, _results;
    $("#cheatmain").cheatwidget();
    on_screen = 4;
    pix_per_sec = 1000 / 50;
    secs_per_screen = $(window).height() / pix_per_sec;
    create_rate = 1000 * secs_per_screen / on_screen;
    _results = [];
    for (i = 1; 1 <= on_screen ? i <= on_screen : i >= on_screen; 1 <= on_screen ? i++ : i--) {
      _results.push(setTimeout((function() {
        return addballoon();
      }), i * create_rate));
    }
    return _results;
  };

  $(document).ready(onready);

}).call(this);
