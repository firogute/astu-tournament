// components/DataTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit3, Trash2 } from "lucide-react";

const DataTable = ({ data, columns, title, renderActions }: any) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No {title} found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="sm:hidden space-y-2 p-4">
        {data.map((item: any) => (
          <Card key={item.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1 flex-1">
                {columns.slice(0, 2).map((column: any) => (
                  <div key={column.key} className="text-sm">
                    <span className="font-medium text-muted-foreground">
                      {column.label}:
                    </span>{" "}
                    {column.render ? column.render(item) : item[column.key]}
                  </div>
                ))}
              </div>
              <div className="flex gap-1">
                {renderActions ? (
                  renderActions(item)
                ) : (
                  <DefaultActions item={item} />
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Table className="hidden sm:table">
        <TableHeader>
          <TableRow>
            {columns.map((column: any) => (
              <TableHead key={column.key}>{column.label}</TableHead>
            ))}
            <TableHead className="w-20">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item: any) => (
            <TableRow key={item.id}>
              {columns.map((column: any) => (
                <TableCell key={column.key}>
                  {column.render ? column.render(item) : item[column.key]}
                </TableCell>
              ))}
              <TableCell>
                <div className="flex gap-1">
                  {renderActions ? (
                    renderActions(item)
                  ) : (
                    <DefaultActions item={item} />
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const DefaultActions = ({ item }: any) => (
  <>
    <Button variant="ghost" size="sm">
      <Edit3 className="w-4 h-4" />
    </Button>
    <Button variant="ghost" size="sm">
      <Trash2 className="w-4 h-4" />
    </Button>
  </>
);

export default DataTable;
