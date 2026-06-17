import { Project } from '@/lib/api';

const industryImages: Record<string, string[]> = {
  fintech: [
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80',
    'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&q=80',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
  ],
  agritech: [
    'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
    'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80',
  ],
  edtech: [
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80',
  ],
  healthtech: [
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
    'https://images.unsplash.com/photo-1631217868264-e5b1bb5c27db?w=800&q=80',
    'https://images.unsplash.com/photo-1586773866498-c46efbc53617?w=800&q=80',
  ],
  saas: [
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80',
  ],
  cleantech: [
    'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80',
    'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&q=80',
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80',
  ],
  ecommerce: [
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80',
    'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80',
  ],
  proptech: [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
  ],
  ai: [
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
    'https://images.unsplash.com/photo-1535378620166-273708dd44a4?w=800&q=80',
  ],
  other: [
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
    'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80',
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80',
  ],
};

export function getProjectImages(project: Pick<Project, 'coverImage' | 'images' | 'industry'>): string[] {
  if (project.images?.length) return project.images;
  if (project.coverImage) return [project.coverImage];
  return industryImages[project.industry] || industryImages.other;
}

// Hero slideshow — an on-theme narrative for investors: workspace → founders →
// real business → growth → deal-making. Slow cross-fade in HeroBackground.
export const heroImages = [
  'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1920&q=80', // modern office
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1920&q=80', // founders / team meeting
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1920&q=80', // real business / on-site
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80', // finance / growth
  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1920&q=80', // strategy / deal-making
];

export const testimonialAvatars = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
];
