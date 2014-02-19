---
layout: post
title:  "Embedding Python in C++ Applications with boost::python: Part 2"
date:   2012-01-04
---


In [Part 1](/blog/post/embedding-python-in-c-applications-with-boostpython-part-1), we took a look at embedding Python in C++ applications, including several ways of calling Python code from your application. Though I earlier promised a full implementation of a configuration parser in Part 2, I think it&#8217;s more constructive to take a look at error parsing. Once we have a good way to handle errors in Python code, I&#8217;ll create the promised configuration parser in Part 3. Let&#8217;s jump in!

If you got yourself a copy of the [git repo for the tutorial](https://github.com/josephturnerjr/boost-python-tutorial) and were playing around with it, you may have experienced the way `boost::python` handles Python errors &#8211; the [`error_already_set` exception type](http://www.boost.org/doc/libs/1_37_0/libs/python/doc/v2/errors.html#error_already_set-spec). If not, the following code will generate the exception:

<pre class="brush: cpp">
    namespace py = boost::python;
    ...
    Py_Initialize();
    ...
    py::object rand_mod = py::import("fake_module");
</pre>

&#8230;which outputs the not-so-helpful:

<pre style="overflow: scroll;">
terminate called after throwing an instance of 'boost::python::error_already_set'
Aborted
</pre>

In short, any errors that occur in the Python code that `boost::python` handles will cause the library to raise this exception; unfortunately, the exception does not encapsulate any of the information about the error itself. To extract information about the error, we&#8217;re going to have to resort to using the Python C API and some Python itself. First, catch the error:

<pre class="brush: cpp">
    try{
        Py_Initialize();
        py::object rand_mod = py::import("fake_module");
    }catch(boost::python::error_already_set const &#038;){
        std::string perror_str = parse_python_exception();
        std::cout << "Error in Python: " << perror_str << std::endl;
    }
</pre>

Above, we've called the `parse_python_exception` function to extract the error string and print it. As this suggests, the exception data is stored statically in the Python library and not encapsulated in the exception itself. The first step in the `parse_python_exception` function, then, is to extract that data using the [`PyErr_Fetch` Python C API function](http://docs.python.org/c-api/exceptions.html#PyErr_Fetch):

<pre class="brush: cpp">
std::string parse_python_exception(){
    PyObject *type_ptr = NULL, *value_ptr = NULL, *traceback_ptr = NULL;
    PyErr_Fetch(&#038;type_ptr, &#038;value_ptr, &#038;traceback_ptr);
    std::string ret("Unfetchable Python error");
    ...
</pre>

As there may be all, some, or none of the exception data available, we set up the returned string with a fallback value. Next, we try to extract and stringify the type data from the exception information:

<pre class="brush: cpp">
    ...
    if(type_ptr != NULL){
        py::handle&lt;&gt; h_type(type_ptr);
        py::str type_pstr(h_type);
        py::extract&lt;std::string&gt; e_type_pstr(type_pstr);
        if(e_type_pstr.check())
            ret = e_type_pstr();
        else
            ret = "Unknown exception type";
    }
    ...
</pre>

In this block, we first check that there is actually a valid pointer to the type data. If there is, we construct a `boost::python::handle` to the data from which we then create a `str` object. This conversion should ensure that a valid string extraction is possible, but to double check we create an [extract object](http://wiki.python.org/moin/boost.python/extract), check the object, and then perform the extraction if it is valid. Otherwise, we use a fallback string for the type information.

Next, we perform a very similar set of steps on the exception value:

<pre class="brush: cpp">
    ...
    if(value_ptr != NULL){
        py::handle&lt;&gt; h_val(value_ptr);
        py::str a(h_val);
        py::extract&lt;std::string&gt; returned(a);
        if(returned.check())
            ret +=  ": " + returned();
        else
            ret += std::string(": Unparseable Python error: ");
    }
    ...
</pre>

We append the value string to the existing error string. The value string is, for most built-in exception types, the readable string describing the error.

Finally, we extract the traceback data:

<pre class="brush: cpp">
    if(traceback_ptr != NULL){
        py::handle&lt;&gt; h_tb(traceback_ptr);
        py::object tb(py::import("traceback"));
        py::object fmt_tb(tb.attr("format_tb"));
        py::object tb_list(fmt_tb(h_tb));
        py::object tb_str(py::str("\n").join(tb_list));
        py::extract&lt;std::string&gt; returned(tb_str);
        if(returned.check())
            ret += ": " + returned();
        else
            ret += std::string(": Unparseable Python traceback");
    }
    return ret;
}
</pre>

The traceback goes similarly to the type and value extractions, except for the extra step of formatting the traceback object as a string. For that, we import the `traceback` module. From traceback, we then extract the `format_tb` function and call it with the handle to the traceback object. This generates a list of traceback strings which we then join into a single string. Not the prettiest printing, perhaps, but it gets the job done. Finally, we extract the C++ string type as above and append it to the returned error string and return the entire result.

In the context of the earlier error, the application now generates the following output:

<pre>
Error in Python: <type 'exceptions.ImportError'>: No module named fake_module
</pre>

Generally speaking, this function will make it much easier to get to the root cause of problems in your embedded Python code. One caveat: if you are configuring a custom Python environment (especially module paths) for your embedded interpreter, the `parse_python_exception` function may itself throw a `boost::error_already_set` when it attempts to load the traceback module, so you may want to wrap the call to the function in a `try...catch` block and parse only the type and value pointers out of the result.

As I mentioned above, in [Part 3](/blog/post/embedding-python-in-c-applications-with-boostpython-part-3) I will walk through the implementation of a configuration parser built on top of the `ConfigParser` Python module. Assuming, of course, that I don't get waylaid again.
