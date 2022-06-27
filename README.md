# SNB-components

Summernote bricks components re-used in the summernote bricks repos.

## Components
- **LineBreak**: a service to manage the linebreaks
- **ModalMode**: the abstractions of the modal modes.
    - creating mode: adding a new brick to the editor 
    - editing mode: editing an existing brick in the editor 
- **editableWrapTemplate**: the brick wrapper that contains action buttons
- **EditableBrick**: a service that transforms a brick into an editable brick with action buttons
- **DataValidator**: validates the modal input data
- **ExtensionsManager**: adds extensions to the editor

## Extensions
**WhiteSpaceManagerExtension**: manage the linebreaks in the editor (add/remove linebreaks around the brick)