import bcrypt from "bcrypt";

async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    Promise.reject(error);
  }
}

async function comparePassword(password, passwordHash) {
  try {
    return await bcrypt.compare(password, passwordHash);
  } catch (error) {
    Promise.reject(error);
  }
}

function resetPassword({ lastName, REDIRECT_URL }) {
  return `
  <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:37.5em;background-color:#ffffff;border:1px solid #f0f0f0;padding:45px">
  <tbody>
    <tr style="width:100%">
      <td>
        <img alt="Dropbox" src="https://react-email-demo-92trk6dwg-resend.vercel.app/static/dropbox-logo.png" width="40" height="33" style="display:block;outline:none;border:none;text-decoration:none">
        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
          <tbody>
            <tr>
              <td>
                <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;font-weight:300;color:#404040">Hi ${lastName},</p>
                <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;font-weight:300;color:#404040">Gần đây ai đó đã yêu cầu thay đổi mật khẩu cho tài khoản Booking Hotel của bạn. Nếu đây là bạn, bạn có thể đặt mật khẩu mới tại đây:</p><a href="${REDIRECT_URL}" target="_blank" style="background-color:#007ee6;border-radius:4px;color:#fff;font-family:'Open Sans', 'Helvetica Neue', Arial;font-size:15px;text-decoration:none;text-align:center;display:inline-block;width:210px;padding:0px 0px;line-height:100%;max-width:100%"><span><!--[if mso]><i style="letter-spacing: undefinedpx;mso-font-width:-100%;mso-text-raise:0" hidden>&nbsp;</i><![endif]--></span><span style="background-color:#007ee6;border-radius:4px;color:#fff;font-family:'Open Sans', 'Helvetica Neue', Arial;font-size:15px;text-decoration:none;text-align:center;display:inline-block;width:210px;padding:14px 7px;max-width:100%;line-height:120%;text-transform:none;mso-padding-alt:0px;mso-text-raise:0">Thay đổi mật khẩu</span><span><!--[if mso]><i style="letter-spacing: undefinedpx;mso-font-width:-100%" hidden>&nbsp;</i><![endif]--></span></a>
                <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;font-weight:300;color:#404040">Nếu bạn không muốn thay đổi mật khẩu của mình hoặc không yêu cầu điều này, chỉ cần bỏ qua và xóa thông báo này.</p>
                <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;font-weight:300;color:#404040">Xin cảm ơn!</p>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table>
  `;
}

export { hashPassword, resetPassword, comparePassword };
