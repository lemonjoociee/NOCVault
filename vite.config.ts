import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Load environment variables from .env
dotenv.config();

function emailInvitePlugin(): Plugin {
  return {
    name: 'email-invite-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method === 'POST' && req.url === '/api/send-invite') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}');
              const { email, fullName, role, department, username, tempPassword, inviteLink } = data;

              if (!email) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'Recipient email is required' }));
                return;
              }

              const smtpUser = process.env.SMTP_USER;
              const smtpPass = process.env.SMTP_PASS;
              const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
              const smtpPort = Number(process.env.SMTP_PORT) || 587;
              // If SMTP_PORT is 587, ensure secure is false (uses STARTTLS); port 465 uses SSL/TLS (secure: true)
              const smtpSecure = smtpPort === 587 
                ? false 
                : (process.env.SMTP_SECURE !== undefined 
                    ? process.env.SMTP_SECURE === 'true' 
                    : smtpPort === 465);
              const smtpFrom = process.env.SMTP_FROM || smtpUser || 'NOC Operations Portal <no-reply@nocvault.internal>';

              console.log(`[SMTP Config] Host: ${smtpHost}, Port: ${smtpPort} (${typeof smtpPort}), Secure: ${smtpSecure}`);

              // If SMTP credentials are configured, dispatch real email
              if (smtpUser && smtpPass) {
                const transporter = nodemailer.createTransport({
                  host: smtpHost,
                  port: smtpPort,
                  secure: smtpSecure,
                  auth: {
                    user: smtpUser,
                    pass: smtpPass,
                  },
                });

                const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NOC Operations Portal Access Invitation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0c10; color: #c5c6c7; margin: 0; padding: 24px; }
    .card { background-color: #1f2833; border: 1px solid #45a29e; border-radius: 8px; max-width: 600px; margin: 0 auto; padding: 32px; box-shadow: 0 4px 25px rgba(0,0,0,0.6); }
    .header { border-bottom: 1px solid rgba(69, 162, 158, 0.3); padding-bottom: 16px; margin-bottom: 24px; text-align: center; }
    .title { color: #66fcf1; font-size: 22px; font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 1.5px; font-family: monospace; }
    .subtitle { color: #8892b0; font-size: 13px; margin-top: 6px; }
    .greeting { color: #ffffff; font-size: 16px; margin-bottom: 16px; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 4px; background: rgba(102, 252, 241, 0.15); color: #66fcf1; border: 1px solid #45a29e; font-weight: bold; font-family: monospace; font-size: 12px; }
    .details-box { background-color: #0b0c10; border: 1px solid rgba(69, 162, 158, 0.4); border-radius: 6px; padding: 18px; margin: 22px 0; font-family: monospace; font-size: 13px; }
    .detail-row { margin-bottom: 10px; display: flex; }
    .detail-row:last-child { margin-bottom: 0; }
    .detail-label { color: #45a29e; width: 160px; font-weight: 600; shrink: 0; }
    .detail-val { color: #ffffff; }
    .btn-container { text-align: center; margin: 28px 0; }
    .btn { background-color: #45a29e; color: #0b0c10; padding: 13px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; display: inline-block; box-shadow: 0 0 15px rgba(69, 162, 158, 0.4); }
    .note { font-size: 12px; color: #8892b0; line-height: 1.5; border-top: 1px solid rgba(69, 162, 158, 0.2); padding-top: 16px; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="title">NOC Operations Portal</div>
      <div class="subtitle">Scicom (MSC) Berhad &bull; Network Operations Center</div>
    </div>
    <div class="greeting">Hello <strong>${fullName || 'Team Member'}</strong>,</div>
    <p style="line-height: 1.6; font-size: 14px; color: #e0e2ec;">
      You have been granted authorized access to the NOC Operations Portal. Your credentials and onboarding parameters are provisioned below:
    </p>

    <div class="details-box">
      <div class="detail-row"><span class="detail-label">Assigned Role:</span> <span class="detail-val"><span class="badge">${role}</span></span></div>
      <div class="detail-row"><span class="detail-label">Department / Unit:</span> <span class="detail-val">${department || 'Operations'}</span></div>
      <div class="detail-row"><span class="detail-label">Account Username:</span> <span class="detail-val">${username}</span></div>
      <div class="detail-row"><span class="detail-label">Temporary Password:</span> <span class="detail-val">${tempPassword}</span></div>
    </div>

    <div class="btn-container">
      <a href="${inviteLink}" class="btn" target="_blank">Activate Account &amp; Access Portal &rarr;</a>
    </div>

    <div style="font-size: 12px; color: #8892b0; word-break: break-all; margin-bottom: 20px;">
      Direct link: <a href="${inviteLink}" style="color: #66fcf1;">${inviteLink}</a>
    </div>

    <div class="note">
      <strong>Security Policy Notice:</strong> For initial access, you must change your temporary password immediately upon login. Do not share these credentials with unauthorized personnel.
    </div>
  </div>
</body>
</html>
                `;

                const mailOptions = {
                  from: smtpFrom,
                  to: email,
                  subject: `[NOC Operations Portal] Invitation & Access Credentials - ${role}`,
                  text: `Hello ${fullName},\n\nYou have been invited to the NOC Operations Portal.\nRole: ${role}\nDepartment: ${department}\nUsername: ${username}\nTemporary Password: ${tempPassword}\n\nActivate your account: ${inviteLink}\n`,
                  html: htmlContent,
                };

                const info = await transporter.sendMail(mailOptions);
                console.log('✅ Invitation email successfully dispatched via SMTP:', info.messageId);

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ 
                  success: true, 
                  message: `Invitation email successfully sent to ${email}`, 
                  messageId: info.messageId,
                  mode: 'smtp'
                }));
              } else {
                console.warn('⚠️ SMTP_USER or SMTP_PASS not defined in .env. Invitation simulated.');
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ 
                  success: true, 
                  warning: 'SMTP_USER / SMTP_PASS not set in environment. Simulated dispatch mode.', 
                  mode: 'simulated'
                }));
              }
            } catch (err: any) {
              console.error('❌ Error in /api/send-invite middleware:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ 
                success: false, 
                error: err.message || 'Internal server error dispatching email' 
              }));
            }
          });
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), emailInvitePlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
