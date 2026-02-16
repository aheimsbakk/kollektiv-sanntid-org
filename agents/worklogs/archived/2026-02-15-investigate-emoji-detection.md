Title: Investigate emoji detection returning fallback for all items

Goal: add targeted tests that simulate nested/raw payload shapes so we can verify the detection heuristic and adjust it if necessary.

Plan:
- Add tests that include nested raw structures with tokens in various places (values and keys).
- Run the test suite and inspect results; update detection logic as required.
