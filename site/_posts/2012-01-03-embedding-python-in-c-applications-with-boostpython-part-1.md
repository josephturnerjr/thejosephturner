---
layout: post
title:  "Embedding Python in C++ Applications with boost::python: Part 1"
date:   2012-01-03
---

In the [Introduction](/blog/post/embedding-python-in-c-applications-with-boostpython-introduction) to this tutorial series, I took at look at the motivation for integrating Python code into the [Granola](http://grano.la/) code base. In short, it allows me to leverage all the benefits of the Python language and the Python standard library when approaching tasks that are normally painful or awkward in C++. The underlying subtext, of course, is that I didn&#8217;t have to port any of the existing C++ code to do so.

Today, I&#8217;d like to take a look at some first steps at using boost::python to embed Python in C++ and interact with Python objects. I&#8217;ve put all the code from this section in [a github repo](https://github.com/josephturnerjr/boost-python-tutorial), so feel free to check the code out and play along.

At it&#8217;s core, embedding Python is very simple, and requires no C++ code whatsoever &#8211; the libraries provided with a Python distribution [include C bindings](http://docs.python.org/extending/embedding.html). I&#8217;m going to skip over all that though, and jump straight into using Python in C++ via boost::python, which provides class wrappers and polymorphic behavior much more consistent with actual Python code than the C bindings would allow. In the later parts of this tutorial, we&#8217;ll cover a few things that you can&#8217;t do with boost::python (notably, multithreading and error handling).

So anyway, to get started you need to [download and build boost](http://www.boost.org/doc/libs/1_46_1/more/getting_started/index.html), or retrieve a copy from your package manager. If you choose to build it, you can build just the boost::python library (it is unfortunately not header-only), though I would suggest getting familiar with the entire set of libraries if you do a lot of C++ programming. If you are following along with the git repo, make sure you change the path in the Makefile to point to your boost installation directory. And thus concludes the exposition. Let&#8217;s dive in!

First, we need to be able to build an application with Python embedded. With gcc this isn&#8217;t too difficult; it is simply a matter of including boost::python and libpython as either static or shared libraries. Depending on how you build boost, you may have trouble mixing and matching. In the tutorial code on github, we will use the static boost::python library (libboost_python.a) and the dynamic version of the Python library (libpython.so).

One of the soft requirements I had for my development efforts at MiserWare was to make the environment consistent across all of our support operating systems: several Windows and an ever-changing list of Linux distros. As a result, Granola links against a pinned version of Python and the installation packages include the Python library files required to run our code. Not ideal, perhaps, but it results in an environment where I am positive our code will run across all supported operating systems.

Let&#8217;s get some code running. You&#8217;ll need to include the correct headers, as you might imagine.

<pre class="brush: cpp">    Py_Initialize();
    py::object main_module = py::import("__main__");
    py::object main_namespace = main_module.attr("__dict__");</pre>

Note that you must initialize the Python interpreter directly (line 1). While boost::python greatly eases the task of embedding Python, it does not handle everything you need to do. As I mentioned above, we&#8217;ll see some more shortcomings in future sections of the tutorial. After initializing, the [`__main__` module](http://docs.python.org/library/__main__.html) is imported and the namespace is extracted. This results in a blank canvas upon which we can then call Python code, adding modules and variables.

<pre class="brush: cpp">    boost::python::exec("print 'Hello, world'", main_namespace);
    boost::python::exec("print 'Hello, world'[3:5]", main_namespace);
    boost::python::exec("print '.'.join(['1','2','3'])", main_namespace);</pre>

The `exec` function runs the arbitrary code in the string parameter within the specified namespace. All of the normal, non-imported code is available. Of course, this isn&#8217;t very useful without being able to import modules and extract values.

<pre class="brush: cpp">    boost::python::exec("import random", main_namespace);
    boost::python::object rand = boost::python::eval("random.random()", main_namespace);
    std::cout &lt;&lt; py::extract&lt;double&gt;(rand) &lt;&lt; std::endl;</pre>

Here we&#8217;ve imported the [`random` module](http://docs.python.org/library/random.html) by executing the corresponding Python statement within the `__main__` namespace, bringing the module into the namespace. After the module is available, we can use functions, objects, and variables within the namespace. In this example, we use the `eval` function, which returns the result of the passed-in Python statement, to create a boost::python object containing a random value as returned by the `random()` function in the `random` module. Finally, we extract the value as a C++ `double` type and print it.

This may seem a bit.. soft. Calling Python by passing formatted Python strings into C++ functions? Not a very object-oriented way of dealing with things. Fortunately, there is a better way.

<pre class="brush: cpp">    boost::python::object rand_mod = boost::python::import("random");
    boost::python::object rand_func = rand_mod.attr("random");
    boost::python::object rand2 = rand_func();
    std::cout &lt;&lt; boost::python::extract(rand2) &lt;&lt; std::endl;</pre>

In this final example, we import the `random` module, but this time using the boost::python `import` function, which loads the module into a boost Python object. Next, the `random` function object is extracted from the `random` module and stored in a boost::python object. The function is called, returning a Python object containing the random number. Finally, the double value is extracted and printed. In general, all Python objects can be handled in this way &#8211; functions, classes, built-in types. 

It really starts getting interesting when you start holding complex standard library objects and instances of user-defined classes. In the [next tutorial](/blog/post/embedding-python-in-c-applications-with-boostpython-part-2), I&#8217;ll <del datetime="2011-06-16T04:39:32+00:00">take a full class through its paces and build a bona fide configuration parsing class around the `ConfigParser` module</del> discuss the details of parsing Python exceptions from C++ code.
