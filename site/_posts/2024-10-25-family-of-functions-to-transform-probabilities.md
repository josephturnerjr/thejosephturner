---
layout: post
title: "Family of Functions to Transform Probabilities"
date: 2024-10-25
---

I needed a family of functions `f(x; a)` with a single parameter to
transform probabilities based on a set of heuristics. The family should
include both convex and concave functions. The family should also
satisfy the following constraints:

    f(0; a) = 0
    f(1; a) = 1
    f(x; 1) ≅ x
    f(0; inf) ≅ step function at 0
    f(1; 0) ≅ step function at 1

Practically speaking, `f(x) = x^a` functions well for these constraints,
but I wanted something “symmetric” for a very specific meaning of the
word:

    f(1-f(x)) = 1 - x

In words, the graph should be symmetric around the line `x + y = 1`.

Despite not having any practical need, I spent a couple hours on it,
chatted with a buddy who enjoys such puzzles, and even ended up emailing
an old math professor of mine looking for an answer. My buddy, the
brilliant Chris Poirel, ended up coming through: use a parameterized,
transformed quadrant of the circle:

    f(x; a) = ((1-(1-x)^a)^(1/a)

This is the “upper left” quadrant, moved over, and parameterized by how
much curve it has. Large `a` looks like a box, while small `a` (0 < `a` < 1)
starts to look like a star. And of course 

    f(x; 1) = x 

