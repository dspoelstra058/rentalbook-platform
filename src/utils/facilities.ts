import { useLanguage } from '../contexts/LanguageContext';

export interface FacilityCategory {
  id: string;
  name: string;
  facilities: Facility[];
}

export interface Facility {
  id: string;
  name: string;
}

export const getFacilityCategories = (t: (key: string) => string): FacilityCategory[] => [
  {
    id: 'heating-cooling',
    name: t('facilities.heatingCooling'),
    facilities: [
      { id: 'air-conditioning', name: t('facility.airConditioning') },
      { id: 'central-heating', name: t('facility.centralHeating') },
      { id: 'boiler', name: t('facility.boiler') },
      { id: 'wood-burning-stove', name: t('facility.woodBurningStove') },
      { id: 'underfloor-heating', name: t('facility.underfloorHeating') },
      { id: 'fan', name: t('facility.fan') }
    ]
  },
  {
    id: 'linen',
    name: t('facilities.linen'),
    facilities: [
      { id: 'bed-linen', name: t('facility.bedLinen') },
      { id: 'towels', name: t('facility.towels') },
      { id: 'kitchen-linen', name: t('facility.kitchenLinen') },
      { id: 'linen-baby-cot', name: t('facility.linenBabyCot') },
      { id: 'beach-towels', name: t('facility.beachTowels') }
    ]
  },
  {
    id: 'internet-media-audio',
    name: t('facilities.internetMediaAudio'),
    facilities: [
      { id: 'wifi', name: t('facility.wifi') },
      { id: 'wired-internet', name: t('facility.wiredInternet') },
      { id: 'usb-port', name: t('facility.usbPort') },
      { id: 'television', name: t('facility.television') },
      { id: 'cable-tv', name: t('facility.cableTV') },
      { id: 'smart-tv', name: t('facility.smartTV') },
      { id: 'streaming-services', name: t('facility.streamingServices') },
      { id: 'radio', name: t('facility.radio') },
      { id: 'bluetooth-speaker', name: t('facility.bluetoothSpeaker') }
    ]
  },
  {
    id: 'kitchen-cooking',
    name: t('facilities.kitchenCooking'),
    facilities: [
      { id: 'refrigerator', name: t('facility.refrigerator') },
      { id: 'oven-microwave', name: t('facility.ovenMicrowave') },
      { id: 'microwave', name: t('facility.microwave') },
      { id: 'electric-kettle', name: t('facility.electricKettle') },
      { id: 'dishwasher', name: t('facility.dishwasher') },
      { id: 'fully-equipped-kitchen', name: t('facility.fullyEquippedKitchen') },
      { id: 'high-chair', name: t('facility.highChair') },
      { id: 'coffee-maker', name: t('facility.coffeeMaker') }
    ]
  },
  {
    id: 'sanitary-facilities',
    name: t('facilities.sanitaryFacilities'),
    facilities: [
      { id: 'bathtub', name: t('facility.bathtub') },
      { id: 'washing-machine', name: t('facility.washingMachine') },
      { id: 'dryer', name: t('facility.dryer') },
      { id: 'hairdryer', name: t('facility.hairdryer') },
      { id: 'toilets', name: t('facility.toilets') },
      { id: 'shower', name: t('facility.shower') }
    ]
  },
  {
    id: 'child-friendly',
    name: t('facilities.childFriendly'),
    facilities: [
      { id: 'baby-cot', name: t('facility.babyCot') },
      { id: 'stair-gate', name: t('facility.stairGate') },
      { id: 'toys', name: t('facility.toys') },
      { id: 'outdoor-play-equipment', name: t('facility.outdoorPlayEquipment') }
    ]
  },
  {
    id: 'outdoor-facilities',
    name: t('facilities.outdoorFacilities'),
    facilities: [
      { id: 'garden', name: t('facility.garden') },
      { id: 'shared-garden', name: t('facility.sharedGarden') },
      { id: 'fully-fenced-garden', name: t('facility.fullyFencedGarden') },
      { id: 'terrace', name: t('facility.terrace') },
      { id: 'veranda', name: t('facility.veranda') },
      { id: 'lounge-set', name: t('facility.loungeSet') },
      { id: 'barbecue', name: t('facility.barbecue') },
      { id: 'outdoor-lighting', name: t('facility.outdoorLighting') },
      { id: 'private-driveway', name: t('facility.privateDriveway') },
      { id: 'garden-chairs', name: t('facility.gardenChairs') },
      { id: 'garden-tables', name: t('facility.gardenTables') },
      { id: 'sun-loungers', name: t('facility.sunLoungers') },
      { id: 'parking-spaces', name: t('facility.parkingSpaces') }
    ]
  },
  {
    id: 'accessibility',
    name: t('facilities.accessibility'),
    facilities: [
      { id: 'ground-floor', name: t('facility.groundFloor') },
      { id: 'wheelchair-entrance', name: t('facility.wheelchairEntrance') },
      { id: 'wheelchair-bathroom', name: t('facility.wheelchairBathroom') },
      { id: 'extra-wide-doors', name: t('facility.extraWideDoors') }
    ]
  },
  {
    id: 'wellness',
    name: t('facilities.wellness'),
    facilities: [
      { id: 'sauna', name: t('facility.sauna') },
      { id: 'hot-tub', name: t('facility.hotTub') },
      { id: 'indoor-pool', name: t('facility.indoorPool') },
      { id: 'outdoor-pool', name: t('facility.outdoorPool') },
      { id: 'massage-shower', name: t('facility.massageShower') }
    ]
  },
  {
    id: 'beach-leisure',
    name: t('facilities.beachLeisure'),
    facilities: [
      { id: 'parasol', name: t('facility.parasol') },
      { id: 'cooler-box', name: t('facility.coolerBox') },
      { id: 'beach-toys', name: t('facility.beachToys') },
      { id: 'beach-chairs', name: t('facility.beachChairs') },
      { id: 'bicycles', name: t('facility.bicycles') }
    ]
  },
  {
    id: 'safety',
    name: t('facilities.safety'),
    facilities: [
      { id: 'smoke-detector', name: t('facility.smokeDetector') },
      { id: 'carbon-monoxide-detector', name: t('facility.carbonMonoxideDetector') },
      { id: 'fire-extinguisher', name: t('facility.fireExtinguisher') },
      { id: 'first-aid-kit', name: t('facility.firstAidKit') },
      { id: 'safe', name: t('facility.safe') }
    ]
  },
  {
    id: 'pets',
    name: t('facilities.pets'),
    facilities: [
      { id: 'pets-allowed', name: t('facility.petsAllowed') },
      { id: 'dog-bed-bowl', name: t('facility.dogBedBowl') },
      { id: 'fenced-garden-pets', name: t('facility.fencedGardenPets') }
    ]
  },
  {
    id: 'privacy',
    name: t('facilities.privacy'),
    facilities: [
      { id: 'detached-house', name: t('facility.detachedHouse') },
      { id: 'terraced-house', name: t('facility.terracedHouse') },
      { id: 'onsite-manager', name: t('facility.onsiteManager') }
    ]
  },
  {
    id: 'games-entertainment',
    name: t('facilities.gamesEntertainment'),
    facilities: [
      { id: 'board-games', name: t('facility.boardGames') },
      { id: 'game-console', name: t('facility.gameConsole') },
      { id: 'books-magazines', name: t('facility.booksMagazines') }
    ]
  }
];