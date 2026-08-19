const User = require('../models/User');
const Commerce = require('../models/Commerce');
const CommerceType = require('../models/CommerceType');
const mongoose = require('mongoose');
const { publicUploadPath, deletePublicFile } = require('../utils/files');

function mapUserProfile(user, commerce = null) {
  const base = {
    id: user._id.toString(),
    role: user.role,
    userName: user.userName,
    email: user.email,
    phone: user.phone,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  if (user.role === 'Client' || user.role === 'Delivery' || user.role === 'Admin') {
    base.firstName = user.firstName;
    base.lastName = user.lastName;
    base.profileImage = user.profileImage;
  }

  if (user.role === 'Delivery') {
    base.isAvailable = user.isAvailable;
  }

  if (user.role === 'Commerce' && commerce) {
    base.commerce = {
      id: commerce._id.toString(),
      name: commerce.name,
      description: commerce.description,
      phone: commerce.phone,
      openingTime: commerce.openingTime,
      closingTime: commerce.closingTime,
      logo: commerce.logo,
      commerceTypeId: commerce.commerceType?.toString?.() || commerce.commerceType,
    };
  }

  return base;
}

exports.getMe = async (req, res) => {
  try {
    let commerce = null;
    if (req.user.role === 'Commerce') {
      commerce = await Commerce.findOne({ user: req.user._id });
    }

    return res.status(200).json(mapUserProfile(req.user, commerce));
  } catch (err) {
    console.error('[account.getMe]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.body.email !== undefined) {
      const email = String(req.body.email).toLowerCase().trim();
      const taken = await User.findOne({ email, _id: { $ne: user._id } });
      if (taken) {
        return res.status(409).json({ message: 'Conflict', conflicts: ['email'] });
      }
      user.email = email;
    }

    if (user.role === 'Client' || user.role === 'Delivery' || user.role === 'Admin') {
      if (req.body.firstName !== undefined) user.firstName = req.body.firstName;
      if (req.body.lastName !== undefined) user.lastName = req.body.lastName;
      if (req.body.phone !== undefined) user.phone = req.body.phone;

      if (req.file) {
        const newPath = publicUploadPath('profiles', req.file.filename);
        deletePublicFile(user.profileImage);
        user.profileImage = newPath;
      }
    }

    if (user.role === 'Commerce') {
      const commerce = await Commerce.findOne({ user: user._id });
      if (!commerce) {
        return res.status(404).json({ message: 'Commerce profile not found' });
      }

      if (req.body.name !== undefined) commerce.name = String(req.body.name).trim();
      if (req.body.description !== undefined) {
        commerce.description = String(req.body.description).trim();
      }
      if (req.body.phone !== undefined) {
        user.phone = req.body.phone;
        commerce.phone = req.body.phone;
      }
      if (req.body.openingTime !== undefined) commerce.openingTime = req.body.openingTime;
      if (req.body.closingTime !== undefined) commerce.closingTime = req.body.closingTime;

      if (req.body.commerceTypeId !== undefined) {
        const typeId = String(req.body.commerceTypeId).trim();
        if (!mongoose.Types.ObjectId.isValid(typeId)) {
          return res.status(400).json({ message: 'commerceTypeId is invalid' });
        }
        const type = await CommerceType.findById(typeId);
        if (!type) {
          return res.status(400).json({ message: 'commerceTypeId does not exist' });
        }
        commerce.commerceType = type._id;
      }

      if (req.file) {
        const newPath = publicUploadPath('logos', req.file.filename);
        deletePublicFile(commerce.logo);
        deletePublicFile(user.profileImage);
        commerce.logo = newPath;
        user.profileImage = newPath;
      }

      await commerce.save();
      await user.save();
      return res.status(200).json(mapUserProfile(user, commerce));
    }

    await user.save();
    return res.status(200).json(mapUserProfile(user));
  } catch (err) {
    if (req.file) {
      const sub = req.user.role === 'Commerce' ? 'logos' : 'profiles';
      deletePublicFile(publicUploadPath(sub, req.file.filename));
    }
    console.error('[account.updateMe]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
