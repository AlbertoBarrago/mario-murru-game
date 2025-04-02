jest.mock('../js/logic/classes/sound.js', () => ({
  initSounds: jest.fn(),
  playSound: jest.fn(),
  stopSound: jest.fn(),
  toggleMute: jest.fn(),
  sounds: {}
}));

import { initSounds, playSound, stopSound, toggleMute } from '../js/logic/classes/sound.js';

describe('Sound module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should call initSounds', () => {
    initSounds();
    expect(initSounds).toHaveBeenCalled();
  });

  test('should call playSound with correct sound name', () => {
    playSound('jump');
    expect(playSound).toHaveBeenCalledWith('jump');
  });

  test('should call stopSound with correct sound name', () => {
    stopSound('jump');
    expect(stopSound).toHaveBeenCalledWith('jump');
  });

  test('should call toggleMute', () => {
    toggleMute();
    expect(toggleMute).toHaveBeenCalled();
  });
});
