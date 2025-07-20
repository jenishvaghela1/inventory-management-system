# Inventory Manager - Electron App with SQLite

A modern inventory management system built with Next.js and Electron, featuring SQLite database for persistent data storage that survives application uninstalls.

## Features

### ✨ Enhanced Product Management

- **Individual Reference Numbers**: Assign unique reference numbers to each product instance (e.g., 4 SoundCore Q30 headsets, each with its own reference)
- **Improved Product Modal**: Better UI with organized sections for basic info, pricing, and individual tracking
- **Category Support**: Organize products by categories
- **Product Descriptions**: Add detailed descriptions for products
- **Real-time Profit Calculation**: See profit margins and per-unit profit instantly

### 💾 Persistent Data Storage

- **SQLite Database**: Uses better-sqlite3 for high-performance local database
- **Data Persistence**: Database stored in user's Documents folder to survive app uninstalls
- **Automatic Backup**: Built-in database backup functionality
- **Cross-Platform**: Works on Windows, macOS, and Linux

### 🖥️ Electron Integration

- **Native Desktop App**: Runs as a native desktop application
- **Auto-updates Support**: Built with electron-builder for easy distribution
- **Secure IPC**: Secure communication between renderer and main processes
- **Development Mode**: Hot reload for easy development

## Installation

1. **Install Dependencies**

   ```bash
   pnpm install
   ```

2. **Start Development Server**

   ```bash
   npm run electron-dev
   ```

3. **Build for Production**
   ```bash
   npm run build-electron
   ```

## Usage

### Adding Products with Individual References

1. Click "Add Product" to open the enhanced product modal
2. Fill in basic product information (reference, name, category, description)
3. Set pricing (purchase price and selling price)
4. Enable "Individual Tracking" if you want unique reference numbers for each item
5. The system will auto-generate reference numbers (e.g., PROD001-001, PROD001-002) or you can customize them
6. Add/remove individual items as needed

### Database Location

The SQLite database is stored in:

- **Windows**: `Documents/InventoryManager/inventory.db`
- **macOS**: `~/Documents/InventoryManager/inventory.db`
- **Linux**: `~/Documents/InventoryManager/inventory.db`

This location ensures data persists even after uninstalling the application.

### Backup & Restore

- Use the backup feature in the application to create database backups
- Database backups are saved as `.db` files that can be restored if needed

## Development

### Project Structure

```
├── main.js                 # Electron main process
├── preload.js             # Electron preload script
├── lib/
│   ├── database.ts        # Database abstraction layer
│   └── electron-database.js # SQLite implementation for Electron
├── components/
│   ├── create-product-modal.tsx # Enhanced product creation modal
│   └── products.tsx       # Product management interface
└── hooks/
    └── use-products.ts    # Product management hooks
```

### Key Technologies

- **Next.js 15**: React framework for the UI
- **Electron**: Desktop app framework
- **SQLite + better-sqlite3**: High-performance local database
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Radix UI**: Component library

### Environment Detection

The app automatically detects whether it's running in:

- **Electron**: Uses SQLite database via IPC
- **Browser**: Falls back to localStorage (for development)

## Building for Distribution

### Development

```bash
npm run electron-dev
```

### Production Build

```bash
npm run dist
```

This creates distributable packages in the `dist/` folder.

### Supported Platforms

- Windows (NSIS installer)
- macOS (DMG)
- Linux (AppImage)

## Data Migration

If you have existing data in localStorage, it will automatically be available when you switch to the Electron version. The app gracefully handles both storage methods.

## Features in Detail

### Individual Product Tracking

When you have multiple units of the same product (e.g., 4 headphones), you can:

1. Enable individual tracking
2. Assign unique reference numbers to each unit
3. Track the status of each unit (available, sold, reserved)
4. Link individual units to specific invoices when sold

### Enhanced Product Modal

The new product creation modal includes:

- **Organized Sections**: Basic info, pricing, and tracking are clearly separated
- **Real-time Calculations**: See profit margins as you type
- **Validation**: Form validation ensures data integrity
- **Auto-generation**: Automatically generate reference numbers for bulk items
- **Responsive Design**: Works well on different screen sizes

### Database Benefits

Using SQLite instead of localStorage provides:

- **Better Performance**: Faster queries and operations
- **Data Integrity**: ACID compliance and transaction support
- **Concurrent Access**: Multiple processes can safely access the database
- **Backup Support**: Easy database backup and restore
- **Persistence**: Data survives app uninstalls and system changes

## Troubleshooting

### Database Issues

- Check the database path in the app settings
- Ensure write permissions to the Documents folder
- Use the backup feature to save your data regularly

### Development Issues

- Make sure port 3000 is available
- Check that all dependencies are installed
- Verify Node.js version (14+ recommended)

## License

Private - Created by Ahmed Yassine Zeraibi
