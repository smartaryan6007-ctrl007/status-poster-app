export interface Template {
  id: string;
  name: string;
  category: 'Festival' | 'Birthday' | 'Daily';
  bgUrl: string;
  overlay: string; // CSS gradient overlay for text readability
  accent: string; // hex color for text accent
  photoFrame: {
    shape: 'circle' | 'rounded' | 'rect';
    cx: number; // center x as percentage of canvas width (0-100)
    cy: number; // center y as percentage of canvas height (0-100)
    w: number; // width as percentage of canvas width (0-100)
    h: number; // height as percentage of canvas height (0-100)
    radius: number; // border radius percentage (for rounded/rect)
  };
  title: string; // greeting shown on poster (e.g. "Happy Diwali")
  titlePosition: {
    y: number; // y as percentage of canvas height
  };
  wishPosition: {
    y: number; // y as percentage of canvas height
  };
  namePosition: {
    y: number; // y as percentage of canvas height
  };
}

export interface Wish {
  text: string;
  lang: 'hi' | 'en';
}

export interface PosterState {
  template: Template;
  photo: string | null; // data URL
  name: string;
  wish: string | null;
  watermarkRemoved: boolean;
}
