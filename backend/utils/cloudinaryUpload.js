const cloudinary = require('../config/cloudinary');

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {Object} options - Cloudinary upload options
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const defaultOptions = {
      resource_type: 'image',
      folder: 'home-rental',
      quality: 'auto:good',
      fetch_format: 'auto',
      ...options,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      defaultOptions,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Delete a file from Cloudinary by its public_id
 * @param {string} publicId - Cloudinary public_id
 * @returns {Promise<Object>} Cloudinary delete result
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error(`Failed to delete Cloudinary asset: ${publicId}`, error.message);
    // Don't throw — deletion failure shouldn't block other operations
    return null;
  }
};

/**
 * Upload multiple buffers to Cloudinary in parallel
 * @param {Buffer[]} buffers - Array of file buffers
 * @param {Object} options - Cloudinary upload options
 * @returns {Promise<Object[]>} Array of Cloudinary results
 */
const uploadMultipleToCloudinary = async (buffers, options = {}) => {
  const uploadPromises = buffers.map((buffer) => uploadToCloudinary(buffer, options));
  return Promise.all(uploadPromises);
};

module.exports = { uploadToCloudinary, deleteFromCloudinary, uploadMultipleToCloudinary };
