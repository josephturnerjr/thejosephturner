---
layout: post
title: "Concatenate a Lot of Files"
date: 2018-08-27
---

Today I found myself needing to concatenate many files to make one long
file. I originally started with a simple solution:

    cat /my/path/*.data

This worked fine, until there were more files than `cat` could handle (on
my system, this was somewhere around 150k files):

    /tmp/tests$ for i in `seq 150000`; do echo $i > $i; done           
    /tmp/tests$ cat *                                                  
    -bash: /bin/cat: Argument list too long

Next, I tried a simple loop:

    # Elided: code to check for big_file.data and create/clear it if it
    #   is missing
    for file in `ls /my/path | egrep '.data$'`; do
        cat /my/path/$file >> big_file.data;
    done                

This works, but is slow, much slower than the first solution. No need to
despair: a bit of research uncovered a neat feature for the `find`
command:

    -exec command {} +
           This variant of the -exec action runs the specified command on the selected  files,
           but  the command line is built by appending each selected file name at the end; the
           total number of invocations of the command will be much less  than  the  number  of
           matched  files.   The  command line is built in much the same way that xargs builds
           its command lines.  Only one instance of `{}' is allowed within the  command.   The
           command is executed in the starting directory.

In other words, it'll batch the results for you and pass them to the
command. In our example, we wind up with this:

    find /my/path -maxdepth 1 -type f -name '*.data' -exec cat {} + > big_file.data

This will batch together files into reasonable chunks and call the
command (cat in this case) with the chunks!
