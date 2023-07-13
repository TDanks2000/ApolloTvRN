import {settings} from '../@types';
import {storage} from './storage/cleint';

export const setSetting = (setting: settings, value: any): void => {
  const settingName = `setting-${setting}`;

  console.log('setting', settingName, 'to', value, 'in storage');

  storage.set(settingName, value);
};

export const getSetting = (setting: settings): string | undefined => {
  const settingName = `setting-${setting}`;
  return storage.getString(settingName);
};
