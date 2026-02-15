"use client";

import { useState, useEffect } from "react";
import {
  GripVertical,
  X,
  Plus,
  Settings,
  MoreHorizontal,
  Eye,
  EyeOff,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface Widget {
  id: string;
  type: string;
  title: string;
  size: "small" | "medium" | "large" | "full";
  visible: boolean;
  order: number;
}

interface WidgetGridProps {
  widgets: Widget[];
  onUpdateWidgets: (widgets: Widget[]) => void;
  renderWidget: (widget: Widget) => React.ReactNode;
  availableWidgets: { type: string; title: string; defaultSize: Widget["size"] }[];
}

const sizeClasses: Record<Widget["size"], string> = {
  small: "col-span-1",
  medium: "col-span-1 lg:col-span-2",
  large: "col-span-1 lg:col-span-2 xl:col-span-3",
  full: "col-span-full",
};

export function WidgetGrid({
  widgets,
  onUpdateWidgets,
  renderWidget,
  availableWidgets,
}: WidgetGridProps) {
  const [editMode, setEditMode] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);

  const visibleWidgets = widgets
    .filter((w) => w.visible)
    .sort((a, b) => a.order - b.order);

  const hiddenWidgets = widgets.filter((w) => !w.visible);

  const handleToggleVisibility = (widgetId: string) => {
    const updated = widgets.map((w) =>
      w.id === widgetId ? { ...w, visible: !w.visible } : w
    );
    onUpdateWidgets(updated);
  };

  const handleRemoveWidget = (widgetId: string) => {
    const updated = widgets.map((w) =>
      w.id === widgetId ? { ...w, visible: false } : w
    );
    onUpdateWidgets(updated);
  };

  const handleAddWidget = (type: string) => {
    const config = availableWidgets.find((w) => w.type === type);
    if (!config) return;

    const existing = widgets.find((w) => w.type === type);
    if (existing) {
      // Re-enable existing widget
      const updated = widgets.map((w) =>
        w.type === type ? { ...w, visible: true } : w
      );
      onUpdateWidgets(updated);
    } else {
      // Add new widget
      const newWidget: Widget = {
        id: `widget-${Date.now()}`,
        type: config.type,
        title: config.title,
        size: config.defaultSize,
        visible: true,
        order: Math.max(...widgets.map((w) => w.order), 0) + 1,
      };
      onUpdateWidgets([...widgets, newWidget]);
    }
    setShowAddMenu(false);
  };

  const handleSizeChange = (widgetId: string, size: Widget["size"]) => {
    const updated = widgets.map((w) =>
      w.id === widgetId ? { ...w, size } : w
    );
    onUpdateWidgets(updated);
  };

  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    setDraggedWidget(widgetId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedWidget || draggedWidget === targetId) return;

    const draggedIndex = visibleWidgets.findIndex((w) => w.id === draggedWidget);
    const targetIndex = visibleWidgets.findIndex((w) => w.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Reorder widgets
    const reordered = [...visibleWidgets];
    const [draggedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, draggedItem);

    // Update order property
    const updated = widgets.map((w) => {
      const newIndex = reordered.findIndex((r) => r.id === w.id);
      return newIndex !== -1 ? { ...w, order: newIndex } : w;
    });

    onUpdateWidgets(updated);
  };

  const handleDragEnd = () => {
    setDraggedWidget(null);
  };

  const handleResetLayout = () => {
    const reset = availableWidgets.map((w, i) => ({
      id: `widget-${w.type}`,
      type: w.type,
      title: w.title,
      size: w.defaultSize,
      visible: true,
      order: i,
    }));
    onUpdateWidgets(reset);
    setEditMode(false);
  };

  // Add available widgets that aren't in the list yet
  const addableWidgets = availableWidgets.filter(
    (aw) => !widgets.some((w) => w.type === aw.type && w.visible)
  );

  return (
    <div className="space-y-4">
      {/* Edit Mode Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {editMode && (
            <>
              <div className="relative">
                <button
                  onClick={() => setShowAddMenu(!showAddMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#161616] text-[#0A0A0A] rounded-lg text-xs font-medium hover:bg-[#161616] transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Widget
                </button>
                {showAddMenu && addableWidgets.length > 0 && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowAddMenu(false)}
                    />
                    <div className="absolute left-0 top-full mt-1 w-56 bg-[#0A0A0A] border border-[#262626] rounded-lg shadow-xl z-20 py-1">
                      {addableWidgets.map((w) => (
                        <button
                          key={w.type}
                          onClick={() => handleAddWidget(w.type)}
                          className="w-full text-left px-4 py-2.5 text-xs text-[#FAFAFA] hover:text-[#FAFAFA] hover:bg-[#0A0A0A] transition-colors"
                        >
                          {w.title}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={handleResetLayout}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-[#262626] rounded-lg text-xs text-[#FAFAFA] hover:text-[#FAFAFA] hover:bg-[#0A0A0A] transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </>
          )}
        </div>
        <button
          onClick={() => setEditMode(!editMode)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
            editMode
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "border border-[#262626] text-[#FAFAFA] hover:text-[#FAFAFA] hover:bg-[#0A0A0A]"
          )}
        >
          <Settings className="w-3.5 h-3.5" />
          {editMode ? "Done Editing" : "Customize"}
        </button>
      </div>

      {/* Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {visibleWidgets.map((widget) => (
          <div
            key={widget.id}
            className={cn(
              sizeClasses[widget.size],
              editMode && "relative group",
              draggedWidget === widget.id && "opacity-50"
            )}
            draggable={editMode}
            onDragStart={(e) => handleDragStart(e, widget.id)}
            onDragOver={(e) => handleDragOver(e, widget.id)}
            onDragEnd={handleDragEnd}
          >
            {/* Edit Controls Overlay */}
            {editMode && (
              <div className="absolute inset-0 z-10 pointer-events-none">
                {/* Drag Handle */}
                <div className="absolute top-2 left-2 pointer-events-auto">
                  <button className="p-1.5 rounded bg-[#0A0A0A] border border-[#262626] text-[#FAFAFA] hover:text-[#FAFAFA] cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Control Buttons */}
                <div className="absolute top-2 right-2 flex items-center gap-1 pointer-events-auto">
                  {/* Size Selector */}
                  <select
                    value={widget.size}
                    onChange={(e) =>
                      handleSizeChange(widget.id, e.target.value as Widget["size"])
                    }
                    className="px-2 py-1.5 text-[10px] bg-[#0A0A0A] border border-[#262626] rounded text-[#FAFAFA] focus:outline-none cursor-pointer"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="full">Full</option>
                  </select>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveWidget(widget.id)}
                    className="p-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Edit Mode Border */}
                <div className="absolute inset-0 border-2 border-dashed border-[#262626]/30 rounded-xl" />
              </div>
            )}

            {/* Widget Content */}
            {renderWidget(widget)}
          </div>
        ))}
      </div>

      {/* Hidden Widgets List (shown in edit mode) */}
      {editMode && hiddenWidgets.length > 0 && (
        <div className="mt-6 p-4 bg-[#0A0A0A] border border-[#262626] rounded-xl">
          <p className="text-xs font-medium text-[#FAFAFA] mb-3 flex items-center gap-2">
            <EyeOff className="w-3.5 h-3.5" />
            Hidden Widgets
          </p>
          <div className="flex flex-wrap gap-2">
            {hiddenWidgets.map((widget) => (
              <button
                key={widget.id}
                onClick={() => handleToggleVisibility(widget.id)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#0A0A0A] border border-[#262626] rounded-lg text-xs text-[#FAFAFA] hover:text-[#FAFAFA] hover:border-[#262626]/30 transition-all"
              >
                <Eye className="w-3.5 h-3.5" />
                {widget.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
