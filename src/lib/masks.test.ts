import { describe, expect, it } from "vitest";

import { isValidCPF, maskCEP, maskCPF, maskPhone, onlyDigits } from "./masks";

describe("máscaras", () => {
  it("onlyDigits remove tudo que não é dígito", () => {
    expect(onlyDigits("a1b2.c3")).toBe("123");
  });

  it("maskCPF formata", () => {
    expect(maskCPF("52998224725")).toBe("529.982.247-25");
  });

  it("maskCEP formata", () => {
    expect(maskCEP("68500000")).toBe("68500-000");
  });

  it("maskPhone celular (11 dígitos)", () => {
    expect(maskPhone("94992582190")).toBe("(94) 99258-2190");
  });

  it("maskPhone fixo (10 dígitos)", () => {
    expect(maskPhone("9440000000")).toBe("(94) 4000-0000");
  });
});

describe("isValidCPF", () => {
  it("aceita CPF válido", () => {
    expect(isValidCPF("529.982.247-25")).toBe(true);
  });

  it("rejeita dígitos repetidos", () => {
    expect(isValidCPF("111.111.111-11")).toBe(false);
  });

  it("rejeita CPF incompleto", () => {
    expect(isValidCPF("123")).toBe(false);
  });
});
