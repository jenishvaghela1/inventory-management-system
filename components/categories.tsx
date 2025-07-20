"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Edit2, Trash2, Tag } from "lucide-react";
import { useCategories } from "@/hooks/use-categories";
import { useLanguage } from "@/contexts/language-context";

interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

const predefinedColors = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
  "#F97316", "#06B6D4", "#84CC16", "#EC4899", "#6366F1"
];

export default function Categories() {
  const { categories, createCategory, editCategory, removeCategory } = useCategories();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: predefinedColors[0],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await createCategory(formData);
    if (success) {
      setShowCreateDialog(false);
      setFormData({
        name: "",
        description: "",
        color: predefinedColors[0],
      });
    }
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCategory) return;

    const success = await editCategory(currentCategory.id, formData);
    if (success) {
      setShowEditDialog(false);
      setCurrentCategory(null);
      setFormData({
        name: "",
        description: "",
        color: predefinedColors[0],
      });
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    const success = await removeCategory(categoryToDelete.id);
    if (success) {
      setShowDeleteDialog(false);
      setCategoryToDelete(null);
    }
  };

  const openCreateDialog = () => {
    setFormData({
      name: "",
      description: "",
      color: predefinedColors[0],
    });
    setShowCreateDialog(true);
  };

  const openEditDialog = (category: Category) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      color: category.color,
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteDialog(true);
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderForm = (onSubmit: (e: React.FormEvent) => Promise<void>) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Category Name *</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
          className="input-enhanced"
          placeholder="Electronics, Clothing, etc."
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className="input-enhanced"
          placeholder="Optional description..."
        />
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex gap-2 flex-wrap">
          {predefinedColors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, color }))}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                formData.color === color ? "border-gray-800 scale-110" : "border-gray-300"
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      <DialogFooter>
        <Button type="submit" className="w-full btn-enhanced">
          {currentCategory ? "Update Category" : "Create Category"}
        </Button>
      </DialogFooter>
    </form>
  );

  return (
    <div className="space-y-8">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="animate-in fade-in-down">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold gradient-text flex items-center gap-3">
                <Tag className="h-8 w-8" />
                Categories
              </h1>
              <p className="text-muted-foreground mt-2">
                Organize your products with categories
              </p>
            </div>
            <Button
              onClick={openCreateDialog}
              className="btn-enhanced bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 group"
            >
              <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
              Add Category
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="animate-in fade-in-up animation-delay-100ms">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input-enhanced"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="animate-in fade-in-up animation-delay-200ms">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {filteredCategories.map((category, index) => (
              <Card
                key={category.id}
                className="animate-in fade-in-up hover:shadow-lg transition-all duration-200"
                style={{ animationDelay: `${300 + index * 50}ms` }}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {category.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {category.description}
                    </p>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(category)}
                      className="hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDeleteDialog(category)}
                      className="hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No categories found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Try adjusting your search" : "Get started by creating your first category"}
              </p>
              {!searchTerm && (
                <Button onClick={openCreateDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Category Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[400px] dialog-enhanced">
          <DialogHeader>
            <DialogTitle className="text-2xl gradient-text">
              Create New Category
            </DialogTitle>
          </DialogHeader>
          {renderForm(handleCreateCategory)}
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[400px] dialog-enhanced">
          <DialogHeader>
            <DialogTitle className="text-2xl gradient-text">
              Edit Category
            </DialogTitle>
          </DialogHeader>
          {renderForm(handleEditCategory)}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[400px] dialog-enhanced">
          <DialogHeader>
            <DialogTitle className="text-xl text-destructive">
              Delete Category
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground mb-4">
            Are you sure you want to delete "{categoryToDelete?.name}"? This action cannot be undone.
          </p>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCategory}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
