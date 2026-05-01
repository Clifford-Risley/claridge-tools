import { ToolForm } from "@/components/tool-form"

// Seed tool for visual verification — replaced by API fetch in a follow-up task
const SEED_TOOL = {
  id: "1",
  name: "DeWalt Power Drill",
  description: "18V cordless drill with two batteries and a charger. Includes a full bit set.",
  imageUrl: null as string | null,
}

type Props = { params: Promise<{ id: string }> }

export default async function EditToolPage({ params }: Props) {
  const { id } = await params
  const tool = id === SEED_TOOL.id ? SEED_TOOL : null

  return (
    <ToolForm
      mode="edit"
      initialName={tool?.name ?? ""}
      initialDescription={tool?.description ?? ""}
      initialImageUrl={tool?.imageUrl ?? null}
    />
  )
}
