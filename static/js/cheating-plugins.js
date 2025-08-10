(function() {
  var CheatWidget, FloatingBalloon, Solver, SolverResults,
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Array.prototype.unique = function() {
    var key, output, value, _ref, _results;
    output = {};
    for (key = 0, _ref = this.length; 0 <= _ref ? key < _ref : key > _ref; 0 <= _ref ? key++ : key--) {
      output[this[key]] = this[key];
    }
    _results = [];
    for (key in output) {
      value = output[key];
      _results.push(value);
    }
    return _results;
  };

  Solver = (function() {

    function Solver(data) {
      var i, key, l, lengths, w, word_sets, words, x, _len;
      words = new String(data).trim().split(' ');
      words = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = words.length; _i < _len; _i++) {
          x = words[_i];
          _results.push(x.toLowerCase());
        }
        return _results;
      })();
      words = words.unique();
      lengths = ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = words.length; _i < _len; _i++) {
          w = words[_i];
          _results.push(w.length);
        }
        return _results;
      })()).unique();
      word_sets = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = lengths.length; _i < _len; _i++) {
          l = lengths[_i];
          _results.push((function() {
            var _j, _len2, _results2;
            _results2 = [];
            for (_j = 0, _len2 = words.length; _j < _len2; _j++) {
              x = words[_j];
              if (x.length === l) _results2.push(x);
            }
            return _results2;
          })());
        }
        return _results;
      })();
      this.words = {};
      for (i = 0, _len = lengths.length; i < _len; i++) {
        key = lengths[i];
        this.words[key] = word_sets[i];
      }
    }

    Solver.prototype.solve = function(query, tried) {
      var bad_chars, ignore_pattern, off_limits, possibilities, reg, x;
      bad_chars = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = query.length; _i < _len; _i++) {
          x = query[_i];
          if (x !== '.') _results.push(x);
        }
        return _results;
      })();
      bad_chars = bad_chars.concat((tried.length ? tried.join("") : [])).unique();
      off_limits = bad_chars.join("");
      ignore_pattern = "[^" + off_limits + "]";
      reg = new RegExp(query.replace(/\./g, ignore_pattern));
      possibilities = [];
      if (this.words[query.length] != null) {
        possibilities = (function() {
          var _i, _len, _ref, _results;
          _ref = this.words[query.length];
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            x = _ref[_i];
            if (x.match(reg)) _results.push(x);
          }
          return _results;
        }).call(this);
      }
      return new SolverResults(possibilities, bad_chars);
    };

    return Solver;

  })();

  SolverResults = (function() {

    function SolverResults(possibilities, bad_chars) {
      this.possibilities = possibilities;
      this.bad_chars = bad_chars;
    }

    SolverResults.prototype.get_possibilities = function() {
      return this.possibilities;
    };

    SolverResults.prototype.get_letter_freqs = function() {
      var chars, concat, x, y;
      if (!(this.scores != null)) {
        if (this.possibilities.length === 0) {
          this.scores = [];
        } else {
          concat = this.possibilities.join("").split("");
          chars = (function() {
            var _i, _len, _ref, _results;
            _ref = concat.unique();
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              x = _ref[_i];
              if (__indexOf.call(this.bad_chars, x) < 0) _results.push(x);
            }
            return _results;
          }).call(this);
          this.scores = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = chars.length; _i < _len; _i++) {
              x = chars[_i];
              _results.push([
                ((function() {
                  var _j, _len2, _ref, _results2;
                  _ref = this.possibilities;
                  _results2 = [];
                  for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
                    y = _ref[_j];
                    if (__indexOf.call(y, x) >= 0) _results2.push(y);
                  }
                  return _results2;
                }).call(this)).length, x
              ]);
            }
            return _results;
          }).call(this);
          this.scores.sort(function(a, b) {
            return b[0] - a[0];
          });
        }
      }
      return this.scores;
    };

    return SolverResults;

  })();

  $.fn.cheatwidget = function(options) {
    var data_name;
    data_name = "_cheatwidget";
    return this.each(function() {
      var el, _data;
      el = $(this);
      if (el.data(data_name) != null) {
        _data = el.data(data_name);
        _data.update_options(options);
        return _data.render();
      } else {
        _data = new CheatWidget(el, options);
        return el.data(data_name, _data);
      }
    });
  };

  CheatWidget = (function() {

    function CheatWidget(el, options) {
      this.init = __bind(this.init, this);
      var template;
      this.el = el;
      this.update_options(options);
      template = $("                      <div id='cheat_explain'>                        <p>                        <em>Everyone knows that winning is the fun part of any game.</em>                        Stop losing at Hanging with Friends to those nerds you call opponents.                        </p>                        <p>                        Input your challenge below and bask in the glory of the only thing that's important: victory!                        </p>                      </div>                      <div class='row-fluid'><div class='span4 cheat_input'>                        <h2></h2>                        <p>Enter the word, using any non-alphabet character for an unknown:</p>                        <input name='word' type='text' value='Loading dictionary...' disabled></input>                        <p>Enter any excluded letters (i.e. letters you've tried that weren't in the word):</p>                        <input name='misses' type='text' value='Loading dictionary...' disabled></input>                      </div>                      <div class='span4 cheat_letters'>                        <h2>The most likely next letter is:</h2>                      </div>                      <div class='span4 cheat_words'>                        <h2>Possible words:</h2>                      </div></div>                     ");
      this.el.append(template);
      $.get('/static/wordlist.txt', this.init);
    }

    CheatWidget.prototype.init = function(data, textStatus, jqXHR) {
      var _this = this;
      this.solver = new Solver(data);
      this.word_input = this.el.find('input[name="word"]').prop('disabled', false).val("ch..t.n.").keyup(function() {
        return _this.handle_word();
      });
      this.misses_input = this.el.find('input[name="misses"]').prop('disabled', false).val("rs").keyup(function() {
        return _this.handle_word();
      });
      this.cheat_words = this.el.find('.cheat_words');
      this.cheat_letters = this.el.find('.cheat_letters');
      return this.word_input = this.el.find('input[name="word"]').keyup();
    };

    CheatWidget.prototype.handle_word = function() {
      var misses, possibilities, results, word;
      word = this.word_input.val().replace(/[^a-zA-Z]/g, '.');
      this.word_input.val(word);
      misses = this.misses_input.val();
      results = this.solver.solve(word, misses.split(""));
      possibilities = results.get_possibilities();
      this.draw_words(possibilities);
      return this.draw_letter_freqs(results.get_letter_freqs(), possibilities.length);
    };

    CheatWidget.prototype.draw_words = function(possibilities) {
      return this.cheat_words.html("<h2>Possible words:</h2>                            <p>" + (possibilities.join(" ")) + "</p>");
    };

    CheatWidget.prototype.draw_letter_freqs = function(freqs, wordcount) {
      var f, freq, graph_div, htmltext, letter, likelihood, likely_letters, v, _i, _len;
      if (freqs.length === 0) {
        return this.cheat_letters.html("<h2>The most likely next letter is:</h2>");
      } else {
        likely_letters = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = freqs.length; _i < _len; _i++) {
            f = freqs[_i];
            if (f[0] === freqs[0][0]) _results.push(f[1]);
          }
          return _results;
        })();
        htmltext = "<h2>The most likely next letter" + (likely_letters.length === 1 ? " is" : "s are") + ":</h2>                        <h1>" + (likely_letters.join(", ")) + "</h1>                        <h2>with probability " + ((100.0 * freqs[0][0] / wordcount).toFixed(2)) + "%</h2>";
        this.cheat_letters.html(htmltext);
        graph_div = $("<div class='pmchart clearfix'></div>");
        for (_i = 0, _len = freqs.length; _i < _len; _i++) {
          v = freqs[_i];
          freq = v[0], letter = v[1];
          likelihood = (100.0 * freq) / wordcount;
          graph_div.append("<div class='pmcolumn' style='width: " + (100.0 / freqs.length) + "%'>                                    <div style='bottom: " + likelihood + "px'>                                        <p>" + letter + "</p>                                    </div>                                    <div class='columndata' style='height: " + likelihood + "px;'></div>                                  </div>");
        }
        graph_div.append("<p>100%</p>");
        return this.cheat_letters.append(graph_div);
      }
    };

    CheatWidget.prototype.update_options = function(options) {
      return this.options = options;
    };

    return CheatWidget;

  })();

  $.fn.floatingballoon = function(options) {
    var data_name;
    data_name = "_floatingballoon";
    return this.each(function() {
      var el, _data;
      el = $(this);
      if (el.data(data_name) != null) {
        _data = el.data(data_name);
        _data.update_options(options);
        return _data.render();
      } else {
        _data = new FloatingBalloon(el, options);
        return el.data(data_name, _data);
      }
    });
  };

  FloatingBalloon = (function() {

    function FloatingBalloon(el, options) {
      var _this;
      this.el = el;
      this.swingwidth = 50;
      this.el.html("<img src='/static/img/balloon.png' />");
      _this = this;
      this.int_id = setInterval((function() {
        return _this.move();
      }), 50);
      this.init();
    }

    FloatingBalloon.prototype.init = function() {
      this.height = this.el.outerHeight(true);
      this.inittop = $(window).height();
      this.initleft = Math.random() * $(window).width();
      this.addtop = 0;
      this.lefttheta = 2 * Math.PI * Math.random();
      return this.el.css("top", this.inittop).css("left", this.initleft);
    };

    FloatingBalloon.prototype.move = function() {
      console.log("here");
      this.addtop -= 1;
      this.lefttheta += 0.01;
      this.el.css("top", this.inittop + this.addtop).css("left", this.initleft + this.swingwidth * Math.sin(this.lefttheta));
      if (this.inittop + this.addtop + this.height < 0) return this.init();
    };

    return FloatingBalloon;

  })();

}).call(this);
