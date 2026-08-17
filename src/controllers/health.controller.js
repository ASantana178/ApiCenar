/**
 * Health / bootstrap controller
 * Auth, Account, Admin controllers se implementan en la siguiente fase (Rol 1).
 */

function health(_req, res) {
  res.json({
    ok: true,
    service: 'ApiCenar',
    message: 'API scaffold ready',
  });
}

module.exports = { health };
