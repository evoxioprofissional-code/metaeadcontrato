import { describe, expect, it } from "vitest";

import { mergeContract } from "./contract";

describe("mergeContract", () => {
  it("substitui tokens conhecidos", () => {
    expect(mergeContract("Olá {{aluno_nome}}!", { aluno_nome: "Maria" })).toBe("Olá Maria!");
  });

  it("token sem valor vira campo em branco", () => {
    expect(mergeContract("Valor: {{valor}}", {})).toContain("contract-blank");
  });

  it("escapa HTML do valor (evita injeção)", () => {
    expect(mergeContract("{{x}}", { x: "<b>oi</b>" })).toBe("&lt;b&gt;oi&lt;/b&gt;");
  });
});
