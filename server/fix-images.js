const { RoomType } = require('./src/databases/models');

async function fixImages() {
  try {
    console.log('Fixing double-encoded images...');
    
    const roomTypes = await RoomType.findAll();
    
    for (const roomType of roomTypes) {
      if (roomType.images) {
        let images = roomType.images;
        
        // If it's a string, parse it
        if (typeof images === 'string') {
          try {
            images = JSON.parse(images);
          } catch (e) {
            console.log(`Failed to parse images for RoomType ${roomType.id}`);
            continue;
          }
        }
        
        // If first element is a string that looks like JSON, it's double-encoded
        if (Array.isArray(images) && images.length > 0 && images[0] === '[') {
          console.log(`Fixing RoomType ${roomType.id} - double-encoded detected`);
          
          // Try to reconstruct the original array
          const joined = images.join('');
          try {
            const fixed = JSON.parse(joined);
            if (Array.isArray(fixed)) {
              await roomType.update({ images: fixed });
              console.log(`✓ Fixed RoomType ${roomType.id}:`, fixed);
            }
          } catch (e) {
            console.log(`✗ Could not fix RoomType ${roomType.id}`);
          }
        } else if (Array.isArray(images)) {
          console.log(`✓ RoomType ${roomType.id} is OK:`, images);
        }
      }
    }
    
    console.log('\nDone!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixImages();
