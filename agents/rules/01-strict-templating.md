# Rule: Strict Documentation and Worklog Templating
Whenever you create or update a worklog, changelog, or documentation file that requires a specific template (like YAML front-matter), you MUST strictly adhere to the following constraints without exception:

1. **YAML Front-Matter Validation:** The file MUST start exactly with `---` and end the metadata section with `---`. All required fields (e.g., date, author, tags) must be present and correctly formatted.
2. **Length Constraints:** If a template specifies a maximum length (e.g., "1 to 3 sentences"), you are strictly forbidden from writing more than the allowed amount. Be concise.
3. **No Deviation:** Never invent new fields, change the casing of keys, or omit required sections.
4. **Self-Correction:** Before saving the file, you must internally review the content against the template rules. If it fails (e.g., missing YAML dashes), correct it before completing the task.

