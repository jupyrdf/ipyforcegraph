from .constants import EXTENSION_NAME, __version__


def _jupyter_labextension_paths():
    from .js import __prefix__

    return [dict(src=str(__prefix__), dest=EXTENSION_NAME)]


__all__ = [
    "__version__",
]
