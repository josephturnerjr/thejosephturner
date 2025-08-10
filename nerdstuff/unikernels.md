---
layout: page
title: Unikernels
---

# Unikernels

Unikernels are an idea I've found interesting since seeing a talk by
[Mendel Rosenblum](https://en.wikipedia.org/wiki/Mendel_Rosenblum) at
Virginia Tech, in which he talked about the idea of
virtualization-native applications: applications built explicitly to be
deployed on virtualization fabric, without a host OS. That concept has
coalesced into [unikernels](http://unikernel.org/). 

## Approaches
### High-level languages

First, you can take a high-level language and implement its standard
library directly atop the abstractions provided by one or more
hypervisors. The compiler/interpreter then links to these versions,
allowing the application to run directly on top of the hypervisor. One
benefit to this is that an implementer has much more control over what
the implementation looks like, as they do not need to implement POSIX
(or otherwise) compliant APIs. Another benefit is that unmodified
applications *may* run directly without much change. A downside is that
only applications written in that language can benefit.

#### Examples

  * [MirageOS](https://mirage.io/) (OCaml)
  * [HalVM](https://galois.com/project/halvm/) (Haskell)
  * [Erlang on Xen](http://erlangonxen.org/) (Erlang)
  * [GUK](https://blog.xenproject.org/2009/06/02/annoucing-release-of-guk-project-guest-vm-microkernel/)
    (Java - defunct?)
  * [runtime.js](http://runtimejs.org/) (Javascript)

### Library OS
There is some overlap with the Library OS approach and the High-level
language approach, but the basic idea is that OS functions are
implemented as a library that can be linked with the application itself.
Some library approaches, like OSv, can run native Linux compiled
binaries. These seem to be the most flexible and painless.

Unikraft seems to be an approach that straddles the Library OS and Rump
Kernel approaches.

#### Examples

  * [OSv](http://osv.io/) (Linux ELF)
  * [IncludeOS](http://www.includeos.org/) (C++)
  * [Unikraft](https://xenproject.org/linux-foundation/80-developers/207-unikraft.html)

### Rump kernels
Rump kernels represent a modular approach to kernel design. When
building the unikernel, a set of swappable modules are linked to the
application based on its needs. Current approaches require the host to
provide specific services beyond what a hypervisor would normally
require.

#### Examples

  * [Rumprun](http://rumpkernel.org/)

## Companies

  * [Cloudius Systems / Scylla](https://www.scylladb.com/) -
    Implementers of OSv
  * [Galois](https://galois.com/) - Implementers of HalVM
  * [DeferPanic](https://deferpanic.com/) - Commercializing unikernels
    and a platform
  * [IncludeOs](http://www.includeos.com/) has now organized into a
    company and is marketing a solution
