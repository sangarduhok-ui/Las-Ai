import type { MathComponent } from "docx";
import {
  Math as DocxMath,
  MathCurlyBrackets,
  MathFraction,
  MathIntegral,
  MathRadical,
  MathRoundBrackets,
  MathRun,
  MathSquareBrackets,
  MathSubScript,
  MathSubSuperScript,
  MathSum,
  MathSuperScript,
} from "docx";

const LATEX_SYMBOLS: Record<string, string> = {
  alpha: "α",
  beta: "β",
  gamma: "γ",
  delta: "δ",
  epsilon: "ε",
  varepsilon: "ε",
  zeta: "ζ",
  eta: "η",
  theta: "θ",
  iota: "ι",
  kappa: "κ",
  lambda: "λ",
  mu: "μ",
  nu: "ν",
  xi: "ξ",
  pi: "π",
  rho: "ρ",
  sigma: "σ",
  tau: "τ",
  upsilon: "υ",
  phi: "φ",
  varphi: "φ",
  chi: "χ",
  psi: "ψ",
  omega: "ω",
  Gamma: "Γ",
  Delta: "Δ",
  Theta: "Θ",
  Lambda: "Λ",
  Xi: "Ξ",
  Pi: "Π",
  Sigma: "Σ",
  Phi: "Φ",
  Psi: "Ψ",
  Omega: "Ω",
  times: "×",
  div: "÷",
  cdot: "·",
  pm: "±",
  mp: "∓",
  leq: "≤",
  le: "≤",
  geq: "≥",
  ge: "≥",
  neq: "≠",
  ne: "≠",
  approx: "≈",
  equiv: "≡",
  sim: "∼",
  propto: "∝",
  infty: "∞",
  partial: "∂",
  nabla: "∇",
  forall: "∀",
  exists: "∃",
  in: "∈",
  notin: "∉",
  subset: "⊂",
  subseteq: "⊆",
  supset: "⊃",
  supseteq: "⊇",
  cup: "∪",
  cap: "∩",
  emptyset: "∅",
  to: "→",
  rightarrow: "→",
  leftarrow: "←",
  leftrightarrow: "↔",
  Rightarrow: "⇒",
  Leftarrow: "⇐",
  Leftrightarrow: "⇔",
  circ: "°",
  degree: "°",
  angle: "∠",
  perp: "⊥",
  parallel: "∥",
  therefore: "∴",
  because: "∵",
  ldots: "…",
  cdots: "⋯",
  quad: "  ",
  qquad: "    ",
};

const TEXT_FUNCTIONS = new Set([
  "sin",
  "cos",
  "tan",
  "cot",
  "sec",
  "csc",
  "arcsin",
  "arccos",
  "arctan",
  "sinh",
  "cosh",
  "tanh",
  "log",
  "ln",
  "exp",
  "lim",
  "max",
  "min",
  "sup",
  "inf",
  "det",
  "gcd",
  "mod",
]);

class LatexParser {
  private pos = 0;

  constructor(private readonly src: string) {}

  parseAll(): MathComponent[] {
    return this.parseUntil(null);
  }

  private skipSpaces() {
    while (this.pos < this.src.length && /\s/.test(this.src[this.pos])) {
      this.pos++;
    }
  }

  private readGroup(): MathComponent[] {
    this.skipSpaces();
    if (this.pos >= this.src.length) return [];
    if (this.src[this.pos] === "{") {
      this.pos++; // consume '{'
      const inner = this.parseUntil("}");
      if (this.src[this.pos] === "}") this.pos++;
      return inner;
    }
    const atom = this.parseAtom();
    return atom ? [atom] : [];
  }

  private readOptionalBracket(): MathComponent[] | undefined {
    this.skipSpaces();
    if (this.src[this.pos] !== "[") return undefined;
    this.pos++; // consume '['
    const inner = this.parseUntil("]");
    if (this.src[this.pos] === "]") this.pos++;
    return inner;
  }

  private parseUntil(stopChar: string | null): MathComponent[] {
    const nodes: MathComponent[] = [];
    while (this.pos < this.src.length) {
      this.skipSpaces();
      if (this.pos >= this.src.length) break;
      const ch = this.src[this.pos];
      if (stopChar && ch === stopChar) break;
      if (stopChar === null && ch === "}") {
        this.pos++;
        continue;
      }

      // Check for \right delimiter closing \left
      if (stopChar === "\\right" && this.src.startsWith("\\right", this.pos)) {
        break;
      }

      let baseNodes: MathComponent[];
      if (ch === "{") {
        baseNodes = this.readGroup();
      } else {
        const atom = this.parseAtom();
        if (!atom) continue;
        baseNodes = [atom];
      }

      // Handle postfix ^ and _ (in either order)
      let sub: MathComponent[] | undefined;
      let sup: MathComponent[] | undefined;

      for (let k = 0; k < 2; k++) {
        this.skipSpaces();
        if (this.src[this.pos] === "^" && !sup) {
          this.pos++;
          sup = this.readGroup();
        } else if (this.src[this.pos] === "_" && !sub) {
          this.pos++;
          sub = this.readGroup();
        } else {
          break;
        }
      }

      if (sub && sup) {
        nodes.push(
          new MathSubSuperScript({
            children: baseNodes,
            subScript: sub,
            superScript: sup,
          }),
        );
      } else if (sup) {
        nodes.push(
          new MathSuperScript({
            children: baseNodes,
            superScript: sup,
          }),
        );
      } else if (sub) {
        nodes.push(
          new MathSubScript({
            children: baseNodes,
            subScript: sub,
          }),
        );
      } else {
        nodes.push(...baseNodes);
      }
    }
    return nodes;
  }

  private parseAtom(): MathComponent | null {
    this.skipSpaces();
    if (this.pos >= this.src.length) return null;
    const ch = this.src[this.pos];

    // Parentheses ( ... )
    if (ch === "(") {
      this.pos++;
      const inner = this.parseUntil(")");
      if (this.src[this.pos] === ")") this.pos++;
      return new MathRoundBrackets({ children: inner });
    }

    // Square brackets [ ... ]
    if (ch === "[") {
      this.pos++;
      const inner = this.parseUntil("]");
      if (this.src[this.pos] === "]") this.pos++;
      return new MathSquareBrackets({ children: inner });
    }

    // LaTeX command \...
    if (ch === "\\") {
      return this.parseCommand();
    }

    // Plain number/identifier/operator run
    if (/[0-9]/.test(ch)) {
      let num = "";
      while (this.pos < this.src.length && /[0-9.]/.test(this.src[this.pos])) {
        num += this.src[this.pos++];
      }
      return new MathRun(num);
    }

    // Single variable or operator (+, -, =, <, >, etc.)
    this.pos++;
    return new MathRun(ch);
  }

  private parseCommand(): MathComponent | null {
    this.pos++; // consume '\'
    if (this.pos >= this.src.length) return null;

    // Escaped single non-letter character like \{, \}, \%, \,
    if (!/[a-zA-Z]/.test(this.src[this.pos])) {
      const sym = this.src[this.pos++];
      if (sym === "," || sym === ";" || sym === ":") return new MathRun(" ");
      if (sym === "!") return null;
      return new MathRun(sym);
    }

    let cmd = "";
    while (this.pos < this.src.length && /[a-zA-Z]/.test(this.src[this.pos])) {
      cmd += this.src[this.pos++];
    }

    if (cmd === "frac" || cmd === "dfrac" || cmd === "tfrac") {
      const numerator = this.readGroup();
      const denominator = this.readGroup();
      return new MathFraction({ numerator, denominator });
    }

    if (cmd === "sqrt") {
      const degree = this.readOptionalBracket();
      const children = this.readGroup();
      return new MathRadical(degree ? { children, degree } : { children });
    }

    if (cmd === "sum" || cmd === "int") {
      let sub: MathComponent[] | undefined;
      let sup: MathComponent[] | undefined;
      for (let k = 0; k < 2; k++) {
        this.skipSpaces();
        if (this.src[this.pos] === "_" && !sub) {
          this.pos++;
          sub = this.readGroup();
        } else if (this.src[this.pos] === "^" && !sup) {
          this.pos++;
          sup = this.readGroup();
        }
      }
      const body = this.parseUntil(null);
      return cmd === "sum"
        ? new MathSum({ children: body, subScript: sub, superScript: sup })
        : new MathIntegral({ children: body, subScript: sub, superScript: sup });
    }

    if (cmd === "left") {
      this.skipSpaces();
      const delim = this.src[this.pos] || "(";
      if (delim === "\\") {
        // e.g. \left\{ or \left|
        this.pos++;
      }
      const openChar = this.src[this.pos++] || "(";
      const inner = this.parseUntil("\\right");
      if (this.src.startsWith("\\right", this.pos)) {
        this.pos += "\\right".length;
        this.skipSpaces();
        if (this.src[this.pos] === "\\") this.pos++;
        if (this.pos < this.src.length) this.pos++;
      }
      if (openChar === "[") return new MathSquareBrackets({ children: inner });
      if (openChar === "{") return new MathCurlyBrackets({ children: inner });
      return new MathRoundBrackets({ children: inner });
    }

    if (cmd === "text" || cmd === "mathrm" || cmd === "mathbf") {
      this.skipSpaces();
      if (this.src[this.pos] === "{") {
        this.pos++;
        let txt = "";
        let depth = 1;
        while (this.pos < this.src.length && depth > 0) {
          const c = this.src[this.pos++];
          if (c === "{") depth++;
          else if (c === "}") depth--;
          if (depth > 0) txt += c;
        }
        return new MathRun(txt);
      }
    }

    if (TEXT_FUNCTIONS.has(cmd)) {
      return new MathRun(cmd);
    }

    if (LATEX_SYMBOLS[cmd]) {
      return new MathRun(LATEX_SYMBOLS[cmd]);
    }

    return new MathRun(cmd);
  }
}

export function latexLineToDocxMath(latexLine: string): DocxMath {
  const cleaned = latexLine.replace(/^\$+|\$+$/g, "").trim();
  const parser = new LatexParser(cleaned);
  const children = parser.parseAll();
  return new DocxMath({
    children: children.length > 0 ? children : [new MathRun(cleaned)],
  });
}
