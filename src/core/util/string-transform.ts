export function capitalize(str: string) {
  const words = str.split(/\s+/);
  for (let i = 0; i < words.length; ++i) {
    const word = words[i];
    words[i] = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }
  return words.join(" ");
}

export function toCamelCase(str: string, isUpperCamelCase = false) {
  str = str.toLowerCase().replace(/[-_\s.]+(.)?/g, (...args) => (args[1] ? args[1].toUpperCase() : ""));
  return (isUpperCamelCase ? str.substr(0, 1).toUpperCase() : str.substr(0, 1).toLowerCase()) + str.substr(1);
}

export function toSnakeCase(str: string, separator = "-") {
  return (
    str
      .split("")
      .map((letter) => {
        if (/[-_\s.]/.test(letter)) {
          return separator;
        }

        if (letter.toUpperCase() === letter) {
          return separator + letter.toLowerCase();
        }

        return letter;
      })
      .join("")
      // Replacing multiple separators with the single separator.
      .replace(new RegExp(separator + "+", "g"), separator)
      // Deleting the separator from the beginning of the string.
      .replace(new RegExp("^" + separator), "")
      // Deleting the separator at the end of the string.
      .replace(new RegExp(separator + "$"), "")
  );
}

export function toPascalCase(input: string) {
  return toCamelCase(input, true);
}
