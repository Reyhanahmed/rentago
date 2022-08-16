export function checkIfEmpty<T>(values: T): { [K in keyof T]: string } | null {
  let emptyFields: any;
  Object.entries(values).forEach(([key, value]) => {
    if (!Boolean(value)) {
      emptyFields = {
        ...emptyFields,
        [key]: "This field is required",
      };
    }
  });

  return !!emptyFields ? emptyFields : null;
}
