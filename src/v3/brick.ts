export const BRICK_TYPE_ATTRIBUTE = 'data-snb-brick';
export const BRICK_VERSION_ATTRIBUTE = 'data-snb-version';
export const BRICK_CLASS = 'snb-brick';

export interface BrickMetadata {
    type: string;
    version: number;
}

export interface CreateBrickElementOptions extends BrickMetadata {
    tagName?: keyof HTMLElementTagNameMap;
    classNames?: string[];
}

function requireNonEmpty(value: string, label: string): string {
    const normalized = value.trim();

    if (!normalized) {
        throw new TypeError(`${label} must be a non-empty string.`);
    }

    return normalized;
}

function requireVersion(version: number): number {
    if (!Number.isInteger(version) || version < 1) {
        throw new TypeError('Brick version must be a positive integer.');
    }

    return version;
}

export function createBrickElement(options: CreateBrickElementOptions): HTMLElement {
    const type = requireNonEmpty(options.type, 'Brick type');
    const version = requireVersion(options.version);
    const tagName = options.tagName || 'div';
    const element = document.createElement(tagName);

    element.classList.add(BRICK_CLASS, `snb-${type}`);

    (options.classNames || [])
        .map((className) => className.trim())
        .filter(Boolean)
        .forEach((className) => element.classList.add(className));

    element.setAttribute(BRICK_TYPE_ATTRIBUTE, type);
    element.setAttribute(BRICK_VERSION_ATTRIBUTE, String(version));

    return element;
}

export function readBrickMetadata(element: Element): BrickMetadata | null {
    const type = element.getAttribute(BRICK_TYPE_ATTRIBUTE);
    const rawVersion = element.getAttribute(BRICK_VERSION_ATTRIBUTE);

    if (!type || !rawVersion) {
        return null;
    }

    const version = Number(rawVersion);

    if (!Number.isInteger(version) || version < 1) {
        return null;
    }

    return {
        type,
        version,
    };
}

export function isBrickElement(element: Element): element is HTMLElement {
    return readBrickMetadata(element) !== null;
}

export function closestBrick(target: EventTarget | null): HTMLElement | null {
    if (!(target instanceof Element)) {
        return null;
    }

    const element = target.closest(`[${BRICK_TYPE_ATTRIBUTE}][${BRICK_VERSION_ATTRIBUTE}]`);

    return element instanceof HTMLElement ? element : null;
}
