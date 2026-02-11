"use client";

import { CategoryNode, getHadbitItems } from "@/services/hadbititems_service";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  userId: string;
  onTemplateSelect?: (template: any) => void;
  onItemSelect?: (item: any) => void;
}
const TemplateDetailItemSelect = ({
  userId,
  onTemplateSelect,
  onItemSelect,
}: Props) => {
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getHadbitItems(userId);
        setCategories(data);
      } catch (e) {
        console.error("Failed to fetch items", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  const handleValueChange = (value: string) => {
    const itemId = parseInt(value);
    for (const category of categories) {
      const item = category.items.find((i) => i.id === itemId);
      if (item && item.item_style) {
        if (onItemSelect) {
          onItemSelect(item);
        }
        try {
          const parsed =
            typeof item.item_style === "string"
              ? JSON.parse(item.item_style)
              : item.item_style;
          if (onTemplateSelect) {
            onTemplateSelect(parsed);
          }
        } catch (e) {
          console.error("Failed to parse item_style", e);
        }
        return;
      }
    }
  };

  return (
    <Select onValueChange={handleValueChange}>
      <SelectTrigger className="w-full md:w-[300px]">
        <SelectValue placeholder="項目を選択してください" />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectGroup key={category.id}>
            <SelectLabel className="font-bold text-xs text-muted-foreground">
              {category.name}
            </SelectLabel>
            {category.items.map((item) => (
              <SelectItem key={item.id} value={String(item.id)}>
                {category.name}-{item.name}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
};

export default TemplateDetailItemSelect;
