---
layout: post
title:  "Embedding Python in C++ Applications with boost::python: Part 3"
date:   2012-01-05
---


In [Part 2 of this tutorial](/blog/post/embedding-python-in-c-applications-with-boostpython-part-2), I covered a methodology for handling exceptions thrown from embedded Python code from within the C++ part of your application. This is crucial for debugging your embedded Python code. In this tutorial, we will create a simple C++ class that leverages Python functionality to handle an often-irritating part of developing real applications: configuration parsing. 

In an attempt to not draw ire from the C++ elites, I am going to say this in a diplomatic way: I suck at complex string manipulations in C++. STL `strings` and `stringstreams` greatly simplify the task, but performing application-level tasks, and performing them in a robust way, always results in me writing more code that I would really like. As a result, I recently rewrote the configuration parsing mechanism from Granola Connect (the daemon in [Granola Enterprise](http://grano.la/software/about_granola_enterprise.php) that handles communication with the Granola REST API) using embedded Python and specifically the [`ConfigParser`](http://docs.python.org/library/configparser.html) module. 

Of course, string manipulations and configuration parsing are just an example. For Part 3, I could have chosen any number of tasks that are difficult in C++ and easy in Python (web connectivity, for instance), but the configuration parsing class is a simple yet complete example of embedding Python for something of actual use. Grab the code from the [Github repo for this tutorial](https://github.com/josephturnerjr/boost-python-tutorial) to play along.

First, let&#8217;s create a class definition that covers very basic configuration parsing: read and parse INI-style files, extract string values given a name and a section, and set string values for a given section. Here is the class declaration:

<pre class="brush: cpp">
class ConfigParser{
    private:
        boost::python::object conf_parser_;

        void init();
    public:
        ConfigParser();

        bool parse_file(const std::string &#038;filename);
        std::string get(const std::string &#038;attr,
                        const std::string &#038;section = "DEFAULT");
        void set(const std::string &#038;attr,
                 const std::string &#038;value,
                 const std::string &#038;section = "DEFAULT");
};
</pre>

The `ConfigParser` module offers far more features than we will cover in this tutorial, but the subset we implement here should serve as a template for implementing more complex functionality. The implementation of the class is fairly simple; first, the constructor loads the main module, extracts the dictionary, imports the `ConfigParser` module into the namespace, and creates a `boost::python::object` member variable holding a `RawConfigParser` object:

<pre class="brush: cpp">
ConfigParser::ConfigParser(){
    py::object mm = py::import("__main__");
    py::object mn = mm.attr("__dict__");
    py::exec("import ConfigParser", mn);
    conf_parser_ = py::eval("ConfigParser.RawConfigParser()", mn);
}
</pre>

The file parsing and the getting and setting of values is performed using this `config_parser_` object:

<pre class="brush: cpp">
bool ConfigParser::parse_file(const std::string &#038;filename){
    return py::len(conf_parser_.attr("read")(filename)) == 1;
}

std::string ConfigParser::get(const std::string &#038;attr, const std::string &#038;section){
    return py::extract&lt;std::string>(conf_parser_.attr("get")(section, attr));
}

void ConfigParser::set(const std::string &#038;attr, const std::string &#038;value, const std::string &#038;section){
    conf_parser_.attr("set")(section, attr, value);
}
</pre>

In this simple example, for the sake of brevity exceptions are allowed to propagate. In a more complex environment, you will almost certainly want to have the C++ class handle and repackage the Python exceptions as C++ exceptions. This way you could later create a pure C++ class if performance or some other concern became an issue. 

To use the class, calling code can simply treat it as a normal C++ class:

<pre class="brush: cpp">
int main(){
    Py_Initialize();
    try{
        ConfigParser parser;
        parser.parse_file("conf_file.1.conf");
        cout << "Directory (file 1): " << parser.get("Directory", "DEFAULT") << endl;
        parser.parse_file("conf_file.2.conf");
        cout << "Directory (file 2): " << parser.get("Directory", "DEFAULT") << endl;
        cout << "Username: " << parser.get("Username", "Auth") << endl;
        cout << "Password: " << parser.get("Password", "Auth") << endl;
        parser.set("Directory", "values can be arbitrary strings", "DEFAULT");
        cout << "Directory (force set by application): " << parser.get("Directory") << endl;
        // Will raise a NoOption exception 
        // cout << "Proxy host: " << parser.get("ProxyHost", "Network") << endl;
    }catch(boost::python::error_already_set const &#038;){
        string perror_str = parse_python_exception();
        cout << "Error during configuration parsing: " << perror_str << endl;
    }
}
</pre>

And that's that: a key-value configuration parser with sections and comments in under 50 lines of code. This is just the tip of the iceberg too. In almost the same length of code, you can do all sorts of things that would be at best painful and at worse error prone and time consuming in C++: configuration parsing, list and set operations, web connectivity, file format operations (think XML/JSON), and myriad other tasks are already implemented in the Python standard library.

In [Part 4](/blog/post/embedding-python-in-c-applications-with-boostpython-part-4), I'll take a look at how to more robustly and generically call Python code using functors and a Python namespace class.
