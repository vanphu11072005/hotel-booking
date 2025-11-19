const bannerRepository = require('../repositories/bannerRepository');
const fs = require('fs');
const path = require('path');

/**
 * Banner Service - Business logic layer
 * Xử lý logic nghiệp vụ liên quan đến banner
 */
class BannerService {
  /**
   * Lấy danh sách banners với filters và pagination
   */
  async getBanners(filters) {
    const { search, status, page = 1, limit = 10 } = filters;

    // Build where clause
    const whereClause = bannerRepository.buildWhereClause(search, status);

    // Calculate offset
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get banners from repository
    const { count, rows: banners } = await bannerRepository.findAllBanners(
      whereClause,
      limit,
      offset
    );

    const totalPages = Math.ceil(count / parseInt(limit));

    return {
      banners,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages,
      },
    };
  }

  /**
   * Lấy banner theo ID
   */
  async getBannerById(id) {
    const banner = await bannerRepository.findBannerById(id);

    if (!banner) {
      const error = new Error('Banner không tồn tại');
      error.statusCode = 404;
      throw error;
    }

    return banner;
  }

  /**
   * Tạo banner mới
   */
  async createBanner(bannerData) {
    const {
      title,
      description,
      link_url,
      is_active = true,
    } = bannerData;

    const banner = await bannerRepository.createBanner({
      title,
      description,
      link_url,
      is_active,
    });

    return banner;
  }

  /**
   * Cập nhật banner
   */
  async updateBanner(id, updateData) {
    const banner = await bannerRepository.findBannerById(id);

    if (!banner) {
      const error = new Error('Banner không tồn tại');
      error.statusCode = 404;
      throw error;
    }

    const {
      title,
      description,
      link_url,
      is_active,
    } = updateData;

    const dataToUpdate = {};
    if (title !== undefined) dataToUpdate.title = title;
    if (description !== undefined) dataToUpdate.description = description;
    if (link_url !== undefined) dataToUpdate.link_url = link_url;
    if (is_active !== undefined) dataToUpdate.is_active = is_active;

    await bannerRepository.updateBanner(banner, dataToUpdate);

    return banner;
  }

  /**
   * Xóa banner
   */
  async deleteBanner(id) {
    const banner = await bannerRepository.findBannerById(id);

    if (!banner) {
      const error = new Error('Banner không tồn tại');
      error.statusCode = 404;
      throw error;
    }

    // Delete image file if exists
    if (banner.image_url) {
      this.deleteImageFile(banner.image_url);
    }

    await bannerRepository.deleteBanner(banner);

    return true;
  }

  /**
   * Upload ảnh banner
   */
  async uploadBannerImage(id, file) {
    const banner = await bannerRepository.findBannerById(id);

    if (!banner) {
      const error = new Error('Banner không tồn tại');
      error.statusCode = 404;
      throw error;
    }

    if (!file) {
      const error = new Error('Vui lòng chọn file ảnh');
      error.statusCode = 400;
      throw error;
    }

    // Delete old image if exists
    if (banner.image_url) {
      this.deleteImageFile(banner.image_url);
    }

    // Update banner with new image URL
    const imageUrl = `/uploads/banners/${file.filename}`;
    await bannerRepository.updateBanner(banner, { image_url: imageUrl });

    return banner;
  }

  /**
   * Format image URL thành absolute URL
   */
  formatImageUrl(banner, baseUrl) {
    const obj = banner.toJSON ? banner.toJSON() : banner;
    if (obj.image_url && !/^https?:\/\//i.test(obj.image_url)) {
      obj.image_url = obj.image_url.startsWith('/')
        ? `${baseUrl}${obj.image_url}`
        : `${baseUrl}/${obj.image_url}`;
    }
    return obj;
  }

  /**
   * Format nhiều banners
   */
  formatBannersImageUrls(banners, baseUrl) {
    return banners.map((banner) => this.formatImageUrl(banner, baseUrl));
  }

  /**
   * Xóa file ảnh
   */
  deleteImageFile(imageUrl) {
    try {
      const imagePath = path.join(__dirname, '../../', imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    } catch (error) {
      console.warn('Không thể xóa ảnh:', imageUrl, error);
    }
  }

  /**
   * Xóa file upload khi có lỗi
   */
  cleanupUploadedFile(filename) {
    try {
      const filePath = path.join(
        __dirname,
        '../../uploads/banners',
        filename
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.warn('Không thể xóa file upload:', filename, error);
    }
  }
}

module.exports = new BannerService();
