import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { JwtGuard } from "src/auth/guard";
import { GetUser } from "src/auth/decorator";

@Controller("payment")
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async paymentInit(@Body() payment: { amount: number }) {
    return await this.paymentService.generateTestUrl({
      Amount: payment.amount,
    });
  }

  @UseGuards(JwtGuard)
  @Post("enot")
  createPaymentEnot(@Body() dto: any, @GetUser("id") userId: number) {
    return this.paymentService.createPaymentEnot(
      dto.amount,
      dto.system,
      dto.type,
      dto.aim,
      userId,
      dto.current
    );
  }
}
