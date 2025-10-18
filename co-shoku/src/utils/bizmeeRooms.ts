type BizmeeRoomMap = Record<string, string>;

const parseBizmeeRooms = (): BizmeeRoomMap => {
  const raw = process.env.EXPO_PUBLIC_BIZMEE_ROOMS;
  if (!raw) {
    return {};
  }
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed as BizmeeRoomMap;
    }
  } catch (error) {
    console.warn('Failed to parse EXPO_PUBLIC_BIZMEE_ROOMS', error);
  }
  return {};
};

const ROOM_MAP = parseBizmeeRooms();

export const getBizmeeRoomUrl = (childCategory: string | undefined | null): string | undefined => {
  if (!childCategory) {
    return undefined;
  }
  return ROOM_MAP[childCategory];
};

export const hasBizmeeRoomsConfigured = (): boolean => Object.keys(ROOM_MAP).length > 0;

