---
layout: post
title:  "Recipe: Detect Console Session in Windows"
date:   2012-01-10
---

Working on an upcoming version of [my company&#8217;s software Granola](http://grano.la/) today, I came upon the need to determine whether the program was running in the so-called &#8220;[console session](http://msdn.microsoft.com/en-us/library/aa383496(VS.85).aspx)&#8221; &#8211; the session in which the user is physically sitting at the terminal. The context of my interest was Windows XP power management, but I can think of other reasons, like changing the user interface based on the physical location and logon status of the user.

As with many things Windows, the solution is quite simple but the documentation quite sparse. Googling eventually brought me to the [`WTSGetActiveConsoleSessionId`](http://msdn.microsoft.com/en-us/library/aa383835(VS.85).aspx) and [`ProcessIdToSessionId`](http://msdn.microsoft.com/en-us/library/aa382990(VS.85).aspx) functions. The former retrieves the session ID for the console session, and the latter queries the session ID for a given process. Pass in the current process ID and compare the values to perform the required test:

<pre>bool check_console(){
    DWORD sid;
    ProcessIdToSessionId(GetCurrentProcessId(), &amp;sid);
    if(sid == WTSGetActiveConsoleSessionId()){
        return true;
    }
    return false;
}</pre>

For more fine-grained control, you can register to receive session change messages with the [`WTSRegisterSessionNotification`](http://msdn.microsoft.com/en-us/library/aa383841(VS.85).aspx) function. Given a window handle, the following code will register for all session change notifications:

<pre>if(WTSRegisterSessionNotification(handle, NOTIFY_FOR_ALL_SESSIONS) != TRUE){
    // handle error (GetLastError)
}</pre>

Change `NOTIFY_FOR_ALL_SESSIONS` to `NOTIFY_FOR_THIS_SESSION` to only receive session changes for the current console. Once the registration has occurred, session changes will generate [`WM_WTSSESSION_CHANGE`](http://msdn.microsoft.com/en-us/library/aa383828(VS.85).aspx) message; your application can then respond to these messages as needed.
