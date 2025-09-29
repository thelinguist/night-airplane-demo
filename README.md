# Night Airplane Demo

This is a little widget to demonstrate visible aircraft position lights, based on its orientation to the viewer.

How to use:
1. one person (CFI) will orient the airplane on the screen without the other person (student) seeing how it moves.
2. turn out the lights and minimize the controls
3. the other person will be shown the screen and must determine which direction the airplane is facing.

You can turn on and off ambient lighting and choose or randomize preselected orientations.

# Contributing
Contributions are welcome. This is pretty rudimentary for now. Here's an overview of the tech:

## three.js
this uses webgl to render things in 3d. The browser handles passing this instructions to the graphics card for optimization

## react-three-fiber
React and JSX are very popular for frontend apps, so I'm sticking with that pattern. react-three-fiber is a wrapper around three.js so it's easily usable in react components.

Overall, react usage is very minimal. React-three-fiber formulates three.js into JSX, so that might take some getting used to.

### leva
leva has a react hook to drop in a set of controls and provide them to the react component. The interface is pretty simple (both the API and the UX) so for now I'm using this

## react-drei
drei provides some nice pre-packed components for 3D work, like the camera controls, starfield, environment, and loaders. Usage is currently pretty minimal.