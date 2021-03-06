---
layout: post
title:  "HTTPS Certificate Verification in Python With urllib2"
date:   2012-01-08
---



**This post is a duplicate of one on my former site, muchtooscrawled.com. That site is no more, and this is the only post of any real quality, so I thought I would copy it over.**

Everyone loves Python. I particularly feel encased in Python&#8217;s womb-like warmth and comfort when I am trying to do client-side communication with web servers or web services. Most of the magic  has already been accomplished by the time I type `import urllib2` &#8211; super simple and clean interfaces that seem to go increasingly deep as you need them. Request a page with a single line, do a GET or POST request with two lines, modify headers as needed, do secure communication with SSL; all of these things are simple and elegant, adding complexity only when needed for more complex goals.

Recently, I found a hole in this seemingly infinitely deep well of value added by `urllib2`. While the module will happily do SSL-secured communication for you, it fails to provide any easy way to verify server certificates. This is a critical feature, especially when using web services. For instance, if I wanted to use a service to version-check files on my system with files on a central server, allowing me to download the updates as needed, communicating with an unverified server could be disastrous. After poking around a bit online, I still hadn&#8217;t found anything useful in the urllib2 interface to help me accomplish this, so I started opening up the library files themselves. My goal was to use SSL with cert verification while still leveraging `urllib2` for all of my high-level interface needs.

It turns out that it isn&#8217;t very difficult at all, despite the fact that the interfaces are not such that it is as easy as it could be to extend the functionality in this way. The `ssl` module already includes certificate verification, although you must supply your own trusted root certificates. These are easy to find, as it is in the interest of the CAs like Verisign and Thawte to publish these (for instance, your browser already has copies that it uses for certificate verification). The question then is how does one supply the appropriate parameters to the `ssl.wrap_socket(...)` function?

The answer is in this case, by subclassing the `httplib.HTTPSConnection` class to pass in the appropriate data. Here is an example:

<pre>class VerifiedHTTPSConnection(httplib.HTTPSConnection):
    def connect(self):
        # overrides the version in httplib so that we do
        #    certificate verification
        sock = socket.create_connection((self.host, self.port), self.timeout)
        if self._tunnel_host:
            self.sock = sock
            self._tunnel()
        # wrap the socket using verification with the root
        #    certs in trusted_root_certs
        self.sock = ssl.wrap_socket(sock,
                                    self.key_file,
                                    self.cert_file,
                                    cert_reqs=ssl.CERT_REQUIRED,
                                    ca_certs="trusted_root_certs")</pre>

The key is the two extra parameters, `cert_reqs` and `ca_certs`, in the call to `wrap_socket`. For a more complete discussion of the meaning of these parameters, please refer to the documentation.

The next step is integrating our new connection in such a way that allows us to use it with `urllib2`. This is done by installing a non-default HTTPS handler, by first subclassing the `urllib2.HTTPSHandler` class, then installing it as a handler in an `OpenerDirector` object using the `urllib2.build_opener(...)` function. Here is the example subclass:

<pre># wraps https connections with ssl certificate verification
class VerifiedHTTPSHandler(urllib2.HTTPSHandler):
    def __init__(self, connection_class = VerifiedHTTPSConnection):
        self.specialized_conn_class = connection_class
        urllib2.HTTPSHandler.__init__(self)
    def https_open(self, req):
        return self.do_open(self.specialized_conn_class, req)</pre>

As you can see, I have added the connection class as a parameter to the constructor. Because of the way the handler classes are used, it would require substantially more work to be able to pass in the value of the `ca_certs` parameter to `wrap_socket`. Instead, you can just create different subclasses for different root certificate sets. This would be useful if you had a development server with a self-signed certificate and a production server with a CA-signed certificate, as you could swap them out at runtime or delivery time using the parameter to the constructor above.

With this class, you can either create an `OpenerDirector` object, or you can install a handler into `urllib2` itself for use in the `urlopen(...)` function. Here is how to create the opener and use it to open a secure site with certificate verification:

<pre>https_handler = VerifiedHTTPSHandler()
url_opener = urllib2.build_opener(https_handler)
handle = url_opener.open('https://www.example.com')
response = handle.readlines()
handle.close()</pre>

If the certificate for example.com is not signed by one of the trusted authority keys in the file `trusted_root_certs` (from the `VerifiedHTTPSConnection` class), then the call to `url_opener.open(...)` will raise a `urllib2.URLError` exception with some debugging-type information from the `ssl` module. Otherwise, `urllib2` functions just as normal, albeit now communication with a trusted source.
