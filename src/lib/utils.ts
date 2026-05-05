import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import toast from 'react-hot-toast';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const notifyWIP = () => {
  toast('Funcionalidade em desenvolvimento', {
    icon: '🚧',
    style: {
      borderRadius: '10px',
      background: '#333',
      color: '#fff',
    },
  });
};

export function camelToSnake(obj: any): any {
  if (Array.isArray(obj)) return obj.map(camelToSnake);
  if (obj === null || typeof obj !== 'object') return obj;
  return Object.keys(obj).reduce((acc: any, key) => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    acc[snakeKey] = camelToSnake(obj[key]);
    return acc;
  }, {});
}

export function snakeToCamel(obj: any): any {
  if (Array.isArray(obj)) return obj.map(snakeToCamel);
  if (obj === null || typeof obj !== 'object') return obj;
  return Object.keys(obj).reduce((acc: any, key) => {
    const camelKey = key.replace(/([-_][a-z])/g, group => group.toUpperCase().replace('-', '').replace('_', ''));
    acc[camelKey] = snakeToCamel(obj[key]);
    return acc;
  }, {});
}

export function sortStudents(students: any[]) {
  return students.sort((a, b) => {
    const getGroup = (s: any) => {
      if (!s.entryDate) return 1;
      const month = parseInt(s.entryDate.substring(5, 7), 10);
      return isNaN(month) ? 1 : (month <= 3 ? 1 : 2);
    };

    const groupA = getGroup(a);
    const groupB = getGroup(b);

    if (groupA !== groupB) {
      return groupA - groupB;
    }

    if (groupA === 1) {
      return (a.name || '').localeCompare(b.name || '');
    } else {
      if (a.entryDate !== b.entryDate) {
        return (a.entryDate || '').localeCompare(b.entryDate || '');
      }
      return (a.name || '').localeCompare(b.name || '');
    }
  });
}

export const formatYear = (value: any) => {
  if (!value) return '';
  const valStr = String(value);
  if (valStr.includes('-')) return valStr.split('-')[0];
  if (valStr.includes('/')) {
    const parts = valStr.split('/');
    if (parts[0].length === 4) return parts[0];
    if (parts[2].length === 4) return parts[2];
  }
  return valStr;
};
