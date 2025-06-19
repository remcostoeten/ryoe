import { FolderSidebar } from "@/modules/sidebar/components/folder-sidebar-refactored";


export default function Page() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-start p-24">
            <FolderSidebar searchFilter="" />
        </main>
    )
}
