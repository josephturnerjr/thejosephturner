---
layout: post
title:  "Recipe: Tag Photos With Facebook Graph API"
date:   2013-01-01
---


The [Facebook Graph API](http://developers.facebook.com/docs/api/) presents a powerful, unified view of the myriad resources made available by Facebook. There is only one problem: documentation, particularly for accessing resources from the different SDKs, is lacking. In designing my little Facebook new-profile-creating toy, [PRO!(de)file](http://thejosephturner.com/prodefile), I came across several fuzzy places in the documentation that I had to clear up with Google, some time spent reading the SDK code, and good ol&#8217; trial and error. Of particular difficulty was tagging uploaded photos, which is a core requirement of PRO!(de)file.

## Uploading from the Facebook PHP SDK

There is a published [SDK for PHP](https://github.com/facebook/php-sdk/) made available (or at least linked to!) by Facebook. It is basically a handy wrapper for [libcurl](http://curl.haxx.se/). Browsing through the source for the SDK and the [Graph API documentation for Photos](http://developers.facebook.com/docs/reference/api/photo/), I managed to work out how to upload photos. Naturally, the photos must first be on the server side, since it wouldn&#8217;t do to have PHP magicking them straight off of your hard drive. How to get them there is left as an exercise for the reader. Also left to the reader is how to register your Facebook application and get an application ID (hint: it&#8217;s very easy).

All Facebook transactions, whether client-side or server-side, begin with one of the several methods for application authentication. The documentation on auth is pretty good on the Facebook site, though it is spread out over several unlinked pages. After auth, the user has a cookie containing information about the session and the available permissions requested at auth time. Note that in order to publish anything, including photos, you must request the publish_stream permission when authenticating. Creating the Facebook PHP object and getting the session is then very simple:

<pre>$fb = new Facebook(array(
    'appId' =&gt; 'YOUR_APP_ID',
    'secret' =&gt; 'YOUR_APP_SECRET',
    'cookie' =&gt; true,
    ));
$session = $fb-&gt;getSession();</pre>

With these objects, you have everything you need to upload a photo to Facebook:

<pre>function post_image($fb, $session, $image_path){
    try{
        $image = array(
            'access_token' =&gt; $session['access_token'],
        );
        $fb-&gt;setFileUploadSupport(true);
        $image['image'] = '@'.realpath($image_path);
        $fb-&gt;api('/me/photos', 'POST', $image);
        echo "Success!";
        return true;
    }catch(FacebookApiException $e){
        echo $e;
        return false;
    }
}</pre>

Super easy. And there are all kinds of neat properties you can include in the image array, explained at the [Graph API Photo documentation](http://developers.facebook.com/docs/reference/api/photo/). Of particular interest to me was the &#8220;tags&#8221; property, described as returning &#8220;An array of JSON objects, the x and y coordinates are percentages from the left and top edges of the photo, respectively&#8221; when requested in a GET request. But how does one tag users when posting a photo?

## Tagging a photo with the Graph API

The trick, it turns out, is to include a &#8220;tags&#8221; property as it suggests, with the following format: &#8220;tags&#8221; is an array of associative arrays, each of which contains the fields &#8216;x&#8217; (x-coordinate of the tag as a percentage), &#8216;y&#8217; (y-coordinate of the tag as a percentage), and &#8216;tag_uid&#8217;, a user UID. I never did any testing to see if there was any limit to how many tags, but it definitely works for one at least. Here is the updated `post_image` function from above, now including a tag of the logged-in user in the center of the image:

<pre>function post_image($fb, $session, $image_path){
    try{
        $tag = array(
            'tag_uid' =&gt; $fb-&gt;getUser(),
            'x' =&gt; 0,
            'y' =&gt; 0
        );
        $tags[] = $tag;
        $image = array(
            'access_token' =&gt; $session['access_token'],
            'tags' =&gt; $tags,
        );
        $fb-&gt;setFileUploadSupport(true);
        $image['image'] = '@'.realpath($image_path);
        $fb-&gt;api('/me/photos', 'POST', $image);
        echo "Success!";
        return true;
    }catch(FacebookApiException $e){
        echo $e;
        return false;
    }
}</pre>

As the name implies, the `get_user` method of the Facebook object retrieves the user ID (actually the Graph ID) of the logged-in user.

In conclusion, having just scratched the surface of the possibilities of the Graph API, I am very excited by its breadth and depth. Though lacking in complete documentation, when wrapped up in some of the reasonably well-done SDKs, it is both straightforward and indeed easy to include powerful Facebook functionality in web applications.
