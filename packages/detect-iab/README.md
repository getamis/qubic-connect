# `detect-iab`

> TODO: description

## Usage

import { showBlockerWhenIab, openExternalBrowserWhenLineIab } from '@qubic-connect/detect-iab';


### showBlockerWhenIab({ redirectUrl?: string, shouldAlwaysShowCopyUI?: boolean }): void
shows a blocker when detected in iab

shows relative hint when in facebook, facebook messenger, line, instagram

![relative](src/assets/readme/position-preview.png)

shows a copy box when not in facebook, facebook messenger, line, instagram, or when `shouldAlwaysShowCopyUI` is true

![relative](src/assets/readme/copy-preview.png)

if `redirectUrl` is given, show and copy `redirectUrl` instead of current url
### openExternalBrowserWhenLineIab(): void

when in line iab, auto opens native browser (chrome / google for android, safari for ios) with same url