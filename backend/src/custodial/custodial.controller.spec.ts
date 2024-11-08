import { Test } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import * as jwt from 'jsonwebtoken';

// Helper function to generate jwt token with the given payload
const generateJwtToken = (payload: any): string => {
  return jwt.sign(payload, process.env.DYNAMIC_PRIVATE_KEY, {
    algorithm: 'RS256',
  });
};

describe('CustodialController', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    prismaService = app.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    // Cleanup database after each test
    await prismaService.custodialWallet.deleteMany();
    await prismaService.user.deleteMany();
  });

  it('should return 401 Unauthorized error if accessToken is missing', async () => {
    const res = await request(app.getHttpServer())
      .get(`/custodial/wallets`)
      .expect(401);

    expect(res.body).toMatchInlineSnapshot(`
{
  "message": "Unauthorized",
  "statusCode": 401,
}
`);
  });

  it('should return empty array if user has no custodial wallets', async () => {
    // Prep: generate a token that resolves to a user with no custodial wallets
    const token = generateJwtToken({
      sub: 'user-with-no-custodial-wallets',
    });

    const res = await request(app.getHttpServer())
      .get(`/custodial/wallets`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toMatchInlineSnapshot(`[]`);
  });

  it('should return list of wallets if user has custodial wallets by ascending creation order', async () => {
    // Prep: generate a token that resolves to a user with no custodial wallets
    const token = generateJwtToken({
      sub: 'user-with-custodial-wallets',
    });

    // Prep: create user with 2 custodial wallets
    await prismaService.user.create({
      data: {
        dynamicUserId: 'user-with-custodial-wallets',
        custodialWallets: {
          create: [
            {
              address: '0x123',
              nickName: 'Account 1',
              privateKey: 'test_private_key_1',
              privateKeyVI: 'test_string_iv_1',
              publicKey: 'test_public_key_1',
              createdAt: new Date('2024-11-08T00:00:00.000Z'),
            },
            {
              address: '0x456',
              privateKey: 'test_private_key_2',
              privateKeyVI: 'test_string_iv_2',
              publicKey: 'test_public_key_2',
              createdAt: new Date('2024-11-07T00:00:00.000Z'),
            },
          ],
        },
      },
    });

    const res = await request(app.getHttpServer())
      .get(`/custodial/wallets`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toMatchInlineSnapshot(`
[
  {
    "address": "0x456",
    "createdAt": "2024-11-07T00:00:00.000Z",
    "nickName": null,
    "publicKey": "test_public_key_2",
  },
  {
    "address": "0x123",
    "createdAt": "2024-11-08T00:00:00.000Z",
    "nickName": "Account 1",
    "publicKey": "test_public_key_1",
  },
]
`);
  });
});
