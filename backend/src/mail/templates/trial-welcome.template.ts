export function trialWelcomeEmailHtml(params: { username: string; password: string; appUrl: string; year: number }) {
  const { username, password, appUrl, year } = params;
  const loginUrl = `${appUrl}/login`;

  return `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Your GeoBase trial account is ready</title>
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
                <p style="margin:0 0 6px;font-family:'Courier New',monospace;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#FF8A3D;">Trial account ready</p>
                <h1 style="margin:0 0 14px;font-size:21px;line-height:1.3;color:#14161A;">Welcome to GeoBase</h1>
                <p style="margin:0 0 26px;font-size:14px;line-height:1.65;color:#4B5563;">
                  Your trial account has been created. Sign in to start tracking how AI answer engines like Gemini and ChatGPT talk about your brand.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:0 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F9FAFB;border:1px solid #E7E9EC;border-radius:8px;">
                  <tr>
                    <td style="padding:16px 20px;font-size:12.5px;color:#6B7280;width:130px;border-bottom:1px solid #E7E9EC;">Username</td>
                    <td style="padding:16px 20px;font-size:14px;color:#111827;font-weight:700;font-family:'Courier New',monospace;border-bottom:1px solid #E7E9EC;">${username}</td>
                  </tr>
                  <tr>
                    <td style="padding:16px 20px;font-size:12.5px;color:#6B7280;">Temporary password</td>
                    <td style="padding:16px 20px;font-size:14px;color:#111827;font-weight:700;font-family:'Courier New',monospace;">${password}</td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:28px 32px 6px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="border-radius:8px;background-color:#FF8A3D;">
                      <a href="${loginUrl}" style="display:inline-block;padding:13px 30px;font-size:14px;font-weight:700;color:#1A0E04;text-decoration:none;">Sign in to GeoBase</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 32px 32px;">
                <p style="margin:0;font-size:12.5px;line-height:1.6;color:#9CA3AF;">
                  You&rsquo;ll be asked to set a new password the first time you sign in.
                  If the button doesn&rsquo;t work, copy this link: <a href="${loginUrl}" style="color:#FF8A3D;">${loginUrl}</a>
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
