import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { assetUrl } from '../utils.ts';

describe('assetUrl', () => {
  test('returns http url as is', () => {
    assert.strictEqual(assetUrl('http://example.com/image.png'), 'http://example.com/image.png');
  });

  test('returns https url as is', () => {
    assert.strictEqual(assetUrl('https://example.com/image.png'), 'https://example.com/image.png');
  });

  test('adds leading slash to relative path without it', () => {
    assert.strictEqual(assetUrl('images/logo.png'), '/images/logo.png');
  });

  test('keeps single leading slash for path with it', () => {
    assert.strictEqual(assetUrl('/images/logo.png'), '/images/logo.png');
  });

  test('returns / for empty string', () => {
    assert.strictEqual(assetUrl(''), '/');
  });
});
