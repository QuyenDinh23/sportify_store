import { useState } from 'react';
import { ChevronUp, ChevronDown, Search, Plus, Edit, Trash2, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';

export function DataTable({
  style,
  title,
  data,
  columns,
  onAdd,
  onEdit,
  onDelete,
  onView,
  onToggleStatus,
  searchPlaceholder = "Tìm kiếm...",
  searchTerm,
  onSearch,
  headerActions
}) {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  return (
    <Card style={style}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>{title}</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => onSearch(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            {headerActions ? (
              headerActions
            ) : (
              onAdd && (
                <Button onClick={onAdd} variant="sport">
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm mới
                </Button>
              )
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key}>
                    {column.sortable ? (
                      <Button
                        variant="ghost"
                        onClick={() => handleSort(column.key)}
                        className="h-auto p-0 font-medium"
                      >
                        {column.label}
                        {sortColumn === column.key && (
                          sortDirection === 'asc' ?
                            <ChevronUp className="ml-2 h-4 w-4" /> :
                            <ChevronDown className="ml-2 h-4 w-4" />
                        )}
                      </Button>
                    ) : (
                      column.label
                    )}
                  </TableHead>
                ))}
                {(onEdit || onDelete || onView || onToggleStatus) && (
                  <TableHead>Thao tác</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="text-center py-8">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, index) => (
                  <TableRow key={item._id || item.id || `row-${index}`}>
                    {columns.map((column) => (
                      <TableCell key={`${item._id || item.id || index}-${column.key}`}>
                        {column.render ?
                          column.render(item[column.key], item) :
                          item[column.key]?.toString()
                        }
                      </TableCell>
                    ))}
                    {(onEdit || onDelete || onView || onToggleStatus) && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {onView && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onView(item)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {onEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {onToggleStatus && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onToggleStatus(item)}
                              title={item.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                            >
                              {item.status === 'active' ? (
                                <ToggleRight className="h-6 w-6 text-green-600" />
                              ) : (
                                <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                              )}
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDelete(item)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
