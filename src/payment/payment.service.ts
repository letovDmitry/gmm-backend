import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { PrismaService } from "src/prisma/prisma.service";
import { randomInt } from "crypto";

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService, private config: ConfigService) {}

  testUrl = process.env.TINKOFF_TEST_URL;
  prodUrl = process.env.TINKOFF_API_URL;

  async generateUrl(payment: any) {}

  async generateTestUrl(payment: any) {
    this.setSuccessUrl(payment);
    this.setFailUrL(payment);
    this.setEnvParams(payment);
    payment["Description"] = "Пополнение счета";
    payment["OrderId"] = randomInt(50000).toString();

    // payment['NotificationURL'] = "http://localhost:8000/api/tinkoff/callback"
    const res = await axios.post(`${this.prodUrl}/v2/Init`, payment);
    console.log(res);
    return res.data.PaymentURL;
  }

  async setSuccessUrl(payment: any) {
    payment["SuccessURL"] = "https://teamproject.site/success";
  }

  async setEnvParams(payment: any) {
    payment["TerminalKey"] = process.env.TINKOFF_TERMINAL;
    payment["Token"] = process.env.TINKOFF_SECRET_KEY;
  }

  async setFailUrL(payment: any) {
    payment["FailURL"] = "https://teamproject.site/fail";
  }

  async createPaymentEnot(
    amount: number,
    system: string,
    type: string,
    aim: string,
    userId: number,
    current: string
  ) {
    const data = await axios.post(
      "https://api.enot.io/invoice/create",
      {
        amount: amount,
        order_id: "1",
        email: "test.test@example.com",
        currency: "RUB",
        custom_fields: `{"system": "${system}", "type": "${type}", "aim": "${aim}", "userid": "${userId}", "current": "${current}"}`,
        shop_id: this.config.get<string>("SHOP_ID"),
      },
      {
        headers: {
          "x-api-key": this.config.get<string>("X_API_KEY"),
        },
      }
    );

    return { url: data.data.url };
  }
}
