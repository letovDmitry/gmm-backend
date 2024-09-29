import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService, private config: ConfigService) {}

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
