---
layout: post
title:  "Select discontinuous items or ranges from a Python list"
date:   2013-01-02
---



If you need to select several discontinuous items (and/or ranges) from a Python `list`, you can use the `operator` module&#8217;s [`itemgetter`](http://docs.python.org/library/operator.html#operator.itemgetter) second-order function. In the realm of lists, it accepts arguments as either integers or [`slice`](http://docs.python.org/library/functions.html#slice) objects and returns a function object that when called on a list returns the elements specified.

What? Like this:

<pre class="brush: python">&gt;&gt;&gt; from operator import itemgetter
&gt;&gt;&gt; get_items = itemgetter(1, 4, 6, slice(8, 12))
&gt;&gt;&gt; get_items
&lt;operator.itemgetter object at 0x02160D70&gt;
&gt;&gt;&gt; get_items(range(20))
(1, 4, 6, [8, 9, 10, 11])</pre>

I&#8217;ll leave it as an exercise to the reader to figure out how to flatten the resulting tuple. If it proves challenging, I&#8217;d suggest trying some or all of the [99 Prolog Problems](https://sites.google.com/site/prologsite/prolog-problems) (but a list ain&#8217;t one?), in Python of course :)
