// Central registry of all product images by key
import appFront from "@/assets/app-front.jpg";
import appIngredients from "@/assets/app-ingredients.jpg";
import appBack from "@/assets/app-back.jpg";
import appNutrition from "@/assets/app-nutrition.jpg";
import appBenefits from "@/assets/app-benefits.jpg";
import bdpFront from "@/assets/bdp-front.jpg";
import bdpIngredients from "@/assets/bdp-ingredients.jpg";
import bdpBack from "@/assets/bdp-back.jpg";
import bdpNutrition from "@/assets/bdp-nutrition.jpg";
import bdpHowto from "@/assets/bdp-howto.jpg";
import productTurmeric from "@/assets/product-turmeric.jpg";
import productMoringa from "@/assets/product-moringa.jpg";

export const IMAGE_REGISTRY: Record<string, string> = {
  "app-front": appFront,
  "app-ingredients": appIngredients,
  "app-back": appBack,
  "app-nutrition": appNutrition,
  "app-benefits": appBenefits,
  "bdp-front": bdpFront,
  "bdp-ingredients": bdpIngredients,
  "bdp-back": bdpBack,
  "bdp-nutrition": bdpNutrition,
  "bdp-howto": bdpHowto,
  "product-turmeric": productTurmeric,
  "product-moringa": productMoringa,
};

// All available image keys for dropdown selection
export const AVAILABLE_IMAGES = Object.keys(IMAGE_REGISTRY).map(key => ({
  key,
  label: key.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
}));

export const getImageUrl = (key: string): string => {
  if (key?.startsWith("http")) return key;
  return IMAGE_REGISTRY[key] || productTurmeric;
};
