# The ps kata

This is an exercise or kata maybe, based on ideas about software
development from the
["GOOS" book](http://www.growing-object-oriented-software.com/) and in
this case to practise using various web technologies.

<img src="http://www.growing-object-oriented-software.com/cover.jpg" />

Here's the exercise: if you've ever run ```htop``` or ```ps wufax```
on a linux or unix-like system, you will have seen a process tree
along with various information about each process in that tree.  This
is a nice way to view your processes because you can see which
processes have been forked by others.

The challenge is to create an htop-like display of processes for a
target system and display them as they dynamically change in a
browser.  We need to include things like pid, command line, cpu,
memory usage, cpu time etc.  Imagine for instance, if this were a
monitoring tool that required installing an agent on the target system
to collect such information, and maybe a server that receives and
collates it and then serves it to a user, updating it in real time.
In other words, 3 components are involved: browser, server, agent(s).

This kata could be accused of focusing on too many things.  Indeed one
of the problems with modern js development is the rich diversity of
tools and constant disruption brought about by innovation.  We will
not only have to focus on the process of software development (a TDD
approach in this case), but also grapple with technology and tooling
choices. (I will be looking at: react, redux, es6, node js, express.)

Some of the main ideas from the GOOS book include:

* building a [walking skeleton](http://alistair.cockburn.us/Walking+skeleton); a basic
  system that does the most basic thing (eg a ping of some sort) that exercises
  most of the components in what we think the system architecture should be; we can change
  this as we go
* establishing a "build deploy test" pipeline for the walking skeleton
  * we deploy to a production-like environment
  * we then run end-to-end (acceptance) tests in that environment
  * if the tests pass, then the build can be released into production (a step we can't cover here)
* acceptance tests must be written from the point of view of the "user" of the system;
  we should avoid letting any implementation or developer-centric details leak into
  these tests
* each development iteration starts by writing a failing acceptance or end-to-end test
  taking advantage of our walking skeleton; we are looking for the next most obvious product increment;
  it should be small
* then we go in as developers writing several "unit" tests using
  red-green-refactor, and writing the necessary code to make the
  acceptance test eventually pass;
* we use acceptance tests to drive the direction of development as well as to really
  test that the whole system works
* our unit tests should be feature-centric; we want these tests to demonstrate
  the behaviour of or show the intent of our objects (classes)
* ch2 of the book discusses object oriented principles; the central
  principle is that oop design is all about the communication between
  objects rather than individual object behaviour; this leads to the
  "tell don't ask" principle, minimising object querying to prevent
  leaking of information across the system (a form of coupling) and,
  as a result, the importance of mocking when testing this
  communication

We could probably say that this approach is a form of BDD and
outside-in development.
Thinking about the design (what you want to see) both at the acceptance test level
and at the level of the "unit" as distinct from implementing it (subsequently), is
a powerful idea but one that needs practice.

