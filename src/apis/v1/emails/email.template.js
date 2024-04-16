function bookingTemplate(data) {
  const genders = {
    MALE: "Nam",
    FEMALE: "Nữ",
  };

  const payments = {
    online: "Thanh toán online.",
    offline: "Thanh toán tại cơ sở y tế.",
  };

  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
<html lang="en">
  <head></head>
  <body style="font-family:&quot;Helvetica Neue&quot;,Helvetica,Arial,sans-serif;background-color:#ffffff">
  <h3 style="text-align: center;text-transform:uppercase;">Thông tin đặt lịch khám bệnh</h3>
    <table align="center" role="presentation" cellSpacing="0" cellPadding="0" border="0" width="100%" style="max-width:37.5em;margin:0 auto;padding:20px 0 48px;width:660px">
      <tr style="width:100%">
        <td>
    <table style="border-collapse:collapse;border-spacing:0px;color:rgb(51,51,51);background-color:rgb(250,250,250);border-radius:3px;font-size:12px" align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%">
      <tbody>
        <tr>
          <td>
            <table width="100%" style="height:46px" align="center" role="presentation" cellSpacing="0" cellPadding="0" border="0">
              <tbody style="width:100%">
                <tr style="width:100%">
                  <td colSpan="2">
                    <table width="100%" align="center" role="presentation" cellSpacing="0" cellPadding="0" border="0">
                      <tbody style="width:100%">
                        <tr style="width:100%">
                          <td style="padding-left:20px;border-style:solid;border-color:white;border-width:0px 1px 1px 0px;height:44px">
                            <p style="font-size:10px;line-height:1.4;margin:0;padding:0;color:rgb(102,102,102)">Email</p><a target="_blank" style="color:#15c;text-decoration:underline;font-size:12px;margin:0;padding:0;line-height:1.4">${
                              data.email
                            }</a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <table width="100%" align="center" role="presentation" cellSpacing="0" cellPadding="0" border="0">
                      <tbody style="width:100%">
                        <tr style="width:100%">
                          <td style="padding-left:20px;border-style:solid;border-color:white;border-width:0px 1px 1px 0px;height:44px">
                            <p style="font-size:10px;line-height:1.4;margin:0;padding:0;color:rgb(102,102,102)">Ngày khám</p>
                            <p style="font-size:12px;line-height:1.4;margin:0;padding:0">${formatDate(
                              data.date
                            )}</p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <table width="100%" align="center" role="presentation" cellSpacing="0" cellPadding="0" border="0">
                      <tbody style="width:100%">
                        <tr style="width:100%">
                          <td style="padding-left:20px;border-style:solid;border-color:white;border-width:0px 1px 1px 0px;height:44px">
                            <p style="font-size:10px;line-height:1.4;margin:0;padding:0;color:rgb(102,102,102)">Mã bill</p><a target="_blank" style="color:#15c;text-decoration:underline;font-size:12px;margin:0;padding:0;line-height:1.4">${
                              data.bookingId
                            }</a>
                          </td>
                          <td style="padding-left:20px;border-style:solid;border-color:white;border-width:0px 1px 1px 0px;height:44px">
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  <td colSpan="2" style="padding-left:20px;border-style:solid;border-color:white;border-width:0px 1px 1px 0px;height:44px">
                    <p style="font-size:10px;line-height:1.4;margin:0;padding:0;color:rgb(102,102,102)">Thông tin</p>
                    <p style="font-size:12px;line-height:1.4;margin:0;padding:0">${
                      data.full_name
                    }</p>
                    <p style="font-size:12px;line-height:1.4;margin:0;padding:0">${
                      data.phone
                    }</p>
                    <p style="font-size:12px;line-height:1.4;margin:0;padding:0">${
                      data.address
                    }</p>
                    <p style="font-size:12px;line-height:1.4;margin:0;padding:0">${
                      genders[data.gender]
                    }</p>
                    <p style="font-size:12px;line-height:1.4;margin:0;padding:0;font-weight:bold;">Hình thức thanh toán: ${
                      payments[data.payments]
                    }</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
    <table style="border-collapse:collapse;border-spacing:0px;color:rgb(51,51,51);background-color:rgb(250,250,250);border-radius:3px;font-size:12px;margin:30px 0 15px 0;height:24px" align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%">
      <tbody>
        <tr>
          <td>
            <p style="font-size:14px;line-height:24px;margin:0;background:#fafafa;padding-left:10px;font-weight:500">Thông tin đặt lịch</p>
          </td>
        </tr>
      </tbody>
    </table>
    <table align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%">
      <tbody>
        <tr>
          <td>
          <td style="padding-left:22px">
            <p style="font-size:12px;line-height:1.4;margin:0;font-weight:600;padding:0">Cơ sở y tế: ${
              data.clinic_name
            }</p>
            <p style="font-size:12px;line-height:1.4;margin:0;color:rgb(102,102,102);padding:0"><b>Bác sĩ:</b> <b>${
              data.doctor_name
            }</b></p>
            <p style="font-size:12px;line-height:1.4;margin:0;color:rgb(102,102,102);padding:0"><b>Thời gian khám:</b>${
              data.work
            }</p>
            <p style="font-size:12px;line-height:1.4;margin:0;color:rgb(102,102,102);padding:0"><b>Chuyên Khoa:</b> ${
              data.specialty_name
            }</p>
             <p style="font-size:12px;line-height:1.4;margin:0;color:rgb(102,102,102);padding:0"><b>Lý do khám:</b> ${
               data.reason_exam
             }</p>
          </td>
          <td align="right" style="display:table-cell;padding:0px 20px 0px 0px;width:100px;vertical-align:top">
            <p style="font-size:12px;line-height:24px;margin:0;font-weight:600">${formatPriceVnd(
              data.price
            )}</p>
          </td>
          </td>
        </tr>
      </tbody>
    </table>
    <hr style="width:100%;border:none;border-top:1px solid #eaeaea;margin:30px 0 0 0" />
  </body>

</html>
    `;
}

function formatPriceVnd(price) {
  /**
   * Hàm định dạng giá tiền Việt Nam.
   * Đầu vào: price (number) - giá tiền cần định dạng.
   * Đầu ra: Số nguyên thể hiện giá tiền đã được định dạng theo chuẩn Việt Nam.
   */
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
    .format(price)
    .replace(/\u200B/g, "");
}

function formatDate(date) {
  const now = new Date(date);
  const daysOfWeek = [
    "Chủ nhật",
    "Thứ hai",
    "Thứ ba",
    "Thứ tư",
    "Thứ năm",
    "Thứ sáu",
    "Thứ bảy",
  ];
  const dayOfWeek = daysOfWeek[now.getDay()];
  const dayOfMonth = now.getDate().toString().padStart(2, "0");
  const monthOfYear = (now.getMonth() + 1).toString().padStart(2, "0");
  const year = now.getFullYear();

  const formattedDate = `${dayOfWeek}, ${dayOfMonth}/${monthOfYear}/${year}`;
  return formattedDate; // Output: "Thứ Sáu, 15/04/2023"
}

export { bookingTemplate, formatDate, formatPriceVnd };
