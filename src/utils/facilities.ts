export interface FacilityCategory {
  id: string;
  name: string;
  facilities: Facility[];
}

export interface Facility {
  id: string;
  name: string;
}

export const facilityCategories: FacilityCategory[] = [
  {
    id: 'heating-cooling',
    name: 'Heating / Cooling',
    facilities: [
      { id: 'air-conditioning', name: 'Air conditioning' },
      { id: 'central-heating', name: 'Central heating' },
      { id: 'boiler', name: 'Boiler' },
      { id: 'wood-burning-stove', name: 'Wood-burning stove' },
      { id: 'underfloor-heating', name: 'Underfloor heating' },
      { id: 'fan', name: 'Fan' }
    ]
  },
  {
    id: 'linen',
    name: 'Linen',
    facilities: [
      { id: 'bed-linen', name: 'Bed linen' },
      { id: 'towels', name: 'Towels' },
      { id: 'kitchen-linen', name: 'Kitchen linen' },
      { id: 'linen-baby-cot', name: 'Linen for baby cot' },
      { id: 'beach-towels', name: 'Beach towels' }
    ]
  },
  {
    id: 'internet-media-audio',
    name: 'Internet, Media & Audio',
    facilities: [
      { id: 'wifi', name: 'Wi-Fi' },
      { id: 'wired-internet', name: 'Wired internet connection' },
      { id: 'usb-port', name: 'USB port' },
      { id: 'television', name: 'Television' },
      { id: 'cable-tv', name: 'Cable TV' },
      { id: 'smart-tv', name: 'Smart TV' },
      { id: 'streaming-services', name: 'Streaming services (Netflix / Disney+)' },
      { id: 'radio', name: 'Radio' },
      { id: 'bluetooth-speaker', name: 'Bluetooth speaker' }
    ]
  },
  {
    id: 'kitchen-cooking',
    name: 'Kitchen / Cooking',
    facilities: [
      { id: 'refrigerator', name: 'Refrigerator (with freezer)' },
      { id: 'oven-microwave', name: 'Oven / combination microwave' },
      { id: 'microwave', name: 'Microwave' },
      { id: 'electric-kettle', name: 'Electric kettle' },
      { id: 'dishwasher', name: 'Dishwasher' },
      { id: 'fully-equipped-kitchen', name: 'Fully equipped kitchen' },
      { id: 'high-chair', name: 'High chair' },
      { id: 'coffee-maker', name: 'Coffee maker' }
    ]
  },
  {
    id: 'sanitary-facilities',
    name: 'Sanitary Facilities',
    facilities: [
      { id: 'bathtub', name: 'Bathtub' },
      { id: 'washing-machine', name: 'Washing machine' },
      { id: 'dryer', name: 'Dryer' },
      { id: 'hairdryer', name: 'Hairdryer' },
      { id: 'toilets', name: 'Toilets' },
      { id: 'shower', name: 'Shower' }
    ]
  },
  {
    id: 'child-friendly',
    name: 'Child-Friendly Amenities',
    facilities: [
      { id: 'baby-cot', name: 'Baby cot / travel cot' },
      { id: 'stair-gate', name: 'Stair gate' },
      { id: 'toys', name: 'Toys' },
      { id: 'outdoor-play-equipment', name: 'Outdoor play equipment' }
    ]
  },
  {
    id: 'outdoor-facilities',
    name: 'Outdoor Facilities',
    facilities: [
      { id: 'garden', name: 'Garden' },
      { id: 'shared-garden', name: 'Shared garden' },
      { id: 'fully-fenced-garden', name: 'Fully fenced garden' },
      { id: 'terrace', name: 'Terrace' },
      { id: 'veranda', name: 'Veranda' },
      { id: 'lounge-set', name: 'Lounge set' },
      { id: 'barbecue', name: 'Barbecue' },
      { id: 'outdoor-lighting', name: 'Outdoor lighting' },
      { id: 'private-driveway', name: 'Private driveway' },
      { id: 'garden-chairs', name: 'Garden chairs' },
      { id: 'garden-tables', name: 'Garden tables' },
      { id: 'sun-loungers', name: 'Sun loungers' },
      { id: 'parking-spaces', name: 'Parking spaces' }
    ]
  },
  {
    id: 'accessibility',
    name: 'Accessibility',
    facilities: [
      { id: 'ground-floor', name: 'Ground floor' },
      { id: 'wheelchair-entrance', name: 'Wheelchair-accessible entrance' },
      { id: 'wheelchair-bathroom', name: 'Wheelchair-accessible bathroom' },
      { id: 'extra-wide-doors', name: 'Extra-wide doors' }
    ]
  },
  {
    id: 'wellness',
    name: 'Wellness',
    facilities: [
      { id: 'sauna', name: 'Sauna' },
      { id: 'hot-tub', name: 'Hot tub / jacuzzi' },
      { id: 'indoor-pool', name: 'Indoor pool' },
      { id: 'outdoor-pool', name: 'Outdoor pool' },
      { id: 'massage-shower', name: 'Massage shower' }
    ]
  },
  {
    id: 'beach-leisure',
    name: 'Beach / Leisure',
    facilities: [
      { id: 'parasol', name: 'Parasol' },
      { id: 'cooler-box', name: 'Cooler box' },
      { id: 'beach-toys', name: 'Beach toys' },
      { id: 'beach-chairs', name: 'Beach chairs' },
      { id: 'bicycles', name: 'Bicycles' }
    ]
  },
  {
    id: 'safety',
    name: 'Safety',
    facilities: [
      { id: 'smoke-detector', name: 'Smoke detector' },
      { id: 'carbon-monoxide-detector', name: 'Carbon monoxide detector' },
      { id: 'fire-extinguisher', name: 'Fire extinguisher' },
      { id: 'first-aid-kit', name: 'First aid kit' },
      { id: 'safe', name: 'Safe' }
    ]
  },
  {
    id: 'pets',
    name: 'Pets',
    facilities: [
      { id: 'pets-allowed', name: 'Pets allowed' },
      { id: 'dog-bed-bowl', name: 'Dog bed / food bowl provided' },
      { id: 'fenced-garden-pets', name: 'Fenced garden suitable for pets' }
    ]
  },
  {
    id: 'privacy',
    name: 'Privacy',
    facilities: [
      { id: 'detached-house', name: 'Detached house' },
      { id: 'terraced-house', name: 'Terraced house' },
      { id: 'onsite-manager', name: 'On-site manager' }
    ]
  },
  {
    id: 'games-entertainment',
    name: 'Games & Entertainment',
    facilities: [
      { id: 'board-games', name: '(Board) games' },
      { id: 'game-console', name: 'Game console' },
      { id: 'books-magazines', name: 'Books / magazines' }
    ]
  }
];