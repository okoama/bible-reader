import pkg from '../../package.json' assert { type: 'json' };

export const APP_VERSION = pkg.version ?? '0.0.0';
export const BACKUP_VERSION = 1;
