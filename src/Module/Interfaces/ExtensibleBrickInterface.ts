import SnbExtensionInterface from "./SnbExtensionInterface";

export default interface ExtensibleBrickInterface {
    use(extension: SnbExtensionInterface): void
}