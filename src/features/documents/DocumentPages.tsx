import * as React from "react";
import { FileArchive, FileSpreadsheet, FileText, FileImage, FolderOpen, Search, Upload } from "lucide-react";
import { PERMISSIONS, QUERY_KEYS } from "@/constants/app";
import { useDocuments } from "@/hooks/queries";
import { useDocumentTitle } from "@/hooks/core";
import type { ListParams } from "@/types";
import { Button, Card, CardContent, Dialog, Input } from "@/components/ui/primitives";
import { EntityCell, PageContainer, StatusBadge } from "@/components/common/feedback";
import { ResourcePage } from "@/components/common/crud";
import { toast } from "@/stores/toast.store";
import { formatDate, formatFileSize } from "@/utils/format";
import { getFileKind } from "@/utils/helpers";

type Row = Record<string, unknown>;

function FileIcon({ type }: { type: string }) {
  const kind = getFileKind(`file.${type}`);
  const cls = "h-5 w-5";
  if (kind === "spreadsheet") return <FileSpreadsheet className={`${cls} text-emerald-600`} />;
  if (kind === "image") return <FileImage className={`${cls} text-violet-600`} />;
  if (kind === "archive") return <FileArchive className={`${cls} text-amber-600`} />;
  return <FileText className={`${cls} text-sky-600`} />;
}

export function DocumentsPage() {
  useDocumentTitle("Documents");
  const [folder, setFolder] = React.useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [preview, setPreview] = React.useState<Row | null>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const folders = ["Contracts", "Invoices", "HR", "Projects", "Legal", "Marketing"];
  const counts = useDocuments({ page: 1, pageSize: 100 });

  const listHook = React.useCallback((p: ListParams) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useDocuments({ ...p, filters: { ...(p.filters ?? {}), ...(folder ? { folder } : {}) } }) as never;
  }, [folder]);

  return (
    <PageContainer>
      <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
        {/* Folders */}
        <Card className="h-fit">
          <CardContent className="space-y-1 pt-4">
            <p className="px-2 pb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Folders</p>
            <button onClick={() => setFolder(null)} className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] font-medium ${folder === null ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>
              <FolderOpen className="h-4 w-4" /> All documents
              <span className="ml-auto text-xs text-muted-foreground">{counts.data?.total ?? 0}</span>
            </button>
            {folders.map((f) => {
              const n = ((counts.data?.data ?? []) as Row[]).filter((d) => d.folder === f).length;
              return (
                <button key={f} onClick={() => setFolder(folder === f ? null : f)} className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] font-medium ${folder === f ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>
                  <FolderOpen className="h-4 w-4" /> {f}
                  <span className="ml-auto text-xs text-muted-foreground">{n}</span>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <div>
          <ResourcePage<Row>
            title={folder ?? "Documents"}
            description="Central repository with versions, tags and permissions."
            breadcrumbs={[{ label: "Documents" }]}
            listHook={listHook}
            columns={() => [
              { key: "name", header: "Name", sortable: true, accessor: (r) => <span className="flex items-center gap-2.5"><FileIcon type={String(r.type)} /><EntityCell name={String(r.name)} sub={`v${r.version} · ${r.category}`} /></span> },
              { key: "folder", header: "Folder" },
              { key: "size", header: "Size", align: "right", accessor: (r) => formatFileSize(Number(r.size)) },
              { key: "owner", header: "Owner" },
              { key: "updatedAt", header: "Modified", sortable: true, accessor: (r) => formatDate(String(r.updatedAt)) },
              { key: "tags", header: "Tags", accessor: () => <StatusBadge status="review" /> },
            ]}
            exportFilename="documents"
            searchPlaceholder="Search documents…"
            createPermission={PERMISSIONS.DOCUMENTS_CREATE}
            updatePermission={PERMISSIONS.DOCUMENTS_UPDATE}
            deletePermission={PERMISSIONS.DOCUMENTS_DELETE}
            onRowClick={(r) => setPreview(r)}
            extraActions={<Button size="sm" onClick={() => setUploadOpen(true)}><Upload className="h-4 w-4" /> Upload</Button>}
            invalidateKeys={[QUERY_KEYS.documents]}
          />
        </div>
      </div>

      {/* Upload dialog */}
      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload documents" description="PDF, Office, images and archives up to 10MB.">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); toast("Upload complete", { message: `${e.dataTransfer.files.length || 2} file(s) uploaded to ${folder ?? "All documents"}.` }); setUploadOpen(false); }}
          className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-10 text-center ${dragOver ? "border-primary bg-primary/5" : "border-border"}`}
          role="button"
          tabIndex={0}
          aria-label="Drop files to upload"
          onClick={() => { toast("Upload complete", { message: "2 file(s) uploaded successfully." }); setUploadOpen(false); }}
          onKeyDown={(e) => { if (e.key === "Enter") { toast("Upload complete", { message: "2 file(s) uploaded." }); setUploadOpen(false); } }}
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-semibold">Drag & drop files here, or click to browse</p>
          <p className="text-xs text-muted-foreground">Files are virus-scanned and versioned automatically</p>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Add tags (comma separated)…" aria-label="Tags" />
        </div>
      </Dialog>

      {/* Preview drawer */}
      <Dialog open={preview !== null} onClose={() => setPreview(null)} title={preview ? String(preview.name) : ""} description={preview ? `${preview.folder} · v${preview.version} · ${formatFileSize(Number(preview?.size ?? 0))}` : ""} width="max-w-xl">
        {preview && (
          <div className="space-y-4">
            <div className="flex h-48 items-center justify-center rounded-xl bg-muted/60">
              <FileIcon type={String(preview.type)} />
              <span className="ml-2 text-sm text-muted-foreground">Preview not available in demo — use download.</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[["Owner", String(preview.owner)], ["Category", String(preview.category)], ["Modified", formatDate(String(preview.updatedAt))], ["Version", `v${preview.version}`]].map(([k, v]) => (
                <div key={k} className="rounded-lg bg-muted/40 p-2.5"><p className="text-[11px] text-muted-foreground">{k}</p><p className="font-semibold">{v}</p></div>
              ))}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Version history</p>
              <ul className="mt-2 space-y-1.5">
                {Array.from({ length: Math.min(3, Number(preview.version)) }).map((_, i) => (
                  <li key={i} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-[13px]">
                    <span>v{Number(preview.version) - i} · {i === 0 ? "Current" : "Archived"}</span>
                    <Button variant="ghost" size="xs" onClick={() => toast("Version restored", { message: `v${Number(preview.version) - i} restored.`, variant: "info" })}>Restore</Button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => toast("Link copied", { message: "Share link copied to clipboard.", variant: "info" })}>Share</Button>
              <Button onClick={() => toast("Download started", { message: String(preview.name) })}>Download</Button>
            </div>
          </div>
        )}
      </Dialog>
    </PageContainer>
  );
}
