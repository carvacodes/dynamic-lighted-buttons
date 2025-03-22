# Proof of Concept: Dynamic Lighted Buttons

[View the project on carvacodes.github.io](https://carvacodes.github.io/?project=dynamic-lighted-buttons).

In this proof of concept, the mouse cursor acts as a light source, causing the page background and several buttons on the page to illuminate and case shadows.

The page background effect is a simple radial gradient with a large radius (1400px), centered on the mouse cursor.

The `fancy-button` class on the page buttons enables lighting effects for them. Similar to the page background, a radial gradient on each button simulates a light source emanating from the cursor. However, the gradient is significantly smaller, and its center is constrained to the button boundaries (the `left`, `right`, `top`, and `bottom` of the button's `BoundingClientRect`). The gradient also appears more diffuse when the mouse is off of and/or farther away from the button.

The shadows cast by the interaction of the buttons and cursor "light source" are more diffuse when the mouse cursor is far from the button, and less diffuse when the cursor is closer to the button. The shadows also appear to move opposite the light source and grow slightly with more distance from the mouse cursor, as one would expect.

The behavior is triggered by the `mousemove` event, during which the position and diffusion of the gradients and shadows are calculated on a per-element basis.

This version improves on the calculations for `shadowXOffset`, `shadowYOffset`, `shadowDispersion`, and `shadowDepth`. It also reformats the setting of `proxy.style.boxShadow` to use all five possible `boxShadow` parameters, using the `shadowDispersion` value for both the blur radius and the spread radius of the shadow (to good effect).