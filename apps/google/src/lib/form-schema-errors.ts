import * as SchemaIssue from "effect/SchemaIssue"

const schemaIssueFormatter = SchemaIssue.makeFormatterStandardSchemaV1()

export const getFormSchemaErrors = (
  issue: SchemaIssue.Issue
): Record<string, string> => {
  const errors: Record<string, string> = {}

  for (const { path, message } of schemaIssueFormatter(issue).issues) {
    const field = path?.[0]

    if (typeof field === "string" && errors[field] === undefined) {
      errors[field] = message
    }
  }

  return errors
}
