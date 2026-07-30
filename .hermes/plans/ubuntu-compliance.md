# 5th OS — Ubuntu Compliance Plan

## P0: Critical Missing Interactions (Today)

### 1. Window Right-Click Context Menu
- Right-click on panel window list → menu: Close, Minimize, Maximize, Move to Workspace
- Right-click on window title bar → same menu
- Implementation: add onContextMenu to Panel window buttons + WindowManager title bar

### 2. Files App Context Menu + Delete/Rename
- Right-click file → menu: Open, Rename, Delete, Properties
- Delete key on selected file
- F2 to rename
- Implementation: add context menu overlay within Files app, wire to VFS

### 3. Run Dialog (F2 / Alt+F2)
- Currently shows "port in progress"
- Should: text input → launch app by name, execute terminal commands
- Implementation: command input that calls launchApp or Terminal

### 4. Alt+Tab Window Switcher
- Ubuntu: hold Alt, press Tab to cycle windows
- Implementation: keyboard listener in App.tsx, overlay showing window list

### 5. Notification Toasts
- Currently: notifications only visible in panel popover
- Should: toast appears top-right, auto-dismisses after 5s
- Implementation: toast component in App.tsx, triggered by addNotification

### 6. Window Position/Size Memory
- Windows don't remember their last size/position
- Implementation: save to persistence on close/resize, restore on launch

## P1: Important UX

### 7. Files: Multi-Select + Sort
- Ctrl+click for multi-select, Shift+click for range
- Click column headers to sort by name/size/date

### 8. Terminal: Tab Completion
- Press Tab to complete filenames from VFS
- Implementation: onKeyDown handler with VFS listDir

### 9. Terminal: Pipe Support
- Parse `|` in commands, pipe stdout of left to stdin of right

### 10. Terminal: Ctrl+C, Ctrl+L
- Ctrl+C: interrupt current command / clear input
- Ctrl+L: clear terminal (same as `clear`)

### 11. Start Menu: Logout vs Shutdown
- Logout: lock screen + clear session
- Shutdown: show confirmation dialog
- Both currently just lock screen

### 12. Start Menu: File Search
- Search bar also searches VFS filenames
- Show file results below app results

### 13. Panel: Window List Right-Click
- Right-click → Close, Minimize, Maximize, Move to Workspace 1-4

### 14. Panel: Middle-Click Close + Scroll Volume
- Middle-click window button → close window
- Scroll on volume icon → adjust volume

## P2: Polish

### 15. Clipboard System
- Simple text clipboard (localStorage-backed)
- Ctrl+C/Ctrl+V across Terminal, Editor, input fields

### 16. Window Snap
- Drag window to left/right edge → half-screen snap
- Drag to top → maximize

### 17. Desktop Icon Drag
- Icons can be repositioned by drag
- Positions persist in localStorage

### 18. System Sounds
- Audio feedback for: window open/close, notification, error
- Web Audio API for simple tones

### 19. Lelu HUD Polish
- Chat auto-scroll to bottom
- Quick action buttons contextual to current workspace/state
- Settings gear always works

### 20. Recently Used Apps
- Track app launch history in store
- Show in Start Menu favorites section
