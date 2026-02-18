import {
  Table as ShadcnTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMediaQuery, MOBILE_BREAKPOINT } from "../hooks/useMediaQuery.js";

function TableDesktop({ columns, rows, actions, loading }) {
  return (
    <div className="table-desktop-wrapper relative w-full overflow-x-auto rounded-xl border border-border/50">
      <ShadcnTable>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={
                  col.align === "right"
                    ? "text-right"
                    : col.align === "center"
                      ? "text-center"
                      : ""
                }
              >
                {col.label}
              </TableHead>
            ))}
            {actions && (
              <TableHead className="w-[140px] text-right">Ações</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && (
            <TableRow>
              <TableCell
                colSpan={columns.length + (actions ? 1 : 0)}
                className="h-32"
              >
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Carregando...
                </div>
              </TableCell>
            </TableRow>
          )}
          {!loading && rows.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={columns.length + (actions ? 1 : 0)}
                className="h-32 py-8 text-center"
              >
                <p className="text-muted-foreground text-sm">
                  Nenhum registro encontrado.
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  Use a busca ou cadastre um novo item.
                </p>
              </TableCell>
            </TableRow>
          )}
          {!loading &&
            rows.map((row) => (
              <TableRow key={row.id}>
                {columns.map((col) => (
                  <TableCell key={col.key}>{row[col.key]}</TableCell>
                ))}
                {actions && (
                  <TableCell className="text-right">
                    {actions(row)}
                  </TableCell>
                )}
              </TableRow>
            ))}
        </TableBody>
      </ShadcnTable>
    </div>
  );
}

function TableCards({ columns, rows, actions, loading }) {
  if (loading) {
    return (
      <div className="table-cards" role="status" aria-label="Carregando">
        <div className="table-card table-card--loading">
          <div className="flex items-center justify-center gap-2 text-muted-foreground py-12">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>Carregando...</span>
          </div>
        </div>
      </div>
    );
  }
  if (rows.length === 0) {
    return (
      <div className="table-cards">
        <div className="table-card table-card--empty">
          <p className="text-muted-foreground text-sm">
            Nenhum registro encontrado.
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            Use a busca ou cadastre um novo item.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="table-cards" role="list">
      {rows.map((row) => (
        <article
          key={row.id}
          className="table-card"
          role="listitem"
        >
          <div className="table-card-fields">
            {columns.map((col) => (
              <div key={col.key} className="table-card-field">
                <span className="table-card-label">{col.label}</span>
                <span className="table-card-value">{row[col.key]}</span>
              </div>
            ))}
          </div>
          {actions && (
            <div className="table-card-actions">
              {actions(row)}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

export default function Table({ columns, rows, actions, loading }) {
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT);

  if (isMobile) {
    return (
      <TableCards
        columns={columns}
        rows={rows}
        actions={actions}
        loading={loading}
      />
    );
  }

  return (
    <TableDesktop
      columns={columns}
      rows={rows}
      actions={actions}
      loading={loading}
    />
  );
}
