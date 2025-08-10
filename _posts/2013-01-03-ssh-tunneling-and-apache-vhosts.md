---
layout: post
title:  "SSH Tunneling and Apache vhosts"
date:   2013-01-03
---


For better or worse, our web development workflow begins on in-house servers that are the same software stack as our development webservers, particularly for new features that may change the data model. I&#8217;m currently working on a new feature for the new-and-improved[ Granola Enterprise](http://grano.la) that adds interesting and actionable aggregate data at the group and installation level, a perfect feature to work on in our cloistered environment. Each developer maintains their own [Apache name-based virtual host](http://httpd.apache.org/docs/2.2/vhosts/name-based.html) to track their feature branch and any different data they need to track.

Today, I&#8217;m taking a cross-country flight to California to set up a case study of the new [energy footprint generation capabilities](http://grano.la/software/benefits.php#nav-granola-enterprise) of Granola Enterprise. The flight is long (>5 hours) and has the double advantage of both plenty of room (seat next to me is empty) and in-flight Internets, so I figured I&#8217;d get some work done. Getting to the development environment is a piece of cake: we have an Internet-facing ssh server. Setting things up so I can load my vhost in a browser is slightly more complicated, but is ultimately pretty easy using ssh port forwarding.

For a single-host Apache instance, it is really, really easy. Just ssh into your server and forward a local port to port 80 on the internal development machine. If your ssh server is `ssh.example.com`, your username is example, and your internal development machine is `developmentmachine`, you could forward local port 8800 like this:

    ssh -L 8800:developmentmachine:80 example@ssh.example.com

To get to your webpage, then, just go to http://localhost:8800 in your browser. Simple. It can be even simpler if you forward local port 80 instead of a non-privileged port, but in that case you need to run the command as root (or with `sudo`).

With virtual hosts, it&#8217;s only a bit tricker. Name-based virtual hosts work by looking at the hostname in the HTTP headers, so that information must be right to wind up in the right place. The solution is to give your own machine the same name as your target vhost in your `/etc/hosts` file. Using the example above, you&#8217;d add this line:

    127.0.0.1   developmentmachine

Now, instead of going to localhost in your browser, go to the normal name of your development vhost (http://developmentmachine:8800), and tada! you&#8217;re in. Bonus points: if you use port 80 (again as root) all your bookmarks work.

Now to do some real work instead of writing blog posts! :)
