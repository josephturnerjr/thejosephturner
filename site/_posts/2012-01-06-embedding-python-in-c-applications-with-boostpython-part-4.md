---
layout: post
title:  "Embedding Python in C++ Applications with boost::python: Part 4"
date:   2012-01-06
---



In [Part 2](/blog/post/embedding-python-in-c-applications-with-boostpython-part-2) of this ongoing tutorial, I introduced code for parsing Python exceptions from C++. In [Part 3](/blog/post/embedding-python-in-c-applications-with-boostpython-part-3), I implemented a simple configuration parsing class utilizing the Python `ConfigParser` module. As part of that implementation, I mentioned that for a project of any scale, one would want to catch and deal with Python exceptions within the class, so that clients of the class wouldn&#8217;t have to know about the details of Python. From the perspective of a caller, then, the class would be just like any other C++ class.

The obvious way of handling the Python exceptions would be to handle them in each function. For example, the `get` function of the C++ `ConfigParser` class we created would become:

<pre class="brush: cpp">std::string ConfigParser::get(const std::string &amp;attr, const std::string &amp;section){
    try{
        return py::extract(conf_parser_.attr("get")(section, attr));
    }catch(boost::python::error_already_set const &amp;){
        std::string perror_str = parse_python_exception();
        throw std::runtime_error("Error getting configuration option: " + perror_str);
    }
}</pre>

The error handling code remains the same, but now the `main` function becomes:

<pre class="brush: cpp">
int main(){
    Py_Initialize();
    try{
        ConfigParser parser;
        parser.parse_file("conf_file.1.conf");
        ...
        // Will raise a NoOption exception 
         cout << "Proxy host: " << parser.get("ProxyHost", "Network") << endl;
    }catch(exception &#038;e){
        cout << "Here is the error, from a C++ exception: " << e.what() << endl;
    }
}
</pre>

When the Python exception is raised, it will be parsed and repackaged as a `std::runtime_error`, which is caught at the caller and handled like a normal C++ exception (i.e. without having to go through the `parse_python_exception` rigmarole). For a project that only has a handful of functions or a class or two utilizing embedded Python, this will certainly work. For a larger project, though, one wants to avoid the large amount of duplicated code and the errors it will inevitably bring.

For my implementation, I wanted to always handle the the errors in the same way, but I needed a way to call different functions with different signatures. I decided to leverage another powerful area of the `boost` library: the functors library, and specifically `boost::bind` and `boost::function`. `boost::function` provides functor class wrappers, and `boost::bind` (among other things) binds arguments to functions. The two together, then, enable the passing of functions and their arguments that can be called at a later time. Just what the doctor ordered!

To utilize the functor, the function needs to know about the return type. Since we're wrapping functions with different signatures, a function template does the trick nicely:

<pre class="brush: cpp">
template &lt;class return_type&gt;
return_type call_python_func(boost::function&lt;return_type ()> to_call, const std::string &#038;error_pre){
    std::string error_str(error_pre);

    try{
        return to_call();
    }catch(boost::python::error_already_set const &#038;){
        error_str = error_str + parse_python_exception();
        throw std::runtime_error(error_str);
    }
}
</pre>

This function takes the functor object for a function calling `boost::python` functions. Each function that calls `boost::python` code will now be split into two functions: the private core function that uses the Python functionality and a public wrapper function that uses the `call_python_func` function. Here is the updated `get` function and its partner:

<pre class="brush: cpp">
string ConfigParser::get(const string &#038;attr, const string &#038;section){
    return call_python_func&lt;string>(boost::bind(&#038;ConfigParser::get_py, this, attr, section),
                                    "Error getting configuration option: ");
}

string ConfigParser::get_py(const string &#038;attr, const string &#038;section){
    return py::extract&lt;string>(conf_parser_.attr("get")(section, attr));
}
</pre>

The `get` function binds the passed-in arguments, along with the implicit this pointer, to the `get_py` function, which in turn calls the `boost::python` functions necessary to perform the action. Simple and effective. 

Of course, there is a tradeoff associated here. Instead of the repeated code of the `try...catch` blocks and Python error handling, there are double the number of functions declared per class. For my purposes, I prefer the second form, as it more effectively utilizes the compiler to find errors, but mileage may vary. The most important point is to handle Python errors at a level of code that understands Python. If your entire application needs to understand Python, you should consider rewriting in Python rather than embedding, perhaps with some C++ modules as needed.

As always, you can follow along with the tutorial by cloning the [github repo](https://github.com/josephturnerjr/boost-python-tutorial).
