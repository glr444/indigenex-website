const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Submit contact form (public)
const submitContact = async (req, res) => {
  try {
    const { fullName, company, phone, email, inquiryType, details } = req.body;

    if (!fullName || !email || !inquiryType || !details) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, inquiry type, and details are required'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    const contact = await prisma.contact.create({
      data: {
        fullName,
        company: company || null,
        phone: phone || null,
        email,
        inquiryType,
        details,
        isRead: false
      }
    });

    res.status(201).json({
      success: true,
      message: 'Your message has been submitted successfully. We will respond within 48 hours.',
      data: { contact: { id: contact.id, createdAt: contact.createdAt } }
    });
  } catch (error) {
    console.error('Submit contact error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get all contacts (admin)
const getAllContacts = async (req, res) => {
  try {
    const { page = 1, limit = 10, isRead, inquiryType } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(isRead !== undefined && { isRead: isRead === 'true' }),
      ...(inquiryType && { inquiryType })
    };

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.contact.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        contacts,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        unreadCount: await prisma.contact.count({ where: { isRead: false } })
      }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get single contact (admin)
const getContactById = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await prisma.contact.findUnique({ where: { id } });

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    res.json({ success: true, data: { contact } });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Mark contact as read (admin)
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await prisma.contact.update({
      where: { id },
      data: { isRead: true, updatedAt: new Date() }
    });

    res.json({ success: true, message: 'Contact marked as read', data: { contact } });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Delete contact (admin)
const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    const existingContact = await prisma.contact.findUnique({ where: { id } });
    if (!existingContact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    await prisma.contact.delete({ where: { id } });

    res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  submitContact,
  getAllContacts,
  getContactById,
  markAsRead,
  deleteContact
};
