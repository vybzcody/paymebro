import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Play, Star } from "lucide-react";
import { type Template } from "@/lib/api/templates";

interface TemplatesListProps {
  templates: Template[];
  isLoading: boolean;
  onEdit: (template: Template) => void;
  onDelete: (templateId: string) => void;
  onUse: (template: Template) => void;
}

export function TemplatesList({ templates, isLoading, onEdit, onDelete, onUse }: TemplatesListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="flex gap-2">
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <Card key={template.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {template.name}
                  {template.isDefault && (
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  )}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">{template.label}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {template.currency}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {template.amount} {template.currency}
                </p>
                {template.message && (
                  <p className="text-sm text-gray-500 mt-1">{template.message}</p>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => onUse(template)}
                  className="flex-1"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Use
                </Button>
                
                {!template.isDefault && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(template)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete(template.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
