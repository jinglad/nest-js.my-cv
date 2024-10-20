import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { scrypt as _scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {}

  async signup(email: string, password: string) {
    const users = await this.userService.find(email);
    if (users.length) {
      throw new BadRequestException("Email in use");
    }

    // hash the password
    // Generate a salt
    const salt = randomBytes(8).toString("hex");
    // Hash the salt and the password together
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    // Join the hashed password and the salt together
    const result = salt + "." + hash.toString("hex");

    // Create a new user and save it
    const user = await this.userService.create(email, result);

    // Return the user
    return user;
  }

  async signin(email: string, password: string) {
    const users = await this.userService.find(email);
    if (!users.length) {
      throw new NotFoundException("User not found");
    }
    const user = users[0];
    const [salt, storedHash] = user.password.split(".");
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    if (storedHash !== hash.toString("hex")) {
      throw new BadRequestException("Invalid password");
    }
    return user;
  }
}
