import { describe, expect, it, vi } from 'vitest';
import {
  closestBrick,
  createBrickElement,
  isBrickElement,
  readBrickMetadata,
} from '../../src/v3/brick';
import { mutateWithHistory } from '../../src/v3/summernote';

describe('v3 brick metadata', () => {
  it('creates semantic, versioned brick elements', () => {
    const element = createBrickElement({
      type: 'heading',
      version: 3,
      tagName: 'section',
      classNames: ['custom-brick'],
    });

    expect(element.tagName).toBe('SECTION');
    expect(element.classList.contains('snb-brick')).toBe(true);
    expect(element.classList.contains('snb-heading')).toBe(true);
    expect(element.classList.contains('custom-brick')).toBe(true);
    expect(readBrickMetadata(element)).toEqual({ type: 'heading', version: 3 });
    expect(isBrickElement(element)).toBe(true);
  });

  it('rejects invalid brick metadata', () => {
    expect(() => createBrickElement({ type: '   ', version: 1 })).toThrow(TypeError);
    expect(() => createBrickElement({ type: 'heading', version: 0 })).toThrow(TypeError);

    const element = document.createElement('div');
    element.setAttribute('data-snb-brick', 'heading');
    element.setAttribute('data-snb-version', 'invalid');
    expect(readBrickMetadata(element)).toBeNull();
  });

  it('finds the closest brick from nested editor content', () => {
    const brick = createBrickElement({ type: 'gallery', version: 3 });
    const child = document.createElement('span');
    brick.appendChild(child);
    document.body.appendChild(brick);

    expect(closestBrick(child)).toBe(brick);
    expect(closestBrick(document.createTextNode('x'))).toBeNull();
  });
});

describe('Summernote history integration', () => {
  it('wraps direct DOM mutations in before/after commands', () => {
    const invoke = vi.fn();
    const context = {
      options: {},
      layoutInfo: {} as never,
      memo: vi.fn(),
      invoke,
    };

    const result = mutateWithHistory(context, () => 'done');

    expect(result).toBe('done');
    expect(invoke.mock.calls).toEqual([
      ['editor.beforeCommand'],
      ['editor.afterCommand'],
    ]);
  });

  it('always closes the history command when a mutation throws', () => {
    const invoke = vi.fn();
    const context = {
      options: {},
      layoutInfo: {} as never,
      memo: vi.fn(),
      invoke,
    };

    expect(() => mutateWithHistory(context, () => {
      throw new Error('boom');
    })).toThrow('boom');

    expect(invoke.mock.calls).toEqual([
      ['editor.beforeCommand'],
      ['editor.afterCommand'],
    ]);
  });
});
