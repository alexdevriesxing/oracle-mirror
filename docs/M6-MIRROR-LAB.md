# M6 Mirror Lab — Pendulum, Aura, Oracle Duel

This pass adds three fully client-side Oracle Mirror experiences after Council of Mystics.

## Pendulum Oracle

- Accepts a short yes/no-style question.
- The question never leaves the browser.
- Six symbolic outcomes are possible: Yes, Leaning Yes, Uncertain, Leaning No, No, and Ask Again Later.
- Every outcome contains reflective wording rather than factual certainty.
- The visual swing respects reduced-motion settings.
- Share cards contain only the outcome label; the private question is excluded.

## Aura Reading

- A five-question personality-style quiz.
- Six possible profiles: Violet, Blue, Green, Golden, Rose, and Indigo.
- The feature explicitly does not use a camera, scanner, biometric input, or fake aura-detection claim.
- Results include three traits, a short interpretation, and a related Oracle Mirror realm.
- Share cards contain only the resulting aura and traits; quiz answers are excluded.

## Oracle Duel

- Accepts a private question and classifies it locally into love, work, choice, change, or general.
- No network request is made.
- Two distinct mystics are selected from Madame Fortuna, Seraphina, Morpheus, Rosalind, Pythius, and Sage Lao-Tan.
- Each mystic receives an authored perspective appropriate to the locally detected theme.
- The user chooses which perspective resonates more.
- The share card includes only the two mystic names and the chosen winner. The question and both interpretations are excluded.

## Cost and privacy

All three Mirror Lab experiences use zero Workers AI requests and zero application API calls. Questions, quiz answers, and interpretation text are not attached to telemetry. Telemetry records only coarse feature/result identifiers and continuation realm.

## Accessibility

- Native buttons, inputs, links, and textarea controls.
- Polite live result regions.
- Explicit labels.
- Keyboard focus styling.
- Responsive layouts.
- Reduced-motion handling for pendulum animation and progress effects.

## Acceptance gate

The pass is complete when:

1. Pendulum, Aura, and Duel mount on the homepage after Council.
2. No Mirror Lab code calls `fetch()` or an `/api/*` endpoint.
3. Pendulum and Duel questions never enter share payloads or telemetry.
4. Aura answers never enter share payloads.
5. Oracle Duel always selects two distinct known mystics.
6. Aura always resolves to one known profile.
7. All three share-card types are accepted by the sanitizer.
8. Dependency audit, typecheck, full tests, and production build are green.
