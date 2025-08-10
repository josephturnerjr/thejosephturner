---
layout: post
title:  "The Perils of Embedding Python 2.7"
date:   2013-04-01
---



**TL;DR: _A change to the &#8216;import site&#8217; mechanism between Python 2.6 and 2.7 can mean silent application exit for applications with embedded Python._**

As you may know from some of my other posts, we at MiserWare leverage an embedded Python interpreter in our [Granola](http://grano.la) product, with success despite the pitfalls and sometimes cryptic (or missing) documentation. This week, I upgraded us from Python 2.6.4 to Python 2.7.2. Everything was going smoothly, until I began testing installation packages  for software with an embedded interpreter on our clean (i.e. non-development environment) test systems.

Since the packaging, in this case MSI files, hadn&#8217;t changed significantly for the upcoming release, and since my tests on my development machine of the software itself had gone smoothly, I expected the installation tests to be what they usually are: tedious, boring, and successful. I fired up the installer, went through the brief UI sequence, hit Finish and&#8230; the software didn&#8217;t start. Hmm. I cleaned the system completely, re-installed, same problem. I locate the file on disk, double click, same problem. I run the program from a command prompt, same problem.

At this point, I figure that the problem is with the packaging itself, so I double check my [WiX](http://sourceforge.net/projects/wix/) files, but everything seems to be fine. By this point, it still hadn&#8217;t occurred to me that the Python upgrade could be the problem, so I drop in a few debugging `MessageBox` calls, rebuild, and re-install. After a couple rounds of that, I discover that the software is failing inside the `Py_Initialize` call. Hmm.

I fire up an old development environment that hadn&#8217;t upgraded to Python 2.7 yet and load the project in the Visual Studio debugger. Running the program causes program exit with return value 1. What? All of our return value error codes are negative numbers. _Was the embedded Python library causing the application itself to exit?_

It turns out, that is exactly what was happening. After some step-debugging through the disassembly of python27.dll with the Python source tree open in a separate console, I finally locate the source of the exit in Python/pythonrun.c:

<pre class="brush: cpp">static void
initsite(void)
{
    PyObject *m;
    m = PyImport_ImportModule("site");
    if (m == NULL) {
        PyErr_Print();
        Py_Finalize();
        exit(1);
    }
    else {
        Py_DECREF(m);
    }
}</pre>

Yikes! [Previously (at least, in 2.6.4)](http://svn.python.org/view/python/trunk/Python/pythonrun.c?r1=75570&amp;r2=78826&amp;pathrev=78826), &#8216;`import site`&#8216; failure would at worst print an error message to the console if there was an attached console&#8230; in the case of Granola, a Windows GUI application, there wasn&#8217;t, so all I had to work with was an application exit code _being raised from within a linked library_. If I was going to be diplomatic, I&#8217;d say that the decision to accept that patch was made with the interpreter executable and not embedding applications in mind. And it gets better.

Now armed with the location of the failure, it&#8217;s time to fix the application. It turns out that the call to `initsite()` occurs _prior to the parsing of the environment variables._  What that means is that PYTHONPATH, PYTHONHOME, and other ways to tell the interpreter where to find modules don&#8217;t have an impact on the search for the `site` module, though that is not documented. [N.B., the reason it worked on my development machine was that it DOES honor a Windows registry setting that the Python installer creates, pointing to its own lib path.]

Without detailing the pain I went through to determine this, I&#8217;ll tell you the answer. You basically have one option (in Windows at least): you need to lay out your Python modules relative to your embedding application _just as they appear in the normal Python installation tree,_ which is to say putting them all in Lib/ and DLLs/ folders at the same directory level as your application. You can also optionally call `Py_SetPythonHome` to specify a different directory under which to search for Lib/ and DLLs/. Oh, and just in case you go looking for it, that layout [isn&#8217;t documented](http://docs.python.org/using/cmdline.html#envvar-PYTHONHOME); you&#8217;ll only see the preferred layout for Unix systems which won&#8217;t work in Windows.

What&#8217;s the takeaway? For me, it just means one thing: don&#8217;t expect consistency out of future versions of Python, at least with regard to embedding applications.
