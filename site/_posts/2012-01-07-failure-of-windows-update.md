---
layout: post
title:  "The Failure of Windows Update"
date:   2012-01-07
---


Yesterday, I returned to my computer, left on to gather data over the course of several power management state changes, only to discover that Windows Update had automatically rebooted my machine to complete the installation of some critical, unnamed update. My data collection was truncated and needed to be restarted.

As every time this happens, I was infuriated, but I took a bit of time to think about it a little more carefully. I realized that fundamentally this is a disconnect that has arisen as a result of improved power management. In the simpler times of PCs-instead-of-laptops and poor system support for power management, an automatic update would most likely happen when nothing else was going on. The systems were mostly powered on, and updating in the middle of the night was no big deal. 

Today, though, I (and probably most people) suspend my laptop whenever I am not using it by closing the lid. This forces the machine to update when I am actually using my computer, a time when an update and reboot is rarely convenient. As a result, I often postpone the updates. So when can they happen without the pesky user (me) interrupting them? Only when my computer is on but not actively being used, which is more or less by definition when I have some long-running automatic task going, such as my data collection yesterday.

What is the solution to this? How can Windows update itself without interrupting my tasks and sending me into fits of trichotillomania? The simplest answer is to change the default. Instead of automatically updating and rebooting, automatically update then notify the user that a reboot needs to happen in order to complete the update. The package management functionality in Windows is already plenty capable of this type of deferred installation. Unfortunately, this option is currently not only NOT the default as of Windows 7, but is not an option at all. Instead we much choose between inopportune reboots or user-initiated updating. Windows needs to catch up to a time when power management works and is embraced by many (most?) users.

