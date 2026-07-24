export function trialPreviewEmailHtml(params: { name: string; previewUrl: string; year: number }) {
  const { name, previewUrl, year } = params;

  return `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Your GeoBase trial preview is ready</title>
  </head>
  <body style="margin:0;padding:0;background-color:#F0F1F3;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0F1F3;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #E3E5E8;">
            <tr>
              <td style="background-color:#14161A;padding:22px 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-right:8px;">
                      <div style="width:8px;height:8px;border-radius:50%;background-color:#FF8A3D;"></div>
                    </td>
                    <td style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.02em;">GeoBase</td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:36px 32px 8px;">
                <p style="margin:0 0 6px;font-family:'Courier New',monospace;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#FF8A3D;">Trial preview</p>
                <h1 style="margin:0 0 14px;font-size:21px;line-height:1.3;color:#14161A;">Hi ${name}, your preview is ready</h1>
                <p style="margin:0 0 26px;font-size:14px;line-height:1.65;color:#4B5563;">
                  Pick a sample brand dashboard and explore live GEO analytics — no account or password needed. This link
                  is unique to you, so keep it to yourself.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:0 32px 30px;">
                <a href="${previewUrl}" style="display:inline-block;background-color:#FF8A3D;color:#14161A;font-weight:700;font-size:14px;text-decoration:none;padding:12px 22px;border-radius:8px;">
                  Open my preview
                </a>
              </td>
            </tr>

            <tr>
              <td style="padding:0 32px 32px;">
                <p style="margin:0;font-size:12.5px;line-height:1.6;color:#9CA3AF;">
                  If you have any questions in the meantime, just reply to this email.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:18px 32px;background-color:#FAFAFA;border-top:1px solid #E7E9EC;">
                <p style="margin:0;font-size:11.5px;color:#9CA3AF;">&copy; ${year} GeoBase &mdash; GEO analytics for AI answer engines.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
