2.0

- Update: create a signed xpi for Firefox addon policy compatibility.
- Fix: errors due to Components shortcuts; remove Cc, Ci, Cu, Cr.
- Fix: update is broken on version changes, v2.0 needs to be downloaded from http://userchromejs.mozdev.org/ for future auto updates.
- New: implement observer for xul overlays to ensure serial loads.