# Favorites Feature

The favorites feature allows users to mark folders and notes as favorites for quick access.

## Features

### Adding/Removing Favorites

#### Folders
- **Right-click context menu**: Right-click on any folder to see "Add to favorites" or "Remove from favorites" option
- **Keyboard shortcut**: Press `S` when the context menu is open to toggle favorite status
- **Visual indicator**: Favorited folders show a yellow star icon next to the folder icon

#### Notes
- **Right-click context menu**: Right-click on any note to see "Add to favorites" or "Remove from favorites" option
- **Visual indicator**: Favorited notes show a yellow star icon next to the file icon

### Viewing Favorites

#### Favorites Panel
- **Star button**: Click the star button in the top action bar to open the favorites panel
- **Keyboard shortcut**: Press `Cmd+Shift+F` (or `Ctrl+Shift+F` on Windows/Linux) to toggle the favorites panel
- **Tabs**: Switch between "All", "Folders", and "Notes" to filter favorites
- **Search**: Use the search input to find specific favorites
- **Navigation**: Click on any favorite to navigate to it

#### Visual Indicators
- **Star icons**: Favorited items show a filled yellow star icon
- **Count display**: The star button tooltip shows the current count of favorite folders and notes

## Technical Implementation

### Database Schema
- Added `is_favorite` boolean column to both `folders` and `notes` tables
- Default value is `false` for new items

### API Layer
- `toggleFolderFavoriteStatus()` - Toggle folder favorite status
- `toggleNoteFavoriteStatus()` - Toggle note favorite status
- `getFavoriteFoldersWithStats()` - Get all favorite folders
- `getFavoriteNotesWithMetadata()` - Get all favorite notes

### React Hooks
- `useToggleFolderFavorite()` - Mutation for toggling folder favorites
- `useToggleNoteFavorite()` - Mutation for toggling note favorites
- `useFavorites()` - Query for fetching all favorites
- `useFavoritesNavigation()` - Navigation utilities for favorites

### Components
- `FavoritesPanel` - Modal panel for viewing and navigating favorites
- Enhanced context menus with favorite options
- Visual star indicators on favorited items

## Usage

1. **To favorite an item**: Right-click on a folder or note and select "Add to favorites"
2. **To unfavorite an item**: Right-click on a favorited item and select "Remove from favorites"
3. **To view favorites**: Click the star button in the top action bar or press `Cmd+Shift+F`
4. **To navigate to a favorite**: Click on any item in the favorites panel

## Keyboard Shortcuts

- `S` - Toggle favorite status (when context menu is open)
- `Cmd+Shift+F` / `Ctrl+Shift+F` - Toggle favorites panel
- `/` - Search in sidebar (existing)
- `Escape` - Close favorites panel or context menu

## Future Enhancements

- Favorite folders in sidebar navigation
- Drag and drop reordering of favorites
- Favorite collections/groups
- Export/import favorites
- Favorite notes preview in panel
