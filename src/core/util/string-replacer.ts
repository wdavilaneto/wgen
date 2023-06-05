export class ConfigReplacer {
  prefix: { [key: string]: string };
  suffix: { [key: string]: string };
  type?: { [key: string]: string };
}

const defaultReplacer: ConfigReplacer = {
  prefix: {
    nm: "nome",
    ds: "descricao",
    tp: "tipo",
    dt: "data",
    dpimDk: "",
    orgi: "orgaoId",
  },
  suffix: {
    Policia: "",
    Mirp: "",
    Dk: "",
    Stage: "",
    Proc: "Procedimento",
    id: "_id",
  },
};

export default class StringReplacer {
  constructor(private config: ConfigReplacer = defaultReplacer) {}

  replace(name: string) {
    let result = this.getFirstReplaced(name);
    return this.getLastReplaced(result);
  }

  private getFirstReplaced(name: string) {
    for (const key in this.config.prefix) {
      if (name.startsWith(key)) {
        const result = name.replace(key, this.config.prefix[key]);
        if (result.length > 0) return result;
      }
    }
    return name;
  }
  private getLastReplaced(name: string) {
    for (const key in this.config.suffix) {
      if (name.endsWith(key)) {
        // replace last occurrence of key with value
        const result = name.replace(new RegExp(key + "$"), this.config.suffix[key]);
        if (result.length > 0) return result;
      }
    }
    return name;
  }
}
