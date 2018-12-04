---
layout: post
title: "Concatenating gzipped files"
date: 2018-09-04
---

I've got a system that is running constantly and producing data.
Periodically this data is swept up and processed in a batch, and the
processing archives off the chunk of raw data it processes, gzipping it
along the way. As a result, after a period of time, there are a number
of gzipped, textual data files sitting around. I was interested in
batching these up into a single, larger file that I could upload to S3
or the like for later reprocessing. I sat down to write a bash script to
take care of this process, but before I got through my first for loop, I
wondered if there could be a better way.

I discovered that the gzip format can contain
multiple compressed chunks, which are concatenated when decompressed!
From [Wikipedia](https://en.wikipedia.org/wiki/Gzip):

    [Gzip's] file format also allows for multiple such streams to be
    concatenated (zipped files are simply decompressed concatenated as if
    they were originally one file)

That means that the *gzipped files themselves* can be concatenated, and
the effect is as if you had concatenated the original files and then
gzipped. Check it out:

    vagrant@vagrant-ubuntu-trusty-64:/tmp$ cat test1 test2 
    My
    name 
    is
    Joseph
    Turner
    and
    I
    love
    pancakes
    vagrant@vagrant-ubuntu-trusty-64:/tmp$ gzip test1
    vagrant@vagrant-ubuntu-trusty-64:/tmp$ gzip test2
    vagrant@vagrant-ubuntu-trusty-64:/tmp$ cat test1.gz test2.gz > test3.gz
    vagrant@vagrant-ubuntu-trusty-64:/tmp$ gunzip test3.gz 
    vagrant@vagrant-ubuntu-trusty-64:/tmp$ cat test3 
    My
    name 
    is
    Joseph
    Turner
    and
    I
    love
    pancakes

One downside is that the original filenames are lost, so decompressing
with the `-N` flag results in a file with the first chunk's filename:

    vagrant@vagrant-ubuntu-trusty-64:/tmp$ cat test1.gz test2.gz > test3.gz
    vagrant@vagrant-ubuntu-trusty-64:/tmp$ gunzip -N test3.gz
    vagrant@vagrant-ubuntu-trusty-64:/tmp$ ls
    test1  test1.gz  test2.gz

For my purpose, which would prefer the concatenated file, this was a small price to pay for avoiding the roundtrip
compression. If you need to preserve original filenames, you can simply
use the `tar` utility to combine the compressed files into a single file.
