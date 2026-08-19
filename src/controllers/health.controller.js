/**
 * Health controller — API bootstrap check.
 */

function health(_req, res) {
  res.json({
    ok: true,
    service: 'ApiCenar',
    message: 'API ready (Rol 1: Auth / Account / Admin / Configurations)',
  });
}

module.exports = { health };
