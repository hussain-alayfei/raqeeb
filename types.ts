export interface CardItem {
  id: string;
  title: string;
  description: string;
  image: string;
  tags?: string[];
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  text: string;
}

export interface LogoItem {
  id: string;
  name: string;
  url: string;
}
