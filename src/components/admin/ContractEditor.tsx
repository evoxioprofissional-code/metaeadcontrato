import { useEffect, useRef } from "react";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Pilcrow,
  Table,
  Underline,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FIELDS: { token: string; label: string }[] = [
  { token: "aluno_nome", label: "Nome do aluno" },
  { token: "cpf", label: "CPF" },
  { token: "rg", label: "RG" },
  { token: "data_nascimento", label: "Nascimento" },
  { token: "naturalidade", label: "Naturalidade" },
  { token: "estado_civil", label: "Estado civil" },
  { token: "endereco_rua", label: "Endereço (rua)" },
  { token: "endereco_bairro", label: "Bairro" },
  { token: "endereco_cidade", label: "Cidade/UF" },
  { token: "telefone", label: "Telefone" },
  { token: "pai", label: "Pai" },
  { token: "mae", label: "Mãe" },
  { token: "email", label: "E-mail" },
  { token: "curso", label: "Curso" },
  { token: "valor_matricula", label: "Valor matrícula" },
  { token: "num_mensalidades", label: "Nº mensalidades" },
  { token: "valor_mensalidade", label: "Valor mensalidade" },
  { token: "apos_vencimento", label: "Após vencimento" },
  { token: "camisa", label: "Camisa" },
  { token: "recebedor", label: "Recebedor" },
  { token: "duracao", label: "Duração" },
  { token: "data", label: "Data" },
];

const TABLE_HTML =
  '<table border="1" style="border-collapse:collapse;width:100%"><tbody>' +
  "<tr><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td></tr>" +
  "</tbody></table><p><br/></p>";

interface ContractEditorProps {
  initialHtml: string;
  onChange: (html: string) => void;
}

export function ContractEditor({ initialHtml, onChange }: ContractEditorProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = initialHtml;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function exec(cmd: string, value?: string) {
    ref.current?.focus();
    document.execCommand(cmd, false, value);
    emit();
  }

  function emit() {
    if (ref.current) onChange(ref.current.innerHTML);
  }

  function insertField(token: string) {
    ref.current?.focus();
    document.execCommand("insertText", false, `{{${token}}}`);
    emit();
  }

  const Btn = ({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      {children}
    </button>
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border/60 bg-muted/30 p-1.5">
        <Btn title="Negrito" onClick={() => exec("bold")}><Bold className="size-4" /></Btn>
        <Btn title="Itálico" onClick={() => exec("italic")}><Italic className="size-4" /></Btn>
        <Btn title="Sublinhado" onClick={() => exec("underline")}><Underline className="size-4" /></Btn>
        <span className="mx-1 h-5 w-px bg-border" />
        <Btn title="Título" onClick={() => exec("formatBlock", "<h2>")}><Heading2 className="size-4" /></Btn>
        <Btn title="Subtítulo" onClick={() => exec("formatBlock", "<h3>")}><Heading3 className="size-4" /></Btn>
        <Btn title="Parágrafo" onClick={() => exec("formatBlock", "<p>")}><Pilcrow className="size-4" /></Btn>
        <span className="mx-1 h-5 w-px bg-border" />
        <Btn title="Lista" onClick={() => exec("insertUnorderedList")}><List className="size-4" /></Btn>
        <Btn title="Lista numerada" onClick={() => exec("insertOrderedList")}><ListOrdered className="size-4" /></Btn>
        <Btn title="Tabela" onClick={() => exec("insertHTML", TABLE_HTML)}><Table className="size-4" /></Btn>
        <span className="mx-1 h-5 w-px bg-border" />
        <div className="w-40">
          <Select onValueChange={insertField} value="">
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Inserir campo" />
            </SelectTrigger>
            <SelectContent>
              {FIELDS.map((f) => (
                <SelectItem key={f.token} value={f.token}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Área editável */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        className="prose prose-sm max-w-none p-5 focus:outline-none dark:prose-invert min-h-[40vh]"
      />
    </div>
  );
}
