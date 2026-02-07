import { describe, it, expect } from 'vitest';
import { toMillimeters, fromMillimeters, formatDimension, parseDimension } from './units';
import type { UnitSystem } from '../types';

describe('Unit Conversion', () => {
  describe('toMillimeters', () => {
    it('should return same value for metric', () => {
      expect(toMillimeters(100, 'metric')).toBe(100);
      expect(toMillimeters(2440, 'metric')).toBe(2440);
    });
    
    it('should convert inches to millimeters', () => {
      expect(toMillimeters(1, 'imperial')).toBeCloseTo(25.4);
      expect(toMillimeters(96, 'imperial')).toBeCloseTo(2438.4);
      expect(toMillimeters(48, 'imperial')).toBeCloseTo(1219.2);
    });
  });
  
  describe('fromMillimeters', () => {
    it('should return same value for metric', () => {
      expect(fromMillimeters(100, 'metric')).toBe(100);
      expect(fromMillimeters(2440, 'metric')).toBe(2440);
    });
    
    it('should convert millimeters to inches', () => {
      expect(fromMillimeters(25.4, 'imperial')).toBeCloseTo(1);
      expect(fromMillimeters(2438.4, 'imperial')).toBeCloseTo(96);
    });
  });
  
  describe('formatDimension', () => {
    it('should format metric dimensions', () => {
      expect(formatDimension(100, 'metric')).toBe('100mm');
      expect(formatDimension(1234, 'metric')).toBe('1234mm');
    });
    
    it('should format imperial whole inches', () => {
      expect(formatDimension(25.4, 'imperial')).toBe('1"');
      expect(formatDimension(304.8, 'imperial')).toBe('12"');
    });
    
    it('should format imperial fractions', () => {
      expect(formatDimension(38.1, 'imperial')).toBe('1 1/2"');
      expect(formatDimension(12.7, 'imperial')).toBe('1/2"');
      expect(formatDimension(6.35, 'imperial')).toBe('1/4"');
    });
  });
  
  describe('parseDimension', () => {
    it('should parse metric values', () => {
      expect(parseDimension('100', 'metric')).toBe(100);
      expect(parseDimension('2440mm', 'metric')).toBe(2440);
      expect(parseDimension('  1220  ', 'metric')).toBe(1220);
    });
    
    it('should parse imperial decimal inches', () => {
      expect(parseDimension('96', 'imperial')).toBeCloseTo(2438.4);
      expect(parseDimension('48"', 'imperial')).toBeCloseTo(1219.2);
    });
    
    it('should parse imperial fractions', () => {
      expect(parseDimension('1/2', 'imperial')).toBeCloseTo(12.7);
      expect(parseDimension('1 1/2', 'imperial')).toBeCloseTo(38.1);
      expect(parseDimension('3/4"', 'imperial')).toBeCloseTo(19.05);
    });
    
    it('should return null for invalid input', () => {
      expect(parseDimension('', 'imperial')).toBeNull();
      expect(parseDimension('abc', 'metric')).toBeNull();
      expect(parseDimension('invalid', 'imperial')).toBeNull();
    });
  });
});
