# Environment-map reflections prototype (moonless_golf)

Poly Haven's [moonless_golf](https://polyhaven.com/a/moonless_golf) HDRI is used as a **reflection map** on the airplane. It is **never** the visible background: `scene.background` is untouched and the `<Stars>` backdrop is the same as on `main`.

## How to try it

- Leva → **Reflections (prototype)** → tick _Reflections_. The folder also has controls for approach, source, intensity, rotation, and paint/glass/metal roughness and metalness.
- Or open the page with URL params: `?envmap=<approach>&envIntensity=<n>&envRotation=<rad>&envSource=<hdr1k|jpg2k>`. `?envmap` with no value enables the default (`specular`, intensity 1).

When the toggle is off, nothing is mounted. The env-map code is a lazy chunk that isn't downloaded, no texture is fetched, and the GLB materials stay as they are. The only visible change is a collapsed leva folder.

## Approaches compared

| `?envmap=` | What it does                                                                                                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `global`   | drei `<Environment map background={false} environmentIntensity>` sets `scene.environment` (the baseline the card asked for)                                                                     |
| `material` | `envMap` on each airplane material only, GLB material params unchanged                                                                                                                          |
| `tuned`    | `material` plus clearcoat paint (MeshPhysicalMaterial, `clearcoatRoughness` 0.08), glossy glass (roughness 0.05), and metallic prop/spinner/hubs (metalness 0.7, roughness 0.25)                |
| `specular` | `tuned` with the **diffuse IBL term stripped** from the shader (`onBeforeCompile` removes `getIBLIrradiance`), so the map only adds specular reflections and clearcoat glints, never fill light |

Surface classes come from the GLB mesh names (`src/reflections/materials.ts`).

## Screenshots

These were taken in headless Chromium on SwiftShader, at 960×540, cropped to the centre half. The harness is `capture.mjs` and the grids come from `grid.sh`. Stars are randomized on each load, so star positions differ between tiles.

- `screenshots/grid-oncoming.jpg`: Oncoming
- `screenshots/grid-outgoing-right-to-left.jpg`: Outgoing Right to Left
- `screenshots/grid-oncoming-left-to-right.jpg`: Oncoming Left to Right
- `screenshots/grid-lights-on.jpg`: Oncoming Left to Right, Lights On
- `screenshots/grid-rotation-source.jpg`: rotation 0 vs π, HDR vs JPG

## Findings

- **`global` is still a give-away**, even at 0.25. The diffuse term lights the whole airframe, so the red livery, tail and wing struts all read clearly and the heading is obvious. This is the same problem PR #1 found with `?skyIbl`.
- **`material`/`tuned` at 0.5** are almost as bright as `global`. Without the diffuse strip, the GLB's rough paint mostly picks up diffuse IBL.
- **`specular` is the only variant that reads as reflections**: a cool sheen along the wing top and leading edge, glints on the windshield and spinner, and the livery colour stays dark. Even so, at 0.25 the **silhouette becomes legible**, especially the wing planform and the tail fin from the side presets. A sharp student could read heading from shape and not only from the position lights. That's inherent to any reflection: a lit edge outlines the plane.
- **Rotation matters.** At `envRotation` ≈ π the warm clubhouse lamps land on the fuselage side as an amber smear. At rotation 0 the reflection is cool and neutral. No discrete lamp highlight showed up that could be mistaken for a nav light at these intensities.
- **Lights On** makes the reflections nearly invisible, because direct lighting dominates. No reason to change anything for that mode.
- **Bloom (threshold 0.03)**: the sheen is above the threshold, so in principle it blooms. At these intensities it reads as a soft highlight, not a halo, and I couldn't separate any bloom contribution at this screenshot resolution. The nav-light sprites look unchanged. Check on a real GPU and display before deciding.
- **HDR 1k vs JPG 2k**: they look nearly the same at these intensities. The JPG is a bit dimmer.

## Recommendation

- **Best look:** `?envmap=specular&envIntensity=0.25`, HDR 1k, rotation 0, with the default roughness values.
- **Worth keeping?** Not as a default. The point of the demo is that only the position lights tell you the heading. Every reflection variant tested reveals some of the airframe's outline, and the global/IBL variants reveal the livery. It's a pleasant realism touch, so it could stay as an opt-in "realistic" toggle (it costs nothing when off). It should never be on during the quiz. Untested: intensities below 0.25 (e.g. 0.1), where the outline might drop below what you'd notice on a real display.
- **If dropped:** delete `src/reflections/`, `src/components/Reflections.tsx`, `public/envmap/` and the two small hooks in `Airplane.tsx` and `ThreeDModel.tsx`.

## Asset and load impact

| Item                                                      | Size                                | Loaded when off? |
| --------------------------------------------------------- | ----------------------------------- | ---------------- |
| `public/envmap/moonless_golf/moonless_golf_1k.hdr`        | 1.67 MB (≈ 35 % of the 4.68 MB GLB) | no               |
| `public/envmap/moonless_golf/moonless_golf_2k_ev-0.5.jpg` | 0.25 MB                             | no               |
| `Reflections` lazy chunk                                  | 55 kB (19.8 kB gzip)                | no               |
| Main bundle                                               | 1,442.88 kB, unchanged              | —                |

PMREM generation of the 1k map is a one-off cost when the toggle is first enabled. With `frameloop="demand"` there is no per-frame cost when the camera is idle. The 2k/4k HDRs weren't added: blurred reflections on a ~70-unit-away plane gain nothing from them.

Asset licence: Poly Haven, CC0.
