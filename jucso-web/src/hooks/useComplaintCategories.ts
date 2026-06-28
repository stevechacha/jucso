import { useEffect, useState } from "react";
import { isApiEnabled } from "@/api/client";
import { jucsoApi } from "@/api/jucsoApi";
import { CAT_TO_MINISTRY } from "@/constants/mock-data";

export function useComplaintCategories() {
  const [categories, setCategories] = useState<Record<string, string>>(CAT_TO_MINISTRY);

  useEffect(() => {
    if (!isApiEnabled) return;
    void jucsoApi
      .getComplaintCategories()
      .then((items) => {
        if (items.length === 0) return;
        setCategories(Object.fromEntries(items.map((item) => [item.category, item.ministry])));
      })
      .catch(console.error);
  }, []);

  return categories;
}
