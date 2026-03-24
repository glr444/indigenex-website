const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 100);
};

// Get all news (admin - includes unpublished)
const getAllNews = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', isPublished } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(isPublished !== undefined && { isPublished: isPublished === 'true' })
    };

    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.news.count({ where })
    ]);

    res.json({
      success: true,
      data: { news, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get published news (public)
const getPublishedNews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where: { isPublished: true },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          imageUrl: true,
          publishedAt: true,
          createdAt: true
        }
      }),
      prisma.news.count({ where: { isPublished: true } })
    ]);

    res.json({
      success: true,
      data: { news, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    console.error('Get published news error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get single news by slug (public)
const getNewsBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const news = await prisma.news.findUnique({
      where: { slug }
    });

    if (!news || !news.isPublished) {
      return res.status(404).json({ success: false, message: 'News not found' });
    }

    res.json({ success: true, data: { news } });
  } catch (error) {
    console.error('Get news by slug error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get single news by id (admin)
const getNewsById = async (req, res) => {
  try {
    const { id } = req.params;

    const news = await prisma.news.findUnique({
      where: { id }
    });

    if (!news) {
      return res.status(404).json({ success: false, message: 'News not found' });
    }

    res.json({ success: true, data: { news } });
  } catch (error) {
    console.error('Get news by id error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Create news
const createNews = async (req, res) => {
  try {
    const { title, content, summary, imageUrl, isPublished } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    let slug = generateSlug(title);
    let slugExists = await prisma.news.findUnique({ where: { slug } });
    let counter = 1;

    while (slugExists) {
      slug = `${generateSlug(title)}-${counter}`;
      slugExists = await prisma.news.findUnique({ where: { slug } });
      counter++;
    }

    const news = await prisma.news.create({
      data: {
        title,
        slug,
        content,
        summary,
        imageUrl,
        isPublished: isPublished || false,
        publishedAt: isPublished ? new Date() : null,
        authorId: req.user.id
      }
    });

    res.status(201).json({ success: true, message: 'News created successfully', data: { news } });
  } catch (error) {
    console.error('Create news error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Update news
const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, summary, imageUrl, isPublished } = req.body;

    const existingNews = await prisma.news.findUnique({ where: { id } });
    if (!existingNews) {
      return res.status(404).json({ success: false, message: 'News not found' });
    }

    let slug = existingNews.slug;
    if (title && title !== existingNews.title) {
      slug = generateSlug(title);
      let slugExists = await prisma.news.findUnique({ where: { slug } });
      let counter = 1;
      while (slugExists && slugExists.id !== id) {
        slug = `${generateSlug(title)}-${counter}`;
        slugExists = await prisma.news.findUnique({ where: { slug } });
        counter++;
      }
    }

    const news = await prisma.news.update({
      where: { id },
      data: {
        title: title || existingNews.title,
        slug,
        content: content || existingNews.content,
        summary,
        imageUrl,
        isPublished: isPublished !== undefined ? isPublished : existingNews.isPublished,
        publishedAt: isPublished && !existingNews.isPublished ? new Date() : existingNews.publishedAt,
        updatedAt: new Date()
      }
    });

    res.json({ success: true, message: 'News updated successfully', data: { news } });
  } catch (error) {
    console.error('Update news error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Delete news
const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;

    const existingNews = await prisma.news.findUnique({ where: { id } });
    if (!existingNews) {
      return res.status(404).json({ success: false, message: 'News not found' });
    }

    await prisma.news.delete({ where: { id } });

    res.json({ success: true, message: 'News deleted successfully' });
  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getAllNews,
  getPublishedNews,
  getNewsBySlug,
  getNewsById,
  createNews,
  updateNews,
  deleteNews
};
