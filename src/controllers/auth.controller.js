const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const User = require('../models/User');
const Commerce = require('../models/Commerce');
const CommerceType = require('../models/CommerceType');
const { createToken } = require('../utils/helpers');
const { publicUploadPath, deletePublicFile } = require('../utils/files');
const { signAccessToken, toPublicUser } = require('../services/token.service');
const {
  sendActivationEmail,
  sendResetPasswordEmail,
} = require('../services/mail.service');

const ACTIVATION_HOURS = 24;
const RESET_HOURS = 2;

function hoursFromNow(hours) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

function findByUserNameOrEmail(userNameOrEmail) {
  const raw = String(userNameOrEmail || '').trim();
  const lower = raw.toLowerCase();
  return User.findOne({
    $or: [{ email: lower }, { userName: raw }],
  });
}

async function assertUniqueUserNameEmail(userName, email, excludeId = null) {
  const filter = {
    $or: [{ userName }, { email: email.toLowerCase() }],
  };
  if (excludeId) filter._id = { $ne: excludeId };

  const existing = await User.findOne(filter);
  if (!existing) return null;

  const conflicts = [];
  if (existing.userName === userName) conflicts.push('userName');
  if (existing.email === email.toLowerCase()) conflicts.push('email');
  return conflicts;
}

async function registerPerson(req, res, role) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'profileImage is required' });
    }

    const {
      firstName,
      lastName,
      userName,
      email,
      password,
      phone,
    } = req.body;

    const conflicts = await assertUniqueUserNameEmail(userName, email);
    if (conflicts) {
      deletePublicFile(publicUploadPath('profiles', req.file.filename));
      return res.status(409).json({
        message: 'Conflict',
        conflicts,
      });
    }

    const activationToken = createToken();
    const hash = await bcrypt.hash(password, 10);
    const imagePath = publicUploadPath('profiles', req.file.filename);

    const user = await User.create({
      role,
      firstName,
      lastName,
      userName,
      email: email.toLowerCase(),
      password: hash,
      phone,
      profileImage: imagePath,
      isActive: false,
      isAvailable: role === 'Delivery' ? true : undefined,
      activationToken,
      activationTokenExpires: hoursFromNow(ACTIVATION_HOURS),
    });

    await sendActivationEmail({ to: user.email, token: activationToken });

    return res.status(201).json({
      message: 'User registered. Check email to confirm account.',
      user: {
        id: user._id.toString(),
        userName: user.userName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (err) {
    if (req.file) {
      deletePublicFile(publicUploadPath('profiles', req.file.filename));
    }
    console.error('[auth.registerPerson]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

exports.login = async (req, res) => {
  try {
    const { userNameOrEmail, password } = req.body;
    const user = await findByUserNameOrEmail(userNameOrEmail);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials or inactive account' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok || !user.isActive) {
      return res.status(401).json({ message: 'Invalid credentials or inactive account' });
    }

    const { token, expiresAt } = signAccessToken(user);
    return res.status(200).json({
      token,
      expiresAt,
      user: toPublicUser(user),
    });
  } catch (err) {
    console.error('[auth.login]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.registerClient = (req, res) => registerPerson(req, res, 'Client');

exports.registerDelivery = (req, res) => registerPerson(req, res, 'Delivery');

exports.registerCommerce = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'logo is required' });
    }

    const {
      userName,
      email,
      password,
      name,
      description,
      phone,
      openingTime,
      closingTime,
      commerceTypeId,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(commerceTypeId)) {
      deletePublicFile(publicUploadPath('logos', req.file.filename));
      return res.status(400).json({ message: 'commerceTypeId is invalid' });
    }

    const commerceType = await CommerceType.findById(commerceTypeId);
    if (!commerceType) {
      deletePublicFile(publicUploadPath('logos', req.file.filename));
      return res.status(400).json({ message: 'commerceTypeId does not exist' });
    }

    const conflicts = await assertUniqueUserNameEmail(userName, email);
    if (conflicts) {
      deletePublicFile(publicUploadPath('logos', req.file.filename));
      return res.status(409).json({
        message: 'Conflict',
        conflicts,
      });
    }

    const activationToken = createToken();
    const hash = await bcrypt.hash(password, 10);
    const logoPath = publicUploadPath('logos', req.file.filename);

    const user = await User.create({
      role: 'Commerce',
      userName,
      email: email.toLowerCase(),
      password: hash,
      phone,
      profileImage: logoPath,
      isActive: false,
      activationToken,
      activationTokenExpires: hoursFromNow(ACTIVATION_HOURS),
    });

    try {
      await Commerce.create({
        user: user._id,
        name,
        description: description || '',
        phone,
        openingTime,
        closingTime,
        logo: logoPath,
        commerceType: commerceType._id,
      });
    } catch (createErr) {
      await User.deleteOne({ _id: user._id });
      throw createErr;
    }

    await sendActivationEmail({ to: user.email, token: activationToken });

    return res.status(201).json({
      message: 'Commerce registered. Check email to confirm account.',
      user: {
        id: user._id.toString(),
        userName: user.userName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (err) {
    if (req.file) {
      deletePublicFile(publicUploadPath('logos', req.file.filename));
    }
    console.error('[auth.registerCommerce]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.confirmEmail = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findOne({ activationToken: token });

    if (!user) {
      return res.status(404).json({ message: 'Token not found' });
    }

    if (!user.activationTokenExpires || user.activationTokenExpires < new Date()) {
      return res.status(400).json({ message: 'Token invalid or expired' });
    }

    user.isActive = true;
    user.activationToken = null;
    user.activationTokenExpires = null;
    await user.save();

    return res.status(200).json({ message: 'Email confirmed. Account is active.' });
  } catch (err) {
    console.error('[auth.confirmEmail]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/** Confirmación vía link del correo (GET ?token=) */
exports.confirmEmailGet = async (req, res) => {
  try {
    const token = String(req.query.token || '').trim();
    if (!token) {
      return res.status(400).json({ message: 'token query param is required' });
    }

    const user = await User.findOne({ activationToken: token });
    if (!user) {
      return res.status(404).json({ message: 'Token not found' });
    }
    if (!user.activationTokenExpires || user.activationTokenExpires < new Date()) {
      return res.status(400).json({ message: 'Token invalid or expired' });
    }

    user.isActive = true;
    user.activationToken = null;
    user.activationTokenExpires = null;
    await user.save();

    return res.status(200).json({ message: 'Email confirmed. Account is active.' });
  } catch (err) {
    console.error('[auth.confirmEmailGet]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { userNameOrEmail } = req.body;
    const user = await findByUserNameOrEmail(userNameOrEmail);

    // Respuesta genérica para no filtrar existencia de usuarios
    if (!user) {
      return res.status(200).json({
        message: 'If the account exists, a reset email was sent.',
      });
    }

    const resetToken = createToken();
    user.resetToken = resetToken;
    user.resetTokenExpires = hoursFromNow(RESET_HOURS);
    await user.save();

    await sendResetPasswordEmail({ to: user.email, token: resetToken });

    return res.status(200).json({
      message: 'If the account exists, a reset email was sent.',
    });
  } catch (err) {
    console.error('[auth.forgotPassword]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Token invalid or expired' });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('[auth.resetPassword]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
