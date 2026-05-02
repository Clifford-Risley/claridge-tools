import { EditToolView } from "./edit-tool-view"

type Props = { params: Promise<{ id: string }> }

export default async function EditToolPage({ params }: Props) {
  const { id } = await params
  return <EditToolView toolId={Number(id)} />
}
