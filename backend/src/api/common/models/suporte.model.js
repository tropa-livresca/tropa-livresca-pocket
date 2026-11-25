import nodemailer from "nodemailer";

const aguardar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export class SuporteModel {
  static async dispararEmail(dadosMail) {
    let transporter;

    try {
      const tempoMinimo = Math.max(
        0,
        Number.parseInt(process.env.SMTP_MIN_DELAY_MS || "5000", 10) || 0,
      );

      if (tempoMinimo > 0) {
        await aguardar(tempoMinimo);
      }

      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number.parseInt(process.env.SMTP_PORT || "465", 10),
        secure: Number.parseInt(process.env.SMTP_PORT || "465", 10) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        family: 4,

        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 10000,
      });

      // Verifica a disponibilidade do servidor SMTP.
      await transporter.verify();

      // Envia o e-mail.
      return await transporter.sendMail(dadosMail);
    } catch (error) {
      const erroConexao = [
        "ECONNECTION",
        "ECONNREFUSED",
        "ECONNRESET",
        "ETIMEDOUT",
        "ESOCKET",
        "EDNS",
      ].includes(error.code);

      if (erroConexao) {
        error.message =
          "Serviço de e-mail indisponível. Verifique sua conexão com a internet.";
        error.statusCode = 503;
      } else {
        error.statusCode = error.statusCode || 500;
      }

      throw error;
    } finally {
      transporter?.close();
    }
  }
}
