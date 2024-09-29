import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from "argon2";
import { JwtService } from "@nestjs/jwt";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { ForbiddenException } from "@nestjs/common/exceptions";
import { ConfigService } from "@nestjs/config";
import { generatePassword } from "./helpers/generatePassword";
import { sendMail } from "./helpers/mail";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService
  ) {}

  async signup(dto: AuthDto) {
    const password = dto.password ? dto.password : generatePassword();
    const hash = await argon.hash(password);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });

      if (!dto.password) await sendMail(password, dto.email);

      console.log(password);

      return this.signToken(user.id, user.email, user);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === "P2002")
          throw new ForbiddenException("Credentials taken");
      }
    }
  }

  async signin(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) throw new ForbiddenException("Credentials incorrect");

    const pwMatches = await argon.verify(user.hash, dto.password);

    if (!pwMatches) throw new ForbiddenException("Credentials incorrect");

    return this.signToken(user.id, user.email, user);
  }

  async signToken(
    userId: number,
    email: string,
    user: any
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };

    const secret = this.config.get<string>("JWT_SECRET");
    const token = await this.jwt.signAsync(payload, {
      expiresIn: "24h",
      secret,
    });

    return {
      access_token: token,
      ...user,
    };
  }
}
