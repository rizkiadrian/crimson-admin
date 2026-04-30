import type { IPaginationParams } from "@services/general";

/** Banner type: image upload or text placement editor */
export type BannerType = "image" | "text_placement";

/** Banner publication status */
export type BannerStatus = "active" | "inactive";

/** Background type for text placement banners */
export type BackgroundType = "solid" | "gradient";

/** Gradient direction for gradient backgrounds */
export type GradientDirection = "to-right" | "to-bottom" | "to-bottom-right";

/** Font weight options for text elements */
export type FontWeight = "normal" | "bold" | "semibold";

/** A single text element placed on the canvas */
export interface ITextElement {
  id: string;
  content: string;
  position_x: number;
  position_y: number;
  font_size: number;
  font_color: string;
  font_weight: FontWeight;
}

/** Background configuration for text placement banners */
export interface IBackgroundConfig {
  type: BackgroundType;
  colors: string[];
  direction?: GradientDirection;
}

/** CTA button configuration for text placement banners */
export interface ICtaConfig {
  text: string;
  position_x: number;
  position_y: number;
  bg_color: string;
  text_color: string;
  border_radius: number;
  font_size: number;
  padding_x: number;
  padding_y: number;
}

/** Banner entity returned by the API */
export interface IBanner {
  id: string;
  title: string;
  type: BannerType;
  status: BannerStatus;
  display_order: number;
  image_path: string | null;
  image_url: string | null;
  background_config: IBackgroundConfig | null;
  text_elements: ITextElement[] | null;
  cta_config: ICtaConfig | null;
  target_url: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/** Query params for banners list endpoint */
export interface IBannerParams extends IPaginationParams {
  type?: BannerType;
  status?: BannerStatus;
}
