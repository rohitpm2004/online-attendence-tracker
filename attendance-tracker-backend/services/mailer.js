import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendLowAttendanceMail = async (studentEmail, studentName, percentage, branchName) => {
  try {
    await transporter.sendMail({
      from: `"BARABARI Attendance" <${process.env.EMAIL_USER}>`,
      to: studentEmail,
      subject: "⚠ Low Attendance Warning",
      html: `
        <h2>Hello ${studentName}</h2>

        <p>Your attendance in <b>${branchName}</b> is currently:</p>
        <h1 style="color:red">${percentage}%</h1>

        <p>Please attend upcoming classes regularly.</p>

        <p>
        If attendance falls below required level, you may not be eligible
        for certification.
        </p>

        <br/>
        <p>— BARABARI Team</p>
      `
    });

    console.log("Mail sent to:", studentEmail);

  } catch (err) {
    console.log("Mail failed:", studentEmail, err.message);
  }
};
