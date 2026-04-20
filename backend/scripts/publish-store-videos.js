require('dotenv').config();
const mongoose = require('mongoose');
const ImageKit = require('imagekit');

const foodModel = require('../src/models/food.models');

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

function normalizeVideoUrl(url) {
  if (!url || typeof url !== 'string') return '';
  try {
    const parsed = new URL(url);
    parsed.hash = '';
    parsed.search = '';
    return parsed.toString();
  } catch (error) {
    return '';
  }
}

function buildFilePathFromUrl(url) {
  if (!url || typeof url !== 'string') return '';

  try {
    const parsed = new URL(url);
    const endpoint = process.env.IMAGEKIT_URL_ENDPOINT
      ? new URL(process.env.IMAGEKIT_URL_ENDPOINT)
      : null;

    if (endpoint && parsed.origin === endpoint.origin) {
      return decodeURIComponent(parsed.pathname);
    }

    return decodeURIComponent(parsed.pathname);
  } catch (error) {
    return '';
  }
}

async function listAllImageKitFiles() {
  const allFiles = [];
  const limit = 1000;
  let skip = 0;

  while (true) {
    const batch = await imagekit.listFiles({
      skip,
      limit,
      type: 'file',
    });

    const onlyFiles = batch.filter((item) => item && item.type === 'file');
    allFiles.push(...onlyFiles);

    if (batch.length < limit) break;
    skip += limit;
  }

  return allFiles;
}

async function makeStoreVideosPublic() {
  if (!process.env.mongo_url) {
    throw new Error('Missing mongo_url in environment variables.');
  }

  await mongoose.connect(process.env.mongo_url);
  console.log('Connected to MongoDB for migration');

  const foods = await foodModel.find({}, { video: 1 }).lean();
  const uniqueVideoUrls = new Set();
  const uniqueFilePaths = new Set();

  for (const food of foods) {
    const normalizedUrl = normalizeVideoUrl(food.video);
    if (normalizedUrl) {
      uniqueVideoUrls.add(normalizedUrl);
    }

    const filePath = buildFilePathFromUrl(food.video);
    if (filePath) {
      uniqueFilePaths.add(filePath);
    }
  }

  if (uniqueVideoUrls.size === 0 && uniqueFilePaths.size === 0) {
    console.log('No food video URLs found. Nothing to publish.');
    return;
  }

  const files = await listAllImageKitFiles();
  const candidates = files.filter((file) => {
    if (!file || file.type !== 'file') return false;

    const normalizedFileUrl = normalizeVideoUrl(file.url);
    if (normalizedFileUrl && uniqueVideoUrls.has(normalizedFileUrl)) {
      return true;
    }

    return uniqueFilePaths.has(file.filePath);
  });

  if (candidates.length === 0) {
    console.log('No matching ImageKit files found for food videos.');
    return;
  }

  let publishedCount = 0;
  let failedCount = 0;

  for (const file of candidates) {
    try {
      await imagekit.updateFileDetails(file.fileId, {
        publish: {
          isPublished: true,
          includeFileVersions: true,
        },
      });
      publishedCount += 1;
      console.log(`Published: ${file.filePath}`);
    } catch (error) {
      failedCount += 1;
      console.error(`Failed to publish ${file.filePath}:`, error.message);
    }
  }

  console.log(`Done. Total matched: ${candidates.length}, published: ${publishedCount}, failed: ${failedCount}`);
}

makeStoreVideosPublic()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
