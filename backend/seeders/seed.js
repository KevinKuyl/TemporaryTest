// Import the necessary modules
import fs from 'fs';
import path from 'path';
import mongoClient from "../database/mongooseClient.js";

await mongoClient.connect();
const directoryPath = './seeders/seeders';

const seed = async () => {
  const files = await fs.promises.readdir(directoryPath);

  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    if (path.extname(filePath) === '.js') {
      try {
        const importedModule = await import('../' + filePath);
        const data = importedModule.default?.data;
        const Model = importedModule.default?.Model;

        await Model.deleteMany({});

        for(const entry of data) {
          const result = await Model.create(entry);
          console.log(`✔️  Created [${Model.modelName}] ${result.name}`);
        }
      } catch (error) {
        console.error(`🔥 Error importing file ${file}:`, error);
      }
    }
  }
  await mongoClient.disconnect();
};

await seed();