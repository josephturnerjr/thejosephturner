---
layout: post
title:  "Embedding Python in C++ Applications with boost::python: Introduction"
date:   2012-01-02
---

About a year ago, we at [MiserWare](http://www.miserware.com) decided to augment the core power management function of [Granola](http://grano.la) with web connectivity, allowing users to track the savings of all of their machines (and soon, to configure and apply policies and schedules) from a single location &#8211; the [Granola Dash](http://www.youtube.com/watch?v=7dX7skoyavE).

The problem was, though, that our codebase was entirely in C++. I examined several options. Ultimately, I decided that writing the web connectivity code in Python and embedding it in Granola would give me the best agility for my buck. I found [boost::python](http://www.boost.org/doc/libs/1_46_1/libs/python/doc/) and used it as the (excellent) basis of my implementation.

As the months have gone on, I have improved my understanding and implementation of embedded Python in this context, and I have increasingly reached for it to solve all sorts of problems that are painful in C++ and painless in Python &#8211; configuration parsing, complex data structures marshaled in JSON, automatic updating, and basically anything else that isn&#8217;t core algorithms (for performance reasons) or system interaction (for compatibility).

Here were my initial requirements:

*   instantiate Python objects and interact with them in a natural way
*   pass data into Python functions
*   extract data from Python functions and objects
*   handle errors from with the Python code

After the code started getting more sophisticated, I realized the following were also important topics:

*   call Python code from multiple (actual) threads of execution
*   parse Python exceptions into usable data structures

This series of tutorials is my attempt to document my experiences and help out others who want to take advantage of Python in their C++ applications. In [Part 1](/blog/post/embedding-python-in-c-applications-with-boostpython-part-1), I&#8217;ll cover the basics of embedding Python and using boost::python, and outline a simple C++/Python application. Afterwards, I&#8217;ll cover the topics above and provide some code to solve a lot of the problems that I struggled with initially.
