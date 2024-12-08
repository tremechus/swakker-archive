# swakker-archive

## Historical Context
Back in 2011 there was a startup called Swakker.  The platform let people create messages that would render as a plane with smoke trails (or some other vehicle depending on the season).  The user would write the message with their finger/mouse, pick the background image and music then send the message.  

Originally this was only supported on mobile devices.

I was subcontracted to write an html version of so that recipients could see the message whether or not they had the app installed, or were on a desktop.  

This project is the result of that effort.  The company is long gone, so I suspect they won't mind if I post the source for educational purposes.

## Running
Download the repository and open one of the .html files in the /src folder.

## Notes
The code didn't run when originally resuscitated, some of the images and script references are pointing to the original platform resources which no longer exist.  I have modified some of the original code to bypass or inject local resources

Architecturally, the html pages in src have the raw coordinates and orientation of the vehicle as part of the code.  This was for development purposes.  In practice the html page would render from a template and inject the custom message coordinates into the page.

## Exercise
This is 2011 technology and didn't scale well with long messages (when you look at the implementation you'll see why).  

Challenge: use modern coding frameworks and practices to make a better solution, see what you can come up with using the same coordinate data!

## Sample
![Plane](./img/plane.gif)