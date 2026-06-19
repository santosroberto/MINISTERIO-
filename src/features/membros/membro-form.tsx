"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { membroSchema, type MembroSchemaType } from "@/lib/schemas"
import { memberService } from "@/services/member-service"
import { Membro } from "@/types"
import { storageService } from "@/lib/supabase/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { ImageUpload } from "@/components/image-upload"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { ESTADO_CIVIL_OPTIONS, MINISTERIOS, CARGOS } from "@/constants"

const ministerioOptions = MINISTERIOS.map((m) => ({ value: m, label: m }))
const cargoOptions = CARGOS.map((c) => ({ value: c, label: c }))

interface MembroFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  membro?: Membro | null
  onSuccess: () => void
}

export function MembroForm({ open, onOpenChange, membro, onSuccess }: MembroFormProps) {
  const [loading, setLoading] = useState(false)
  const [fotoUrl, setFotoUrl] = useState<string | undefined>(membro?.foto)
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const isEditing = !!membro

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MembroSchemaType>({
    resolver: zodResolver(membroSchema),
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      dataNascimento: "",
      endereco: "",
      estadoCivil: "",
      cargo: "",
      ministerio: "",
      dataBatismo: "",
      observacoes: "",
    },
  })

  useEffect(() => {
    setFotoUrl(membro?.foto)
    setFotoFile(null)
    if (membro) {
      reset({
        nome: membro.nome,
        email: membro.email,
        telefone: membro.telefone,
        dataNascimento: membro.dataNascimento,
        endereco: membro.endereco,
        estadoCivil: membro.estadoCivil,
        cargo: membro.cargo,
        ministerio: membro.ministerio,
        dataBatismo: membro.dataBatismo,
        observacoes: membro.observacoes,
      })
    } else {
      reset({
        nome: "",
        email: "",
        telefone: "",
        dataNascimento: "",
        endereco: "",
        estadoCivil: "",
        cargo: "",
        ministerio: "",
        dataBatismo: "",
        observacoes: "",
      })
    }
  }, [membro, reset, open])

  const onSubmit = async (data: MembroSchemaType) => {
    setLoading(true)
    try {
      let foto = fotoUrl

      if (fotoFile) {
        const result = await storageService.uploadFoto(membro?.id || "new", fotoFile)
        foto = result.url
      }

      const payload = { ...data, foto }

      if (isEditing && membro) {
        await memberService.update(membro.id, payload)
        toast.success("Membro atualizado com sucesso!")
      } else {
        await memberService.create(payload)
        toast.success("Membro cadastrado com sucesso!")
      }
      onSuccess()
      onOpenChange(false)
    } catch {
      toast.error("Erro ao salvar membro. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Membro" : "Novo Membro"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do membro abaixo."
              : "Preencha os dados para cadastrar um novo membro."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-2">
            <ImageUpload
              currentImage={fotoUrl}
              onUpload={async (file) => {
                setFotoFile(file)
                return URL.createObjectURL(file)
              }}
              onRemove={async () => {
                if (membro?.foto) {
                  await storageService.deleteFotoByUrl(membro.foto)
                }
                setFotoUrl(undefined)
                setFotoFile(null)
              }}
              disabled={loading}
              className="mb-2"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo</Label>
                <Input id="nome" {...register("nome")} placeholder="Nome completo" />
                {errors.nome && (
                  <p className="text-xs text-destructive">{errors.nome.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" {...register("email")} placeholder="email@exemplo.com" />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input id="telefone" {...register("telefone")} placeholder="(11) 99999-0000" />
                {errors.telefone && (
                  <p className="text-xs text-destructive">{errors.telefone.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataNascimento">Data de nascimento</Label>
                <Input id="dataNascimento" type="date" {...register("dataNascimento")} />
                {errors.dataNascimento && (
                  <p className="text-xs text-destructive">{errors.dataNascimento.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input id="endereco" {...register("endereco")} placeholder="Rua, número, bairro" />
              {errors.endereco && (
                <p className="text-xs text-destructive">{errors.endereco.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estadoCivil">Estado civil</Label>
                 <Select id="estadoCivil" options={ESTADO_CIVIL_OPTIONS} placeholder="Selecione..." {...register("estadoCivil")} />
                {errors.estadoCivil && (
                  <p className="text-xs text-destructive">{errors.estadoCivil.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ministerio">Ministério</Label>
                <Select id="ministerio" options={ministerioOptions} placeholder="Selecione..." {...register("ministerio")} />
                {errors.ministerio && (
                  <p className="text-xs text-destructive">{errors.ministerio.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Select id="cargo" options={cargoOptions} placeholder="Selecione..." {...register("cargo")} />
                {errors.cargo && (
                  <p className="text-xs text-destructive">{errors.cargo.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataBatismo">Data de batismo</Label>
                <Input id="dataBatismo" type="date" {...register("dataBatismo")} />
                {errors.dataBatismo && (
                  <p className="text-xs text-destructive">{errors.dataBatismo.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <textarea
                id="observacoes"
                {...register("observacoes")}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Observações adicionais..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditing ? "Salvar alterações" : "Cadastrar membro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
