import { Test } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UsersService } from "./users.service";
import { User } from "./user.entity";
import { BadRequestException, NotFoundException } from "@nestjs/common";

describe("AuthService", () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    fakeUsersService = {
      find: () => Promise.resolve([]),
      create: (email: string, password: string) =>
        Promise.resolve({ id: 1, email, password } as User),
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: fakeUsersService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it("can create an instance of auth service", async () => {
    expect(service).toBeDefined();
  });

  it("create a new user with a salted and hashed password", async () => {
    const user = await service.signup("asdf@asdf.com", "asdf");
    expect(user.password).not.toEqual("asdf");
    const [salt, hash] = user.password.split(".");
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it("throws an error if the email is in use", async () => {
    fakeUsersService.find = () =>
      Promise.resolve([{ id: 1, email: "a", password: "b" } as User]); // fake user already exists
    await expect(service.signup("a", "b")).rejects.toThrow(BadRequestException);
  });

  it("throws an error if user signs up with email that is in use", async () => {
    await service.signup("asdf@asdf.com", "asdf");
  });

  it("throws if signin is called with an unused email", async () => {
    await expect(service.signin("asdf@asdf.com", "asdf")).rejects.toThrow(
      NotFoundException,
    );
  });

  it("throws if an invalid password is provided", async () => {
    fakeUsersService.find = () =>
      Promise.resolve([{ email: "a", password: "b" } as User]);
    await expect(service.signin("a", "notHashedPass")).rejects.toThrow(
      BadRequestException,
    );
  });

  it("returns a user if correct password is provided", async () => {
    fakeUsersService.find = () =>
      Promise.resolve([{ email: "a", password: "b" } as User]);
    const user = await service.signin("a", "b");
    expect(user).toBeDefined();
  });
});
