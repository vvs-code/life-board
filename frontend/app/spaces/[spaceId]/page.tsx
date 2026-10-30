/** Раздел: задачи с фильтрами и сортировкой по приоритету и сроку (FR-14). */
export default async function SpacePage({params}: {params: Promise<{spaceId: string}>}) {
    const {spaceId} = await params;
    return <main>Раздел {spaceId}</main>;
}
